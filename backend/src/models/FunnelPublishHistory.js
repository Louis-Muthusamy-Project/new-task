const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * FunnelPublishHistory — audit trail for funnel publish/unpublish events.
 *
 * Mirrors PublishHistory.js but scoped to Funnels (funnelId + stepId
 * instead of websiteId + pageId). The snapshot stores a point-in-time
 * copy of the funnel and all its steps — identical purpose as the website
 * publish snapshot.
 */
const FunnelPublishHistorySchema = new Schema(
  {
    funnelId: {
      type: Schema.Types.ObjectId,
      ref: 'Funnel',
      required: true,
      index: true,
    },
    stepId: {
      type: Schema.Types.ObjectId,
      ref: 'FunnelStep',
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
    // Frozen snapshot of funnel + steps at publish time.
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
      default: null,
    },
  },
  { timestamps: true }
);

FunnelPublishHistorySchema.index({ funnelId: 1, createdAt: -1 });

module.exports =
  mongoose.models.FunnelPublishHistory ||
  mongoose.model('FunnelPublishHistory', FunnelPublishHistorySchema);
