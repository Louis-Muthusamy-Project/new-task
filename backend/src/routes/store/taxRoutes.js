const express = require('express');
const router = express.Router();

const taxController = require('../../controllers/store/taxController');
const asyncHandler = require('../../utils/asyncHandler');

// Mounted under /api/store
// Admin Tax config (Sales tax rate / enabled / label) used by the
// "Tax & checkout" panel in StoresTab.jsx. One StoreTax document per
// store — same find-or-create "settings" pattern as shippingRoutes.js.

router.get('/:storeId/admin/tax', asyncHandler(taxController.getTax));
router.patch('/:storeId/admin/tax', asyncHandler(taxController.updateTax));

module.exports = router;
