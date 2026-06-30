const mongoose = require('mongoose');
const Form = require('../models/Form');

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
