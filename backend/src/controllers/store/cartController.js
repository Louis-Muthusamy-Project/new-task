'use strict';

/**
 * cartController.js — Cart Module (public storefront)
 *
 * Every route here is unauthenticated in the sense that a guest can use
 * it freely (same trust level as storeStorefrontController.js), but each
 * resolves a cart *identity* first — either the `x-guest-token` header
 * or a decoded customer JWT from `Authorization: Bearer` — and every
 * mutation is delegated straight to CartService. This controller only
 * resolves identity and shapes the response; it owns no business rules
 * itself.
 */

const mongoose = require('mongoose');
const { cartService, customerAuthService } = require('../../services/store');

const badRequestError = (message) => {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
};

const requireValidId = (id, label = 'id') => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw badRequestError(`Invalid ${label}.`);
};

/**
 * Resolves the cart identity for this request: a signed-in customer
 * (Authorization header, verified + scoped to this storeId) takes
 * priority over a guest token, matching "once logged in, act as the
 * logged-in cart." Falls back to guestToken so an anonymous shopper can
 * still use the cart at all.
 */
function resolveIdentity(req) {
  const { storeId } = req.params;
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme === 'Bearer' && token) {
    const decoded = customerAuthService.verifyToken(token, storeId);
    if (decoded) return { customerId: decoded.customerId };
  }

  const guestToken = req.headers['x-guest-token'] || req.query.guestToken || req.body?.guestToken;
  if (!guestToken) {
    throw badRequestError(
      'A guest token (X-Guest-Token header) or a signed-in session is required.'
    );
  }
  return { guestToken: String(guestToken) };
}

async function respondWithCart(req, res, status = 200) {
  const { storeId } = req.params;
  const identity = resolveIdentity(req);
  const cart = await cartService.getOrCreateCart(storeId, identity);
  const view = await cartService.getCartView(storeId, cart);
  res.status(status).json({ success: true, data: view });
}

// GET /api/store/:storeId/cart
exports.getCart = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  await respondWithCart(req, res);
};

// POST /api/store/:storeId/cart/items  { productId, quantity }
exports.addItem = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const identity = resolveIdentity(req);
  const { productId, quantity } = req.body || {};
  const cart = await cartService.addItem(req.params.storeId, identity, productId, quantity);
  const view = await cartService.getCartView(req.params.storeId, cart);
  res.status(201).json({ success: true, data: view });
};

// PATCH /api/store/:storeId/cart/items/:productId  { quantity }
exports.updateItem = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const identity = resolveIdentity(req);
  const cart = await cartService.updateItemQuantity(
    req.params.storeId,
    identity,
    req.params.productId,
    req.body?.quantity
  );
  const view = await cartService.getCartView(req.params.storeId, cart);
  res.status(200).json({ success: true, data: view });
};

// DELETE /api/store/:storeId/cart/items/:productId
exports.removeItem = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const identity = resolveIdentity(req);
  const cart = await cartService.removeItem(req.params.storeId, identity, req.params.productId);
  const view = await cartService.getCartView(req.params.storeId, cart);
  res.status(200).json({ success: true, data: view });
};

// DELETE /api/store/:storeId/cart
exports.clearCart = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const identity = resolveIdentity(req);
  const cart = await cartService.clearCart(req.params.storeId, identity);
  const view = await cartService.getCartView(req.params.storeId, cart);
  res.status(200).json({ success: true, data: view });
};

// POST /api/store/:storeId/cart/discount  { code }
exports.applyDiscount = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const identity = resolveIdentity(req);
  const cart = await cartService.setDiscountCode(req.params.storeId, identity, req.body?.code);
  const view = await cartService.getCartView(req.params.storeId, cart);
  if (view.discount && view.discount.valid === false) {
    return res.status(400).json({ success: false, error: view.discount.reason, data: view });
  }
  res.status(200).json({ success: true, data: view });
};

// DELETE /api/store/:storeId/cart/discount
exports.removeDiscount = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const identity = resolveIdentity(req);
  const cart = await cartService.setDiscountCode(req.params.storeId, identity, '');
  const view = await cartService.getCartView(req.params.storeId, cart);
  res.status(200).json({ success: true, data: view });
};

// PATCH /api/store/:storeId/cart/contact  { email, shippingAddress }
exports.setContact = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const identity = resolveIdentity(req);
  const cart = await cartService.setContact(req.params.storeId, identity, req.body || {});
  const view = await cartService.getCartView(req.params.storeId, cart);
  res.status(200).json({ success: true, data: view });
};

// POST /api/store/:storeId/cart/shipping  { zoneId, rateName, price }
exports.setShipping = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const identity = resolveIdentity(req);
  const cart = await cartService.setShippingChoice(req.params.storeId, identity, req.body || {});
  const view = await cartService.getCartView(req.params.storeId, cart);
  res.status(200).json({ success: true, data: view });
};

// POST /api/store/:storeId/cart/payment-method  { method }
exports.setPaymentMethod = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const identity = resolveIdentity(req);
  const cart = await cartService.setPaymentMethod(req.params.storeId, identity, req.body?.method);
  const view = await cartService.getCartView(req.params.storeId, cart);
  res.status(200).json({ success: true, data: view });
};

// POST /api/store/:storeId/cart/merge  { guestToken }
// Called once, right after a successful login/register, with the
// customer identity resolved from the (now-present) Authorization
// header — this is the "merge carts after login" step.
exports.mergeCart = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const identity = resolveIdentity(req);
  if (!identity.customerId) {
    throw badRequestError('Merging a cart requires a signed-in session.');
  }
  const cart = await cartService.mergeGuestIntoCustomer(
    req.params.storeId,
    req.body?.guestToken,
    identity.customerId
  );
  const view = await cartService.getCartView(req.params.storeId, cart);
  res.status(200).json({ success: true, data: view });
};

exports.resolveIdentity = resolveIdentity;
