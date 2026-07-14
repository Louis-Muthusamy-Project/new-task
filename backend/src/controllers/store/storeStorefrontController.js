'use strict';

const mongoose = require('mongoose');
const Store = require('../../models/store/Store');
const StoreTestimonial = require('../../models/store/StoreTestimonial');
const StoreVisit = require('../../models/store/StoreVisit');
const StoreAnalyticsEvent = require('../../models/store/StoreAnalyticsEvent');
const StoreShipping = require('../../models/store/StoreShipping');
const StorePayment = require('../../models/store/StorePayment');
const Blog = require('../../models/Blog');
const { productService, collectionService, orderService, inventoryService, pageService, cartService, themeService } = require('../../services/store');
const cartController = require('./cartController');
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

const badRequestError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
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

/**
 * toPublicProductDetail — the Product Detail Page's shape. Same
 * StoreProduct doc `toPublicProduct` above maps for listings; this just
 * adds the fields a PDP needs that a grid card doesn't (full gallery,
 * resolved categories, rating summary, SEO) — still one source of truth,
 * two views.
 */
const toPublicProductDetail = (p, { categories = [], rating } = {}) => ({
  id: p._id,
  title: p.title,
  slug: p.slug,
  description: p.description,
  images: optimizeImageList(p.images, 'detail'),
  price: p.price,
  compareAtPrice: p.compareAtPrice,
  currency: p.currency || 'USD',
  sku: p.sku || '',
  inStock: inventoryService.isInStock(p),
  // Exact count only surfaced when the merchant actually tracks stock for
  // this product — untracked products are always "in stock" and have no
  // meaningful quantity to show.
  stockQuantity: p.trackInventory ? p.inventoryQuantity || 0 : null,
  trackInventory: !!p.trackInventory,
  tags: p.tags || [],
  categories: categories.map((c) => ({ id: c._id, title: c.title, slug: c.slug })),
  rating: rating?.average || 0,
  reviewCount: rating?.count || 0,
  seo: {
    metaTitle: p.seo?.metaTitle || p.title,
    metaDescription: p.seo?.metaDescription || (p.description || '').slice(0, 160),
  },
  createdAt: p.createdAt,
});

const toPublicReview = (t) => ({
  id: t._id,
  customerName: t.customerName,
  customerTitle: t.customerTitle || '',
  avatarUrl: optimizeImageUrl(t.avatarUrl || '', 'avatar'),
  quote: t.quote,
  rating: t.rating || 5,
  createdAt: t.createdAt,
});

const toPublicTestimonial = (t) => ({
  id: t._id,
  customerName: t.customerName,
  customerTitle: t.customerTitle || '',
  avatarUrl: optimizeImageUrl(t.avatarUrl || '', 'avatar'),
  quote: t.quote,
  rating: t.rating || 5,
});

