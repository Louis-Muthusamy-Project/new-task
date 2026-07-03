'use strict';

/**
 * uploadAssets.js
 * Stage 6 ("Upload all assets to Cloudinary") of the WordPress Import
 * Pipeline.
 *
 * This does NOT re-implement asset upload. Cloudinary upload and HTML/CSS
 * asset-URL rewriting are one fused pass inside the existing, battle-tested
 * `parseStoreTemplateZip()` engine (controllers/storeTemplateController.js):
 * it catalogues every image/font/js/css reference, uploads each one to
 * Cloudinary exactly once (5-way concurrency limit, dedup by secureUrl),
 * and rewrites every asset-bearing HTML/CSS reference to the resulting CDN
 * URL in the same traversal. Splitting "upload" from "rewrite" into two
 * independently-callable functions would mean duplicating that regex-heavy
 * tag/attribute matching in two places — exactly what "do not duplicate
 * existing services" rules out.
 *
 * This module is the WordPress Import Pipeline's single call-site for that
 * reused engine, so every other stage in this service only ever imports it
 * from here rather than reaching into the controller directly.
 */

const { parseStoreTemplateZip } = require('../../controllers/storeTemplateController');

/**
 * @param {Buffer} zipBuffer
 * @param {{ cloudinaryFolder: string }} options  e.g. `store-templates/${templateId}/assets`
 * @returns {Promise<{ pages: Array, assetMap: Object }>}
 *   pages[i] = { name, slug, isHome, content: { html, css, headLinks, sourcePath } }
 *   assetMap = { [originalZipPath]: cloudinarySecureUrl }
 */
async function uploadAndRewriteAssets(zipBuffer, { cloudinaryFolder }) {
  return parseStoreTemplateZip(zipBuffer, { cloudinaryFolder });
}

module.exports = { uploadAndRewriteAssets };
