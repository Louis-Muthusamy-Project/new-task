'use strict';

/**
 * cartService.js — Cart Service
 *
 * The single place that understands what a shopper's cart is. Before
 * this existed, "the cart" only lived in a component's React state (or
 * nowhere) — refreshing the page, closing the tab, or logging in on a
 * second device lost it entirely. Every mutation below is a write to
 * StoreCart; the frontend never computes cart state itself, it only ever
 * renders what this service returns.
 *
 * Identity — exactly one of:
 *   { guestToken }    a browser-generated token persisted in localStorage
 *   { customerId }    a signed-in shopper (see customerAuthService.js)
 *
 * Pricing — mirrors OrderService's rule: a cart's stored `items` are just
 * `{ productId, quantity }`; price/title/image/in-stock are always
 * re-read live from StoreProduct in `getCartView`, never trusted from
 * whatever was true when the item was added. That's what makes a price
 * change or a sellout show up in an already-open cart immediately.
 */

const mongoose = require('mongoose');
const StoreCart = require('../../models/store/StoreCart');
const StoreProduct = require('../../models/store/StoreProduct');
const StoreShipping = require('../../models/store/StoreShipping');
const { notFoundError, badRequestError } = require('./errors');
const inventoryService = require('./inventoryService');
const discountService = require('./discountService');

function requireValidId(id, label = 'id') {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw badRequestError(`Invalid ${label}.`);
  }
}

/**
 * Builds the { guestToken } | { customerId } query fragment for a given
 * identity, and validates that exactly one was supplied — every public
 * function below takes this same `identity` shape.
 */
function identityQuery(identity = {}) {
  const { guestToken, customerId } = identity;
  if (customerId) {
    requireValidId(customerId, 'customerId');
    return { customerId, guestToken: null };
  }
  if (guestToken && String(guestToken).trim()) {
    return { guestToken: String(guestToken).trim(), customerId: null };
  }
  throw badRequestError('A guest token or a signed-in session is required to use the cart.');
}

/**
 * Finds this identity's open cart, creating one if it doesn't exist yet.
 * Idempotent thanks to StoreCart's partial unique indexes — two
 * concurrent "add to cart" clicks from a brand-new guest resolve to the
 * same document rather than racing to create two.
 */
async function getOrCreateCart(storeId, identity) {
  requireValidId(storeId, 'storeId');
  const query = identityQuery(identity);

  let cart = await StoreCart.findOne({ storeId, ...query, isDeleted: false });
  if (cart) return cart;

  try {
    cart = await StoreCart.create({ storeId, ...query });
  } catch (err) {
    // Duplicate-key race: another request created it a moment earlier.
    if (err?.code === 11000) {
      cart = await StoreCart.findOne({ storeId, ...query, isDeleted: false });
    } else {
      throw err;
    }
  }
  return cart;
}

async function addItem(storeId, identity, productId, quantity = 1) {
  requireValidId(productId, 'productId');
  const qty = Math.max(parseInt(quantity, 10) || 1, 1);

  const cart = await getOrCreateCart(storeId, identity);
  const existing = cart.items.find((i) => String(i.productId) === String(productId));
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.items.push({ productId, quantity: qty });
  }
  await cart.save();
  return cart;
}

async function updateItemQuantity(storeId, identity, productId, quantity) {
  requireValidId(productId, 'productId');
  const qty = Math.max(parseInt(quantity, 10) || 0, 0);

  const cart = await getOrCreateCart(storeId, identity);
  const idx = cart.items.findIndex((i) => String(i.productId) === String(productId));
  if (idx === -1) throw notFoundError('That item is not in the cart.');

  if (qty === 0) {
    cart.items.splice(idx, 1);
  } else {
    cart.items[idx].quantity = qty;
  }
  await cart.save();
  return cart;
}

async function removeItem(storeId, identity, productId) {
  requireValidId(productId, 'productId');
  const cart = await getOrCreateCart(storeId, identity);
  cart.items = cart.items.filter((i) => String(i.productId) !== String(productId));
  await cart.save();
  return cart;
}

async function clearCart(storeId, identity) {
  const cart = await getOrCreateCart(storeId, identity);
  cart.items = [];
  cart.discountCode = '';
  cart.shippingChoice = { zoneId: null, rateName: '', price: 0 };
  await cart.save();
  return cart;
}

async function setDiscountCode(storeId, identity, code) {
  const cart = await getOrCreateCart(storeId, identity);
  cart.discountCode = code ? String(code).trim().toUpperCase() : '';
  await cart.save();
  return cart;
}

async function setContact(storeId, identity, { email, shippingAddress } = {}) {
  const cart = await getOrCreateCart(storeId, identity);
  if (email != null) cart.contactEmail = String(email).trim().toLowerCase();
  if (shippingAddress && typeof shippingAddress === 'object') {
    cart.shippingAddress = { ...cart.shippingAddress?.toObject?.(), ...shippingAddress };
  }
  await cart.save();
  return cart;
}

async function setShippingChoice(storeId, identity, { zoneId, rateName, price }) {
  const cart = await getOrCreateCart(storeId, identity);
  cart.shippingChoice = {
    zoneId: zoneId && mongoose.Types.ObjectId.isValid(zoneId) ? zoneId : null,
    rateName: rateName || '',
    price: Number(price) || 0,
  };
  await cart.save();
  return cart;
}

