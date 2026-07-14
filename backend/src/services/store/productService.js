'use strict';

/**
 * productService.js — Product Service
 *
 * Owns every business rule around StoreProduct: field normalization, slug
 * generation/uniqueness, store-existence checks, and delegating stock
 * changes to InventoryService (so "how do we change a product's stock" has
 * exactly one implementation, not one per caller).
 *
 * Both productController.js (admin CRUD) and storeStorefrontController.js
 * (public read-only listing) call through this service instead of hitting
 * the StoreProduct model directly, so there is a single place product
 * business rules live.
 */

const StoreProduct = require('../../models/store/StoreProduct');
const Store = require('../../models/store/Store');
const { notFoundError, badRequestError } = require('./errors');
const { slugify, uniqueSlug } = require('./slug');
const inventoryService = require('./inventoryService');
const { emitStoreEvent } = require('./storeEvents');

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
  'options',
  'variants',
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

  if (updates.options) {
    updates.options = Array.isArray(updates.options) ? updates.options.map(o => ({
      name: String(o.name || '').trim(),
      values: Array.isArray(o.values) ? o.values.map(String) : []
    })).filter(o => o.name) : [];
  }

  if (updates.variants) {
    const mongoose = require('mongoose');
    updates.variants = Array.isArray(updates.variants) ? updates.variants.map(v => {
      const optionValuesMap = new Map();
      if (v.optionValues) {
        const entries = v.optionValues instanceof Map ? v.optionValues.entries() : Object.entries(v.optionValues);
        for (const [key, value] of entries) {
          optionValuesMap.set(String(key), String(value));
        }
      }
      return {
        _id: v._id && mongoose.Types.ObjectId.isValid(v._id) ? new mongoose.Types.ObjectId(v._id) : new mongoose.Types.ObjectId(),
        title: String(v.title || '').trim(),
        price: Number(v.price) || 0,
        compareAtPrice: v.compareAtPrice === '' || v.compareAtPrice == null ? null : Number(v.compareAtPrice),
        sku: String(v.sku || '').trim(),
        inventoryQuantity: Number(v.inventoryQuantity) || 0,
        optionValues: optionValuesMap
      };
    }) : [];
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

async function assertStoreExists(storeId) {
  const store = await Store.findOne({ _id: storeId, isDeleted: false }).lean();
  if (!store) throw notFoundError('Store not found.');
  return store;
}

async function listProducts(storeId, { status, search } = {}) {
  const query = { storeId, isDeleted: false };
  if (status) query.status = status;
  if (search) query.title = { $regex: search, $options: 'i' };

  return StoreProduct.find(query).sort({ createdAt: -1 }).lean();
}

async function getProduct(storeId, id) {
  const product = await StoreProduct.findOne({ _id: id, storeId, isDeleted: false }).lean();
  if (!product) throw notFoundError('Product not found.');
  return product;
}

async function createProduct(storeId, body) {
  const store = await assertStoreExists(storeId);

  const { title } = body || {};
  if (!title?.trim()) {
    throw badRequestError('Product title is required.');
  }

  const updates = normalizePayload(body);
  const slug = await uniqueSlug(StoreProduct, { storeId }, slugify(title), null, 'product');

  const product = await StoreProduct.create({
    storeId,
    title: title.trim(),
    slug,
    currency: updates.currency || store.currency || 'USD',
    status: updates.status || 'Draft',
    ...updates,
  });

  // Every downstream storefront surface (Homepage, Category, Product Page,
  // Search, Collections) reacts to this single event instead of polling —
  // see storeEvents.js.
  emitStoreEvent(storeId, 'product.created', { productId: product._id, status: product.status });

  return product;
}

async function updateProduct(storeId, id, body) {
  const product = await StoreProduct.findOne({ _id: id, storeId, isDeleted: false });
  if (!product) throw notFoundError('Product not found.');

  const updates = normalizePayload(body);

  if (Object.prototype.hasOwnProperty.call(body, 'title')) {
    if (!body.title?.trim()) throw badRequestError('Product title is required.');
    updates.title = body.title.trim();
    updates.slug = await uniqueSlug(StoreProduct, { storeId }, slugify(updates.title), id, 'product');
  }

  const { seo, inventoryQuantity, trackInventory, ...rest } = updates;
  Object.assign(product, rest);
  if (seo) {
    product.seo = product.seo || {};
    product.seo.metaTitle = seo.metaTitle;
    product.seo.metaDescription = seo.metaDescription;
  }
  await product.save();

  // Stock changes always flow through InventoryService, even when they
  // arrive bundled with the rest of the product form, so there is exactly
  // one place that decides how a product's stock level may change.
  // InventoryService.setInventory emits its own 'inventory.updated' event,
  // so we only need to additionally emit 'product.updated' here so any
  // section rendering this product's other fields refreshes too.
  if (inventoryQuantity != null || trackInventory != null) {
    await inventoryService.setInventory(storeId, id, inventoryQuantity, { trackInventory });
    const refreshed = await StoreProduct.findById(id);
    emitStoreEvent(storeId, 'product.updated', { productId: id, status: refreshed.status });
    return refreshed;
  }

  emitStoreEvent(storeId, 'product.updated', { productId: id, status: product.status });
  return product;
}

async function deleteProduct(storeId, id) {
  const product = await StoreProduct.findOneAndUpdate(
    { _id: id, storeId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!product) throw notFoundError('Product not found.');
  emitStoreEvent(storeId, 'product.deleted', { productId: id });
  return product;
}

// ── Public/storefront reads ────────────────────────────────────────────
// Same StoreProduct records as the admin methods above, just filtered to
// `status: 'Active'` and shaped for public consumption — one data source,
// two views, per the Store Engine design (never a separate copy).

const SORT_MAP = {
  latest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  'price-low': { price: 1 },
  'price-high': { price: -1 },
  'name-asc': { title: 1 },
  'name-desc': { title: -1 },
};

async function listPublicProducts(storeId, query = {}) {
  const limit = Math.min(parseInt(query.limit, 10) || 12, 60);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const sort = SORT_MAP[String(query.sort || 'latest').toLowerCase()] || SORT_MAP.latest;

  const filter = { storeId, isDeleted: false, status: 'Active' };

  const mongoose = require('mongoose');
  if (query.collectionId && mongoose.Types.ObjectId.isValid(query.collectionId)) {
    filter.collectionIds = query.collectionId;
  }
  if (query.q) {
    const searchTerm = String(query.q).trim();
    filter.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $regex: searchTerm, $options: 'i' } },
      { sku: { $regex: searchTerm, $options: 'i' } },
    ];
  }
  if (query.tag) filter.tags = String(query.tag).trim();
  if (query.priceMin || query.priceMax) {
    filter.price = {};
    if (query.priceMin) {
      const priceMin = parseFloat(query.priceMin);
      if (!isNaN(priceMin)) filter.price.$gte = priceMin;
    }
    if (query.priceMax) {
      const priceMax = parseFloat(query.priceMax);
      if (!isNaN(priceMax)) filter.price.$lte = priceMax;
    }
  }

  const [items, total] = await Promise.all([
    StoreProduct.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    StoreProduct.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

async function getPublicProduct(storeId, productId) {
  const product = await StoreProduct.findOne({ _id: productId, storeId, isDeleted: false });
  if (!product) throw notFoundError('Product not found.');
  return product;
}

/**
 * getPublicProductBySlug — the Product Detail Page's primary lookup.
 * Same StoreProduct collection getPublicProduct already reads (single
 * source of truth, no duplicated/denormalized copy for the storefront
 * route); only the lookup key differs (slug, the shopper-facing
 * `/products/:slug` identifier, instead of the internal _id).
 */
async function getPublicProductBySlug(storeId, slug) {
  const product = await StoreProduct.findOne({
    storeId,
    slug: String(slug || '').toLowerCase(),
    isDeleted: false,
    status: 'Active',
  });
  if (!product) throw notFoundError('Product not found.');
  return product;
}

/**
 * getPublicRelatedProducts — "Related Products" for a Product Detail
 * Page. Prefers other Active products sharing a collection with `product`,
 * falls back to shared tags, and finally to the newest Active products so
 * the section is never empty by construction (same fallback pattern
 * getFeaturedProducts already uses). Reads straight off StoreProduct —
 * no separate "related products" table.
 */
async function getPublicRelatedProducts(storeId, product, limit = 4) {
  const base = { storeId, isDeleted: false, status: 'Active', _id: { $ne: product._id } };

  let items = [];
  if (product.collectionIds?.length) {
    items = await StoreProduct.find({ ...base, collectionIds: { $in: product.collectionIds } })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
  if (!items.length && product.tags?.length) {
    items = await StoreProduct.find({ ...base, tags: { $in: product.tags } })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
  if (!items.length) {
    items = await StoreProduct.find(base).sort({ createdAt: -1 }).limit(limit);
  }
  return items;
}

async function searchPublicProducts(storeId, q, limit = 8) {
  const regex = { $regex: q, $options: 'i' };
  return StoreProduct.find({
    storeId,
    isDeleted: false,
    status: 'Active',
    $or: [{ title: regex }, { tags: regex }, { sku: regex }],
  }).limit(limit);
}

/**
 * Latest Products section — newest Active products, newest first. Thin,
 * intention-revealing wrapper over listPublicProducts so the "Latest
 * Products" storefront section has its own stable endpoint/shape instead
 * of the caller having to know which query params mean "latest".
 */
async function getLatestProducts(storeId, limit = 8) {
  const { items } = await listPublicProducts(storeId, { limit, sort: 'latest' });
  return items;
}

/**
 * Featured Products section — merchant-curated via the `featured` tag
 * (set from the Products tab like any other tag). Falls back to the
 * newest Active products so a brand-new store's homepage never shows an
 * empty "Featured" section before a merchant has tagged anything — the
 * fallback is still a live DB query, never a hardcoded product list.
 */
async function getFeaturedProducts(storeId, limit = 8) {
  const { items } = await listPublicProducts(storeId, { limit, tag: 'featured' });
  if (items.length > 0) return items;
  return getLatestProducts(storeId, limit);
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listPublicProducts,
  getPublicProduct,
  getPublicProductBySlug,
  getPublicRelatedProducts,
  searchPublicProducts,
  getLatestProducts,
  getFeaturedProducts,
};