'use strict';

/**
 * analyticsController.js — Analytics Module (admin)
 *
 * Unlike shipping/payments/email, analytics has no settings document to
 * find-or-create — every number here is computed on the fly for a rolling
 * date window, from three sources:
 *   - StoreOrder      → Sales, Orders, Revenue, Conversions, Top products
 *                        (by revenue), Top customers
 *   - StoreVisit       → Visitors (distinct sessionId)
 *   - StoreAnalyticsEvent → Product views, Searches, Cart adds,
 *                        Checkout starts, and the Top viewed products /
 *                        Top search terms breakdowns
 *
 * Purchases and Revenue are deliberately read only from StoreOrder — it's
 * the single source of truth for a completed sale (real inventory
 * deduction, real payment/fulfillment status), so nothing here duplicates
 * that bookkeeping into a second, event-log copy that could drift out of
 * sync.
 *
 * Used by the Analytics tab in StoresTab.jsx (stat cards: Visitors,
 * Product Views, Searches, Cart Adds, Checkout Starts, Sales, Orders,
 * Revenue, Conversion; a funnel; Top products; Top search terms; Top
 * customers).
 */

const mongoose = require('mongoose');
const Store = require('../../models/store/Store');
const StoreOrder = require('../../models/store/StoreOrder');
const StoreVisit = require('../../models/store/StoreVisit');
const StoreAnalyticsEvent = require('../../models/store/StoreAnalyticsEvent');
const StoreProduct = require('../../models/store/StoreProduct');
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

