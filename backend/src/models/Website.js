const mongoose = require("mongoose");

const websiteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, trim: true, required: true },
    websiteName: { type: String, trim: true },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft', index: true },
    description: { type: String, trim: true },
    domain: { type: String, trim: true },
    category: { type: String, trim: true },
    faviconUrl: { type: String, trim: true, default: '' },
    tracking: {
      metaPixelId: { type: String, trim: true, default: '' },
      ga4Id: { type: String, trim: true, default: '' },
      gtmId: { type: String, trim: true, default: '' },
      tiktokPixelId: { type: String, trim: true, default: '' },
      customHeadCode: { type: String, default: '' },
      customBodyCode: { type: String, default: '' },
    },
    chatWidgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatWidget',
      default: null,
    },
    domainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebsiteDomain',
      default: null,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebsiteTemplate',
      default: null,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    template: {
      templateId: { type: String },
      templateName: { type: String },
      imageUrl: { type: String },
      cloudinaryPublicId: { type: String },
    },
    settings: { type: mongoose.Schema.Types.Mixed },
    isDeleted: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

websiteSchema.index({ ownerId: 1, status: 1 });
websiteSchema.index({ teamId: 1, status: 1 });
websiteSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.models.Website || mongoose.model("Website", websiteSchema);
