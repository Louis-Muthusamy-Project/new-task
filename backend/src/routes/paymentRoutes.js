const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const asyncHandler = require('../utils/asyncHandler');

// Mounted under /api/store
// Admin Payments config (Razorpay, Stripe, PayPal, Cash on Delivery) used
// by the Payments tab in StoresTab.jsx. One StorePayment document per
// store; each gateway is an independently-togglable sub-resource.

router.get('/:storeId/admin/payments', asyncHandler(paymentController.getPayments));
router.patch('/:storeId/admin/payments', asyncHandler(paymentController.updateSettings));
router.patch('/:storeId/admin/payments/:method', asyncHandler(paymentController.updateMethod));

module.exports = router;
