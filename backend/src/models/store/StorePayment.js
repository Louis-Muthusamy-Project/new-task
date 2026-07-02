const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * One StorePayment document per Store — payment-provider configuration,
 * kept separate from Store and linked back via storeId.
 */
const StorePaymentSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      unique: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['Stripe', 'PayPal', 'Razorpay', 'Manual', 'None'],
      default: 'None',
    },
    mode: { type: String, enum: ['Test', 'Live'], default: 'Test' },
    isActive: { type: Boolean, default: false },
    // Provider-specific, non-secret configuration (public keys, account ids…).
    // Actual secrets should live in an env-backed secrets store, not here.
    config: { type: Schema.Types.Mixed, default: {} },
    supportedCurrencies: { type: [String], default: ['USD'] },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.StorePayment || mongoose.model('StorePayment', StorePaymentSchema);
