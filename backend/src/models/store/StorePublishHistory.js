const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * StorePublishHistory.js — mirrors models/PublishHistory.js.
 * Records every publish/unpublish run for a Store, including the frozen
 * snapshot of what was published — Store-module counterpart of
 * PublishHistory (which is scoped to Website/WebsitePage and can't be
 * reused here since its websiteId ref is required).
 */
const StorePublishHistorySchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    pageId: {
      type: Schema.Types.ObjectId,
      ref: 'StorePage',
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

StorePublishHistorySchema.index({ storeId: 1, createdAt: -1 });
StorePublishHistorySchema.index({ storeId: 1, pageId: 1, createdAt: -1 });

module.exports =
  mongoose.models.StorePublishHistory ||
  mongoose.model('StorePublishHistory', StorePublishHistorySchema);
