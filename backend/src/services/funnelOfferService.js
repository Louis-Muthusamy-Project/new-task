'use strict';

/**
 * funnelOfferService.js — Funnel Offer resolution
 *
 * The single place that understands "what should a checkout step show for
 * this product, given its offer (if any)." StoreProduct stays the source
 * of truth for the real price/stock/title; a FunnelOffer only overrides
 * what's *displayed*. Nothing else — controller, frontend, or a future
 * FunnelCheckoutService — should re-implement this merge; they call
 * resolveOfferedProduct() instead.
 *
 * This module never writes to StoreProduct and never decrements stock —
 * inventory reads go through inventoryService, exactly like the rest of
 * the Store engine.
 */

const mongoose = require('mongoose');
const StoreProduct = require('../models/store/StoreProduct');
const FunnelOffer = require('../models/FunnelOffer');
const inventoryService = require('../services/store/inventoryService');
const { badRequestError, notFoundError } = require('./funnelServiceErrors');

/**
 * Merges a live StoreProduct with an (optional) FunnelOffer into what the
 * checkout step should display. Offer fields only apply when set —
 * null/empty means "inherit from the product."
 */
function resolveOfferedProduct(product, offer) {
  if (!product) return null;

  const resolved = {
    productId: product._id,
    title: product.title,
    images: product.images || [],
    currency: product.currency || 'USD',
    price: product.price || 0,
    compareAtPrice: product.compareAtPrice ?? null,
    headline: product.title,
    description: product.description || '',
    badgeText: '',
    countdown: { enabled: false, endsAt: null },
    inStock: inventoryService.isInStock(product),
    offerId: null,
  };

  if (!offer || offer.isDeleted || !offer.isActive) {
    return resolved;
  }

  resolved.offerId = offer._id;
  if (offer.headline) resolved.headline = offer.headline;
  if (offer.description) resolved.description = offer.description;
  if (offer.displayPrice != null) resolved.price = offer.displayPrice;
  if (offer.compareAtPrice != null) resolved.compareAtPrice = offer.compareAtPrice;
  if (offer.badgeText) resolved.badgeText = offer.badgeText;
  if (offer.countdown?.enabled) {
    resolved.countdown = { enabled: true, endsAt: offer.countdown.endsAt };
  }

  return resolved;
}

/**
 * Loads the product + offer for a checkout step and returns the merged,
 * display-ready result. Used by the Step Settings preview and (later) by
 * FunnelCheckoutService/public renderer.
 */
async function getOfferedProductForStep(step) {
  const productId = step?.settings?.productId;
  const storeId = step?.settings?.storeId;
  if (!productId || !storeId) return null;

  const product = await StoreProduct.findOne({
    _id: productId,
    storeId,
    isDeleted: false,
  }).lean();
  if (!product) return null;

  const offer = step.settings.offerId
    ? await FunnelOffer.findOne({ _id: step.settings.offerId, isDeleted: false }).lean()
    : null;

  return resolveOfferedProduct(product, offer);
}

/**
 * Creates or updates the single offer for a checkout step (1:1). Validates
 * that the referenced product actually belongs to the given store — same
 * "never trust a client-supplied reference blindly" posture as the rest
 * of the Store engine.
 */
async function upsertOfferForStep(funnelId, stepId, body) {
  const { storeId, productId } = body || {};
  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    throw badRequestError('A valid storeId is required.');
  }
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    throw badRequestError('A valid productId is required.');
  }

  const product = await StoreProduct.findOne({ _id: productId, storeId, isDeleted: false }).lean();
  if (!product) {
    throw notFoundError('Product not found in the selected store.');
  }

  const update = {
    funnelId,
    stepId,
    storeId,
    productId,
    headline: body.headline || '',
    description: body.description || '',
    displayPrice: body.displayPrice != null && body.displayPrice !== '' ? Number(body.displayPrice) : null,
    compareAtPrice: body.compareAtPrice != null && body.compareAtPrice !== '' ? Number(body.compareAtPrice) : null,
    badgeText: body.badgeText || '',
    countdown: {
      enabled: !!body.countdown?.enabled,
      endsAt: body.countdown?.endsAt || null,
    },
    isActive: body.isActive !== undefined ? !!body.isActive : true,
    isDeleted: false,
  };

  const offer = await FunnelOffer.findOneAndUpdate(
    { stepId },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return offer;
}

async function getOfferByStep(stepId) {
  return FunnelOffer.findOne({ stepId, isDeleted: false });
}

async function deleteOfferByStep(stepId) {
  const offer = await FunnelOffer.findOneAndUpdate(
    { stepId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  return offer;
}

/**
 * Clones a step's offer onto a newly-duplicated step (used by
 * funnelDuplicateService). Returns the new offer's id, or null if the
 * source step had none — the caller sets that onto the new step's
 * settings.offerId.
 */
async function cloneOfferForStep(sourceStepId, newFunnelId, newStepId) {
  const source = await FunnelOffer.findOne({ stepId: sourceStepId, isDeleted: false }).lean();
  if (!source) return null;

  const { _id, __v, createdAt, updatedAt, ...rest } = source;
  const cloned = await FunnelOffer.create({
    ...rest,
    funnelId: newFunnelId,
    stepId: newStepId,
  });
  return cloned._id;
}

module.exports = {
  resolveOfferedProduct,
  getOfferedProductForStep,
  upsertOfferForStep,
  getOfferByStep,
  deleteOfferByStep,
  cloneOfferForStep,
};
