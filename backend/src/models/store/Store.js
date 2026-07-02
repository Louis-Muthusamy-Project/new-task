const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Store.js — root document for the Store module.
 *
 * Mirrors the shape/relational pattern of models/Website.js so the store
 * pipeline behaves the same way as the website pipeline (see
 * controllers/storeTemplateController.js), but persists to its own set of
 * collections instead of Website / WebsitePage.
 *
 * Relational model: every store sub-document (StorePage, StoreProduct,
 * StoreCollection, StoreCustomer, StoreOrder, StoreDiscount, StoreShipping,
 * StorePayment, StoreEmailSettings) stores a `storeId` pointing back at this
 * document — same pattern WebsitePage uses for `websiteId`. Each collection
 * therefore stays in its own table, but Store can pull all of it together
 * through the virtual populates defined below.
 */
const storeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, trim: true, required: true },
    storeName: { type: String, trim: true },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft', index: true },
    description: { type: String, trim: true },
    domain: { type: String, trim: true },
    category: { type: String, trim: true },
    faviconUrl: { type: String, trim: true, default: '' },
    currency: { type: String, trim: true, default: 'USD' },
    installDemo: { type: Boolean, default: false },
    tracking: {
      metaPixelId: { type: String, trim: true, default: '' },
      ga4Id: { type: String, trim: true, default: '' },
      gtmId: { type: String, trim: true, default: '' },
      tiktokPixelId: { type: String, trim: true, default: '' },
      customHeadCode: { type: String, default: '' },
      customBodyCode: { type: String, default: '' },
    },
    domainId: {
      type: Schema.Types.ObjectId,
      ref: 'WebsiteDomain',
      default: null,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'StoreTemplate',
      default: null,
    },
    folderId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    template: {
      templateId: { type: String },
      templateName: { type: String },
      imageUrl: { type: String },
      cloudinaryPublicId: { type: String },
    },
    settings: { type: Schema.Types.Mixed },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

storeSchema.index({ ownerId: 1, status: 1 });
storeSchema.index({ teamId: 1, status: 1 });
storeSchema.index({ name: 'text', description: 'text' });

// ── Relations ────────────────────────────────────────────────────────────
// Every other Store* collection stores its own data separately and only
// links back to Store via `storeId`. These virtuals let callers do
// Store.findById(id).populate('pages').populate('products')... to read the
// full relational graph without denormalizing data into this document.
storeSchema.virtual('pages', {
  ref: 'StorePage',
  localField: '_id',
  foreignField: 'storeId',
});
storeSchema.virtual('products', {
  ref: 'StoreProduct',
  localField: '_id',
  foreignField: 'storeId',
});
storeSchema.virtual('collections', {
  ref: 'StoreCollection',
  localField: '_id',
  foreignField: 'storeId',
});
storeSchema.virtual('customers', {
  ref: 'StoreCustomer',
  localField: '_id',
  foreignField: 'storeId',
});
storeSchema.virtual('orders', {
  ref: 'StoreOrder',
  localField: '_id',
  foreignField: 'storeId',
});
storeSchema.virtual('discounts', {
  ref: 'StoreDiscount',
  localField: '_id',
  foreignField: 'storeId',
});
storeSchema.virtual('shippingSettings', {
  ref: 'StoreShipping',
  localField: '_id',
  foreignField: 'storeId',
  justOne: true,
});
storeSchema.virtual('paymentSettings', {
  ref: 'StorePayment',
  localField: '_id',
  foreignField: 'storeId',
  justOne: true,
});
storeSchema.virtual('emailSettings', {
  ref: 'StoreEmailSettings',
  localField: '_id',
  foreignField: 'storeId',
  justOne: true,
});

module.exports = mongoose.models.Store || mongoose.model('Store', storeSchema);
