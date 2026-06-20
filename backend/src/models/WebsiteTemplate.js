const mongoose = require('mongoose');
const { Schema } = mongoose;

const TemplatePageDefinitionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, default: '' },
    isHome: { type: Boolean, default: false },
    content: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const WebsiteTemplateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
      enum: [
        'Real Estate',
        'E-commerce',
        'Education',
        'Restaurant',
        'Health & Wellness',
        'Portfolio',
        'SaaS / Tech',
        'Nonprofit',
        'Other',
      ],
      default: 'Other',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      default: '',
    },
    templateZipCloudinaryUrl: {
      type: String,
      trim: true,
      default: '',
    },
    pages: {
      type: [TemplatePageDefinitionSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

WebsiteTemplateSchema.index({ category: 1, isActive: 1 });
WebsiteTemplateSchema.index({ name: 'text', description: 'text' });

module.exports =
  mongoose.models.WebsiteTemplate || mongoose.model('WebsiteTemplate', WebsiteTemplateSchema);
