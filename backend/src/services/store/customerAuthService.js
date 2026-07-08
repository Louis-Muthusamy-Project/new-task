'use strict';

/**
 * customerAuthService.js — Storefront Customer Auth Service
 *
 * A real shopper account system, distinct from the agency dashboard's
 * `AuthContext` (that one is internal-staff role switching, not a
 * customer-facing login). This is what makes "logged-in cart" a
 * meaningful, separate state from "guest cart": a shopper who registers
 * or logs in gets a JWT scoped to `{ storeId, customerId }`, and
 * CartService uses that identity instead of a guestToken.
 *
 * Deliberately minimal — no password reset flow, no email verification —
 * this covers exactly what the cart-merge requirement needs: a real
 * account a shopper can log into on this device or another one.
 */

const jwt = require('jsonwebtoken');
const StoreCustomer = require('../../models/store/StoreCustomer');
const Store = require('../../models/store/Store');
const { notFoundError, badRequestError } = require('./errors');
const { hashPassword, verifyPassword } = require('../../utils/passwordUtils');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_TTL = '30d'; // a shopper's cart/session should survive well past one browser session

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error('JWT secret is not configured on the server.');
    err.statusCode = 500;
    throw err;
  }
  return secret;
}

function issueToken(storeId, customer) {
  return jwt.sign(
    {
      storeId: String(storeId),
      customerId: String(customer._id),
      email: customer.email,
      // `aud` keeps this token from being usable against the admin
      // jwtMiddleware (which never checks `aud`) or vice versa being
      // confused for a customer session — cheap, explicit separation.
      aud: 'storefront-customer',
    },
    getJwtSecret(),
    { expiresIn: TOKEN_TTL }
  );
}

function toPublicCustomer(customer) {
  return {
    id: customer._id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
  };
}

async function assertStoreExists(storeId) {
  const store = await Store.findOne({ _id: storeId, isDeleted: false }).lean();
  if (!store) throw notFoundError('Store not found.');
  return store;
}

/**
 * Registers a new storefront account, or — if a StoreCustomer with this
 * email already exists (e.g. rolled up from a prior guest checkout via
 * CustomerService.recordOrder) — attaches a password to that existing
 * record instead of creating a duplicate. This matters: a shopper who
 * checked out as a guest once, then comes back to create an account with
 * the same email, should end up with ONE customer record carrying their
 * order history, not a second empty one.
 */
async function register(storeId, { email, password, firstName, lastName, phone }) {
  await assertStoreExists(storeId);

  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(normalizedEmail)) throw badRequestError('A valid email is required.');
  if (!password || String(password).length < 8) {
    throw badRequestError('Password must be at least 8 characters.');
  }

  let customer = await StoreCustomer.findOne({ storeId, email: normalizedEmail, isDeleted: false }).select(
    '+passwordHash'
  );

  if (customer && customer.passwordHash) {
    throw badRequestError('An account with this email already exists. Try logging in instead.');
  }

  const passwordHash = await hashPassword(password);

  if (customer) {
    // Existing guest-checkout customer record — just attach credentials.
    customer.passwordHash = passwordHash;
    if (firstName) customer.firstName = firstName;
    if (lastName) customer.lastName = lastName;
    if (phone) customer.phone = phone;
    await customer.save();
  } else {
    customer = await StoreCustomer.create({
      storeId,
      email: normalizedEmail,
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      passwordHash,
    });
  }

  return { token: issueToken(storeId, customer), customer: toPublicCustomer(customer) };
}

async function login(storeId, { email, password }) {
  await assertStoreExists(storeId);

  const normalizedEmail = String(email || '').trim().toLowerCase();
  const customer = await StoreCustomer.findOne({
    storeId,
    email: normalizedEmail,
    isDeleted: false,
  }).select('+passwordHash');

  if (!customer || !customer.passwordHash) {
    throw badRequestError('Invalid email or password.');
  }

  const valid = await verifyPassword(password, customer.passwordHash);
  if (!valid) throw badRequestError('Invalid email or password.');

  return { token: issueToken(storeId, customer), customer: toPublicCustomer(customer) };
}

/**
 * Verifies a customer JWT and returns the decoded payload, or null if
 * missing/invalid/expired/wrong-store — used by requireCustomerAuth
 * (mandatory) and optionalCustomerAuth (best-effort) middleware below.
 */
function verifyToken(token, storeId) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (decoded.aud !== 'storefront-customer') return null;
    if (String(decoded.storeId) !== String(storeId)) return null;
    return decoded;
  } catch {
    return null;
  }
}

async function getSession(storeId, customerId) {
  const customer = await StoreCustomer.findOne({ _id: customerId, storeId, isDeleted: false }).lean();
  if (!customer) throw notFoundError('Account not found.');
  return toPublicCustomer(customer);
}

module.exports = {
  register,
  login,
  verifyToken,
  getSession,
  toPublicCustomer,
};