const toPublicBlogPost = (post, blog) => ({
  id: post.key || `${blog._id}-${post.slug || post.title}`,
  title: post.title,
  slug: post.slug || '',
  excerpt: post.excerpt || '',
  category: post.category || '',
  publishedAt: post.publishedAt || null,
  blogSlug: blog.slug,
  blogName: blog.name,
  url: post.slug ? `${blog.publicUrl || `/blog/${blog.slug}`}/${post.slug}` : blog.publicUrl || `/blog/${blog.slug}`,
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
 * GET /api/store/:storeId/products/slug/:slug
 * Product Detail Page's primary read — the same StoreProduct collection
 * every other product route reads (no separate/denormalized copy),
 * looked up by the shopper-facing slug used at /products/:slug. Also
 * resolves the product's categories (for the Category section and
 * breadcrumb), a rating summary (from StoreTestimonial reviews already
 * linked via `productId`), and up to 4 related products — everything the
 * PDP needs in one round trip.
 */
exports.getProductBySlug = async (req, res) => {
  const { storeId, slug } = req.params;
  requireValidId(storeId, 'storeId');
  if (!slug) throw badRequestError('A product slug is required.');

  const product = await productService.getPublicProductBySlug(storeId, slug);

  const [categories, ratingAgg, related] = await Promise.all([
    collectionService.getPublicCollectionsByIds(storeId, product.collectionIds),
    StoreTestimonial.aggregate([
      { $match: { storeId: product.storeId, productId: product._id, isDeleted: false, isActive: true } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
    productService.getPublicRelatedProducts(storeId, product, 4),
  ]);

  const rating = ratingAgg[0]
    ? { average: Math.round(ratingAgg[0].average * 10) / 10, count: ratingAgg[0].count }
    : { average: 0, count: 0 };

  res.status(200).json({
    success: true,
    data: {
      ...toPublicProductDetail(product, { categories, rating }),
      relatedProducts: related.map(toPublicProduct),
    },
  });
};

/**
 * GET /api/store/:storeId/products/:productId/reviews
 * The "Reviews" section of a Product Detail Page. Backed by
 * StoreTestimonial (see the model's `productId` field) rather than a new
 * Review model — one collection already carries "customer quote + star
 * rating + which product it's about."
 */
exports.listProductReviews = async (req, res) => {
  const { storeId, productId } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(productId, 'productId');

  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 60);

  const reviews = await StoreTestimonial.find({
    storeId,
    productId,
    isDeleted: false,
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({ success: true, data: reviews.map(toPublicReview) });
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
 * GET /api/store/:storeId/pages/:slug
 * Published-only, full page content (html/css/headLinks) — the read path
 * `ThemeRenderer` (frontend/.../storefront/ThemeRenderer.jsx) uses so a
 * store's *actual* themed markup (hand-built in GrapesJS, or produced by
 * the WordPress Import pipeline) renders on the live storefront/preview,
 * with only its `data-store-block` regions swapped for live React
 * sections — instead of every store showing the same hardcoded generic
 * layout regardless of what it was built or imported as. Request slug
 * `home` to fetch the home page without knowing its real slug.
 */
exports.getPageBySlug = async (req, res) => {
  const { storeId, slug } = req.params;
  requireValidId(storeId, 'storeId');

  const page = await pageService.getPublicPageBySlug(storeId, slug === 'home' ? null : slug);
  if (!page) throw notFoundError('Page not found.');

  res.status(200).json({
    success: true,
    data: {
      id: page._id,
      name: page.name,
      slug: page.slug,
      isHome: page.isHome,
      content: {
        html: page.content?.html || '',
        css: page.content?.css || '',
        headLinks: page.content?.headLinks || '',
        // Theme-Aware Product Renderer: the first tagged product card's
        // outerHTML, extracted at import time by productCardExtractor.js.
        // ThemeRenderer clones this per-product instead of mounting a
        // generic React component — preserving the theme's layout and CSS.
        // null for non-ecommerce pages or pages where detection found no card.
        productCardTemplate: page.content?.productCardTemplate || null,
      },
    },
  });
};

/**
 * GET /api/store/:storeId/theme
 * Public, unauthenticated, read-only — the compiled CSS custom-property
 * map (`themeService.compileToCssVariables`) for the storefront to apply
 * to its document root. This is the read path the storefront's
 * `StorefrontContext` uses on load and again every time it receives a
 * `theme.updated` real-time event, so a color/font/layout change an
 * admin makes on the Theme tab shows up on an already-open storefront
 * tab without a reload — the same live-sync contract every other
 * admin-editable entity (Product/Collection/Discount/Customer/Order)
 * already gets via storeEvents.js.
 */
exports.getTheme = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const theme = await themeService.getTheme(storeId);
  res.status(200).json({
    success: true,
    data: { theme, cssVariables: themeService.compileToCssVariables(theme) },
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
 * GET /api/store/:storeId/blog/posts
 * Query params: limit
 *
 * Flattens every *published* post from whichever active Blog(s) belong to
 * this store — either explicitly linked via `storeId`, or (for blogs
 * created before that link existed) assigned the legacy "Any site / store"
 * label — into one reverse-chronological feed. Backs the "Blog" dynamic
 * block; a store with no blog configured simply gets an empty array
 * rather than a 404, same "never empty by construction" fallback pattern
 * used by Featured/Latest Products.
 */
exports.listBlogPosts = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const limit = Math.min(parseInt(req.query.limit, 10) || 6, 30);

  const blogs = await Blog.find({
    isDeleted: false,
    status: 'active',
    $or: [{ storeId }, { storeId: null, assignedTo: 'Any site / store' }],
  }).lean();

  const posts = blogs
    .flatMap((blog) =>
      (blog.postList || [])
        .filter((post) => post.status === 'published')
        .map((post) => toPublicBlogPost(post, blog))
    )
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, limit);

  res.status(200).json({ success: true, data: posts });
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
 * GET /api/store/:storeId/shipping-options?country=&subtotal=
 * Shipping step of checkout: returns every rate from zones matching
 * `country` (or every zone if a store hasn't restricted by country),
 * with the store's free-shipping threshold already applied against the
 * given subtotal — the same rule cartService.getCartView re-applies at
 * checkout time, so what a shopper picks here can't be undercut later.
 */
exports.listShippingOptions = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const shipping = await StoreShipping.findOne({ storeId }).lean();
  if (!shipping) {
    return res.status(200).json({ success: true, data: { rates: [], freeShippingThreshold: null } });
  }

  const country = String(req.query.country || '').trim().toLowerCase();
  const subtotal = Number(req.query.subtotal) || 0;
  const freeShipping =
    shipping.freeShippingThreshold != null && subtotal >= shipping.freeShippingThreshold;

  const matchingZones = country
    ? shipping.zones.filter(
        (z) => !z.countries?.length || z.countries.some((c) => String(c).toLowerCase() === country)
      )
    : shipping.zones;
  // Fall back to every zone if the country didn't match any (e.g. a
  // shopper hasn't picked a country yet, or the store only has an
  // unrestricted zone) — better to show something than nothing.
  const zones = matchingZones.length ? matchingZones : shipping.zones;

  const rates = zones.flatMap((zone) =>
    (zone.rates || [])
      .filter(
        (r) =>
          (r.minOrderValue == null || subtotal >= r.minOrderValue) &&
          (r.maxOrderValue == null || subtotal <= r.maxOrderValue)
      )
      .map((r) => ({
        zoneId: zone._id,
        zoneName: zone.name,
        name: r.name,
        price: freeShipping ? 0 : r.price,
        deliveryTime: r.deliveryTime,
      }))
  );

  res.status(200).json({
    success: true,
    data: { rates, freeShippingThreshold: shipping.freeShippingThreshold ?? null },
  });
};

/**
 * GET /api/store/:storeId/payment-methods
 * Payment step of checkout: only the enabled methods, and only the
 * shopper-safe fields (no key secrets) — never the same shape the admin
 * Payments tab reads.
 */
exports.listPaymentMethods = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const payment = await StorePayment.findOne({ storeId }).lean();
  const methods = payment?.methods || {};

  const available = [];
  if (methods.razorpay?.enabled) available.push({ method: 'razorpay', label: 'Razorpay', mode: methods.razorpay.mode });
  if (methods.stripe?.enabled) available.push({ method: 'stripe', label: 'Card (Stripe)', mode: methods.stripe.mode });
  if (methods.paypal?.enabled) available.push({ method: 'paypal', label: 'PayPal', mode: methods.paypal.mode });
  if (methods.cod?.enabled) {
    available.push({
      method: 'cod',
      label: 'Cash on Delivery',
      extraFee: methods.cod.extraFee || 0,
      instructions: methods.cod.instructions,
    });
  }

  res.status(200).json({ success: true, data: available });
};

/**
 * POST /api/store/:storeId/checkout
 * Body: { paymentMethod, customer?: { name, email } }
 *
 * The real checkout endpoint — Shipping and Payment steps have already
 * persisted their choices onto the shopper's cart (see cartRoutes.js);
 * this reads that same cart back (never trusts a client-submitted item
 * list), converts it into OrderService's { items, shippingAmount,
 * discountCode, paymentMethod } shape, creates the order, and clears the
 * cart — the "Order → Inventory" handoff, immediately followed by
 * "Inventory → Confirmation" (the created order is returned to render a
 * confirmation screen) and "Confirmation → Analytics" (OrderService
 * already emits `order.created` for any open Admin Analytics/Orders tab).
 */
exports.checkout = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const identity = cartController.resolveIdentity(req);
  const cart = await cartService.getOrCreateCart(storeId, identity);
  const view = await cartService.getCartView(storeId, cart);

  if (!view.items.length) {
    throw badRequestError('Your cart is empty.');
  }
  if (view.hasUnavailableItems) {
    throw badRequestError('Some items in your cart are no longer available in the requested quantity.');
  }

  const paymentMethod = req.body?.paymentMethod || cart.paymentMethod;
  if (!paymentMethod) {
    throw badRequestError('Select a payment method to complete checkout.');
  }

  const contactName = req.body?.customer?.name || '';
  const contactEmail = req.body?.customer?.email || cart.contactEmail;

  const order = await orderService.createOrder(storeId, {
    items: view.items.map((line) => ({ productId: line.productId, variantId: line.variantId, quantity: line.quantity })),
    discountCode: view.discount?.valid ? view.discount.code : undefined,
    shippingAmount: view.shippingChoice?.price || 0,
    paymentMethod,
    customerId: identity.customerId || undefined,
    customer: { name: contactName, email: contactEmail },
  });

  await cartService.clearCart(storeId, identity);

  res.status(201).json({
    success: true,
    data: {
      id: order._id,
      orderNumber: order.orderNumber,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      taxAmount: order.taxAmount,
      shippingAmount: order.shippingAmount,
      total: order.total,
      currency: order.currency,
      status: order.status,
      paymentStatus: order.paymentStatus,
    },
  });
};

/**
 * POST /api/store/:storeId/orders
 * Body: { items: [{ productId, quantity }], customer?: { name, email }, discountCode? }
 *
 * Legacy direct-order route, kept for the static GrapesJS "Checkout"
 * block (storeDynamicBlocks.js) which posts a plain item list rather
 * than going through the persisted cart. New checkout UI should prefer
 * POST /:storeId/checkout above, which reads from the cart instead of
 * trusting a client-submitted item list end to end.
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
// Body: { type?, sessionId?, path?, referrer?, productId?, quantity?, query? }
//
// Fire-and-forget analytics ping. `type` defaults to 'page_view' (the
// original, and still highest-volume, shape of this endpoint — every
// storefront view change pings it once) and keeps writing to StoreVisit
// exactly as before, so no existing caller needs to change.
//
// Any of the funnel event types in StoreAnalyticsEvent.EVENT_TYPES
// (product_view, search, cart_add, checkout_start) writes a small typed
// event instead — these are what let getAnalytics report Product Views,
// Searches, Cart adds, and Checkout starts alongside the existing
// Visitors/Sales/Orders/Revenue numbers. Purchases/Revenue are never
// written here; StoreOrder stays the single source of truth for those
// (see analyticsController.js).
// ─────────────────────────────────────────────────────────────────────────
exports.trackVisit = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const body = req.body || {};
  const { sessionId, path, referrer, type } = body;
  const resolvedSessionId =
    (sessionId && String(sessionId).trim()) ||
    `sess_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

  const eventType = type ? String(type).trim() : 'page_view';

  if (eventType === 'page_view') {
    await StoreVisit.create({
      storeId,
      sessionId: resolvedSessionId,
      path: path || '/',
      referrer: referrer || '',
    });
    return res.status(201).json({ success: true, data: { sessionId: resolvedSessionId } });
  }

  if (!StoreAnalyticsEvent.EVENT_TYPES.includes(eventType)) {
    throw badRequestError(
      `Invalid track type. Expected one of: page_view, ${StoreAnalyticsEvent.EVENT_TYPES.join(', ')}.`
    );
  }

  const { productId, quantity, query, resultCount } = body;
  if ((eventType === 'product_view' || eventType === 'cart_add') && productId) {
    requireValidId(productId, 'productId');
  }

  await StoreAnalyticsEvent.create({
    storeId,
    type: eventType,
    sessionId: resolvedSessionId,
    productId: productId || null,
    quantity: Number.isFinite(Number(quantity)) ? Number(quantity) : 1,
    query: query ? String(query).trim().slice(0, 200) : '',
    resultCount: Number.isFinite(Number(resultCount)) ? Number(resultCount) : null,
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