'use strict';

const mongoose = require('mongoose');
const Store = require('../../models/store/Store');
const StoreTestimonial = require('../../models/store/StoreTestimonial');
const StoreVisit = require('../../models/store/StoreVisit');
const { productService, collectionService, orderService, inventoryService, pageService } = require('../../services/store');
const { subscribe } = require('../../services/store/storeEvents');
const { optimizeImageUrl, optimizeImageList } = require('../../utils/storeImageOptimizer');

/**
 * storeStorefrontController.js
 *
 * Public, read-only data endpoints consumed by the "Dynamic Blocks" the
 * Website Builder's GrapesJS editor can drop onto a store page (Hero,
 * Product Grid, Featured Product, Collection, Testimonials, Search, Cart,
 * Checkout, Footer). See frontend/src/pages/WebsiteBuilder/websiteWizard/
 * storeDynamicBlocks.js for the block definitions that call these routes.
 *
 * Unlike the admin-facing store routes, these are intentionally
 * unauthenticated (a live storefront visitor is never logged in) and only
 * ever return `status: 'Active'` / non-deleted records scoped to a single
 * storeId. Reads and writes both go through the same Store Engine services
 * the admin routes use (productService/collectionService/orderService) —
 * this controller only validates params and shapes the public response.
 */

const invalidIdError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const notFoundError = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

const requireValidId = (id, label = 'id') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError(`Invalid ${label}.`);
  }
};

const toPublicProduct = (p) => ({
  id: p._id,
  title: p.title,
  slug: p.slug,
  description: p.description,
  images: optimizeImageList(p.images, 'card'),
  image: optimizeImageUrl((p.images && p.images[0]) || '', 'card'),
  price: p.price,
  compareAtPrice: p.compareAtPrice,
  currency: p.currency || 'USD',
  inStock: inventoryService.isInStock(p),
  collectionIds: p.collectionIds || [],
  tags: p.tags || [],
});

const toPublicCollection = (c) => ({
  id: c._id,
  title: c.title,
  slug: c.slug,
  description: c.description,
  imageUrl: optimizeImageUrl(c.imageUrl || '', 'card'),
  productCount: Array.isArray(c.productIds) ? c.productIds.length : 0,
});

const toPublicTestimonial = (t) => ({
  id: t._id,
  customerName: t.customerName,
  customerTitle: t.customerTitle || '',
  avatarUrl: optimizeImageUrl(t.avatarUrl || '', 'avatar'),
  quote: t.quote,
  rating: t.rating || 5,
});

/**
 * GET /api/store/:storeId/info
 * Minimal public store metadata for the Hero / Footer blocks.
 */
exports.getStoreInfo = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const store = await Store.findOne({ _id: storeId, isDeleted: false }).select(
    'name storeName description currency faviconUrl domain'
  );
  if (!store) throw notFoundError('Store not found.');

  res.status(200).json({
    success: true,
    data: {
      id: store._id,
      name: store.storeName || store.name,
      description: store.description || '',
      currency: store.currency || 'USD',
      logoUrl: optimizeImageUrl(store.faviconUrl || '', 'avatar'),
      domain: store.domain || '',
    },
  });
};

/**
 * GET /api/store/:storeId/products
 * Query params: limit, page, collectionId, q, sort, priceMin, priceMax, tag
 */
exports.listProducts = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const { items, total, page, limit } = await productService.listPublicProducts(storeId, req.query);

  res.status(200).json({
    success: true,
    data: items.map(toPublicProduct),
    meta: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
  });
};

/**
 * GET /api/store/:storeId/products/:productId
 * Used by the "Featured Product" block when a merchant pins a specific item.
 */
exports.getProduct = async (req, res) => {
  const { storeId, productId } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(productId, 'productId');

  const product = await productService.getPublicProduct(storeId, productId);
  res.status(200).json({ success: true, data: toPublicProduct(product) });
};

/**
 * GET /api/store/:storeId/collections
 * Query params: limit, sort
 */
exports.listCollections = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const collections = await collectionService.listPublicCollections(storeId, req.query);
  res.status(200).json({ success: true, data: collections.map(toPublicCollection) });
};

/**
 * GET /api/store/:storeId/collections/:collectionId
 * Returns the collection plus its (Active, non-deleted) products.
 * Query params: limit, sort
 */
exports.getCollection = async (req, res) => {
  const { storeId, collectionId } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(collectionId, 'collectionId');

  const collection = await collectionService.getPublicCollection(storeId, collectionId);
  const { items } = await productService.listPublicProducts(storeId, {
    ...req.query,
    collectionId,
  });

  res.status(200).json({
    success: true,
    data: {
      ...toPublicCollection(collection),
      products: items.map(toPublicProduct),
    },
  });
};

/**
 * GET /api/store/:storeId/products/featured
 * Featured Products section — see ProductService.getFeaturedProducts.
 */
exports.listFeaturedProducts = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const limit = Math.min(parseInt(req.query.limit, 10) || 8, 30);
  const items = await productService.getFeaturedProducts(storeId, limit);
  res.status(200).json({ success: true, data: items.map(toPublicProduct) });
};

