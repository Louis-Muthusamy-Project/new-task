'use strict';

/**
 * orderService.js — Order Service
 *
 * The single place that orchestrates everything that must happen when a
 * customer buys: create the order, reduce inventory, roll the sale into
 * the customer's history, and send the confirmation. Nothing outside this
 * file decrements stock, writes ordersCount/totalSpent, or sends a
 * transactional email — every one of those is delegated to its own
 * service (InventoryService / CustomerService / NotificationService) and
 * called from exactly one place: here. Analytics and the admin Orders
 * Module read the same `StoreOrder` records this function writes (see
 * analyticsController.getAnalytics and orderController.js) rather than a
 * denormalized copy, so both reflect a new order automatically, with no
 * separate "sync" step required.
 *
 * Owns every business rule around StoreOrder:
 *   - Admin-facing List / View / Update Status / Delete (previously
 *     orderController.js).
 *   - The storefront checkout flow — re-pricing every line server-side,
 *     checking/decrementing stock via InventoryService, resolving a
 *     coupon code via DiscountService, rolling the order into the
 *     customer's history via CustomerService, and sending the order
 *     confirmation via NotificationService (previously
 *     storeStorefrontController.createOrder, which duplicated pricing
 *     logic and never touched inventory, the customer record, or a
 *     confirmation email at all).
 *
 * Centralizing checkout here means there is exactly one place "how is an
 * order priced and what happens when one is placed" is decided, instead
 * of that logic living only inside a single controller function.
 */

const StoreOrder = require('../../models/store/StoreOrder');
const StoreCustomer = require('../../models/store/StoreCustomer');
const StoreProduct = require('../../models/store/StoreProduct');
const { notFoundError, badRequestError } = require('./errors');
const inventoryService = require('./inventoryService');
const discountService = require('./discountService');
const customerService = require('./customerService');
const productService = require('./productService');
const notificationService = require('./notificationService');
const { emitStoreEvent } = require('./storeEvents');

// Payment methods a shopper can choose at the Payment step of checkout —
// kept in sync with StorePayment.PROVIDERS (the admin-configurable set),
// this is just the vocabulary OrderService accepts on an order.
const PAYMENT_METHODS = ['razorpay', 'stripe', 'paypal', 'cod'];

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

  emitStoreEvent(storeId, 'order.updated', { orderId: order._id, status: order.status });

  // Shipped/Cancelled are the two merchant-driven transitions a customer
  // actually needs to hear about — routed through the same
  // NotificationService.resolveAndSend() checkout uses for the initial
  // confirmation, so there is still exactly one implementation of
  // "compose + deliver a transactional email," not a second copy living
  // here. Never blocks or fails the status update itself.
  if (status === 'Shipped' || status === 'Cancelled') {
    try {
      const customer = order.customerId
        ? await StoreCustomer.findOne({ _id: order.customerId, storeId }).lean()
        : null;
      await notificationService.sendOrderStatusEmail(storeId, order, customer, status);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[OrderService] status notification failed for order', order._id, err);
    }
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

  const paymentMethod = body?.paymentMethod ? String(body.paymentMethod).toLowerCase() : null;
  if (paymentMethod && !PAYMENT_METHODS.includes(paymentMethod)) {
    throw badRequestError(`Invalid payment method. Must be one of: ${PAYMENT_METHODS.join(', ')}.`);
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
  // Shipping is priced by the Shipping step of checkout (see
  // cartService.getCartView, which already applies the store's free-
  // shipping threshold) and passed through as-is here — OrderService
  // re-derives everything else (items, discount) itself, but a shipping
  // *rate* isn't re-priceable from an id alone the way a product is, so
  // the client-selected { name, price } pair is trusted the same way an
  // admin-configured shipping zone would be read at read time elsewhere.
  const shippingAmount = Math.max(0, Number(body?.shippingAmount) || 0);
  const total = Math.max(0, subtotal - discountAmount + shippingAmount);

  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const firstProduct = productMap.get(String(orderItems[0].productId));

  // Cash on Delivery has nothing to "capture" — it's Paid only once the
  // merchant marks it delivered (see OrderService.updateOrderStatus).
  // Every other method in this project is a simulated capture (no real
  // gateway keys/network wired up), so it's marked Paid immediately —
  // this keeps the demo checkout flow completable end-to-end without
  // pretending Razorpay/Stripe/PayPal are actually integrated.
  const isCod = paymentMethod === 'cod';

  const order = await StoreOrder.create({
    storeId,
    orderNumber,
    items: orderItems,
    subtotal,
    discountId: discountResult?.discountId || null,
    discountAmount,
    shippingAmount,
    total,
    currency: firstProduct?.currency || 'USD',
    paymentStatus: isCod ? 'Pending' : 'Paid',
    fulfillmentStatus: 'Unfulfilled',
    status: isCod ? 'Pending' : 'Paid',
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

  // A signed-in shopper's own account is the customer of record; a guest
  // checkout falls back to find-or-create-by-email exactly as before.
  // Hoisted above the try block (rather than declared inside it) so the
  // confirmation-email step below can use whichever customer record was
  // resolved here, instead of re-deriving it a second time.
  let customer = null;
  try {
    if (body?.customerId) {
      customer = await StoreCustomer.findOne({ _id: body.customerId, storeId, isDeleted: false });
      if (customer) {
        customer.ordersCount += 1;
        customer.totalSpent += total;
        await customer.save();
      }
    }
    if (!customer) {
      customer = await customerService.recordOrder(storeId, body?.customer || {}, total);
    }
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

  // Send Confirmation — the last leg of the sync loop. Routed through
  // NotificationService rather than composing/sending anything here, so
  // OrderService stays the *orchestrator* (decide when a confirmation
  // goes out) while NotificationService remains the only place that knows
  // *how* to render a template and deliver it. A delivery failure is
  // logged and recorded on the order (see NotificationService), never
  // thrown — a shopper's order is complete the moment it's created,
  // regardless of whether the email round-trips.
  try {
    await notificationService.sendOrderConfirmation(storeId, order, customer);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[OrderService] confirmation email failed for order', order._id, err);
  }

  // Feeds the Inventory step's real-time fan-out (already wired via
  // inventoryService.decrementForOrder → inventory.updated) and, new
  // here, tells any open Admin Analytics/Orders tab a sale just
  // happened — closing the "Order → Inventory → Confirmation →
  // Analytics" loop without the Analytics tab needing to poll.
  emitStoreEvent(storeId, 'order.created', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    total: order.total,
    status: order.status,
  });

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
  PAYMENT_METHODS,
  listOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
  createOrder,
  getBestSellers,
};