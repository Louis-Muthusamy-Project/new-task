const mongoose = require('mongoose');
const FunnelTemplate = require('../models/FunnelTemplate');
const Funnel = require('../models/Funnel');
const FunnelStep = require('../models/FunnelStep');

const notFoundError = (message = 'Template not found.') => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

const invalidIdError = (message = 'Invalid template id.') => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

/**
 * GET /api/funnel-templates
 * Lists templates (system templates + user custom ones). Supports filtering and search.
 */
exports.listTemplates = async (req, res) => {
  const filter = { isDeleted: false };

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: 'i' };
  }

  if (req.query.isSystem !== undefined) {
    filter.isSystem = req.query.isSystem === 'true';
  }

  if (req.query.isFavourite !== undefined) {
    filter.isFavourite = req.query.isFavourite === 'true';
  }

  const templates = await FunnelTemplate.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: templates,
  });
};

/**
 * GET /api/funnel-templates/:id
 * Gets a single template.
 */
exports.getTemplate = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const template = await FunnelTemplate.findOne({ _id: id, isDeleted: false });
  if (!template) {
    throw notFoundError();
  }

  res.status(200).json({
    success: true,
    data: template,
  });
};

/**
 * POST /api/funnel-templates
 * Creates a template. Can be used to create system templates or save an existing Funnel as a template.
 */
exports.createTemplate = async (req, res) => {
  const { name, description, category, thumbnailUrl, steps, tags, isSystem } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'Template name is required.' });
  }

  const template = await FunnelTemplate.create({
    name,
    description: description || '',
    category: category || 'Other',
    thumbnailUrl: thumbnailUrl || '',
    steps: steps || [],
    tags: tags || [],
    isSystem: !!isSystem,
  });

  res.status(201).json({
    success: true,
    data: template,
  });
};

/**
 * POST /api/funnel-templates/save-from-funnel
 * Saves an existing funnel as a reusable template.
 */
exports.saveFromFunnel = async (req, res) => {
  const { funnelId, templateName, category, description } = req.body;

  if (!funnelId || !mongoose.Types.ObjectId.isValid(funnelId)) {
    return res.status(400).json({ success: false, error: 'Valid funnelId is required.' });
  }

  if (!templateName) {
    return res.status(400).json({ success: false, error: 'templateName is required.' });
  }

  const funnel = await Funnel.findOne({ _id: funnelId, isDeleted: false });
  if (!funnel) {
    throw notFoundError('Funnel not found.');
  }

  const steps = await FunnelStep.find({ funnelId: funnel._id, isDeleted: false }).sort({ position: 1 });

  // Map steps to template steps blueprints
  const templateSteps = steps.map(step => ({
    name: step.name,
    type: step.type,
    position: step.position,
    content: step.content,
    slug: step.slug,
  }));

  const template = await FunnelTemplate.create({
    name: templateName,
    description: description || funnel.description || '',
    category: category || 'Other',
    steps: templateSteps,
    isSystem: false,
  });

  res.status(201).json({
    success: true,
    data: template,
  });
};

/**
 * PATCH /api/funnel-templates/:id
 * Updates template fields (e.g. name, description, category, tags, or status).
 */
exports.updateTemplate = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const allowedFields = ['name', 'description', 'category', 'thumbnailUrl', 'tags', 'isFavourite', 'steps'];
  const updates = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  const template = await FunnelTemplate.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!template) {
    throw notFoundError();
  }

  res.status(200).json({
    success: true,
    data: template,
  });
};

/**
 * DELETE /api/funnel-templates/:id
 * Soft deletes a template.
 */
exports.deleteTemplate = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const template = await FunnelTemplate.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!template) {
    throw notFoundError();
  }

  res.status(200).json({
    success: true,
    data: { id: template._id, deleted: true },
  });
};
