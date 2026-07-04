'use strict';

/**
 * createStorePages.js
 * Stage 8 ("Generate StorePage documents") of the WordPress Import
 * Pipeline.
 *
 * Two shapes of "page document" already exist in this codebase, for two
 * different consumers:
 *
 *  1. `buildPageDefinitions()` — a lightweight embedded snapshot
 *     (`TemplatePageDefinitionSchema[]`) written onto `StoreTemplate.pages`
 *     for fast Template Library rendering. This is what the WordPress
 *     Import Service's primary route uses (matches
 *     ImportWordPressTemplateModal.jsx → StoreTemplate library), since a
 *     WordPress import lands in the Template Library, not directly in a
 *     live Store.
 *
 *  2. `createLiveStorePages()` — real `StorePage` Mongo documents, created
 *     only once an operator instantiates a live Store from a template
 *     (the existing CreateStoreModal flow), or via the direct
 *     "/store/upload-template" path (`uploadStoreTemplateZipToCloudinary`
 *     in storeTemplateController.js). Reuses the existing `StorePage`
 *     model, unmodified — provided here so a future "import straight into
 *     a live Store" entry point doesn't have to duplicate that persistence
 *     logic either.
 */

const StorePage = require('../../models/store/StorePage');
const { resolveStoreBlockPlaceholders } = require('../../utils/storeBlockTemplates');

/**
 * @param {Array} parsedPages  output of uploadAssets.uploadAndRewriteAssets().pages
 * @returns {Array<{ name: string, slug: string, isHome: boolean, content: object }>}
 *   TemplatePageDefinitionSchema-shaped page snapshots, ready to assign to
 *   `StoreTemplate.pages`.
 */
function buildPageDefinitions(parsedPages = []) {
  return parsedPages.map(({ name, slug, isHome, content }) => ({
    name,
    slug,
    isHome: !!isHome,
    content,
  }));
}

/**
 * Persists real StorePage documents for a live Store. Same shape/behavior
 * as `uploadStoreTemplateZipToCloudinary`'s inner `Promise.all` in
 * storeTemplateController.js, reused here rather than reimplemented, plus
 * one additive step: any `{{STORE_ID}}` token the component detector left
 * in a converted block's hydration script (storeComponentDetector.js /
 * storeBlockTemplates.js) is resolved to this real `storeId` now that one
 * finally exists. A no-op for pages with no detected/converted blocks.
 *
 * @param {import('mongoose').Types.ObjectId|string} storeId
 * @param {Array} parsedPages
 * @returns {Promise<Array>} created StorePage documents
 */
async function createLiveStorePages(storeId, parsedPages = []) {
  return Promise.all(
    parsedPages.map((p) =>
      StorePage.create({
        storeId,
        name: p.name,
        slug: p.slug,
        isHome: !!p.isHome,
        status: 'Draft',
        content: {
          ...p.content,
          html: resolveStoreBlockPlaceholders(p.content?.html, storeId),
        },
      })
    )
  );
}

module.exports = { buildPageDefinitions, createLiveStorePages };