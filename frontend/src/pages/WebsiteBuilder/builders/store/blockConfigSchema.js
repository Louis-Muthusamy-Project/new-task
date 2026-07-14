/**
 * blockConfigSchema.js
 *
 * Canonical Block Configuration Schema — §3 of the Dynamic Store Engine
 * Template-Agnostic Redesign.
 *
 * This is the ONE module `storeBlockTraits.js` (the GrapesJS trait
 * factory — the writer) and `ThemeRenderer.jsx`'s `blockConfig()` (the
 * runtime reader) both import, so the pair that actually diverged before
 * (`data-collection` vs `data-collection-id`) now has nothing left to
 * spell two different ways: both read/write the SAME `data-block-config`
 * JSON attribute, using the SAME field keys defined once, right here.
 *
 * There's a backend mirror at backend/src/utils/blockConfigSchema.js,
 * used when a fresh detection pass seeds a container's starting config at
 * import time — it can't be one literal shared file across two separate
 * deployables in this repo, so field keys/shape must stay identical
 * between the two copies, changed together.
 */

// The one attribute every consumer reads/writes — replaces the old
// one-`data-*`-attribute-per-field pattern.
export const CONFIG_ATTR = 'data-block-config';

// §6 Backward Compatibility — the legacy per-field attribute names this
// replaces. The runtime reader's dual-read fallback (only used when
// `CONFIG_ATTR` is absent, i.e. an already-imported page from before this
// redesign) checks these. `data-collection` is explicitly recognized as
// an alias for collection binding — an old page's merchant-set value must
// never be silently dropped just because the canonical name changed.
export const LEGACY_ATTR_ALIASES = {
  limit: ['data-limit'],
  sort: ['data-sort'],
  collectionBinding: ['data-collection-id', 'data-collection'],
  columns: ['data-columns'],
  showPrice: ['data-show-price'],
  showButton: ['data-show-button'],
  showRating: ['data-show-rating'],
  group: ['data-group'],
  productId: ['data-product-id'],
  redirectUrl: ['data-redirect-url'],
};

export const GRID_FAMILY_TYPES = new Set([
  'product-grid',
  'featured-products',
  'latest-products',
  'best-sellers',
  'related-products',
  'sale-products',
  'category-products',
  'category-grid',
]);

export const SORT_OPTIONS = [
  { value: 'latest', name: 'Latest' },
  { value: 'oldest', name: 'Oldest' },
  { value: 'price-low', name: 'Price: Low to High' },
  { value: 'price-high', name: 'Price: High to Low' },
  { value: 'name-asc', name: 'Name: A to Z' },
  { value: 'name-desc', name: 'Name: Z to A' },
  { value: 'best-selling', name: 'Best Selling' },
];

const DEFAULT_LIMIT_BY_TYPE = {
  'product-grid': 12,
  'featured-products': 8,
  'latest-products': 8,
  'best-sellers': 8,
  'related-products': 4,
  'sale-products': 8,
  'category-products': 12,
  'category-grid': 6,
};

// Symbolic token meaning "resolve from the current page-visit's
// navigation context" (§4 mode 1) — the collection-picker trait also
// offers this explicitly as "Current category (automatic)".
export const CURRENT_COLLECTION_TOKEN = 'current';

/**
 * CONFIG_FIELDS — one definition per canonical field, grouped by concern
 * (data selection / presentation / pagination) per §3. `appliesTo` gates
 * which block types actually get the trait for that field — this is what
 * makes trait coverage automatic (§5): every type in `GRID_FAMILY_TYPES`
 * (or whichever set a field names) gets the field's trait, with no
 * separate per-type list a developer has to remember to update.
 */
