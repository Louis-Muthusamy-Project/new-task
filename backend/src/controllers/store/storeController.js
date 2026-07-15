'use strict';

/**
 * storeController.js — Create Store API
 *
 * Implements the "create a store from a library template" flow used by
 * StoreTemplateLibraryModal.jsx / CreateStoreModal.jsx once the person
 * picks a template card and hits "Create store":
 *
 *   Choose Template
 *        ↓
 *   Clone Template
 *        ↓
 *   Create Store
 *        ↓
 *   Create Default Pages
 *        ↓
 *   Copy Demo Products
 *        ↓
 *   Return Store
 *
 * This is distinct from controllers/storeTemplateController.js, which
 * parses a raw ZIP upload. Here the source is always an existing
 * StoreTemplate library entry (by _id) — no file I/O, just document cloning.
 */

const mongoose = require('mongoose');
const asyncHandler = require('../../utils/asyncHandler');
const Store           = require('../../models/store/Store');
const StoreTemplate   = require('../../models/store/StoreTemplate');
const StorePage       = require('../../models/store/StorePage');
const StoreProduct    = require('../../models/store/StoreProduct');
const StoreCollection = require('../../models/store/StoreCollection');
const StoreDiscount   = require('../../models/store/StoreDiscount');
const { DEFAULT_STORE_PAGES } = require('../../config/defaultStorePages');
const { resolveStoreBlockPlaceholders } = require('../../utils/storeBlockTemplates');

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────
const slugify = (s) =>
  (s || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

// Deep-clone via JSON round-trip — strips Mongoose document/array wrappers
// so cloned sub-documents don't carry over the template's ObjectIds.
const deepClone = (value) => (value == null ? value : JSON.parse(JSON.stringify(value)));

// Static demo catalog used to seed a freshly created store when
// `installDemo` is requested and the chosen template has no extracted
// products of its own. Kept intentionally generic/template-agnostic — used
// as the fallback in createStoreFromTemplateDocument's "Copy Demo Products"
// step; template.demoProducts (populated at upload time by
// services/templateImplort/productDataExtractor.js) wins whenever present.
const DEMO_PRODUCT_SEED = [
  { title: 'Classic Tee', price: 24.99, tags: ['bestseller'] },
  { title: 'Everyday Hoodie', price: 49.99, tags: ['new'] },
  { title: 'Signature Cap', price: 19.99, tags: [] },
  { title: 'Canvas Tote', price: 29.99, tags: ['bestseller'] },
  { title: 'Weekender Bag', price: 79.99, tags: ['new'] },
  { title: 'Sport Socks (3-pack)', price: 14.99, tags: [] },
];

// ─────────────────────────────────────────────────────────────────────────────
// createStoreFromTemplateDocument — reusable core
//
// The actual "clone a StoreTemplate into a live Store" logic (steps 1-6),
// extracted out of the route handler so it can be called from a second
// entry point: the WordPress live-import route
// (routes/wordpressImportRoutes.js POST /upload-live), which imports a ZIP
// straight into a StoreTemplate (via importWordPressZip) and then wants a
// live Store created from that template in the same request — without
// duplicating any of Choose/Clone/Create/Default-Pages/Demo-Products here.
//
// Takes plain option values (not req/res) and either returns the created
// records or throws an Error with `.statusCode` set, so both callers (the
// HTTP route below and the WordPress live-import route) can handle errors
// the same way asyncHandler/errorMiddleware already do everywhere else.
//
// @param {Object} opts
// @param {string} opts.templateId
// @param {string} [opts.storeName]
// @param {string} [opts.name]              alias for storeName
// @param {string} [opts.currency]
// @param {string} [opts.status]
// @param {boolean|string} [opts.installDemo]
// @param {string} [opts.description]
// @param {string} [opts.domain]
// @param {string} [opts.category]
// @param {string|import('mongoose').Types.ObjectId|null} [opts.ownerId]
// @returns {Promise<{ store, pages, products, collections, discount }>}
// ─────────────────────────────────────────────────────────────────────────────
async function createStoreFromTemplateDocument(opts = {}) {
  const {
    templateId,
    storeName,
    name,
    currency,
    status,
    installDemo,
    description,
    domain,
    category,
    ownerId = null,
  } = opts;

  if (!templateId) {
    const error = new Error('templateId is required.');
    error.statusCode = 400;
    throw error;
  }

  const resolvedName = (storeName || name || '').trim();
  if (!resolvedName) {
    const error = new Error('storeName is required.');
    error.statusCode = 400;
    throw error;
  }

  // ── 1. Choose Template ──────────────────────────────────────────────────
  const template = await StoreTemplate.findById(templateId);
  if (!template || template.status === 'Archived') {
    const error = new Error('Store template not found.');
    error.statusCode = 404;
    throw error;
  }

  // ── 2. Clone Template ────────────────────────────────────────────────────
  // Deep-clone the template's page snapshots and theme so edits made on the
  // new store never mutate the shared library entry.
  const clonedPages = deepClone(template.pages) || [];
  const clonedTheme = deepClone(template.theme) || {};

  // ── 3. Create Store ──────────────────────────────────────────────────────
  const store = await Store.create({
    user: ownerId,
    ownerId,
    name: resolvedName,
    storeName: resolvedName,
    description: description || template.description || '',
    status: status || 'Draft',
    currency: currency || 'USD',
    domain: domain || '',
    category: category || template.category || 'Other',
    installDemo: installDemo === true || installDemo === 'true',
    templateId: template._id,
    template: {
      templateId: String(template._id),
      templateName: template.name,
      imageUrl: template.thumbnail || '',
      cloudinaryPublicId: '',
    },
    settings: { theme: clonedTheme },
  });

  // ── 4. Create Default Pages ─────────────────────────────────────────────
  // Template-cloned pages win if the template defines its own; otherwise
  // every store gets the standard 8-page set (Home, Catalog, Product, Cart,
  // Checkout, Contact, Blog, 404) from config/defaultStorePages.js.
  const pageDefinitions = clonedPages.length ? clonedPages : DEFAULT_STORE_PAGES;

  const seenSlugs = new Set();
  const pageDocs = pageDefinitions.map((p, i) => {
    let slug = slugify(p.slug || p.name || `page-${i + 1}`) || `page-${i + 1}`;
    // Guard against duplicate slugs within the same template snapshot —
    // StorePage enforces a unique (storeId, slug) index.
    let uniqueSlug = slug;
    let suffix = 2;
    while (seenSlugs.has(uniqueSlug)) {
      uniqueSlug = `${slug}-${suffix++}`;
    }
    seenSlugs.add(uniqueSlug);

    // Each page persists: slug, seo, and content { projectData, html, css }.
    // `resolveStoreBlockPlaceholders` is a no-op unless the WordPress
    // Import Pipeline's component detector (storeComponentDetector.js)
    // converted a region into a live block on this template — those embed
    // a `{{STORE_ID}}` token since no Store existed yet at import time,
    // and this create-from-template flow is the first place one does.
    const content =
      p.content && typeof p.content === 'object'
        ? {
            projectData: p.content.projectData ?? null,
            html: resolveStoreBlockPlaceholders(p.content.html ?? '', store._id),
            css: p.content.css ?? '',
          }
        : { projectData: null, html: '', css: '' };

    return {
      storeId: store._id,
      name: p.name || (p.isHome ? 'Home' : `Page ${i + 1}`),
      slug: uniqueSlug,
      isHome: !!p.isHome || i === 0,
      status: 'Draft',
      content,
      seo: {
        title: p.seo?.title || p.name || '',
        description: p.seo?.description || '',
        ogImageUrl: p.seo?.ogImageUrl || '',
      },
    };
  });

  const createdPages = await StorePage.insertMany(pageDocs);

  // ── 5. Copy Demo Products ───────────────────────────────────────────────
  let createdProducts = [];
  let createdCollections = [];
  let createdDiscount = null;

  if (store.installDemo) {
    const demoCollection = await StoreCollection.create({
      storeId: store._id,
      title: 'Featured',
      slug: 'featured',
      description: 'Demo collection added automatically for previewing the storefront.',
      isActive: true,
    });

    // Prefer products actually extracted from the uploaded template ZIP
    // (services/templateImplort/productDataExtractor.js, saved onto
    // template.demoProducts at upload time — see Phase 2). Only fall back
    // to the generic hardcoded seed when a template shipped none, so
    // templates without extractable product data (or manually-created
    // templates predating extraction) keep working exactly as before.
    const sourceProducts =
      Array.isArray(template.demoProducts) && template.demoProducts.length
        ? template.demoProducts
        : DEMO_PRODUCT_SEED;

    // Guard against duplicate/blank slugs the same way pageDocs does above
    // — StoreProduct enforces a unique (storeId, slug) index, and extracted
    // titles (unlike the static seed) aren't guaranteed unique.
    const seenProductSlugs = new Set();
    const productDocs = sourceProducts.map((p) => {
      const baseSlug = slugify(p.slug || p.title) || 'product';
      let uniqueSlug = baseSlug;
      let suffix = 2;
      while (seenProductSlugs.has(uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${suffix++}`;
      }
      seenProductSlugs.add(uniqueSlug);

      return {
        storeId: store._id,
        title: p.title,
        slug: uniqueSlug,
        description: p.description || '',
        images: p.image ? [p.image] : [],
        price: p.price || 0,
        currency: p.currency || currency || 'USD',
        tags: p.tags || [],
        collectionIds: [demoCollection._id],
        status: 'Active',
      };
    });

    createdProducts = await StoreProduct.insertMany(productDocs);

    demoCollection.productIds = createdProducts.map((p) => p._id);
    await demoCollection.save();
    createdCollections = [demoCollection];

    createdDiscount = await StoreDiscount.create({
      storeId: store._id,
      code: 'WELCOME10',
      type: 'Percentage',
      value: 10,
      isActive: true,
    });
  }

  // ── 6. Return Store ──────────────────────────────────────────────────────
  const populatedStore = await Store.findById(store._id)
    .populate('pages')
    .populate('products')
    .populate('collections')
    .populate('discounts');

  return {
    store: populatedStore,
    pages: createdPages,
    products: createdProducts,
    collections: createdCollections,
    discount: createdDiscount,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/store/create-from-template
// Body: { templateId, storeName, currency, status, installDemo, description }
//
// Thin HTTP wrapper around createStoreFromTemplateDocument — parses the
// request, delegates to the reusable core, and shapes the response. All
// Choose/Clone/Create/Default-Pages/Demo-Products logic lives in the core
// function above.
// ─────────────────────────────────────────────────────────────────────────────
const createStoreFromTemplate = asyncHandler(async (req, res) => {
  const {
    templateId,
    storeName,
    name,
    currency,
    status,
    installDemo,
    description,
    domain,
    category,
  } = req.body || {};

  const ownerId = req?.user?.id || req?.user?._id || null;

  const result = await createStoreFromTemplateDocument({
    templateId,
    storeName,
    name,
    currency,
    status,
    installDemo,
    description,
    domain,
    category,
    ownerId,
  });

  return res.status(201).json({ success: true, data: result });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/store — list all stores (StoresTab.jsx "All stores" table)
// Query: { search, status }
// Returns every non-deleted store, newest first, with a lightweight
// products count so the table's CATALOG column doesn't need a second round
// trip per row.
// ─────────────────────────────────────────────────────────────────────────────
const listStores = asyncHandler(async (req, res) => {
  const { search, status } = req.query || {};

  const query = { isDeleted: { $ne: true } };
  if (status) query.status = status;
  if (search) query.$text = { $search: search };

  const ownerId = req?.user?.id || req?.user?._id || null;
  if (ownerId) query.ownerId = ownerId;

  const stores = await Store.find(query).sort({ createdAt: -1 }).lean();

  const storeIds = stores.map((s) => s._id);
  const productCounts = await StoreProduct.aggregate([
    { $match: { storeId: { $in: storeIds }, isDeleted: { $ne: true } } },
    { $group: { _id: '$storeId', count: { $sum: 1 } } },
  ]);
  const countByStoreId = new Map(productCounts.map((c) => [String(c._id), c.count]));

  const data = stores.map((s) => ({
    ...s,
    productCount: countByStoreId.get(String(s._id)) || 0,
  }));

  return res.status(200).json({ success: true, data });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/store — plain "start from scratch" create (no template)
// Body: { storeName, currency, status, description }
// ─────────────────────────────────────────────────────────────────────────────
const createStore = asyncHandler(async (req, res) => {
  const { storeName, name, currency, status, description, domain, category } = req.body || {};

  const resolvedName = (storeName || name || '').trim();
  if (!resolvedName) {
    return res.status(400).json({ success: false, error: 'storeName is required.' });
  }

  const ownerId = req?.user?.id || req?.user?._id || null;

  const store = await Store.create({
    user: ownerId,
    ownerId,
    name: resolvedName,
    storeName: resolvedName,
    description: description || '',
    status: status || 'Draft',
    currency: currency || 'USD',
    domain: domain || '',
    category: category || 'Other',
  });

  return res.status(201).json({ success: true, data: { store } });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/store/:id/preview
// Store-module counterpart of websiteController.previewWebsite — returns the
// store record plus all non-deleted StorePages (home page first), so the
// Store Preview module (Desktop/Tablet/Mobile) in StoresTab.jsx's Home tab
// can render the live storefront inline without a popup.
//
// Errors handled:
//   400 – invalid ObjectId
//   404 – store not found or soft-deleted
// ─────────────────────────────────────────────────────────────────────────────
const previewStore = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid store id.');
    error.statusCode = 400;
    throw error;
  }

  const store = await Store.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!store) {
    const error = new Error('Store not found.');
    error.statusCode = 404;
    throw error;
  }

  const pages = await StorePage.find({
    storeId: store._id,
    isDeleted: { $ne: true },
  })
    .sort({ isHome: -1, createdAt: 1 })
    .lean();

  return res.status(200).json({
    success: true,
    data: {
      store,
      pages,
      meta: {
        pageCount: pages.length,
        hasHomePage: pages.some((p) => p.isHome),
      },
    },
  });
});

module.exports = {
  createStoreFromTemplate,
  createStore,
  listStores,
  previewStore,
  // Reused by routes/wordpressImportRoutes.js POST /upload-live so a
  // WordPress ZIP can be imported straight into a live Store (Template ->
  // Store, in one request) without duplicating the Choose/Clone/Create/
  // Default-Pages/Demo-Products logic above.
  createStoreFromTemplateDocument,
};