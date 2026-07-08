const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * StoreCart.js
 *
 * The persisted cart — this is the whole point of "cart must not exist
 * only in React state." Every add/update/remove goes through
 * CartService, which reads and writes this document; the frontend only
 * ever holds a `guestToken` (localStorage) or a customer JWT, never the
 * cart contents themselves. Reload the page, switch devices (once logged
 * in), or come back tomorrow — the cart is still here.
 *
 * Ownership is exactly one of two shapes, matching the "guest cart" vs
 * "logged-in cart" requirement:
 *   - guestToken set,  customerId null   → anonymous shopper's cart
 *   - customerId set,  guestToken null   → a signed-in customer's cart
 * CartService.mergeGuestIntoCustomer() is what moves a shopper from the
 * first shape to the second at login, folding quantities together.
 *
 * Only `productId` + `quantity` are stored per line — price, title,
 * image, and in-stock state are always re-read live from StoreProduct at
 * cart-view and checkout time (same "never trust a stored price" rule
 * OrderService already follows), so a price change or a product going
 * out of stock is reflected immediately, not frozen at add-to-cart time.
 */

const StoreCartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'StoreProduct', required: true },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const StoreCartAddressSchema = new Schema(
  {
    firstName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
    line1: { type: String, trim: true, default: '' },
    line2: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    postalCode: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const StoreCartSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    // Exactly one of these is set — enforced in CartService, not here,
    // since Mongoose validators can't easily express "exactly one of".
    guestToken: { type: String, default: null, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'StoreCustomer', default: null, index: true },

    items: { type: [StoreCartItemSchema], default: [] },

    // Checkout-in-progress state, persisted on the same document so a
    // refresh mid-checkout (Shipping step filled in, not yet on Payment)
    // doesn't lose anything either — this is "persist the cart," not just
    // "persist the line items."
    contactEmail: { type: String, trim: true, lowercase: true, default: '' },
    shippingAddress: { type: StoreCartAddressSchema, default: () => ({}) },
    discountCode: { type: String, trim: true, uppercase: true, default: '' },
    shippingChoice: {
      zoneId: { type: Schema.Types.ObjectId, default: null },
      rateName: { type: String, trim: true, default: '' },
      price: { type: Number, default: 0 },
    },
    paymentMethod: { type: String, trim: true, default: '' },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// A store can have at most one active guest cart per guest token, and at
// most one active cart per customer — this is what makes
// getOrCreateCart(...) idempotent instead of spawning duplicate carts.
StoreCartSchema.index(
  { storeId: 1, guestToken: 1 },
  { unique: true, partialFilterExpression: { guestToken: { $type: 'string' } } }
);
StoreCartSchema.index(
  { storeId: 1, customerId: 1 },
  { unique: true, partialFilterExpression: { customerId: { $type: 'objectId' } } }
);

module.exports = mongoose.models.StoreCart || mongoose.model('StoreCart', StoreCartSchema);
