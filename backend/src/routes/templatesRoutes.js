const express = require('express');
const router = express.Router();

const WebsiteTemplate = require('../models/WebsiteTemplate');
const asyncHandler = require('../utils/asyncHandler');
const { upload } = require('../controllers/websiteTemplateController');
const { uploadBufferToCloudinary } = require('../config/cloudinary');

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const templates = await WebsiteTemplate.find({ isActive: true }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      data: templates,
    });
  })
);

router.post(
  '/',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    let templateZipCloudinaryUrl = '';
    if (req.file) {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'website-templates',
        resourceType: 'raw',
      });
      templateZipCloudinaryUrl = uploadResult.secure_url;
    }

    const { name, category, description, thumbnailUrl, pages } = req.body;
    let parsedPages = [];
    try {
      if (pages) parsedPages = JSON.parse(pages);
    } catch (e) {
      console.error('Failed to parse pages array:', e);
    }

    const template = await WebsiteTemplate.create({
      name,
      category,
      description,
      thumbnailUrl,
      templateZipCloudinaryUrl,
      pages: parsedPages,
    });

    res.status(201).json({
      success: true,
      data: template,
    });
  })
);

module.exports = router;
