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

const GRID_FAMILY_TO_CARD_TYPE = {
  'product-grid': 'product-card',
  'featured-products': 'product-card',
  'latest-products': 'product-card',
  'best-sellers': 'product-card',
  'related-products': 'product-card',
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

/** Tags the best-guess image/title/price/add-to-cart hooks inside `$card`
 *  without touching anything that isn't a confident, unambiguous match. */
function tagCardFields($, card) {
  const $card = $(card);

  const $img = $card.find('img').first();
  if ($img.length) $img.attr('data-store-field', 'image');

  const $title = $card.find('h1,h2,h3,h4,h5,a').filter((_, n) => $(n).text().trim().length > 0).first();
  if ($title.length) $title.attr('data-store-field', 'title');

  const $price = $card.find('*').filter((_, n) => {
    const own = $(n).clone().children().remove().end().text().trim();
    return PRICE_RE.test(own);
  }).first();
  if ($price.length) $price.attr('data-store-field', 'price');

  const $cta = $card.find('a,button').filter((_, n) =>
    /add\s+to\s+cart|buy\s+now|view\s+product|shop\s+now/i.test($(n).text())
  ).first();
  if ($cta.length) $cta.attr('data-store-field', 'add-to-cart');
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