async function setPaymentMethod(storeId, identity, method) {
  const cart = await getOrCreateCart(storeId, identity);
  cart.paymentMethod = method || '';
  await cart.save();
  return cart;
}

/**
 * Re-prices a cart's items live against current StoreProduct records and
 * returns the shape the frontend actually renders — subtotal, per-line
 * current price/title/image/stock, whether the discount code on the cart
 * still resolves, and the running total including the persisted shipping
 * choice. Never mutates the cart itself (that's what checkout does).
 */
async function getCartView(storeId, cart) {
  const productIds = cart.items.map((i) => i.productId);
  const products = productIds.length
    ? await StoreProduct.find({ _id: { $in: productIds }, storeId, isDeleted: false })
    : [];
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  let subtotal = 0;
  const lines = cart.items.map((item) => {
    const product = productMap.get(String(item.productId));
    if (!product) {
      return {
        productId: item.productId,
        quantity: item.quantity,
        title: 'Product no longer available',
        price: 0,
        image: '',
        available: false,
        inStock: false,
        lineTotal: 0,
      };
    }
    const available = product.status === 'Active';
    const inStock = inventoryService.isInStock(product);
    const lineTotal = available ? product.price * item.quantity : 0;
    subtotal += lineTotal;
    return {
      productId: product._id,
      quantity: item.quantity,
      title: product.title,
      price: product.price,
      currency: product.currency || 'USD',
      image: (product.images && product.images[0]) || '',
      available,
      inStock,
      maxQuantity: product.trackInventory ? product.inventoryQuantity : null,
      lineTotal,
    };
  });

  let discount = null;
  if (cart.discountCode) {
    try {
      const resolved = await discountService.resolveForOrder(storeId, cart.discountCode, subtotal);
      discount = { code: cart.discountCode, amount: resolved.amount, valid: true };
    } catch (err) {
      discount = { code: cart.discountCode, amount: 0, valid: false, reason: err.message };
    }
  }

  // Free-shipping threshold override, same rule OrderService/Shipping tab
  // expect: if the store has one configured and the subtotal clears it,
  // the persisted shipping choice's price is waived at view time (the
  // shopper still sees which rate/name they picked, just $0).
  const shipping = await StoreShipping.findOne({ storeId }).lean();
  let shippingPrice = cart.shippingChoice?.price || 0;
  if (shipping?.freeShippingThreshold != null && subtotal >= shipping.freeShippingThreshold) {
    shippingPrice = 0;
  }

  const discountAmount = discount?.valid ? discount.amount : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingPrice);
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    id: cart._id,
    items: lines,
    itemCount,
    subtotal,
    discount,
    shippingChoice: cart.shippingChoice?.rateName
      ? { ...cart.shippingChoice.toObject?.() || cart.shippingChoice, price: shippingPrice }
      : null,
    contactEmail: cart.contactEmail || '',
    shippingAddress: cart.shippingAddress || {},
    paymentMethod: cart.paymentMethod || '',
    total,
    hasUnavailableItems: lines.some((l) => !l.available || (l.maxQuantity != null && l.quantity > l.maxQuantity)),
  };
}

/**
 * Folds a guest cart's items into the target customer's cart on login —
 * the "merge carts after login" requirement. Quantities for the same
 * product are summed; the guest cart is then deleted so a subsequent
 * logout-then-login-as-guest doesn't resurrect it. Idempotent: calling
 * this with no matching guest cart (already merged, or never had one) is
 * a no-op, not an error, since the frontend calls it unconditionally
 * right after every login/register.
 */
async function mergeGuestIntoCustomer(storeId, guestToken, customerId) {
  requireValidId(storeId, 'storeId');
  requireValidId(customerId, 'customerId');
  if (!guestToken) return getOrCreateCart(storeId, { customerId });

  const guestCart = await StoreCart.findOne({ storeId, guestToken, isDeleted: false });
  const customerCart = await getOrCreateCart(storeId, { customerId });

  if (!guestCart || guestCart.items.length === 0) {
    if (guestCart) await StoreCart.deleteOne({ _id: guestCart._id });
    return customerCart;
  }

  for (const guestItem of guestCart.items) {
    const existing = customerCart.items.find(
      (i) => String(i.productId) === String(guestItem.productId)
    );
    if (existing) {
      existing.quantity += guestItem.quantity;
    } else {
      customerCart.items.push({ productId: guestItem.productId, quantity: guestItem.quantity });
    }
  }

  // Prefer whatever checkout-in-progress details the guest had entered if
  // the customer cart doesn't already have its own (e.g. a shopper who
  // filled in Shipping as a guest, then logged in at the Payment step).
  if (guestCart.contactEmail && !customerCart.contactEmail) {
    customerCart.contactEmail = guestCart.contactEmail;
  }
  if (guestCart.shippingAddress?.line1 && !customerCart.shippingAddress?.line1) {
    customerCart.shippingAddress = guestCart.shippingAddress.toObject
      ? guestCart.shippingAddress.toObject()
      : guestCart.shippingAddress;
  }
  if (guestCart.discountCode && !customerCart.discountCode) {
    customerCart.discountCode = guestCart.discountCode;
  }

  await customerCart.save();
  await StoreCart.deleteOne({ _id: guestCart._id });
  return customerCart;
}

module.exports = {
  getOrCreateCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  setDiscountCode,
  setContact,
  setShippingChoice,
  setPaymentMethod,
  getCartView,
  mergeGuestIntoCustomer,
};
