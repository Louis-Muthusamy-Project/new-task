'use strict';

/**
 * productDataExtractor.js
 *
 * New pipeline stage (per the store-module implementation plan, Phase 2):
 * pulls REAL product data (title, price, image, description) out of an
 * uploaded store-template ZIP so it can be persisted onto
 * `StoreTemplate.demoProducts` (see models/store/StoreTemplate.js) at
 * upload time — replacing the old behavior where "Install demo products"
 * only ever inserted a hardcoded, unrelated seed set.
 *
 * Two independent, failure-isolated strategies, because uploaded themes
 * come in two very different shapes:
 *
 *   1. extractProductsFromTaggedHtml(html)  — "static-html" strategy.
 *      Runs AFTER the existing 3-stage Template Import Pipeline
 *      (services/templateImplort/index.js) has tagged a page's body HTML
 *      with data-store-block="product-card" / data-store-field="title|
 *      price|image|description" (see storeComponentDetector.js /
 *      productSectionConverter.js). Unlike utils/productCardExtractor.js
 *      (which only grabs the FIRST card per container as a structural
 *      markup template for cloning), this walks EVERY tagged card
 *      instance to read its actual per-product values.
 *
 *   2. extractProductsFromJsSource(jsText) — "js-bundle" strategy.
 *      Covers client-rendered exports (Next.js/Vite/etc. static builds)
 *      whose HTML ships as an empty shell with product data baked into a
 *      bundled JS chunk instead of the markup — cheerio-based detection
 *      finds nothing on these, so extraction falls back to scanning JS
 *      source text for flat object literals shaped like
 *      `{ id, name/title, price, image, description }`. This is a
 *      best-effort heuristic scan (regex-based, no code execution, no
 *      real JS parsing) — it is allowed to find nothing; it must never
 *      throw or block an upload.
 *
 * Safety contract (mirrors every other stage in this pipeline): any
 * failure in either strategy returns an empty array, never throws, and
 * never affects the rest of the import.
 */

const cheerio = require('cheerio');
const { PRODUCT_GRID_FAMILY } = require('../../utils/productCardExtractor');

