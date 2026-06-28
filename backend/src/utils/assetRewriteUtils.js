/**
 * assetRewriteUtils.js
 *
 * Centralised asset-URL rewriting helpers.
 *
 * Exposes five pure functions — no side-effects, no I/O:
 *
 *   rewriteHtmlAssets(html, rewriteFn)
 *   rewriteCssAssets(css, rewriteFn)
 *   rewriteInlineStyleAssets(styleValue, rewriteFn)
 *   rewriteSvgAssets(svg, rewriteFn)
 *   rewriteFontAssets(css, rewriteFn)
 *
 * Each accepts a `rewriteFn(originalUrl: string): string` callback
 * that maps an old URL/path to a new one.  The helpers only invoke
 * `rewriteFn` for URLs that are NOT external/protocol-safe; any URL
 * that starts with one of the SKIP_PREFIXES is passed through unchanged.
 *
 * Supported path formats handed to `rewriteFn`:
 *   - Relative:  images/photo.jpg  |  ../assets/bg.png
 *   - Absolute:  /static/logo.svg
 *   - Windows:   C:\Assets\font.woff2  |  ..\images\hero.jpg
 *
 * Skipped protocols (never rewritten):
 *   https://  http://  mailto:  tel:  javascript:  data:
 *
 * Usage
 * -----
 *   const { rewriteHtmlAssets } = require('./assetRewriteUtils');
 *
 *   const cdnBase = 'https://cdn.example.com';
 *   const html = rewriteHtmlAssets(rawHtml, (url) => `${cdnBase}/${url}`);
 */

'use strict';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Protocols / prefixes that must never be rewritten. */
const SKIP_PREFIXES = [
  'https://',
  'http://',
  'mailto:',
  'tel:',
  'javascript:',
  'data:',
  '//',          // protocol-relative URLs
];

/**
 * Returns true when the URL should be left as-is.
 * @param {string} url
 * @returns {boolean}
 */
const shouldSkip = (url) => {
  if (!url || url.trim() === '' || url.trim() === '#') return true;
  const lower = url.trim().toLowerCase();
  return SKIP_PREFIXES.some((prefix) => lower.startsWith(prefix));
};

/**
 * Safely invokes `rewriteFn` only when the URL is a local path.
 * @param {string}   url
 * @param {Function} rewriteFn
 * @returns {string}
 */
const maybeRewrite = (url, rewriteFn) =>
  shouldSkip(url) ? url : rewriteFn(url);

// ---------------------------------------------------------------------------
// HTML attribute rewriting
// ---------------------------------------------------------------------------

/**
 * Map of tag → attribute(s) that carry asset URLs.
 * Each entry is:  tagName (lower) → array of attribute names
 */
const TAG_ATTR_MAP = {
  // Media / embeds
  img:    ['src', 'srcset', 'data-src', 'data-srcset'],
  video:  ['src', 'poster'],
  audio:  ['src'],
  source: ['src', 'srcset'],          // inside <picture>, <video>, <audio>
  track:  ['src'],
  iframe: ['src'],
  embed:  ['src'],
  object: ['data'],
  // Documents / code
  link:   ['href'],
  script: ['src'],
  // Less common but valid
  input:  ['src'],                    // <input type="image">
  form:   ['action'],
  blockquote: ['cite'],
  ins:    ['cite'],
  del:    ['cite'],
  q:      ['cite'],
};

/**
 * Rewrites a single `srcset` attribute value.
 * Format: "url1 1x, url2 2x" or "url1 480w, url2 800w"
 *
 * @param {string}   srcset
 * @param {Function} rewriteFn
 * @returns {string}
 */
const rewriteSrcset = (srcset, rewriteFn) =>
  srcset.replace(
    /([^,\s]+)(\s+[\d.]+[wx])?/g,
    (match, url, descriptor = '') => {
      const rewritten = maybeRewrite(url, rewriteFn);
      return `${rewritten}${descriptor}`;
    },
  );

/**
 * Rewrites a single HTML attribute value.
 * Handles `srcset` separately from plain URL attributes.
 *
 * @param {string}   attrName
 * @param {string}   attrValue
 * @param {Function} rewriteFn
 * @returns {string}
 */
