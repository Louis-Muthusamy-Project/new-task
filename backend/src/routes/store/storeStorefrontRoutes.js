const express = require('express');

const storeStorefrontController = require('../../controllers/store/storeStorefrontController');
const asyncHandler = require('../../utils/asyncHandler');
const { storeReadCache } = require('../../middlewares/storeCache');

const router = express.Router();

// Mounted under /api/store
// Public, read-only data used by the GrapesJS "Dynamic Blocks"
// (Hero, Product Grid, Featured Product, Collection, Testimonials, Search,
// Cart, Checkout, Footer) — see storeDynamicBlocks.js on the frontend.
//
// Caching: these reads are the highest-traffic part of a live storefront
// (every page load re-fetches info/products/collections/testimonials) and
// change far less often than they're read, so they run through
// storeReadCache — a short TTL in-memory cache plus a Cache-Control header
// for any CDN/browser cache sitting in front of the API. Search and the
// two write routes (orders, track) are intentionally left uncached.
const cache = storeReadCache();

router.get('/:storeId/info', cache, asyncHandler(storeStorefrontController.getStoreInfo));

router.get('/:storeId/products', cache, asyncHandler(storeStorefrontController.listProducts));
router.get('/:storeId/products/:productId', cache, asyncHandler(storeStorefrontController.getProduct));

router.get('/:storeId/collections', cache, asyncHandler(storeStorefrontController.listCollections));
router.get('/:storeId/collections/:collectionId', cache, asyncHandler(storeStorefrontController.getCollection));

router.get('/:storeId/testimonials', cache, asyncHandler(storeStorefrontController.listTestimonials));

router.get('/:storeId/search', asyncHandler(storeStorefrontController.search));

router.post('/:storeId/orders', asyncHandler(storeStorefrontController.createOrder));

router.post('/:storeId/track', asyncHandler(storeStorefrontController.trackVisit));

module.exports = router;