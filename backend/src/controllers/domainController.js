const mongoose = require('mongoose');
const Website = require('../models/Website');
const WebsiteDomain = require('../models/WebsiteDomain');

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

const conflictError = (message) => {
  const error = new Error(message);
  error.statusCode = 409;
  return error;
};

/**
 * WebsiteDomain has its own ownerId, but a domain is always attached to a
 * specific website, so we additionally confirm the requesting user owns
 * (or shares a team with) that parent website before allowing any action.
 */

/**
 * POST /api/websites/:websiteId/domains
 * Connects a new custom domain to the given website.
 */
exports.createDomain = async (req, res) => {
  const { websiteId } = req.params;
  const ownerId = req?.user?.id || req?.user?._id || null;

  if (!ownerId) {
    throw Object.assign(new Error('Authentication required.'), { statusCode: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(websiteId)) {
    throw invalidIdError('Invalid website id.');
  }

  const website = await findOwnedWebsite(websiteId, req);
  if (!website) {
    throw notFoundError('Website not found.');
  }

  const { domain, isPrimary, dnsRecords } = req.body;
  const normalizedDomain = String(domain).trim().toLowerCase();


  const existing = await WebsiteDomain.findOne({ domain: normalizedDomain });
  if (existing) {
    throw conflictError('This domain is already connected to a website.');
  }

  if (isPrimary) {
    await WebsiteDomain.updateMany(
      { websiteId: website._id, isPrimary: true },
      { $set: { isPrimary: false } }
    );
  }

  const websiteDomainPayload = {
    websiteId: website._id,
    domain: normalizedDomain,
    isPrimary: !!isPrimary,
    dnsRecords: dnsRecords || [],
    ownerId,
  };

  let websiteDomain;
  try {
    websiteDomain = await WebsiteDomain.create(websiteDomainPayload);
  } catch (err) {
    if (err.code === 11000) {
      throw conflictError('This domain is already connected to a website.');
    }
    throw err;
  }

  res.status(201).json({
    success: true,
    data: websiteDomain,
  });
};

/**
 * GET /api/websites/:websiteId/domains
 * Lists all domains connected to the given website.
 */
exports.getDomainsByWebsite = async (req, res) => {
  const { websiteId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(websiteId)) {
    throw invalidIdError('Invalid website id.');
  }

  const website = await findOwnedWebsite(websiteId, req);
  if (!website) {
    throw notFoundError('Website not found.');
  }

  const filter = { websiteId: website._id };
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const domains = await WebsiteDomain.find(filter).sort({ isPrimary: -1, createdAt: 1 });

  res.status(200).json({
    success: true,
    data: domains,
  });
};

/**
 * DELETE /api/domains/:id
 * Disconnects a domain. Scoped to the authenticated owner via the
 * domain's own ownerId field, and cross-checked against its parent
 * website's ownership for defense in depth.
 */
exports.deleteDomain = async (req, res) => {
  const { id } = req.params;
  const ownerId = req?.user?.id || req?.user?._id || null;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError('Invalid domain id.');
  }

  if (!ownerId) {
    throw Object.assign(new Error('Authentication required.'), { statusCode: 401 });
  }

  const websiteDomain = await WebsiteDomain.findOne({
    _id: id,
    ownerId,
  });

  if (!websiteDomain) {
    throw notFoundError('Domain not found.');
  }

  if (websiteDomain.websiteId) {
    const website = await findOwnedWebsite(websiteDomain.websiteId, req);
    if (!website) {
      throw notFoundError('Domain not found.');
    }
  }

  await WebsiteDomain.deleteOne({ _id: id });

  res.status(200).json({
    success: true,
    data: { id: websiteDomain._id, deleted: true },
  });
};

