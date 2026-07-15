const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const StoreTemplate = require('../../models/store/StoreTemplate');
const asyncHandler = require('../../utils/asyncHandler');
const { uploadBufferToCloudinary } = require('../../config/cloudinary');
const { upload, parseStoreTemplateZip } = require('../../controllers/store/storeTemplateController');

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
    // Real products parsed out of the ZIP by the Template Import
    // Pipeline's extraction stage (services/templateImplort/
    // productDataExtractor.js) — see models/store/StoreTemplate.js's
    // demoProducts field. [] when the template has no detectable
    // products; installDemo then falls back to the generic seed at
    // store-creation time (storeController.js).
    let parsedDemoProducts = [];

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
      parsedDemoProducts = parsed.demoProducts || [];

      req.body._reservedTemplateId = templateId;
    }

    const {
      name,
      category,
      description,
      thumbnail,
      preview,
      pages,
      demoProducts,
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

    // Same fallback pattern as `pages` above — a ZIP's own extraction
    // wins; a caller-supplied `demoProducts` JSON field (e.g. a manual/
    // non-ZIP template entry) is only used when the ZIP yielded nothing.
    if (!parsedDemoProducts.length && demoProducts) {
      try {
        parsedDemoProducts = JSON.parse(demoProducts);
      } catch (e) {
        console.error('Failed to parse demoProducts array:', e);
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
      demoProducts: parsedDemoProducts,
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

// GET /api/store-templates/:id/versions — list version history (v1, v2, ...)
// for the version-switcher UI (StoreTemplateLibraryModal's v1/v2 tabs).
router.get(
  '/:id/versions',
  asyncHandler(async (req, res) => {
    const template = await StoreTemplate.findById(req.params.id).select('name version versions');
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.status(200).json({
      success: true,
      data: {
        currentVersion: template.version,
        versions: template.versions,
      },
    });
  })
);

// POST /api/store-templates/:id/versions — snapshot the template's current
// projectData/pages/theme as a new version (e.g. after editing v1, save it
// as v2 while keeping v1 in history).
router.post(
  '/:id/versions',
  asyncHandler(async (req, res) => {
    const template = await StoreTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    const { label } = req.body || {};
    const nextVersion = (template.versions?.length
      ? Math.max(...template.versions.map((v) => v.version))
      : template.version || 0) + 1;

    template.versions.push({
      version: nextVersion,
      projectData: template.projectData,
      pages: template.pages,
      theme: template.theme,
      thumbnail: template.thumbnail,
      preview: template.preview,
      demoProducts: template.demoProducts,
      label: label || `Version ${nextVersion}`,
      createdBy: req?.user?.id || req?.user?._id || null,
      createdAt: new Date(),
    });
    template.version = nextVersion;

    await template.save();

    res.status(201).json({
      success: true,
      data: template,
    });
  })
);

// POST /api/store-templates/:id/rollback/:version — restore the template's
// live projectData/pages/theme/thumbnail/preview to a prior version's
// snapshot. The rollback itself is recorded as a new version entry (rather
// than deleting anything after the target) so history is never destroyed —
// rolling back from v3 to v1 produces a v4 that mirrors v1's content.
router.post(
  '/:id/rollback/:version',
  asyncHandler(async (req, res) => {
    const template = await StoreTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    const targetVersion = Number(req.params.version);
    const target = template.versions.find((v) => v.version === targetVersion);
    if (!target) {
      return res.status(404).json({ success: false, error: `Version ${req.params.version} not found` });
    }

    template.projectData = target.projectData;
    template.pages = target.pages;
    template.theme = target.theme;
    template.thumbnail = target.thumbnail;
    template.preview = target.preview;
    template.demoProducts = target.demoProducts;

    const nextVersion = Math.max(...template.versions.map((v) => v.version)) + 1;
    template.versions.push({
      version: nextVersion,
      projectData: target.projectData,
      pages: target.pages,
      theme: target.theme,
      thumbnail: target.thumbnail,
      preview: target.preview,
      demoProducts: target.demoProducts,
      label: `Rollback to v${targetVersion}`,
      createdBy: req?.user?.id || req?.user?._id || null,
      createdAt: new Date(),
    });
    template.version = nextVersion;

    await template.save();

    res.status(200).json({
      success: true,
      data: template,
    });
  })
);

// POST /api/store-templates/:id/duplicate — clone a library entry into a
// brand-new StoreTemplate document (fresh _id, version reset to 1, history
// reset to just that seed version) so it can be edited independently
// without touching the original ("Duplicate Template" action).
router.post(
  '/:id/duplicate',
  asyncHandler(async (req, res) => {
    const source = await StoreTemplate.findById(req.params.id);
    if (!source) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    const { name } = req.body || {};

    const duplicate = await StoreTemplate.create({
      name: name || `${source.name} (Copy)`,
      category: source.category,
      description: source.description,
      preview: source.preview,
      thumbnail: source.thumbnail,
      projectData: source.projectData,
      pages: source.pages,
      demoProducts: source.demoProducts,
      theme: source.theme,
      status: 'Draft',
      version: 1,
      uploadedByRole: req?.user?.role || source.uploadedByRole,
      uploadedBy: req?.user?.id || req?.user?._id || null,
    });

    res.status(201).json({
      success: true,
      data: duplicate,
    });
  })
);

module.exports = router;