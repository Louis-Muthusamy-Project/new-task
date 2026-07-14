'use strict';

/**
 * detectComponents.js
 * New stage — "Detect Reusable Components" — inserted between
 * uploadAssets.js's output (already asset-rewritten `{ html, css }` per
 * page) and createStorePages.js's `buildPageDefinitions()` /
 * `createLiveStorePages()`. See storeComponentDetector.js for the actual
 * detection/conversion logic; this file just fans it out across every page
 * and rolls the per-page results into a pipeline-level summary.
 *
 * Additive-only: every parsed page keeps every field it already had
 * (`name`, `slug`, `isHome`, `content.css`, `content.headLinks`,
 * `content.sourcePath`, ...) — `content.html` only ever gains attributes
 * on elements that were already there (see storeComponentDetector.js's
 * header comment — nothing is wrapped, replaced, or stripped), and one new
 * field, `content.detectedComponents`, is added.
 */

/**
 * detectComponents.js
 * New stage — "Detect Reusable Components" — inserted between
 * uploadAssets.js's output (already asset-rewritten `{ html, css }` per
 * page) and createStorePages.js's `buildPageDefinitions()` /
 * `createLiveStorePages()`. Fans the full Template Import Pipeline
 * (services/templateImplort/index.js's `runTemplateImportPipeline` —
 * Detect Components -> Convert Product Sections -> Inject Store Blocks)
 * out across every page and rolls the per-page results into a
 * pipeline-level summary.
 *
 * §6 "Entry-point convergence is a prerequisite": this stage used to call
 * only Stage 1 (`detectAndReplaceComponents`) directly, so a WordPress
 * import never got Stage 2's per-card field tagging or Stage 3's
 * `data-block-config` seeding — a freshly imported page's grid-family
 * blocks had no starting configuration at all. Converged onto the same
 * full pipeline the Website Builder and Store Template upload paths now
 * both run, so every upload path benefits from the redesign's widened
 * detection signals, count preservation, and config seeding identically.
 *
 * Additive-only, unchanged: every parsed page keeps every field it
 * already had (`name`, `slug`, `isHome`, `content.css`,
 * `content.headLinks`, `content.sourcePath`, ...) — `content.html` only
 * ever gains attributes on elements that were already there (see
 * storeComponentDetector.js's header comment — nothing is wrapped,
 * replaced, or stripped), plus the pipeline's own output fields
 * (`content.detectedComponents`, `content.componentSummary`,
 * `content.storeReady`, `content.previewStatus`).
 */

const { runTemplateImportPipeline } = require('../templateImplort');

/**
 * @param {Array} parsedPages  output of uploadAssets.uploadAndRewriteAssets().pages
 * @returns {{
 *   pages: Array,
 *   summary: {
 *     totalDetected: number,
 *     converted: number,
 *     needsManualMapping: number,
 *     byType: Record<string, number>,
 *     manualMappingTypes: string[]
 *   }
 * }}
 */
function detectStoreComponents(parsedPages = []) {
  let converted = 0;
  let needsManualMapping = 0;
  const byType = {};
  const manualMappingTypes = new Set();

  const pages = parsedPages.map((page) => {
    const bodyHtml = page?.content?.html || '';
    const pageMetadata = {
      isHome: !!page.isHome,
      slug: page.slug || '',
      name: page.name || '',
    };
    const {
      html: componentizedHtml,
      detectedComponents: detected,
      componentSummary,
      storeReady,
      previewStatus,
    } = runTemplateImportPipeline(bodyHtml, pageMetadata);

    detected.forEach((d) => {
      byType[d.type] = (byType[d.type] || 0) + 1;
      if (d.mapping === 'converted') converted++;
      else {
        needsManualMapping++;
        manualMappingTypes.add(d.type);
      }
    });

    return {
      ...page,
      content: {
        ...page.content,
        html: componentizedHtml,
        detectedComponents: detected,
        componentSummary,
        storeReady,
        previewStatus,
      },
    };
  });

  return {
    pages,
    summary: {
      totalDetected: converted + needsManualMapping,
      converted,
      needsManualMapping,
      byType,
      manualMappingTypes: [...manualMappingTypes],
    },
  };
}

module.exports = { detectStoreComponents };
