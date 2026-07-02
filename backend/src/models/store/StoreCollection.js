const mongoose = require('mongoose');
const { Schema } = mongoose;

const StoreCollectionSchema = new Schema(
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
    imageUrl: { type: String, trim: true, default: '' },
    productIds: [{ type: Schema.Types.ObjectId, ref: 'StoreProduct' }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

StoreCollectionSchema.index({ storeId: 1, slug: 1 }, { unique: true, sparse: true });

module.exports =
  mongoose.models.StoreCollection || mongoose.model('StoreCollection', StoreCollectionSchema);
