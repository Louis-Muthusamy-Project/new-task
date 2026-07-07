const mongoose = require('mongoose');

const seoKeywordHistorySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  position: { type: Number, default: null },
  volume: { type: Number, default: 0 }
}, { _id: false });

const seoKeywordSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'SeoProject', required: true, index: true },
    keyword: { type: String, required: true, trim: true },
    volume: { type: Number, default: 0 },
    cpc: { type: Number, default: 0 },
    difficulty: { type: String, default: 'Medium' }, // e.g. 'Low', 'Medium', 'High' or raw score
    position: { type: Number, default: null },
    previousPosition: { type: Number, default: null },
    intent: {
      type: String,
      enum: ['Informational', 'Commercial', 'Transactional', 'Navigational', 'Brand', 'Unknown'],
      default: 'Unknown'
    },
    featuredSnippet: { type: Boolean, default: false },
    history: { type: [seoKeywordHistorySchema], default: [] }
  },
  { timestamps: true }
);

seoKeywordSchema.index({ projectId: 1, keyword: 1 }, { unique: true });

module.exports = mongoose.models.SeoKeyword || mongoose.model('SeoKeyword', seoKeywordSchema);
