'use strict';

/**
 * storeThemeController.js — Theme Module (admin)
 *
 * Thin HTTP layer over Store Engine's Theme Service. Closes audit finding
 * #7 ("theme tokens stored but never applied") by giving a Store its own
 * `GET`/`PATCH /theme` endpoint, backed by services/store/themeService.js.
 */

const mongoose = require('mongoose');
const { themeService } = require('../../services/store');
const { invalidateStoreCache } = require('../../middlewares/storeCache');

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

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/theme
// ─────────────────────────────────────────────────────────────────────────
exports.getTheme = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const theme = await themeService.getTheme(storeId);
  res.status(200).json({ success: true, data: theme });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/theme
// Body: { colors?, fonts?, layout?, custom? }
// ─────────────────────────────────────────────────────────────────────────
exports.updateTheme = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const theme = await themeService.updateTheme(storeId, req.body);
  // Same convention productController/collectionController use: clear
  // the short-TTL storefront read cache so the new public GET /theme
  // response (which the storeReadCache middleware now caches, see
  // storeStorefrontRoutes.js) isn't served stale for up to 60s after
  // this write, even though the SSE `theme.updated` event already tells
  // any open storefront tab to refetch immediately.
  invalidateStoreCache(storeId);
  res.status(200).json({ success: true, data: theme });
};