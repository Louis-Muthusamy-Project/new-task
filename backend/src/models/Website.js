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
    // Optional link to a Store Engine document (backend/src/models/store/Store.js).
    // Nullable by design — a plain (non-commerce) Website has no Store, and
    // is completely unaffected by this field's existence. When set, the
    // Preview Integration pipeline (frontend/.../storefront/WebsitePagePreview.jsx)
    // uses it to hydrate any `data-store-block` regions the Template Import
    // Pipeline tagged (see services/templateImport/) against that Store's
    // live public API instead of rendering flat static HTML.
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      default: null,
      index: true,
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