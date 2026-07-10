'use strict';

/**
 * funnelCheckoutService.js — Funnel Checkout Service
 *
 *   funnelCheckoutController  →  funnelCheckoutService  →  orderService
 *
 * This is the ONLY place that decides "what does a funnel checkout step
 * actually do when submitted." The controller stays thin (params in,
 * this service's result out); orderService stays the single place that
 * knows how to price/validate/persist a StoreOrder. Nothing here re-
 * implements inventory checks, discount resolution, tax, shipping,
 * customer rollups, or notifications — those are 100% delegated to the
 * existing Store services orderService already orchestrates.
 *
 * This file is also the designated home for every checkout-time funnel
 * feature that doesn't belong in orderService (because orderService must
 * stay generic to the whole Store, not funnel-specific):
 *   - Offers (implemented here — see resolveCheckoutPricing below)
 *   - Upsells / one-click post-purchase offers (future)
 *   - Coupons beyond the generic StoreDiscount code flow (future)
 *   - Split testing / step variants (future)
 *   - Dynamic pricing rules (future)
 * Any of those should be added as another resolution step in this
 * service, still ending in a single orderService.createOrder(...) call —
 * never a second, parallel order-creation path.
 */

const mongoose = require('mongoose');
const Funnel = require('../models/Funnel');
const FunnelStep = require('../models/FunnelStep');
const orderService = require('./store/orderService');
const funnelOfferService = require('./funnelOfferService');
const { emitFunnelEvent } = require('./funnelEvents');
const { notFoundError, badRequestError } = require('./funnelServiceErrors');

/**
 * Resolves what a checkout step should charge: the live StoreProduct price,
 * or its FunnelOffer's displayPrice when one is set — reusing
 * funnelOfferService.resolveOfferedProduct so "what does this step show"
 * and "what does this step charge" can never drift apart (one merge
 * function, not two). Store's own product price is never modified by any
 * of this — only what's read here.
 */
async function resolveCheckoutPricing(step) {
  const resolved = await funnelOfferService.getOfferedProductForStep(step);
  if (!resolved) {
    throw notFoundError('This checkout step has no product configured.');
  }
  return resolved;
}

/**
 * Handles a checkout submission for a funnel step.
 *
 * body: { quantity?, customer?: {name, email}, customerId?, discountCode?,
 *         paymentMethod?, shippingAmount? }
 */
async function checkout(funnelId, stepId, body = {}) {
  if (!mongoose.Types.ObjectId.isValid(funnelId) || !mongoose.Types.ObjectId.isValid(stepId)) {
    throw badRequestError('Invalid funnel or step id.');
  }

  const funnel = await Funnel.findOne({ _id: funnelId, isDeleted: false }).lean();
  if (!funnel) throw notFoundError('Funnel not found.');

  const step = await FunnelStep.findOne({ _id: stepId, funnelId, isDeleted: false }).lean();
  if (!step) throw notFoundError('Funnel step not found.');

  if (step.type !== 'checkout') {
    throw badRequestError('This step is not a checkout step.');
  }
  if (!step.settings?.storeId || !step.settings?.productId) {
    throw badRequestError('This checkout step has no store/product configured.');
  }

  // Single source of "what does this show/charge" — see resolveCheckoutPricing.
  const offeredProduct = await resolveCheckoutPricing(step);

  const quantity = Math.max(parseInt(body.quantity, 10) || 1, 1);

  // orderService still re-validates availability/status itself
  // (inventoryService.checkAvailability) — this call is never trusted as
  // the only stock check, it's just what determines what to charge.
  const order = await orderService.createOrder(String(step.settings.storeId), {
    items: [{ productId: step.settings.productId, quantity }],
    priceOverrides: { [String(step.settings.productId)]: offeredProduct.price },
    customer: body.customer,
    customerId: body.customerId,
    discountCode: body.discountCode,
    paymentMethod: body.paymentMethod,
    shippingAmount: body.shippingAmount,
    // Funnel attribution — see orderService.createOrder / StoreOrder schema.
    funnelId,
    stepId,
    funnelSource: 'funnel_checkout',
  });

  // Integration hook — see funnelEvents.js. Fires alongside
  // emitStoreEvent(storeId, 'order.created', ...) inside orderService, so a
  // future CRM/Automation/Email/Webhook subscriber hears about funnel
  // purchases the same way it hears about new leads (contact.created,
  // above in funnelContactController), without this service or
  // orderService needing to know that subscriber exists.
  emitFunnelEvent(funnelId, 'order.created', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    stepId,
    total: order.total,
  });

  return {
    order,
    // Lets the controller/public renderer advance the funnel without a
    // second lookup — reuses the same settings fields Phase 1 established.
    nextStepId: step.settings?.nextStepId || null,
    redirectUrl: step.settings?.redirectUrl || '',
  };
}

module.exports = { checkout, resolveCheckoutPricing };
