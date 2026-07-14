const mongoose = require('mongoose');
const { Schema } = mongoose;

const StoreProductSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true, index: true },
    description: { type: String, trim: true, default: '' },
    images: { type: [String], default: [] },
    price: { type: Number, default: 0 },
    compareAtPrice: { type: Number, default: null },
    currency: { type: String, trim: true, default: 'USD' },
    sku: { type: String, trim: true, default: '' },
    inventoryQuantity: { type: Number, default: 0 },
    trackInventory: { type: Boolean, default: true },
    collectionIds: [{ type: Schema.Types.ObjectId, ref: 'StoreCollection' }],
    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Archived'],
      default: 'Draft',
      index: true,
    },
    // Shopify-style variants and options support
    options: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          values: { type: [String], default: [] },
        }
      ],
      default: []
    },
    variants: {
      type: [
        {
          _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
          title: { type: String, required: true }, // e.g. "S / Red"
          price: { type: Number, default: 0 },
          compareAtPrice: { type: Number, default: null },
          sku: { type: String, trim: true, default: '' },
          inventoryQuantity: { type: Number, default: 0 },
          optionValues: { type: Map, of: String }, // e.g. { Size: "S", Color: "Red" }
        }
      ],
      default: []
    },
    // ── SEO ──────────────────────────────────────────────────────────────
    seo: {
      metaTitle: { type: String, trim: true, default: '' },
      metaDescription: { type: String, trim: true, default: '' },
    },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

StoreProductSchema.index({ storeId: 1, slug: 1 }, { unique: true, sparse: true });
StoreProductSchema.index({ storeId: 1, status: 1 });
StoreProductSchema.index({ title: 'text', description: 'text' });

module.exports =
  mongoose.models.StoreProduct || mongoose.model('StoreProduct', StoreProductSchema);