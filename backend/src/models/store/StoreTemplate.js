const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * StoreTemplate.js — mirrors models/WebsiteTemplate.js.
 * A library entry describing an uploaded store-template ZIP: its pages are
 * stored as a lightweight snapshot here for fast library rendering, while
 * the full parsed content lives in StorePage once a Store is created from it.
 */
const TemplatePageDefinitionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, default: '' },
    isHome: { type: Boolean, default: false },
    content: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

// Theme = the design tokens applied across every page of the template
// (colors, fonts, spacing, etc.) — separate from the raw builder project
// data so the storefront renderer can read/override just the tokens
// without touching the full GrapesJS project.
const TemplateThemeSchema = new Schema(
  {
    colors: {
      primary: { type: String, trim: true, default: '' },
      secondary: { type: String, trim: true, default: '' },
      background: { type: String, trim: true, default: '' },
      text: { type: String, trim: true, default: '' },
    },
    fonts: {
      heading: { type: String, trim: true, default: '' },
      body: { type: String, trim: true, default: '' },
    },
    layout: { type: String, trim: true, default: '' },
    custom: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

// Snapshot of a template's editable payload at a point in time. Pushed onto
// `versions` whenever a new version is saved so older revisions can be
// rolled back to without losing history.
const TemplateVersionSchema = new Schema(
  {
    version: { type: Number, required: true },
    projectData: { type: Schema.Types.Mixed, default: null },
    pages: { type: [TemplatePageDefinitionSchema], default: [] },
    theme: { type: TemplateThemeSchema, default: () => ({}) },
    thumbnail: { type: String, trim: true, default: '' },
    preview: { type: String, trim: true, default: '' },
    label: { type: String, trim: true, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StoreTemplateSchema = new Schema(
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
        'Automotive',
        'Baby & Kids',
        'Beauty & Personal Care',
        'Electronics',
        'Fashion & Apparel',
        'Grocery & Food',
        'Health & Wellness',
        'Home & Living',
        'Other',
      ],
      default: 'Other',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // Live/rendered preview (e.g. a hosted HTML preview URL or screenshot
    // used for the "Preview" action in the template library).
    preview: {
      type: String,
      trim: true,
      default: '',
    },
    thumbnail: {
      type: String,
      trim: true,
      default: '',
    },
    // Full builder project payload (GrapesJS getProjectData() output —
    // components, styles, assets) needed to reopen the template in the
    // editor. `pages` below stays a lightweight snapshot for fast library
    // list rendering; `projectData` is the source of truth for editing.
    projectData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    pages: {
      type: [TemplatePageDefinitionSchema],
      default: [],
    },
    theme: {
      type: TemplateThemeSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft',
      index: true,
    },
    // Current/latest version number — mirrors versions[versions.length - 1].version.
    version: {
      type: Number,
      default: 1,
    },
    // Full history of saved versions (v1, v2, ...), each a self-contained
    // snapshot of projectData/pages/theme so Rollback can restore any prior
    // state and Duplicate Template can clone from a specific point in time.
    versions: {
      type: [TemplateVersionSchema],
      default: [],
    },
    // Which roles uploaded / own this library entry — kept for auditing since
    // uploads are restricted to admin / superadmin on the frontend.
    uploadedByRole: {
      type: String,
      trim: true,
      default: '',
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

StoreTemplateSchema.index({ category: 1, status: 1 });
StoreTemplateSchema.index({ name: 'text', description: 'text' });

// Seed versions[0] (v1) from the initial payload on first save so every
// template has a real history entry from the moment it's created, instead
// of only gaining one the first time someone explicitly saves a new version.
StoreTemplateSchema.pre('save', function seedInitialVersion(next) {
  if (this.isNew && (!this.versions || this.versions.length === 0)) {
    this.versions = [
      {
        version: this.version || 1,
        projectData: this.projectData,
        pages: this.pages,
        theme: this.theme,
        thumbnail: this.thumbnail,
        preview: this.preview,
        label: 'Initial version',
        createdBy: this.uploadedBy || null,
        createdAt: this.createdAt || new Date(),
      },
    ];
  }
  next();
});

module.exports =
  mongoose.models.StoreTemplate || mongoose.model('StoreTemplate', StoreTemplateSchema);