'use strict';

/**
 * taxService.js — Tax Service
 *
 * The single place that knows a store's tax rate and how to apply it.
 * Mirrors the shape of ShippingService/DiscountService: a find-or-create
 * settings document (StoreTax) plus a pure calculation function.
 *
 * Consumed by exactly two callers, the same two places every other
 * pricing concern (discount, shipping) is applied:
 *   - CartService.getCartView  — so a shopper sees tax on an open cart
 *     before checking out (never a surprise added only at the order).
 *   - OrderService.createOrder — the authoritative, re-computed-server-
 *     side amount actually charged and persisted onto StoreOrder.taxAmount.
 * Neither caller computes tax itself; both call calculateTax() here, so
 * "how is tax computed" is decided in exactly one place.
 */

const mongoose = require('mongoose');
const StoreTax = require('../../models/store/StoreTax');
const { badRequestError } = require('./errors');

async function getOrCreateTax(storeId) {
  let tax = await StoreTax.findOne({ storeId });
  if (!tax) {
    tax = await StoreTax.create({ storeId });
  }
  return tax;
}

async function getTaxSettings(storeId) {
  return getOrCreateTax(storeId);
}

async function updateTaxSettings(storeId, { rate, isEnabled, label } = {}) {
  const tax = await getOrCreateTax(storeId);

  if (rate !== undefined) {
    const numeric = Number(rate);
    if (Number.isNaN(numeric) || numeric < 0 || numeric > 100) {
      throw badRequestError('Tax rate must be a number between 0 and 100.');
    }
    tax.rate = numeric;
  }
  if (isEnabled !== undefined) tax.isEnabled = !!isEnabled;
  if (label !== undefined) tax.label = String(label || '').trim() || 'Sales tax';

  await tax.save();
  return tax;
}

/**
 * Computes the tax owed on a taxable amount (subtotal, already net of
 * any discount — "tax is calculated on the cart subtotal after
 * discounts," matching the Tax & checkout copy in StoresTab.jsx).
 * Returns { rate, amount, label } rather than a bare number so callers
 * can display the rate/label without a second lookup.
 */
async function calculateTax(storeId, taxableAmount) {
  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    return { rate: 0, amount: 0, label: 'Sales tax', enabled: false };
  }
  const tax = await getOrCreateTax(storeId);
  const base = Math.max(0, Number(taxableAmount) || 0);
  if (!tax.isEnabled || !tax.rate) {
    return { rate: tax.rate || 0, amount: 0, label: tax.label, enabled: !!tax.isEnabled };
  }
  const amount = Math.round(base * (tax.rate / 100) * 100) / 100;
  return { rate: tax.rate, amount, label: tax.label, enabled: true };
}

module.exports = {
  getTaxSettings,
  updateTaxSettings,
  calculateTax,
};
