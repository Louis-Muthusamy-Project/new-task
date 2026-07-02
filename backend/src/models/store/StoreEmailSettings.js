const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * One StoreEmailSettings document per Store — transactional email
 * configuration, kept separate from Store and linked back via storeId.
 */
const StoreEmailSettingsSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      unique: true,
      index: true,
    },
    senderName: { type: String, trim: true, default: '' },
    senderEmail: { type: String, trim: true, default: '' },
    replyToEmail: { type: String, trim: true, default: '' },
    notifications: {
      orderConfirmation: { type: Boolean, default: true },
      shippingUpdate: { type: Boolean, default: true },
      orderCancelled: { type: Boolean, default: true },
      abandonedCart: { type: Boolean, default: false },
      customerWelcome: { type: Boolean, default: true },
    },
    smtp: {
      host: { type: String, trim: true, default: '' },
      port: { type: Number, default: null },
      username: { type: String, trim: true, default: '' },
      useSSL: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.StoreEmailSettings ||
  mongoose.model('StoreEmailSettings', StoreEmailSettingsSchema);