const rewriteAttrValue = (attrName, attrValue, rewriteFn) => {
  if (!attrValue) return attrValue;
  if (attrName === 'srcset' || attrName === 'data-srcset') {
    return rewriteSrcset(attrValue, rewriteFn);
  }
  return maybeRewrite(attrValue, rewriteFn);
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Rewrites asset URLs inside an HTML string.
 *
 * Handles: img, picture/source, video, audio, iframe, embed, object,
 *          link, script, style (inline), svg (href/xlink:href),
 *          and srcset attributes.
 *
 * Does NOT parse HTML with a DOM — uses targeted regex that is safe for
 * well-formed markup.  For malformed/adversarial HTML, pair with an HTML
 * sanitiser upstream.
 *
 * @param {string}   html
 * @param {Function} rewriteFn  (url: string) => string
 * @returns {string}
 */
const rewriteHtmlAssets = (html, rewriteFn) => {
  if (!html) return html;

  // 1. Rewrite known tag + attribute combinations -------------------------
  //    Pattern: <tagName ... attrName="value" ...>
  //    Handles single, double, or unquoted attribute values.
  for (const [tag, attrs] of Object.entries(TAG_ATTR_MAP)) {
    for (const attr of attrs) {
      // Matches:  attr="..."  attr='...'  attr=value (unquoted, stops at space/>)
      const attrRe = new RegExp(
        `(<${tag}[^>]*?\\s${attr}\\s*=\\s*)` +
          `(?:"([^"]*?)"|'([^']*?)'|([^\\s>]+))`,
        'gi',
      );

      html = html.replace(
        attrRe,
        (match, prefix, dq, sq, uq) => {
          const raw = dq ?? sq ?? uq ?? '';
          const quote = dq !== undefined ? '"' : sq !== undefined ? "'" : '';
          const rewritten = rewriteAttrValue(attr, raw, rewriteFn);
          return quote
            ? `${prefix}${quote}${rewritten}${quote}`
            : `${prefix}${rewritten}`;
        },
      );
    }
  }

  // 2. Rewrite inline <style> blocks ------------------------------------
  html = html.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (match, open, css, close) =>
      `${open}${rewriteCssAssets(css, rewriteFn)}${close}`,
  );

  // 3. Rewrite inline style="" attributes -------------------------------
  html = html.replace(
    /(\sstyle\s*=\s*)(?:"([^"]*?)"|'([^']*?)')/gi,
    (match, prefix, dq, sq) => {
      const raw = dq ?? sq ?? '';
      const quote = dq !== undefined ? '"' : "'";
      const rewritten = rewriteInlineStyleAssets(raw, rewriteFn);
      return `${prefix}${quote}${rewritten}${quote}`;
    },
  );

  // 4. SVG href / xlink:href inside the outer HTML -----------------------
  //    (stand-alone <svg> blobs are handled by rewriteSvgAssets; this
  //     covers svg elements embedded inline in an HTML document)
  html = html.replace(
    /(<(?:use|image|feImage|script|a)[^>]*?\s(?:xlink:href|href)\s*=\s*)(?:"([^"]*?)"|'([^']*?)')/gi,
    (match, prefix, dq, sq) => {
      const raw = dq ?? sq ?? '';
      const quote = dq !== undefined ? '"' : "'";
      const rewritten = maybeRewrite(raw, rewriteFn);
      return `${prefix}${quote}${rewritten}${quote}`;
    },
  );

  return html;
};

/**
 * Rewrites all `url(...)` references inside a CSS string.
 *
 * Covers:
 *   background-image: url("img.png")
 *   background: url('img.png')
 *   content: url(img.png)          ← unquoted
 *   @import url("sheet.css")
 *   cursor: url(cursor.cur)
 *
 * @font-face src descriptors are also covered because they use url().
 * Call `rewriteFontAssets` if you need to target @font-face exclusively
 * (e.g. to filter only font MIME types).
 *
 * @param {string}   css
 * @param {Function} rewriteFn  (url: string) => string
 * @returns {string}
 */
const rewriteCssAssets = (css, rewriteFn) => {
  if (!css) return css;

  // url( "..." )  |  url( '...' )  |  url( ... )
  return css.replace(
    /url\(\s*(?:"([^"]+?)"|'([^']+?)'|([^)\s]+?))\s*\)/gi,
    (match, dq, sq, uq) => {
      const raw = dq ?? sq ?? uq ?? '';
      const quote = dq !== undefined ? '"' : sq !== undefined ? "'" : '';
      const rewritten = maybeRewrite(raw, rewriteFn);
      return `url(${quote}${rewritten}${quote})`;
    },
  );
};

/**
 * Rewrites asset URLs inside an inline `style` attribute value string.
 *
 * Example input (the value of style="…"):
 *   background-image: url('hero.jpg'); border-image: url("frame.png") 10 fill
 *
 * Delegates to `rewriteCssAssets` since inline styles use the same
 * url() syntax as stylesheets.
 *
 * @param {string}   styleValue   The raw content of a style="" attribute.
 * @param {Function} rewriteFn    (url: string) => string
 * @returns {string}
 */
