const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * A single transactional-email template: whether it's turned on, and the
 * subject/body an admin can override. `{{variable}}` placeholders (e.g.
 * {{customerName}}, {{orderNumber}}) are resolved by the mailer at send
 * time — this schema just stores the editable copy.
 */
const EmailTemplateSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    subject: { type: String, trim: true, default: '' },
    body: { type: String, default: '' },
  },
  { _id: false }
);

/**
 * One StoreEmailSettings document per Store — transactional email
 * configuration (SMTP connection + sender identity + per-event templates),
 * kept separate from Store and linked back via storeId. Used by the Email
 * sender tab in StoresTab.jsx (sub-tabs: SMTP, Templates, Order Mail,
 * Welcome Mail).
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
    // ── Sender identity (From/Reply-To shown on every outgoing email) ──
    senderName: { type: String, trim: true, default: '' },
    senderEmail: { type: String, trim: true, default: '' },
    replyToEmail: { type: String, trim: true, default: '' },
    useCustomSender: { type: Boolean, default: false },

    // ── SMTP connection (store override; falls back to agency SMTP when
    //    isCustom is false) ──
    smtp: {
      isCustom: { type: Boolean, default: false },
      host: { type: String, trim: true, default: '' },
      port: { type: Number, default: 587 },
      username: { type: String, trim: true, default: '' },
      password: { type: String, trim: true, default: '' },
      useSSL: { type: Boolean, default: true },
    },

    // ── Per-event templates, editable from the Templates gallery; Order
    //    Mail and Welcome Mail additionally get their own dedicated tab. ──
    templates: {
      orderConfirmation: {
        type: EmailTemplateSchema,
        default: () => ({
          subject: 'Your order #{{orderNumber}} is confirmed',
          body: "Hi {{customerName}},\n\nThanks for your order! We're getting #{{orderNumber}} ready now.\n\nOrder total: {{orderTotal}}",
        }),
      },
      shippingUpdate: {
        type: EmailTemplateSchema,
        default: () => ({
          subject: 'Your order #{{orderNumber}} has shipped',
          body: 'Hi {{customerName}},\n\nYour order is on its way! Track it here: {{trackingUrl}}',
        }),
      },
      orderCancelled: {
        type: EmailTemplateSchema,
        default: () => ({
          subject: 'Your order #{{orderNumber}} was cancelled',
          body: 'Hi {{customerName}},\n\nYour order #{{orderNumber}} has been cancelled. If this was a mistake, contact us and we\u2019ll help sort it out.',
        }),
      },
      abandonedCart: {
        type: EmailTemplateSchema,
        default: () => ({
          enabled: false,
          subject: 'You left something behind',
          body: 'Hi {{customerName}},\n\nYou still have items waiting in your cart. Come back and check out before they sell out!',
        }),
      },
      welcome: {
        type: EmailTemplateSchema,
        default: () => ({
          subject: 'Welcome to {{storeName}}!',
          body: "Hi {{customerName}},\n\nWelcome aboard \u2014 we're glad you're here. Explore the store and reach out any time you need a hand.",
        }),
      },
    },
  },
  { timestamps: true }
);

// Valid keys for the `:type` route param — kept alongside the schema so
// the controller and schema can't drift apart.
StoreEmailSettingsSchema.statics.TEMPLATE_TYPES = [
  'orderConfirmation',
  'shippingUpdate',
  'orderCancelled',
  'abandonedCart',
  'welcome',
];

module.exports =
  mongoose.models.StoreEmailSettings ||
  mongoose.model('StoreEmailSettings', StoreEmailSettingsSchema);