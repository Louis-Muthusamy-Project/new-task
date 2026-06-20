const mongoose = require('mongoose');
const Website = require('../models/Website');
const publishService = require('../services/publishService');

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

const buildOwnershipFilter = (req) => {
  const ownerId = req?.user?.id || req?.user?._id || null;
  const teamId = req?.user?.teamId || null;

  // If unauthenticated, do not scope by ownership (future JWT will re-enable it).
  if (!ownerId && !teamId) return {};

  return teamId ? { $or: [{ ownerId }, { teamId }] } : { ownerId };
};

const findOwnedWebsite = async (websiteId, req) => {
  return Website.findOne({
    _id: websiteId,
    isDeleted: false,
    ...buildOwnershipFilter(req),
  });
};

/**
 * POST /api/websites/:websiteId/publish
 * Runs the publish flow for a website and returns the resulting
 * publish URL.
 */
exports.publishWebsite = async (req, res) => {
  const { websiteId } = req.params;

  const triggeredBy = req?.user?.id || req?.user?._id || null;

  if (!mongoose.Types.ObjectId.isValid(websiteId)) {
    throw invalidIdError('Invalid website id.');
  }

  const website = await findOwnedWebsite(websiteId, req);
  if (!website) {
    throw notFoundError('Website not found.');
  }

  const { publishUrl } = await publishService.publishWebsite(websiteId, triggeredBy);

  res.status(200).json({
    success: true,
    publishUrl,
  });
};

