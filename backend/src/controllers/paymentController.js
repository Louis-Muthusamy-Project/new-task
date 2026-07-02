'use strict';

/**
 * paymentController.js — Payments Module (admin)
 *
 * Store-module counterpart of shippingController.js. A store has exactly
 * one StorePayment document (its gateway configuration), so this is a
 * find-or-create "settings" resource. Unlike shipping's single settings
 * blob, payments exposes four independently-togglable sub-resources — one
 * per gateway (Razorpay, Stripe, PayPal, Cash on Delivery) — since a store
 * can offer more than one method at checkout simultaneously.
 *
 * Used by the Payments tab in StoresTab.jsx.
 */

const mongoose = require('mongoose');
const StorePayment = require('../models/store/StorePayment');
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

async function getOrCreatePayment(storeId) {
  let payment = await StorePayment.findOne({ storeId });
  if (!payment) {
    payment = await StorePayment.create({ storeId });
  }
  return payment;
}

// Per-method whitelist of fields an admin is allowed to write — keeps
// arbitrary body keys (or the `enabled` flag on the wrong method) from
// leaking into the wrong sub-document.
const FIELDS_BY_METHOD = {
  razorpay: ['enabled', 'mode', 'keyId', 'keySecret'],
  stripe: ['enabled', 'mode', 'publishableKey', 'secretKey'],
  paypal: ['enabled', 'mode', 'clientId', 'clientSecret'],
  cod: ['enabled', 'instructions', 'extraFee'],
};

function normalizeMethodPayload(method, body = {}) {
  const allowed = FIELDS_BY_METHOD[method];
  const updates = {};
  for (const field of allowed) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
    if (field === 'enabled') updates.enabled = !!body.enabled;
    else if (field === 'extraFee') updates.extraFee = Number(body.extraFee) || 0;
    else updates[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
  }
  return updates;
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/payments
// Find-or-create — every store gets a default (all-disabled) payment
// config the first time this is requested, so the Payments tab always has
// something to render.
// ─────────────────────────────────────────────────────────────────────────
exports.getPayments = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const store = await Store.findOne({ _id: storeId, isDeleted: false }).lean();
  if (!store) throw notFoundError('Store not found.');

  const payment = await getOrCreatePayment(storeId);
  res.status(200).json({ success: true, data: payment });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/payments/:method
// method: razorpay | stripe | paypal | cod
// Body varies per gateway — see FIELDS_BY_METHOD above.
// ─────────────────────────────────────────────────────────────────────────
exports.updateMethod = async (req, res) => {
  const { storeId, method } = req.params;
  requireValidId(storeId, 'storeId');

  if (!FIELDS_BY_METHOD[method]) {
    throw badRequestError(`Unknown payment method "${method}". Expected one of: ${StorePayment.PROVIDERS.join(', ')}.`);
  }

  const payment = await getOrCreatePayment(storeId);
  const updates = normalizeMethodPayload(method, req.body);

  // Gateways need credentials before they can go live; COD only needs to
  // be switched on.
  if (updates.enabled === true && method !== 'cod') {
    const idField = method === 'razorpay' ? 'keyId' : method === 'stripe' ? 'publishableKey' : 'clientId';
    const nextValue = Object.prototype.hasOwnProperty.call(updates, idField)
      ? updates[idField]
      : payment.methods[method][idField];
    if (!nextValue) {
      throw badRequestError(`Add ${method === 'razorpay' ? 'a Key ID' : method === 'stripe' ? 'a Publishable Key' : 'a Client ID'} before enabling ${method}.`);
    }
  }

  Object.assign(payment.methods[method], updates);
  await payment.save();

  res.status(200).json({ success: true, data: payment });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/payments
// Body: { supportedCurrencies: string[] }
// ─────────────────────────────────────────────────────────────────────────
exports.updateSettings = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const payment = await getOrCreatePayment(storeId);

  if (Object.prototype.hasOwnProperty.call(req.body, 'supportedCurrencies')) {
    const currencies = req.body.supportedCurrencies;
    payment.supportedCurrencies = Array.isArray(currencies)
      ? currencies.filter(Boolean)
      : payment.supportedCurrencies;
  }

  await payment.save();
  res.status(200).json({ success: true, data: payment });
};
