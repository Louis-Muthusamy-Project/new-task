const mongoose = require('mongoose');
const Funnel = require('../models/Funnel');
const FunnelStep = require('../models/FunnelStep');
const FunnelTemplate = require('../models/FunnelTemplate');
const { duplicateFunnel } = require('../services/funnelDuplicateService');
const { slugify } = require('../utils/slugUtils');

const buildOwnershipFilter = (req) => {
  const ownerId = req?.user?.id || req?.user?._id || null;
  const teamId = req?.user?.teamId || null;
  if (!ownerId && !teamId) return {};
  return teamId ? { $or: [{ ownerId }, { teamId }] } : { ownerId };
};

const notFoundError = () => {
  const error = new Error('Funnel not found.');
  error.statusCode = 404;
  return error;
};

const invalidIdError = () => {
  const error = new Error('Invalid funnel id.');
  error.statusCode = 400;
  return error;
};

/**
 * POST /api/funnels
 * Creates a new funnel. If templateId is provided, clones steps from the FunnelTemplate.
 */
exports.createFunnel = async (req, res) => {
  const { name, status, templateId, settings, seo } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'Funnel name is required.' });
  }

  const ownerId = req?.user?.id || req?.user?._id || null;
  const teamId = req?.user?.teamId || null;

  const funnel = await Funnel.create({
    ownerId,
    teamId,
    name,
    slug: slugify(name),
    status: status || 'Draft',
    settings: settings || {
      faviconUrl: '',
      domain: '',
      tracking: {
        metaPixelId: '',
        ga4Id: '',
        gtmId: '',
        tiktokPixelId: '',
        customHeadCode: '',
        customBodyCode: '',
      }
    },
    seo: seo || { title: '', description: '', ogImageUrl: '' },
    templateId: templateId || null,
  });

  // If a template is specified, copy its steps
  if (templateId && mongoose.Types.ObjectId.isValid(templateId)) {
    const template = await FunnelTemplate.findById(templateId);
    if (template && template.steps && template.steps.length > 0) {
      const stepDocs = template.steps.map((tStep) => ({
        funnelId: funnel._id,
        name: tStep.name,
        slug: tStep.slug || slugify(tStep.name),
        type: tStep.type || 'landing',
        position: tStep.position,
        content: tStep.content || null,
        status: 'Draft',
        isDeleted: false,
      }));
      await FunnelStep.insertMany(stepDocs);
    }
  } else {
    // By default, create a single Landing Step if no template is chosen
    await FunnelStep.create({
      funnelId: funnel._id,
      name: 'Landing Page',
      slug: 'landing',
      type: 'landing',
      position: 1,
      status: 'Draft',
      content: null,
      isDeleted: false,
    });
  }

  res.status(201).json({
    success: true,
    data: funnel,
  });
};

/**
 * GET /api/funnels
 * Lists all non-deleted funnels. Supports optional search.
 */
exports.getFunnels = async (req, res) => {
  const filter = {
    ...buildOwnershipFilter(req),
    isDeleted: false,
  };

  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: 'i' };
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const [funnels, total] = await Promise.all([
    Funnel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Funnel.countDocuments(filter),
  ]);

  // Aggregate step counts
  const funnelIds = funnels.map((f) => f._id);
  let stepCountMap = {};

  if (funnelIds.length > 0) {
    try {
      const counts = await FunnelStep.aggregate([
        { $match: { funnelId: { $in: funnelIds }, isDeleted: false } },
        { $group: { _id: '$funnelId', count: { $sum: 1 } } },
      ]);
      for (const c of counts) {
        stepCountMap[String(c._id)] = c.count;
      }
    } catch (err) {
      console.warn('[getFunnels] step count aggregation failed:', err.message);
    }
  }

  const funnelsWithStepCount = funnels.map((f) => ({
    ...f,
    stepCount: stepCountMap[String(f._id)] || 0,
  }));

  res.status(200).json({
    success: true,
    data: funnelsWithStepCount,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

/**
 * GET /api/funnels/:id
 * Fetches a single funnel by id.
 */
exports.getFunnelById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const funnel = await Funnel.findOne({
    _id: id,
    ...buildOwnershipFilter(req),
    isDeleted: false,
  });

  if (!funnel) {
    throw notFoundError();
  }

  res.status(200).json({
    success: true,
    data: funnel,
  });
};

/**
 * PATCH /api/funnels/:id
 * Updates a funnel.
 */
exports.updateFunnel = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const allowedFields = [
    'name',
    'status',
    'settings',
    'seo',
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  if (updates.name) {
    updates.slug = slugify(updates.name);
  }

  const funnel = await Funnel.findOneAndUpdate(
    {
      _id: id,
      ...buildOwnershipFilter(req),
      isDeleted: false,
    },
    { $set: updates },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!funnel) {
    throw notFoundError();
  }

  res.status(200).json({
    success: true,
    data: funnel,
  });
};

/**
 * DELETE /api/funnels/:id
 * Soft-deletes a funnel.
 */
exports.deleteFunnel = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const funnel = await Funnel.findOneAndUpdate(
    {
      _id: id,
      ...buildOwnershipFilter(req),
      isDeleted: false,
    },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!funnel) {
    throw notFoundError();
  }

  // Also soft-delete its steps
  await FunnelStep.updateMany(
    { funnelId: funnel._id },
    { $set: { isDeleted: true } }
  );

  res.status(200).json({
    success: true,
    data: { id: funnel._id, deleted: true },
  });
};

/**
 * POST /api/funnels/:id/duplicate
 * Duplicates a funnel and its steps.
 */
exports.duplicateFunnel = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const ownerCtx = {
    ownerId: req?.user?.id || req?.user?._id || null,
    teamId:  req?.user?.teamId || null,
  };

  const { funnel, stepCount } = await duplicateFunnel(id, ownerCtx);

  res.status(201).json({
    success: true,
    data: funnel,
    meta: { stepsCopied: stepCount },
  });
};

/**
 * GET /api/funnels/:id/preview
 * Returns the funnel and its steps sorted by position.
 */
exports.previewFunnel = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const funnel = await Funnel.findOne({
    _id: id,
    ...buildOwnershipFilter(req),
    isDeleted: false,
  });

  if (!funnel) {
    throw notFoundError();
  }

  const steps = await FunnelStep.find({
    funnelId: funnel._id,
    isDeleted: false
  })
    .sort({ position: 1, createdAt: 1 })
    .lean();

  res.status(200).json({
    success: true,
    data: {
      funnel,
      steps,
      meta: {
        stepCount: steps.length,
      },
    },
  });
};
