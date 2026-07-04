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

module.exports = {
  COMPONENT_LABELS,
  AUTO_CONVERTIBLE_TYPES,
  MANUAL_MAPPING_TYPES,
};
