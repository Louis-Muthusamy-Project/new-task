const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * StoreTemplate.js — mirrors models/WebsiteTemplate.js.
 * A library entry describing an uploaded store-template ZIP: its pages are
 * stored as a lightweight snapshot here for fast library rendering, while
 * the full parsed content lives in StorePage once a Store is created from it.
 */
const TemplatePageDefinitionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, default: '' },
    isHome: { type: Boolean, default: false },
    content: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const StoreTemplateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
      enum: [
        'Automotive',
        'Baby & Kids',
        'Beauty & Personal Care',
        'Electronics',
        'Fashion & Apparel',
        'Grocery & Food',
        'Health & Wellness',
        'Home & Living',
        'Other',
      ],
      default: 'Other',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      default: '',
    },
    templateZipCloudinaryUrl: {
      type: String,
      trim: true,
      default: '',
    },
    pages: {
      type: [TemplatePageDefinitionSchema],
      default: [],
    },
    // Which roles uploaded / own this library entry — kept for auditing since
    // uploads are restricted to admin / superadmin on the frontend.
    uploadedByRole: {
      type: String,
      trim: true,
      default: '',
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

StoreTemplateSchema.index({ category: 1, isActive: 1 });
StoreTemplateSchema.index({ name: 'text', description: 'text' });

module.exports =
  mongoose.models.StoreTemplate || mongoose.model('StoreTemplate', StoreTemplateSchema);
