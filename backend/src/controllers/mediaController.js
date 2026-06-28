const mongoose = require('mongoose');
const Media = require('../models/Media');

const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

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

const badRequestError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

/**
 * Maps an uploaded file's mimetype to the Media model's `type` enum.
 */
const resolveMediaType = (mimetype = '') => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype === 'application/pdf' || mimetype.startsWith('application/')) return 'document';
  return 'other';
};

/**
 * Maps the Media model's `type` to the Cloudinary resource_type needed
 * for both upload and delete operations.
 */
const resolveCloudinaryResourceType = (mediaType) => {
  if (mediaType === 'image' || mediaType === 'favicon') return 'image';
  if (mediaType === 'video') return 'video';
  return 'raw';
};

/**
 * POST /api/website-builder/media/upload
 * Uploads a file (via multer memoryStorage, req.file.buffer) to
 * Cloudinary, then persists the resulting metadata in MongoDB.
 *
 * NOTE: ownerId is optional — this app does not use JWT auth from the
 * frontend. We fall back to a placeholder so the Media record saves cleanly.
 */
exports.uploadMedia = async (req, res) => {
  // ownerId is best-effort: use req.user if available, otherwise use a
  // sentinel ObjectId so the mongoose required: true constraint is satisfied.
  const ANON_OWNER = new mongoose.Types.ObjectId('000000000000000000000000');
  const ownerId = req?.user?.id || req?.user?._id || ANON_OWNER;

  const { websiteId, type } = req.body;

  if (!req.file) {
    throw badRequestError('No file uploaded. Attach a file under the "file" field.');
  }

  if (websiteId && !mongoose.Types.ObjectId.isValid(websiteId)) {
    throw invalidIdError('Invalid website id.');
  }

  const mediaType = type || resolveMediaType(req.file.mimetype);
  const resourceType = resolveCloudinaryResourceType(mediaType);

  const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
    folder: websiteId ? `media-library/${websiteId}` : 'media-library',
    resourceType,
  });

  const media = await Media.create({
    websiteId: websiteId || null,
    ownerId,
    type: mediaType,
    url: uploadResult.secure_url,
    cloudinaryPublicId: uploadResult.public_id,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
    width: uploadResult.width || null,
    height: uploadResult.height || null,
  });

  // Return in GrapesJS-compatible format so the asset manager auto-adds the
  // image after upload without extra client-side wiring.
  res.status(201).json({
    success: true,
    data: {
      src: media.url,
      name: media.fileName,
      type: media.type,
      width: media.width,
      height: media.height,
      id: media._id,
    },
  });
};

/**
 * GET /api/website-builder/media
 * Lists non-deleted media, optionally filtered by websiteId and/or type,
 * with pagination. No auth required — scoped by websiteId instead.
 */
exports.getMediaList = async (req, res) => {
  const { websiteId, type } = req.query;

  if (websiteId && !mongoose.Types.ObjectId.isValid(websiteId)) {
    throw invalidIdError('Invalid website id.');
  }

  const filter = { isDeleted: false };
  if (websiteId) filter.websiteId = websiteId;
  if (type) filter.type = type;

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 200);
  const skip = (page - 1) * limit;

  const [media, total] = await Promise.all([
    Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Media.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: media,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

/**
 * GET /api/website-builder/media/:id
 */
exports.getMediaById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError('Invalid media id.');
  }

  const media = await Media.findOne({ _id: id, isDeleted: false });

  if (!media) {
    throw notFoundError('Media not found.');
  }

  res.status(200).json({ success: true, data: media });
};

/**
 * DELETE /api/website-builder/media/:id
 */
exports.deleteMedia = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError('Invalid media id.');
  }

  const media = await Media.findOne({ _id: id, isDeleted: false });

  if (!media) {
    throw notFoundError('Media not found.');
  }

  if (media.cloudinaryPublicId) {
    const resourceType = resolveCloudinaryResourceType(media.type);
    await deleteFromCloudinary(media.cloudinaryPublicId, { resourceType });
  }

  media.isDeleted = true;
  await media.save();

  res.status(200).json({ success: true, data: { id: media._id, deleted: true } });
};