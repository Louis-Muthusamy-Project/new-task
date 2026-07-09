const express = require('express');

const storeStorefrontController = require('../../controllers/store/storeStorefrontController');
const asyncHandler = require('../../utils/asyncHandler');
const { storeReadCache } = require('../../middlewares/storeCache');

const router = express.Router();

// Mounted under /api/store
// Public, read-only data used by the GrapesJS "Dynamic Blocks" — the
// Shopify-style theme sections a merchant drops onto a page (Header, Menu,
// Hero, Product Grid, Latest Products, Featured Products, Collection Grid,
// Testimonials, Blog, Search, Cart, Checkout, Footer) — see
// storeDynamicBlocks.js on the frontend. Every block is a small HTML shell
// + script that reads from these routes at render time; none of them save
// product/collection/post data into the page itself.
//
// Caching: these reads are the highest-traffic part of a live storefront
// (every page load re-fetches info/products/collections/testimonials) and
// change far less often than they're read, so they run through
// storeReadCache — a short TTL in-memory cache plus a Cache-Control header
// for any CDN/browser cache sitting in front of the API. Search and the
// two write routes (orders, track) are intentionally left uncached.
const cache = storeReadCache();

// Real-time sync — Server-Sent Events stream of product/collection/
// inventory changes for this store. No cache (a live stream), no auth
// (same public trust level as the rest of this router). See
// storeStorefrontController.streamEvents / services/store/storeEvents.js.
router.get('/:storeId/events', asyncHandler(storeStorefrontController.streamEvents));

router.get('/:storeId/info', cache, asyncHandler(storeStorefrontController.getStoreInfo));

// Theme tokens compiled to CSS variables — cached like every other
// low-write, high-read public GET here; invalidated the same way (a
// `theme.updated` event on the SSE stream tells the client to refetch,
// which naturally busts the short-TTL cache on the next request).
router.get('/:storeId/theme', cache, asyncHandler(storeStorefrontController.getTheme));

router.get('/:storeId/pages', cache, asyncHandler(storeStorefrontController.listPages));
router.get('/:storeId/pages/:slug', cache, asyncHandler(storeStorefrontController.getPageBySlug));

// Specific /products/* routes must be registered before the /products/:productId
// param route below, or Express would treat "featured"/"latest"/"bestsellers"
// as a productId.
router.get('/:storeId/products/featured', cache, asyncHandler(storeStorefrontController.listFeaturedProducts));
router.get('/:storeId/products/latest', cache, asyncHandler(storeStorefrontController.listLatestProducts));
router.get('/:storeId/products/bestsellers', cache, asyncHandler(storeStorefrontController.listBestSellers));

router.get('/:storeId/products', cache, asyncHandler(storeStorefrontController.listProducts));
router.get('/:storeId/products/:productId', cache, asyncHandler(storeStorefrontController.getProduct));

router.get('/:storeId/collections', cache, asyncHandler(storeStorefrontController.listCollections));
router.get('/:storeId/collections/:collectionId', cache, asyncHandler(storeStorefrontController.getCollection));

router.get('/:storeId/testimonials', cache, asyncHandler(storeStorefrontController.listTestimonials));

router.get('/:storeId/blog/posts', cache, asyncHandler(storeStorefrontController.listBlogPosts));

router.get('/:storeId/search', asyncHandler(storeStorefrontController.search));

// Checkout-adjacent public reads — Shipping step and Payment step of the
// checkout flow. Not cached: pricing (free-shipping threshold, subtotal
// bracket) depends on query params that change per-request.
router.get('/:storeId/shipping-options', asyncHandler(storeStorefrontController.listShippingOptions));
router.get('/:storeId/payment-methods', asyncHandler(storeStorefrontController.listPaymentMethods));

// The real checkout — reads the persisted cart (see cartRoutes.js),
// never a client-submitted item list.
router.post('/:storeId/checkout', asyncHandler(storeStorefrontController.checkout));

router.post('/:storeId/orders', asyncHandler(storeStorefrontController.createOrder));

// Body: { type?, sessionId?, path?, referrer?, productId?, quantity?, query? }
// type defaults to 'page_view' (StoreVisit, unchanged); also accepts
// 'product_view' | 'search' | 'cart_add' | 'checkout_start'
// (StoreAnalyticsEvent) — see storeStorefrontController.trackVisit.
router.post('/:storeId/track', asyncHandler(storeStorefrontController.trackVisit));

module.exports = router;