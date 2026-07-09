'use strict';


const COMPONENT_LABELS = {
  header: 'Header',
  footer: 'Footer',
  navigation: 'Navigation',
  hero: 'Hero',
  'product-grid': 'Product Grid',
  'category-grid': 'Category Grid',
  'contact-form': 'Contact Form',
  newsletter: 'Newsletter',
  'blog-list': 'Blog List',
  search: 'Search Box',
  'cart-button': 'Cart Button',
  'checkout-button': 'Checkout Button',
  'widget-area': 'Widget',
};


const AUTO_CONVERTIBLE_TYPES = new Set([
  'header',
  'footer',
  'navigation',
  'hero',
  'product-grid',
  'category-grid',
  'search',
  'cart-button',
  'checkout-button',
  // Widget areas (WordPress sidebar/footer widgets) are confidently
  // classifiable but intentionally NOT swapped for a live data-driven
  // component — a widget's content is arbitrary static theme HTML (a
  // text blob, a social-links list, a hand-placed image), not a
  // product/collection listing, so there is nothing dynamic to hydrate.
  // "Auto-convertible" here just means "recognized and taggable with
  // confidence" — see PASSTHROUGH_TYPES below for how the frontend
  // treats it differently from the data-driven types.
  'widget-area',
]);

/**
 * Types that ARE auto-tagged (so they show up in the operator-facing
 * summary and carry a stable `data-store-block` attribute) but whose
 * original markup should render byte-for-byte as-is — no React component
 * mounted in their place. Only `widget-area` today; kept as its own set
 * (rather than folding this logic into AUTO_CONVERTIBLE_TYPES) so a
 * future passthrough type doesn't have to be reasoned about alongside
 * the data-driven ones above.
 */
const PASSTHROUGH_TYPES = new Set(['widget-area']);

/**
 * type -> live React component this block hydrates into on the
 * storefront/preview (see frontend/.../storefront/ThemeRenderer.jsx,
 * which is the single place this mapping is actually consumed — kept
 * here too as documented source of truth for anything backend-side that
 * needs to describe the pipeline's behavior, e.g. import warnings).
 * `null` means "render the original markup untouched" (PASSTHROUGH_TYPES).
 */
const THEME_COMPONENT_MAP = {
  header: 'Header',
  footer: 'Footer',
  navigation: 'Menu',
  search: 'SearchBar',
  'product-grid': 'ImportedProductGrid',
  'category-grid': 'CollectionsGrid',
  'cart-button': 'CartButton',
  'checkout-button': 'CheckoutButton',
  hero: null,
  'widget-area': null,
};

/**
 * Types with no store-scoped backend surface to wire into today (see
 * store-module-analysis-wordpress-importer.md §2 — Contact/Newsletter/Blog
 * are flagged there as real gaps, not just missing UI). The detector still
 * *finds* and labels these regions; it just flags them for a human to map
 * manually instead of claiming a conversion that isn't real.
 */
const MANUAL_MAPPING_TYPES = new Set(['contact-form', 'newsletter', 'blog-list']);

// Token the WordPress Import Pipeline's component detector embeds into a
// converted block's markup/hydration script when it runs before a real
// Store exists (StoreTemplate.pages snapshot stage — no storeId yet).
const STORE_ID_PLACEHOLDER = /\{\{\s*STORE_ID\s*\}\}/g;

/**
 * Resolves any `{{STORE_ID}}` placeholder left in a page's stored HTML to
 * the real storeId, once one exists (i.e. once create-from-template /
 * WordPress "import into a live Store" actually creates the Store
 * document). A no-op for html with no placeholder — most pages, since
 * only auto-converted store blocks ever embed the token.
 *
 * @param {string} html
 * @param {import('mongoose').Types.ObjectId|string} storeId
 * @returns {string}
 */
function resolveStoreBlockPlaceholders(html, storeId) {
  if (!html || typeof html !== 'string') return html || '';
  return html.replace(STORE_ID_PLACEHOLDER, String(storeId ?? ''));
}

module.exports = {
  COMPONENT_LABELS,
  AUTO_CONVERTIBLE_TYPES,
  MANUAL_MAPPING_TYPES,
  PASSTHROUGH_TYPES,
  THEME_COMPONENT_MAP,
  resolveStoreBlockPlaceholders,
};