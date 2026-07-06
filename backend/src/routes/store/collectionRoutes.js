const express = require('express');
const router = express.Router();

const collectionController = require('../../controllers/store/collectionController');
const asyncHandler = require('../../utils/asyncHandler');

// Mounted under /api/store
// Admin CRUD for StoreCollection — Create / Edit / Delete, plus linking
// StoreProduct documents via productIds. Kept under /admin/collections so
// it never collides with the public, read-only /:storeId/collections
// routes in storeStorefrontRoutes.js.

router.get('/:storeId/admin/collections', asyncHandler(collectionController.listCollections));
router.post('/:storeId/admin/collections', asyncHandler(collectionController.createCollection));
router.get('/:storeId/admin/collections/:id', asyncHandler(collectionController.getCollection));
router.patch('/:storeId/admin/collections/:id', asyncHandler(collectionController.updateCollection));
router.delete('/:storeId/admin/collections/:id', asyncHandler(collectionController.deleteCollection));

module.exports = router;
