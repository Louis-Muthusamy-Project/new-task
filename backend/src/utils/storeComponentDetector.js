'use strict';

/**
 * storeComponentDetector.js
 *
 * Runs AFTER `parseStoreTemplateZip()` has already produced asset-rewritten
 * `{ html, css }` for one page (see services/wordpressImport/uploadAssets.js
 * and detectComponents.js, the stage that calls this module). It detects
 * Header / Footer / Navigation / Hero / Product Grid / Category Grid /
 * Contact Form / Newsletter / Blog List / Search Box / Cart Button /
 * Checkout Button regions in the page body and tags each one it recognizes
 * with attributes only — it never rewrites, wraps, or removes any markup:
 *
 *   - `data-store-block="<type>"` — for the 9 types that already have a
 *     matching category in the existing Store Builder's block system
 *     (see storeBlockTemplates.js's AUTO_CONVERTIBLE_TYPES). This is the
 *     exact same attribute `frontend/.../storeDynamicBlocks.js`'s
 *     hand-dropped GrapesJS blocks use, so a tagged region is immediately
 *     recognizable once a Store is created from the template and the page
 *     is opened in GrapesJS — no new hydration runtime is introduced here.
 *   - `data-store-mapping="needs-manual-mapping"` — for the 3 types with
 *     no store-scoped backend surface yet (Contact Form, Newsletter, Blog
 *     List — see store-module-analysis-wordpress-importer.md §2), and for
 *     anything recognized but ambiguous.
 *
 * Hard rule, honored by construction: NOTHING is ever deleted or
 * restructured. Every match only ever gains one or two extra attributes on
 * the element that was already there. If a region can't be classified at
 * all, it's left exactly as it was in the export. This keeps the whole
 * stage additive — it doesn't touch GrapesJS, the Store Builder, the
 * Website Builder, the Store creation flow, or the publish pipeline.
 */

const cheerio = require('cheerio');
const { COMPONENT_LABELS, AUTO_CONVERTIBLE_TYPES } = require('./storeBlockTemplates');

const PRICE_RE = /[$₹€£]\s?\d/;
const CONFIDENCE_THRESHOLD = 0.6;

const textOf = ($, el) => $(el).text().trim();
const classOf = ($, el) => $(el).attr('class') || '';

/**
 * Detects if an element looks like a container of product items (for homepage
 * product sections that may not have a strict repeating-sibling grid structure).
 * Used only on homepage pages for fallback detection.
 *
 * Checks if element contains multiple children with product-like patterns:
 * - Image + heading/link + price
 * - or image + heading/link + "Add to cart" button
 * Returns true only if confident enough (≥2 items with clear product signals).
 */
function looksLikeProductContainer($, el) {
  const children = $(el).children().toArray();
  if (children.length < 2) return false;

  let productLikeCount = 0;
  for (const child of children) {
    const $child = $(child);
    const hasImage = $child.find('img').length > 0;
    const hasHeading = $child.find('h1,h2,h3,h4,a').length > 0;
    const hasPrice = PRICE_RE.test($child.text());
    const hasAddToCart = /add\s+to\s+cart|buy|shop/i.test($child.text());

    // A product-like item: image + (heading) + (price OR add-to-cart button)
    if (hasImage && hasHeading && (hasPrice || hasAddToCart)) {
      productLikeCount++;
    }
  }

  // High confidence if ≥3 product-like items, moderate if 2 and elem looks
  // intentional (class hint of "products" or "featured")
  if (productLikeCount >= 3) return true;
  if (productLikeCount === 2 && /\b(product|featured|item)\b/i.test($(el).attr('class') || '')) {
    return true;
  }

  return false;
}

/**
 * Repeating-sibling helper shared by Product Grid / Category Grid / Blog
 * List: finds the most common tag+class "signature" among an element's
 * direct children and returns the matching children if there are enough of
 * them to call it a grid/list rather than a coincidence.
 */
