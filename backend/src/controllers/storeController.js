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

const asyncHandler = require('../utils/asyncHandler');
const Store           = require('../models/store/Store');
const StoreTemplate   = require('../models/store/StoreTemplate');
const StorePage       = require('../models/store/StorePage');
const StoreProduct    = require('../models/store/StoreProduct');
const StoreCollection = require('../models/store/StoreCollection');
const StoreDiscount   = require('../models/store/StoreDiscount');
const { DEFAULT_STORE_PAGES } = require('../config/defaultStorePages');

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
// `installDemo` is requested. Kept intentionally generic/template-agnostic;
// swap for template.projectData.demoProducts if a template ships its own.
const DEMO_PRODUCT_SEED = [
  { title: 'Classic Tee', price: 24.99, tags: ['bestseller'] },
  { title: 'Everyday Hoodie', price: 49.99, tags: ['new'] },
  { title: 'Signature Cap', price: 19.99, tags: [] },
  { title: 'Canvas Tote', price: 29.99, tags: ['bestseller'] },
  { title: 'Weekender Bag', price: 79.99, tags: ['new'] },
  { title: 'Sport Socks (3-pack)', price: 14.99, tags: [] },
];

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/store/create-from-template
// Body: { templateId, storeName, currency, status, installDemo, description }
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

  if (!templateId) {
    return res.status(400).json({ success: false, error: 'templateId is required.' });
  }

  const resolvedName = (storeName || name || '').trim();
  if (!resolvedName) {
    return res.status(400).json({ success: false, error: 'storeName is required.' });
  }

  // ── 1. Choose Template ──────────────────────────────────────────────────
  const template = await StoreTemplate.findById(templateId);
  if (!template || template.status === 'Archived') {
    return res.status(404).json({ success: false, error: 'Store template not found.' });
  }

  // ── 2. Clone Template ────────────────────────────────────────────────────
  // Deep-clone the template's page snapshots and theme so edits made on the
  // new store never mutate the shared library entry.
  const clonedPages = deepClone(template.pages) || [];
  const clonedTheme = deepClone(template.theme) || {};

  // ── 3. Create Store ──────────────────────────────────────────────────────
  const ownerId = req?.user?.id || req?.user?._id || null;

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
    const content =
      p.content && typeof p.content === 'object'
        ? { projectData: p.content.projectData ?? null, html: p.content.html ?? '', css: p.content.css ?? '' }
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

    const productDocs = DEMO_PRODUCT_SEED.map((p) => ({
      storeId: store._id,
      title: p.title,
      slug: slugify(p.title),
      price: p.price,
      currency: currency || 'USD',
      tags: p.tags,
      collectionIds: [demoCollection._id],
      status: 'Active',
    }));

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

  return res.status(201).json({
    success: true,
    data: {
      store: populatedStore,
      pages: createdPages,
      products: createdProducts,
      collections: createdCollections,
      discount: createdDiscount,
    },
  });
});

module.exports = { createStoreFromTemplate };