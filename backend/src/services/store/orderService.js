'use strict';

/**
 * orderService.js — Order Service
 *
 * Owns every business rule around StoreOrder:
 *   - Admin-facing List / View / Update Status / Delete (previously
 *     orderController.js).
 *   - The storefront checkout flow — re-pricing every line server-side,
 *     checking/decrementing stock via InventoryService, resolving a
 *     coupon code via DiscountService, and rolling the order into the
 *     customer's history via CustomerService (previously
 *     storeStorefrontController.createOrder, which duplicated pricing
 *     logic and never touched inventory or the customer record at all).
 *
 * Centralizing checkout here means there is exactly one place "how is an
 * order priced and what happens to stock when one is placed" is decided,
 * instead of that logic living only inside a single controller function.
 */

const StoreOrder = require('../../models/store/StoreOrder');
const StoreCustomer = require('../../models/store/StoreCustomer');
const StoreProduct = require('../../models/store/StoreProduct');
const { notFoundError, badRequestError } = require('./errors');
const inventoryService = require('./inventoryService');
const discountService = require('./discountService');
const customerService = require('./customerService');
const productService = require('./productService');

const ORDER_STATUSES = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

// Orders in these statuses count as a completed sale for the Best Sellers
// ranking — mirrors analyticsController's COUNTED_STATUSES so "what counts
// as a sale" means the same thing in the admin Analytics tab and on the
// public storefront.
const COUNTED_STATUSES = ['Paid', 'Shipped', 'Delivered'];

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

async function listOrders(storeId, { status, search } = {}) {
  const query = { storeId, isDeleted: false };
  if (status) {
    if (!ORDER_STATUSES.includes(status)) {
      throw badRequestError(`Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}.`);
    }
    query.status = status;
  }
  if (search) query.orderNumber = { $regex: search, $options: 'i' };

  const orders = await StoreOrder.find(query).sort({ createdAt: -1 }).lean();
  return attachCustomers(orders);
}

async function getOrder(storeId, id) {
  const order = await StoreOrder.findOne({ _id: id, storeId, isDeleted: false }).lean();
  if (!order) throw notFoundError('Order not found.');
  const [withCustomer] = await attachCustomers([order]);
  return withCustomer;
}

async function updateOrderStatus(storeId, id, status) {
  if (!status || !ORDER_STATUSES.includes(status)) {
    throw badRequestError(`Status is required and must be one of: ${ORDER_STATUSES.join(', ')}.`);
  }

  const order = await StoreOrder.findOne({ _id: id, storeId, isDeleted: false });
  if (!order) throw notFoundError('Order not found.');

  const wasCancelled = order.status === 'Cancelled';
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

  // Cancelling an order restocks its tracked items exactly once; moving a
  // previously-cancelled order back to an active status is out of scope
  // here (would need re-checking availability) and is intentionally left
  // as a merchant-visible edge case rather than silently re-decrementing.
  if (status === 'Cancelled' && !wasCancelled) {
    await inventoryService.restockForOrder(storeId, order.items);
  }

  return order;
}

async function deleteOrder(storeId, id) {
  const order = await StoreOrder.findOneAndUpdate(
    { _id: id, storeId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!order) throw notFoundError('Order not found.');
  return order;
}

/**
 * POST checkout — re-prices every line from the live StoreProduct record
 * (never trusts a client-supplied price), verifies stock via
 * InventoryService, optionally resolves a discount code via
 * DiscountService, decrements stock, and rolls the order into the
 * customer's history via CustomerService.
 *
 * Body shape: { items: [{ productId, quantity }], customer?: { name, email }, discountCode? }
 */
async function createOrder(storeId, body) {
  const items = Array.isArray(body?.items) ? body.items : [];
  if (items.length === 0) {
    throw badRequestError('Order must include at least one item.');
  }

  // Availability check also gives us the resolved product docs so pricing
  // and stock-checking share a single product lookup.
  const productMap = await inventoryService.checkAvailability(storeId, items);

  const orderItems = [];
  let subtotal = 0;

  for (const line of items) {
    const product = productMap.get(String(line.productId));
    if (!product) continue;
    const quantity = Math.max(parseInt(line.quantity, 10) || 1, 1);
    const price = product.price || 0;
    subtotal += price * quantity;
    orderItems.push({
      productId: product._id,
      title: product.title,
      quantity,
      price,
    });
  }

  if (orderItems.length === 0) {
    throw badRequestError('None of the submitted items matched a real, available product.');
  }

  let discountResult = null;
  if (body?.discountCode) {
    discountResult = await discountService.resolveForOrder(storeId, body.discountCode, subtotal);
  }
  const discountAmount = discountResult?.amount || 0;
  const total = Math.max(0, subtotal - discountAmount);

  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const firstProduct = productMap.get(String(orderItems[0].productId));

  const order = await StoreOrder.create({
    storeId,
    orderNumber,
    items: orderItems,
    subtotal,
    discountId: discountResult?.discountId || null,
    discountAmount,
    total,
    currency: firstProduct?.currency || 'USD',
    paymentStatus: 'Pending',
    fulfillmentStatus: 'Unfulfilled',
    status: 'Pending',
  });

  // Deduct stock and roll the order into the customer's history. Neither
  // failure here should undo order creation (payment capture is a
  // separate, later step in the checkout flow) but both are logged so
  // the underlying causes surface instead of failing silently.
  try {
    await inventoryService.decrementForOrder(storeId, orderItems);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[OrderService] inventory decrement failed for order', order._id, err);
  }

  try {
    const customer = await customerService.recordOrder(storeId, body?.customer || {}, total);
    if (customer) {
      order.customerId = customer._id;
      await order.save();
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[OrderService] customer rollup failed for order', order._id, err);
  }

  if (discountResult?.discountId) {
    await discountService.markUsed(discountResult.discountId);
  }

  return order;
}

/**
 * Best Sellers section — aggregates completed-order line items (Paid /
 * Shipped / Delivered) into units sold per product, ranks by units sold,
 * then re-fetches the live, Active StoreProduct docs for those ids so the
 * section always reflects current price/stock/images — never a snapshot
 * frozen at order time. Falls back to the newest Active products when a
 * store has no completed orders yet, same fallback strategy as Featured
 * Products, so the section is never empty on day one, and is always
 * computed from the database, never hardcoded.
 */
async function getBestSellers(storeId, limit = 8) {
  const orders = await StoreOrder.find({
    storeId,
    isDeleted: false,
    status: { $in: COUNTED_STATUSES },
  })
    .select('items')
    .lean();

  const unitsByProduct = new Map();
  for (const order of orders) {
    for (const item of order.items || []) {
      if (!item.productId) continue;
      const key = String(item.productId);
      unitsByProduct.set(key, (unitsByProduct.get(key) || 0) + (Number(item.quantity) || 0));
    }
  }

  const rankedIds = Array.from(unitsByProduct.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (rankedIds.length === 0) {
    return productService.getLatestProducts(storeId, limit);
  }

  const products = await StoreProduct.find({
    _id: { $in: rankedIds },
    storeId,
    isDeleted: false,
    status: 'Active',
  });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  // Re-order to match the units-sold ranking (Mongo's $in doesn't
  // preserve input order), dropping any id that's no longer Active.
  return rankedIds.map((id) => productMap.get(id)).filter(Boolean);
}

module.exports = {
  ORDER_STATUSES,
  listOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
  createOrder,
  getBestSellers,
};