function repeatingChildren($, el, minCount = 3) {
  const children = $(el).children().toArray();
  if (children.length < minCount) return null;
  const sig = (c) => `${c.tagName}.${(classOf($, c) || '').split(/\s+/).sort().join('.')}`;
  const sigs = children.map(sig);
  const counts = new Map();
  sigs.forEach((s) => counts.set(s, (counts.get(s) || 0) + 1));
  const [mostCommon, count] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (count < minCount) return null;
  return children.filter((c) => sig(c) === mostCommon);
}

/**
 * Classifies one element. Order matters — earlier checks are more specific
 * / less ambiguous and win over later, broader ones (mirrors the priority
 * order in store-module-analysis-wordpress-importer.md §3.3).
 *
 * @returns {{ type: string, score: number } | null}
 */
function classify($, el) {
  const $el = $(el);
  const tag = (el.tagName || '').toLowerCase();
  const cls = classOf($, el);
  const text = textOf($, el).toLowerCase();
  const outerHtml = $.html($el);

  // ── Header ────────────────────────────────────────────────────────────
  if (tag === 'header' || /\b(site-header|masthead)\b/i.test(cls)) {
    return { type: 'header', score: 0.9 };
  }

  // ── Footer ────────────────────────────────────────────────────────────
  if (tag === 'footer' || /©|all rights reserved/i.test(text)) {
    return { type: 'footer', score: 0.85 };
  }

  // ── Search Box (very reliable — WordPress's default search input is
  //    literally name="s") ────────────────────────────────────────────────
  if (
    $el.find('input[type=search], input[name=s]').length ||
    /placeholder=["'][^"']*search/i.test(outerHtml) ||
    $el.attr('role') === 'search'
  ) {
    return { type: 'search', score: 0.9 };
  }

  // ── Navigation (a standalone menu, not one already nested inside a
  //    detected Header — the walk in detectAndReplaceComponents() claims
  //    Header's descendants first, so this only fires for a <nav> that
  //    wasn't already absorbed) ─────────────────────────────────────────
  if (
    tag === 'nav' ||
    $el.attr('role') === 'navigation' ||
    /\b(main-nav|navbar|nav-menu|menu-main)\b/i.test(cls)
  ) {
    const linkCount = $el.find('a').length;
    if (linkCount >= 2) return { type: 'navigation', score: 0.8 };
  }

  // ── Newsletter (single-field email signup — check BEFORE Contact Form,
  //    since a newsletter form is a strict subset of a contact form's
  //    field shape) ─────────────────────────────────────────────────────
  if (tag === 'form' || /\b(newsletter|subscribe)\b/i.test(cls) || /\bnewsletter\b/i.test(text)) {
    const emailInput = $el.find('input[type=email],input[name*=email]').length;
    const otherMeaningfulInputs = $el
      .find('input, textarea')
      .filter((_, i) => {
        const t = ($(i).attr('type') || 'text').toLowerCase();
        const n = ($(i).attr('name') || '').toLowerCase();
        return t !== 'email' && t !== 'submit' && t !== 'hidden' && !/email/.test(n);
      }).length;
    const looksNewsletter = /\b(newsletter|subscribe)\b/i.test(cls) || /\bnewsletter\b/i.test(text);
    if (emailInput && (looksNewsletter || (tag === 'form' && otherMeaningfulInputs === 0))) {
      return { type: 'newsletter', score: looksNewsletter ? 0.85 : 0.65 };
    }
  }

  // ── Contact Form ─────────────────────────────────────────────────────
  if (tag === 'form') {
    const hasPassword = $el.find('input[type=password]').length;
    const hasAddress = $el.find('input[name*=address],input[name*=city],input[name*=zip],input[name*=postal]').length;
    const emailInput = $el.find('input[type=email],input[name*=email]').length;
    const msgInput = $el.find('textarea,input[name*=message],input[name*=subject]').length;
    if (!hasPassword && !hasAddress && emailInput && msgInput) {
      return { type: 'contact-form', score: 0.8 };
    }
  }

  // ── Cart Button / Checkout Button (small nav-level trigger — NOT the
  //    full cart/checkout page: those have a <form> or many descendants) ─
  const descendantCount = $el.find('*').length;
  if ((tag === 'a' || tag === 'button') && descendantCount <= 6 && !$el.find('form').length) {
    if (/\b(cart|basket|bag)\b/i.test(cls) || /\b(cart|basket|bag)\b/i.test(text) || /\bcart\b/i.test($el.attr('href') || '')) {
      return { type: 'cart-button', score: 0.75 };
    }
    if (/\b(checkout|buy now|proceed to checkout)\b/i.test(text) || /checkout/i.test($el.attr('href') || '')) {
      return { type: 'checkout-button', score: 0.75 };
    }
  }

  // ── Hero: first section/div after the header with a big heading plus a
  //    background image, full-bleed image, or CTA ────────────────────────
  if ($el.find('h1').length || tag === 'h1') {
    const scope = tag === 'h1' ? $el.parent() : $el;
    const hasBg = /background(-image)?\s*:/i.test(scope.attr('style') || '');
    const hasBigImg = scope
      .find('img')
      .filter((_, i) => {
        const w = parseInt($(i).attr('width') || '0', 10);
        return w === 0 || w > 480;
      }).length;
    const hasCta = scope.find('a.button, a.btn, .cta, button').length;
    if (tag !== 'h1' && (hasBg || hasBigImg || hasCta)) {
      return { type: 'hero', score: 0.7 };
    }
  }

  // ── Blog List: repeating <article>/.post siblings, each with a heading
  //    + link, no price ────────────────────────────────────────────────
  if (/\b(blog|posts|articles|hentry)\b/i.test(cls) || $el.children('article').length >= 3) {
    const items = repeatingChildren($, el, 3) || $el.children('article').toArray();
    if (items.length >= 3) {
      const looksLikePosts = items.every((c) => $(c).find('h1,h2,h3,a').length && !PRICE_RE.test($(c).text()));
      if (looksLikePosts) return { type: 'blog-list', score: 0.75 };
    }
  }

  // ── Widget Area (WordPress sidebar/footer widgets — "Widgets" in the
  //    import scope) — recognized by WordPress's own conventions
  //    (`.widget`/`.widget-area`/`.sidebar` class, `<aside>`, or
  //    `role="complementary"`). Tagged and left completely untouched
  //    (PASSTHROUGH_TYPES) since a widget's content is arbitrary static
  //    theme HTML, not a product/collection listing to hydrate ────────
  if (
    tag === 'aside' ||
    $el.attr('role') === 'complementary' ||
    /\b(widget-area|widget|sidebar)\b/i.test(cls)
  ) {
    return { type: 'widget-area', score: 0.75 };
  }

  // ── Product Grid vs Category Grid: both are repeating-sibling grids;
  //    Product Grid items have a price, Category Grid items don't ────────
  const repeaters = repeatingChildren($, el, 3);
  if (repeaters) {
    const sample = repeaters.slice(0, 4);
    const allHaveImage = sample.every((c) => $(c).find('img').length);
    const allHavePrice = sample.every((c) => PRICE_RE.test($(c).text()));
    const looksLikeCategoryLinks = sample.every(
      (c) => /product-categor(y|ies)|\/category\//i.test($(c).find('a').attr('href') || '') || /categor(y|ies)/i.test($(c).text())
    );
    if (allHaveImage && allHavePrice) return { type: 'product-grid', score: 0.8 };
    if (allHaveImage && (looksLikeCategoryLinks || /\b(categor(y|ies)|shop-by-category)\b/i.test(cls) || /shop by category/i.test(text))) {
      return { type: 'category-grid', score: 0.7 };
    }
  }

  return null;
}

/**
 * @param {string} html  body-only HTML from parseStoreTemplateZip's
 *   page.content.html
 * @param {object} pageMetadata  optional { isHome: boolean, slug: string, name: string }
 * @returns {{
 *   html: string,
 *   detected: Array<{ type: string, label: string, score: number, mapping: 'converted'|'needs-manual-mapping' }>
 * }}
 */
function detectAndReplaceComponents(html, pageMetadata = {}) {
  if (!html || typeof html !== 'string') return { html: html || '', detected: [] };

  const $ = cheerio.load(html, { decodeEntities: false });
  const detected = [];
  const claimed = new Set();

  // Walk top-down in document order so a matched container "claims" its
  // descendants — they're skipped rather than independently reclassified
  // (e.g. a <nav> inside an already-detected <header> isn't double-tagged).
  $('body *').each((_, el) => {
    if (claimed.has(el)) return;
    if ($(el).parents().toArray().some((p) => claimed.has(p))) return;

    const hit = classify($, el);
    if (!hit || hit.score < CONFIDENCE_THRESHOLD) return;

    claimed.add(el);
    const { type, score } = hit;
    const label = COMPONENT_LABELS[type] || type;
    const $el = $(el);

    if (AUTO_CONVERTIBLE_TYPES.has(type)) {
      // Tag in place — same data-store-block attribute the existing
      // Store Builder block system already recognizes. Original markup
      // (including class list, so the imported theme's CSS keeps
      // styling it) is left completely untouched.
      const existingClass = $el.attr('class') || '';
      $el.attr('data-store-block', type);
      $el.attr('class', `store-block store-block-${type} ${existingClass}`.trim());
      detected.push({ type, label, score, mapping: 'converted' });
      return;
    }

    // Contact Form / Newsletter / Blog List (or anything recognized but
    // ambiguous): flag only, zero markup change.
    $el.attr('data-store-component', type);
    $el.attr('data-store-mapping', 'needs-manual-mapping');
    detected.push({ type, label, score, mapping: 'needs-manual-mapping' });
  });

  // ─────────────────────────────────────────────────────────────────────
  // HOMEPAGE-ONLY SECOND PASS: detect product containers on homepage pages
  // that may not have been caught by the standard repeating-grid detection.
  //
  // Homepages often feature products in non-grid layouts (featured product
  // sections, carousels, etc.). This pass looks for containers with multiple
  // product-like items even if they're not a strict repeating grid.
  // Skips already-claimed elements and only fires if isHome is true.
  // ─────────────────────────────────────────────────────────────────────
  if (pageMetadata?.isHome === true) {
    $('section, .section, div[class*="product"], div[class*="featured"], div[class*="item"], article').each((_, el) => {
      if (claimed.has(el)) return;
      if ($(el).parents().toArray().some((p) => claimed.has(p))) return;

      const $el = $(el);

      // Skip if already has a marker or mapping flag
      if ($el.attr('data-store-block') || $el.attr('data-store-mapping') || $el.attr('data-store-component')) {
        return;
      }

      // Check if this looks like a product container (≥2 product-like items)
      if (looksLikeProductContainer($, el)) {
        claimed.add(el);

        // Tag as product-grid, preserving existing classes for theme styling
        const existingClass = $el.attr('class') || '';
        $el.attr('data-store-block', 'product-grid');
        $el.attr('class', `store-block store-block-product-grid ${existingClass}`.trim());

        const label = COMPONENT_LABELS['product-grid'] || 'product-grid';
        detected.push({
          type: 'product-grid',
          label,
          score: 0.7,
          mapping: 'converted',
          source: 'homepage-fallback',
        });
      }
    });
  }

  return { html: $('body').html() || $.html(), detected };
}

module.exports = { detectAndReplaceComponents, CONFIDENCE_THRESHOLD };
