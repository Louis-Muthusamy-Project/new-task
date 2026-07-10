const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * FunnelContact — lead/contact captured from a funnel step form submission.
 *
 * Every form submit inside a funnel step writes one of these records.
 * The record stores the source funnel, source step, UTM parameters, and
 * whatever fields the form collected. This is intentionally separate from
 * the Submission model (which belongs to the Forms module) and from the CRM
 * (which is currently a UI-only stub without a backend API).
 *
 * When the CRM backend is implemented, a bridge job can migrate/sync these
 * records — for now FunnelContact is the authoritative contact store for
 * funnel-originated leads.
 */
const FunnelContactSchema = new Schema(
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
    // Core identity fields — extracted from form data for quick lookup.
    email: { type: String, trim: true, lowercase: true, default: '' },
    name: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    // Raw form field values as key-value pairs.
    data: { type: Schema.Types.Mixed, default: {} },
    // UTM attribution — copied from the visitor's query string at submission.
    utm: {
      source: { type: String, trim: true, default: '' },
      medium: { type: String, trim: true, default: '' },
      campaign: { type: String, trim: true, default: '' },
      term: { type: String, trim: true, default: '' },
      content: { type: String, trim: true, default: '' },
    },
    referrer: { type: String, trim: true, default: '' },
    tags: { type: [String], default: [] },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

FunnelContactSchema.index({ funnelId: 1, email: 1 });
FunnelContactSchema.index({ funnelId: 1, createdAt: -1 });

module.exports = mongoose.models.FunnelContact || mongoose.model('FunnelContact', FunnelContactSchema);
