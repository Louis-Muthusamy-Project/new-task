const mongoose = require('mongoose');
const { Schema } = mongoose;

const FunnelSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft',
      index: true,
    },
    // Which funnel template was used when creating this funnel (optional).
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'FunnelTemplate',
      default: null,
    },
    // Funnel-level settings (tracking pixels, favicon, custom domain, etc.)
    // Mirrors Website.tracking so the builder can inject them the same way.
    settings: {
      faviconUrl: { type: String, trim: true, default: '' },
      domain: { type: String, trim: true, default: '' },
      tracking: {
        metaPixelId: { type: String, trim: true, default: '' },
        ga4Id: { type: String, trim: true, default: '' },
        gtmId: { type: String, trim: true, default: '' },
        tiktokPixelId: { type: String, trim: true, default: '' },
        customHeadCode: { type: String, default: '' },
        customBodyCode: { type: String, default: '' },
      },
    },
    // Funnel-level SEO defaults (each step can override these).
    seo: {
      title: { type: String, trim: true, default: '' },
      description: { type: String, trim: true, default: '' },
      ogImageUrl: { type: String, trim: true, default: '' },
    },
    // Dashboard organization — mirrors StoreProduct.tags for the same
    // "array of trimmed strings" convention used across the app.
    tags: { type: [String], default: [] },
    // Starred/pinned funnels in the dashboard list.
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Snapshot display name of whoever created the funnel. There is no
    // User collection wired up yet (admin routes carry no jwtMiddleware —
    // see funnelRoutes.js), so this intentionally stores a plain string
    // captured at creation time rather than a `ref: 'User'` ObjectId that
    // could never be populated. Falls back to '' when unknown.
    createdBy: { type: String, trim: true, default: '' },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

FunnelSchema.index({ ownerId: 1, status: 1 });
FunnelSchema.index({ teamId: 1, status: 1 });
FunnelSchema.index({ name: 'text' });
FunnelSchema.index({ tags: 1 });

module.exports = mongoose.models.Funnel || mongoose.model('Funnel', FunnelSchema);