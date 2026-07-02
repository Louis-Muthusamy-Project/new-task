'use strict';

/**
 * discountController.js — Discounts Module (admin CRUD)
 *
 * Store-module counterpart of productController.js / customerController.js.
 * Handles the merchant-facing Create / Edit / Delete flows for
 * StoreDiscount documents (Coupon code, Percentage/Flat amount, Expiry,
 * Minimum Order) used by the Discounts tab in StoresTab.jsx.
 */

const mongoose = require('mongoose');
const StoreDiscount = require('../models/store/StoreDiscount');
const Store = require('../models/store/Store');

const notFoundError = (message) => {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
};

const badRequestError = (message) => {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
};

const requireValidId = (id, label = 'id') => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw badRequestError(`Invalid ${label}.`);
  }
};

const DISCOUNT_TYPES = ['Percentage', 'Flat', 'FreeShipping'];

const ALLOWED_FIELDS = ['code', 'type', 'value', 'minOrderAmount', 'endsAt', 'startsAt', 'isActive'];

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

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/discounts
// Query: search (matches code)
// ─────────────────────────────────────────────────────────────────────────
exports.listDiscounts = async (req, res) => {
  const { storeId } = req.params;
  const { search } = req.query;
  requireValidId(storeId, 'storeId');

  const query = { storeId, isDeleted: false };
  if (search) query.code = { $regex: search, $options: 'i' };

  const discounts = await StoreDiscount.find(query).sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, data: discounts });
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/discounts/:id
// ─────────────────────────────────────────────────────────────────────────
exports.getDiscount = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const discount = await StoreDiscount.findOne({ _id: id, storeId, isDeleted: false }).lean();
  if (!discount) throw notFoundError('Discount not found.');

  res.status(200).json({ success: true, data: discount });
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/store/:storeId/admin/discounts
// Body: { code, type, value, minOrderAmount, endsAt, startsAt, isActive }
// ─────────────────────────────────────────────────────────────────────────
exports.createDiscount = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const store = await Store.findOne({ _id: storeId, isDeleted: false }).lean();
  if (!store) throw notFoundError('Store not found.');

  const { code } = req.body || {};
  if (!code?.trim()) {
    throw badRequestError('Coupon code is required.');
  }

  const updates = normalizePayload(req.body);

  if (updates.type && !DISCOUNT_TYPES.includes(updates.type)) {
    throw badRequestError(`Invalid type. Must be one of: ${DISCOUNT_TYPES.join(', ')}.`);
  }
  if (updates.type === 'Percentage' && updates.value > 100) {
    throw badRequestError('Percentage value cannot exceed 100.');
  }

  const existing = await StoreDiscount.findOne({ storeId, code: updates.code, isDeleted: false }).lean();
  if (existing) throw badRequestError('A discount with this coupon code already exists.');

  const discount = await StoreDiscount.create({
    storeId,
    isActive: true,
    ...updates,
  });

  res.status(201).json({ success: true, data: discount });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/discounts/:id
// ─────────────────────────────────────────────────────────────────────────
exports.updateDiscount = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const discount = await StoreDiscount.findOne({ _id: id, storeId, isDeleted: false });
  if (!discount) throw notFoundError('Discount not found.');

  const updates = normalizePayload(req.body);

  if (updates.type && !DISCOUNT_TYPES.includes(updates.type)) {
    throw badRequestError(`Invalid type. Must be one of: ${DISCOUNT_TYPES.join(', ')}.`);
  }
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

  res.status(200).json({ success: true, data: discount });
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/store/:storeId/admin/discounts/:id
// Soft delete, matching Product/Customer's isDeleted flag convention.
// ─────────────────────────────────────────────────────────────────────────
exports.deleteDiscount = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const discount = await StoreDiscount.findOneAndUpdate(
    { _id: id, storeId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!discount) throw notFoundError('Discount not found.');

  res.status(200).json({ success: true, data: { id: discount._id, deleted: true } });
};
