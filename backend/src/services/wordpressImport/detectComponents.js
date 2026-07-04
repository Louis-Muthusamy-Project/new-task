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

const { detectAndReplaceComponents } = require('../../utils/storeComponentDetector');

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
    const { html: componentizedHtml, detected } = detectAndReplaceComponents(bodyHtml);

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
