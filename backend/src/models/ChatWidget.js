const mongoose = require('mongoose');

const chatWidgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  type: {
    type: String,
    enum: ['All-in-one chat', 'SMS / Email chat', 'Live chat', 'Facebook chat', 'Instagram chat', 'WhatsApp chat', 'Voice AI'],
    default: 'All-in-one chat',
  },
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: 'Draft'
  },
  greeting: {
    type: String,
    default: "Hi! How can we help you today?",
  },
  brandColor: {
    type: String,
    default: "#3b82f6",
  },
  launcherPosition: {
    type: String,
    enum: ['Bottom right', 'Bottom left'],
    default: 'Bottom right',
  },
  launcherLabel: {
    type: String,
    default: 'Chat',
  },
  channels: {
    type: [String],
    default: ['WhatsApp', 'Email', 'Live chat', 'SMS'],
  },
  whatsappPhone: {
    type: String,
    default: '',
  },
  supportEmail: {
    type: String,
    default: '',
  },
  assignments: {
    type: Number,
    default: 0,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('ChatWidget', chatWidgetSchema);
