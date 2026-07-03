const express = require('express');
const router = express.Router();

const { createStoreFromTemplate, createStore, previewStore } = require('../controllers/storeController');
const storePublishController = require('../controllers/storePublishController');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/store  (Body: { storeName, currency, status, description })
// "Start from scratch" flow — plain Store record, no template/pages/products.
router.post('/', asyncHandler(createStore));

// POST /api/store/create-from-template
// Body: { templateId, storeName, currency, status, installDemo, description }
// Flow: Choose Template -> Clone Template -> Create Store ->
//       Create Default Pages -> Copy Demo Products -> Return Store
router.post('/create-from-template', createStoreFromTemplate);

// GET /api/store/:id/preview
// Store-module counterpart of GET /api/website-builder/websites/:id/preview.
// Returns { store, pages } for the Store Preview module (Desktop/Tablet/
// Mobile) on the Home tab of StoresTab.jsx.
router.get('/:id/preview', asyncHandler(previewStore));

// POST /api/store/:id/publish
// Store-module counterpart of POST /website-builder/websites/:websiteId/publish.
// Runs the Publish pipeline (Generate Build -> Upload Assets -> Save ->
// Live URL) for the Publish module on the Home tab of StoresTab.jsx.
router.post('/:id/publish', asyncHandler(storePublishController.publishStore));

module.exports = router;