// Orders in these statuses count as a completed sale. Pending (not yet
// paid) and Cancelled are excluded from Sales/Orders/Revenue, matching
// what a merchant actually cares about in an analytics summary.
const COUNTED_STATUSES = ['Paid', 'Shipped', 'Delivered'];

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/analytics?days=30
// ─────────────────────────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const store = await Store.findOne({ _id: storeId, isDeleted: false }).lean();
  if (!store) throw notFoundError('Store not found.');

  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [orders, visitorIds] = await Promise.all([
    StoreOrder.find({
      storeId,
      isDeleted: false,
      status: { $in: COUNTED_STATUSES },
      createdAt: { $gte: since },
    }).lean(),
    StoreVisit.distinct('sessionId', { storeId, createdAt: { $gte: since } }),
  ]);

  const revenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const ordersCount = orders.length;
  const sales = orders.reduce(
    (sum, o) => sum + (o.items || []).reduce((s, i) => s + (Number(i.quantity) || 0), 0),
    0
  );
  const visitors = visitorIds.length;
  const conversionRate = visitors > 0 ? (ordersCount / visitors) * 100 : 0;

  // Top products by revenue within the window, from the same order set —
  // no extra query needed.
  const productTotals = new Map();
  for (const order of orders) {
    for (const item of order.items || []) {
      const key = item.productId ? String(item.productId) : item.title;
      const entry = productTotals.get(key) || { title: item.title, units: 0, revenue: 0 };
      entry.units += Number(item.quantity) || 0;
      entry.revenue += (Number(item.quantity) || 0) * (Number(item.price) || 0);
      productTotals.set(key, entry);
    }
  }
  const topProducts = Array.from(productTotals.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Daily series (oldest → newest) for a trend chart — revenue/orders per
  // calendar day plus that day's distinct visitor count.
  const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
  const seriesMap = new Map();
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    seriesMap.set(dayKey(d), { date: dayKey(d), revenue: 0, orders: 0, visitors: 0 });
  }
  for (const order of orders) {
    const key = dayKey(order.createdAt);
    if (seriesMap.has(key)) {
      seriesMap.get(key).revenue += Number(order.total) || 0;
      seriesMap.get(key).orders += 1;
    }
  }
  const visits = await StoreVisit.find({ storeId, createdAt: { $gte: since } }, 'sessionId createdAt').lean();
  const seenPerDay = new Map();
  for (const v of visits) {
    const key = dayKey(v.createdAt);
    if (!seriesMap.has(key)) continue;
    if (!seenPerDay.has(key)) seenPerDay.set(key, new Set());
    seenPerDay.get(key).add(v.sessionId);
  }
  for (const [key, set] of seenPerDay.entries()) {
    seriesMap.get(key).visitors = set.size;
  }
  const series = Array.from(seriesMap.values()).sort((a, b) => (a.date < b.date ? -1 : 1));

  // ── Funnel events (Product Views / Searches / Cart Adds / Checkout
  // Starts) — one aggregation over StoreAnalyticsEvent grouped by type
  // gives every count in a single round trip; Purchases below still
  // comes from `ordersCount` above, not from an event count, per the
  // module docstring.
  const storeObjectId = new mongoose.Types.ObjectId(storeId);
  const eventCountsAgg = await StoreAnalyticsEvent.aggregate([
    { $match: { storeId: storeObjectId, createdAt: { $gte: since } } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);
  const eventCounts = eventCountsAgg.reduce((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});
  const productViews = eventCounts.product_view || 0;
  const searches = eventCounts.search || 0;
  const cartAdds = eventCounts.cart_add || 0;
  const checkoutStarts = eventCounts.checkout_start || 0;

  // Top viewed products — grouped by productId, joined against
  // StoreProduct for a display title (a view can happen for a product
  // later deleted/renamed, so title is looked up fresh, not stored on
  // the event).
  const topViewedAgg = await StoreAnalyticsEvent.aggregate([
    { $match: { storeId: storeObjectId, type: 'product_view', createdAt: { $gte: since }, productId: { $ne: null } } },
    { $group: { _id: '$productId', views: { $sum: 1 } } },
    { $sort: { views: -1 } },
    { $limit: 5 },
  ]);
  const viewedProductIds = topViewedAgg.map((r) => r._id).filter(Boolean);
  const viewedProductDocs = viewedProductIds.length
    ? await StoreProduct.find({ _id: { $in: viewedProductIds } }, 'title').lean()
    : [];
  const viewedTitleById = new Map(viewedProductDocs.map((p) => [String(p._id), p.title]));
  const topViewedProducts = topViewedAgg.map((r) => ({
    productId: r._id,
    title: viewedTitleById.get(String(r._id)) || 'Deleted product',
    views: r.views,
  }));

  // Top search terms — grouped case/whitespace-insensitively so "Shoes"
  // and " shoes " roll into the same row.
  const topSearchTermsAgg = await StoreAnalyticsEvent.aggregate([
    { $match: { storeId: storeObjectId, type: 'search', createdAt: { $gte: since }, query: { $ne: '' } } },
    { $group: { _id: { $toLower: { $trim: { input: '$query' } } }, searches: { $sum: 1 } } },
    { $sort: { searches: -1 } },
    { $limit: 5 },
  ]);
  const topSearchTerms = topSearchTermsAgg
    .filter((r) => r._id)
    .map((r) => ({ query: r._id, searches: r.searches }));

  // Top customers by revenue within the window, from the same order set
  // used for topProducts above — every order (guest or signed-in) has a
  // customerId (see orderService.createOrder), so this covers guest
  // checkouts too, not just registered accounts.
  const customerTotals = new Map();
  for (const order of orders) {
    if (!order.customerId) continue;
    const key = String(order.customerId);
    const entry = customerTotals.get(key) || { customerId: order.customerId, orders: 0, revenue: 0 };
    entry.orders += 1;
    entry.revenue += Number(order.total) || 0;
    customerTotals.set(key, entry);
  }
  const topCustomerTotals = Array.from(customerTotals.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  const topCustomerIds = topCustomerTotals.map((c) => c.customerId);
  const topCustomerDocs = topCustomerIds.length
    ? await StoreCustomer.find({ _id: { $in: topCustomerIds } }, 'firstName lastName email').lean()
    : [];
  const customerById = new Map(topCustomerDocs.map((c) => [String(c._id), c]));
  const topCustomers = topCustomerTotals.map((c) => {
    const doc = customerById.get(String(c.customerId));
    const name = doc ? [doc.firstName, doc.lastName].filter(Boolean).join(' ') : '';
    return {
      customerId: c.customerId,
      name: name || 'Guest',
      email: doc?.email || '',
      orders: c.orders,
      revenue: c.revenue,
    };
  });

  // Conversion funnel — each step as a share of Visitors, so a merchant
  // can see where shoppers drop off (e.g. lots of Product Views but few
  // Cart Adds signals a pricing/PDP problem, not a traffic problem).
  const rate = (n) => (visitors > 0 ? (n / visitors) * 100 : 0);
  const funnel = [
    { step: 'Visitors', count: visitors, rate: 100 },
    { step: 'Product Views', count: productViews, rate: rate(productViews) },
    { step: 'Cart Adds', count: cartAdds, rate: rate(cartAdds) },
    { step: 'Checkout Starts', count: checkoutStarts, rate: rate(checkoutStarts) },
    { step: 'Purchases', count: ordersCount, rate: rate(ordersCount) },
  ];

  res.status(200).json({
    success: true,
    data: {
      days,
      currency: orders[0]?.currency || store.currency || 'USD',
      visitors,
      sales,
      orders: ordersCount,
      revenue,
      conversionRate,
      productViews,
      searches,
      cartAdds,
      checkoutStarts,
      topProducts,
      topViewedProducts,
      topSearchTerms,
      topCustomers,
      funnel,
      series,
    },
  });
};