'use strict';

/**
 * detectStoreComponents.js
 *
 * Stage 1 of the Template Import Pipeline — "Detect Components".
 *
 * This is a thin, failure-isolated wrapper around the existing heuristic
 * classifier in `utils/storeComponentDetector.js` (header / footer / nav /
 * hero / product-grid family / product-detail / cart / checkout / wishlist /
 * search / pagination / cart-button / checkout-button / etc.). That module
 * already does the hard part; this file's only job is to:
 *
 *   1. Give the detector a stable, upload-path-agnostic home so any upload
 *      pipeline (Website Builder, Store Template, WordPress Import) can
 *      call the exact same detection logic instead of each other
 *      re-implementing it.
 *   2. Guarantee the pipeline's core safety contract: detection NEVER
 *      throws past this boundary. If cheerio parsing or classification
 *      blows up on some malformed/unusual markup, the original HTML is
 *      returned untouched and the failure is reported instead of crashing
 *      the whole upload.
 *
 * Nothing here mutates markup beyond what storeComponentDetector already
 * does (additive `data-store-block` / `data-store-mapping` attributes
 * only) — see that module's header comment for the full contract.
 */

const { detectAndReplaceComponents } = require('../../utils/storeComponentDetector');

/**
 * @param {string} html          body-only HTML for one page
 * @param {object} pageMetadata  { isHome, slug, name }
 * @returns {{
 *   html: string,
 *   detected: Array<{type:string,label:string,score:number,mapping:string}>,
 *   ok: boolean,
 *   error?: string
 * }}
 */
function detectStoreComponents(html, pageMetadata = {}) {
  const original = typeof html === 'string' ? html : '';

  if (!original.trim()) {
    return { html: original, detected: [], ok: true };
  }

  try {
    const { html: taggedHtml, detected } = detectAndReplaceComponents(original, pageMetadata);

    // Belt-and-braces: never hand back an empty result for non-empty
    // input — treat that as a failed detection rather than silently
    // wiping the page.
    if (!taggedHtml || !taggedHtml.trim()) {
      return { html: original, detected: [], ok: false, error: 'Detector returned empty HTML' };
    }

    return { html: taggedHtml, detected: detected || [], ok: true };
  } catch (err) {
    console.warn('[templateImport] detectStoreComponents failed — preserving original HTML:', err?.message || err);
    return { html: original, detected: [], ok: false, error: err?.message || String(err) };
  }
}

module.exports = { detectStoreComponents };