export const CONFIG_FIELDS = [
  {
    key: 'limit',
    label: 'Products Limit',
    widget: 'number',
    min: 1,
    max: 50,
    appliesTo: GRID_FAMILY_TYPES,
    defaultFor: (type) => DEFAULT_LIMIT_BY_TYPE[type] ?? 8,
  },
  {
    key: 'sort',
    label: 'Sort By',
    widget: 'select',
    options: SORT_OPTIONS,
    appliesTo: new Set([...GRID_FAMILY_TYPES].filter((t) => t !== 'category-grid')),
    defaultFor: () => 'latest',
  },
  {
    key: 'collectionBinding',
    label: 'Filter by Collection',
    // §5 — a proper picker widget listing the store's actual
    // StoreCollection names, writing the resolved id underneath;
    // replaces the old plain text box that expected a merchant to paste
    // a raw database id. Also offers "Current category (automatic)",
    // which writes CURRENT_COLLECTION_TOKEN instead of a literal id
    // (§4 mode 1).
    widget: 'collection-picker',
    appliesTo: new Set(['product-grid', 'category-products', 'category-grid']),
    defaultFor: () => CURRENT_COLLECTION_TOKEN,
  },
  {
    key: 'columns',
    label: 'Columns',
    widget: 'select',
    options: [
      { value: 2, name: '2 Columns' },
      { value: 3, name: '3 Columns' },
      { value: 4, name: '4 Columns' },
      { value: 5, name: '5 Columns' },
      { value: 6, name: '6 Columns' },
    ],
    // `layout.columns` — presentation, not data selection (§3).
    appliesTo: GRID_FAMILY_TYPES,
    defaultFor: (type) => (type === 'category-grid' ? 3 : 4),
    group: 'layout',
  },
  {
    key: 'showPrice',
    label: 'Show Price',
    widget: 'checkbox',
    appliesTo: new Set([...GRID_FAMILY_TYPES].filter((t) => t !== 'category-grid')),
    defaultFor: () => true,
    group: 'layout',
  },
  {
    key: 'showAddToCart',
    label: 'Show Add to Cart Button',
    widget: 'checkbox',
    appliesTo: new Set([...GRID_FAMILY_TYPES].filter((t) => t !== 'category-grid')),
    defaultFor: () => true,
    group: 'layout',
  },
  {
    key: 'showRating',
    label: 'Show Rating',
    widget: 'checkbox',
    appliesTo: new Set(['product-grid']),
    defaultFor: () => false,
    group: 'layout',
  },
  {
    key: 'redirectUrl',
    label: 'Button Redirect Link (optional)',
    widget: 'text',
    placeholder: '/cart, /checkout, or https://...',
    appliesTo: new Set([...GRID_FAMILY_TYPES].filter((t) => t !== 'category-grid')),
    defaultFor: () => '',
  },
  {
    key: 'paginationEnabled',
    label: 'Enable Pagination',
    widget: 'checkbox',
    appliesTo: new Set(['product-grid']),
    defaultFor: () => false,
    group: 'pagination',
  },
];

/** Builds the default config object for a fresh block of `type`, grouped per §3. */
export function buildDefaultConfig(type) {
  if (!GRID_FAMILY_TYPES.has(type)) return {};
  const isCategoryGrid = type === 'category-grid';
  const seededLimit = DEFAULT_LIMIT_BY_TYPE[type] ?? 8;

  return {
    limit: seededLimit,
    ...(isCategoryGrid ? {} : { sort: 'latest' }),
    ...(type === 'product-grid' || type === 'category-products' || isCategoryGrid ? { collectionBinding: CURRENT_COLLECTION_TOKEN } : {}),
    filters: { tag: '', priceMin: null, priceMax: null, inStockOnly: false },
    layout: {
      columns: isCategoryGrid ? 3 : 4,
      cardStyle: 'default',
      showPrice: !isCategoryGrid,
      showRating: false,
      showAddToCart: !isCategoryGrid,
    },
    pagination: { enabled: false, pageSize: seededLimit, group: 'default' },
    redirectUrl: '',
  };
}

/**
 * Reads config off a live DOM element following §6's dual-read contract:
 * the canonical `data-block-config` JSON attribute is checked first; only
 * if it's entirely absent (an already-imported page from before this
 * redesign) does it fall back to the legacy individual attributes,
 * including the `data-collection` alias for collection binding. A
 * component read this way is never re-written under the legacy names —
 * any future edit (a GrapesJS trait change) always writes the unified
 * attribute going forward (single-write, per §6).
 */
export function readConfigFromElement(el) {
  if (!el || !el.getAttribute) return {};

  const raw = el.getAttribute(CONFIG_ATTR);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {
      // fall through to legacy reading below — a malformed attribute is
      // treated the same as an absent one, never a hard error.
    }
  }

  // Legacy fallback — same fields `blockConfig()` read pre-redesign.
  const config = {};
  Object.entries(LEGACY_ATTR_ALIASES).forEach(([key, attrs]) => {
    for (const attr of attrs) {
      const value = el.getAttribute(attr);
      if (value !== null && value !== undefined && value !== '') {
        config[key] = value;
        return;
      }
    }
  });
  return config;
}