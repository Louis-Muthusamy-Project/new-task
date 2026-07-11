const mongoose = require('mongoose');
const FunnelAnalyticsEvent = require('../models/FunnelAnalyticsEvent');
const FunnelStep = require('../models/FunnelStep');
const Funnel = require('../models/Funnel');
const StoreOrder = require('../models/store/StoreOrder');
const { resolveAnalyticsDays } = require('../utils/dateRange');

const invalidIdError = () => {
  const error = new Error('Invalid funnel id.');
  error.statusCode = 400;
  return error;
};

const notFoundError = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

// Same "what counts as a completed sale" definition as orderService and
// Store's analyticsController — so Funnel and Store analytics answer
// "how much revenue" identically for the orders that live in both worlds.
const COUNTED_STATUSES = ['Paid', 'Shipped', 'Delivered'];
exports.COUNTED_STATUSES = COUNTED_STATUSES;

/**
 * GET /api/funnels/:funnelId/analytics?days=30
 *
 * Revenue / Orders / AOV come EXCLUSIVELY from StoreOrder (filtered by
 * StoreOrder.funnelId / stepId, written by funnelCheckoutService — see
 * orderService.createOrder) — never from FunnelAnalyticsEvent. This
 * mirrors Store's own analyticsController.getAnalytics, which reads
 * Purchases/Revenue only from StoreOrder for the same reason: it's the
 * single source of truth for a completed sale (real inventory deduction,
 * real payment/fulfillment status), so nothing here duplicates that
 * bookkeeping into a second, event-log copy that could drift out of sync.
 *
 * FunnelAnalyticsEvent is read ONLY for pre-purchase engagement: views,
 * clicks (the 'conversion' eventType — a visitor completing a step's
 * primary CTA before any purchase), sessions (→ unique visitors),
 * form submissions, and traffic sources. Its legacy 'order' eventType /
 * `revenue` field still exist on the schema for backward compatibility
 * (older clients may still POST them) but are deliberately never read
 * here for the summary.
 */
