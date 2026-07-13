'use strict';

/**
 * taxController.js — Tax Module (admin)
 *
 * Store-module counterpart of shippingController.js's settings half: a
 * store has exactly one StoreTax document, so this is a plain
 * find-or-create "settings" resource (get/update) backing the "Tax &
 * checkout" panel in StoresTab.jsx. All calculation logic lives in
 * taxService — this controller only resolves the store and shapes the
 * response.
 */

const mongoose = require('mongoose');
const { taxService } = require('../../services/store');
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

// GET /api/store/:storeId/admin/tax
exports.getTax = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const store = await Store.findOne({ _id: storeId, isDeleted: false }).lean();
  if (!store) throw notFoundError('Store not found.');

  const tax = await taxService.getTaxSettings(storeId);
  res.status(200).json({ success: true, data: tax });
};

// PATCH /api/store/:storeId/admin/tax  { rate, isEnabled, label }
exports.updateTax = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const tax = await taxService.updateTaxSettings(storeId, req.body || {});
  res.status(200).json({ success: true, data: tax });
};
