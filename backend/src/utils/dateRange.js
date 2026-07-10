'use strict';

/**
 * dateRange.js — shared analytics day-window helper.
 *
 * Both Store's analyticsController.js and Funnel's funnelAnalyticsController.js
 * answer "give me a rolling N-day window" the same way. Extracted here so
 * that logic exists in exactly one place instead of being re-typed a
 * second time for funnels — the two controllers still own everything
 * specific to what they aggregate over that window.
 */

/**
 * Resolves a `?days=` query param into a clamped day count plus the
 * `since` Date to filter records from (inclusive).
 */
function resolveAnalyticsDays(query, { def = 30, min = 1, max = 365 } = {}) {
  const days = Math.min(Math.max(parseInt(query?.days, 10) || def, min), max);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return { days, since };
}

module.exports = { resolveAnalyticsDays };
