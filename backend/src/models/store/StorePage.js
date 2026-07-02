const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * StorePage.js — mirrors models/WebsitePage.js.
 * Holds the parsed HTML/CSS content for one page of a Store, produced by
 * the same import-engine pipeline used for websites
 * (see controllers/storeTemplateController.js).
 */
const StorePageSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    isHome: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'draft', 'published'],
      default: 'Draft',
      index: true,
      set: (v) => {
        if (!v) return 'Draft';
        const s = String(v);
        if (s.toLowerCase() === 'draft') return 'Draft';
        if (s.toLowerCase() === 'published') return 'Published';
        return s;
      },
    },
    content: {
      type: Schema.Types.Mixed,
      default: null,
    },
    seo: {
      title: { type: String, trim: true, default: '' },
      description: { type: String, trim: true, default: '' },
      ogImageUrl: { type: String, trim: true, default: '' },
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

StorePageSchema.index({ storeId: 1, slug: 1 }, { unique: true });
StorePageSchema.index({ storeId: 1, isHome: 1 });
StorePageSchema.index({ storeId: 1, status: 1 });

module.exports = mongoose.models.StorePage || mongoose.model('StorePage', StorePageSchema);
