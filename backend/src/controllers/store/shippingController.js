'use strict';

/**
 * shippingController.js — Shipping Module (admin)
 *
 * Store-module counterpart of productController.js / discountController.js.
 * Unlike those, a store has exactly one StoreShipping document (its
 * shipping configuration), so this controller is a mix of a
 * find-or-create "settings" resource (get/updateSettings — free shipping
 * threshold + origin address) and a nested CRUD sub-resource (zones, each
 * holding its own Shipping Charges + Delivery Time per rate) used by the
 * Shipping tab in StoresTab.jsx.
 */

const mongoose = require('mongoose');
const StoreShipping = require('../../models/store/StoreShipping');
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

async function getOrCreateShipping(storeId) {
  let shipping = await StoreShipping.findOne({ storeId });
  if (!shipping) {
    shipping = await StoreShipping.create({ storeId, zones: [] });
  }
  return shipping;
}

function normalizeRate(raw = {}) {
  return {
    name: (raw.name || '').trim(),
    price: Number(raw.price) || 0,
    minOrderValue: raw.minOrderValue === '' || raw.minOrderValue == null ? null : Number(raw.minOrderValue),
    maxOrderValue: raw.maxOrderValue === '' || raw.maxOrderValue == null ? null : Number(raw.maxOrderValue),
    deliveryTime: (raw.deliveryTime || '').trim(),
  };
}

function normalizeZonePayload(body = {}) {
  const updates = {};
  if (Object.prototype.hasOwnProperty.call(body, 'name')) updates.name = String(body.name || '').trim();
  if (Object.prototype.hasOwnProperty.call(body, 'countries')) {
    updates.countries = Array.isArray(body.countries)
      ? body.countries
      : String(body.countries)
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'rates')) {
    const rates = Array.isArray(body.rates) ? body.rates : [];
    updates.rates = rates.map(normalizeRate);
  }
  return updates;
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/shipping
// Find-or-create — every store gets a default (empty) shipping config the
// first time this is requested, so the Shipping tab always has something
// to render.
// ─────────────────────────────────────────────────────────────────────────
exports.getShipping = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const store = await Store.findOne({ _id: storeId, isDeleted: false }).lean();
  if (!store) throw notFoundError('Store not found.');

  const shipping = await getOrCreateShipping(storeId);
  res.status(200).json({ success: true, data: shipping });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/shipping
// Body: { freeShippingThreshold, originAddress }
// Store-wide settings — Free Shipping threshold + ship-from address.
// ─────────────────────────────────────────────────────────────────────────
exports.updateShippingSettings = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const shipping = await getOrCreateShipping(storeId);

  if (Object.prototype.hasOwnProperty.call(req.body, 'freeShippingThreshold')) {
    const { freeShippingThreshold } = req.body;
    shipping.freeShippingThreshold =
      freeShippingThreshold === '' || freeShippingThreshold == null ? null : Number(freeShippingThreshold);
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'originAddress')) {
    shipping.originAddress = req.body.originAddress || {};
  }

  await shipping.save();
  res.status(200).json({ success: true, data: shipping });
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/store/:storeId/admin/shipping/zones
// Body: { name, countries[], rates: [{ name, price, minOrderValue,
//         maxOrderValue, deliveryTime }] }
// ─────────────────────────────────────────────────────────────────────────
exports.createZone = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  if (!req.body?.name?.trim()) {
    throw badRequestError('Zone name is required.');
  }

  const shipping = await getOrCreateShipping(storeId);
  const zone = normalizeZonePayload(req.body);
  shipping.zones.push(zone);
  await shipping.save();

  res.status(201).json({ success: true, data: shipping });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/shipping/zones/:zoneId
// Body: { name, countries[], rates[] }
// ─────────────────────────────────────────────────────────────────────────
exports.updateZone = async (req, res) => {
  const { storeId, zoneId } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(zoneId, 'zoneId');

  const shipping = await getOrCreateShipping(storeId);
  const zone = shipping.zones.id(zoneId);
  if (!zone) throw notFoundError('Shipping zone not found.');

  if (Object.prototype.hasOwnProperty.call(req.body, 'name') && !req.body.name?.trim()) {
    throw badRequestError('Zone name is required.');
  }

  Object.assign(zone, normalizeZonePayload(req.body));
  await shipping.save();

  res.status(200).json({ success: true, data: shipping });
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/store/:storeId/admin/shipping/zones/:zoneId
// ─────────────────────────────────────────────────────────────────────────
exports.deleteZone = async (req, res) => {
  const { storeId, zoneId } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(zoneId, 'zoneId');

  const shipping = await getOrCreateShipping(storeId);
  const zone = shipping.zones.id(zoneId);
  if (!zone) throw notFoundError('Shipping zone not found.');

  zone.deleteOne();
  await shipping.save();

  res.status(200).json({ success: true, data: shipping });
};
