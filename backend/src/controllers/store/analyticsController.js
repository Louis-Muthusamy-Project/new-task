'use strict';

/**
 * analyticsController.js — Analytics Module (admin)
 *
 * Unlike shipping/payments/email, analytics has no settings document to
 * find-or-create — every number here is computed on the fly from
 * StoreOrder (sales-side) and StoreVisit (traffic-side) for a rolling
 * date window. Used by the Analytics tab in StoresTab.jsx (stat cards:
 * Visitors, Sales, Orders, Revenue, Conversion + a Top products table).
 */

const mongoose = require('mongoose');
const Store = require('../../models/store/Store');
const StoreOrder = require('../../models/store/StoreOrder');
const StoreVisit = require('../../models/store/StoreVisit');

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
      topProducts,
      series,
    },
  });
};
