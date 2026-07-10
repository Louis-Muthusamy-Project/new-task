const mongoose = require('mongoose');
const Funnel = require('../models/Funnel');
const FunnelStep = require('../models/FunnelStep');
const { slugify, generateUniqueFunnelStepSlug } = require('../utils/slugUtils');

async function findOwnedFunnel(req, funnelId) {
  const ownerId = req?.user?.id || req?.user?._id;
  if (!ownerId) {
    return Funnel.findById(funnelId);
  }
  return Funnel.findOne({
    _id: funnelId,
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

const handleDuplicateKeyError = (err) => {
  if (err.code === 11000 && err.keyPattern && err.keyPattern.slug) {
    const slug = err.keyValue?.slug ?? 'unknown';
    const conflict = new Error(
      `Step slug "${slug}" already exists for this funnel. ` +
      `Use a different slug or omit it to have one generated automatically.`
    );
    conflict.statusCode = 409;
    return conflict;
  }
  return null;
};

/**
 * POST /api/funnels/:funnelId/steps
 * Creates a new funnel step.
 */
exports.createStep = async (req, res) => {
  const { funnelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(funnelId)) {
    throw invalidIdError('Invalid funnel id.');
  }

  const funnel = await findOwnedFunnel(req, funnelId);
  if (!funnel) {
    throw notFoundError('Funnel not found.');
  }

  const { name, slug, type, position, content, seo, settings } = req.body;

  const stepName = name || 'Untitled Step';
  const baseSlug = slugify(slug || stepName);
  const resolvedSlug = await generateUniqueFunnelStepSlug(baseSlug, funnel._id);

  // If position is not provided, place it at the end of the steps list
  let resolvedPosition = position;
  if (resolvedPosition === undefined || resolvedPosition === null) {
    const stepsCount = await FunnelStep.countDocuments({ funnelId: funnel._id, isDeleted: false });
    resolvedPosition = stepsCount + 1;
  }

  let step;
  try {
    step = await FunnelStep.create({
      funnelId: funnel._id,
      name: stepName,
      slug: resolvedSlug,
      type: type || 'landing',
      position: resolvedPosition,
      status: 'Draft',
      content: content || null,
      seo: seo || undefined,
      settings: settings || undefined,
    });
  } catch (err) {
    const conflict = handleDuplicateKeyError(err);
    if (conflict) throw conflict;
    throw err;
  }

  res.status(201).json({
    success: true,
    data: step,
  });
};

/**
 * GET /api/funnels/:funnelId/steps
 * Lists all steps of a funnel sorted by position.
 */
exports.listSteps = async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.removeHeader('ETag');
  res.removeHeader('Last-Modified');

  const { funnelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(funnelId)) {
    throw invalidIdError('Invalid funnel id.');
  }

  const funnel = await findOwnedFunnel(req, funnelId);
  if (!funnel) {
    throw notFoundError('Funnel not found.');
  }

  const filter = { funnelId: funnel._id, isDeleted: false };
  const steps = await FunnelStep.find(filter).sort({ position: 1, createdAt: 1 });

  res.status(200).json({
    success: true,
    data: steps,
  });
};

/**
 * GET /api/funnel-steps/:id
 * Fetches a step by id.
 */
exports.getStep = async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.removeHeader('ETag');
  res.removeHeader('Last-Modified');

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError('Invalid step id.');
  }

  const step = await FunnelStep.findOne({ _id: id, isDeleted: false });
  if (!step) {
    throw notFoundError('Step not found.');
  }

  const funnel = await findOwnedFunnel(req, step.funnelId);
  if (!funnel) {
    throw notFoundError('Step not found.');
  }

  res.status(200).json({
    success: true,
    data: step,
  });
};

/**
 * PUT /api/funnel-steps/:id
 * Updates a step (its contents or settings).
 */
exports.updateStep = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError('Invalid step id.');
  }

  const step = await FunnelStep.findOne({ _id: id, isDeleted: false });
  if (!step) {
    throw notFoundError('Step not found.');
  }

  const funnel = await findOwnedFunnel(req, step.funnelId);
  if (!funnel) {
    throw notFoundError('Step not found.');
  }

  const allowedFields = ['name', 'slug', 'type', 'position', 'content', 'seo', 'settings', 'status'];
  const updates = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  if (updates.slug) {
    const baseSlug = slugify(updates.slug);
    if (baseSlug !== step.slug) {
      updates.slug = await generateUniqueFunnelStepSlug(baseSlug, step.funnelId, step._id);
    } else {
      updates.slug = baseSlug;
    }
  }

  if (updates.status === 'Published' && step.status !== 'Published') {
    updates.publishedAt = new Date();
  }

  let updatedStep;
  try {
    updatedStep = await FunnelStep.findByIdAndUpdate(
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
    data: updatedStep,
  });
};

/**
 * DELETE /api/funnel-steps/:id
 * Soft-deletes a funnel step.
 */
exports.deleteStep = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError('Invalid step id.');
  }

  const step = await FunnelStep.findOne({ _id: id, isDeleted: false });
  if (!step) {
    throw notFoundError('Step not found.');
  }

  const funnel = await findOwnedFunnel(req, step.funnelId);
  if (!funnel) {
    throw notFoundError('Step not found.');
  }

  step.isDeleted = true;
  await step.save();

  res.status(200).json({
    success: true,
    data: { id: step._id, deleted: true },
  });
};

/**
 * POST /api/funnels/:funnelId/steps/reorder
 * Reorders steps. Body receives { orderedIds: [id1, id2, ...] }
 */
exports.reorderSteps = async (req, res) => {
  const { funnelId } = req.params;
  const { orderedIds } = req.body;

  if (!orderedIds || !Array.isArray(orderedIds)) {
    return res.status(400).json({ success: false, error: 'orderedIds array is required.' });
  }

  const funnel = await findOwnedFunnel(req, funnelId);
  if (!funnel) {
    throw notFoundError('Funnel not found.');
  }

  // Update position values sequentially
  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id, funnelId: funnel._id },
      update: { $set: { position: index + 1 } },
    },
  }));

  if (bulkOps.length > 0) {
    await FunnelStep.bulkWrite(bulkOps);
  }

  res.status(200).json({
    success: true,
    message: 'Steps reordered successfully.',
  });
};
