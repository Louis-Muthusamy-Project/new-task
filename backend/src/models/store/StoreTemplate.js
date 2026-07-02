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
    version: {
      type: Number,
      default: 1,
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

module.exports =
  mongoose.models.StoreTemplate || mongoose.model('StoreTemplate', StoreTemplateSchema);