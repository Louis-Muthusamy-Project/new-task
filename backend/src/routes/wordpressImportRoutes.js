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
 */

const express = require('express');
const router = express.Router();

const asyncHandler = require('../utils/asyncHandler');
// Reuse the exact multer config already defined for the Store template
// import engine (memoryStorage, 50 MB limit, single "file" field) rather
// than declaring a second one, so the two upload paths' limits stay in
// sync by construction.
const { upload } = require('../controllers/storeTemplateController');
const { importWordPressZip, WordPressImportValidationError } = require('../services/wordpressImport');

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

    const { name, category, description, thumbnail, preview, status, uploadedByRole } = req.body || {};

    try {
      const { template, warnings, templateId } = await importWordPressZip(req.file.buffer, {
        name: name || req.file.originalname?.replace(/\.[^/.]+$/, '') || 'Imported WordPress Site',
        category,
        description,
        thumbnail,
        preview,
        status,
        uploadedByRole,
        uploadedBy: req?.user?.id || req?.user?._id || null,
      });

      console.log(`[wordpress-import] DONE — template: ${templateId}  pages: ${template.pages?.length || 0}  warnings: ${warnings.length}`);

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

module.exports = router;
