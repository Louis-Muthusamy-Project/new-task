const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * FunnelAnalyticsEvent — funnel visitor and conversion event tracking.
 *
 * Mirrors StoreAnalyticsEvent.js but scoped to Funnels.
 * Each record represents a single trackable event on a funnel step:
 *   - view:         A visitor loaded the step page.
 *   - conversion:   A visitor completed the step's primary CTA.
 *   - form_submit:  A form was submitted on the step.
 *   - order:        A purchase was completed on a checkout step.
 *
 * Events are written by the public funnel renderer (when deployed).
 * The funnelAnalyticsController aggregates these into the dashboard KPIs.
 */
const FunnelAnalyticsEventSchema = new Schema(
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
      default: null,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['view', 'conversion', 'form_submit', 'order'],
      required: true,
      index: true,
    },
    sessionId: { type: String, trim: true, default: '' },
    // Revenue only set for 'order' events.
    revenue: { type: Number, default: 0 },
    currency: { type: String, trim: true, default: 'USD' },
    utm: {
      source: { type: String, trim: true, default: '' },
      medium: { type: String, trim: true, default: '' },
      campaign: { type: String, trim: true, default: '' },
    },
    referrer: { type: String, trim: true, default: '' },
    // The StoreOrder that caused an 'order' event (for cross-module linking).
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'StoreOrder',
      default: null,
    },
  },
  { timestamps: true }
);

FunnelAnalyticsEventSchema.index({ funnelId: 1, eventType: 1 });
FunnelAnalyticsEventSchema.index({ funnelId: 1, stepId: 1, eventType: 1 });
FunnelAnalyticsEventSchema.index({ funnelId: 1, createdAt: -1 });

module.exports =
  mongoose.models.FunnelAnalyticsEvent ||
  mongoose.model('FunnelAnalyticsEvent', FunnelAnalyticsEventSchema);
