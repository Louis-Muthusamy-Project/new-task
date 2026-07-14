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
 *   - `data-store-block="<type>"` — for the types that already have a
 *     matching category in the existing Store Builder's block system
 *     (see storeBlockTemplates.js's AUTO_CONVERTIBLE_TYPES). This is the
 *     exact same attribute `frontend/.../storeDynamicBlocks.js`'s
 *     hand-dropped GrapesJS blocks use, so a tagged region is immediately
 *     recognizable once a Store is created from the template and the page
 *     is opened in GrapesJS — no new hydration runtime is introduced here.
 *   - `data-store-mapping="needs-manual-mapping"` — for types with no
 *     store-scoped backend surface yet (Contact Form, Newsletter, Blog
 *     List), and for anything recognized but ambiguous.
 *
 * Hard rule, honored by construction: NOTHING is ever deleted or
 * restructured. Every match only ever gains attributes on the element that
 * was already there. If a region can't be classified at all, it's left
 * exactly as it was in the export.
 *
 * ── Two-tier classification (redesign) ───────────────────────────────────
 *
 * Tier 1 — Structural typing (keyword-free): decides WHAT KIND of
 * container an element is — a grid of repeating product-shaped cards, a
 * grid of repeating category-shaped tiles, or something else entirely.
 * Price/CTA/link-target signals below are structural/positional, not
 * keyword whitelists, so they generalize across however a given
 * ThemeForest template happens to spell things.
 *
 * Tier 2 — Semantic labeling: for a container Tier 1 already confirmed is
 * a *product* grid, decides WHICH named section it is (Featured / Latest
 * / Best Sellers / Related / plain Product Grid) via a weighted score
 * combining an externalized synonym set, positional priors (where the
 * section sits on the page), cardinality priors (how many items repeat),
 * and "View All" link adjacency — never a single keyword gate. If the
 * combined score doesn't clear the labeling threshold, the safe generic
 * `product-grid` fallback is used instead of guessing or leaving the
 * block untagged (fallback discipline, unchanged from before).
 */

const cheerio = require('cheerio');
const { COMPONENT_LABELS, AUTO_CONVERTIBLE_TYPES } = require('./storeBlockTemplates');
const { matchSynonymConcept, CONCEPT_TO_TYPE } = require('./storeSectionSynonyms');

const CONFIDENCE_THRESHOLD = 0.6;
// Tier 2's own labeling threshold — separate from Tier 1's structural
// CONFIDENCE_THRESHOLD above. A candidate that clears Tier 1 (it IS a
// product grid) but whose best semantic score doesn't clear THIS bar
// still gets tagged — just as the generic, always-correct `product-grid`
// rather than a specific guess (the "fallback discipline" §1 preserves).
const TIER2_LABEL_THRESHOLD = 0.5;

const textOf = ($, el) => $(el).text().trim();
const classOf = ($, el) => $(el).attr('class') || '';

// ─────────────────────────────────────────────────────────────────────────
// Tier 1 — generalized, keyword-free structural signals
// ─────────────────────────────────────────────────────────────────────────

// Price detection, generalized (§1): any ONE of these signals is
// sufficient on its own; none is individually required the way the old
// single `PRICE_RE` regex gate was. Multiple signals only raise
// confidence, they never gate.
const CURRENCY_SYMBOL_MONEY_RE = /(?:[$₹€£¥₩₨]|R\$|Rs\.?|kr|zł)\s?\d/i;
const CURRENCY_CODE_MONEY_RE = /\b(?:USD|INR|EUR|GBP|JPY|CAD|AUD|AED|SAR|CNY|CHF)\b\s?\d|\d\s?\b(?:USD|INR|EUR|GBP|JPY|CAD|AUD|AED|SAR|CNY|CHF)\b/i;
const BARE_DECIMAL_MONEY_RE = /\d+[.,]\d{2}(?!\d)/;
const PRICE_SLOT_ATTR_RE = /\b(price|amount|cost|mrp|rate)\b/i;

// Kept for any legacy call site that just wants "does this bit of text
// look like a price", without full structural-attribute inspection.
function textHasPriceSignal(text) {
  const t = text || '';
  return CURRENCY_SYMBOL_MONEY_RE.test(t) || CURRENCY_CODE_MONEY_RE.test(t) || BARE_DECIMAL_MONEY_RE.test(t);
}

/** Full multi-signal price detector — text OR structural placement, any one sufficient. */
function hasPriceSignal($, el) {
  const $el = $(el);
  if (textHasPriceSignal($el.text())) return true;
  const ownAttrs = `${$el.attr('class') || ''} ${$el.attr('id') || ''} ${$el.attr('aria-label') || ''}`;
  if (PRICE_SLOT_ATTR_RE.test(ownAttrs)) return true;
  if ($el.find('[class*="price" i],[class*="amount" i],[class*="cost" i],[class*="mrp" i],[id*="price" i]').length) {
    return true;
  }
  return false;
}

// Add-to-cart / CTA detection, generalized (§1): literal text is only one
// signal now; icon-only buttons, aria-labels, and bottom-of-card position
// are equally valid evidence.
const CTA_TEXT_RE = /\b(add\s+to\s+cart|buy\s+now|shop\s+now|view\s+product|add\s+to\s+bag)\b/i;
const CTA_ICON_CLASS_RE = /\b(fa-cart|fa-shopping-cart|fa-shopping-bag|fa-bag|icon-bag|icon-cart|icon-basket)\b/i;
const CTA_ARIA_RE = /\b(cart|bag|buy)\b/i;

function hasCtaSignal($, el) {
  const $el = $(el);
  if (CTA_TEXT_RE.test($el.text())) return true;
  const cls = $el.attr('class') || '';
  if (CTA_ICON_CLASS_RE.test(cls)) return true;
  if ($el.find('[class*="fa-cart" i],[class*="fa-shopping" i],[class*="icon-bag" i],[class*="icon-cart" i],[class*="icon-basket" i]').length) {
    return true;
  }
  if (CTA_ARIA_RE.test($el.attr('aria-label') || '')) return true;
  const labeledDescendants = $el.find('[aria-label]').toArray();
  if (labeledDescendants.some((n) => CTA_ARIA_RE.test($(n).attr('aria-label') || ''))) return true;
  // Positional evidence: a button/link sitting at the bottom of an
  // otherwise product-card-shaped element, regardless of its label text.
  const controls = $el.find('a,button').toArray();
  if (controls.length) {
    const last = controls[controls.length - 1];
    const lastText = $(last).text().trim();
    if (lastText.length > 0 && lastText.length <= 30) return true;
  }
  return false;
}

/** Does `href` resolve to something that itself looks like a product-detail page? */
function linkResolvesToProductDetail(href) {
  if (!href) return false;
  return /\/(product|products|shop|item|items)\//i.test(href) || /[?&](product[-_]?id|pid)=/i.test(href);
}

/** Does `href` resolve to a plain category/collection listing page? */
function linkResolvesToCategoryListing(href) {
  if (!href) return false;
  return /\/(category|categories|collection|collections|department|departments)\//i.test(href);
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
 * Tier 1 — decides whether `el` is a product-shaped grid, a
 * category-shaped grid, or neither. Card-shape confirmation stays
 * position/field-based (image + (price OR CTA) + heading/link) — this was
 * already largely keyword-free and remains the backbone. Category-vs-
 * product disambiguation now treats link-target inspection as the PRIMARY
 * signal, with the "categor(y|ies)" keyword only as a secondary,
 * non-gating tie-breaker.
 *
 * @returns {{ kind: 'product'|'category', repeaters: Array } | null}
 */
function detectGridFamily($, el, minCount = 3) {
  const repeaters = repeatingChildren($, el, minCount);
  if (!repeaters) return null;

  const sample = repeaters.slice(0, 6);
  const allHaveImage = sample.every((c) => $(c).find('img').length);
  if (!allHaveImage) return null;

  const priceVotes = sample.filter((c) => hasPriceSignal($, c)).length;
  const ctaVotes = sample.filter((c) => hasCtaSignal($, c)).length;
  const hasHeadingOrLink = sample.every((c) => $(c).find('h1,h2,h3,h4,a').length);

  const sampleHrefs = sample.map((c) => $(c).find('a').attr('href') || '');
  const categoryLinkVotes = sampleHrefs.filter(linkResolvesToCategoryListing).length;
  const productLinkVotes = sampleHrefs.filter(linkResolvesToProductDetail).length;

  const cls = classOf($, el);
  const text = textOf($, el).toLowerCase();
  const categoryKeywordHint = /\b(categor(y|ies)|shop-by-category)\b/i.test(cls) || /shop by category/i.test(text);

  // Card-shape confirmation: image + (price OR CTA signal) + heading/link.
  const isProductCardShaped = hasHeadingOrLink && (priceVotes >= Math.ceil(sample.length / 2) || ctaVotes >= Math.ceil(sample.length / 2));

  if (isProductCardShaped && productLinkVotes >= categoryLinkVotes) {
    return { kind: 'product', repeaters };
  }

  // Category tile: image + label, but link-target inspection (primary) or
  // the secondary keyword hint says "category", not a priced product card.
  if (categoryLinkVotes > productLinkVotes || (!isProductCardShaped && (categoryKeywordHint || hasHeadingOrLink))) {
    return { kind: 'category', repeaters };
  }

  if (isProductCardShaped) return { kind: 'product', repeaters };

  return null;
}

/**
 * Detects if an element looks like a container of product items (for homepage
 * product sections that may not have a strict repeating-sibling grid structure).
 * Used only on homepage pages for fallback detection.
 */
function looksLikeProductContainer($, el) {
  const children = $(el).children().toArray();
  if (children.length < 2) return false;

  let productLikeCount = 0;
  for (const child of children) {
    const $child = $(child);
    const hasImage = $child.find('img').length > 0;
    const hasHeading = $child.find('h1,h2,h3,h4,a').length > 0;
    const hasPrice = hasPriceSignal($, child);
    const hasCta = hasCtaSignal($, child);

    if (hasImage && hasHeading && (hasPrice || hasCta)) {
      productLikeCount++;
    }
  }

  if (productLikeCount >= 3) return true;
  if (productLikeCount === 2 && /\b(product|featured|item)\b/i.test($(el).attr('class') || '')) {
    return true;
  }

  return false;
}

// ─────────────────────────────────────────────────────────────────────────
// Tier 2 — weighted semantic scoring for the product-grid family
// ─────────────────────────────────────────────────────────────────────────

/**
 * "View All"/"Shop All" link inspection (§1): a grid with an adjacent link
 * to the general catalog route is strong evidence it's a curated SUBSET
 * section, not the plain catalog grid itself.
 */
function hasViewAllAdjacency($, el) {
  const $el = $(el);
  const scope = $el.parent().length ? $el.parent() : $el;
  const links = scope.find('a').toArray();
  for (const a of links) {
    if ($el.find(a).toArray().includes(a)) continue; // link lives inside the grid itself — not "adjacent"
    const label = $(a).text().trim().toLowerCase();
    if (/^(view all|shop all|see all|browse all|view more)\b/.test(label)) return true;
  }
  return false;
}

/**
 * Scores one product-grid candidate against each of the four named
 * concepts. Every signal is additive — nothing here is a hard gate, unlike
 * the old single-keyword-regex Tier 2.
 */
function scoreProductCandidate(candidate, ctx) {
  const { cls, text, repeaters, hasViewAll, afterProductDetail, isFirstOnPage, isLastOnPage } = candidate;
  const label = `${cls} ${text.slice(0, 160)}`.toLowerCase();
  const scores = { featured: 0, latest: 0, bestSellers: 0, related: 0, sale: 0 };

  // Synonym-set matching (externalized, versioned, appendable data file).
  const synonymConcept = matchSynonymConcept(label);
  if (synonymConcept) scores[synonymConcept] += 0.5;

  // Positional priors.
  if (!ctx.pageIsHome && afterProductDetail) {
    // Below a Product Detail page's main content — overwhelmingly Related.
    scores.related += 0.6;
  }
  if (ctx.pageIsHome) {
    if (isFirstOnPage) scores.featured += 0.3; // first grid after the hero
    if (isLastOnPage) scores.latest += 0.3; // last grid before the footer
  }

  // Cardinality priors.
  const count = repeaters.length;
  if (count >= 3 && count <= 6) {
    scores.featured += 0.2;
    scores.bestSellers += 0.1;
  }
  if (count >= 8) {
    scores.latest += 0.2;
  }

  // "View All" adjacency — boosts whichever concept currently leads,
  // since it's evidence of "subset section", not which subset.
  if (hasViewAll) {
    const [leaderConcept, leaderScore] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    if (leaderScore > 0) scores[leaderConcept] += 0.25;
  }

  return scores;
}

/**
 * Uniqueness-of-role tie-breaking (§1): ranks all product-grid candidates
 * on one page and assigns distinct semantic roles by combined score — the
 * same container is never given the same label as another on the same
 * page. Falls back to generic `product-grid` for anything left over
 * (fallback discipline).
 *
 * @returns {Map<Element, { type: string, score: number }>}
 */
function assignSemanticLabels(candidates, ctx) {
  const scored = candidates.map((c) => ({ candidate: c, scores: scoreProductCandidate(c, ctx) }));
  // Strongest overall signal claims first.
  scored.sort((a, b) => Math.max(...Object.values(b.scores)) - Math.max(...Object.values(a.scores)));

  const claimedConcepts = new Set();
  const results = new Map();

  for (const { candidate, scores } of scored) {
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    let assigned = null;
    for (const [concept, score] of ranked) {
      if (score < TIER2_LABEL_THRESHOLD) break; // nothing left clears the bar
      if (claimedConcepts.has(concept)) continue; // already assigned to another candidate
      assigned = { concept, score };
      break;
    }
    if (assigned) {
      claimedConcepts.add(assigned.concept);
      results.set(candidate.el, { type: CONCEPT_TO_TYPE[assigned.concept], score: Math.min(0.95, 0.5 + assigned.score) });
    } else {
      // Fallback discipline: never left untagged or force-labeled — the
      // safe, always-correct generic type wins instead of a bad guess.
      results.set(candidate.el, { type: 'product-grid', score: 0.8 });
    }
  }

  return results;
}

/**
 * ── Store Block System: comment-marker syntax ──────────────────────────
 *
 * Alongside the class/text heuristics below, a template author (or a
 * previous export tool) can mark a region explicitly with an HTML
 * comment instead of relying on auto-detection, e.g.:
 *
 *   <!-- STORE_PRODUCT_GRID -->
 *   <div class="products">...</div>
 *
 * This maps 1:1 to the same `data-store-block="product-grid"` attribute
 * contract the heuristic detector produces, so both paths feed the exact
 * same rendering system (see storeBlockTemplates.js's THEME_COMPONENT_MAP
 * and frontend ThemeRenderer.jsx). The comment itself is left in the
 * document untouched (comments never render, so leaving it costs
 * nothing) — only the very next element is tagged. If there's no
 * following element, nothing is changed: markers never wrap, split, or
 * synthesize markup.
 */
const MARKER_TO_TYPE = {
  STORE_HEADER: 'header',
  STORE_FOOTER: 'footer',
  STORE_NAVIGATION: 'navigation',
  STORE_NAV: 'navigation',
  STORE_HERO: 'hero',
  STORE_PRODUCT_GRID: 'product-grid',
  STORE_FEATURED_PRODUCTS: 'featured-products',
  STORE_CATEGORY_GRID: 'category-grid',
  STORE_LATEST_PRODUCTS: 'latest-products',
  STORE_BEST_SELLERS: 'best-sellers',
  STORE_RELATED_PRODUCTS: 'related-products',
  STORE_PRODUCT_DETAIL: 'product-detail',
  STORE_CART: 'cart',
  STORE_CHECKOUT: 'checkout',
  STORE_WISHLIST: 'wishlist',
  STORE_WISHLIST_BUTTON: 'wishlist-button',
  STORE_SEARCH: 'search',
  STORE_PAGINATION: 'pagination',
  STORE_CART_BUTTON: 'cart-button',
  STORE_CHECKOUT_BUTTON: 'checkout-button',
};

/**
 * Walks every comment node under `$('body')` (recursively, at any
 * nesting depth) and, for each one that matches a known marker, tags the
 * next *element* sibling with `data-store-block`/`data-store-mapping`
 * exactly the same way the heuristic classifier does. Returns the list
 * of blocks it claimed so the main detection pass below skips them.
 */
function applyCommentMarkers($) {
  const detected = [];
  const claimed = new Set();

  const walk = (container) => {
    $(container)
      .contents()
      .each((_, node) => {
        if (node.type === 'comment') {
          const key = (node.data || '').trim().toUpperCase();
          const type = MARKER_TO_TYPE[key];
          if (!type) return;

          let sib = node.next;
          while (sib && sib.type !== 'tag') sib = sib.next;
          if (!sib) return;

          const $el = $(sib);
          if (claimed.has(sib)) return;
          claimed.add(sib);

          const label = COMPONENT_LABELS[type] || type;
          const itemCount = ['product-grid', 'featured-products', 'category-grid', 'latest-products', 'best-sellers', 'related-products'].includes(type)
            ? ($el.children().length || undefined)
            : undefined;
          if (AUTO_CONVERTIBLE_TYPES.has(type)) {
            const existingClass = $el.attr('class') || '';
            $el.attr('data-store-block', type);
            $el.attr('class', `store-block store-block-${type} ${existingClass}`.trim());
            detected.push({ type, label, score: 1, mapping: 'converted', source: 'comment-marker', itemCount });
          } else {
            $el.attr('data-store-component', type);
            $el.attr('data-store-mapping', 'needs-manual-mapping');
            detected.push({ type, label, score: 1, mapping: 'needs-manual-mapping', source: 'comment-marker' });
          }
          return;
        }
        if (node.type === 'tag') walk(node);
      });
  };

  walk('body');
  return { detected, claimed };
}

/**
 * Classifies one element for every type EXCEPT the product/category grid
 * family — that disambiguation now happens in a page-level second pass
 * (see detectAndReplaceComponents) so Tier 2 can score candidates against
 * each other and against page position, instead of one element in
 * isolation. Order matters — earlier checks are more specific / less
 * ambiguous and win over later, broader ones.
 *
 * @param {object} pageMetadata  { isHome, slug, name } — only `isHome` is
 *   consulted here, to gate the Product Detail heuristic (a PDP is by
 *   definition not the home page).
 * @returns {{ type: string, score: number } | null}
 */
function classifyNonGridElement($, el, pageMetadata = {}) {
  const pageIsHome = !!pageMetadata.isHome;
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
  //    background image, full-bleed image, or CTA. Excludes anything that
  //    carries a price signal — a marketing hero never prices an item, but
  //    a Product Detail cluster (checked further below) does, and both
  //    shapes otherwise look alike (big heading + image + CTA button) ────
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
    if (tag !== 'h1' && (hasBg || hasBigImg || hasCta) && !hasPriceSignal($, scope)) {
      return { type: 'hero', score: 0.7 };
    }
  }

  // ── Blog List: repeating <article>/.post siblings, each with a heading
  //    + link, no price ────────────────────────────────────────────────
  if (/\b(blog|posts|articles|hentry)\b/i.test(cls) || $el.children('article').length >= 3) {
    const items = repeatingChildren($, el, 3) || $el.children('article').toArray();
    if (items.length >= 3) {
      const looksLikePosts = items.every((c) => $(c).find('h1,h2,h3,a').length && !hasPriceSignal($, c));
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

  // ── Cart page / Checkout page (full pages, NOT the small nav trigger
  //    handled above — these have real descendant content: a list of
  //    line items or an address/payment form plus an order summary) ──────
  if (descendantCount > 6) {
    const hasQtyControls = $el.find('input[type=number], input[name*=quantity], input[name*=qty]').length;
    const hasLineItemsList = $el.find('li, tr, .cart-item, [class*="cart-item"], [class*="line-item"]').length >= 1;
    const looksLikeCartPage =
      /\b(cart-page|shopping-cart|cart-table|your-cart)\b/i.test(cls) ||
      (/\bcart\b/i.test(cls + ' ' + text) && hasPriceSignal($, el) && (hasQtyControls || hasLineItemsList));
    if (looksLikeCartPage) return { type: 'cart', score: 0.7 };

    const hasPaymentFields = $el.find('input[name*=card],input[name*=payment],input[name*=cvv],select[name*=country]').length;
    const hasAddressFields = $el.find('input[name*=address],input[name*=city],input[name*=zip],input[name*=postal]').length;
    const looksLikeCheckoutPage =
      /\b(checkout-page|checkout-form)\b/i.test(cls) ||
      (/\bcheckout\b/i.test(cls + ' ' + text) && (hasPaymentFields || hasAddressFields) && hasPriceSignal($, el));
    if (looksLikeCheckoutPage) return { type: 'checkout', score: 0.7 };
  }

  // ── Wishlist page vs Wishlist button — a full saved-items page has
  //    repeating product-like children (checked further below alongside
  //    Product Grid); the *button* is the small heart/save icon that
  //    toggles one product, mirroring the Cart Button heuristic ─────────
  if ((tag === 'a' || tag === 'button') && descendantCount <= 6 && !$el.find('form').length) {
    if (/\b(wishlist|favorite|favourite|save-for-later)\b/i.test(cls) || /\b(wishlist|favorite|favourite|save for later)\b/i.test(text)) {
      return { type: 'wishlist-button', score: 0.7 };
    }
  }
  if (/\b(wishlist|saved-items|favorites|favourites)\b/i.test(cls) || /^(my\s+)?(wishlist|saved items|favorites|favourites)$/i.test(text.slice(0, 40))) {
    const repeatItems = repeatingChildren($, el, 2);
    if (repeatItems && repeatItems.every((c) => $(c).find('img').length)) {
      return { type: 'wishlist', score: 0.65 };
    }
  }

  // ── Pagination — a row of page-number links/buttons, or explicit
  //    prev/next controls ────────────────────────────────────────────────
  if (/\b(pagination|pager|page-numbers|page-nav)\b/i.test(cls) || $el.attr('role') === 'navigation' && /\bpaginat/i.test(cls)) {
    const links = $el.find('a, button');
    if (links.length >= 2) return { type: 'pagination', score: 0.75 };
  }
  if (tag === 'nav' && /\b(prev|next|previous)\b/i.test(text) && $el.find('a, button').length >= 2) {
    return { type: 'pagination', score: 0.6 };
  }

  // ── Product Detail — a single, non-repeating product cluster: one
  //    image + a title + a price + an "Add to cart" control, on a page
  //    that isn't the home page. Unlike grids, there are no repeating
  //    siblings to pattern-match, so this is a page-level structural
  //    check rather than a container-scan ─────────────────────────────
  if (!pageIsHome && (tag === 'section' || tag === 'div' || tag === 'main' || tag === 'article')) {
    const hasSingleMainImage = $el.find('img').length >= 1 && $el.find('img').length <= 6;
    const hasTitle = $el.find('h1, h2').length >= 1;
    const hasPrice = hasPriceSignal($, el);
    const hasAddToCart = hasCtaSignal($, el);
    const notARepeatingGrid = !repeatingChildren($, el, 3);
    const looksLikeProductDetail =
      /\b(product-detail|product-page|single-product|product-info)\b/i.test(cls) ||
      (hasSingleMainImage && hasTitle && hasPrice && hasAddToCart && notARepeatingGrid);
    if (looksLikeProductDetail) return { type: 'product-detail', score: 0.65 };
  }

  return null;
}

/**
 * @param {string} html  body-only HTML from parseStoreTemplateZip's
 *   page.content.html
 * @param {object} pageMetadata  optional { isHome: boolean, slug: string, name: string }
 * @returns {{
 *   html: string,
 *   detected: Array<{ type: string, label: string, score: number, mapping: 'converted'|'needs-manual-mapping', itemCount?: number }>
 * }}
 */
function detectAndReplaceComponents(html, pageMetadata = {}) {
  if (!html || typeof html !== 'string') return { html: html || '', detected: [] };

  const $ = cheerio.load(html, { decodeEntities: false });
  const pageIsHome = !!pageMetadata.isHome;

  // Pass 0 — explicit comment-marker syntax takes priority over heuristic
  // detection: an author who hand-marked a region meant exactly that
  // region, so those elements are claimed up-front.
  const markerResult = applyCommentMarkers($);
  const detected = [...markerResult.detected];
  const claimed = markerResult.claimed;

  // Pass 1 — walk top-down in document order, tagging every non-grid type
  // immediately (as before), and collecting grid-family candidates
  // (product-shaped or category-shaped) for a page-level second pass
  // instead of labeling them element-by-element in isolation.
  let heroSeen = false;
  let productDetailSeen = false;
  const productCandidates = [];
  const categoryCandidates = [];

  $('body *').each((_, el) => {
    if (claimed.has(el)) return;
    if ($(el).parents().toArray().some((p) => claimed.has(p))) return;

    const hit = classifyNonGridElement($, el, pageMetadata);
    if (hit && hit.score >= CONFIDENCE_THRESHOLD) {
      claimed.add(el);
      const { type, score } = hit;
      const label = COMPONENT_LABELS[type] || type;
      const $el = $(el);

      if (type === 'hero') heroSeen = true;
      if (type === 'product-detail') productDetailSeen = true;

      if (AUTO_CONVERTIBLE_TYPES.has(type)) {
        const existingClass = $el.attr('class') || '';
        $el.attr('data-store-block', type);
        $el.attr('class', `store-block store-block-${type} ${existingClass}`.trim());
        detected.push({ type, label, score, mapping: 'converted' });
        return;
      }

      $el.attr('data-store-component', type);
      $el.attr('data-store-mapping', 'needs-manual-mapping');
      detected.push({ type, label, score, mapping: 'needs-manual-mapping' });
      return;
    }

    // Not a recognized non-grid type — check Tier 1's grid-family
    // structural typing. Candidates are collected, not tagged yet, so
    // Tier 2 can score them against page position and against each other.
    const gridHit = detectGridFamily($, el, 3);
    if (!gridHit) return;

    claimed.add(el);
    const candidate = {
      el,
      cls: classOf($, el),
      text: textOf($, el),
      repeaters: gridHit.repeaters,
      hasViewAll: hasViewAllAdjacency($, el),
      afterProductDetail: productDetailSeen,
      afterHero: heroSeen,
      isFirstOnPage: false, // resolved after the walk, once every candidate is known
      isLastOnPage: false,
    };

    if (gridHit.kind === 'category') {
      categoryCandidates.push(candidate);
    } else {
      productCandidates.push(candidate);
    }
  });

  // Positional priors need every candidate's position relative to the
  // others on the page, so first/last is resolved now that the walk (and
  // therefore document order) is complete.
  if (productCandidates.length) {
    productCandidates[0].isFirstOnPage = true;
    productCandidates[productCandidates.length - 1].isLastOnPage = true;
  }

  // Category-grid family: a single semantic label, so no Tier 2 scoring
  // needed — tag directly, preserving native item count (§2).
  categoryCandidates.forEach((candidate) => {
    const $el = $(candidate.el);
    const existingClass = $el.attr('class') || '';
    $el.attr('data-store-block', 'category-grid');
    $el.attr('class', `store-block store-block-category-grid ${existingClass}`.trim());
    detected.push({
      type: 'category-grid',
      label: COMPONENT_LABELS['category-grid'] || 'category-grid',
      score: 0.7,
      mapping: 'converted',
      itemCount: candidate.repeaters.length,
    });
  });

  // Product-grid family: Tier 2 weighted scoring + uniqueness tie-breaking.
  if (productCandidates.length) {
    const labelAssignments = assignSemanticLabels(productCandidates, { pageIsHome });
    productCandidates.forEach((candidate) => {
      const { type, score } = labelAssignments.get(candidate.el);
      const $el = $(candidate.el);
      const existingClass = $el.attr('class') || '';
      $el.attr('data-store-block', type);
      $el.attr('class', `store-block store-block-${type} ${existingClass}`.trim());
      detected.push({
        type,
        label: COMPONENT_LABELS[type] || type,
        score,
        mapping: 'converted',
        itemCount: candidate.repeaters.length,
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  // HOMEPAGE-ONLY SECOND PASS: detect product containers on homepage pages
  // that may not have been caught by the standard repeating-grid detection.
  // ─────────────────────────────────────────────────────────────────────
  if (pageIsHome) {
    $('section, .section, div[class*="product"], div[class*="featured"], div[class*="item"], article').each((_, el) => {
      if (claimed.has(el)) return;
      if ($(el).parents().toArray().some((p) => claimed.has(p))) return;

      const $el = $(el);
      if ($el.attr('data-store-block') || $el.attr('data-store-mapping') || $el.attr('data-store-component')) {
        return;
      }

      if (looksLikeProductContainer($, el)) {
        claimed.add(el);
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
          itemCount: $el.children().length || undefined,
        });
      }
    });
  }

  return { html: $('body').html() || $.html(), detected };
}

module.exports = {
  detectAndReplaceComponents,
  CONFIDENCE_THRESHOLD,
  TIER2_LABEL_THRESHOLD,
  // Exported for reuse by other pipeline stages / tests that need the
  // same generalized signals rather than re-deriving them.
  hasPriceSignal,
  hasCtaSignal,
  textHasPriceSignal,
};