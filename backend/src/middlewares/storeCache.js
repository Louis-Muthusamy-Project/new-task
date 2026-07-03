'use strict';

/**
 * storeCache.js — Caching for the Store module's public storefront reads.
 *
 * The storefront GET endpoints (storeStorefrontController.js: store info,
 * products, collections, testimonials) are read-heavy, publicly cacheable,
 * and change infrequently relative to how often a live storefront re-fetches
 * them. Two complementary layers:
 *
 *   1. Cache-Control header — lets browsers and any CDN/reverse-proxy in
 *      front of the API cache the response themselves.
 *   2. A small process-local in-memory cache (TTL-based) so repeat hits
 *      within that window skip the Mongo round-trip entirely, even when
 *      nothing in front of the API is caching yet.
 *
 * Deliberately dependency-free (no Redis) — this app is single-process, so
 * a plain Map is sufficient and keeps the Store module self-contained. If
 * the app is ever scaled horizontally, swap the Map for a shared Redis
 * cache without changing the calling code (same get/set shape).
 */

const DEFAULT_TTL_MS = 60 * 1000; // 60s — short enough that merchant edits show up quickly

const cacheStore = new Map(); // key -> { expiresAt, body }

const buildKey = (req) => `${req.baseUrl}${req.path}?${new URLSearchParams(req.query).toString()}`;

/**
 * Express middleware factory. Wraps res.json so a successful (2xx) response
 * body is memoized under the request's URL, and served straight from
 * memory for subsequent identical requests until it expires.
 *
 * @param {Object} [options]
 * @param {number} [options.ttlMs=60000]
 * @param {string} [options.cacheControl='public, max-age=60'] - sent on
 *   every response (hit or miss) so downstream caches/CDNs cooperate too.
 */
const storeReadCache = ({ ttlMs = DEFAULT_TTL_MS, cacheControl = 'public, max-age=60' } = {}) => {
  return (req, res, next) => {
    const key = buildKey(req);
    const cached = cacheStore.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      res.set('Cache-Control', cacheControl);
      res.set('X-Store-Cache', 'HIT');
      return res.status(200).json(cached.body);
    }

    res.set('Cache-Control', cacheControl);
    res.set('X-Store-Cache', 'MISS');

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheStore.set(key, { expiresAt: Date.now() + ttlMs, body });
      }
      return originalJson(body);
    };

    next();
  };
};

/**
 * Invalidate cached storefront reads for a store — call this after any
 * write that would change what a cached GET would have returned (product
 * create/update/delete, collection edits, testimonial edits, publish).
 * Coarse-grained (clears everything for the storeId) rather than tracking
 * exact key dependencies, which is the right trade-off for a TTL this
 * short and a write volume this low.
 *
 * @param {string} storeId
 */
const invalidateStoreCache = (storeId) => {
  if (!storeId) return;
  for (const key of cacheStore.keys()) {
    if (key.includes(String(storeId))) cacheStore.delete(key);
  }
};

module.exports = { storeReadCache, invalidateStoreCache };
