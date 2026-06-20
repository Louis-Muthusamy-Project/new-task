const mongoose = require('mongoose');
const { Schema } = mongoose;

const TrackingSchema = new Schema(
  {
    metaPixelId: { type: String, trim: true, default: '' },
    ga4Id: { type: String, trim: true, default: '' },
    gtmId: { type: String, trim: true, default: '' },
    tiktokPixelId: { type: String, trim: true, default: '' },
    customHeadCode: { type: String, default: '' },
    customBodyCode: { type: String, default: '' },
  },
  { _id: false }
);

const WebsiteSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
      index: true,
    },
    faviconUrl: {
      type: String,
      trim: true,
      default: '',
    },
    tracking: {
      type: TrackingSchema,
      default: () => ({}),
    },
    chatWidgetId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatWidget',
      default: null,
    },
    domainId: {
      type: Schema.Types.ObjectId,
      ref: 'WebsiteDomain',
      default: null,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'WebsiteTemplate',
      default: null,
    },
    folderId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

WebsiteSchema.index({ ownerId: 1, status: 1 });
WebsiteSchema.index({ teamId: 1, status: 1 });
WebsiteSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.models.Website || mongoose.model('Website', WebsiteSchema);
