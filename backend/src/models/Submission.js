const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true,
    index: true,
  },
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    index: true,
  },
  // Arbitrary field-id -> value map, shaped by whatever fields the
  // form template had at submission time (text, email, checkbox arrays, etc).
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  meta: {
    pageUrl: { type: String },
    userAgent: { type: String },
    ip: { type: String },
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);