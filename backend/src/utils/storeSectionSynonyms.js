'use strict';

/**
 * storeSectionSynonyms.js
 *
 * Data-only synonym dictionary consumed by Tier 2 semantic labeling in
 * storeComponentDetector.js (§1 of the redesign). Keyed by concept —
 * Featured / Latest / BestSellers / Related — rather than inline regex
 * scattered across the classifier function.
 *
 * This is a deliberate architectural split: "we saw a new label on
 * template #742" should be a data update to this file (append one
 * string), never a code change to the detector. That's the only way
 * label coverage scales past a fixed template count across 1000+
 * ThemeForest themes.
 *
 * Each entry is matched case-insensitively as a whole word/phrase against
 * a candidate container's class list + heading/label text. Keep entries
 * as plain lowercase phrases (spaces allowed) — the detector normalizes
 * both sides before comparing, so no regex syntax is needed here.
 *
 * version bump this file's SYNONYM_SET_VERSION whenever entries are
 * appended, so any future caching/telemetry layer can tell which
 * synonym set produced a given classification.
 */

const SYNONYM_SET_VERSION = 1;

const SYNONYM_SETS = {
  featured: [
    'featured',
    'handpicked',
    'hand picked',
    'editor\'s picks',
    'editors picks',
    'editor picks',
    'just in',
    'fresh drops',
    'hot picks',
    'curated',
    'our picks',
    'staff picks',
    'spotlight',
    'must haves',
    'must-haves',
    'top picks',
  ],
  latest: [
    'latest',
    'new arrivals',
    'new-arrivals',
    'newest',
    'just arrived',
    'just landed',
    'fresh arrivals',
    'new in',
    'new drops',
    'recently added',
    'whats new',
    "what's new",
  ],
  bestSellers: [
    'best sellers',
    'best-sellers',
    'bestsellers',
    'bestseller',
    'trending',
    'top selling',
    'top-selling',
    'most popular',
    'popular products',
    'hot items',
    'customer favorites',
    'customer favourites',
    'fan favorites',
  ],
  related: [
    'related',
    'you may also like',
    'similar products',
    'recommended',
    'recommended for you',
    'frequently bought together',
    'complete the look',
    'pairs well with',
    'goes well with',
    'customers also bought',
    'you might also like',
  ],
};

/**
 * Returns the concept key ('featured' | 'latest' | 'bestSellers' | 'related')
 * whose synonym set contains a whole-word/phrase match in `label`, or null.
 * Case-insensitive; matches on word boundaries so e.g. "featured" doesn't
 * accidentally match inside an unrelated longer word.
 */
function matchSynonymConcept(label) {
  const norm = (label || '').toLowerCase();
  for (const [concept, phrases] of Object.entries(SYNONYM_SETS)) {
    for (const phrase of phrases) {
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
      if (re.test(norm)) return concept;
    }
  }
  return null;
}

// Concept key -> detector's block type string.
const CONCEPT_TO_TYPE = {
  featured: 'featured-products',
  latest: 'latest-products',
  bestSellers: 'best-sellers',
  related: 'related-products',
};

module.exports = {
  SYNONYM_SET_VERSION,
  SYNONYM_SETS,
  CONCEPT_TO_TYPE,
  matchSynonymConcept,
};
