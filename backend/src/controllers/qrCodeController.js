const mongoose = require('mongoose');
const QRCode = require('../models/QRCode');

const buildOwnershipFilter = (req) => {
  const ownerId = req?.user?.id || req?.user?._id || null;
  const teamId = req?.user?.teamId || null;

  if (!ownerId && !teamId) return {};

  return teamId ? { $or: [{ ownerId }, { teamId }] } : { ownerId };
};

exports.listQRCodes = async (req, res) => {
  const filter = {
    ...buildOwnershipFilter(req),
    isDeleted: false,
  };

  const items = await QRCode.find(filter).sort({ createdAt: -1 }).lean();

  res.status(200).json({ success: true, data: items });
};

exports.createQRCode = async (req, res) => {
  const { name, slug, type, customUrl, foreground, background, shape } = req.body || {};

  if (!name) {
    return res.status(400).json({ success: false, error: 'QR name is required.' });
  }

  const ownerId = req?.user?.id || req?.user?._id || null;
  const destination = customUrl || `https://jeema.one/q/${slug || name.toLowerCase().replace(/\s+/g, '-')}`;

  const item = await QRCode.create({
    ownerId: ownerId || undefined,
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    type: type || 'Website',
    customUrl,
    foreground,
    background,
    shape,
    scanLink: destination,
  });

  res.status(201).json({
    success: true,
    data: item.toObject(),
  });
};

exports.deleteQRCode = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: 'Invalid QR id.' });
  }

  const item = await QRCode.findOneAndUpdate(
    {
      _id: id,
      ...buildOwnershipFilter(req),
      isDeleted: false,
    },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!item) {
    return res.status(404).json({ success: false, error: 'QR not found.' });
  }

  res.status(200).json({ success: true, data: { id: item._id, deleted: true } });
};
