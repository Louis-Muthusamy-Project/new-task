const mongoose = require('mongoose');
const FunnelAnalyticsEvent = require('../models/FunnelAnalyticsEvent');
const FunnelStep = require('../models/FunnelStep');
const StoreOrder = require('../models/store/StoreOrder');

const invalidIdError = () => {
  const error = new Error('Invalid funnel id.');
  error.statusCode = 400;
  return error;
};

/**
 * GET /api/funnels/:funnelId/analytics
 * Aggregates funnel metrics.
 */
exports.getFunnelAnalytics = async (req, res) => {
  const { funnelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(funnelId)) {
    throw invalidIdError();
  }

  const fid = new mongoose.Types.ObjectId(funnelId);

  // 1. Overall Metrics (Views, Visitors, Revenue, Orders)
  const stats = await FunnelAnalyticsEvent.aggregate([
    { $match: { funnelId: fid } },
    {
      $group: {
        _id: null,
        views: { $sum: { $cond: [{ $eq: ['$eventType', 'view'] }, 1, 0] } },
        uniqueSessions: { $addToSet: '$sessionId' },
        revenue: { $sum: '$revenue' },
        ordersCount: { $sum: { $cond: [{ $eq: ['$eventType', 'order'] }, 1, 0] } },
        conversions: { $sum: { $cond: [{ $eq: ['$eventType', 'form_submit'] }, 1, 0] } },
      },
    },
  ]);

  const overview = stats[0] || { views: 0, uniqueSessions: [], revenue: 0, ordersCount: 0, conversions: 0 };
  const visitorsCount = Array.isArray(overview.uniqueSessions) ? overview.uniqueSessions.length : 0;
  const overallConversionRate = visitorsCount > 0 ? ((overview.conversions + overview.ordersCount) / visitorsCount) * 100 : 0;
  const averageOrderValue = overview.ordersCount > 0 ? overview.revenue / overview.ordersCount : 0;

  // 2. Step Breakdown (Step name, views, conversions, conversion rate)
  const steps = await FunnelStep.find({ funnelId: fid, isDeleted: false }).sort({ position: 1 });
  const stepStats = await FunnelAnalyticsEvent.aggregate([
    { $match: { funnelId: fid } },
    {
      $group: {
        _id: '$stepId',
        views: { $sum: { $cond: [{ $eq: ['$eventType', 'view'] }, 1, 0] } },
        conversions: { $sum: { $cond: [{ $in: ['$eventType', ['form_submit', 'order']] }, 1, 0] } },
      },
    },
  ]);

  const stepStatsMap = {};
  stepStats.forEach((s) => {
    if (s._id) {
      stepStatsMap[String(s._id)] = {
        views: s.views,
        conversions: s.conversions,
        rate: s.views > 0 ? (s.conversions / s.views) * 100 : 0,
      };
    }
  });

  const stepsBreakdown = steps.map((step) => {
    const sStat = stepStatsMap[String(step._id)] || { views: 0, conversions: 0, rate: 0 };
    return {
      stepId: step._id,
      name: step.name,
      type: step.type,
      position: step.position,
      views: sStat.views,
      conversions: sStat.conversions,
      conversionRate: sStat.rate,
    };
  });

  // 3. Traffic Sources Breakdown (group by source)
  const traffic = await FunnelAnalyticsEvent.aggregate([
    { $match: { funnelId: fid, eventType: 'view' } },
    {
      $group: {
        _id: { $ifNull: ['$utm.source', 'Direct / Referral'] },
        views: { $sum: 1 },
      },
    },
    { $sort: { views: -1 } },
  ]);

  const trafficSources = traffic.map((t) => ({
    source: t._id,
    views: t.views,
  }));

  res.status(200).json({
    success: true,
    data: {
      summary: {
        views: overview.views || 0,
        visitors: visitorsCount,
        conversions: overview.conversions + overview.ordersCount || 0,
        revenue: overview.revenue || 0,
        ordersCount: overview.ordersCount || 0,
        conversionRate: overallConversionRate,
        averageOrderValue,
      },
      steps: stepsBreakdown,
      trafficSources,
    },
  });
};

/**
 * POST /api/funnels/:funnelId/steps/:stepId/events
 * Public event tracking endpoint.
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
