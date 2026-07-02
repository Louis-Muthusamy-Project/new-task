const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * A store can enable more than one gateway at once (e.g. Razorpay + Cash on
 * Delivery both live, customer picks one at checkout), so each provider is
 * its own togglable sub-document rather than a single `provider` enum.
 *
 * Only non-secret / low-sensitivity fields live here (key ids, publishable
 * keys, COD instructions). Anything that should never round-trip to the
 * browser in plaintext (API secrets, webhook signing secrets) belongs in an
 * env-backed secrets store in a real deployment — the `secret`-suffixed
 * fields below exist for admin-panel convenience in this project only.
 */
const RazorpaySchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    mode: { type: String, enum: ['Test', 'Live'], default: 'Test' },
    keyId: { type: String, trim: true, default: '' },
    keySecret: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const StripeSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    mode: { type: String, enum: ['Test', 'Live'], default: 'Test' },
    publishableKey: { type: String, trim: true, default: '' },
    secretKey: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const PayPalSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    mode: { type: String, enum: ['Sandbox', 'Live'], default: 'Sandbox' },
    clientId: { type: String, trim: true, default: '' },
    clientSecret: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const CodSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    instructions: { type: String, trim: true, default: 'Pay with cash when your order is delivered.' },
    extraFee: { type: Number, default: 0 },
  },
  { _id: false }
);

/**
 * One StorePayment document per Store — payment-gateway configuration,
 * kept separate from Store and linked back via storeId. Used by the
 * Payments tab in StoresTab.jsx.
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
    methods: {
      razorpay: { type: RazorpaySchema, default: () => ({}) },
      stripe: { type: StripeSchema, default: () => ({}) },
      paypal: { type: PayPalSchema, default: () => ({}) },
      cod: { type: CodSchema, default: () => ({}) },
    },
    supportedCurrencies: { type: [String], default: ['USD'] },
  },
  { timestamps: true }
);

// Valid keys for the `:method` route param — kept alongside the schema so
// the controller and schema can't drift apart.
StorePaymentSchema.statics.PROVIDERS = ['razorpay', 'stripe', 'paypal', 'cod'];

module.exports =
  mongoose.models.StorePayment || mongoose.model('StorePayment', StorePaymentSchema);