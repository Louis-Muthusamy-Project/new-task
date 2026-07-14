'use strict';

/**
 * productSectionConverter.js
 *
 * Stage 2 of the Template Import Pipeline — "Convert Product Sections".
 *
 * Stage 1 (detectStoreComponents) tags whole *containers* — a
 * `product-grid`, a `featured-products` rail, a `category-grid`, a
 * `product-detail` page section, etc. That's enough for
 * `ThemeRenderer.jsx` to swap the container for a live React component,
 * but a live component still benefits from knowing where inside that
 * container the individual product bits are, so live data can be bound
 * without re-guessing the theme's markup at render time.
 *
 * This stage walks the containers Stage 1 already found and:
 *
 *   - For any repeating "grid family" container (product-grid,
 *     featured-products, latest-products, best-sellers,
 *     related-products, category-grid), tags each repeating child with
 *     `data-store-block="product-card"` (or `"category-card"` for
 *     category-grid) plus `data-store-field` hooks on its image / title /
 *     price sub-elements, when confidently found.
 *   - For a `product-detail` container, tags the single image / title /
 *     price / add-to-cart control the same way.
 *   - §2 Product Count Preservation: while walking each grid-family
 *     container's repeating children (already computed here for card
 *     tagging), also records the observed count as a `data-native-count`
 *     attribute on the container itself — a temporary, internal-only
 *     attribute. Stage 3 (storeBlockInjector.js) reads it once to seed
 *     the block's starting `limit` and then removes it, so the final
 *     persisted markup only ever carries the canonical `data-block-config`
 *     attribute, never this intermediate one.
 *
 * Same hard rule as Stage 1: purely additive attributes, nothing is
 * deleted, reordered, or restructured. If anything here throws, the
 * Stage 1 output is returned unchanged — a failed "nice to have"
 * enhancement never takes the page's static HTML down with it.
 */

const cheerio = require('cheerio');

const PRICE_RE = /[$₹€£]\s?\d/;
const RATING_CLASS_RE = /\b(rating|stars?|review-stars|star-rating)\b/i;
const BADGE_CLASS_RE = /\b(badge|ribbon|label|flag|tag)\b/i;
const BADGE_TEXT_RE = /\b(new|sale|hot|sold out|out of stock|-?\d{1,3}%\s*off|bestseller|limited)\b/i;
const INVENTORY_CLASS_RE = /\b(stock|inventory|availability|in-stock|out-of-stock)\b/i;
const INVENTORY_TEXT_RE = /\b(in stock|out of stock|only\s+\d+\s+left|sold out|low stock)\b/i;
const COMPARE_PRICE_CLASS_RE = /\b(compare[-_]?at|old[-_]?price|was[-_]?price|regular[-_]?price|original[-_]?price|strike|line-through)\b/i;
const DESCRIPTION_CLASS_RE = /\b(desc(ription)?|excerpt|summary|subtitle)\b/i;

const GRID_FAMILY_TO_CARD_TYPE = {
  'product-grid': 'product-card',
  'featured-products': 'product-card',
  'latest-products': 'product-card',
  'best-sellers': 'product-card',
  'related-products': 'product-card',
  'sale-products': 'product-card',
  'category-products': 'product-card',
  'category-grid': 'category-card',
};

/** Finds the most-repeated tag+class signature among direct children — same
 *  shape as storeComponentDetector's repeatingChildren, kept local so this
 *  stage has no hidden coupling to Stage 1's internals. */
function repeatingChildren($, el) {
  const children = $(el).children().toArray();
  if (children.length < 2) return children.length ? children : null;
  const sig = (c) => `${c.tagName}.${($(c).attr('class') || '').split(/\s+/).sort().join('.')}`;
  const counts = new Map();
  children.forEach((c) => counts.set(sig(c), (counts.get(sig(c)) || 0) + 1));
  const [mostCommon] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return children.filter((c) => sig(c) === mostCommon);
}

/**
 * Tags the best-guess field hooks inside `$card` without touching anything
 * that isn't a confident, unambiguous match. Covers the full checklist
 * field set — title / price / image / add-to-cart (original, unchanged
 * behavior) plus secondary-image / compare-price / badge / rating /
 * inventory / description (additive; a theme that doesn't have one of
 * these simply never gets that attribute — the renderer already leaves
 * untagged fields alone, so this fails gracefully by construction).
 */
