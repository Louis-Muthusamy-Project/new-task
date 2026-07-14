const mongoose = require('mongoose');
const { Schema } = mongoose;

const StoreOrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'StoreProduct' },
    variantId: { type: Schema.Types.ObjectId, default: null },
    title: { type: String, trim: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const StoreOrderSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    orderNumber: { type: String, trim: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'StoreCustomer', default: null },
    items: { type: [StoreOrderItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    discountId: { type: Schema.Types.ObjectId, ref: 'StoreDiscount', default: null },
    discountAmount: { type: Number, default: 0 },
    shippingId: { type: Schema.Types.ObjectId, ref: 'StoreShipping', default: null },
    shippingAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, trim: true, default: 'USD' },
    paymentId: { type: Schema.Types.ObjectId, ref: 'StorePayment', default: null },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
      default: 'Pending',
    },
    fulfillmentStatus: {
      type: String,
      enum: ['Unfulfilled', 'Fulfilled', 'Cancelled'],
      default: 'Unfulfilled',
      index: true,
    },
    // Single merchant-facing order status shown in the Orders tab
    // (StoresTab.jsx / orderController.js). Coarser than the
    // paymentStatus/fulfillmentStatus pair above — those still get set by
    // the checkout flow (storeStorefrontController.createOrder) and payment
    // webhooks, while `status` is what a merchant actually clicks through
    // as the order moves toward fulfillment.
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    // Written exclusively by NotificationService (via OrderService) right
    // after it attempts delivery — never set directly by a controller.
    // Lets the Orders tab show "Confirmation sent" instead of that being
    // invisible/unknowable after the fact.
    notifications: {
      type: [
        {
          type: { type: String }, // orderConfirmation | shippingUpdate | orderCancelled
          sent: { type: Boolean, default: false },
          to: { type: String, default: '' },
          reason: { type: String, default: '' }, // set when sent: false (e.g. 'smtp-not-configured')
          sentAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    // ── Funnel attribution (optional) ──────────────────────────────────────
    // Set by the checkout flow when an order originates from a funnel step.
    // Funnels orchestrate; they never own orders — these are reference links.
    funnelId: {
      type: Schema.Types.ObjectId,
      ref: 'Funnel',
      default: null,
      index: true,
    },
    stepId: {
      type: Schema.Types.ObjectId,
      ref: 'FunnelStep',
      default: null,
    },
    funnelSource: {
      type: String,
      default: null, // e.g. 'funnel_checkout'
    },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

StoreOrderSchema.index({ storeId: 1, orderNumber: 1 }, { unique: true, sparse: true });
StoreOrderSchema.index({ storeId: 1, paymentStatus: 1 });
StoreOrderSchema.index({ storeId: 1, status: 1 });

module.exports = mongoose.models.StoreOrder || mongoose.model('StoreOrder', StoreOrderSchema);