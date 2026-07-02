const express = require('express');
const router = express.Router();

const { createStoreFromTemplate, createStore } = require('../controllers/storeController');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/store  (Body: { storeName, currency, status, description })
// "Start from scratch" flow — plain Store record, no template/pages/products.
router.post('/', asyncHandler(createStore));

// POST /api/store/create-from-template
// Body: { templateId, storeName, currency, status, installDemo, description }
// Flow: Choose Template -> Clone Template -> Create Store ->
//       Create Default Pages -> Copy Demo Products -> Return Store
router.post('/create-from-template', createStoreFromTemplate);

module.exports = router;