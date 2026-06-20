const mongoose = require('mongoose');
const Website = require('../models/Website');
const WebsitePage = require('../models/WebsitePage');


/**
 * WebsitePage has no ownerId/teamId of its own — ownership is always
 * resolved through its parent Website. This helper returns the parent
 * website (scoped to the authenticated user/team) or null.
 */
async function findOwnedWebsite(req, websiteId) {
  const ownerId = req?.user?.id || req?.user?._id;

  // If not authenticated yet, allow lookup by _id (future JWT will re-enable scoping).
  if (!ownerId) {
    return Website.findById(websiteId);
  }

  return Website.findOne({
    _id: websiteId,
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

const slugify = (str) =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'page';

/**
 * POST /api/websites/:websiteId/pages
 * Creates a new page under the given website. Accepts a `content` field
 * holding the page builder JSON (stored as-is via Schema.Types.Mixed).
 */
exports.createPage = async (req, res) => {
  const { websiteId } = req.params;


  if (!mongoose.Types.ObjectId.isValid(websiteId)) {
    throw invalidIdError('Invalid website id.');
  }

  const website = await findOwnedWebsite(req, websiteId);
  if (!website) {
    throw notFoundError('Website not found.');
  }

  const { name, slug, isHome, status, content, seo } = req.body;
  const resolvedSlug = slug ? slugify(slug) : slugify(name);

  if (isHome) {
    await WebsitePage.updateMany(
      { websiteId: website._id, isHome: true },
      { $set: { isHome: false } }
    );
  }
  const pageName =
    req.body.name ||
    req.body.title ||
    req.body.pageName ||
    "Untitled Page";

  const page = await WebsitePage.create({
    websiteId: website._id,
    name: pageName,
    slug: resolvedSlug,
    isHome: !!isHome,
    status: status || 'Draft',
    content: req.body.pageJson || content || {},
    seo: seo || undefined,
  });

  res.status(201).json({
    success: true,
    data: page,
  });
};

/**
 * GET /api/websites/:websiteId/pages
 * Lists all non-deleted pages belonging to the given website.
 */
exports.getPagesByWebsite = async (req, res) => {
  const { websiteId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(websiteId)) {
    throw invalidIdError('Invalid website id.');
  }

  const website = await findOwnedWebsite(req, websiteId);
  if (!website) {
    throw notFoundError('Website not found.');
  }

  const filter = { websiteId: website._id, isDeleted: false };
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const pages = await WebsitePage.find(filter).sort({ isHome: -1, createdAt: 1 });

  res.status(200).json({
    success: true,
    data: pages,
  });
};

/**
 * GET /api/pages/:id
 * Fetches a single page by id, including its full page builder JSON
 * content. Ownership is enforced via the page's parent website.
 */
exports.getPageById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError('Invalid page id.');
  }

  const page = await WebsitePage.findOne({ _id: id, isDeleted: false });
  if (!page) {
    throw notFoundError('Page not found.');
  }

  const website = await findOwnedWebsite(req, page.websiteId);
  if (!website) {
    throw notFoundError('Page not found.');
  }

  res.status(200).json({
    success: true,
    data: page,
  });
};

/**
 * PUT /api/pages/:id
 * Replaces page metadata and/or page builder JSON content. Ownership is
 * enforced via the page's parent website.
 */
exports.updatePage = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError('Invalid page id.');
  }

  const page = await WebsitePage.findOne({ _id: id, isDeleted: false });
  if (!page) {
    throw notFoundError('Page not found.');
  }

  const website = await findOwnedWebsite(req, page.websiteId);
  if (!website) {
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
    updates.slug = slugify(updates.slug);
  }

  if (updates.status === 'Published' && page.status !== 'Published') {
    updates.publishedAt = new Date();
  }

  if (updates.isHome === true) {
    await WebsitePage.updateMany(
      { websiteId: page.websiteId, isHome: true, _id: { $ne: page._id } },
      { $set: { isHome: false } }
    );
  }

  const updatedPage = await WebsitePage.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedPage,
  });
};

/**
 * DELETE /api/pages/:id
 * Soft-deletes a page (sets isDeleted: true). Ownership is enforced via
 * the page's parent website.
 */
exports.deletePage = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError('Invalid page id.');
  }

  const page = await WebsitePage.findOne({ _id: id, isDeleted: false });
  if (!page) {
    throw notFoundError('Page not found.');
  }

  const website = await findOwnedWebsite(req, page.websiteId);
  if (!website) {
    throw notFoundError('Page not found.');
  }

  page.isDeleted = true;
  await page.save();

  res.status(200).json({
    success: true,
    data: { id: page._id, deleted: true },
  });
};

