const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * One document per storefront funnel event, beyond the plain pageview
 * pings already captured by StoreVisit. Deliberately a *second*, narrower
 * model rather than folding everything into StoreVisit: pageviews are
 * written on every single navigation (highest write volume, no payload),
 * while these are written only for the handful of funnel-meaningful
 * moments (viewed a product, ran a search, added to cart, started
 * checkout) and carry a small typed payload the pageview log doesn't need.
 *
 * Purchases/Revenue deliberately are NOT duplicated in here — StoreOrder
 * is already the single source of truth for a completed sale (see
 * analyticsController.js), so this model only needs to cover the funnel
 * steps that happen *before* an order exists.
 *
 * Written by the public POST /api/store/:storeId/track endpoint
 * (storeStorefrontController.trackEvent), same trust boundary and no-PII
 * posture as StoreVisit — sessionId only, no name/email/IP.
 */
const EVENT_TYPES = ['product_view', 'search', 'cart_add', 'checkout_start'];

const StoreAnalyticsEventSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    type: { type: String, enum: EVENT_TYPES, required: true, index: true },
    sessionId: { type: String, trim: true, default: '' },

    // product_view / cart_add
    productId: { type: Schema.Types.ObjectId, ref: 'StoreProduct', default: null },
    quantity: { type: Number, default: 1 },

    // search
    query: { type: String, trim: true, default: '' },
    resultCount: { type: Number, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

StoreAnalyticsEventSchema.index({ storeId: 1, type: 1, createdAt: 1 });
StoreAnalyticsEventSchema.index({ storeId: 1, type: 1, productId: 1 });

StoreAnalyticsEventSchema.statics.EVENT_TYPES = EVENT_TYPES;

module.exports =
  mongoose.models.StoreAnalyticsEvent || mongoose.model('StoreAnalyticsEvent', StoreAnalyticsEventSchema);
