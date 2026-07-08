'use strict';

/**
 * productController.js — Products Module (admin CRUD)
 *
 * Thin HTTP layer over Store Engine's Product Service: validates route
 * params, calls the service, invalidates the store cache, and shapes the
 * HTTP response. All business logic (normalization, slugging, inventory
 * rules) lives in services/store/productService.js.
 */

const mongoose = require('mongoose');
const { productService } = require('../../services/store');
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
// GET /api/store/:storeId/admin/products
// ─────────────────────────────────────────────────────────────────────────
exports.listProducts = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const products = await productService.listProducts(storeId, req.query);
  res.status(200).json({ success: true, data: products });
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/products/:id
// ─────────────────────────────────────────────────────────────────────────
exports.getProduct = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const product = await productService.getProduct(storeId, id);
  res.status(200).json({ success: true, data: product });
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/store/:storeId/admin/products
// ─────────────────────────────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const product = await productService.createProduct(storeId, req.body);

  invalidateStoreCache(storeId);
  res.status(201).json({ success: true, data: product });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/products/:id
// ─────────────────────────────────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const product = await productService.updateProduct(storeId, id, req.body);

  invalidateStoreCache(storeId);
  res.status(200).json({ success: true, data: product });
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/store/:storeId/admin/products/:id
// ─────────────────────────────────────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const product = await productService.deleteProduct(storeId, id);

  invalidateStoreCache(storeId);
  res.status(200).json({ success: true, data: { id: product._id, deleted: true } });
};