/**
 * GET /api/store/:storeId/products/latest
 * Latest Products section — see ProductService.getLatestProducts.
 */
exports.listLatestProducts = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const limit = Math.min(parseInt(req.query.limit, 10) || 8, 30);
  const items = await productService.getLatestProducts(storeId, limit);
  res.status(200).json({ success: true, data: items.map(toPublicProduct) });
};

/**
 * GET /api/store/:storeId/products/bestsellers
 * Best Sellers section — see OrderService.getBestSellers.
 */
exports.listBestSellers = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const limit = Math.min(parseInt(req.query.limit, 10) || 8, 30);
  const items = await orderService.getBestSellers(storeId, limit);
  res.status(200).json({ success: true, data: items.map(toPublicProduct) });
};

/**
 * GET /api/store/:storeId/pages
 * Published pages only, minimal shape — backs the Menu and Footer nav.
 */
exports.listPages = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const pages = await pageService.listPublicPages(storeId);
  res.status(200).json({
    success: true,
    data: pages.map((p) => ({ id: p._id, name: p.name, slug: p.slug, isHome: p.isHome })),
  });
};

/**
 * GET /api/store/:storeId/testimonials
 */
exports.listTestimonials = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const limit = Math.min(parseInt(req.query.limit, 10) || 9, 30);

  const testimonials = await StoreTestimonial.find({
    storeId,
    isDeleted: false,
    isActive: true,
  })
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(limit);

  res.status(200).json({ success: true, data: testimonials.map(toPublicTestimonial) });
};

/**
 * GET /api/store/:storeId/search?q=
 * Combined product + collection search used by the "Search" block's results
 * dropdown/page.
 */
exports.search = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const q = String(req.query.q || '').trim();
  if (!q) {
    return res.status(200).json({ success: true, data: { products: [], collections: [] } });
  }

  const limit = Math.min(parseInt(req.query.limit, 10) || 8, 30);

  const [products, collections] = await Promise.all([
    productService.searchPublicProducts(storeId, q, limit),
    collectionService.searchPublicCollections(storeId, q, limit),
  ]);

  res.status(200).json({
    success: true,
    data: {
      products: products.map(toPublicProduct),
      collections: collections.map(toPublicCollection),
    },
  });
};

/**
 * POST /api/store/:storeId/orders
 * Body: { items: [{ productId, quantity }], customer?: { name, email }, discountCode? }
 *
 * Used by the "Checkout" block. Delegates entirely to Order Service, which
 * re-prices every line server-side, checks/decrements stock via Inventory
 * Service, resolves an optional discount code via Discount Service, and
 * rolls the order into the customer record via Customer Service.
 */
exports.createOrder = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const order = await orderService.createOrder(storeId, req.body);

  res.status(201).json({
    success: true,
    data: {
      id: order._id,
      orderNumber: order.orderNumber,
      total: order.total,
      currency: order.currency,
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/store/:storeId/track
// Body: { sessionId?, path?, referrer? }
// Fire-and-forget pageview ping called once per storefront page load.
// ─────────────────────────────────────────────────────────────────────────
exports.trackVisit = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const { sessionId, path, referrer } = req.body || {};
  const resolvedSessionId =
    (sessionId && String(sessionId).trim()) ||
    `sess_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

  await StoreVisit.create({
    storeId,
    sessionId: resolvedSessionId,
    path: path || '/',
    referrer: referrer || '',
  });

  res.status(201).json({ success: true, data: { sessionId: resolvedSessionId } });
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/events  (Server-Sent Events)
//
// The transport that makes "no manual refresh logic" real: every write
// path in the Store Engine (ProductService, CollectionService,
// InventoryService — see storeEvents.js) emits an event right after it
// commits; this route streams those events to every open storefront
// surface for the store — Homepage, Category, Product Page, Search,
// Collections — so each surface's own hook (useProducts/useProduct/
// useFeaturedProducts/etc, see frontend hooks/useProducts.js) knows the
// instant to refetch instead of polling on a timer.
//
// Deliberately unauthenticated (same trust level as every other route in
// this controller) and read-only — nothing is ever written from an SSE
// connection, it only announces that something changed elsewhere.
// ─────────────────────────────────────────────────────────────────────────
exports.streamEvents = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // disable nginx response buffering, if present
  });
  res.flushHeaders?.();

  // Deliberately unnamed SSE events (no `event:` line) — the `type` travels
  // inside the JSON payload instead. That lets the client use a single
  // `EventSource.onmessage` listener and dispatch on `event.type` itself,
  // rather than having to register a named listener per event type it
  // might ever see.
  const send = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  // Tell the client it connected successfully so useStorefrontEvents can
  // flip from "connecting" to "live" without waiting for the first real
  // product/collection/inventory change.
  send({ type: 'connected', storeId, payload: {}, ts: Date.now() });

  const unsubscribe = subscribe(storeId, send);

  // Comment-line heartbeat (ignored by EventSource as a message, but keeps
  // idle proxies/load balancers from timing out and silently dropping the
  // connection).
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
};