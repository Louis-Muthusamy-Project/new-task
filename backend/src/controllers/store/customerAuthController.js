'use strict';

/**
 * customerAuthController.js — Storefront Customer Auth (public)
 *
 * Register/login for a shopper account. Distinct from the internal
 * agency dashboard's SignIn — this is what makes "logged-in cart" a
 * reachable state at all. See customerAuthService.js for the actual
 * rules; this controller only validates params and shapes responses.
 */

const mongoose = require('mongoose');
const { customerAuthService } = require('../../services/store');

const badRequestError = (message) => {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
};

const requireValidId = (id, label = 'id') => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw badRequestError(`Invalid ${label}.`);
};

// POST /api/store/:storeId/auth/register  { email, password, firstName, lastName, phone }
exports.register = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const { token, customer } = await customerAuthService.register(req.params.storeId, req.body || {});
  res.status(201).json({ success: true, data: { token, customer } });
};

// POST /api/store/:storeId/auth/login  { email, password }
exports.login = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const { token, customer } = await customerAuthService.login(req.params.storeId, req.body || {});
  res.status(200).json({ success: true, data: { token, customer } });
};

// GET /api/store/:storeId/auth/me
exports.me = async (req, res) => {
  requireValidId(req.params.storeId, 'storeId');
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  const decoded = scheme === 'Bearer' ? customerAuthService.verifyToken(token, req.params.storeId) : null;

  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Not signed in.' });
  }

  const customer = await customerAuthService.getSession(req.params.storeId, decoded.customerId);
  res.status(200).json({ success: true, data: { customer } });
};
