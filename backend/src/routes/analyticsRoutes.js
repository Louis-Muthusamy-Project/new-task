const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analyticsController');
const asyncHandler = require('../utils/asyncHandler');

// Mounted under /api/store
// Admin Analytics (Visitors, Sales, Orders, Revenue, Conversion + Top
// products) used by the Analytics tab in StoresTab.jsx. Computed on the
// fly from StoreOrder + StoreVisit — no settings document to persist.

router.get('/:storeId/admin/analytics', asyncHandler(analyticsController.getAnalytics));

module.exports = router;
