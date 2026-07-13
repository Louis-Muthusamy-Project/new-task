'use strict';

/**
 * services/templateImport — reusable, upload-path-agnostic Template Import
 * Pipeline services.
 *
 * New pipeline (replaces the old "extract → split → save" pipeline that
 * shipped zero Store awareness for Website Builder uploads):
 *
 *   ZIP → Extract HTML → Split Pages
 *       → Detect Components   (detectStoreComponents.js)
 *       → Convert Product Sections (productSectionConverter.js)
 *       → Inject Store Blocks (storeBlockInjector.js)
 *       → Save Website Pages
 *       → Preview Ready
 *
 * Each stage is its own module so any of the three upload controllers
 * (Website Builder, Store Template manual upload, WordPress Import) can
 * call the exact same pipeline instead of re-implementing detection —
 * this is the "one detection stage, three entry points" move described in
 * the store-theme-binding-architecture-plan.
 *
 * Safety contract (holds for the pipeline as a whole, not just each
 * stage individually): if ANY stage throws or misbehaves, the page's
 * ORIGINAL, untouched HTML is what gets saved. A best-effort detection
 * pass is a bonus; it must never be able to break an upload that would
 * otherwise have succeeded.
 */

const { detectStoreComponents } = require('./detectStoreComponents');
const { convertProductSections } = require('./productSectionConverter');
const { injectStoreBlocks } = require('./storeBlockInjector');

/**
 * Runs the full Detect → Convert → Inject pipeline for one page's
 * body-only HTML.
 *
 * @param {string} html          body HTML for a single page (post asset-rewrite)
 * @param {object} pageMetadata  { isHome, slug, name }
 * @returns {{
 *   html: string,                 // final HTML to persist (tagged, or original on failure)
 *   detectedComponents: Array,    // what was found (empty if detection failed)
 *   componentSummary: object,     // counts / needsManualMapping / storeReady inputs
 *   storeReady: boolean,          // true once the page has at least one live-hydratable block
 *   previewStatus: 'ready'|'static'|'fallback',
 * }}
 */
function runTemplateImportPipeline(html, pageMetadata = {}) {
  const originalHtml = typeof html === 'string' ? html : '';

  try {
    // Stage 1 — Detect Components (also does the base attribute injection
    // for whole containers; see detectStoreComponents.js).
    const detectResult = detectStoreComponents(originalHtml, pageMetadata);

    // Stage 2 — Convert Product Sections (per-card / per-field tagging
    // inside already-detected grid/PDP containers).
    const convertResult = convertProductSections(detectResult.html, detectResult.detected);

    // Stage 3 — Inject Store Blocks (finalize: summary + readiness markers).
    const injectResult = injectStoreBlocks(convertResult.html, detectResult.detected);

    const detectionSucceeded = detectResult.ok && detectResult.detected.length > 0;

    return {
      html: injectResult.html,
      detectedComponents: detectResult.detected,
      componentSummary: injectResult.componentSummary,
      storeReady: injectResult.storeReady,
      previewStatus: injectResult.storeReady ? 'ready' : (detectionSucceeded ? 'static' : 'fallback'),
      pipeline: {
        detect: { ok: detectResult.ok, error: detectResult.error || null },
        convert: { ok: convertResult.ok, cardsTagged: convertResult.cardsTagged || 0, error: convertResult.error || null },
        inject: { ok: injectResult.ok, error: injectResult.error || null },
      },
    };
  } catch (err) {
    // Top-level net: even if a stage's own try/catch somehow didn't
    // catch something (e.g. a bug in the orchestration itself), the
    // caller still gets the page's original HTML back, never a crash.
    console.warn('[templateImport] pipeline failed entirely — preserving original HTML:', err?.message || err);
    return {
      html: originalHtml,
      detectedComponents: [],
      componentSummary: { totalDetected: 0, byType: {}, needsManualMapping: [], passthroughTypes: [], liveDataBlocks: 0 },
      storeReady: false,
      previewStatus: 'fallback',
      pipeline: { detect: { ok: false, error: err?.message || String(err) }, convert: { ok: false }, inject: { ok: false } },
    };
  }
}

module.exports = {
  runTemplateImportPipeline,
  // Re-exported for callers that need a single stage in isolation (e.g.
  // storeTemplateController wiring the shared detector per the
  // architecture plan's migration step 2).
  detectStoreComponents,
  convertProductSections,
  injectStoreBlocks,
};
