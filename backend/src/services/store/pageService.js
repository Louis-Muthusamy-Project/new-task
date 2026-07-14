'use strict';

/**
 * pageService.js — Page Service
 *
 * Owns every business rule around StorePage: ownership resolution (via the
 * page's parent Store), slug uniqueness, the single-home-page invariant,
 * publishedAt stamping, and translating Mongo's duplicate-key error into a
 * friendly conflict. Both storePageController.js (the GrapesJS builder) and
 * any future Store Engine caller go through this service rather than
 * touching StorePage directly.
 */

const mongoose = require('mongoose');
const Store = require('../../models/store/Store');
const StorePage = require('../../models/store/StorePage');
const { slugify, generateUniqueStorePageSlug } = require('../../utils/slugUtils');
const { notFoundError, conflictError } = require('./errors');

const ALLOWED_FIELDS = ['name', 'slug', 'isHome', 'status', 'content', 'seo'];

/**
 * Resolves the Store that owns `storeId`, scoped to `req.user` when a
 * session exists. Kept permissive (lookup by _id only) while JWT auth
 * isn't wired up yet — see storePageController.js's original comment;
 * behavior preserved exactly, just centralized.
 */
async function findOwnedStore(storeId, user) {
  const ownerId = user?.id || user?._id;
  if (!ownerId) {
    return Store.findById(storeId);
  }
  return Store.findOne({ _id: storeId, ownerId });
}

function translateDuplicateKeyError(err) {
  if (err.code === 11000 && err.keyPattern && err.keyPattern.slug) {
    const slug = err.keyValue?.slug ?? 'unknown';
    return conflictError(
      `Page slug "${slug}" already exists for this store. ` +
        `Use a different slug or omit it to have one generated automatically.`
    );
  }
  return null;
}

async function getPageById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid page id.');
    err.statusCode = 400;
    throw err;
  }

  const page = await StorePage.findOne({ _id: id, isDeleted: false });
  if (!page) throw notFoundError('Page not found.');

  const store = await findOwnedStore(page.storeId, user);
  if (!store) throw notFoundError('Page not found.');

  return page;
}

async function updatePage(id, body, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid page id.');
    err.statusCode = 400;
    throw err;
  }

  const page = await StorePage.findOne({ _id: id, isDeleted: false });
  if (!page) throw notFoundError('Page not found.');

  const store = await findOwnedStore(page.storeId, user);
  if (!store) throw notFoundError('Page not found.');

  const updates = {};
  for (const field of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      updates[field] = body[field];
    }
  }

  if (updates.content) {
    updates.content = {
      ...(page.content || {}),
      ...updates.content,
    };
  }

  if (updates.slug) {
    const baseSlug = slugify(updates.slug);
    if (baseSlug !== page.slug) {
      updates.slug = await generateUniqueStorePageSlug(baseSlug, page.storeId, page._id);
    } else {
      updates.slug = baseSlug;
    }
  }

  if (updates.status === 'Published' && page.status !== 'Published') {
    updates.publishedAt = new Date();
  }

  if (updates.isHome === true) {
    await StorePage.updateMany(
      { storeId: page.storeId, isHome: true, _id: { $ne: page._id } },
      { $set: { isHome: false } }
    );
  }

  try {
    return await StorePage.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
  } catch (err) {
    const conflict = translateDuplicateKeyError(err);
    if (conflict) throw conflict;
    throw err;
  }
}

async function listPages(storeId) {
  return StorePage.find({ storeId, isDeleted: false }).sort({ isHome: -1, createdAt: 1 }).lean();
}

/**
 * Public nav listing — Published pages only, minimal fields. Backs the
 * storefront's Menu and Footer sections so navigation links are always
 * derived from real StorePage documents instead of a hardcoded list.
 */
async function listPublicPages(storeId) {
  return StorePage.find({ storeId, isDeleted: false, status: 'Published' })
    .select('name slug isHome')
    .sort({ isHome: -1, name: 1 })
    .lean();
}

/**
 * Public single-page fetch, by slug — Published only, full `content`
 * (html/css/headLinks) included. This is what lets a themed page (built
 * in GrapesJS, or produced by the WordPress Import pipeline — see
 * services/wordpressImport/*) render its actual markup on the live
 * storefront/preview instead of only ever showing the generic hardcoded
 * layout: `listPublicPages` above intentionally omits `content` (it only
 * backs nav), this is the counterpart that returns it for the page the
 * shopper is actually on.
 */
async function getPublicPageBySlug(storeId, slug) {
  const query = { storeId, isDeleted: false, status: 'Published' };
  if (slug === '__home__' || !slug) {
    query.isHome = true;
  } else {
    query.slug = slug;
  }
  return StorePage.findOne(query).select('name slug isHome content').lean();
}

module.exports = { getPageById, updatePage, listPages, listPublicPages, getPublicPageBySlug };