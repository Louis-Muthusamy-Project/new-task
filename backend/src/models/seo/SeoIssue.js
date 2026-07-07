const mongoose = require('mongoose');

const seoIssueSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'SeoProject', required: true, index: true },
    auditId: { type: mongoose.Schema.Types.ObjectId, ref: 'SeoAudit', required: true },
    url: { type: String, required: true, trim: true },
    type: { type: String, required: true, index: true }, // e.g. 'missing_meta_desc', 'missing_alt_text'
    title: { type: String, required: true },
    description: { type: String, default: '' },
    severity: { type: String, enum: ['critical', 'warning', 'info'], default: 'warning', index: true },
    status: { type: String, enum: ['open', 'in_progress', 'fixed', 'ignored'], default: 'open', index: true },
    evidence: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.models.SeoIssue || mongoose.model('SeoIssue', seoIssueSchema);
