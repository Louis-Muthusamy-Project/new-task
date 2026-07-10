const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * FunnelStep — analogous to WebsitePage.js.
 *
 * Every step is a standalone GrapesJS-editable page within a funnel.
 * The `type` field categorises what the step does (landing, checkout, etc.)
 * and drives how the FunnelsTab UI renders it. The actual HTML/CSS editor
 * content lives in `content` — same shape as WebsitePage.content.
 *
 * For checkout steps, `settings.productId` references the StoreProduct
 * that will be purchased. The product is NEVER copied — it is always
 * a reference to the Store's canonical product.
 */
const FunnelStepSchema = new Schema(
  {
    funnelId: {
      type: Schema.Types.ObjectId,
      ref: 'Funnel',
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
    // Defines the role / purpose of this step in the conversion flow.
    type: {
      type: String,
      enum: [
        'landing',    // Top-of-funnel landing / squeeze page
        'sales',      // Long-form sales page
        'checkout',   // Checkout / order form (links to StoreProduct)
        'upsell',     // One-click upsell offer
        'downsell',   // Downsell / alternative offer
        'thankyou',   // Post-purchase thank-you page
        'optin',      // Email opt-in / lead capture
        'webinar',    // Webinar registration / replay
        'appointment',// Booking / calendar page
        'custom',     // Any other step type
      ],
      default: 'landing',
      index: true,
    },
    // Display order within the funnel (1-indexed, ascending).
    position: {
      type: Number,
      default: 1,
      index: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
      index: true,
      set: (v) => {
        if (!v) return 'Draft';
        const s = String(v);
        if (s.toLowerCase() === 'published') return 'Published';
        return 'Draft';
      },
    },
    // GrapesJS builder output — same shape as WebsitePage.content.
    content: {
      type: Schema.Types.Mixed,
      default: null,
    },
    seo: {
      title: { type: String, trim: true, default: '' },
      description: { type: String, trim: true, default: '' },
      ogImageUrl: { type: String, trim: true, default: '' },
    },
    // Step-specific configuration. Kept flexible (Mixed) so each step type
    // can store what it needs without a rigid nested schema.
    settings: {
      // For checkout steps: which StoreProduct to sell.
      // Always a reference — never a copy. The Store owns the product.
      storeId: { type: Schema.Types.ObjectId, ref: 'Store', default: null },
      productId: { type: Schema.Types.ObjectId, ref: 'StoreProduct', default: null },
      // After a form submit or purchase, redirect to this step (by stepId)
      // or an external URL. Leave null to advance to the next step by position.
      nextStepId: { type: Schema.Types.ObjectId, ref: 'FunnelStep', default: null },
      redirectUrl: { type: String, trim: true, default: '' },
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

// Slug must be unique within a funnel (including soft-deleted docs because
// the unique index covers all documents — same reason as WebsitePage).
FunnelStepSchema.index({ funnelId: 1, slug: 1 }, { unique: true });
FunnelStepSchema.index({ funnelId: 1, position: 1 });
FunnelStepSchema.index({ funnelId: 1, status: 1 });

module.exports = mongoose.models.FunnelStep || mongoose.model('FunnelStep', FunnelStepSchema);
