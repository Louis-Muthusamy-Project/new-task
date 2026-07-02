const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * StoreTestimonial.js — customer quotes/reviews shown by the storefront's
 * "Testimonials" block (Website Builder → Dynamic Blocks).
 *
 * Deliberately simple/flat (no relation to StoreOrder/StoreCustomer) since
 * testimonials are curated content the merchant enters directly, not a
 * byproduct of an actual purchase or review pipeline.
 */
const StoreTestimonialSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    customerName: { type: String, trim: true, required: true },
    customerTitle: { type: String, trim: true, default: '' }, // e.g. "Verified buyer", "Los Angeles, CA"
    avatarUrl: { type: String, trim: true, default: '' },
    quote: { type: String, trim: true, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    productId: { type: Schema.Types.ObjectId, ref: 'StoreProduct', default: null },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

StoreTestimonialSchema.index({ storeId: 1, isActive: 1, sortOrder: 1 });

module.exports =
  mongoose.models.StoreTestimonial || mongoose.model('StoreTestimonial', StoreTestimonialSchema);
