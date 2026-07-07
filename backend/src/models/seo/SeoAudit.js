const mongoose = require('mongoose');

const seoAuditSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'SeoProject', required: true, index: true },
    crawlDate: { type: Date, default: Date.now },
    urlsCrawledCount: { type: Number, default: 0 },
    scores: {
      performance: { type: Number, default: null },
      crawlability: { type: Number, default: null },
      security: { type: Number, default: null },
      onPage: { type: Number, default: null },
      mobileUsability: { type: Number, default: null },
      overall: { type: Number, default: null }
    },
    siteMap: { type: [String], default: [] },
    crawlSummary: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.models.SeoAudit || mongoose.model('SeoAudit', seoAuditSchema);
