const mongoose = require('mongoose');
const { Schema } = mongoose;

const StoreOrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'StoreProduct' },
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
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

StoreOrderSchema.index({ storeId: 1, orderNumber: 1 }, { unique: true, sparse: true });
StoreOrderSchema.index({ storeId: 1, paymentStatus: 1 });
StoreOrderSchema.index({ storeId: 1, status: 1 });

module.exports = mongoose.models.StoreOrder || mongoose.model('StoreOrder', StoreOrderSchema);