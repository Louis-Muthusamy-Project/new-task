'use strict';

/**
 * collectionService.js — Collection Service
 *
 * Owns every business rule around StoreCollection: field normalization,
 * slug generation/uniqueness, store-existence checks, and resolving
 * `productIds` down to real, in-store, non-deleted StoreProduct ids so a
 * collection can never end up linking a product from another store.
 */

const mongoose = require('mongoose');
const StoreCollection = require('../../models/store/StoreCollection');
const StoreProduct = require('../../models/store/StoreProduct');
const Store = require('../../models/store/Store');
const { notFoundError, badRequestError } = require('./errors');
const { slugify, uniqueSlug } = require('./slug');

const ALLOWED_FIELDS = ['title', 'description', 'imageUrl', 'productIds', 'isActive'];

async function assertStoreExists(storeId) {
  const store = await Store.findOne({ _id: storeId, isDeleted: false }).lean();
  if (!store) throw notFoundError('Store not found.');
  return store;
}

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

async function listCollections(storeId, { search } = {}) {
  const query = { storeId, isDeleted: false };
  if (search) query.title = { $regex: search, $options: 'i' };

  const collections = await StoreCollection.find(query).sort({ createdAt: -1 }).lean();
  return collections.map((c) => ({
    ...c,
    productCount: Array.isArray(c.productIds) ? c.productIds.length : 0,
  }));
}

async function getCollection(storeId, id) {
  const collection = await StoreCollection.findOne({ _id: id, storeId, isDeleted: false }).lean();
  if (!collection) throw notFoundError('Collection not found.');
  return collection;
}

async function createCollection(storeId, body) {
  await assertStoreExists(storeId);

  const { title } = body || {};
  if (!title?.trim()) {
    throw badRequestError('Collection title is required.');
  }

  const updates = normalizePayload(body);
  const slug = await uniqueSlug(StoreCollection, { storeId }, slugify(title), null, 'collection');
  const productIds = await resolveProductIds(storeId, updates.productIds);

  return StoreCollection.create({
    storeId,
    title: title.trim(),
    slug,
    description: updates.description || '',
    imageUrl: updates.imageUrl || '',
    isActive: updates.isActive ?? true,
    productIds: productIds ?? [],
  });
}

async function updateCollection(storeId, id, body) {
  const collection = await StoreCollection.findOne({ _id: id, storeId, isDeleted: false });
  if (!collection) throw notFoundError('Collection not found.');

  const updates = normalizePayload(body);

  if (Object.prototype.hasOwnProperty.call(body, 'title')) {
    if (!body.title?.trim()) throw badRequestError('Collection title is required.');
    updates.title = body.title.trim();
    updates.slug = await uniqueSlug(StoreCollection, { storeId }, slugify(updates.title), id, 'collection');
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'productIds')) {
    updates.productIds = await resolveProductIds(storeId, updates.productIds);
  }

  Object.assign(collection, updates);
  await collection.save();
  return collection;
}

async function deleteCollection(storeId, id) {
  const collection = await StoreCollection.findOneAndUpdate(
    { _id: id, storeId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!collection) throw notFoundError('Collection not found.');
  return collection;
}

// ── Public/storefront reads ────────────────────────────────────────────

async function listPublicCollections(storeId, { limit = 20, sort = 'name' } = {}) {
  const resolvedLimit = Math.min(parseInt(limit, 10) || 20, 60);
  const sortKey = String(sort).toLowerCase();
  const sortObj =
    sortKey === 'latest' ? { createdAt: -1 } : sortKey === 'oldest' ? { createdAt: 1 } : { title: 1 };

  return StoreCollection.find({ storeId, isDeleted: false, isActive: true })
    .sort(sortObj)
    .limit(resolvedLimit);
}

async function getPublicCollection(storeId, collectionId) {
  const collection = await StoreCollection.findOne({ _id: collectionId, storeId, isDeleted: false });
  if (!collection) throw notFoundError('Collection not found.');
  return collection;
}

async function searchPublicCollections(storeId, q, limit = 8) {
  return StoreCollection.find({
    storeId,
    isDeleted: false,
    isActive: true,
    title: { $regex: q, $options: 'i' },
  }).limit(limit);
}

module.exports = {
  listCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  listPublicCollections,
  getPublicCollection,
  searchPublicCollections,
};
