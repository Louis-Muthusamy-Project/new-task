const mongoose = require('mongoose');
const { Schema } = mongoose;

const PublishHistorySchema = new Schema(
  {
    websiteId: {
      type: Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },
    pageId: {
      type: Schema.Types.ObjectId,
      ref: 'WebsitePage',
      default: null,
      index: true,
    },
    action: {
      type: String,
      enum: ['publish', 'unpublish', 'revert_to_draft', 'rollback'],
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'in_progress'],
      default: 'success',
      index: true,
    },
    snapshot: {
      type: Schema.Types.Mixed,
      default: null,
    },
    errorMessage: {
      type: String,
      trim: true,
      default: '',
    },
    triggeredBy: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

PublishHistorySchema.index({ websiteId: 1, createdAt: -1 });
PublishHistorySchema.index({ websiteId: 1, pageId: 1, createdAt: -1 });

module.exports =
  mongoose.models.PublishHistory || mongoose.model('PublishHistory', PublishHistorySchema);
