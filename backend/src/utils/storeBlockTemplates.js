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
]);

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
  resolveStoreBlockPlaceholders,
};