const mongoose = require('mongoose');
const Form = require('../models/Form');
const Submission = require('../models/Submission');

const buildOwnershipFilter = (req) => {
  const ownerId = req?.user?.id || req?.user?._id || null;
  const teamId = req?.user?.teamId || null;

  if (!ownerId && !teamId) return {};

  return teamId ? { $or: [{ ownerId }, { teamId }] } : { ownerId };
};

const notFoundError = () => {
  const error = new Error('Form not found.');
  error.statusCode = 404;
  return error;
};

const invalidIdError = () => {
  const error = new Error('Invalid form id.');
  error.statusCode = 400;
  return error;
};

exports.createForm = async (req, res) => {
  const { name, fields, status, websiteId, isTemplate } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'Form name is required.' });
  }

  const ownerId = req?.user?.id || req?.user?._id || null;

  const form = await Form.create({
    ownerId: ownerId || new mongoose.Types.ObjectId(),
    name,
    fields: fields || [],
    status: status || 'Draft',
    websiteId: websiteId || undefined,
    isTemplate: isTemplate || false,
  });

  res.status(201).json({
    success: true,
    data: form,
  });
};

exports.getForms = async (req, res) => {
  const filter = {
    ...buildOwnershipFilter(req),
    isDeleted: false,
  };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const forms = await Form.find(filter).sort({ updatedAt: -1 }).lean();

  res.status(200).json({
    success: true,
    data: forms,
  });
};

exports.getFormTemplates = async (req, res) => {
  const filter = {
    ...buildOwnershipFilter(req),
    isDeleted: false,
    isTemplate: true,
  };

  const templates = await Form.find(filter).sort({ updatedAt: -1 }).lean();

  res.status(200).json({
    success: true,
    data: templates,
  });
};

exports.getFormById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const form = await Form.findOne({
    _id: id,
    ...buildOwnershipFilter(req),
    isDeleted: false,
  });

  if (!form) {
    throw notFoundError();
  }

  res.status(200).json({
    success: true,
    data: form,
  });
};

exports.updateForm = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const allowedFields = ['name', 'fields', 'status', 'websiteId', 'isTemplate'];
  const updates = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  const form = await Form.findOneAndUpdate(
    {
      _id: id,
      ...buildOwnershipFilter(req),
      isDeleted: false,
    },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!form) {
    throw notFoundError();
  }

  res.status(200).json({
    success: true,
    data: form,
  });
};

exports.deleteForm = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const form = await Form.findOneAndUpdate(
    {
      _id: id,
      ...buildOwnershipFilter(req),
      isDeleted: false,
    },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!form) {
    throw notFoundError();
  }

  res.status(200).json({
    success: true,
    data: { id: form._id, deleted: true },
  });
};

/**
 * POST /forms/:id/submissions
 * Public endpoint hit from the live/preview site when a visitor submits a
 * form built from a form template. No ownership check here on purpose -
 * anyone viewing the published site needs to be able to submit it.
 */
exports.submitForm = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const form = await Form.findOne({ _id: id, isDeleted: false });

  if (!form) {
    throw notFoundError();
  }

  const data = req.body && typeof req.body.data === 'object' && req.body.data !== null
    ? req.body.data
    : (req.body || {});

  const submission = await Submission.create({
    formId: form._id,
    websiteId: form.websiteId || undefined,
    data,
    meta: {
      pageUrl: req.body?.pageUrl || '',
      userAgent: req.get('user-agent') || '',
      ip: req.ip,
    },
  });

  res.status(201).json({
    success: true,
    data: submission,
  });
};

/**
 * GET /forms/:id/submissions
 * Submissions for a single form (owner-scoped).
 */
exports.getSubmissionsForForm = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const form = await Form.findOne({
    _id: id,
    ...buildOwnershipFilter(req),
    isDeleted: false,
  });

  if (!form) {
    throw notFoundError();
  }

  const submissions = await Submission.find({ formId: id, isDeleted: false })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: submissions.map((s) => ({ ...s, formName: form.name })),
  });
};

/**
 * GET /forms/submissions
 * Submissions across every form the caller owns, optionally narrowed by
 * formId / websiteId / date range. Backs the Submissions tab in FormsTab.jsx.
 */
exports.getSubmissions = async (req, res) => {
  const formFilter = {
    ...buildOwnershipFilter(req),
    isDeleted: false,
  };

  if (req.query.websiteId) {
    formFilter.websiteId = req.query.websiteId;
  }

  const forms = await Form.find(formFilter).select('_id name').lean();

  if (forms.length === 0) {
    return res.status(200).json({ success: true, data: [] });
  }

  const formMap = new Map(forms.map((f) => [String(f._id), f.name]));

  const filter = {
    formId: { $in: forms.map((f) => f._id) },
    isDeleted: false,
  };

  if (req.query.formId && mongoose.Types.ObjectId.isValid(req.query.formId)) {
    filter.formId = req.query.formId;
  }

  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
  }

  const submissions = await Submission.find(filter)
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  res.status(200).json({
    success: true,
    data: submissions.map((s) => ({
      ...s,
      formName: formMap.get(String(s.formId)) || 'Unknown form',
    })),
  });
};