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

    // ---- General ----
    // `name` (above) already covers "Funnel Name". These three are new,
    // additive, top-level fields -- nothing existing references them, so
    // adding them cannot break backward compatibility.
    description: { type: String, trim: true, default: '' },
    thumbnailUrl: { type: String, trim: true, default: '' },
    iconUrl: { type: String, trim: true, default: '' },

    // Funnel-level settings (tracking pixels, favicon, custom domain, etc.)
    // Mirrors Website.tracking so the builder can inject them the same way.
    // NOTE: `faviconUrl` and `domain` here are the pre-existing fields that
    // now double as "SEO -> Favicon" and "Publishing -> Custom Domain" in the
    // extended Settings UI -- reused rather than duplicated.
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

    // ---- Publishing ----
    // Custom Slug reuses the existing top-level `slug` field (below).
    // Custom Domain reuses the existing `settings.domain` field (above).
    publishing: {
      passwordProtection: {
        enabled: { type: Boolean, default: false },
        // Never stores the plaintext password -- see passwordUtils.hashPassword.
        // Format: "scrypt:<salt>:<hash>", same convention already used for
        // storefront customer accounts.
        passwordHash: { type: String, default: '' },
      },
      maintenanceMode: {
        enabled: { type: Boolean, default: false },
        message: {
          type: String,
          trim: true,
          default: 'This funnel is temporarily down for maintenance. Please check back soon.',
        },
      },
    },

    // Funnel-level SEO defaults (each step can override these).
    // `title`, `description`, and `ogImageUrl` are pre-existing -- ogImageUrl
    // now doubles as "Social Image". `settings.faviconUrl` above doubles as
    // "Favicon". New fields below are additive only.
    seo: {
      title: { type: String, trim: true, default: '' },
      description: { type: String, trim: true, default: '' },
      ogImageUrl: { type: String, trim: true, default: '' },
      keywords: { type: [String], default: [] },
      canonicalUrl: { type: String, trim: true, default: '' },
      ogEnabled: { type: Boolean, default: true },
      twitterCard: {
        type: String,
        enum: ['summary', 'summary_large_image'],
        default: 'summary_large_image',
      },
    },

    // ---- Localization ----
    localization: {
      language: { type: String, trim: true, default: 'en' },
      timezone: { type: String, trim: true, default: 'UTC' },
      currency: { type: String, trim: true, default: 'USD' },
    },

    // ---- Advanced ----
    // Distinct from settings.tracking.customHeadCode/customBodyCode, which
    // stay reserved for pixel/tracking snippets injected by that feature.
    // These are the funnel-builder's own arbitrary code injection points.
    advanced: {
      headerScripts: { type: String, default: '' },
      footerScripts: { type: String, default: '' },
      customCss: { type: String, default: '' },
      customJs: { type: String, default: '' },
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