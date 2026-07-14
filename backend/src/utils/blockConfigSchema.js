'use strict';

/**
 * blockConfigSchema.js
 *
 * Canonical Block Configuration Schema — §3 of the Dynamic Store Engine
 * Template-Agnostic Redesign.
 *
 * Root cause this fixes: config was invented independently at two layers
 * with no shared naming contract — `storeBlockTraits.js` (GrapesJS
 * traits, wrote `data-limit`, `data-sort`, `data-collection`, …) and
 * `ThemeRenderer.jsx`'s `blockConfig()` (runtime reader, read `data-limit`,
 * `data-sort`, `data-collection-id`, …). Nothing forced those two lists of
 * attribute names to agree, which is exactly how `data-collection` vs
 * `data-collection-id` diverged.
 *
 * Design: ONE JSON-serialized attribute, `data-block-config`, on the
 * block's own root element, replacing the old one-attribute-per-field
 * pattern. There's exactly one attribute name for every consumer to
 * agree on — eliminating the entire *class* of naming mismatches (not
 * just the one already found), since there's nothing left to spell two
 * different ways.
 *
 * This is the backend half — used when a fresh detection pass seeds a
 * container's starting config at import time. The frontend mirror lives
 * at frontend/src/pages/WebsiteBuilder/builders/store/blockConfigSchema.js
 * and is what the GrapesJS trait factory and ThemeRenderer.jsx's
 * `blockConfig()` both import, so THAT pair (trait writer + runtime
 * reader) is genuinely one shared module, not two independently-typed
 * lists. The two files can't literally be one module across two separate
 * deployables in this repo, so field keys/shape here must stay identical
 * to the frontend copy — change both together.
 */

// The one attribute every consumer reads/writes.
const CONFIG_ATTR = 'data-block-config';

const GRID_FAMILY_TYPES = new Set([
  'product-grid',
  'featured-products',
  'latest-products',
  'best-sellers',
  'related-products',
  'category-grid',
]);

// §2 Product Count Preservation — a template's native repeat count is
// trusted as the seeded `limit`, but always clamped into this band so a
// theme export with one placeholder card repeated an unrealistic number
// of times can never leak through as a runaway `limit`.
const NATIVE_COUNT_CLAMP = { min: 2, max: 24 };

const DEFAULT_LIMIT_BY_TYPE = {
  'product-grid': 12,
  'featured-products': 8,
  'latest-products': 8,
  'best-sellers': 8,
  'related-products': 4,
  'category-grid': 6,
};

// Symbolic token meaning "resolve from the current page-visit's
// navigation context" (§4 mode 1) — never a literal id baked in at
// import time, since no StoreCollection exists yet then.
const CURRENT_COLLECTION_TOKEN = 'current';

/** Clamps a native item count into the safe seeding band (§2). */
function clampNativeCount(n) {
  const num = Number(n);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.min(NATIVE_COUNT_CLAMP.max, Math.max(NATIVE_COUNT_CLAMP.min, Math.round(num)));
}

/**
 * Builds the canonical default config object for one block type, folding
 * in a native item count when one was preserved from detection (§2).
 * Shape must match the frontend mirror's `buildDefaultConfig` exactly —
 * grouped by concern per §3: data selection / presentation / pagination.
 *
 * @param {string} type
 * @param {{ nativeCount?: number }} [opts]
 */
function buildDefaultConfig(type, opts = {}) {
  const isGridFamily = GRID_FAMILY_TYPES.has(type);
  if (!isGridFamily) return {};

  const seededLimit = clampNativeCount(opts.nativeCount) || DEFAULT_LIMIT_BY_TYPE[type] || 12;
  const isCategoryGrid = type === 'category-grid';

  return {
    // ── Data selection ──────────────────────────────────────────────
    limit: seededLimit,
    ...(isCategoryGrid ? {} : { sort: 'latest' }),
    ...(type === 'product-grid' || isCategoryGrid ? { collectionBinding: CURRENT_COLLECTION_TOKEN } : {}),
    filters: { tag: '', priceMin: null, priceMax: null, inStockOnly: false },

    // ── Presentation ────────────────────────────────────────────────
    layout: {
      columns: isCategoryGrid ? 3 : 4,
      cardStyle: 'default',
      showPrice: !isCategoryGrid,
      showRating: false,
      showAddToCart: !isCategoryGrid,
    },

    // ── Pagination ──────────────────────────────────────────────────
    pagination: { enabled: false, pageSize: seededLimit, group: 'default' },
  };
}

module.exports = {
  CONFIG_ATTR,
  GRID_FAMILY_TYPES,
  NATIVE_COUNT_CLAMP,
  DEFAULT_LIMIT_BY_TYPE,
  CURRENT_COLLECTION_TOKEN,
  clampNativeCount,
  buildDefaultConfig,
};
