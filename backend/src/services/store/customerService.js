'use strict';

/**
 * customerService.js — Customer Service
 *
 * Owns every business rule around StoreCustomer: field normalization,
 * email validation/uniqueness within a store, and the ordersCount/
 * totalSpent rollup (which only OrderService should ever touch, via
 * `recordOrder` below — never edited directly by a merchant).
 */

const StoreCustomer = require('../../models/store/StoreCustomer');
const Store = require('../../models/store/Store');
const { notFoundError, badRequestError } = require('./errors');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'addresses', 'tags'];

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

async function listCustomers(storeId, { search } = {}) {
  const query = { storeId, isDeleted: false };
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  return StoreCustomer.find(query).sort({ createdAt: -1 }).lean();
}

async function getCustomer(storeId, id) {
  const customer = await StoreCustomer.findOne({ _id: id, storeId, isDeleted: false }).lean();
  if (!customer) throw notFoundError('Customer not found.');
  return customer;
}

async function createCustomer(storeId, body) {
  await assertStoreExists(storeId);

  const updates = normalizePayload(body);

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

  return StoreCustomer.create({ storeId, ...updates });
}

async function updateCustomer(storeId, id, body) {
  const customer = await StoreCustomer.findOne({ _id: id, storeId, isDeleted: false });
  if (!customer) throw notFoundError('Customer not found.');

  const updates = normalizePayload(body);

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
  return customer;
}

async function deleteCustomer(storeId, id) {
  const customer = await StoreCustomer.findOneAndUpdate(
    { _id: id, storeId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!customer) throw notFoundError('Customer not found.');
  return customer;
}

/**
 * Finds-or-creates a customer by email at checkout time, and rolls the
 * order's total into ordersCount/totalSpent. This is the only place those
 * two fields are ever written — OrderService calls this instead of
 * touching StoreCustomer fields itself.
 */
async function recordOrder(storeId, { name, email }, orderTotal) {
  if (!email) return null;

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!EMAIL_RE.test(normalizedEmail)) return null;

  const [firstName, ...rest] = (name || '').trim().split(/\s+/);
  let customer = await StoreCustomer.findOne({ storeId, email: normalizedEmail, isDeleted: false });

  if (!customer) {
    customer = await StoreCustomer.create({
      storeId,
      email: normalizedEmail,
      firstName: firstName || '',
      lastName: rest.join(' ') || '',
      ordersCount: 0,
      totalSpent: 0,
    });
  }

  customer.ordersCount += 1;
  customer.totalSpent += orderTotal || 0;
  await customer.save();
  return customer;
}

module.exports = {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  recordOrder,
};
