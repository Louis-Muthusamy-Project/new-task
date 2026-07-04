'use strict';

/**
 * storeBlockTemplates.js
 *
 * Naming/labeling for every component the WordPress Import Pipeline's
 * detector (storeComponentDetector.js) recognizes, plus the shared type
 * sets it uses to decide whether a detected region can be tagged with the
 * Store Builder's existing `data-store-block="<type>"` markup contract
 * (the one `frontend/.../storeDynamicBlocks.js`'s GrapesJS blocks already
 * use) or must be flagged "Needs Manual Mapping" instead.
 *
 * Deliberately does NOT generate any new hydration script, fetch call,
 * live/original markup split, or storeId-resolution step. Per project
 * constraints, this feature must not redesign existing modules, replace
 * GrapesJS/Store Builder, change the existing Store creation flow, or
 * duplicate the hydration/publish logic that already lives in
 * storeDynamicBlocks.js + storeStorefrontController.js + storePublishService.js.
 *
 * Concretely: a detected region is tagged IN PLACE — attributes added onto
 * the element that's already there, nothing rewritten or removed. Once a
 * Store is created from the template (existing, untouched
 * create-from-template flow) and someone opens the page in GrapesJS, the
 * tag is immediately visible/selectable, and if live data is wanted, the
 * existing "Store" block category — already registered by
 * `registerStoreBlocks()` for every Store page, unchanged — is dragged in
 * to replace it, exactly the way a person already builds a Store page
 * from scratch today. No new runtime, no new API, no new persistence path.
 */

/** Every component type the detector can recognize, with a display label. */
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

/**
 * Types the detector tags with the Store Builder's `data-store-block`
 * attribute. "Convert" here means exactly that — attaching the attribute
 * the existing block system already recognizes — never generating new
 * markup or a script. This is the full set of 9 types with a matching
 * block category in the existing Store Builder (`storeDynamicBlocks.js`'s
 * Hero/Product Grid/Search/Cart/Checkout/Footer, plus
 * Header/Navigation/Collection→Category Grid, which
 * store-module-analysis-wordpress-importer.md §3.5 already treats as
 * "tag only, no API needed").
 */
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
