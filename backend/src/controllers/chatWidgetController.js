const mongoose = require('mongoose');
const ChatWidget = require('../models/ChatWidget');

const buildOwnershipFilter = (req) => {
  const ownerId = req?.user?.id || req?.user?._id || null;
  const teamId = req?.user?.teamId || null;

  if (!ownerId && !teamId) return {};

  return teamId ? { $or: [{ ownerId }, { teamId }] } : { ownerId };
};

const notFoundError = () => {
  const error = new Error('Chat widget not found.');
  error.statusCode = 404;
  return error;
};

const invalidIdError = () => {
  const error = new Error('Invalid chat widget id.');
  error.statusCode = 400;
  return error;
};

exports.createChatWidget = async (req, res) => {
  const { name, type } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'Widget name is required.' });
  }

  if (!type) {
    return res.status(400).json({ success: false, error: 'Widget type is required.' });
  }

  const ownerId = req?.user?.id || req?.user?._id || null;
  const teamId = req?.user?.teamId || null;

  const chatWidget = await ChatWidget.create({
    ownerId: ownerId || new mongoose.Types.ObjectId(),
    teamId: teamId || null,
    name,
    type,
    status: 'Draft',
  });

  res.status(201).json({
    success: true,
    data: chatWidget,
  });
};

exports.getChatWidgets = async (req, res) => {
  const filter = {
    ...buildOwnershipFilter(req),
    isDeleted: false,
  };

  const chatWidgets = await ChatWidget.find(filter).sort({ updatedAt: -1 }).lean();

  res.status(200).json({
    success: true,
    data: chatWidgets,
  });
};

exports.getChatWidgetById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const chatWidget = await ChatWidget.findOne({
    _id: id,
    ...buildOwnershipFilter(req),
    isDeleted: false,
  });

  if (!chatWidget) {
    throw notFoundError();
  }

  res.status(200).json({
    success: true,
    data: chatWidget,
  });
};

exports.updateChatWidget = async (req, res) => {
  const { id } = req.params;
  const { name, type, status, greeting, brandColor, launcherPosition, launcherLabel, channels, whatsappPhone, supportEmail } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const chatWidget = await ChatWidget.findOne({
    _id: id,
    ...buildOwnershipFilter(req),
    isDeleted: false,
  });

  if (!chatWidget) {
    throw notFoundError();
  }

  // Update only provided fields
  if (name !== undefined) chatWidget.name = name;
  if (type !== undefined) chatWidget.type = type;
  if (status !== undefined) chatWidget.status = status;
  if (greeting !== undefined) chatWidget.greeting = greeting;
  if (brandColor !== undefined) chatWidget.brandColor = brandColor;
  if (launcherPosition !== undefined) chatWidget.launcherPosition = launcherPosition;
  if (launcherLabel !== undefined) chatWidget.launcherLabel = launcherLabel;
  if (channels !== undefined) chatWidget.channels = channels;
  if (whatsappPhone !== undefined) chatWidget.whatsappPhone = whatsappPhone;
  if (supportEmail !== undefined) chatWidget.supportEmail = supportEmail;

  await chatWidget.save();

  res.status(200).json({
    success: true,
    data: chatWidget,
  });
};

exports.deleteChatWidget = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const chatWidget = await ChatWidget.findOne({
    _id: id,
    ...buildOwnershipFilter(req),
    isDeleted: false,
  });

  if (!chatWidget) {
    throw notFoundError();
  }

  chatWidget.isDeleted = true;
  await chatWidget.save();

  res.status(200).json({
    success: true,
    message: 'Chat widget deleted successfully.',
  });
};
