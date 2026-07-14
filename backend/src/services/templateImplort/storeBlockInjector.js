'use strict';

/**
 * storeBlockInjector.js
 *
 * Stage 3 of the Template Import Pipeline — "Inject Store Blocks".
 *
 * Stages 1 and 2 already write every `data-store-block` /
 * `data-store-mapping` attribute onto the markup — by the time this stage
 * runs, injection has already happened. This stage's job is to *finalize*
 * that work into something the rest of the app (Store Admin UI, Preview,
 * a future "create Store from this template" action) can consume without
 * re-parsing HTML:
 *
 *   - A `componentSummary` — counts per type, which ones auto-converted
 *     vs. still need manual mapping, and whether the page has enough
 *     coverage to be considered "store ready".
 *   - A `data-store-theme="true"` marker on the page root so any later
 *     stage can tell at a glance (without re-scanning) that this page has
 *     already been through detection, and a `data-store-preview="ready"`
 *     marker once at least one live-hydratable block was found — this is
 *     what "Preview Ready" (the pipeline's last step) actually means.
 *   - §3 Configuration System: seeds every grid-family container's
 *     initial `data-block-config` — the ONE canonical, JSON-serialized
 *     attribute the frontend trait factory and runtime reader both read/
 *     write (see backend/src/utils/blockConfigSchema.js and its frontend
 *     mirror). `limit` is seeded from Stage 2's preserved native item
 *     count when present (§2), clamped into a safe band; every other
 *     field gets the schema's sensible default. This is written ONCE, at
 *     import time — a merchant's later GrapesJS trait edits overwrite
 *     this same attribute going forward, never a second one (§6
 *     single-write).
 *
 * Like Stages 1 & 2: additive only, and failure-isolated — if summarizing
 * blows up for some reason, the page's tagged HTML from the earlier
 * stages is still returned untouched; only the summary degrades to an
 * empty/default shape.
 */

const cheerio = require('cheerio');
const { MANUAL_MAPPING_TYPES, PASSTHROUGH_TYPES } = require('../../utils/storeBlockTemplates');
const { CONFIG_ATTR, GRID_FAMILY_TYPES, buildDefaultConfig } = require('../../utils/blockConfigSchema');

// Minimum signal for a page to be worth previewing against live Store data:
// at least one product-listing-shaped block (grid family or a PDP).
const LIVE_DATA_TYPES = new Set([
  'product-grid', 'featured-products', 'latest-products', 'best-sellers',
  'related-products', 'category-grid', 'product-detail', 'cart', 'checkout',
  'wishlist', 'wishlist-button', 'search', 'pagination', 'cart-button', 'checkout-button',
]);

function summarize(detected) {
  const byType = {};
  const needsManualMapping = [];
  let liveDataBlocks = 0;

  for (const d of detected) {
    byType[d.type] = (byType[d.type] || 0) + 1;
    if (d.mapping === 'needs-manual-mapping' || MANUAL_MAPPING_TYPES.has(d.type)) {
      needsManualMapping.push(d.type);
    }
    if (LIVE_DATA_TYPES.has(d.type)) liveDataBlocks += 1;
  }

  return {
    totalDetected: detected.length,
    byType,
    needsManualMapping: [...new Set(needsManualMapping)],
    passthroughTypes: [...new Set(detected.map((d) => d.type).filter((t) => PASSTHROUGH_TYPES.has(t)))],
    liveDataBlocks,
  };
}

/**
 * @param {string} html      Stage 2 output
 * @param {Array}  detected  Accumulated detected list from Stage 1
 * @returns {{ html: string, componentSummary: object, storeReady: boolean, ok: boolean }}
 */
function injectStoreBlocks(html, detected = []) {
  const original = typeof html === 'string' ? html : '';
  const componentSummary = summarize(detected);
  const storeReady = componentSummary.liveDataBlocks > 0;

  if (!original.trim()) {
    return { html: original, componentSummary, storeReady: false, ok: true };
  }

  try {
    const $ = cheerio.load(original, { decodeEntities: false });
    const $root = $('body').children().first();
    const target = $root.length ? $root : $('body');

    target.attr('data-store-theme', 'true');
    if (storeReady) target.attr('data-store-preview', 'ready');

    // §3 — seed data-block-config on every grid-family container. Runs
    // over every detected type, not just ones with a native count, so a
    // comment-marker-tagged block (which never went through Stage 2's
    // card walk) still starts life with the schema's sensible defaults
    // instead of no config at all.
    [...GRID_FAMILY_TYPES].forEach((type) => {
      $(`[data-store-block="${type}"]`).each((_, container) => {
        const $container = $(container);
        if ($container.attr(CONFIG_ATTR)) return; // never overwrite an already-seeded config

        const nativeCountAttr = $container.attr('data-native-count');
        const nativeCount = nativeCountAttr ? Number(nativeCountAttr) : undefined;
        const config = buildDefaultConfig(type, { nativeCount });

        $container.attr(CONFIG_ATTR, JSON.stringify(config));
        // Internal-only handoff attribute from Stage 2 — never part of
        // the final persisted config surface.
        $container.removeAttr('data-native-count');
      });
    });

    return { html: $('body').html() || $.html(), componentSummary, storeReady, ok: true };
  } catch (err) {
    console.warn('[templateImport] injectStoreBlocks marker pass failed — keeping Stage 2 output:', err?.message || err);
    // The markers are a nice-to-have; the detected/converted HTML itself
    // (already valid from Stage 1/2) is still returned as-is.
    return { html: original, componentSummary, storeReady, ok: false, error: err?.message || String(err) };
  }
}

module.exports = { injectStoreBlocks };
