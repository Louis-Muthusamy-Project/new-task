'use strict';

/**
 * customerController.js — Customer Module (admin CRUD)
 *
 * Store-module counterpart of productController.js / collectionController.js.
 * Handles the merchant-facing Create / Edit / Delete flows for
 * StoreCustomer documents (contact details, addresses, tags). ordersCount
 * and totalSpent are read-only here — they're intended to be maintained by
 * the order pipeline (storeStorefrontController.createOrder), not edited
 * directly by a merchant.
 */

const mongoose = require('mongoose');
const StoreCustomer = require('../../models/store/StoreCustomer');
const Store = require('../../models/store/Store');

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'addresses', 'tags'];

function normalizePayload(body = {}) {
  const updates = {};
  for (const field of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      updates[field] = body[field];
    }
  }

  if (updates.email != null) updates.email = String(updates.email).trim().toLowerCase();
  if (updates.tags && !Array.isArray(updates.tags)) {
    updates.tags = String(updates.tags)
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (updates.addresses && !Array.isArray(updates.addresses)) {
    updates.addresses = [updates.addresses];
  }

  return updates;
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/customers
// ─────────────────────────────────────────────────────────────────────────
exports.listCustomers = async (req, res) => {
  const { storeId } = req.params;
  const { search } = req.query;
  requireValidId(storeId, 'storeId');

  const query = { storeId, isDeleted: false };
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const customers = await StoreCustomer.find(query).sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, data: customers });
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/customers/:id
// ─────────────────────────────────────────────────────────────────────────
exports.getCustomer = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const customer = await StoreCustomer.findOne({ _id: id, storeId, isDeleted: false }).lean();
  if (!customer) throw notFoundError('Customer not found.');

  res.status(200).json({ success: true, data: customer });
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/store/:storeId/admin/customers
// Body: { firstName, lastName, email, phone, addresses[], tags[] }
// ─────────────────────────────────────────────────────────────────────────
exports.createCustomer = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const store = await Store.findOne({ _id: storeId, isDeleted: false }).lean();
  if (!store) throw notFoundError('Store not found.');

  const updates = normalizePayload(req.body);

  if (!updates.firstName?.trim() && !updates.lastName?.trim()) {
    throw badRequestError('First or last name is required.');
  }
  if (updates.email && !EMAIL_RE.test(updates.email)) {
    throw badRequestError('Invalid email address.');
  }

  if (updates.email) {
    const existing = await StoreCustomer.findOne({ storeId, email: updates.email, isDeleted: false }).lean();
    if (existing) throw badRequestError('A customer with this email already exists.');
  }

  const customer = await StoreCustomer.create({ storeId, ...updates });
  res.status(201).json({ success: true, data: customer });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/customers/:id
// ─────────────────────────────────────────────────────────────────────────
exports.updateCustomer = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const customer = await StoreCustomer.findOne({ _id: id, storeId, isDeleted: false });
  if (!customer) throw notFoundError('Customer not found.');

  const updates = normalizePayload(req.body);

  if (updates.email && !EMAIL_RE.test(updates.email)) {
    throw badRequestError('Invalid email address.');
  }
  if (updates.email && updates.email !== customer.email) {
    const existing = await StoreCustomer.findOne({
      storeId,
      email: updates.email,
      isDeleted: false,
      _id: { $ne: id },
    }).lean();
    if (existing) throw badRequestError('A customer with this email already exists.');
  }

  Object.assign(customer, updates);
  await customer.save();

  res.status(200).json({ success: true, data: customer });
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/store/:storeId/admin/customers/:id
// Soft delete, matching Product/Collection's isDeleted flag convention.
// ─────────────────────────────────────────────────────────────────────────
exports.deleteCustomer = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const customer = await StoreCustomer.findOneAndUpdate(
    { _id: id, storeId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!customer) throw notFoundError('Customer not found.');

  res.status(200).json({ success: true, data: { id: customer._id, deleted: true } });
};
