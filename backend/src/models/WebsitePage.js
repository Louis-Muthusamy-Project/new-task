const mongoose = require('mongoose');
const { Schema } = mongoose;

const WebsitePageSchema = new Schema(
  {
    websiteId: {
      type: Schema.Types.ObjectId,
      ref: 'Website',
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
      // Normalize possible casing mismatch coming from imports.
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

WebsitePageSchema.index({ websiteId: 1, slug: 1 }, { unique: true });
WebsitePageSchema.index({ websiteId: 1, isHome: 1 });
WebsitePageSchema.index({ websiteId: 1, status: 1 });

module.exports = mongoose.models.WebsitePage || mongoose.model('WebsitePage', WebsitePageSchema);
