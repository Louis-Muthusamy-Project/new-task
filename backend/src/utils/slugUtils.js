/**
 * slugUtils.js
 * Centralised slug helpers used by pageController and duplicateService.
 *
 * Single source of truth — import from here, never inline.
 */

const WebsitePage = require('../models/WebsitePage');
const StorePage = require('../models/store/StorePage');

/**
 * Converts an arbitrary string to a URL-safe slug.
 *   "My Page Name!" → "my-page-name"
 *   ""              → "page"
 *
 * @param {string} str
 * @returns {string}
 */
const slugify = (str) =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'page';

/**
 * Given a base slug and a websiteId, returns the first slug in the
 * sequence  base → base-1 → base-2 → …  that is not already taken
 * by ANY page in that website — including soft-deleted ones.
 *
 * WHY include soft-deleted docs:
 *   The MongoDB unique index on { websiteId: 1, slug: 1 } is NOT a
 *   partial index — it covers every document regardless of isDeleted.
 *   If we only check isDeleted:false, a deleted page with slug "home"
 *   still occupies the index slot and the subsequent insert crashes
 *   with E11000 duplicate key error.
 *
 * The function executes a SINGLE regex query to find all occupied
 * slots, then picks the lowest free number — no retry loop, no
 * TOCTOU race on concurrent inserts (the unique index is the final
 * safety net; handleDuplicateKeyError in the controller converts any
 * surviving race into a clean 409).
 *
 * @param {string}              baseSlug      - Already-slugified base (e.g. "home")
 * @param {ObjectId|string}     websiteId
 * @param {ObjectId|string|null} [excludePageId] - Own page id when called from
 *   updatePage (skip itself when checking).
 * @returns {Promise<string>}
 */
const generateUniqueSlug = async (baseSlug, websiteId, excludePageId = null) => {
  // Escape regex meta-chars in baseSlug to build a safe pattern.
  const escaped = baseSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Matches "home", "home-1", "home-2", … but NOT "homepage" or "home-page".
  const pattern = new RegExp(`^${escaped}(-\\d+)?$`);

  // NOTE: intentionally NO isDeleted filter — the unique index enforces
  // uniqueness across ALL documents, so we must treat deleted slugs as taken.
  const filter = {
    websiteId,
    slug: pattern,
  };
  if (excludePageId) {
    filter._id = { $ne: excludePageId };
  }

  const existing = await WebsitePage.find(filter, { slug: 1 }).lean();

  if (existing.length === 0) {
    // Base slug is free across all docs (active and deleted).
    return baseSlug;
  }

  // Collect the numeric suffixes already in use.
  // bare "home" → slot 0; "home-1" → slot 1; "home-7" → slot 7.
  const taken = new Set();
  for (const doc of existing) {
    const match = doc.slug.match(/-(\d+)$/);
    taken.add(match ? parseInt(match[1], 10) : 0);
  }

  // Find the lowest positive integer not taken (start from 1).
  let n = 1;
  while (taken.has(n)) n++;

  return `${baseSlug}-${n}`;
};

/**
 * Store-module counterpart of generateUniqueSlug. Same algorithm, scoped to
 * StorePage documents under a given storeId instead of WebsitePage
 * documents under a websiteId.
 *
 * @param {string}              baseSlug      - Already-slugified base (e.g. "home")
 * @param {ObjectId|string}     storeId
 * @param {ObjectId|string|null} [excludePageId] - Own page id when called from
 *   updateStorePage (skip itself when checking).
 * @returns {Promise<string>}
 */
const generateUniqueStorePageSlug = async (baseSlug, storeId, excludePageId = null) => {
  const escaped = baseSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${escaped}(-\\d+)?$`);

  const filter = {
    storeId,
    slug: pattern,
  };
  if (excludePageId) {
    filter._id = { $ne: excludePageId };
  }

  const existing = await StorePage.find(filter, { slug: 1 }).lean();

  if (existing.length === 0) {
    return baseSlug;
  }

  const taken = new Set();
  for (const doc of existing) {
    const match = doc.slug.match(/-(\d+)$/);
    taken.add(match ? parseInt(match[1], 10) : 0);
  }

  let n = 1;
  while (taken.has(n)) n++;

  return `${baseSlug}-${n}`;
};

/**
 * Funnel-module counterpart of generateUniqueSlug. Scoped to FunnelStep
 * documents under a given funnelId.
 *
 * @param {string}              baseSlug      - Already-slugified base (e.g. "landing")
 * @param {ObjectId|string}     funnelId
 * @param {ObjectId|string|null} [excludeStepId] - Own step id when called from updateStep.
 * @returns {Promise<string>}
 */
const generateUniqueFunnelStepSlug = async (baseSlug, funnelId, excludeStepId = null) => {
  const FunnelStep = require('../models/FunnelStep');
  const escaped = baseSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${escaped}(-\\d+)?$`);

  const filter = {
    funnelId,
    slug: pattern,
  };
  if (excludeStepId) {
    filter._id = { $ne: excludeStepId };
  }

  const existing = await FunnelStep.find(filter, { slug: 1 }).lean();

  if (existing.length === 0) {
    return baseSlug;
  }

  const taken = new Set();
  for (const doc of existing) {
    const match = doc.slug.match(/-(\d+)$/);
    taken.add(match ? parseInt(match[1], 10) : 0);
  }

  let n = 1;
  while (taken.has(n)) n++;

  return `${baseSlug}-${n}`;
};

module.exports = { slugify, generateUniqueSlug, generateUniqueStorePageSlug, generateUniqueFunnelStepSlug };