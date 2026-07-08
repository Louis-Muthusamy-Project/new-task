'use strict';

/**
 * orderController.js — Orders Module (admin)
 *
 * Thin HTTP layer over Store Engine's Order Service. Orders themselves are
 * created by the storefront checkout flow (see
 * storeStorefrontController.createOrder, which now also delegates to
 * OrderService), so this controller only covers the admin-facing
 * List / View / Update Status / Delete flows.
 */

const mongoose = require('mongoose');
const { orderService } = require('../../services/store');

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

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/orders
// Query: status, search (matches orderNumber)
// ─────────────────────────────────────────────────────────────────────────
exports.listOrders = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const orders = await orderService.listOrders(storeId, req.query);
  res.status(200).json({ success: true, data: orders });
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/orders/:id
// ─────────────────────────────────────────────────────────────────────────
exports.getOrder = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const order = await orderService.getOrder(storeId, id);
  res.status(200).json({ success: true, data: order });
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
  const order = await orderService.updateOrderStatus(storeId, id, status);
  res.status(200).json({ success: true, data: order });
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/store/:storeId/admin/orders/:id
// ─────────────────────────────────────────────────────────────────────────
exports.deleteOrder = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const order = await orderService.deleteOrder(storeId, id);
  res.status(200).json({ success: true, data: { id: order._id, deleted: true } });
};