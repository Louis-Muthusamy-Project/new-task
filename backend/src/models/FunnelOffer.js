const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * FunnelOffer — a funnel-specific presentation/pricing layer on top of a
 * Store Product, scoped to a single checkout step.
 *
 *   Store Product  →  Funnel Offer  →  Checkout
 *
 * A FunnelOffer NEVER modifies StoreProduct. It only carries what a
 * checkout step is allowed to override for display purposes (headline,
 * description, a discounted display price, a compare-at price, a badge,
 * a countdown). StoreProduct remains the single source of truth for the
 * real price/stock/title — see funnelOfferService.resolveOfferedProduct,
 * which merges a live StoreProduct with an offer at read time rather than
 * ever copying/freezing product data onto this document.
 *
 * Whether `displayPrice` is what actually gets charged at checkout is a
 * FunnelCheckoutService decision (Phase 2), not something this model or
 * its controller decides — this layer only stores the override, it does
 * not interpret it.
 *
 * One offer per checkout step (1:1) — FunnelStep.settings.offerId points
 * back here.
 */
const FunnelOfferSchema = new Schema(
  {
    funnelId: {
      type: Schema.Types.ObjectId,
      ref: 'Funnel',
      required: true,
      index: true,
    },
    stepId: {
      type: Schema.Types.ObjectId,
      ref: 'FunnelStep',
      required: true,
      index: true,
      unique: true,
    },
    // Reference only — the product this offer is dressing up. Always
    // resolved fresh from StoreProduct at read time, never copied.
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'StoreProduct',
      required: true,
      index: true,
    },
    // ── Display overrides (all optional; empty/null = fall back to the
    // live StoreProduct's own value) ──────────────────────────────────
    headline: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    // Overrides StoreProduct.price for display. Whether checkout actually
    // charges this is decided by FunnelCheckoutService, not here.
    displayPrice: { type: Number, default: null },
    compareAtPrice: { type: Number, default: null },
    badgeText: { type: String, trim: true, default: '' },
    countdown: {
      enabled: { type: Boolean, default: false },
      endsAt: { type: Date, default: null },
    },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

FunnelOfferSchema.index({ funnelId: 1, isDeleted: 1 });

module.exports = mongoose.models.FunnelOffer || mongoose.model('FunnelOffer', FunnelOfferSchema);
