const mongoose = require('mongoose');
const { Schema } = mongoose;

const StoreDiscountSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    code: { type: String, trim: true, uppercase: true, index: true },
    type: { type: String, enum: ['Percentage', 'Flat', 'FreeShipping'], default: 'Percentage' },
    value: { type: Number, default: 0 },
    // Order subtotal must reach this amount for the discount to apply.
    minOrderAmount: { type: Number, default: 0 },
    appliesToCollectionIds: [{ type: Schema.Types.ObjectId, ref: 'StoreCollection' }],
    appliesToProductIds: [{ type: Schema.Types.ObjectId, ref: 'StoreProduct' }],
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    startsAt: { type: Date, default: null },
    // Expiry date — discount can no longer be applied after this.
    endsAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

StoreDiscountSchema.index({ storeId: 1, code: 1 }, { unique: true, sparse: true });

module.exports =
  mongoose.models.StoreDiscount || mongoose.model('StoreDiscount', StoreDiscountSchema);