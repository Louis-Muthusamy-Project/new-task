const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    default: 'Website',
    trim: true,
  },
  customUrl: {
    type: String,
    default: '',
    trim: true,
  },
  foreground: {
    type: String,
    default: '#3b82f6',
  },
  background: {
    type: String,
    default: '#ffffff',
  },
  shape: {
    type: String,
    default: 'Square',
  },
  scanLink: {
    type: String,
    default: '',
    trim: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('QRCode', qrCodeSchema);
