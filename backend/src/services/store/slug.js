'use strict';

/**
 * slug.js — shared slug utilities for the Store Engine service layer.
 *
 * Previously duplicated (byte-for-byte) inside productController.js and
 * collectionController.js. Centralized here so there is exactly one
 * slugify implementation and one "make it unique within a scope" routine
 * for every Store Engine service that needs one.
 */

function slugify(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Ensures `base` is unique among documents matched by `scopeQuery` in
 * `Model`, appending -2, -3, ... on collision. `excludeId`, if given, is
 * excluded from the collision check (used when renaming an existing doc).
 */
async function uniqueSlug(Model, scopeQuery, base, excludeId, fallback = 'item') {
  let candidate = base || fallback;
  let suffix = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { ...scopeQuery, slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    // eslint-disable-next-line no-await-in-loop
    const existing = await Model.findOne(query).lean();
    if (!existing) return candidate;
    candidate = `${base || fallback}-${suffix++}`;
  }
}

module.exports = { slugify, uniqueSlug };