// Hard caps so a huge or adversarial ZIP (thousands of tiny "objects" in a
// minified bundle) can't blow up memory/time or bloat the StoreTemplate
// document. These are generous for any real product catalog.
const MAX_PRODUCTS_PER_STRATEGY = 100;
const MAX_TOTAL_PRODUCTS = 150;
const JS_CANDIDATE_OBJECT_MAX_LEN = 800; // flat product objects here run ~300-330 chars

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const toNumberPrice = (raw) => {
  if (raw == null) return 0;
  const cleaned = String(raw).replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

// ─────────────────────────────────────────────────────────────────────────
// Strategy 1 — static-html (tagged product cards)
// ─────────────────────────────────────────────────────────────────────────

/**
 * @param {string} html  body HTML that has already been through the
 *   3-stage Template Import Pipeline (carries data-store-block /
 *   data-store-field attributes).
 * @returns {Array<{title, price, currency, image, description, sourceSection}>}
 */
function extractProductsFromTaggedHtml(html) {
  const original = typeof html === 'string' ? html : '';
  if (!original.trim()) return [];

  if (
    !original.includes('data-store-block="product-card"') &&
    !original.includes("data-store-block='product-card'")
  ) {
    return [];
  }

  try {
    const $ = cheerio.load(original, { decodeEntities: false });
    const products = [];

    const containerSelector = [...PRODUCT_GRID_FAMILY]
      .map((t) => `[data-store-block="${t}"]`)
      .join(',');

    $(containerSelector).each((_, containerEl) => {
      if (products.length >= MAX_PRODUCTS_PER_STRATEGY) return;

      $(containerEl)
        .find('[data-store-block="product-card"]')
        .each((__, cardEl) => {
          if (products.length >= MAX_PRODUCTS_PER_STRATEGY) return;

          const $card = $(cardEl);
          const title = $card.find('[data-store-field="title"]').first().text().trim();
          const priceText = $card.find('[data-store-field="price"]').first().text().trim();
          const $image = $card.find('[data-store-field="image"]').first();
          const image = $image.attr('src') || $image.attr('data-src') || '';
          const description = $card.find('[data-store-field="description"]').first().text().trim();

          // A card missing both a title and a price isn't a usable
          // product record — skip it rather than saving a blank entry.
          if (!title && !priceText) return;

          products.push({
            title: title || 'Untitled product',
            slug: slugify(title),
            price: toNumberPrice(priceText),
            currency: '',
            image,
            description,
            sourceSection: 'static-html',
          });
        });
    });

    return products;
  } catch (err) {
    console.warn('[productDataExtractor] static-html extraction failed (non-fatal):', err?.message || err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Strategy 2 — js-bundle (CSR / client-hydrated templates)
// ─────────────────────────────────────────────────────────────────────────

const FIELD_PATTERNS = {
  title: ['name', 'title'],
  price: ['price'],
  image: ['image', 'img', 'thumbnail'],
  description: ['description', 'desc'],
};

// Pulls one field's value out of a single flat-object-literal source
// string, trying each candidate key in order. Handles double/single/
// backtick-quoted strings and bare numeric literals — deliberately not a
// real JS parser, just enough to read `key: "value"` / `key: 123` pairs
// out of a minified bundle without executing any code.
function readField(objectSource, keyCandidates) {
  for (const key of keyCandidates) {
    const re = new RegExp(`["']?${key}["']?\\s*:\\s*(?:"([^"]*)"|'([^']*)'|\`([^\`]*)\`|([0-9]+(?:\\.[0-9]+)?))`);
    const m = objectSource.match(re);
    if (m) {
      const value = m[1] ?? m[2] ?? m[3] ?? m[4];
      if (value != null && value !== '') return value;
    }
  }
  return null;
}

/**
 * @param {string} jsText  raw JS source (one bundled chunk)
 * @returns {Array<{title, price, currency, image, description, sourceSection}>}
 */
function extractProductsFromJsSource(jsText) {
  const source = typeof jsText === 'string' ? jsText : '';
  if (!source || !source.includes('price')) return [];

  try {
    // Flat (non-nested) object literals only — every real-world product
    // mock-data shape we need to support (id/name/price/image/description)
    // has no nested objects, so `[^{}]` between the braces is safe and
    // avoids needing a real parser.
    const candidateRe = new RegExp(`\\{[^{}]{0,${JS_CANDIDATE_OBJECT_MAX_LEN}}?\\}`, 'g');
    const products = [];
    let match;

    while ((match = candidateRe.exec(source)) !== null) {
      if (products.length >= MAX_PRODUCTS_PER_STRATEGY) break;

      const candidate = match[0];
      // Cheap pre-filter before running the heavier per-field regexes.
      if (!/price\s*:/.test(candidate)) continue;
      if (!/(name|title)\s*:/.test(candidate)) continue;

      const title = readField(candidate, FIELD_PATTERNS.title);
      const priceRaw = readField(candidate, FIELD_PATTERNS.price);
      if (!title || priceRaw == null) continue;

      const image = readField(candidate, FIELD_PATTERNS.image) || '';
      const description = readField(candidate, FIELD_PATTERNS.description) || '';

      products.push({
        title,
        slug: slugify(title),
        price: toNumberPrice(priceRaw),
        currency: '',
        image,
        description,
        sourceSection: 'js-bundle',
      });
    }

    return products;
  } catch (err) {
    console.warn('[productDataExtractor] js-bundle extraction failed (non-fatal):', err?.message || err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Orchestrator
// ─────────────────────────────────────────────────────────────────────────

/**
 * Runs both strategies across every page's tagged HTML and every scanned JS
 * source, then dedupes and caps the combined result.
 *
 * @param {object} opts
 * @param {string[]} [opts.pageHtmls]  tagged body HTML, one per page
 * @param {Array<{path: string, content: string}>} [opts.jsSources]
 * @returns {Array} normalized products, ready to assign to
 *   StoreTemplate.demoProducts
 */
function extractTemplateProducts({ pageHtmls = [], jsSources = [] } = {}) {
  const found = [];

  for (const html of pageHtmls) {
    if (found.length >= MAX_TOTAL_PRODUCTS) break;
    found.push(...extractProductsFromTaggedHtml(html));
  }

  // Only fall back to the js-bundle scan when the static-html strategy came
  // up empty — if the theme's markup already yielded real products, a
  // client bundle (if any) is very likely just re-hydrating the same data,
  // and scanning it too would risk duplicate/near-duplicate entries.
  if (found.length === 0) {
    for (const { content } of jsSources) {
      if (found.length >= MAX_TOTAL_PRODUCTS) break;
      found.push(...extractProductsFromJsSource(content));
    }
  }

  // Dedupe on title+price — cheap, good enough signal for "same product"
  // across pages/chunks without needing fuzzy matching.
  const seen = new Set();
  const deduped = [];
  for (const p of found) {
    const key = `${p.title.toLowerCase()}::${p.price}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(p);
    if (deduped.length >= MAX_TOTAL_PRODUCTS) break;
  }

  return deduped;
}

module.exports = {
  extractProductsFromTaggedHtml,
  extractProductsFromJsSource,
  extractTemplateProducts,
};
