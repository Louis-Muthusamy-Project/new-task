'use strict';

/**
 * customerController.js — Customer Module (admin CRUD)
 *
 * Thin HTTP layer over Store Engine's Customer Service. ordersCount and
 * totalSpent are read-only here — they're maintained by OrderService via
 * CustomerService.recordOrder, not edited directly by a merchant.
 */

const mongoose = require('mongoose');
const { customerService } = require('../../services/store');

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
// GET /api/store/:storeId/admin/customers
// ─────────────────────────────────────────────────────────────────────────
exports.listCustomers = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const customers = await customerService.listCustomers(storeId, req.query);
  res.status(200).json({ success: true, data: customers });
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/customers/:id
// ─────────────────────────────────────────────────────────────────────────
exports.getCustomer = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const customer = await customerService.getCustomer(storeId, id);
  res.status(200).json({ success: true, data: customer });
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/store/:storeId/admin/customers
// ─────────────────────────────────────────────────────────────────────────
exports.createCustomer = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const customer = await customerService.createCustomer(storeId, req.body);
  res.status(201).json({ success: true, data: customer });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/customers/:id
// ─────────────────────────────────────────────────────────────────────────
exports.updateCustomer = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const customer = await customerService.updateCustomer(storeId, id, req.body);
  res.status(200).json({ success: true, data: customer });
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/store/:storeId/admin/customers/:id
// ─────────────────────────────────────────────────────────────────────────
exports.deleteCustomer = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const customer = await customerService.deleteCustomer(storeId, id);
  res.status(200).json({ success: true, data: { id: customer._id, deleted: true } });
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/store/:storeId/admin/customers/:id/addresses
// ─────────────────────────────────────────────────────────────────────────
exports.addAddress = async (req, res) => {
  const { storeId, id } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');

  const customer = await customerService.addCustomerAddress(storeId, id, req.body);
  res.status(200).json({ success: true, data: customer });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/customers/:id/addresses/:addressId
// ─────────────────────────────────────────────────────────────────────────
exports.updateAddress = async (req, res) => {
  const { storeId, id, addressId } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');
  requireValidId(addressId, 'addressId');

  const customer = await customerService.updateCustomerAddress(storeId, id, addressId, req.body);
  res.status(200).json({ success: true, data: customer });
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/store/:storeId/admin/customers/:id/addresses/:addressId
// ─────────────────────────────────────────────────────────────────────────
exports.deleteAddress = async (req, res) => {
  const { storeId, id, addressId } = req.params;
  requireValidId(storeId, 'storeId');
  requireValidId(id, 'id');
  requireValidId(addressId, 'addressId');

  const customer = await customerService.deleteCustomerAddress(storeId, id, addressId);
  res.status(200).json({ success: true, data: customer });
};