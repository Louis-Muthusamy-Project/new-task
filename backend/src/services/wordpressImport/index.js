'use strict';

/**
 * services/wordpressImport/index.js
 * WordPress Import Pipeline — orchestrates every stage in order:
 *
 *   1. Accept ZIP upload          (route layer hands this a Buffer)
 *   2. Extract ZIP                -> extractZip.js
 *   3. Validate Simply Static
 *      structure                  -> validateTemplate.js (uses discoverPages.js)
 *   4. Discover HTML pages        -> discoverPages.js (via validateTemplate)
 *   5. Read HTML/CSS/JS           -> fused into uploadAssets.js (Stage 6/7's
 *                                    reused engine reads + rewrites in one pass)
 *   6. Upload all assets to
 *      Cloudinary                 -> uploadAssets.js
 *   7. Replace local asset URLs   -> uploadAssets.js (rewrite) + rewriteAssets.js (QA sweep)
 *   8. Detect reusable components -> detectComponents.js (-> storeComponentDetector.js)
 *   9. Generate StorePage
 *      documents                  -> createStorePages.js
 *  10. Generate StoreTemplate
 *      document                   -> createStoreTemplate.js
 *  11. Return Template ID         -> this function's return value
 *
 * This is a pre-processing + validation wrapper around the existing Store
 * import engine (`parseStoreTemplateZip` in storeTemplateController.js) —
 * it does not fork, modify, or reimplement that engine. No existing
 * controller, model, or route signature changes. See
 * wordpress-import-pipeline-architecture.md for the full design rationale.
 */

const mongoose = require('mongoose');

const { extractZip } = require('./extractZip');
const { validateWordPressStructure } = require('./validateTemplate');
const { uploadAndRewriteAssets } = require('./uploadAssets');
const { findUnrewrittenLocalReferences } = require('./rewriteAssets');
const { detectStoreComponents } = require('./detectComponents');
const { buildPageDefinitions, createLiveStorePages } = require('./createStorePages');
const { generatePreview } = require('./previewGenerator');
const { createStoreTemplateDocument } = require('./createStoreTemplate');
const { uploadBufferToCloudinary } = require('../../config/cloudinary');

/**
 * Thrown when Stage 3 (validate) fails. Carries `errors`/`warnings` so the
 * route layer can respond 422 with the full ValidationReport instead of a
 * generic 500 — nothing is uploaded to Cloudinary or written to Mongo when
 * this is thrown.
 */
class WordPressImportValidationError extends Error {
  constructor(errors = [], warnings = []) {
    super(errors[0] || 'This export failed validation.');
    this.name = 'WordPressImportValidationError';
    this.statusCode = 422;
    this.errors = errors;
    this.warnings = warnings;
  }
}

/**
 * Runs the full WordPress (Simply Static) → StoreTemplate import pipeline.
 *
 * @param {Buffer} zipBuffer  raw ZIP bytes (e.g. multer memory storage's `req.file.buffer`)
 * @param {Object} [meta]
 * @param {string} [meta.name]
 * @param {string} [meta.category]
 * @param {string} [meta.description]
 * @param {string} [meta.thumbnail]      operator-supplied override; auto-derived if omitted
 * @param {string} [meta.preview]        operator-supplied override; auto-derived if omitted
 * @param {string} [meta.status]         'Draft' | 'Published' | 'Archived'
 * @param {string} [meta.uploadedByRole]
 * @param {import('mongoose').Types.ObjectId|string} [meta.uploadedBy]
 * @returns {Promise<{ template: import('mongoose').Document, warnings: string[], templateId: string }>}
 * @throws {WordPressImportValidationError} on Stage 3 failure (422)
 * @throws {Error} with `.statusCode` set for missing-file / unreadable-ZIP cases (400)
 */
