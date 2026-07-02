const express = require('express');

const storeStorefrontController = require('../controllers/storeStorefrontController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Mounted under /api/store
// Public, read-only data used by the GrapesJS "Dynamic Blocks"
// (Hero, Product Grid, Featured Product, Collection, Testimonials, Search,
// Cart, Checkout, Footer) — see storeDynamicBlocks.js on the frontend.

router.get('/:storeId/info', asyncHandler(storeStorefrontController.getStoreInfo));

router.get('/:storeId/products', asyncHandler(storeStorefrontController.listProducts));
router.get('/:storeId/products/:productId', asyncHandler(storeStorefrontController.getProduct));

router.get('/:storeId/collections', asyncHandler(storeStorefrontController.listCollections));
router.get('/:storeId/collections/:collectionId', asyncHandler(storeStorefrontController.getCollection));

router.get('/:storeId/testimonials', asyncHandler(storeStorefrontController.listTestimonials));

router.get('/:storeId/search', asyncHandler(storeStorefrontController.search));

router.post('/:storeId/orders', asyncHandler(storeStorefrontController.createOrder));

router.post('/:storeId/track', asyncHandler(storeStorefrontController.trackVisit));

module.exports = router;