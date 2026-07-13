'use strict';

/**
 * wishlistController.js — Wishlist Module (public storefront)
 *
 * Direct mirror of cartController.js. Identity resolution (guest token
 * vs signed-in customer) is NOT re-implemented here — it's the exact
 * same rule a shopper's cart already uses, so this imports
 * cartController.resolveIdentity rather than duplicating it. Every
 * mutation is delegated straight to WishlistService; this controller
 * only resolves identity and shapes the response.
 */

const mongoose = require('mongoose');
const { wishlistService } = require('../../services/store');
const cartController = require('./cartController');

const badRequestError = (message) => {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
};

const requireValidId = (id, label = 'id') => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw badRequestError(`Invalid ${label}.`);
};

async function respondWithWishlist(req, res, status = 200) {
  const { storeId } = req.params;
  const identity = cartController.resolveIdentity(req);
  const wishlist = await wishlistService.getOrCreateWishlist(storeId, identity);
  const view = await wishlistService.getWishlistView(storeId, wishlist);
  res.status(status).json({ success: true, data: view });
}

// GET /api/store/:storeId/wishlist
exports.getWishlist = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  await respondWithWishlist(req, res);
};

// POST /api/store/:storeId/wishlist/items  { productId }
exports.addItem = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const identity = cartController.resolveIdentity(req);
  const wishlist = await wishlistService.addItem(req.params.storeId, identity, req.body?.productId);
  const view = await wishlistService.getWishlistView(req.params.storeId, wishlist);
  res.status(201).json({ success: true, data: view });
};

// POST /api/store/:storeId/wishlist/toggle  { productId }
exports.toggleItem = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const identity = cartController.resolveIdentity(req);
  const wishlist = await wishlistService.toggleItem(req.params.storeId, identity, req.body?.productId);
  const view = await wishlistService.getWishlistView(req.params.storeId, wishlist);
  res.status(200).json({ success: true, data: view });
};

// DELETE /api/store/:storeId/wishlist/items/:productId
exports.removeItem = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const identity = cartController.resolveIdentity(req);
  const wishlist = await wishlistService.removeItem(req.params.storeId, identity, req.params.productId);
  const view = await wishlistService.getWishlistView(req.params.storeId, wishlist);
  res.status(200).json({ success: true, data: view });
};

// DELETE /api/store/:storeId/wishlist
exports.clearWishlist = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const identity = cartController.resolveIdentity(req);
  const wishlist = await wishlistService.clearWishlist(req.params.storeId, identity);
  const view = await wishlistService.getWishlistView(req.params.storeId, wishlist);
  res.status(200).json({ success: true, data: view });
};

// POST /api/store/:storeId/wishlist/merge  { guestToken }
// Called once, right after login/register succeeds — folds a guest
// wishlist's saved products into the now-signed-in customer's wishlist.
// Same call site/timing as cartController.mergeCart.
exports.mergeWishlist = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const identity = cartController.resolveIdentity(req);
  if (!identity.customerId) {
    throw badRequestError('Merging a wishlist requires a signed-in session.');
  }
  const wishlist = await wishlistService.mergeGuestIntoCustomer(
    req.params.storeId,
    req.body?.guestToken,
    identity.customerId
  );
  const view = await wishlistService.getWishlistView(req.params.storeId, wishlist);
  res.status(200).json({ success: true, data: view });
};
