const mongoose = require('mongoose');
const FunnelContact = require('../models/FunnelContact');
const Funnel = require('../models/Funnel');
const FunnelStep = require('../models/FunnelStep');
const { emitFunnelEvent } = require('../services/funnelEvents');

const notFoundError = (message = 'Contact not found.') => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

const invalidIdError = (message = 'Invalid contact id.') => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

/**
 * POST /api/funnels/:funnelId/steps/:stepId/contacts
 * Public contact submission form endpoint.
 *
 * Saves lead details, form submissions, referrer, tags, and UTM data.
 */
exports.submitContact = async (req, res) => {
  const { funnelId, stepId } = req.params;
  const { email, name, phone, data, utm, referrer, tags } = req.body;

  if (!mongoose.Types.ObjectId.isValid(funnelId)) {
    return res.status(400).json({ success: false, error: 'Invalid funnel ID.' });
  }

  const funnelExists = await Funnel.exists({ _id: funnelId, isDeleted: false });
  if (!funnelExists) {
    return res.status(404).json({ success: false, error: 'Funnel not found.' });
  }

  // Parse UTM tags
  const resolvedUtm = utm || {};

  const contact = await FunnelContact.create({
    funnelId,
    stepId: mongoose.Types.ObjectId.isValid(stepId) ? stepId : null,
    email: email || '',
    name: name || '',
    phone: phone || '',
    data: data || {},
    utm: {
      source: resolvedUtm.source || '',
      medium: resolvedUtm.medium || '',
      campaign: resolvedUtm.campaign || '',
      term: resolvedUtm.term || '',
      content: resolvedUtm.content || '',
    },
    referrer: referrer || '',
    tags: tags || [],
  });

  // Integration hook — see funnelEvents.js. No subscriber exists yet;
  // this is the point a future CRM/Automation/Email/Webhook module
  // attaches to without this controller needing to know about it.
  emitFunnelEvent(funnelId, 'contact.created', {
    contactId: contact._id,
    stepId: contact.stepId,
    email: contact.email,
  });

  res.status(201).json({
    success: true,
    data: contact,
  });
};

/**
 * GET /api/funnels/:funnelId/contacts
 * Admin endpoint: Lists all contact submissions for a funnel.
 */
exports.listContacts = async (req, res) => {
  const { funnelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(funnelId)) {
    return res.status(400).json({ success: false, error: 'Invalid funnel ID.' });
  }

  const filter = { funnelId, isDeleted: false };

  if (req.query.stepId && mongoose.Types.ObjectId.isValid(req.query.stepId)) {
    filter.stepId = req.query.stepId;
  }

  if (req.query.search) {
    const searchRegex = { $regex: req.query.search, $options: 'i' };
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  if (req.query.tag) {
    filter.tags = req.query.tag;
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const [contacts, total] = await Promise.all([
    FunnelContact.find(filter)
      .populate('stepId', 'name type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FunnelContact.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: contacts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

/**
 * GET /api/funnel-contacts/:id
 * Admin endpoint: Gets detailed contact record.
 */
exports.getContact = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const contact = await FunnelContact.findOne({ _id: id, isDeleted: false })
    .populate('funnelId', 'name')
    .populate('stepId', 'name type');

  if (!contact) {
    throw notFoundError();
  }

  res.status(200).json({
    success: true,
    data: contact,
  });
};

/**
 * DELETE /api/funnel-contacts/:id
 * Admin endpoint: Soft deletes a contact record.
 */
exports.deleteContact = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const contact = await FunnelContact.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!contact) {
    throw notFoundError();
  }

  res.status(200).json({
    success: true,
    data: { id: contact._id, deleted: true },
  });
};