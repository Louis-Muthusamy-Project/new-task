const mongoose = require('mongoose');
const { Schema } = mongoose;

const MediaSchema = new Schema(
  {
    websiteId: {
      type: Schema.Types.ObjectId,
      ref: 'Website',
      default: null,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'document', 'favicon', 'other'],
      default: 'image',
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    cloudinaryPublicId: {
      type: String,
      trim: true,
      default: '',
    },
    fileName: {
      type: String,
      trim: true,
      default: '',
    },
    mimeType: {
      type: String,
      trim: true,
      default: '',
    },
    sizeBytes: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

MediaSchema.index({ websiteId: 1, type: 1 });
MediaSchema.index({ ownerId: 1, createdAt: -1 });

module.exports = mongoose.models.Media || mongoose.model('Media', MediaSchema);
