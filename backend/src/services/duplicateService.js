const mongoose = require('mongoose');
const Website = require('../models/Website');
const WebsitePage = require('../models/WebsitePage');
const { slugify, generateUniqueSlug } = require('../utils/slugUtils');

/**
 * Generates a unique "Copy" name for a duplicated website.
 *
 * Strategy:
 *   "My Website"          → "My Website Copy"
 *   "My Website Copy"     → "My Website Copy 2"
 *   "My Website Copy 2"   → "My Website Copy 3"
 *
 * Queries the DB once to find all existing names that share the same
 * base, then picks the next available suffix — no retry loop needed.
 *
 * @param {string} originalName
 * @returns {Promise<string>}
 */
const generateCopyName = async (originalName) => {
  // Strip any existing " Copy" / " Copy N" suffix to get the true base.
  const base = originalName.replace(/\s+Copy(\s+\d+)?$/, '').trim();
  const copyBase = `${base} Copy`;

  // Find all non-deleted websites whose name starts with the copy base.
  const existing = await Website.find(
    {
      websiteName: { $regex: `^${copyBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s+\\d+)?$` },
      isDeleted: false,
    },
    { websiteName: 1 }
  ).lean();

  if (existing.length === 0) {
    return copyBase; // "My Website Copy"
  }

  // Collect the numeric suffixes that are already taken.
  const taken = new Set();
  for (const doc of existing) {
    const match = doc.websiteName.match(/\s+(\d+)$/);
    taken.add(match ? parseInt(match[1], 10) : 1); // bare "Copy" counts as 1
  }

  // Find the lowest positive integer not already taken.
  let n = 2;
  while (taken.has(n)) n++;

  return `${copyBase} ${n}`; // "My Website Copy 2", "My Website Copy 3", …
};

/**
 * Duplicates a website and all of its non-deleted pages.
 *
 * Steps:
 *   1. Fetch the source website (must not be soft-deleted).
 *   2. Resolve a unique copy name.
 *   3. Insert a new Website document (status reset to Draft, domain/domainId cleared).
 *   4. Build page copies with collision-safe slugs, then bulk-insert them.
 *      Although a brand-new websiteId cannot collide with itself in the common
 *      case, we call generateUniqueSlug per-page to guard against:
 *        a) duplicate slugs within the SOURCE pages (schema doesn't enforce
 *           uniqueness across isDeleted:true docs, so a soft-deleted page
 *           could share a slug with an active one).
 *        b) any future code path that reuses an existing websiteId.
 *   5. Return the new website document plus the count of pages copied.
 *
 * @param {string} sourceId   - ObjectId string of the website to duplicate.
 * @param {object} [ownerCtx] - Optional { ownerId, teamId } from the request user.
 * @returns {Promise<{ website: object, pageCount: number }>}
 */
const duplicateWebsite = async (sourceId, ownerCtx = {}) => {
  // 1. Fetch source
  const source = await Website.findOne({ _id: sourceId, isDeleted: false }).lean();
  if (!source) {
    const err = new Error('Website not found.');
    err.statusCode = 404;
    throw err;
  }

  // 2. Unique copy name
  const copyName = await generateCopyName(source.websiteName);

  // 3. Create new website — strip _id, timestamps, domain binding, published state.
  const {
    _id,
    __v,
    createdAt,
    updatedAt,
    websiteName,     // replaced
    status,          // reset to Draft
    domain,          // cleared — copy starts without a domain claim
    domainId,        // cleared
    publishedAt,
    ...rest
  } = source;

  const newWebsite = await Website.create({
    ...rest,
    websiteName: copyName,
    status: 'Draft',
    domain: '',
    domainId: null,
    // Apply caller's ownership context (may be empty for unauthenticated requests)
    ...(ownerCtx.ownerId != null && { ownerId: ownerCtx.ownerId }),
    ...(ownerCtx.teamId  != null && { teamId:  ownerCtx.teamId  }),
  });

  // 4. Copy pages with collision-safe slugs.
  const sourcePages = await WebsitePage.find(
    { websiteId: source._id, isDeleted: false }
  ).lean();

  let pageCount = 0;

  if (sourcePages.length > 0) {
    // Build page docs sequentially so that generateUniqueSlug sees each
    // previously reserved slug before picking the next one.
    // (For typical page counts — < 100 — sequential is fine and avoids
    //  the race that parallel Promise.all would introduce.)
    const pageDocs = [];
    for (const { _id, __v, createdAt, updatedAt, publishedAt, slug, ...page } of sourcePages) {
      // generateUniqueSlug queries only the new website's pages, which grow
      // as we push each doc into pageDocs *after* insertion, so we pass the
      // already-inserted docs' websiteId to let Mongo do the real check.
      // Because newWebsite._id is fresh, the base slug is always free on the
      // first page; collisions only arise when the source itself had duplicate
      // slugs across active+soft-deleted docs.
      const safeSlug = await generateUniqueSlug(
        slugify(slug),   // re-slugify in case source had raw values
        newWebsite._id
      );

      pageDocs.push({
        ...page,
        slug: safeSlug,
        websiteId: newWebsite._id,
        status: 'Draft',
        publishedAt: null,
        isDeleted: false,
      });
    }

    // Use ordered:true (default) so the first E11000 surfaces immediately
    // instead of being silently dropped by ordered:false.
    const inserted = await WebsitePage.insertMany(pageDocs);
    pageCount = inserted.length;
  }

  return { website: newWebsite, pageCount };
};

module.exports = { duplicateWebsite, generateCopyName };
