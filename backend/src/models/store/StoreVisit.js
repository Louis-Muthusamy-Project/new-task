const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * One document per storefront pageview, tagged with a client-generated
 * sessionId. Deliberately minimal — no PII, no full path history — this
 * exists purely to power the Analytics tab's Visitors count (distinct
 * sessionId within a date range) and Conversion rate (paid orders ÷
 * visitors) in StoresTab.jsx. Written by the public
 * POST /api/store/:storeId/track endpoint (storeStorefrontController.js),
 * which every live storefront page pings once on load.
 */
const StoreVisitSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    sessionId: { type: String, trim: true, required: true },
    path: { type: String, trim: true, default: '/' },
    referrer: { type: String, trim: true, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

StoreVisitSchema.index({ storeId: 1, createdAt: 1 });
StoreVisitSchema.index({ storeId: 1, sessionId: 1 });

module.exports = mongoose.models.StoreVisit || mongoose.model('StoreVisit', StoreVisitSchema);
