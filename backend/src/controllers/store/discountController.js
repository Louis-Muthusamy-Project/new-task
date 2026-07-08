'use strict';

/**
 * discountController.js — Discounts Module (admin CRUD)
 *
 * Thin HTTP layer over Store Engine's Discount Service. All business logic
 * (type/value rules, coupon-code uniqueness) lives in
 * services/store/discountService.js.
 */

const mongoose = require('mongoose');
const { discountService } = require('../../services/store');

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

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/discounts
// ─────────────────────────────────────────────────────────────────────────
exports.listDiscounts = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const discounts = await discountService.listDiscounts(storeId, req.query);
  res.status(200).json({ success: true, data: discounts });
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/discounts/:id
// ─────────────────────────────────────────────────────────────────────────
exports.getDiscount = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const discount = await discountService.getDiscount(storeId, id);
  res.status(200).json({ success: true, data: discount });
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/store/:storeId/admin/discounts
// ─────────────────────────────────────────────────────────────────────────
exports.createDiscount = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const discount = await discountService.createDiscount(storeId, req.body);
  res.status(201).json({ success: true, data: discount });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/discounts/:id
// ─────────────────────────────────────────────────────────────────────────
exports.updateDiscount = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const discount = await discountService.updateDiscount(storeId, id, req.body);
  res.status(200).json({ success: true, data: discount });
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/store/:storeId/admin/discounts/:id
// ─────────────────────────────────────────────────────────────────────────
exports.deleteDiscount = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const discount = await discountService.deleteDiscount(storeId, id);
  res.status(200).json({ success: true, data: { id: discount._id, deleted: true } });
};