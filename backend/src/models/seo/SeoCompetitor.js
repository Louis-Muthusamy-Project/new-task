const mongoose = require('mongoose');

const seoCompetitorSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'SeoProject', required: true, index: true },
    domain: { type: String, required: true, trim: true },
    name: { type: String, trim: true, default: '' },
    visibilityScore: { type: Number, default: 0 },
    organicTraffic: { type: Number, default: 0 },
    sharedKeywordsCount: { type: Number, default: 0 },
    authorityScore: { type: Number, default: 0 },
    topKeywords: { type: [String], default: [] }
  },
  { timestamps: true }
);

seoCompetitorSchema.index({ projectId: 1, domain: 1 }, { unique: true });

module.exports = mongoose.models.SeoCompetitor || mongoose.model('SeoCompetitor', seoCompetitorSchema);
