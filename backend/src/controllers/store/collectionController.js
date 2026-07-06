'use strict';

/**
 * collectionController.js — Collections Module (admin CRUD)
 *
 * Store-module counterpart of productController.js. Handles the
 * merchant-facing Create / Edit / Delete flows for StoreCollection
 * documents, including linking/unlinking StoreProduct documents via
 * `productIds`.
 *
 * Distinct from controllers/storeStorefrontController.js, which only ever
 * exposes read-only, active/non-deleted collections to public storefront
 * visitors. Everything here is scoped to a single storeId and is meant to
 * be called from the admin dashboard.
 */

const mongoose = require('mongoose');
const StoreCollection = require('../../models/store/StoreCollection');
const StoreProduct = require('../../models/store/StoreProduct');
const Store = require('../../models/store/Store');
const { invalidateStoreCache } = require('../../middlewares/storeCache');

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
// collision (mirrors StoreCollectionSchema's { storeId, slug } unique index).
async function uniqueSlug(storeId, base, excludeId) {
  let candidate = base || 'collection';
  let suffix = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { storeId, slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    // eslint-disable-next-line no-await-in-loop
    const existing = await StoreCollection.findOne(query).lean();
    if (!existing) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

const ALLOWED_FIELDS = ['title', 'description', 'imageUrl', 'productIds', 'isActive'];

// Filters an incoming productIds array down to valid ObjectIds that
// actually belong to this store, so a collection can never link a product
// from another store (or a stray/garbage id).
async function resolveProductIds(storeId, productIds) {
  if (!Array.isArray(productIds)) return undefined;
  const validIds = productIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!validIds.length) return [];

  const products = await StoreProduct.find({
    _id: { $in: validIds },
    storeId,
    isDeleted: false,
  })
    .select('_id')
    .lean();

  return products.map((p) => p._id);
}

function normalizePayload(body = {}) {
  const updates = {};
  for (const field of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      updates[field] = body[field];
    }
  }
  return updates;
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/collections
// Admin listing — active and inactive, non-deleted. Product counts are
// included so the table can show "N products" without a separate call.
// ─────────────────────────────────────────────────────────────────────────
exports.listCollections = async (req, res) => {
  const { storeId } = req.params;
  const { search } = req.query;
  requireValidId(storeId, 'storeId');

  const query = { storeId, isDeleted: false };
  if (search) query.title = { $regex: search, $options: 'i' };

  const collections = await StoreCollection.find(query).sort({ createdAt: -1 }).lean();
  const data = collections.map((c) => ({
    ...c,
    productCount: Array.isArray(c.productIds) ? c.productIds.length : 0,
  }));

  res.status(200).json({ success: true, data });
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/collections/:id
// Returns the collection plus its linked products (for the edit form's
// "Products" picker to pre-select the right rows).
// ─────────────────────────────────────────────────────────────────────────
exports.getCollection = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const collection = await StoreCollection.findOne({ _id: id, storeId, isDeleted: false }).lean();
  if (!collection) throw notFoundError('Collection not found.');

  res.status(200).json({ success: true, data: collection });
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/store/:storeId/admin/collections
// Body: { title, description, imageUrl, productIds[], isActive }
// ─────────────────────────────────────────────────────────────────────────
exports.createCollection = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const store = await Store.findOne({ _id: storeId, isDeleted: false }).lean();
  if (!store) throw notFoundError('Store not found.');

  const { title } = req.body || {};
  if (!title?.trim()) {
    throw badRequestError('Collection title is required.');
  }

  const updates = normalizePayload(req.body);
  const slug = await uniqueSlug(storeId, slugify(title));
  const productIds = await resolveProductIds(storeId, updates.productIds);

  const collection = await StoreCollection.create({
    storeId,
    title: title.trim(),
    slug,
    description: updates.description || '',
    imageUrl: updates.imageUrl || '',
    isActive: updates.isActive ?? true,
    productIds: productIds ?? [],
  });

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

  const collection = await StoreCollection.findOne({ _id: id, storeId, isDeleted: false });
  if (!collection) throw notFoundError('Collection not found.');

  const updates = normalizePayload(req.body);

  if (Object.prototype.hasOwnProperty.call(req.body, 'title')) {
    if (!req.body.title?.trim()) throw badRequestError('Collection title is required.');
    updates.title = req.body.title.trim();
    updates.slug = await uniqueSlug(storeId, slugify(updates.title), id);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'productIds')) {
    updates.productIds = await resolveProductIds(storeId, updates.productIds);
  }

  Object.assign(collection, updates);
  await collection.save();

  invalidateStoreCache(storeId);
  res.status(200).json({ success: true, data: collection });
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/store/:storeId/admin/collections/:id
// Soft delete, matching Product/Blog's isDeleted flag convention.
// ─────────────────────────────────────────────────────────────────────────
exports.deleteCollection = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const collection = await StoreCollection.findOneAndUpdate(
    { _id: id, storeId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!collection) throw notFoundError('Collection not found.');

  invalidateStoreCache(storeId);
  res.status(200).json({ success: true, data: { id: collection._id, deleted: true } });
};