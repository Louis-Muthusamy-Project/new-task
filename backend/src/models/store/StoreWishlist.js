const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * StoreWishlist.js
 *
 * The persisted wishlist — promotes the saved-product-id set out of
 * client-only localStorage (see the former hooks/useWishlist.js) into
 * the Store module proper, exactly the way StoreCart already made "the
 * cart" a real backend document instead of component state. Same
 * ownership shape as StoreCart:
 *   - guestToken set,  customerId null   → anonymous shopper's wishlist
 *   - customerId set,  guestToken null   → a signed-in customer's wishlist
 * WishlistService.mergeGuestIntoCustomer() moves a shopper from the first
 * shape to the second at login, folding product ids together — same
 * "merge on login" contract CartService already implements, applied here
 * rather than re-invented.
 *
 * Only `productId` is stored per entry — title/price/image/availability
 * are always re-read live from StoreProduct when the wishlist is viewed
 * (WishlistService.getWishlistView), the same "never trust a stored
 * snapshot" rule Cart/Order already follow.
 */

const StoreWishlistSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    guestToken: { type: String, default: null, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'StoreCustomer', default: null, index: true },

    productIds: { type: [{ type: Schema.Types.ObjectId, ref: 'StoreProduct' }], default: [] },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Same "at most one active wishlist per identity" contract as StoreCart —
// what makes getOrCreateWishlist(...) idempotent.
StoreWishlistSchema.index(
  { storeId: 1, guestToken: 1 },
  { unique: true, partialFilterExpression: { guestToken: { $type: 'string' } } }
);
StoreWishlistSchema.index(
  { storeId: 1, customerId: 1 },
  { unique: true, partialFilterExpression: { customerId: { $type: 'objectId' } } }
);

module.exports = mongoose.models.StoreWishlist || mongoose.model('StoreWishlist', StoreWishlistSchema);
