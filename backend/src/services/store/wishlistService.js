'use strict';

/**
 * wishlistService.js — Wishlist Service
 *
 * The backend counterpart of the (formerly client-only) wishlist block.
 * Built as a direct mirror of cartService.js — same identity contract,
 * same "re-read live product data at view time" rule, same merge-on-
 * login behavior — because a wishlist is, structurally, a cart that
 * never checks out: a persisted set of product ids, owned by exactly one
 * of { guestToken } | { customerId }.
 *
 * Nothing here touches inventory, pricing, or orders — a wishlist is a
 * pure "save for later" list. Add-to-cart from a wishlist item is just a
 * normal cartService.addItem call from the frontend; this service is not
 * on that path and never duplicates it.
 */

const mongoose = require('mongoose');
const StoreWishlist = require('../../models/store/StoreWishlist');
const StoreProduct = require('../../models/store/StoreProduct');
const { badRequestError } = require('./errors');
const inventoryService = require('./inventoryService');

function requireValidId(id, label = 'id') {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw badRequestError(`Invalid ${label}.`);
  }
}

/** Same { guestToken } | { customerId } contract as cartService's identityQuery. */
function identityQuery(identity = {}) {
  const { guestToken, customerId } = identity;
  if (customerId) {
    requireValidId(customerId, 'customerId');
    return { customerId, guestToken: null };
  }
  if (guestToken && String(guestToken).trim()) {
    return { guestToken: String(guestToken).trim(), customerId: null };
  }
  throw badRequestError('A guest token or a signed-in session is required to use the wishlist.');
}

async function getOrCreateWishlist(storeId, identity) {
  requireValidId(storeId, 'storeId');
  const query = identityQuery(identity);

  let wishlist = await StoreWishlist.findOne({ storeId, ...query, isDeleted: false });
  if (wishlist) return wishlist;

  try {
    wishlist = await StoreWishlist.create({ storeId, ...query });
  } catch (err) {
    if (err?.code === 11000) {
      wishlist = await StoreWishlist.findOne({ storeId, ...query, isDeleted: false });
    } else {
      throw err;
    }
  }
  return wishlist;
}

async function toggleItem(storeId, identity, productId) {
  requireValidId(productId, 'productId');
  const wishlist = await getOrCreateWishlist(storeId, identity);
  const idx = wishlist.productIds.findIndex((id) => String(id) === String(productId));
  if (idx === -1) {
    wishlist.productIds.push(productId);
  } else {
    wishlist.productIds.splice(idx, 1);
  }
  await wishlist.save();
  return wishlist;
}

async function addItem(storeId, identity, productId) {
  requireValidId(productId, 'productId');
  const wishlist = await getOrCreateWishlist(storeId, identity);
  if (!wishlist.productIds.some((id) => String(id) === String(productId))) {
    wishlist.productIds.push(productId);
    await wishlist.save();
  }
  return wishlist;
}

async function removeItem(storeId, identity, productId) {
  requireValidId(productId, 'productId');
  const wishlist = await getOrCreateWishlist(storeId, identity);
  wishlist.productIds = wishlist.productIds.filter((id) => String(id) !== String(productId));
  await wishlist.save();
  return wishlist;
}

async function clearWishlist(storeId, identity) {
  const wishlist = await getOrCreateWishlist(storeId, identity);
  wishlist.productIds = [];
  await wishlist.save();
  return wishlist;
}

/**
 * Re-reads every saved product live from StoreProduct (never a frozen
 * snapshot), the same "getCartView" contract cartService follows — a
 * price change, sellout, or archive shows up in an already-saved
 * wishlist immediately instead of only on the next add.
 */
async function getWishlistView(storeId, wishlist) {
  const productIds = wishlist.productIds || [];
  const products = productIds.length
    ? await StoreProduct.find({ _id: { $in: productIds }, storeId, isDeleted: false })
    : [];
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const items = productIds
    .map((id) => productMap.get(String(id)))
    .filter(Boolean)
    .map((product) => ({
      productId: product._id,
      title: product.title,
      price: product.price,
      currency: product.currency || 'USD',
      image: (product.images && product.images[0]) || '',
      slug: product.slug,
      available: product.status === 'Active',
      inStock: inventoryService.isInStock(product),
    }));

  return {
    id: wishlist._id,
    ids: productIds.map((id) => String(id)),
    items,
    itemCount: items.length,
  };
}

/**
 * Folds a guest wishlist's product ids into the target customer's
 * wishlist on login — mirrors cartService.mergeGuestIntoCustomer exactly
 * (dedupes ids, deletes the guest document, no-op when there's nothing
 * to merge) so "save something, then sign in" behaves the same way
 * "add to cart, then sign in" already does.
 */
async function mergeGuestIntoCustomer(storeId, guestToken, customerId) {
  requireValidId(storeId, 'storeId');
  requireValidId(customerId, 'customerId');
  if (!guestToken) return getOrCreateWishlist(storeId, { customerId });

  const guestWishlist = await StoreWishlist.findOne({ storeId, guestToken, isDeleted: false });
  const customerWishlist = await getOrCreateWishlist(storeId, { customerId });

  if (!guestWishlist || guestWishlist.productIds.length === 0) {
    if (guestWishlist) await StoreWishlist.deleteOne({ _id: guestWishlist._id });
    return customerWishlist;
  }

  const existing = new Set(customerWishlist.productIds.map((id) => String(id)));
  for (const productId of guestWishlist.productIds) {
    if (!existing.has(String(productId))) {
      customerWishlist.productIds.push(productId);
      existing.add(String(productId));
    }
  }

  await customerWishlist.save();
  await StoreWishlist.deleteOne({ _id: guestWishlist._id });
  return customerWishlist;
}

module.exports = {
  getOrCreateWishlist,
  toggleItem,
  addItem,
  removeItem,
  clearWishlist,
  getWishlistView,
  mergeGuestIntoCustomer,
};
