const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  label: { type: String, required: true },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  options: [{ type: String }], // For select, radio, checkbox
  // Only meaningful for type: "Button". If set, the generated form on the
  // live site POSTs submissions to this URL instead of the default
  // built-in submissions endpoint (e.g. a custom webhook).
  postUrl: { type: String, default: '' },
}, { _id: false });

const formSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
  },
  fields: [fieldSchema],
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: 'Draft'
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isTemplate: {
    type: Boolean,
    default: false,
    index: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Form', formSchema);