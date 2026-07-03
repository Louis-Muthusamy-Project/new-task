'use strict';

/**
 * rewriteAssets.js
 * Stage 7 ("Replace local asset URLs") of the WordPress Import Pipeline.
 *
 * The actual rewriting happens inside the same reused `parseStoreTemplateZip()`
 * call as Stage 6 (see uploadAssets.js) — Cloudinary upload and HTML/CSS
 * rewriting are a single fused pass in the existing engine, so there is
 * nothing to reimplement here without duplicating that logic.
 *
 * What *is* new: a post-hoc, read-only QA sweep across the already-rewritten
 * pages, flagging any local-looking asset reference that survived the
 * rewrite unresolved (e.g. a path the asset index couldn't match, or a
 * WordPress-relative path pointing outside the ZIP). This never mutates the
 * HTML — it only powers a non-blocking warning surfaced to the operator,
 * consistent with the pipeline's existing fail-soft error-handling model
 * (a missing asset never aborts the import).
 */

// Matches src/href/poster/data-* attribute values, and CSS url(...) values,
// across an already-rewritten page's HTML/CSS.
const LOCAL_ASSET_RE =
  /\b(?:src|href|poster|data(?:-src|-lazy|-original|-bg|-background|-image)?)=["']([^"']+)["']|url\(\s*(['"]?)([^'")]+)\2\s*\)/gi;

const isLikelyUnresolvedLocalPath = (value) => {
  if (!value) return false;
  const v = value.trim();
  if (!v) return false;
  // Already a fully-qualified/CDN/data/anchor reference — nothing to flag.
  if (/^(https?:\/\/|\/\/|data:|mailto:|tel:|#)/i.test(v)) return false;
  // Only flag values that still look like a filesystem-ish asset reference
  // (has a file extension), not e.g. arbitrary internal page links.
  return /\.[a-z0-9]{2,5}(\?|#|$)/i.test(v);
};

/**
 * @param {Array<{ name: string, content: { html: string, css: string } }>} pages
 *   the pages array returned by uploadAssets.uploadAndRewriteAssets()
 * @returns {string[]} human-readable, non-blocking warnings — one per page
 *   with unresolved local references, empty if everything rewrote cleanly
 */
function findUnrewrittenLocalReferences(pages = []) {
  const warnings = [];

  for (const page of pages) {
    const html = page?.content?.html || '';
    const css = page?.content?.css || '';
    const hits = new Set();

    for (const source of [html, css]) {
      LOCAL_ASSET_RE.lastIndex = 0;
      let m;
      while ((m = LOCAL_ASSET_RE.exec(source)) !== null) {
        const value = m[1] || m[3];
        if (isLikelyUnresolvedLocalPath(value)) hits.add(value);
      }
    }

    if (hits.size) {
      const sample = [...hits].slice(0, 3).join(', ');
      warnings.push(
        `"${page.name}" still references ${hits.size} local asset path(s) that couldn't be resolved to the CDN: ${sample}${hits.size > 3 ? ', …' : ''}`
      );
    }
  }

  return warnings;
}

module.exports = { findUnrewrittenLocalReferences };
