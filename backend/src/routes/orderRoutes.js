const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const asyncHandler = require('../utils/asyncHandler');

// Mounted under /api/store
// Admin CRUD for StoreOrder — List / View / Update Status / Delete used by
// the Orders tab in StoresTab.jsx. Orders are created by the storefront
// checkout flow (see storeStorefrontController.createOrder), not here.

router.get('/:storeId/admin/orders', asyncHandler(orderController.listOrders));
router.get('/:storeId/admin/orders/:id', asyncHandler(orderController.getOrder));
router.patch('/:storeId/admin/orders/:id/status', asyncHandler(orderController.updateOrderStatus));
router.delete('/:storeId/admin/orders/:id', asyncHandler(orderController.deleteOrder));

module.exports = router;
