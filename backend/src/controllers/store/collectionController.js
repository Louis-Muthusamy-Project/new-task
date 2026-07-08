'use strict';

/**
 * collectionController.js — Collections Module (admin CRUD)
 *
 * Thin HTTP layer over Store Engine's Collection Service. All business
 * logic (normalization, slugging, product-id resolution) lives in
 * services/store/collectionService.js.
 */

const mongoose = require('mongoose');
const { collectionService } = require('../../services/store');
const { invalidateStoreCache } = require('../../middlewares/storeCache');

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
// GET /api/store/:storeId/admin/collections
// ─────────────────────────────────────────────────────────────────────────
exports.listCollections = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const data = await collectionService.listCollections(storeId, req.query);
  res.status(200).json({ success: true, data });
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/collections/:id
// ─────────────────────────────────────────────────────────────────────────
exports.getCollection = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const collection = await collectionService.getCollection(storeId, id);
  res.status(200).json({ success: true, data: collection });
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/store/:storeId/admin/collections
// ─────────────────────────────────────────────────────────────────────────
exports.createCollection = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const collection = await collectionService.createCollection(storeId, req.body);

  invalidateStoreCache(storeId);
  res.status(201).json({ success: true, data: collection });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/collections/:id
// ─────────────────────────────────────────────────────────────────────────
exports.updateCollection = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const collection = await collectionService.updateCollection(storeId, id, req.body);

  invalidateStoreCache(storeId);
  res.status(200).json({ success: true, data: collection });
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/store/:storeId/admin/collections/:id
// ─────────────────────────────────────────────────────────────────────────
exports.deleteCollection = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const collection = await collectionService.deleteCollection(storeId, id);

  invalidateStoreCache(storeId);
  res.status(200).json({ success: true, data: { id: collection._id, deleted: true } });
};