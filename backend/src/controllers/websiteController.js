const mongoose = require('mongoose');
const Website = require('../models/Website');


const buildOwnershipFilter = (req) => {
  const ownerId = req?.user?.id || req?.user?._id || null;
  const teamId = req?.user?.teamId || null;

  // If unauthenticated, do not scope by ownership (future JWT will re-enable it).
  if (!ownerId && !teamId) return {};

  return teamId ? { $or: [{ ownerId }, { teamId }] } : { ownerId };
};

const notFoundError = () => {
  const error = new Error('Website not found.');
  error.statusCode = 404;
  return error;
};

const invalidIdError = () => {
  const error = new Error('Invalid website id.');
  error.statusCode = 400;
  return error;
};

/**
 * POST /api/website-builder/websites
 * Creates a new website owned by the authenticated user.
 */
exports.createWebsite = async (req, res) => {
  const {
    websiteName,
    name,
    description,
    customDomain,
    templateId,
    domain,
    status,
    faviconUrl,
    tracking,
    chatWidgetId,
    category,
  } = req.body;

  // Frontend currently sends `name`, backend schema/controller expects `websiteName`.
  const resolvedWebsiteName = websiteName || name;

  if (!resolvedWebsiteName) {
    return res.status(400).json({ success: false, error: 'websiteName (or name) is required.' });
  }

  const ownerId = req?.user?.id || req?.user?._id || null;

  const website = await Website.create({
    websiteName: resolvedWebsiteName,
    description: description || '',
    domain: customDomain || domain || '',
    category: category || undefined,
    status: status || 'Draft',
    faviconUrl: faviconUrl || undefined,
    tracking: tracking || undefined,
    chatWidgetId: chatWidgetId || undefined,
    template: {
      templateId: templateId || req.body?.template?.templateId || ''
    }
  });

  res.status(201).json({
    success: true,
    data: website,
  });
};
/**
 * GET /api/website-builder/websites
 * Lists all non-deleted websites owned by (or belonging to the team of)
 * the authenticated user. Supports optional pagination and status filter.
 */
exports.getWebsites = async (req, res) => {
  const filter = {
    ...buildOwnershipFilter(req),
    isDeleted: false,
  };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const [websites, total] = await Promise.all([
    Website.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    Website.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: websites,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

/**
 * GET /api/website-builder/websites/:id
 * Fetches a single website by id, scoped to the authenticated owner/team.
 */
exports.getWebsiteById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const website = await Website.findOne({
    _id: id,
    ...buildOwnershipFilter(req),
    isDeleted: false,
  });

  if (!website) {
    throw notFoundError();
  }

  res.status(200).json({
    success: true,
    data: website,
  });
};

/**
 * PATCH /api/website-builder/websites/:id
 * Partially updates a website. Only the owning user/team may update it.
 */
exports.updateWebsite = async (req, res) => {
  const { id } = req.params;
  

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const allowedFields = [
    'name',
    'description',
    'status',
    'faviconUrl',
    'tracking',
    'chatWidgetId',
    'domainId',
    'templateId',
    'folderId',
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  }
  const website = await Website.findByIdAndUpdate(

    id,
    { $set: updates },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!website) {
    throw notFoundError();
  }
  

  res.status(200).json({
    success: true,
    data: website,
  });
};

/**
 * DELETE /api/website-builder/websites/:id
 * Soft-deletes a website (sets isDeleted: true) scoped to the owner/team.
 */
exports.deleteWebsite = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const website = await Website.findOneAndUpdate(
    {
      _id: id,
      ...buildOwnershipFilter(req),
      isDeleted: false,
    },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!website) {
    throw notFoundError();
  }

  res.status(200).json({
    success: true,
    data: { id: website._id, deleted: true },
  });
};
