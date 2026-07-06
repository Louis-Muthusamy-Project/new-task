const express = require('express');
const router = express.Router();

const shippingController = require('../../controllers/store/shippingController');
const asyncHandler = require('../../utils/asyncHandler');

// Mounted under /api/store
// Admin Shipping config (Shipping Zones, Shipping Charges, Free Shipping,
// Delivery Time) used by the Shipping tab in StoresTab.jsx. One
// StoreShipping document per store; zones are a nested sub-resource.

router.get('/:storeId/admin/shipping', asyncHandler(shippingController.getShipping));
router.patch('/:storeId/admin/shipping', asyncHandler(shippingController.updateShippingSettings));
router.post('/:storeId/admin/shipping/zones', asyncHandler(shippingController.createZone));
router.patch('/:storeId/admin/shipping/zones/:zoneId', asyncHandler(shippingController.updateZone));
router.delete('/:storeId/admin/shipping/zones/:zoneId', asyncHandler(shippingController.deleteZone));

module.exports = router;
