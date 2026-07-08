const express = require('express');
const router = express.Router();

const cartController = require('../../controllers/store/cartController');
const asyncHandler = require('../../utils/asyncHandler');

// Mounted under /api/store
// Public, persisted-cart endpoints — a guest identifies via the
// X-Guest-Token header, a signed-in shopper via Authorization: Bearer.
// See cartController.resolveIdentity / cartService.js.

router.get('/:storeId/cart', asyncHandler(cartController.getCart));
router.post('/:storeId/cart/items', asyncHandler(cartController.addItem));
router.patch('/:storeId/cart/items/:productId', asyncHandler(cartController.updateItem));
router.delete('/:storeId/cart/items/:productId', asyncHandler(cartController.removeItem));
router.delete('/:storeId/cart', asyncHandler(cartController.clearCart));

router.post('/:storeId/cart/discount', asyncHandler(cartController.applyDiscount));
router.delete('/:storeId/cart/discount', asyncHandler(cartController.removeDiscount));

router.patch('/:storeId/cart/contact', asyncHandler(cartController.setContact));
router.post('/:storeId/cart/shipping', asyncHandler(cartController.setShipping));
router.post('/:storeId/cart/payment-method', asyncHandler(cartController.setPaymentMethod));

// Called once, right after login/register succeeds — folds a guest
// cart's items into the now-signed-in customer's cart.
router.post('/:storeId/cart/merge', asyncHandler(cartController.mergeCart));

module.exports = router;
