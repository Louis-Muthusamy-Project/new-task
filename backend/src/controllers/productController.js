'use strict';

/**
 * productController.js — Products Module (admin CRUD)
 *
 * Store-module counterpart of blogController.js. Handles the merchant-facing
 * Create / Edit / Delete flows for StoreProduct documents, including the
 * Images, Inventory, Price, and SEO sub-sections used by the Products tab
 * in StoresTab.jsx.
 *
 * Distinct from controllers/storeStorefrontController.js, which only ever
 * exposes read-only, Active/non-deleted products to public storefront
 * visitors. Everything here is scoped to a single storeId and is meant to
 * be called from the admin dashboard.
 */

const mongoose = require('mongoose');
const StoreProduct = require('../models/store/StoreProduct');
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

const slugify = (s) =>
  (s || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

// Ensures the slug is unique within the store, appending -2, -3, ... on
// collision (mirrors StoreProductSchema's { storeId, slug } unique index).
async function uniqueSlug(storeId, base, excludeId) {
  let candidate = base || 'product';
  let suffix = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { storeId, slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    // eslint-disable-next-line no-await-in-loop
    const existing = await StoreProduct.findOne(query).lean();
    if (!existing) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

const ALLOWED_FIELDS = [
  'title',
  'description',
  'images',
  'price',
  'compareAtPrice',
  'currency',
  'sku',
  'inventoryQuantity',
  'trackInventory',
  'collectionIds',
  'tags',
  'status',
];

function normalizePayload(body = {}) {
  const updates = {};

  for (const field of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      updates[field] = body[field];
    }
  }

  if (updates.price != null) updates.price = Number(updates.price) || 0;
  if (updates.compareAtPrice != null) {
    updates.compareAtPrice = updates.compareAtPrice === '' ? null : Number(updates.compareAtPrice);
  }
  if (updates.inventoryQuantity != null) {
    updates.inventoryQuantity = Number(updates.inventoryQuantity) || 0;
  }
  if (updates.images && !Array.isArray(updates.images)) {
    updates.images = [updates.images];
  }
  if (updates.tags && !Array.isArray(updates.tags)) {
    updates.tags = String(updates.tags)
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  // SEO is nested under `seo` but accepted flat (metaTitle/metaDescription)
  // for a simpler frontend form payload.
  if (
    Object.prototype.hasOwnProperty.call(body, 'metaTitle') ||
    Object.prototype.hasOwnProperty.call(body, 'metaDescription') ||
    Object.prototype.hasOwnProperty.call(body, 'seo')
  ) {
    updates.seo = {
      metaTitle: body.seo?.metaTitle ?? body.metaTitle ?? '',
      metaDescription: body.seo?.metaDescription ?? body.metaDescription ?? '',
    };
  }

  return updates;
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/products
// Admin listing — every status (Draft/Active/Archived), non-deleted.
// ─────────────────────────────────────────────────────────────────────────
exports.listProducts = async (req, res) => {
  const { storeId } = req.params;
  const { status, search } = req.query;
  requireValidId(storeId, 'storeId');

  const query = { storeId, isDeleted: false };
  if (status) query.status = status;
  if (search) query.title = { $regex: search, $options: 'i' };

  const products = await StoreProduct.find(query).sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, data: products });
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/products/:id
// ─────────────────────────────────────────────────────────────────────────
exports.getProduct = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const product = await StoreProduct.findOne({ _id: id, storeId, isDeleted: false }).lean();
  if (!product) throw notFoundError('Product not found.');

  res.status(200).json({ success: true, data: product });
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/store/:storeId/admin/products
// Body: { title, description, images[], price, compareAtPrice, currency,
//         sku, inventoryQuantity, trackInventory, tags[], status,
//         metaTitle, metaDescription }
// ─────────────────────────────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const store = await Store.findOne({ _id: storeId, isDeleted: false }).lean();
  if (!store) throw notFoundError('Store not found.');

  const { title } = req.body || {};
  if (!title?.trim()) {
    throw badRequestError('Product title is required.');
  }

  const updates = normalizePayload(req.body);
  const slug = await uniqueSlug(storeId, slugify(title));

  const product = await StoreProduct.create({
    storeId,
    title: title.trim(),
    slug,
    currency: updates.currency || store.currency || 'USD',
    status: updates.status || 'Draft',
    ...updates,
  });

  res.status(201).json({ success: true, data: product });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/products/:id
// ─────────────────────────────────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const product = await StoreProduct.findOne({ _id: id, storeId, isDeleted: false });
  if (!product) throw notFoundError('Product not found.');

  const updates = normalizePayload(req.body);

  if (Object.prototype.hasOwnProperty.call(req.body, 'title')) {
    if (!req.body.title?.trim()) throw badRequestError('Product title is required.');
    updates.title = req.body.title.trim();
    updates.slug = await uniqueSlug(storeId, slugify(updates.title), id);
  }

  const { seo, ...rest } = updates;
  Object.assign(product, rest);
  if (seo) {
    product.seo = product.seo || {};
    product.seo.metaTitle = seo.metaTitle;
    product.seo.metaDescription = seo.metaDescription;
  }
  await product.save();

  res.status(200).json({ success: true, data: product });
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/store/:storeId/admin/products/:id
// Soft delete, matching Blog/StoreProduct's isDeleted flag convention.
// ─────────────────────────────────────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const product = await StoreProduct.findOneAndUpdate(
    { _id: id, storeId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!product) throw notFoundError('Product not found.');

  res.status(200).json({ success: true, data: { id: product._id, deleted: true } });
};
