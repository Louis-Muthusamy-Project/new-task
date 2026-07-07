const mongoose = require('mongoose');

const seoProjectSchema = new mongoose.Schema(
  {
    websiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Website', default: null },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    siteUrl: { type: String, required: true, trim: true },
    cms: { type: String, default: 'custom' },
    status: { type: String, enum: ['Active', 'Completed', 'Paused'], default: 'Active' },
    phase: {
      type: String,
      enum: ['intake', 'audit', 'strategy', 'implementation', 'reaudit', 'report', 'monitoring', 'complete'],
      default: 'intake'
    },
    phasesCompleted: { type: [String], default: [] },
    approvals: {
      strategyApproved: { type: Boolean, default: false },
      strategyApprovedBy: { type: String, default: null },
      strategyApprovedAt: { type: Date, default: null },
      pages: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} } // Map of pageId to approval details { appliedAt, by }
    },
    targets: {
      goals: { type: [String], default: [] },
      primaryKeywords: { type: [String], default: [] },
      competitors: { type: [String], default: [] },
      locationCode: { type: Number, default: 2840 }, // US
      languageCode: { type: String, default: 'en' }
    },
    tools: {
      dataforseo: { type: Boolean, default: false },
      gsc: { type: Boolean, default: false },
      ga4: { type: Boolean, default: false },
      wordpress: { type: Boolean, default: false }
    },
    credentials: {
      wpSiteUrl: { type: String, default: '' },
      wpUser: { type: String, default: '' },
      wpAppPassword: { type: String, default: '' },
      gscSiteUrl: { type: String, default: '' },
      ga4PropertyId: { type: String, default: '' },
      sfCli: { type: String, default: '' },
      gscCredentials: { type: String, default: '' }, // JSON representation of SA key
      ga4Credentials: { type: String, default: '' } // JSON representation of SA key
    }
  },
  { timestamps: true }
);

seoProjectSchema.index({ slug: 1 });
seoProjectSchema.index({ websiteId: 1 });

module.exports = mongoose.models.SeoProject || mongoose.model('SeoProject', seoProjectSchema);
