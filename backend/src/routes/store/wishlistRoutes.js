const express = require('express');
const router = express.Router();

const wishlistController = require('../../controllers/store/wishlistController');
const asyncHandler = require('../../utils/asyncHandler');

// Mounted under /api/store
// Public, persisted-wishlist endpoints — same guest/signed-in identity
// contract as cartRoutes.js (X-Guest-Token header or Authorization: Bearer).

router.get('/:storeId/wishlist', asyncHandler(wishlistController.getWishlist));
router.post('/:storeId/wishlist/items', asyncHandler(wishlistController.addItem));
router.post('/:storeId/wishlist/toggle', asyncHandler(wishlistController.toggleItem));
router.delete('/:storeId/wishlist/items/:productId', asyncHandler(wishlistController.removeItem));
router.delete('/:storeId/wishlist', asyncHandler(wishlistController.clearWishlist));

// Called once, right after login/register succeeds — folds a guest
// wishlist's items into the now-signed-in customer's wishlist.
router.post('/:storeId/wishlist/merge', asyncHandler(wishlistController.mergeWishlist));

module.exports = router;
