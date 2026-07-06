const mongoose = require('mongoose');
const Store = require('../../models/store/Store');
const StorePage = require('../../models/store/StorePage');
const { slugify, generateUniqueStorePageSlug } = require('../../utils/slugUtils');

/**
 * storePageController.js — mirrors controllers/pageController.js.
 *
 * Store-module counterpart of getPageById / updatePage, backing the same
 * GrapesJS builder (BccBuilder) so it can load and save StorePage
 * documents instead of WebsitePage documents. Ownership is enforced via
 * the page's parent Store instead of Website.
 */

async function findOwnedStore(req, storeId) {
  const ownerId = req?.user?.id || req?.user?._id;

  // If not authenticated yet, allow lookup by _id (future JWT will re-enable scoping).
  if (!ownerId) {
    return Store.findById(storeId);
  }

  return Store.findOne({
    _id: storeId,
    ownerId,
  });
}

const notFoundError = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

const invalidIdError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

/**
 * Translates a MongoDB E11000 duplicate-key error into a friendly 409
 * so that callers never see an unhandled 500 for slug collisions.
 * Returns null for any other error type (caller should re-throw).
 */
const handleDuplicateKeyError = (err) => {
  if (err.code === 11000 && err.keyPattern && err.keyPattern.slug) {
    const slug = err.keyValue?.slug ?? 'unknown';
    const conflict = new Error(
      `Page slug "${slug}" already exists for this store. ` +
      `Use a different slug or omit it to have one generated automatically.`
    );
    conflict.statusCode = 409;
    return conflict;
  }
  return null;
};

/**
 * GET /api/store/pages/:id
 * Fetches a single store page by id, including its full page builder JSON
 * content. Ownership is enforced via the page's parent store.
 */
exports.getStorePageById = async (req, res) => {
  // Prevent browser/express conditional caching (ETag -> 304) for editor reads.
  // This keeps GrapesJS always working with the latest payload.
  res.set('Cache-Control', 'no-store');
  res.removeHeader('ETag');
  res.removeHeader('Last-Modified');

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError('Invalid page id.');
  }

  const page = await StorePage.findOne({ _id: id, isDeleted: false });
  if (!page) {
    throw notFoundError('Page not found.');
  }

  const store = await findOwnedStore(req, page.storeId);
  if (!store) {
    throw notFoundError('Page not found.');
  }

  res.status(200).json({
    success: true,
    data: page,
  });
};

/**
 * PUT /api/store/pages/:id
 * Replaces page metadata and/or page builder JSON content. Ownership is
 * enforced via the page's parent store.
 *
 * Slug handling:
 *   - If slug is unchanged or not provided, no collision check is needed.
 *   - If slug changes, generateUniqueStorePageSlug ensures the new value
 *     does not collide with any other page in the same store (excluding
 *     itself).
 */
exports.updateStorePage = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError('Invalid page id.');
  }

  const page = await StorePage.findOne({ _id: id, isDeleted: false });
  if (!page) {
    throw notFoundError('Page not found.');
  }

  const store = await findOwnedStore(req, page.storeId);
  if (!store) {
    throw notFoundError('Page not found.');
  }

  const allowedFields = ['name', 'slug', 'isHome', 'status', 'content', 'seo'];
  const updates = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  if (updates.slug) {
    const baseSlug = slugify(updates.slug);
    // Only run the uniqueness check when the slug is actually changing.
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

  let updatedPage;
  try {
    updatedPage = await StorePage.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
  } catch (err) {
    const conflict = handleDuplicateKeyError(err);
    if (conflict) throw conflict;
    throw err;
  }

  res.status(200).json({
    success: true,
    data: updatedPage,
  });
};