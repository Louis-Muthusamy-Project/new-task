const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const StoreTemplate = require('../models/store/StoreTemplate');
const asyncHandler = require('../utils/asyncHandler');
const { uploadBufferToCloudinary } = require('../config/cloudinary');
const { upload, parseStoreTemplateZip } = require('../controllers/storeTemplateController');

// GET /api/store-templates — list library entries (mirrors GET /api/templates)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const templates = await StoreTemplate.find({ status: 'Published' }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      data: templates,
    });
  })
);

// POST /api/store-templates — add a store template ZIP to the library.
//
// Runs the same import-engine pipeline as POST /api/store/upload-template
// (Extract -> Read HTML -> Read CSS -> Upload Images -> Generate
// ProjectData) so the saved StoreTemplate.pages snapshot actually contains
// real, asset-rewritten page content — not an empty array. Previously this
// route only stashed the raw ZIP's Cloudinary URL and trusted the client
// to supply a pre-parsed `pages` field, which StoreTemplateLibraryModal.jsx
// never did (it always sends `pages: []`), so every uploaded template
// silently lost its content and every store created from it fell back to
// the generic DEFAULT_STORE_PAGES. The raw ZIP is still uploaded too, for
// re-download/reference.
router.post(
  '/',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    let templateZipCloudinaryUrl = '';
    let parsedPages = [];
    let assetMap = {};

    if (req.file) {
      // Reserve the template's _id up front so the parse pipeline's asset
      // uploads land in a folder scoped to this exact template.
      const templateId = new mongoose.Types.ObjectId();
      const cloudinaryFolder = `store-templates/${templateId}/assets`;

      const [zipUploadResult, parsed] = await Promise.all([
        uploadBufferToCloudinary(req.file.buffer, {
          folder: 'store-templates',
          resourceType: 'raw',
        }),
        parseStoreTemplateZip(req.file.buffer, { cloudinaryFolder }),
      ]);

      templateZipCloudinaryUrl = zipUploadResult.secure_url;
      parsedPages = parsed.pages;
      assetMap = parsed.assetMap;

      req.body._reservedTemplateId = templateId;
    }

    const {
      name,
      category,
      description,
      thumbnail,
      preview,
      pages,
      theme,
      status,
      version,
      uploadedByRole,
    } = req.body;

    // A ZIP that actually parsed into pages wins; otherwise fall back to
    // whatever pre-parsed `pages` JSON the caller supplied (e.g. a
    // non-ZIP/manual template entry).
    if (!parsedPages.length && pages) {
      try {
        parsedPages = JSON.parse(pages);
      } catch (e) {
        console.error('Failed to parse pages array:', e);
      }
    }

    let parsedTheme;
    try {
      if (theme) parsedTheme = JSON.parse(theme);
    } catch (e) {
      console.error('Failed to parse theme object:', e);
    }

    const template = await StoreTemplate.create({
      _id: req.body._reservedTemplateId || undefined,
      name,
      category,
      description,
      thumbnail,
      preview,
      // Full parsed payload (per-page HTML/CSS/asset URLs) alongside the
      // raw ZIP's Cloudinary URL for reference/re-download.
      projectData: { zipCloudinaryUrl: templateZipCloudinaryUrl, assetMap },
      pages: parsedPages,
      theme: parsedTheme,
      status: status || 'Draft',
      version: version || 1,
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