const express = require('express');
const router = express.Router();

const customerAuthController = require('../../controllers/store/customerAuthController');
const asyncHandler = require('../../utils/asyncHandler');

// Mounted under /api/store
// Public storefront customer auth (register/login/me) — a real shopper
// account, distinct from the internal agency dashboard's SignIn. Backs
// the "logged-in cart" + "merge carts after login" requirement.

router.post('/:storeId/auth/register', asyncHandler(customerAuthController.register));
router.post('/:storeId/auth/login', asyncHandler(customerAuthController.login));
router.get('/:storeId/auth/me', asyncHandler(customerAuthController.me));

module.exports = router;
