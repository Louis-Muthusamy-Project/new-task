const mongoose = require('mongoose');
const Store = require('../models/store/Store');
const StoreProduct = require('../models/store/StoreProduct');
const StoreCollection = require('../models/store/StoreCollection');
const StoreTestimonial = require('../models/store/StoreTestimonial');
const StoreOrder = require('../models/store/StoreOrder');
const { optimizeImageUrl, optimizeImageList } = require('../utils/storeImageOptimizer');

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
 * storeId.
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
  inStock: p.trackInventory ? (p.inventoryQuantity || 0) > 0 : true,
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
 * Query params:
 *   limit       (default 12, max 60)
 *   page        (default 1)
 *   collectionId
 *   featured=true  → newest Active products (used by "Featured Product" / hero blocks)
 *   q           → simple title text search (used by the search block)
 */
exports.listProducts = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const limit = Math.min(parseInt(req.query.limit, 10) || 12, 60);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  const filter = { storeId, isDeleted: false, status: 'Active' };

  if (req.query.collectionId && mongoose.Types.ObjectId.isValid(req.query.collectionId)) {
    filter.collectionIds = req.query.collectionId;
  }

  if (req.query.q) {
    filter.title = { $regex: String(req.query.q).trim(), $options: 'i' };
  }

  const [items, total] = await Promise.all([
    StoreProduct.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    StoreProduct.countDocuments(filter),
  ]);

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

  const product = await StoreProduct.findOne({
    _id: productId,
    storeId,
    isDeleted: false,
  });
  if (!product) throw notFoundError('Product not found.');

  res.status(200).json({ success: true, data: toPublicProduct(product) });
};

/**
 * GET /api/store/:storeId/collections
 * Used by the "Collection" block's picker and by any storefront collection list.
 */
exports.listCollections = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 60);

  const collections = await StoreCollection.find({
    storeId,
    isDeleted: false,
    isActive: true,
  })
    .sort({ title: 1 })
    .limit(limit);

  res.status(200).json({ success: true, data: collections.map(toPublicCollection) });
};

/**
 * GET /api/store/:storeId/collections/:collectionId
 * Returns the collection plus its (Active, non-deleted) products, for the
 * "Collection" block to render a titled product shelf.
 */
exports.getCollection = async (req, res) => {
  const { storeId, collectionId } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(collectionId, 'collectionId');

  const limit = Math.min(parseInt(req.query.limit, 10) || 12, 60);

  const collection = await StoreCollection.findOne({
    _id: collectionId,
    storeId,
    isDeleted: false,
  });
  if (!collection) throw notFoundError('Collection not found.');

  const products = await StoreProduct.find({
    storeId,
    isDeleted: false,
    status: 'Active',
    collectionIds: collectionId,
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    data: {
      ...toPublicCollection(collection),
      products: products.map(toPublicProduct),
    },
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
  const regex = { $regex: q, $options: 'i' };

  const [products, collections] = await Promise.all([
    StoreProduct.find({
      storeId,
      isDeleted: false,
      status: 'Active',
      $or: [{ title: regex }, { tags: regex }, { sku: regex }],
    }).limit(limit),
    StoreCollection.find({
      storeId,
      isDeleted: false,
      isActive: true,
      title: regex,
    }).limit(limit),
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
 * Body: { items: [{ productId, quantity }], customer?: { name, email } }
 *
 * Used by the "Checkout" block. Re-prices every line server-side from the
 * live StoreProduct record (never trusts a price sent by the client) and
 * creates a Pending StoreOrder. Payment collection itself is out of scope
 * here — this just gives the checkout block something real to submit to.
 */
exports.createOrder = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (items.length === 0) {
    throw invalidIdError('Order must include at least one item.');
  }

  const productIds = items
    .map((i) => i.productId)
    .filter((id) => mongoose.Types.ObjectId.isValid(id));

  const products = await StoreProduct.find({
    _id: { $in: productIds },
    storeId,
    isDeleted: false,
  });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const orderItems = [];
  let subtotal = 0;

  for (const line of items) {
    const product = productMap.get(String(line.productId));
    if (!product) continue;
    const quantity = Math.max(parseInt(line.quantity, 10) || 1, 1);
    const price = product.price || 0;
    subtotal += price * quantity;
    orderItems.push({
      productId: product._id,
      title: product.title,
      quantity,
      price,
    });
  }

  if (orderItems.length === 0) {
    throw invalidIdError('None of the submitted items matched a real product.');
  }

  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

  const order = await StoreOrder.create({
    storeId,
    orderNumber,
    items: orderItems,
    subtotal,
    total: subtotal,
    currency: products[0]?.currency || 'USD',
    paymentStatus: 'Pending',
    fulfillmentStatus: 'Unfulfilled',
    status: 'Pending',
  });

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
// Powers the Visitors + Conversion metrics on the Analytics tab
// (analyticsController.js). Generates a sessionId server-side when the
// client doesn't have one yet (first visit) so the caller can persist it
// (e.g. localStorage) and reuse it for the rest of the session.
// ─────────────────────────────────────────────────────────────────────────
const StoreVisit = require('../models/store/StoreVisit');

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