async function importWordPressZip(zipBuffer, meta = {}) {
  // Stage 1 — Accept ZIP upload (validated here, at the top of the service,
  // so the route layer stays a thin multer + call-this-function shim).
  if (!zipBuffer || !zipBuffer.length) {
    const error = new Error('No file. Send ZIP under "file" field.');
    error.statusCode = 400;
    throw error;
  }

  // Stage 2 — Extract ZIP
  const zip = await extractZip(zipBuffer);

  // Stage 3 (+ Stage 4, Discover HTML pages, internally) — Validate
  // Simply Static structure. Safety checks + shape checks. Runs entirely
  // in-memory against the JSZip instance — no I/O side effects yet.
  const report = await validateWordPressStructure(zip);
  if (!report.ok) {
    throw new WordPressImportValidationError(report.errors, report.warnings);
  }

  // Reserve the template's _id up front so Stage 6's Cloudinary folder is
  // scoped to the final document's _id — same pattern the existing manual
  // upload route (storeTemplatesRoutes.js) already uses.
  const templateId = new mongoose.Types.ObjectId();
  const cloudinaryFolder = `store-templates/${templateId}/assets`;

  // Stage 5 + 6 + 7 — Read HTML/CSS/JS, Upload all assets to Cloudinary,
  // Replace local asset URLs. Fused into the reused engine (see
  // uploadAssets.js for why). Runs alongside archiving the raw ZIP itself
  // for reference/re-download, same convention as POST /api/store-templates.
  const [zipUploadResult, { pages: parsedPages, assetMap }] = await Promise.all([
    uploadBufferToCloudinary(zipBuffer, { folder: 'store-templates', resourceType: 'raw' }),
    uploadAndRewriteAssets(zipBuffer, { cloudinaryFolder }),
  ]);

  // Post-hoc QA sweep over the rewritten output — non-blocking warnings only.
  const leftoverWarnings = findUnrewrittenLocalReferences(parsedPages);

  // Stage 8 — Detect reusable components (Header/Footer/Navigation/Hero/
  // Product Grid/Category Grid/Contact Form/Newsletter/Blog List/Search
  // Box/Cart Button/Checkout Button). Converts what it safely can into the
  // data-store-block="..." markup contract; flags the rest
  // data-store-mapping="needs-manual-mapping". Never removes HTML — see
  // storeComponentDetector.js.
  const { pages: componentizedPages, summary: componentSummary } = detectStoreComponents(parsedPages);

  // Stage 9 — Generate StorePage documents (embedded snapshot for the
  // Template Library; see createStorePages.js for the live-Store variant).
  const pageDefinitions = buildPageDefinitions(componentizedPages);

  // Auto-derive a thumbnail/preview unless the operator supplied one.
  const derivedPreview = generatePreview({ pages: componentizedPages, assetMap });
  const thumbnail = meta.thumbnail || derivedPreview.thumbnail;
  const preview = meta.preview || derivedPreview.preview;

  // Stage 10 — Generate StoreTemplate document.
  const template = await createStoreTemplateDocument({
    templateId,
    name: meta.name,
    category: meta.category,
    description: meta.description,
    thumbnail,
    preview,
    pages: pageDefinitions,
    zipCloudinaryUrl: zipUploadResult.secure_url,
    assetMap,
    status: meta.status,
    uploadedByRole: meta.uploadedByRole,
    uploadedBy: meta.uploadedBy,
    sourceMeta: { ...report.meta, componentSummary },
  });

  // "Appear in Template Library" needs zero new code here — GET
  // /api/store-templates already returns every StoreTemplate with
  // status: 'Published', sorted by updatedAt.

  const manualMappingWarnings = componentSummary.needsManualMapping
    ? [
        `${componentSummary.needsManualMapping} component(s) (${componentSummary.manualMappingTypes.join(
          ', '
        )}) couldn't be auto-converted and are flagged "Needs Manual Mapping" — their original HTML is unchanged.`,
      ]
    : [];

  // Stage 11 — Return Template ID (alongside the full document and any
  // non-blocking warnings collected along the way).
  return {
    template,
    warnings: [...report.warnings, ...leftoverWarnings, ...manualMappingWarnings],
    componentSummary,
    templateId: String(template._id),
  };
}

module.exports = {
  importWordPressZip,
  WordPressImportValidationError,
  // Re-exported so a future "import straight into a live Store" route can
  // reuse the live-StorePage persistence path without reaching into a
  // sibling file directly.
  createLiveStorePages,
};