exports.getFunnelAnalytics = async (req, res) => {
  const { funnelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(funnelId)) {
    throw invalidIdError();
  }

  const funnel = await Funnel.findOne({ _id: funnelId, isDeleted: false }).lean();
  if (!funnel) throw notFoundError('Funnel not found.');

  const fid = new mongoose.Types.ObjectId(funnelId);
  const { days, since } = resolveAnalyticsDays(req.query);

  // ── Revenue / Orders / AOV — StoreOrder only. ────────────────────────────
  const orders = await StoreOrder.find({
    funnelId: fid,
    isDeleted: false,
    status: { $in: COUNTED_STATUSES },
    createdAt: { $gte: since },
  }).lean();

  const revenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const ordersCount = orders.length;
  const averageOrderValue = ordersCount > 0 ? revenue / ordersCount : 0;

  // Per-step revenue/orders, from the same order set — StoreOrder.stepId
  // is written by funnelCheckoutService for every funnel checkout order.
  const stepOrderStats = new Map();
  for (const order of orders) {
    if (!order.stepId) continue;
    const key = String(order.stepId);
    const entry = stepOrderStats.get(key) || { orders: 0, revenue: 0 };
    entry.orders += 1;
    entry.revenue += Number(order.total) || 0;
    stepOrderStats.set(key, entry);
  }

  // ── Views / Sessions(visitors) / Clicks / Form submits — FunnelAnalyticsEvent
  // only. 'order' eventType / its revenue field are intentionally excluded.
  const eventStats = await FunnelAnalyticsEvent.aggregate([
    { $match: { funnelId: fid, createdAt: { $gte: since } } },
    {
      $group: {
        _id: null,
        views: { $sum: { $cond: [{ $eq: ['$eventType', 'view'] }, 1, 0] } },
        clicks: { $sum: { $cond: [{ $eq: ['$eventType', 'conversion'] }, 1, 0] } },
        formSubmits: { $sum: { $cond: [{ $eq: ['$eventType', 'form_submit'] }, 1, 0] } },
        uniqueSessions: { $addToSet: '$sessionId' },
      },
    },
  ]);

  const overview = eventStats[0] || { views: 0, clicks: 0, formSubmits: 0, uniqueSessions: [] };
  const visitorsCount = Array.isArray(overview.uniqueSessions)
    ? overview.uniqueSessions.filter(Boolean).length
    : 0;

  // A "conversion" for the summary card is a form submit or a completed
  // purchase — the purchase count comes from ordersCount (StoreOrder),
  // never from a FunnelAnalyticsEvent 'order' row.
  const totalConversions = overview.formSubmits + ordersCount;
  const conversionRate = visitorsCount > 0 ? (totalConversions / visitorsCount) * 100 : 0;

  // ── Steps breakdown — merges FunnelAnalyticsEvent (views/clicks/form
  // submits) with StoreOrder (revenue/orders) per step. ───────────────────
  const steps = await FunnelStep.find({ funnelId: fid, isDeleted: false }).sort({ position: 1 }).lean();

  const stepEventStats = await FunnelAnalyticsEvent.aggregate([
    { $match: { funnelId: fid, createdAt: { $gte: since } } },
    {
      $group: {
        _id: '$stepId',
        views: { $sum: { $cond: [{ $eq: ['$eventType', 'view'] }, 1, 0] } },
        formSubmits: { $sum: { $cond: [{ $eq: ['$eventType', 'form_submit'] }, 1, 0] } },
      },
    },
  ]);
  const stepEventMap = new Map(
    stepEventStats.filter((s) => s._id).map((s) => [String(s._id), s])
  );

  const stepsBreakdown = steps.map((step) => {
    const key = String(step._id);
    const ev = stepEventMap.get(key) || { views: 0, formSubmits: 0 };
    const ord = stepOrderStats.get(key) || { orders: 0, revenue: 0 };
    const conversions = ev.formSubmits + ord.orders;
    return {
      stepId: step._id,
      name: step.name,
      type: step.type,
      position: step.position,
      views: ev.views,
      conversions,
      conversionRate: ev.views > 0 ? (conversions / ev.views) * 100 : 0,
      orders: ord.orders,
      revenue: ord.revenue,
    };
  });

  // ── Traffic sources — views only, FunnelAnalyticsEvent. ─────────────────
  const traffic = await FunnelAnalyticsEvent.aggregate([
    { $match: { funnelId: fid, eventType: 'view', createdAt: { $gte: since } } },
    { $group: { _id: { $ifNull: ['$utm.source', 'Direct / Referral'] }, views: { $sum: 1 } } },
    { $sort: { views: -1 } },
  ]);
  const trafficSources = traffic.map((t) => ({ source: t._id, views: t.views }));

  // ── Daily series (oldest → newest) — revenue/orders from StoreOrder,
  // views from FunnelAnalyticsEvent. Same pattern as Store's
  // analyticsController.getAnalytics series construction.
  const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
  const seriesMap = new Map();
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    seriesMap.set(dayKey(d), { date: dayKey(d), revenue: 0, orders: 0, views: 0 });
  }
  for (const order of orders) {
    const key = dayKey(order.createdAt);
    if (seriesMap.has(key)) {
      seriesMap.get(key).revenue += Number(order.total) || 0;
      seriesMap.get(key).orders += 1;
    }
  }
  const views = await FunnelAnalyticsEvent.find(
    { funnelId: fid, eventType: 'view', createdAt: { $gte: since } },
    'createdAt'
  ).lean();
  for (const v of views) {
    const key = dayKey(v.createdAt);
    if (seriesMap.has(key)) seriesMap.get(key).views += 1;
  }
  const series = Array.from(seriesMap.values()).sort((a, b) => (a.date < b.date ? -1 : 1));

  res.status(200).json({
    success: true,
    data: {
      days,
      summary: {
        views: overview.views || 0,
        clicks: overview.clicks || 0,
        visitors: visitorsCount,
        conversions: totalConversions,
        conversionRate,
        // Revenue / Orders / AOV — StoreOrder, never FunnelAnalyticsEvent.
        revenue,
        ordersCount,
        averageOrderValue,
      },
      steps: stepsBreakdown,
      trafficSources,
      series,
    },
  });
};

/**
 * POST /api/funnels/:funnelId/steps/:stepId/events
 * Public event tracking endpoint.
 *
 * Still accepts eventType: 'order' with a revenue figure for backward
 * compatibility with older clients — but getFunnelAnalytics above never
 * reads either for the Revenue/Orders/AOV summary; those come exclusively
 * from StoreOrder now. This endpoint remains useful for views, clicks
 * ('conversion'), form_submit, and traffic-source (utm) tracking.
 */
exports.trackEvent = async (req, res) => {
  const { funnelId, stepId } = req.params;
  const { eventType, sessionId, revenue, currency, utm, referrer, orderId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(funnelId)) {
    return res.status(400).json({ success: false, error: 'Invalid funnel ID.' });
  }

  const resolvedUtm = utm || {};

  const event = await FunnelAnalyticsEvent.create({
    funnelId,
    stepId: mongoose.Types.ObjectId.isValid(stepId) ? stepId : null,
    eventType,
    sessionId: sessionId || 'guest-session',
    revenue: revenue || 0,
    currency: currency || 'USD',
    utm: {
      source: resolvedUtm.source || '',
      medium: resolvedUtm.medium || '',
      campaign: resolvedUtm.campaign || '',
    },
    referrer: referrer || '',
    orderId: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null,
  });

  res.status(201).json({
    success: true,
    data: event,
  });
};