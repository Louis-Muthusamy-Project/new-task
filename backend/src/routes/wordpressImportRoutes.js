'use strict';

/**
 * wordpressImportRoutes.js
 * Thin route layer for the WordPress Import Pipeline
 * (services/wordpressImport/). Mounted alongside storeTemplatesRoutes.js
 * (not merged into it) so the two upload entry points stay independently
 * auditable/loggable, even though they converge on the same StoreTemplate
 * collection internally.
 *
 * Matches the frontend contract exactly (storeTemplateApi.importWordPressTemplate
 * -> ImportWordPressTemplateModal.jsx):
 *   POST /api/wordpress-import/upload  (multipart/form-data)
 *     fields: file, name, category, description, status
 *   200s -> { success: true, data: <StoreTemplate>, warnings: string[] }
 *   422  -> { success: false, error, errors: string[], warnings: string[] }  (Stage 3 validation failure)
 *   400  -> { success: false, error }  (no file / unreadable ZIP)
 *
 *   POST /api/wordpress-import/upload-live  (multipart/form-data)
 *     "Import straight into a Store" — runs the exact same import pipeline
 *     as /upload (ZIP -> StoreTemplate), then immediately creates a live
 *     Store from that template via createStoreFromTemplateDocument
 *     (storeController.js), reusing the same Choose/Clone/Create/
 *     Default-Pages/Demo-Products logic the "Create Store from Template"
 *     flow already uses. One request in, one live Store out.
 *     fields: file, name (-> template name AND store name unless
 *       storeName is given separately), category, description, status,
 *       storeName, currency, installDemo, domain, storeCategory
 *   201  -> { success: true, data: { template, store, pages, products,
 *             collections, discount }, warnings: string[] }
 *   422  -> { success: false, error, errors: string[], warnings: string[] }  (Stage 3 validation failure)
 *   400  -> { success: false, error }  (no file / unreadable ZIP / missing storeName)
 */

const express = require('express');
const router = express.Router();

const asyncHandler = require('../utils/asyncHandler');
// Reuse the exact multer config already defined for the Store template
// import engine (memoryStorage, 200 MB limit, ZIP-only, single "file"
// field) rather than declaring a second one, so the two upload paths'
// limits and accepted file types stay in sync by construction.
const { upload } = require('../controllers/store/storeTemplateController');
const { importWordPressZip, WordPressImportValidationError } = require('../services/wordpressImport');
// Reused by POST /upload-live below so a WordPress ZIP can be imported
// straight into a live Store — Template -> Store, in one request — without
// duplicating the Choose/Clone/Create/Default-Pages/Demo-Products logic
// that already lives in storeController.js.
const { createStoreFromTemplateDocument } = require('../controllers/store/storeController');

// POST /api/wordpress-import/upload
router.post(
  '/upload',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file. Send ZIP under "file" field.' });
    }

    console.log('[wordpress-import] incoming upload —', {
      body: req.body,
      file: { name: req.file.originalname, size: req.file.size },
    });

    const { name, category, description, thumbnail, preview, status, uploadedByRole, templateId } = req.body || {};

    try {
      const { template, warnings, templateId: returnedId } = await importWordPressZip(req.file.buffer, {
        name: name || req.file.originalname?.replace(/\.[^/.]+$/, '') || 'Imported WordPress Site',
        category,
        description,
        thumbnail,
        preview,
        status,
        uploadedByRole,
        uploadedBy: req?.user?.id || req?.user?._id || null,
        templateId,
      });

      console.log(`[wordpress-import] DONE — template: ${returnedId}  pages: ${template.pages?.length || 0}  warnings: ${warnings.length}`);

      return res.status(201).json({ success: true, data: template, warnings });
    } catch (err) {
      if (err instanceof WordPressImportValidationError) {
        console.warn('[wordpress-import] validation failed:', err.errors);
        return res.status(422).json({
          success: false,
          error: err.message,
          errors: err.errors,
          warnings: err.warnings,
        });
      }
      // Anything else (missing file, unreadable ZIP, Cloudinary/Mongo
      // failure) falls through to the shared errorMiddleware, same as
      // every other route in this codebase.
      throw err;
    }
  })
);

// POST /api/wordpress-import/upload-live
// "Import straight into a Store" — the missing entry point named in
// WORDPRESS_IMPORT_THEME_REDESIGN.md §7: today's pipeline always lands in
// the Template Library first (POST /upload above), requiring a separate
// manual "Create Store from Template" step. This route does both in one
// request: run the exact same ZIP -> StoreTemplate pipeline, then
// immediately clone that template into a live Store.
//
// Deliberately does NOT reimplement any persistence logic — it calls
// importWordPressZip (unchanged) followed by createStoreFromTemplateDocument
// (unchanged, just exported), the same two functions /upload and
// /api/store/create-from-template already use independently.
router.post(
  '/upload-live',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file. Send ZIP under "file" field.' });
    }

    const {
      name,
      category,
      description,
      thumbnail,
      preview,
      status,
      uploadedByRole,
      templateId,
      // Store-specific fields — fall back to the template's own name/
      // category/description when not given separately, so a caller that
      // only fills in the existing "name"/"category"/"description" fields
      // (same contract as /upload) still gets a sensibly named Store.
      storeName,
      storeCategory,
      storeDescription,
      currency,
      installDemo,
      domain,
      storeStatus,
    } = req.body || {};

    console.log('[wordpress-import] incoming live upload —', {
      body: req.body,
      file: { name: req.file.originalname, size: req.file.size },
    });

    const ownerId = req?.user?.id || req?.user?._id || null;
    const resolvedTemplateName = name || req.file.originalname?.replace(/\.[^/.]+$/, '') || 'Imported WordPress Site';

    try {
      // Stage A — same ZIP -> StoreTemplate pipeline as /upload.
      const { template, warnings, componentSummary } = await importWordPressZip(req.file.buffer, {
        name: resolvedTemplateName,
        category,
        description,
        thumbnail,
        preview,
        status,
        uploadedByRole,
        uploadedBy: ownerId,
        templateId,
      });

      // Stage B — clone the just-created template into a live Store,
      // reusing the exact "Create Store from Template" core.
      const result = await createStoreFromTemplateDocument({
        templateId: template._id,
        storeName: storeName || resolvedTemplateName,
        currency,
        status: storeStatus,
        installDemo,
        description: storeDescription || description,
        domain,
        category: storeCategory || category,
        ownerId,
      });

      console.log(
        `[wordpress-import] LIVE DONE — template: ${template._id}  store: ${result.store._id}  pages: ${result.pages.length}  warnings: ${warnings.length}`
      );

      return res.status(201).json({
        success: true,
        data: { template, ...result },
        warnings,
        componentSummary,
      });
    } catch (err) {
      if (err instanceof WordPressImportValidationError) {
        console.warn('[wordpress-import] live-import validation failed:', err.errors);
        return res.status(422).json({
          success: false,
          error: err.message,
          errors: err.errors,
          warnings: err.warnings,
        });
      }
      // createStoreFromTemplateDocument throws plain Errors with
      // .statusCode set (400/404) for a missing storeName or a
      // just-vanished template — surface those the same way every other
      // route in this codebase does, rather than falling through to a
      // generic 500.
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, error: err.message });
      }
      throw err;
    }
  })
);

module.exports = router;