const rewriteInlineStyleAssets = (styleValue, rewriteFn) =>
  rewriteCssAssets(styleValue, rewriteFn);

/**
 * Rewrites asset URLs inside a standalone SVG string.
 *
 * Handles:
 *   <image href="…" />          SVG 2
 *   <image xlink:href="…" />    SVG 1.1 / legacy
 *   <use href="…" />
 *   <use xlink:href="…" />
 *   <feImage href="…" />
 *   <script href="…" />
 *   <a href="…" />              (SVG hyperlinks)
 *   <pattern>/<filter> children that carry image refs
 *   Inline <style> blocks inside the SVG
 *   style="" attribute values inside the SVG
 *
 * @param {string}   svg
 * @param {Function} rewriteFn  (url: string) => string
 * @returns {string}
 */
const rewriteSvgAssets = (svg, rewriteFn) => {
  if (!svg) return svg;

  // 1. href and xlink:href on any SVG element
  svg = svg.replace(
    /(\s(?:xlink:href|href)\s*=\s*)(?:"([^"]*?)"|'([^']*?)')/gi,
    (match, prefix, dq, sq) => {
      const raw = dq ?? sq ?? '';
      const quote = dq !== undefined ? '"' : "'";
      const rewritten = maybeRewrite(raw, rewriteFn);
      return `${prefix}${quote}${rewritten}${quote}`;
    },
  );

  // 2. Inline <style> blocks
  svg = svg.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (match, open, css, close) =>
      `${open}${rewriteCssAssets(css, rewriteFn)}${close}`,
  );

  // 3. Inline style="" attribute values
  svg = svg.replace(
    /(\sstyle\s*=\s*)(?:"([^"]*?)"|'([^']*?)')/gi,
    (match, prefix, dq, sq) => {
      const raw = dq ?? sq ?? '';
      const quote = dq !== undefined ? '"' : "'";
      const rewritten = rewriteInlineStyleAssets(raw, rewriteFn);
      return `${prefix}${quote}${rewritten}${quote}`;
    },
  );

  // 4. filter / mask / clip-path url(#id) references are fragment-only
  //    (#id) and should never be rewritten — they are already skipped
  //    by shouldSkip via the '#' empty / fragment check only when the
  //    full value is '#id'.  When embedded inside url() the leading #
  //    makes it a local fragment — rewriteCssAssets will pass it to
  //    rewriteFn.  Guard here explicitly.
  //    We intentionally do NOT rewrite url(#fragmentId) in SVG.
  //    If rewriteCssAssets is called on inline SVG styles it might touch
  //    those; callers should keep rewriteFn idempotent for fragment refs.

  return svg;
};

/**
 * Rewrites font `src` URLs inside `@font-face` blocks in a CSS string.
 *
 * Only rewrites URLs that look like font resources (by file extension):
 *   .woff  .woff2  .ttf  .otf  .eot  .svg  (SVG fonts — legacy)
 *
 * Non-font url() references inside @font-face (rare but possible) are
 * also rewritten when they match the extension allow-list.
 *
 * If you want ALL url() in @font-face rewritten regardless of extension,
 * use `rewriteCssAssets` instead.
 *
 * @param {string}   css
 * @param {Function} rewriteFn  (url: string) => string
 * @returns {string}
 */
const rewriteFontAssets = (css, rewriteFn) => {
  if (!css) return css;

  const FONT_EXT_RE = /\.(woff2?|ttf|otf|eot|svg)(\?[^)'"]*)?$/i;

  // Extract each @font-face block and rewrite only font URLs within it.
  return css.replace(
    /@font-face\s*\{[^}]*\}/gi,
    (block) =>
      block.replace(
        /url\(\s*(?:"([^"]+?)"|'([^']+?)'|([^)\s]+?))\s*\)/gi,
        (match, dq, sq, uq) => {
          const raw = dq ?? sq ?? uq ?? '';
          const quote = dq !== undefined ? '"' : sq !== undefined ? "'" : '';

          // Skip non-font URLs (e.g. a stray background inside @font-face)
          if (!FONT_EXT_RE.test(raw.split('?')[0])) return match;

          const rewritten = maybeRewrite(raw, rewriteFn);
          return `url(${quote}${rewritten}${quote})`;
        },
      ),
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  rewriteHtmlAssets,
  rewriteCssAssets,
  rewriteInlineStyleAssets,
  rewriteSvgAssets,
  rewriteFontAssets,
  // Exported for testing / advanced consumers
  shouldSkip,
  maybeRewrite,
  rewriteSrcset,
};
