const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  key: { type: String, default: '' },
  title: { type: String, required: true, trim: true },
  category: { type: String, default: undefined },
  status: { type: String, default: 'draft' },
  website: { type: String, default: '—' },
  webstore: { type: String, default: '—' },
  excerpt: { type: String, default: '' },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  featured: { type: Boolean, default: false },
}, { _id: false });

const blogCategorySchema = new mongoose.Schema({
  key: { type: String, default: '' },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
}, { _id: false });

const blogSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, unique: true },
  assignedTo: { type: String, default: 'Any site / store' },
  publicUrl: { type: String, default: '' },
  website: { type: String, default: '—' },
  webstore: { type: String, default: '—' },
  description: { type: String, default: '' },
  status: { type: String, enum: ['active', 'draft'], default: 'active' },
  postsPerPage: { type: Number, default: 12 },
  postList: { type: [blogPostSchema], default: [] },
  categoryList: { type: [blogCategorySchema], default: [] },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
