const mongoose = require('mongoose');

const seoHistorySchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'SeoProject', required: true, index: true },
    phase: { type: String, required: true },
    event: { type: String, required: true },
    user: { type: String, default: 'AI Agent' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.SeoHistory || mongoose.model('SeoHistory', seoHistorySchema);
