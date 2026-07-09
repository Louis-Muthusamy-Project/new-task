'use strict';

/**
 * discountService.js — Discount Service
 *
 * Owns every business rule around StoreDiscount: field normalization,
 * coupon-code validation/uniqueness, and the Percentage/Flat/FreeShipping
 * value rules. Also exposes `resolveForOrder`, the single place that
 * decides whether a coupon code is currently redeemable and how much it's
 * worth against a given subtotal — used by OrderService so checkout and
 * any future "apply discount" admin action agree on one set of rules.
 */

const StoreDiscount = require('../../models/store/StoreDiscount');
const Store = require('../../models/store/Store');
const { notFoundError, badRequestError } = require('./errors');
const { emitStoreEvent } = require('./storeEvents');

const DISCOUNT_TYPES = ['Percentage', 'Flat', 'FreeShipping'];

const ALLOWED_FIELDS = ['code', 'type', 'value', 'minOrderAmount', 'endsAt', 'startsAt', 'isActive'];

async function assertStoreExists(storeId) {
  const store = await Store.findOne({ _id: storeId, isDeleted: false }).lean();
  if (!store) throw notFoundError('Store not found.');
  return store;
}

function normalizePayload(body = {}) {
  const updates = {};
  for (const field of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      updates[field] = body[field];
    }
  }

  if (updates.code != null) updates.code = String(updates.code).trim().toUpperCase();
  if (updates.value != null) updates.value = Number(updates.value) || 0;
  if (updates.minOrderAmount != null) {
    updates.minOrderAmount = updates.minOrderAmount === '' ? 0 : Number(updates.minOrderAmount) || 0;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'endsAt')) {
    updates.endsAt = updates.endsAt ? new Date(updates.endsAt) : null;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'startsAt')) {
    updates.startsAt = updates.startsAt ? new Date(updates.startsAt) : null;
  }

  return updates;
}

function assertValidType(type, value) {
  if (type && !DISCOUNT_TYPES.includes(type)) {
    throw badRequestError(`Invalid type. Must be one of: ${DISCOUNT_TYPES.join(', ')}.`);
  }
  if (type === 'Percentage' && value > 100) {
    throw badRequestError('Percentage value cannot exceed 100.');
  }
}

async function listDiscounts(storeId, { search } = {}) {
  const query = { storeId, isDeleted: false };
  if (search) query.code = { $regex: search, $options: 'i' };
  return StoreDiscount.find(query).sort({ createdAt: -1 }).lean();
}

async function getDiscount(storeId, id) {
  const discount = await StoreDiscount.findOne({ _id: id, storeId, isDeleted: false }).lean();
  if (!discount) throw notFoundError('Discount not found.');
  return discount;
}

async function createDiscount(storeId, body) {
  await assertStoreExists(storeId);

  const { code } = body || {};
  if (!code?.trim()) {
    throw badRequestError('Coupon code is required.');
  }

  const updates = normalizePayload(body);
  assertValidType(updates.type, updates.value);

  const existing = await StoreDiscount.findOne({ storeId, code: updates.code, isDeleted: false }).lean();
  if (existing) throw badRequestError('A discount with this coupon code already exists.');

  const created = await StoreDiscount.create({
    storeId,
    isActive: true,
    ...updates,
  });

  // Storefront-visible effect: a new active coupon can immediately change
  // what a shopper's already-open cart/checkout would total if they apply
  // it. No public listing of discount codes exists (codes are never
  // browsable), so this mainly matters for CartContext re-validating a
  // code a shopper already typed in.
  emitStoreEvent(storeId, 'discount.created', { discountId: created._id, code: created.code });
  return created;
}

async function updateDiscount(storeId, id, body) {
  const discount = await StoreDiscount.findOne({ _id: id, storeId, isDeleted: false });
  if (!discount) throw notFoundError('Discount not found.');

  const updates = normalizePayload(body);
  assertValidType(updates.type, updates.value != null ? updates.value : discount.value);

  const nextType = updates.type || discount.type;
  const nextValue = updates.value != null ? updates.value : discount.value;
  if (nextType === 'Percentage' && nextValue > 100) {
    throw badRequestError('Percentage value cannot exceed 100.');
  }

  if (updates.code && updates.code !== discount.code) {
    const existing = await StoreDiscount.findOne({
      storeId,
      code: updates.code,
      isDeleted: false,
      _id: { $ne: id },
    }).lean();
    if (existing) throw badRequestError('A discount with this coupon code already exists.');
  }

  Object.assign(discount, updates);
  await discount.save();
  // Covers every admin edit that can change checkout math for a shopper
  // already holding this code applied: value, type, isActive (toggled
  // off), date window, minimum order amount.
  emitStoreEvent(storeId, 'discount.updated', {
    discountId: discount._id,
    code: discount.code,
    isActive: discount.isActive,
  });
  return discount;
}

async function deleteDiscount(storeId, id) {
  const discount = await StoreDiscount.findOneAndUpdate(
    { _id: id, storeId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!discount) throw notFoundError('Discount not found.');
  emitStoreEvent(storeId, 'discount.deleted', { discountId: discount._id, code: discount.code });
  return discount;
}

/**
 * Resolves a coupon code against a given subtotal — the single place that
 * decides eligibility (active, within date window, minimum order met,
 * usage limit not exceeded) and the resulting discount amount. Used by
 * OrderService.createOrder during checkout.
 */
async function resolveForOrder(storeId, code, subtotal) {
  if (!code) return null;

  const discount = await StoreDiscount.findOne({
    storeId,
    code: String(code).trim().toUpperCase(),
    isDeleted: false,
    isActive: true,
  });
  if (!discount) throw badRequestError('Invalid or inactive discount code.');

  const now = new Date();
  if (discount.startsAt && now < discount.startsAt) {
    throw badRequestError('This discount code is not active yet.');
  }
  if (discount.endsAt && now > discount.endsAt) {
    throw badRequestError('This discount code has expired.');
  }
  if (discount.usageLimit != null && discount.usedCount >= discount.usageLimit) {
    throw badRequestError('This discount code has reached its usage limit.');
  }
  if (subtotal < (discount.minOrderAmount || 0)) {
    throw badRequestError(`Order must be at least ${discount.minOrderAmount} to use this code.`);
  }

  let amount = 0;
  if (discount.type === 'Percentage') {
    amount = (subtotal * discount.value) / 100;
  } else if (discount.type === 'Flat') {
    amount = discount.value;
  }
  amount = Math.min(amount, subtotal);

  return { discountId: discount._id, amount, discount };
}

/**
 * Increments usedCount after a discount has actually been applied to a
 * created order — kept separate from resolveForOrder so read-only
 * "would this code work" checks never mutate usage counters.
 */
async function markUsed(discountId) {
  if (!discountId) return;
  await StoreDiscount.updateOne({ _id: discountId }, { $inc: { usedCount: 1 } });
}

module.exports = {
  listDiscounts,
  getDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  resolveForOrder,
  markUsed,
};