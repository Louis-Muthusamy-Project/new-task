const express = require('express');
const router = express.Router();

const discountController = require('../controllers/discountController');
const asyncHandler = require('../utils/asyncHandler');

// Mounted under /api/store
// Admin CRUD for StoreDiscount — Create / Edit / Delete (Coupon code,
// Percentage/Flat value, Expiry, Minimum Order) used by the Discounts tab
// in StoresTab.jsx.

router.get('/:storeId/admin/discounts', asyncHandler(discountController.listDiscounts));
router.post('/:storeId/admin/discounts', asyncHandler(discountController.createDiscount));
router.get('/:storeId/admin/discounts/:id', asyncHandler(discountController.getDiscount));
router.patch('/:storeId/admin/discounts/:id', asyncHandler(discountController.updateDiscount));
router.delete('/:storeId/admin/discounts/:id', asyncHandler(discountController.deleteDiscount));

module.exports = router;
