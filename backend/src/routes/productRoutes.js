const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const asyncHandler = require('../utils/asyncHandler');

// Mounted under /api/store
// Admin CRUD for StoreProduct — Create / Edit / Delete, Images, Inventory,
// Price, SEO. Kept under /admin/products so it never collides with the
// public, read-only /:storeId/products routes in storeStorefrontRoutes.js.

router.get('/:storeId/admin/products', asyncHandler(productController.listProducts));
router.post('/:storeId/admin/products', asyncHandler(productController.createProduct));
router.get('/:storeId/admin/products/:id', asyncHandler(productController.getProduct));
router.patch('/:storeId/admin/products/:id', asyncHandler(productController.updateProduct));
router.delete('/:storeId/admin/products/:id', asyncHandler(productController.deleteProduct));

module.exports = router;
