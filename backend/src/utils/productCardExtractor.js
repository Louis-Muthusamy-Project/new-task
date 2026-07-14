'use strict';

/**
 * productCardExtractor.js
 *
 * Runs AFTER the 3-stage Template Import Pipeline
 * (services/templateImplort/index.js) has already tagged a page's body
 * HTML with:
 *
 *   data-store-block="product-grid"   ← the outer container (Stage 1)
 *   data-store-block="product-card"   ← each repeating child card (Stage 2)
 *   data-store-field="image"          ← <img> inside the card (Stage 2)
 *   data-store-field="title"          ← heading / link (Stage 2)
 *   data-store-field="price"          ← price element (Stage 2)
 *   data-store-field="add-to-cart"    ← CTA button / link (Stage 2)
 *
 * This module's only job is to locate the FIRST tagged product card and
 * return its outerHTML so the storefront renderer can clone it per-product
 * at display time — preserving the uploaded theme's layout, CSS classes,
 * hover effects, animations, and spacing exactly as the merchant designed
 * them, rather than swapping them for a generic React component.
 *
 * Safety contract (mirrors the pipeline stages):
 *   - Never throws — a missing or malformed template returns null, letting
 *     the caller fall back to the existing generic renderer without crashing.
 *   - Purely reads the HTML; never mutates it.
 *   - Works for ANY ecommerce theme — not tied to specific class names.
 *     Detection depends entirely on the data-store-block / data-store-field
 *     attributes Stage 2 already added.
 *
 * Supported grid-family types (all use the same product-card child shape):
 *   product-grid, featured-products, latest-products, best-sellers,
 *   related-products
 *
 * category-grid uses category-card children, which have a different field
 * set and are NOT included here (no price / add-to-cart).
 */

const cheerio = require('cheerio');

// Grid-family container types whose repeating children are product cards.
const PRODUCT_GRID_FAMILY = new Set([
  'product-grid',
  'featured-products',
  'latest-products',
  'best-sellers',
  'related-products',
]);

/**
 * Extracts the first product card template from a post-pipeline page HTML.
 *
 * @param {string} html  body-only HTML that has already been through the
 *                        3-stage Template Import Pipeline (i.e. carries
 *                        data-store-block / data-store-field attributes).
 *
 * @returns {{
 *   cardTemplateHtml: string,    // outerHTML of the first product card
 *   containerType: string,       // e.g. "product-grid", "featured-products"
 *   fieldsFound: string[],       // which data-store-field values were found
 * } | null}  null when no tagged card is found (safe fallback to generic renderer)
 */
function extractProductCardTemplate(html) {
  if (!html || typeof html !== 'string' || !html.trim()) return null;

  // Quick pre-check — avoid a full cheerio parse when no product card was
  // tagged at all (non-ecommerce pages, or pages where Stage 2 found nothing).
  if (!html.includes('data-store-block="product-card"') &&
      !html.includes("data-store-block='product-card'")) {
    return null;
  }

  try {
    const $ = cheerio.load(html, { decodeEntities: false });

    // Walk each known grid-family container in document order and return
    // the FIRST tagged product-card child found inside any of them.
    for (const containerType of PRODUCT_GRID_FAMILY) {
      const $container = $(`[data-store-block="${containerType}"]`).first();
      if (!$container.length) continue;

      const $card = $container.find('[data-store-block="product-card"]').first();
      if (!$card.length) continue;

      // Record which data-store-field values the card carries so the
      // renderer knows what dynamic substitutions are actually possible.
      const fieldsFound = [];
      $card.find('[data-store-field]').each((_, el) => {
        const field = $(el).attr('data-store-field');
        if (field && !fieldsFound.includes(field)) fieldsFound.push(field);
      });

      const cardTemplateHtml = $.html($card);
      if (!cardTemplateHtml || !cardTemplateHtml.trim()) continue;

      return {
        cardTemplateHtml,
        containerType,
        fieldsFound,
      };
    }

    // No tagged card found in any grid-family container.
    return null;
  } catch (err) {
    // Never crash an import because the extractor failed.
    console.warn('[productCardExtractor] failed to extract card template:', err?.message || err);
    return null;
  }
}

module.exports = { extractProductCardTemplate };