function tagCardFields($, card) {
  const $card = $(card);

  const $imgs = $card.find('img');
  const $img = $imgs.first();
  if ($img.length) $img.attr('data-store-field', 'image');
  // Secondary image (checklist item 4) — many themes swap in a second
  // product photo on hover. Only tag it when there IS a genuinely
  // distinct second <img> in the card, never invented.
  if ($imgs.length > 1) {
    const $secondImg = $imgs.eq(1);
    if (!$secondImg.attr('data-store-field')) $secondImg.attr('data-store-field', 'secondary-image');
  }

  const $title = $card.find('h1,h2,h3,h4,h5,a').filter((_, n) => $(n).text().trim().length > 0).first();
  if ($title.length) $title.attr('data-store-field', 'title');

  // Description — a paragraph/labelled text block, distinguishable from
  // the title by not already being claimed and not looking like a price.
  const $description = $card
    .find('p, [class*="desc" i], [class*="excerpt" i], [class*="summary" i], [class*="subtitle" i]')
    .filter((_, n) => {
      const $n = $(n);
      if ($n.attr('data-store-field')) return false; // already claimed (e.g. title)
      const own = $n.clone().children().remove().end().text().trim();
      if (!own.length || PRICE_RE.test(own)) return false;
      return DESCRIPTION_CLASS_RE.test($n.attr('class') || '') || n.tagName === 'p';
    })
    .first();
  if ($description.length) $description.attr('data-store-field', 'description');

  const $priceCandidates = $card.find('*').filter((_, n) => {
    const own = $(n).clone().children().remove().end().text().trim();
    return PRICE_RE.test(own);
  });
  const $price = $priceCandidates.first();
  if ($price.length) $price.attr('data-store-field', 'price');

  // Compare-at ("was" / strikethrough) price — a SECOND price-shaped
  // element in the card, or one whose class explicitly says so. Only
  // tagged when there's already a primary `price` field, since a
  // standalone compare price with nothing to compare against isn't
  // meaningful.
  if ($price.length) {
    let $compare = $priceCandidates.filter((i, n) => n !== $price.get(0)).first();
    if (!$compare.length) {
      $compare = $card.find('*').filter((_, n) => COMPARE_PRICE_CLASS_RE.test($(n).attr('class') || '')).first();
    }
    if ($compare.length && !$compare.attr('data-store-field')) {
      $compare.attr('data-store-field', 'compare-price');
    }
  }

  const $cta = $card.find('a,button').filter((_, n) =>
    /add\s+to\s+cart|buy\s+now|view\s+product|shop\s+now/i.test($(n).text())
  ).first();
  if ($cta.length) $cta.attr('data-store-field', 'add-to-cart');

  // Badge (New / Sale / % Off / Sold Out ribbons) — class- or text-driven,
  // either signal sufficient on its own (mirrors storeComponentDetector's
  // "any one signal is enough" approach for price/CTA detection).
  const $badge = $card.find('*').filter((_, n) => {
    const $n = $(n);
    if ($n.attr('data-store-field')) return false;
    const cls = $n.attr('class') || '';
    const own = $n.clone().children().remove().end().text().trim();
    return BADGE_CLASS_RE.test(cls) || (own.length > 0 && own.length <= 20 && BADGE_TEXT_RE.test(own));
  }).first();
  if ($badge.length) $badge.attr('data-store-field', 'badge');

  // Rating (stars / review count widget).
  const $rating = $card.find('*').filter((_, n) => RATING_CLASS_RE.test($(n).attr('class') || '')).first();
  if ($rating.length) $rating.attr('data-store-field', 'rating');

  // Inventory / stock status.
  const $inventory = $card.find('*').filter((_, n) => {
    const $n = $(n);
    if ($n.attr('data-store-field')) return false;
    const cls = $n.attr('class') || '';
    const own = $n.clone().children().remove().end().text().trim();
    return INVENTORY_CLASS_RE.test(cls) || INVENTORY_TEXT_RE.test(own);
  }).first();
  if ($inventory.length) $inventory.attr('data-store-field', 'inventory');
}

/**
 * @param {string} html      Stage 1 output (already carries data-store-block)
 * @param {Array}  detected  Stage 1's detected list
 * @returns {{ html: string, cardsTagged: number, ok: boolean, error?: string }}
 */
function convertProductSections(html, detected = []) {
  const original = typeof html === 'string' ? html : '';
  if (!original.trim()) return { html: original, cardsTagged: 0, ok: true };

  // Nothing to convert — skip the cheerio round-trip entirely.
  const hasGridFamily = detected.some((d) => GRID_FAMILY_TO_CARD_TYPE[d.type] || d.type === 'product-detail');
  if (!hasGridFamily) return { html: original, cardsTagged: 0, ok: true };

  try {
    const $ = cheerio.load(original, { decodeEntities: false });
    let cardsTagged = 0;

    Object.entries(GRID_FAMILY_TO_CARD_TYPE).forEach(([containerType, cardType]) => {
      $(`[data-store-block="${containerType}"]`).each((_, container) => {
        const items = repeatingChildren($, container);
        if (!items || items.length < 2) return;

        // §2 Product Count Preservation — the native repeat count this
        // container actually shipped with in the template, written once
        // here so Stage 3 can seed it as the block's default `limit`
        // without re-walking the DOM. Internal-only attribute — never
        // part of the final config surface (see storeBlockInjector.js).
        $(container).attr('data-native-count', String(items.length));

        items.forEach((item) => {
          const $item = $(item);
          if ($item.attr('data-store-block')) return; // don't reclassify an already-tagged element
          $item.attr('data-store-block', cardType);
          tagCardFields($, item);
          cardsTagged += 1;
        });
      });
    });

    // product-detail: single cluster, tag the fields directly (no repeating
    // children to walk — this mirrors the card-field tagging above but for
    // the one-off PDP layout).
    $('[data-store-block="product-detail"]').each((_, pdp) => {
      tagCardFields($, pdp);
      cardsTagged += 1;
    });

    return { html: $('body').html() || $.html(), cardsTagged, ok: true };
  } catch (err) {
    console.warn('[templateImport] convertProductSections failed — keeping Stage 1 output:', err?.message || err);
    return { html: original, cardsTagged: 0, ok: false, error: err?.message || String(err) };
  }
}

module.exports = { convertProductSections };