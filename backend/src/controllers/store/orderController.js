'use strict';

/**
 * orderController.js — Orders Module (admin)
 *
 * Store-module counterpart of productController.js / customerController.js /
 * collectionController.js. Orders themselves are created by the storefront
 * checkout flow (storeStorefrontController.createOrder), not by a merchant,
 * so this controller only covers the admin-facing List / View / Update
 * Status / Delete flows used by the Orders tab in StoresTab.jsx.
 *
 * `status` is the single merchant-facing field surfaced in the UI:
 * Pending -> Paid -> Shipped -> Delivered, with Cancelled reachable from
 * any of the earlier states. It's intentionally separate from
 * paymentStatus/fulfillmentStatus on the StoreOrder model, which continue
 * to reflect what the checkout/payment pipeline reported.
 */

const mongoose = require('mongoose');
const StoreOrder = require('../../models/store/StoreOrder');
const StoreCustomer = require('../../models/store/StoreCustomer');

const notFoundError = (message) => {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
};

const badRequestError = (message) => {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
};

const requireValidId = (id, label = 'id') => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw badRequestError(`Invalid ${label}.`);
  }
};

const ORDER_STATUSES = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

async function attachCustomers(orders) {
  const customerIds = [...new Set(orders.map((o) => o.customerId).filter(Boolean).map(String))];
  if (customerIds.length === 0) return orders;

  const customers = await StoreCustomer.find({ _id: { $in: customerIds } })
    .select('firstName lastName email')
    .lean();
  const customerMap = new Map(customers.map((c) => [String(c._id), c]));

  return orders.map((o) => ({
    ...o,
    customer: o.customerId ? customerMap.get(String(o.customerId)) || null : null,
  }));
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/orders
// Query: status, search (matches orderNumber)
// ─────────────────────────────────────────────────────────────────────────
exports.listOrders = async (req, res) => {
  const { storeId } = req.params;
  const { status, search } = req.query;
  requireValidId(storeId, 'storeId');

  const query = { storeId, isDeleted: false };
  if (status) {
    if (!ORDER_STATUSES.includes(status)) {
      throw badRequestError(`Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}.`);
    }
    query.status = status;
  }
  if (search) query.orderNumber = { $regex: search, $options: 'i' };

  const orders = await StoreOrder.find(query).sort({ createdAt: -1 }).lean();
  const withCustomers = await attachCustomers(orders);

  res.status(200).json({ success: true, data: withCustomers });
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/orders/:id
// ─────────────────────────────────────────────────────────────────────────
exports.getOrder = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const order = await StoreOrder.findOne({ _id: id, storeId, isDeleted: false }).lean();
  if (!order) throw notFoundError('Order not found.');

  const [withCustomer] = await attachCustomers([order]);
  res.status(200).json({ success: true, data: withCustomer });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/orders/:id/status
// Body: { status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled' }
// ─────────────────────────────────────────────────────────────────────────
exports.updateOrderStatus = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const { status } = req.body || {};
  if (!status || !ORDER_STATUSES.includes(status)) {
    throw badRequestError(`Status is required and must be one of: ${ORDER_STATUSES.join(', ')}.`);
  }

  const order = await StoreOrder.findOne({ _id: id, storeId, isDeleted: false });
  if (!order) throw notFoundError('Order not found.');

  order.status = status;

  // Keep the legacy paymentStatus/fulfillmentStatus pair roughly in sync so
  // older UI (or anything still reading those fields) doesn't go stale.
  if (status === 'Paid') order.paymentStatus = 'Paid';
  if (status === 'Shipped' || status === 'Delivered') {
    order.paymentStatus = 'Paid';
    order.fulfillmentStatus = 'Fulfilled';
  }
  if (status === 'Cancelled') order.fulfillmentStatus = 'Cancelled';

  await order.save();

  res.status(200).json({ success: true, data: order });
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/store/:storeId/admin/orders/:id
// Soft delete, matching Product/Customer's isDeleted flag convention.
// ─────────────────────────────────────────────────────────────────────────
exports.deleteOrder = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const order = await StoreOrder.findOneAndUpdate(
    { _id: id, storeId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!order) throw notFoundError('Order not found.');

  res.status(200).json({ success: true, data: { id: order._id, deleted: true } });
};
