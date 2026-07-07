const mongoose = require('mongoose');

const seoStrategySchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'SeoProject', required: true, index: true },
    status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected'], default: 'draft', index: true },
    contentPlan: [
      {
        pageUrl: { type: String, required: true },
        keyword: { type: String, default: '' },
        priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
        action: { type: String, default: 'optimize' }, // e.g. 'optimize', 'create'
        existingPageId: { type: String, default: null } // references pageId if editing on builder
      }
    ],
    roadmapItems: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        impact: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
        difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
        status: { type: String, enum: ['Todo', 'In Progress', 'Done', 'Skipped'], default: 'Todo' }
      }
    ],
    roiGoals: { type: [String], default: [] },
    approvedBy: { type: String, default: null },
    approvedAt: { type: Date, default: null },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.SeoStrategy || mongoose.model('SeoStrategy', seoStrategySchema);
