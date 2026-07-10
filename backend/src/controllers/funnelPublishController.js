const mongoose = require('mongoose');
const Funnel = require('../models/Funnel');
const funnelPublishService = require('../services/funnelPublishService');

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
  if (!ownerId && !teamId) return {};
  return teamId ? { $or: [{ ownerId }, { teamId }] } : { ownerId };
};

const findOwnedFunnel = async (funnelId, req) => {
  return Funnel.findOne({
    _id: funnelId,
    isDeleted: false,
    ...buildOwnershipFilter(req),
  });
};

/**
 * POST /api/funnels/:funnelId/publish
 * Runs the publish flow for a funnel and returns the resulting public URL.
 */
exports.publishFunnel = async (req, res) => {
  const { funnelId } = req.params;
  const triggeredBy = req?.user?.id || req?.user?._id || null;

  if (!mongoose.Types.ObjectId.isValid(funnelId)) {
    throw invalidIdError('Invalid funnel id.');
  }

  const funnel = await findOwnedFunnel(funnelId, req);
  if (!funnel) {
    throw notFoundError('Funnel not found.');
  }

  const { publishUrl, publishHistory } = await funnelPublishService.publishFunnel(
    funnelId,
    triggeredBy,
    req
  );

  res.status(200).json({
    success: true,
    publishUrl,
    publishHistoryId: publishHistory._id,
  });
};
