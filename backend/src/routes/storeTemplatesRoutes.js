const express = require('express');
const router = express.Router();

const StoreTemplate = require('../models/store/StoreTemplate');
const asyncHandler = require('../utils/asyncHandler');
const { uploadBufferToCloudinary } = require('../config/cloudinary');
const { upload } = require('../controllers/storeTemplateController');

// GET /api/store-templates — list library entries (mirrors GET /api/templates)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const templates = await StoreTemplate.find({ isActive: true }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      data: templates,
    });
  })
);

// POST /api/store-templates — add a store template ZIP to the library.
// Only the raw ZIP + a lightweight page snapshot are stored here (this is
// the library-catalogue write, not the full parse-into-a-Store pipeline —
// that lives at POST /api/store/upload-template).
router.post(
  '/',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    let templateZipCloudinaryUrl = '';
    if (req.file) {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'store-templates',
        resourceType: 'raw',
      });
      templateZipCloudinaryUrl = uploadResult.secure_url;
    }

    const { name, category, description, thumbnailUrl, pages, uploadedByRole } = req.body;
    let parsedPages = [];
    try {
      if (pages) parsedPages = JSON.parse(pages);
    } catch (e) {
      console.error('Failed to parse pages array:', e);
    }

    const template = await StoreTemplate.create({
      name,
      category,
      description,
      thumbnailUrl,
      templateZipCloudinaryUrl,
      pages: parsedPages,
      uploadedByRole,
      uploadedBy: req?.user?.id || req?.user?._id || null,
    });

    res.status(201).json({
      success: true,
      data: template,
    });
  })
);

module.exports = router;
