const mongoose = require('mongoose');

const seoContentSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'SeoProject', required: true, index: true },
    pageUrl: { type: String, required: true },
    existingPageId: { type: String, default: null }, // Maps to site page if internal
    keyword: { type: String, default: '' },
    draftTitle: { type: String, default: '' },
    draftExcerpt: { type: String, default: '' },
    draftBody: { type: String, default: '' }, // AI written + humanized HTML/text content
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    schemaMarkup: { type: String, default: '' }, // JSON string of JSON-LD Schema
    redirects: [
      {
        fromUrl: { type: String, trim: true },
        toUrl: { type: String, trim: true }
      }
    ],
    approvalStatus: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'skipped', 'published'],
      default: 'draft',
      index: true
    },
    publishLog: [
      {
        publishedAt: { type: Date, default: Date.now },
        status: { type: String, default: 'success' },
        error: { type: String, default: '' },
        reverted: { type: Boolean, default: false },
        revertedAt: { type: Date, default: null }
      }
    ],
    brandNotes: { type: String, default: '' }
  },
  { timestamps: true }
);

seoContentSchema.index({ projectId: 1, pageUrl: 1 }, { unique: true });

module.exports = mongoose.models.SeoContent || mongoose.model('SeoContent', seoContentSchema);
