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
 * This module's only job is to locate every tagged product card — one per
 * grid-family CONTAINER instance on the page, not just the first container
 * found — and return its outerHTML so the storefront renderer can clone it
 * per-product at display time — preserving the uploaded theme's layout, CSS
 * classes, hover effects, animations, and spacing exactly as the merchant
 * designed them, rather than swapping them for a generic React component.
 *
 * Multiple product sections on one page (checklist item 1 — a page can have
 * a "Featured Products" rail AND a "Best Sellers" rail AND a plain "Product
 * Grid" all below each other, each shipped with its OWN card markup/CSS in
 * the theme) previously only got the FIRST tagged card found anywhere on
 * the page, so every other section silently rendered using the wrong
 * card's layout. This module now extracts one template PER container
 * instance and tags each container with a stable `data-card-template-id`
 * so the frontend can look up the exact template that belongs to it.
 *
 * Safety contract (mirrors the pipeline stages):
 *   - Never throws — a missing or malformed template returns an empty
 *     result, letting the caller fall back to the existing generic
 *     renderer without crashing.
 *   - Mutates ONLY to add `data-card-template-id` to each grid-family
 *     container it successfully extracted a template from (needed so the
 *     frontend can match container -> template 1:1); never touches
 *     anything else about the markup.
 *   - Works for ANY ecommerce theme — not tied to specific class names.
 *     Detection depends entirely on the data-store-block / data-store-field
 *     attributes Stage 2 already added.
 *
 * Supported grid-family types (all use the same product-card child shape):
 *   product-grid, featured-products, latest-products, best-sellers,
 *   related-products, sale-products, category-products
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
  'sale-products',
  'category-products',
]);

/**
 * Extracts a product card template for EVERY grid-family container found
 * in a post-pipeline page's HTML (checklist item 1 — multiple product
 * sections on the same page each get their own template, not just the
 * first one found).
 *
 * @param {string} html  body-only HTML that has already been through the
 *                        3-stage Template Import Pipeline (i.e. carries
 *                        data-store-block / data-store-field attributes).
 *
 * @returns {{
 *   html: string,                 // input HTML with data-card-template-id
 *                                  // stamped on each container that got a
 *                                  // template (unchanged otherwise)
 *   templates: Array<{
 *     id: string,                 // "ct-0", "ct-1", ... — stable per page
 *     cardTemplateHtml: string,   // outerHTML of that container's first product card
 *     containerType: string,      // e.g. "product-grid", "featured-products"
 *     fieldsFound: string[],      // which data-store-field values were found
 *   }>,
 * }}  templates is [] (and html is unchanged) when nothing tagged is found —
 *     safe fallback to the generic renderer.
 */
function extractProductCardTemplates(html) {
  const original = typeof html === 'string' ? html : '';
  if (!original.trim()) return { html: original, templates: [] };

  // Quick pre-check — avoid a full cheerio parse when no product card was
  // tagged at all (non-ecommerce pages, or pages where Stage 2 found nothing).
  if (!original.includes('data-store-block="product-card"') &&
      !original.includes("data-store-block='product-card'")) {
    return { html: original, templates: [] };
  }

  try {
    const $ = cheerio.load(original, { decodeEntities: false });
    const templates = [];
    let counter = 0;

    // Walk every grid-family container on the page, in document order,
    // regardless of type — this is the fix for "multiple product sections
    // on the same page": each container instance gets its own extracted
    // template instead of only the first container found across all types.
    const containerSelector = [...PRODUCT_GRID_FAMILY]
      .map((t) => `[data-store-block="${t}"]`)
      .join(',');

    $(containerSelector).each((_, containerEl) => {
      const $container = $(containerEl);
      const containerType = $container.attr('data-store-block');
      if (!PRODUCT_GRID_FAMILY.has(containerType)) return;

      const $card = $container.find('[data-store-block="product-card"]').first();
      if (!$card.length) return;

      const fieldsFound = [];
      $card.find('[data-store-field]').each((__, el) => {
        const field = $(el).attr('data-store-field');
        if (field && !fieldsFound.includes(field)) fieldsFound.push(field);
      });

      const cardTemplateHtml = $.html($card);
      if (!cardTemplateHtml || !cardTemplateHtml.trim()) return;

      const id = `ct-${counter++}`;
      // Stamp the container so the frontend can look up the exact template
      // that belongs to THIS instance, even when several containers on the
      // page share the same containerType (e.g. two "product-grid" rails).
      $container.attr('data-card-template-id', id);

      templates.push({ id, cardTemplateHtml, containerType, fieldsFound });
    });

    if (!templates.length) return { html: original, templates: [] };

    return { html: $('body').html() || $.html(), templates };
  } catch (err) {
    // Never crash an import because the extractor failed.
    console.warn('[productCardExtractor] failed to extract card templates:', err?.message || err);
    return { html: original, templates: [] };
  }
}

/**
 * Backward-compatible single-template accessor — returns the FIRST
 * extracted template only (matches the pre-multi-template behavior/shape),
 * for any caller that hasn't been migrated to the multi-template array yet.
 *
 * @param {string} html
 * @returns {{ cardTemplateHtml: string, containerType: string, fieldsFound: string[] } | null}
 */
function extractProductCardTemplate(html) {
  const { templates } = extractProductCardTemplates(html);
  if (!templates.length) return null;
  const { id, ...rest } = templates[0]; // eslint-disable-line no-unused-vars
  return rest;
}

module.exports = { extractProductCardTemplate, extractProductCardTemplates, PRODUCT_GRID_FAMILY };