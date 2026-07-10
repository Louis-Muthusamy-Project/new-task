const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * FunnelTemplate — reusable funnel blueprints, analogous to StoreTemplate.js.
 *
 * A template stores the funnel structure (ordered step configs with types,
 * names, and placeholder content). When a user creates a funnel from a
 * template, the funnelController clones the step structure and creates real
 * FunnelStep documents — the template itself is never modified.
 */
const FunnelTemplateStepSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    type: {
      type: String,
      enum: ['landing', 'sales', 'checkout', 'upsell', 'downsell', 'thankyou', 'optin', 'webinar', 'appointment', 'custom'],
      default: 'landing',
    },
    position: { type: Number, default: 1 },
    // Optional starter content for this step type (HTML/CSS scaffold).
    content: { type: Schema.Types.Mixed, default: null },
    slug: { type: String, trim: true, lowercase: true, default: '' },
  },
  { _id: false }
);

const FunnelTemplateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: [
        'Lead Generation',
        'Sales',
        'Course',
        'Agency',
        'Appointment',
        'Webinar',
        'Ecommerce',
        'Other',
      ],
      default: 'Other',
      index: true,
    },
    thumbnailUrl: { type: String, trim: true, default: '' },
    // Ordered list of step blueprints that will be cloned on install.
    steps: { type: [FunnelTemplateStepSchema], default: [] },
    tags: { type: [String], default: [] },
    // System templates ship with the app; user-created ones are not system.
    isSystem: { type: Boolean, default: false, index: true },
    isFavourite: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

FunnelTemplateSchema.index({ name: 'text', description: 'text' });
FunnelTemplateSchema.index({ category: 1, isSystem: 1 });

module.exports = mongoose.models.FunnelTemplate || mongoose.model('FunnelTemplate', FunnelTemplateSchema);
