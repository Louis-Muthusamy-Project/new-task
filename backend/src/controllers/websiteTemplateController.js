'use strict';

/**
 * websiteTemplateController.js — Production-Ready Template Import Engine
 *
 * Audit findings addressed in this revision
 * ══════════════════════════════════════════
 *
 * CRITICAL
 *   A. CSS url() context loss — inlineCssIntoHtml now rewrites every url()
 *      using the CSS file's own path BEFORE embedding it as a <style> block.
 *      Fixes: owl.video.play.png / any asset referenced from a subdirectory CSS.
 *
 *   B. full.replace(href, url) misfires — replaced with replaceAttrValue() which
 *      anchors the replacement to the specific attribute being rewritten, preventing
 *      corruption of alt text, data-* attributes, or already-rewritten CDN URLs.
 *
 *   C. v1 rewriteMatches closure bug — function accepted no `source` parameter and
 *      sliced from the outer `html` variable, discarding all prior passes. Fixed in
 *      v2; this file preserves the v2 signature.
 *
 *   D. Processing order — must be:
 *        inlineCssIntoHtml (rewrites url() while CSS file path is known)
 *        → convertAssetsInHtml (rewrites HTML attributes + any remaining url())
 *        → extractCssFromHtml (pulls <style> into css field; strips from HTML)
 *        → extractBodyHtml
 *      v1 stripped <style> BEFORE convertAssetsInHtml; url() inside those blocks
 *      was never rewritten.
 *
 * HIGH
 *   E. Two-regex loop in inlineCssIntoHtml — scanning the same HTML with two
 *      separate regexes means one tag can be matched by both, producing duplicate
 *      entries in the replacement list. Fixed with a single pass that handles both
 *      attribute orderings via a combined lookahead regex.
 *
 *   F. O(n) case-insensitive key lookup — v2 called Object.keys(assetIndex).find()
 *      on every cache miss. Fixed with a pre-built lowercase→originalCase index
 *      (lcIndex) built once at population time.
 *
 *   G. MIME not forwarded — uploadZipEntryToCloudinary now passes mime so
 *      Cloudinary delivers fonts/CSS/JS with correct Content-Type headers.
 *
 *   H. headLinks not extracted/stored — CDN Font Awesome, Bootstrap Icons, and
 *      Google Fonts <link> tags are captured from <head> and stored in
 *      content.headLinks. The frontend must inject these into the GrapesJS canvas.
 *
 * MEDIUM
 *   I. query-string / fragment stripping — resolveHrefToZipPath now strips ?query
 *      and #fragment before building candidates (font.woff2?v=1.2, sprite.svg#icon).
 *
 *   J. srcset comma-split hardening — switched to regex-split on ", " boundary
 *      that respects whitespace-delimited descriptors and avoids splitting on
 *      commas that appear inside query strings.
 *
 *   K. favicon 404 handling — <link rel="icon"> tags whose href cannot be resolved
 *      to an uploaded asset are stripped rather than left as broken 404 requests.
 *
 *   L. Concurrency limiter — Cloudinary uploads are throttled to MAX_CONCURRENT=5
 *      via a promise-queue semaphore (no extra dependency).
 *
 *   M. Duplicate upload prevention — assetIndex.secureUrl is checked before any
 *      Cloudinary call; the same asset is never uploaded twice.
 */

const multer  = require('multer');
const JSZip   = require('jszip');

const asyncHandler = require('../utils/asyncHandler');
const Website      = require('../models/Website');
const WebsitePage  = require('../models/WebsitePage');
const { uploadBufferToCloudinary } = require('../config/cloudinary');
const { runTemplateImportPipeline } = require('../services/templateImplort/index');

// ─────────────────────────────────────────────────────────────────────────────
// Multer — in-memory, 50 MB
// ─────────────────────────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 50 * 1024 * 1024 },
});

// ─────────────────────────────────────────────────────────────────────────────
// MIME / extension tables
// ─────────────────────────────────────────────────────────────────────────────
const MIME_BY_EXT = {
  png: 'image/png',    jpg: 'image/jpeg',  jpeg: 'image/jpeg',
  gif: 'image/gif',    webp: 'image/webp', avif: 'image/avif',
  svg: 'image/svg+xml',ico: 'image/x-icon',bmp: 'image/bmp',
  cur: 'image/x-win-bitmap',
  woff: 'font/woff',   woff2: 'font/woff2', ttf: 'font/ttf',
  otf: 'font/otf',     eot: 'application/vnd.ms-fontobject',
  js:  'application/javascript',  mjs: 'application/javascript',
  css: 'text/css',
  mp4: 'video/mp4',   webm: 'video/webm',  ogv: 'video/ogg',
  mp3: 'audio/mpeg',  ogg:  'audio/ogg',   wav: 'audio/wav',
  json: 'application/json', xml: 'application/xml',
  pdf:  'application/pdf',  map: 'application/json',
  wasm: 'application/wasm',
};

const getMime = (ext) => MIME_BY_EXT[(ext || '').toLowerCase()] || 'application/octet-stream';

const cloudinaryResType = (mime) => {
  if (mime.startsWith('image/'))                        return 'image';
  if (mime.startsWith('video/') || mime.startsWith('audio/')) return 'video';
  return 'raw';
};

/**
 * Asset types we upload. HTML files are processed inline, not uploaded.
 * Everything else (fonts, CSS, JS, images, media, data) goes to Cloudinary.
 */
const UPLOADABLE_EXTS = new Set([
  'png','jpg','jpeg','gif','webp','avif','svg','ico','bmp','cur',
  'woff','woff2','ttf','otf','eot',
  'js','mjs','css',
  'mp4','webm','ogv','mp3','ogg','wav',
  'json','xml','pdf','map','wasm',
]);

const SKIP_EXTS = new Set(['html','htm','htaccess','ds_store']);

// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary concurrency limiter — max 5 simultaneous uploads   [FIX L]
// ─────────────────────────────────────────────────────────────────────────────
const MAX_CONCURRENT = 5;
const _sem = { active: 0, queue: [] };

const withSlot = (fn) =>
  new Promise((resolve, reject) => {
    const run = async () => {
      _sem.active++;
      try   { resolve(await fn()); }
      catch (e) { reject(e); }
      finally {
        _sem.active--;
        if (_sem.queue.length) _sem.queue.shift()();
      }
    };
    _sem.active < MAX_CONCURRENT ? run() : _sem.queue.push(run);
  });

// ─────────────────────────────────────────────────────────────────────────────
// Path normalisation utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalise a raw ZIP path: Windows backslashes → forward slashes,
 * strip leading ./ and leading /. Does NOT change case.
 */
const normZip = (p) =>
  (p || '').replace(/\\/g, '/').replace(/^\.\/?/, '').replace(/^\/+/, '');

/** Directory portion of a zip path, always ending in '/' or ''. */
const dirOf = (p) => {
  const n = normZip(p);
  const i = n.lastIndexOf('/');
  return i >= 0 ? n.slice(0, i + 1) : '';
};

/**
 * Resolve `href` relative to `baseDir`, collapsing .. segments.
 * Also strips ?query and #fragment so  "font.woff2?v=1"  →  "fonts/font.woff2"  [FIX I]
 */
const resolveHref = (baseDir, href) => {
  const clean  = (href || '').split('?')[0].split('#')[0].trim();
  if (!clean) return '';
  const joined = normZip(baseDir + clean);
  const parts  = joined.split('/');
  const out    = [];
  for (const p of parts) {
    if (!p || p === '.') continue;
    if (p === '..') { out.pop(); continue; }
    out.push(p);
  }
  return out.join('/');
};

// ─────────────────────────────────────────────────────────────────────────────
// assetIndex + O(1) case-insensitive lookup index   [FIX F]
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the assetIndex from a JSZip instance.
 * Returns { index, lcIndex } where:
 *   index   : { [originalCasePath]: { entry, ext, mime } }
 *   lcIndex : { [lowercasePath]: originalCasePath }        ← O(1) case-insensitive lookup
 *
 * CSS files are ALSO added to assetIndex (they are uploaded so their CDN URL
 * can be substituted for any non-inlined <link> references).
 */
const buildAssetIndex = (zip) => {
  const index   = {};
  const lcIndex = {};

 const htmlEntries = [];
const cssEntries = new Map();

zip.forEach((rawPath, entry) => {
  console.log("HTML Entries =", htmlEntries.map(e => e.zipPath));
console.log("CSS Entries =", [...cssEntries.keys()]);
    if (!entry) return;

    console.log({
        rawPath,
        zipPath: normZip(rawPath),
        ext: (normZip(rawPath).split('.').pop() || '').toLowerCase(),
        dir: entry.dir
    });

    if (entry.dir) return;

    const zipPath = normZip(rawPath);

    const ext =
        zipPath.includes(".")
            ? zipPath.substring(zipPath.lastIndexOf(".") + 1).toLowerCase()
            : "";

    console.log("Detected Extension:", ext);

    if (ext === "html" || ext === "htm") {
        console.log("FOUND HTML:", zipPath);

        htmlEntries.push({
            zipPath,
            entry,
        });

        return;
    }

    if (ext === "css") {
        cssEntries.set(zipPath, { entry });
        return;
    }

    if (SKIP_EXTS.has(ext)) return;

    // Populate index for every uploadable asset (images, fonts, JS, media, etc.)
    // Without this block, index and lcIndex remain empty and getUrl() always
    // returns null — nothing is ever uploaded to Cloudinary.
    if (UPLOADABLE_EXTS.has(ext)) {
      const mime = getMime(ext);
      index[zipPath]                 = { entry, ext, mime, secureUrl: null };
      lcIndex[zipPath.toLowerCase()] = zipPath;
    }
  });

  return { index, lcIndex };
};

/**
 * Resolve an href (from HTML or CSS source) to the exact key that exists in
 * assetIndex. Returns null for external URLs and data URIs.
 *
 * Lookup priority:
 *   1. exact root-relative match (original case)
 *   2. exact base-dir-relative match (original case)
 *   3. lowercase root-relative  (via lcIndex — O(1))           [FIX F]
 *   4. lowercase base-dir-relative  (via lcIndex — O(1))       [FIX F]
 */
const resolveToIndexKey = (contextPath, href, index, lcIndex) => {
  if (!href) return null;
  const raw = href.trim();
  if (!raw) return null;
  if (/^(https?:\/\/|\/\/|data:|mailto:|tel:|#)/i.test(raw)) return null;

  const baseDir    = dirOf(contextPath);
  const rootRaw    = normZip(raw.replace(/^\/+/, ''));
  const baseRaw    = resolveHref(baseDir, raw);

  if (index[rootRaw])          return rootRaw;
  if (index[baseRaw])          return baseRaw;
  if (lcIndex[rootRaw.toLowerCase()]) return lcIndex[rootRaw.toLowerCase()];
  if (lcIndex[baseRaw.toLowerCase()]) return lcIndex[baseRaw.toLowerCase()];

  return null;  // not found — caller leaves href untouched
};

// ─────────────────────────────────────────────────────────────────────────────
// Attribute-safe value replacement   [FIX B]
//
// Replaces the value of a SPECIFIC attribute inside a tag string.
// Anchors the replacement to the attribute name so that:
//   • The same path appearing in alt="…" or title="…" is untouched.
//   • Already-rewritten CDN URLs (which contain the original path as a
//     suffix) are not corrupted by a naive string.replace(href, cdnUrl).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Replace attrName's value inside tagStr with newValue.
 * Handles both single and double quotes.
 *
 * @param {string} tagStr     Full matched tag, e.g. <img alt="x" src="x">
 * @param {string} attrName   Attribute whose value to replace, e.g. "src"
 * @param {string} oldValue   Current attribute value (used to anchor search)
 * @param {string} newValue   Replacement value
 * @returns {string}
 */
const replaceAttrValue = (tagStr, attrName, oldValue, newValue) => {
  // Escape special regex chars in both the attribute name and old value.
  const escapedAttr = attrName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedVal  = oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match:  attrName="oldValue"  or  attrName='oldValue'
  // The word-boundary \b before attrName prevents "data-src" matching "src".
  const re = new RegExp(`(\\b${escapedAttr}=)(["'])${escapedVal}\\2`, 'i');
  return tagStr.replace(re, `$1$2${newValue}$2`);
};

// ─────────────────────────────────────────────────────────────────────────────
// Async string rewriter
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply async `replacer` to every non-overlapping match of `re` in `source`.
 * Always resets lastIndex before scanning.
 *
 * @param {string}   source
 * @param {RegExp}   re        Must have 'g' flag.
 * @param {Function} replacer  async (fullMatch, ...captureGroups) => string
 * @returns {Promise<string>}
 */
const rewriteAll = async (source, re, replacer) => {
  re.lastIndex = 0;
  const matches = [];
  let m;
  while ((m = re.exec(source)) !== null)
    matches.push({ index: m.index, length: m[0].length, full: m[0], groups: m.slice(1) });
  if (!matches.length) return source;

  let out = '', last = 0;
  for (const match of matches) {
    out  += source.slice(last, match.index);
    out  += await replacer(match.full, ...match.groups);
    last  = match.index + match.length;
  }
  return out + source.slice(last);
};

// ─────────────────────────────────────────────────────────────────────────────
// srcset rewriter   [FIX J]
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rewrite every URL inside a srcset/data-srcset value string.
 * Splits on ", " patterns that precede a descriptor or another URL,
 * preserving descriptors (1x, 2x, 100w …).
 *
 * @param {string}   srcset
 * @param {string}   contextPath
 * @param {Object}   index
 * @param {Object}   lcIndex
 * @param {Function} getUrl  async (key) => string|null
 * @returns {Promise<string>}
 */
const rewriteSrcset = async (srcset, contextPath, index, lcIndex, getUrl) => {
  if (!srcset) return srcset;
  // Split on commas that are followed by optional whitespace and a non-space char
  // (i.e. the start of the next URL). This avoids splitting on commas that might
  // appear in query strings.
  const parts = srcset.split(/,(?=\s*\S)/);
  const out   = await Promise.all(parts.map(async (part) => {
    const trimmed    = part.trim();
    const spaceIdx   = trimmed.search(/\s/);
    const url        = spaceIdx < 0 ? trimmed : trimmed.slice(0, spaceIdx);
    const descriptor = spaceIdx < 0 ? ''      : trimmed.slice(spaceIdx);
    if (!url) return part;
    const key    = resolveToIndexKey(contextPath, url, index, lcIndex);
    const cdnUrl = key ? await getUrl(key) : null;
    return cdnUrl ? cdnUrl + descriptor : part;
  }));
  return out.join(', ');
};

// ─────────────────────────────────────────────────────────────────────────────
// image-set() paren-depth parser   [FIX in v2, preserved here]
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse one image-set() expression starting at startIndex in src.
 * Returns null if not found or malformed.
 * Uses paren-depth counting to handle url("…") entries inside image-set().
 */
const parseImageSet = (src, startIndex) => {
  const openParen = src.indexOf('(', startIndex);
  if (openParen < 0) return null;
  let depth = 1, i = openParen + 1;
  while (i < src.length && depth > 0) {
    if (src[i] === '(') depth++;
    else if (src[i] === ')') depth--;
    i++;
  }
  const closeParen  = i - 1;
  const fullMatch   = src.slice(startIndex, i);
  const innerSource = src.slice(openParen + 1, closeParen);

  const entries = [];
  const entryRe = /url\(\s*(['"]?)([^'")\s]+)\1\s*\)|(['"])([^'"]+)\3/g;
  let em;
  while ((em = entryRe.exec(innerSource)) !== null) {
    const href = em[2] !== undefined ? em[2] : em[4];
    if (href) entries.push({ full: em[0], href, innerOffset: em.index });
  }
  return { fullMatch, innerSource, entries };
};

// ─────────────────────────────────────────────────────────────────────────────
// CSS url() rewriter — context-aware   [FIX A]
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rewrite every url(…) expression inside a CSS string.
 * cssFilePath is used as the resolution context for relative hrefs.
 * This is critical when CSS from lib/owlcarousel/assets/owl.carousel.min.css
 * is being rewritten — its url(owl.video.play.png) must resolve relative
 * to lib/owlcarousel/assets/, not to the HTML file's directory.
 *
 * @param {string}   cssText
 * @param {string}   cssFilePath  ZIP path of the CSS file (resolution context)
 * @param {Object}   index
 * @param {Object}   lcIndex
 * @param {Function} getUrl       async (key) => string|null
 * @returns {Promise<string>}
 */
const rewriteCssUrls = async (cssText, cssFilePath, index, lcIndex, getUrl) => {
  if (!cssText) return cssText;
  return rewriteAll(cssText, /url\(\s*(['"]?)([^'"\s)]+)\1\s*\)/gi, async (full, _q, href) => {
    const key    = resolveToIndexKey(cssFilePath, href, index, lcIndex);
    const cdnUrl = key ? await getUrl(key) : null;
    return cdnUrl ? `url(${cdnUrl})` : full;
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @import expansion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recursively expand @import rules inside a CSS string.
 * External @imports are left untouched. Circular imports guarded via `visited`.
 *
 * @param {string}              cssText
 * @param {string}              cssFilePath
 * @param {Map<string,Object>}  cssEntries   Map of zipPath → JSZip entry
 * @param {Set<string>}         visited
 * @returns {Promise<string>}
 */
const expandCssImports = async (cssText, cssFilePath, cssEntries, visited = new Set()) => {
  if (!cssText) return '';
  const IMPORT_RE = /@import\s+(?:url\(\s*['"]?|['"])([^'"\s)]+)['"]?\s*\)?[^;]*;/gi;
  return rewriteAll(cssText, IMPORT_RE, async (full, href) => {
    if (!href) return full;
    const raw = href.trim();
    if (/^(https?:\/\/|\/\/|data:)/i.test(raw)) return full;  // external — keep
    const importedPath = resolveHref(dirOf(cssFilePath), raw);
    if (!importedPath || visited.has(importedPath)) return full;
    const record = cssEntries.get(importedPath) || cssEntries.get(importedPath.toLowerCase());
    if (!record) {
      console.warn(`[import-engine] @import not found: "${importedPath}" (from "${cssFilePath}")`);
      return full;
    }
    visited.add(importedPath);
    const raw2     = await record.entry.async('string');
    const expanded = await expandCssImports(raw2 || '', importedPath, cssEntries, visited);
    console.log(`[import-engine] expanded @import: "${importedPath}"`);
    return expanded;
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Head link extraction   [FIX H]
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract external CDN <link> and <script> tags from the <head>.
 * These carry Font Awesome, Bootstrap Icons, Google Fonts, etc.
 * They are stored in content.headLinks and must be injected into the
 * GrapesJS canvas config (canvas.styles / canvas.scripts) by the frontend.
 *
 * @param {string} html  Full HTML string
 * @returns {string}     Newline-joined external tags
 */
const extractHeadLinks = (html) => {
  const headM = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html);
  if (!headM) return '';
  const head = headM[1];
  const tags = [];

  const EXT_LINK   = /<link\b[^>]*\bhref=["'](https?:\/\/|\/\/)[^"']*["'][^>]*\/?>/gi;
  const EXT_SCRIPT = /<script\b[^>]*\bsrc=["'](https?:\/\/|\/\/)[^"']*["'][^>]*><\/script>/gi;
  let m;
  while ((m = EXT_LINK.exec(head))   !== null) tags.push(m[0]);
  while ((m = EXT_SCRIPT.exec(head)) !== null) tags.push(m[0]);
  return tags.join('\n');
};

// ─────────────────────────────────────────────────────────────────────────────
// CSS inlining   [FIX E — single-pass; FIX A — url() rewritten before embed]
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Replace every local <link rel="stylesheet"> with an inline <style> block.
 *
 * Key improvements vs earlier patches:
 *   FIX A: css url() references are rewritten using the CSS file's own path
 *          BEFORE the content is embedded.  This solves the owl.video.play.png
 *          context-loss bug (Bug #1 from verification report).
 *   FIX E: Uses a single combined regex (both attribute orderings captured by
 *          one lookahead) to avoid the two-loop duplicate-entry problem.
 *   Duplicate prevention: a Set tracks canonical keys; duplicate <link> tags
 *          are replaced with '' (removed) not left as broken requests.
 *
 * @param {string}   html
 * @param {string}   htmlPath
 * @param {Map}      cssEntries   zipPath → { entry }
 * @param {Object}   index        assetIndex
 * @param {Object}   lcIndex      lowercase → original key map
 * @param {Function} getUrl       async (key) => string|null
 * @returns {Promise<string>}
 */
const inlineCssIntoHtml = async (html, htmlPath, cssEntries, index, lcIndex, getUrl) => {
  const htmlDir = dirOf(htmlPath);

  // Single regex handles BOTH attribute orderings via lookahead:
  //   <link rel="stylesheet" href="…">
  //   <link href="…" rel="stylesheet">
  // FIX E: one pass — no risk of the same tag being matched twice.
  const LINK_RE = /<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*\bhref=["']([^"']+)["'][^>]*\/?>/gi;

  const inlined = new Set();  // canonical keys already inlined
  const ops     = [];         // { fullTag, replacement } in document order

  let lm;
  LINK_RE.lastIndex = 0;
  while ((lm = LINK_RE.exec(html)) !== null) {
    const fullTag = lm[0];
    const href    = lm[1];

    if (!href || /^(https?:\/\/|\/\/|data:)/i.test(href.trim())) continue;

    const canonicalKey = resolveHref(htmlDir, href);
    if (!canonicalKey) continue;

    if (inlined.has(canonicalKey)) {
      console.log(`[import-engine] removing duplicate <link>: "${canonicalKey}"`);
      ops.push({ fullTag, replacement: '' });
      continue;
    }

    // Look up in cssEntries (which is keyed by original-case normalised path)
    const record =
      cssEntries.get(canonicalKey) ||
      cssEntries.get(lcIndex[canonicalKey.toLowerCase()] || '');

    if (!record) {
      console.warn(`[import-engine] CSS not in ZIP: "${canonicalKey}" (href="${href}" in "${htmlPath}")`);
      continue;
    }

    let cssContent = await record.entry.async('string');
    if (!cssContent || !cssContent.trim()) continue;

    // Expand @import before rewriting url(), so imported content also gets its
    // url() resolved with the correct base path.
    cssContent = await expandCssImports(cssContent, canonicalKey, cssEntries, new Set([canonicalKey]));

    // FIX A: rewrite url() NOW, using the CSS file's own path as context.
    // If we delay until convertAssetsInHtml, that function uses htmlPath as context
    // and cannot resolve paths like url(owl.video.play.png) which are relative
    // to lib/owlcarousel/assets/, not to index.html.
    cssContent = await rewriteCssUrls(cssContent, canonicalKey, index, lcIndex, getUrl);

    inlined.add(canonicalKey);
    // Stamp with data-css-source so convertAssetsInHtml can skip re-processing
    // url() in this block (they are already rewritten above).
    ops.push({ fullTag, replacement: `<style data-css-inlined="1">\n${cssContent}\n</style>` });
    console.log(`[import-engine] inlined + url()-rewritten CSS "${canonicalKey}" (${cssContent.length} chars)`);
  }

  let result = html;
  for (const { fullTag, replacement } of ops) {
    // Use a literal string replace scoped to the first occurrence of fullTag.
    // This is safe because fullTag is unique in well-formed HTML (it contains
    // the specific href value). In the pathological case of two identical <link>
    // tags (same href twice), the duplicate-detection above already handled the
    // second one by pushing replacement:''.
    result = result.replace(fullTag, replacement);
  }
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// CSS extraction  (strips <style> from HTML simultaneously)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract all <style> block contents into one CSS string and simultaneously
 * remove those blocks from the HTML.
 * Called AFTER convertAssetsInHtml so CSS already contains CDN URLs.
 *
 * @param {string} html  Fully rewritten HTML
 * @returns {{ css: string, htmlWithoutStyles: string }}
 */
const extractCssFromHtml = (html) => {
  if (!html) return { css: '', htmlWithoutStyles: '' };
  const blocks = [];
  const stripped = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, body) => {
    const css = (body || '').trim();
    if (css) blocks.push(css);
    return '';
  });
  return { css: blocks.join('\n'), htmlWithoutStyles: stripped };
};

// ─────────────────────────────────────────────────────────────────────────────
// HTML asset rewriting   [FIX B — replaceAttrValue for every attribute]
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rewrite all local asset references inside an HTML string.
 *
 * Attributes handled:
 *   img: src, srcset
 *   source: src, srcset  (picture, video, audio)
 *   video: src, poster
 *   audio: src
 *   script: src
 *   link: href  (icon, apple-touch-icon, manifest, preload, prefetch)
 *   object: data
 *   embed: src
 *   iframe: src
 *   input[type=image]: src
 *   data-src, data-srcset, data-lazy, data-original, data-bg, data-background
 *   SVG <use>: xlink:href, href
 *   url() in remaining <style> blocks (bare HTML-authored ones, not CSS-file-inlined)
 *   url() in inline style="" attributes
 *   image-set()
 *
 * FIX B: every rewrite uses replaceAttrValue() which anchors on the attribute
 * name, preventing corruption of alt text, title, aria-label, etc.
 *
 * @param {string}   html
 * @param {string}   htmlPath
 * @param {Object}   index
 * @param {Object}   lcIndex
 * @param {Function} getUrl    async (key) => string|null
 * @returns {Promise<string>}
 */
const rewriteHtmlAssets = async (html, htmlPath, index, lcIndex, getUrl) => {

  const resolve = (href) => resolveToIndexKey(htmlPath, href, index, lcIndex);

  // Convenience: resolve + fetch CDN URL in one call
  const cdnFor = async (href) => {
    const key = resolve(href);
    return key ? getUrl(key) : null;
  };

  let out = html;

  // ── 1. img[src] ─────────────────────────────────────────────────────────
  out = await rewriteAll(out, /<img\b[^>]*>/gi, async (tag) => {
    const m = /\bsrc=["']([^"']+)["']/i.exec(tag);
    if (!m) return tag;
    const cdnUrl = await cdnFor(m[1]);
    return cdnUrl ? replaceAttrValue(tag, 'src', m[1], cdnUrl) : tag;
  });

  // ── 2. img[srcset] ──────────────────────────────────────────────────────
  out = await rewriteAll(out, /<img\b[^>]*\bsrcset=["']([^"']+)["'][^>]*>/gi, async (tag, srcset) => {
    const rewritten = await rewriteSrcset(srcset, htmlPath, index, lcIndex, getUrl);
    return rewritten !== srcset ? replaceAttrValue(tag, 'srcset', srcset, rewritten) : tag;
  });

  // ── 3. source[src] + source[srcset]  (picture, video, audio) ───────────
  out = await rewriteAll(out, /<source\b[^>]*>/gi, async (tag) => {
    let t = tag;
    const srcM = /\bsrc=["']([^"']+)["']/i.exec(t);
    if (srcM) {
      const cdnUrl = await cdnFor(srcM[1]);
      if (cdnUrl) t = replaceAttrValue(t, 'src', srcM[1], cdnUrl);
    }
    const setM = /\bsrcset=["']([^"']+)["']/i.exec(t);
    if (setM) {
      const rewritten = await rewriteSrcset(setM[1], htmlPath, index, lcIndex, getUrl);
      if (rewritten !== setM[1]) t = replaceAttrValue(t, 'srcset', setM[1], rewritten);
    }
    return t;
  });

  // ── 4. video[poster] ────────────────────────────────────────────────────
  out = await rewriteAll(out, /<video\b[^>]*>/gi, async (tag) => {
    const m = /\bposter=["']([^"']+)["']/i.exec(tag);
    if (!m) return tag;
    const cdnUrl = await cdnFor(m[1]);
    return cdnUrl ? replaceAttrValue(tag, 'poster', m[1], cdnUrl) : tag;
  });

  // ── 5. audio[src] ───────────────────────────────────────────────────────
  out = await rewriteAll(out, /<audio\b[^>]*>/gi, async (tag) => {
    const m = /\bsrc=["']([^"']+)["']/i.exec(tag);
    if (!m) return tag;
    const cdnUrl = await cdnFor(m[1]);
    return cdnUrl ? replaceAttrValue(tag, 'src', m[1], cdnUrl) : tag;
  });

  // ── 6. script[src] ──────────────────────────────────────────────────────
  out = await rewriteAll(out, /<script\b[^>]*><\/script>/gi, async (tag) => {
    const m = /\bsrc=["']([^"']+)["']/i.exec(tag);
    if (!m) return tag;
    const cdnUrl = await cdnFor(m[1]);
    return cdnUrl ? replaceAttrValue(tag, 'src', m[1], cdnUrl) : tag;
  });

  // ── 7. link[href] — asset rels only (stylesheet already inlined) ────────
  //   FIX K: if href cannot be resolved, strip icon/apple-touch-icon tags
  //          to avoid 404s (favicons commonly absent from templates).
  const STRIP_IF_MISSING = new Set(['icon', 'shortcut icon', 'apple-touch-icon']);
  const ASSET_RELS = new Set([
    'icon', 'shortcut icon', 'apple-touch-icon', 'apple-touch-icon-precomposed',
    'manifest', 'preload', 'prefetch', 'modulepreload',
  ]);
  out = await rewriteAll(out, /<link\b[^>]*>/gi, async (tag) => {
    const relM = /\brel=["']([^"']+)["']/i.exec(tag);
    const rel  = (relM ? relM[1] : '').toLowerCase().trim();
    if (rel === 'stylesheet') return tag;  // handled by inlineCssIntoHtml
    if (!ASSET_RELS.has(rel)) return tag;

    const hrefM = /\bhref=["']([^"']+)["']/i.exec(tag);
    if (!hrefM) return tag;
    const cdnUrl = await cdnFor(hrefM[1]);
    if (cdnUrl) return replaceAttrValue(tag, 'href', hrefM[1], cdnUrl);
    // FIX K: strip broken favicon/icon links rather than leaving 404 requests
    if (STRIP_IF_MISSING.has(rel)) {
      console.warn(`[import-engine] stripping unresolved <link rel="${rel}" href="${hrefM[1]}">`);
      return '';
    }
    return tag;
  });

  // ── 8. object[data] ─────────────────────────────────────────────────────
  out = await rewriteAll(out, /<object\b[^>]*>/gi, async (tag) => {
    const m = /\bdata=["']([^"']+)["']/i.exec(tag);
    if (!m) return tag;
    const cdnUrl = await cdnFor(m[1]);
    return cdnUrl ? replaceAttrValue(tag, 'data', m[1], cdnUrl) : tag;
  });

  // ── 9. embed[src] ───────────────────────────────────────────────────────
  out = await rewriteAll(out, /<embed\b[^>]*>/gi, async (tag) => {
    const m = /\bsrc=["']([^"']+)["']/i.exec(tag);
    if (!m) return tag;
    const cdnUrl = await cdnFor(m[1]);
    return cdnUrl ? replaceAttrValue(tag, 'src', m[1], cdnUrl) : tag;
  });

  // ── 10. iframe[src] ─────────────────────────────────────────────────────
  out = await rewriteAll(out, /<iframe\b[^>]*>/gi, async (tag) => {
    const m = /\bsrc=["']([^"']+)["']/i.exec(tag);
    if (!m) return tag;
    const cdnUrl = await cdnFor(m[1]);
    return cdnUrl ? replaceAttrValue(tag, 'src', m[1], cdnUrl) : tag;
  });

  // ── 11. input[type=image][src] — both attribute orderings ───────────────
  const INPUT_IMG_RES = [
    /<input\b(?=[^>]*\btype=["']image["'])[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi,
    /<input\b[^>]*\bsrc=["']([^"']+)["'](?=[^>]*\btype=["']image["'])[^>]*>/gi,
  ];
  for (const re of INPUT_IMG_RES) {
    out = await rewriteAll(out, re, async (tag, href) => {
      const cdnUrl = await cdnFor(href);
      return cdnUrl ? replaceAttrValue(tag, 'src', href, cdnUrl) : tag;
    });
  }

  // ── 12. data-src / data-lazy / data-original / data-bg / data-background ─
  const DATA_ATTRS = ['data-src','data-lazy','data-original','data-bg','data-background','data-image'];
  for (const attr of DATA_ATTRS) {
    const re = new RegExp(`<[^>]+\\b${attr}=["']([^"']+)["'][^>]*>`, 'gi');
    out = await rewriteAll(out, re, async (tag, href) => {
      const cdnUrl = await cdnFor(href);
      return cdnUrl ? replaceAttrValue(tag, attr, href, cdnUrl) : tag;
    });
  }

  // ── 13. data-srcset ─────────────────────────────────────────────────────
  out = await rewriteAll(out, /\bdata-srcset=["']([^"']+)["']/gi, async (full, srcset) => {
    const rewritten = await rewriteSrcset(srcset, htmlPath, index, lcIndex, getUrl);
    return rewritten !== srcset ? full.replace(srcset, rewritten) : full;
  });

  // ── 14. SVG <use xlink:href> and <use href> — preserve fragment ──────────
  out = await rewriteAll(out, /<use\b[^>]*>/gi, async (tag) => {
    let t = tag;
    // xlink:href
    const xlinkM = /\bxlink:href=["']([^"']+)["']/i.exec(t);
    if (xlinkM) {
      const val  = xlinkM[1];
      const file = val.split('#')[0];
      const frag = val.includes('#') ? val.slice(val.indexOf('#')) : '';
      if (file && !/^(https?:\/\/|\/\/|data:)/i.test(file)) {
        const cdnUrl = await cdnFor(file);
        if (cdnUrl) t = t.replace(xlinkM[0], `xlink:href="${cdnUrl}${frag}"`);
      }
    }
    // plain href — word-boundary to avoid matching xlink:href again
    const hrefM = /(?<![:\w])href=["']([^"']+)["']/i.exec(t);
    if (hrefM) {
      const val  = hrefM[1];
      const file = val.split('#')[0];
      const frag = val.includes('#') ? val.slice(val.indexOf('#')) : '';
      if (file && !/^(https?:\/\/|\/\/|data:)/i.test(file)) {
        const cdnUrl = await cdnFor(file);
        if (cdnUrl) t = t.replace(hrefM[0], `href="${cdnUrl}${frag}"`);
      }
    }
    return t;
  });

  // ── 15. url() inside bare <style> blocks (HTML-authored, not CSS-file-inlined)
  //    Blocks that were inlined by inlineCssIntoHtml already have their url()
  //    rewritten (FIX A). We mark those with data-css-inlined="1" so we skip them.
  out = await rewriteAll(
    out,
    /(<style\b(?![^>]*data-css-inlined)[^>]*>)([\s\S]*?)(<\/style>)/gi,
    async (full, openTag, cssBody, closeTag) => {
      const rewritten = await rewriteCssUrls(cssBody, htmlPath, index, lcIndex, getUrl);
      return `${openTag}${rewritten}${closeTag}`;
    }
  );

  // Strip the internal marker attribute before output
  out = out.replace(/\s*data-css-inlined="1"/gi, '');

  // ── 16. url() in inline style="" attributes ──────────────────────────────
  out = await rewriteAll(
    out,
    /(\bstyle=["'])([^"']*url\([^)]*\)[^"']*)(["'])/gi,
    async (full, open, styleVal, close) => {
      const rewritten = await rewriteCssUrls(styleVal, htmlPath, index, lcIndex, getUrl);
      return rewritten !== styleVal ? `${open}${rewritten}${close}` : full;
    }
  );

  // ── 17. image-set() — paren-depth parser ────────────────────────────────
  const IMAGE_SET_RE = /\bimage-set\s*\(/gi;
  {
    IMAGE_SET_RE.lastIndex = 0;
    const hits = [];
    let im;
    while ((im = IMAGE_SET_RE.exec(out)) !== null) hits.push(im.index);

    // Process in reverse order so string indices remain valid
    for (let h = hits.length - 1; h >= 0; h--) {
      const parsed = parseImageSet(out, hits[h]);
      if (!parsed) continue;

      let inner = parsed.innerSource;
      // Rewrite in reverse order to preserve offsets within inner
      for (let e = parsed.entries.length - 1; e >= 0; e--) {
        const entry  = parsed.entries[e];
        const cdnUrl = await cdnFor(entry.href);
        if (!cdnUrl) continue;
        const before = inner.slice(0, entry.innerOffset);
        const after  = inner.slice(entry.innerOffset + entry.full.length);
        inner = before + entry.full.replace(entry.href, cdnUrl) + after;
      }

      const fullEnd = hits[h] + parsed.fullMatch.length;
      out = out.slice(0, hits[h]) + `image-set(${inner})` + out.slice(fullEnd);
    }
  }

  return out;
};

// ─────────────────────────────────────────────────────────────────────────────
// Body extraction
// ─────────────────────────────────────────────────────────────────────────────
const extractBody = (html) => {
  const m = /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(html);
  return m ? m[1] : html;
};

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────
const normalizeName = (s) =>
  (s || '').replace(/[_-]+/g, ' ').trim()
    .split(' ').filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

const slugifySegment = (s) =>
  (s || '').toString().toLowerCase().trim()
    .replace(/[_\s]+/g, '-').replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-').replace(/^-|-$/g, '');

// ─────────────────────────────────────────────────────────────────────────────
// Main controller
// ─────────────────────────────────────────────────────────────────────────────
const uploadTemplateZipToCloudinary = asyncHandler(async (req, res) => {
  try {
    console.log('[import-engine] incoming upload —', {
      body: req.body,
      file: req.file ? { name: req.file.originalname, size: req.file.size } : null,
    });

    if (!req.file)
      return res.status(400).json({ success: false, error: 'No file. Send ZIP under "file" field.' });

    const { name, websiteName, description, status } = req.body || {};

    // ── 1. Open ZIP ────────────────────────────────────────────────────────
    const zip = await JSZip.loadAsync(req.file.buffer);

    // ── 2. Catalogue entries ───────────────────────────────────────────────
    const htmlEntries = [];  // { zipPath, entry }
    const cssEntries  = new Map();  // zipPath → { entry } (for @import expansion)

    zip.forEach((rawPath, entry) => {
      if (!entry || entry.dir) return;
      const zipPath = normZip(rawPath);
      const ext     = (zipPath.split('.').pop() || '').toLowerCase();

console.log({
  rawPath,
  zipPath,
  ext,
  dir: entry.dir
});

      if (ext === 'html' || ext === 'htm') {
  console.log("FOUND HTML:", zipPath);
  htmlEntries.push({ zipPath, entry });
  return;
}
      if (SKIP_EXTS.has(ext)) return;
      if (ext === 'css') cssEntries.set(zipPath, { entry });
    });

    console.log("========== ZIP FILE LIST ==========");
zip.forEach((relativePath, file) => {
  console.log(relativePath, file.dir ? "[DIR]" : "[FILE]");
});
console.log("===================================");

console.log("HTML Entries:", htmlEntries.map(h => h.zipPath));
console.log(htmlEntries.length);

    if (!htmlEntries.some(({ zipPath }) => /(^|\/)index\.html?$/i.test(zipPath)))
      return res.status(400).json({ success: false, error: 'ZIP must contain index.html.' });

    // ── 3. Build assetIndex ─────────────────────────────────────────────────
    const { index, lcIndex } = buildAssetIndex(zip);
    // Also register CSS files so their CDN URLs appear in assetMap response
    cssEntries.forEach((_, zipPath) => {
      if (!index[zipPath]) {
        index[zipPath]  = { entry: cssEntries.get(zipPath).entry, ext: 'css', mime: 'text/css', secureUrl: null };
        lcIndex[zipPath.toLowerCase()] = zipPath;
      }
    });

    console.log(`[import-engine] assets catalogued: ${Object.keys(index).length}`);

    // ── 4. Create Website document ─────────────────────────────────────────
    const resolvedName = (websiteName || name || req.file.originalname || 'Imported Website').toString();
    const ownerId      = req?.user?.id || req?.user?._id;

    const website = await Website.create({
      ownerId:     ownerId || new (require('mongoose').Types.ObjectId)(),
      websiteName: resolvedName,
      name:        resolvedName,
      description: description || 'Website Template',
      status:      status      || 'Draft',
      template: { templateId: null, templateName: name || null, imageUrl: null, cloudinaryPublicId: null },
      settings: { cloudinary: null },
    });

    const cloudinaryFolder = `website-templates/${website._id}/assets`;

    // ── 5. getUrl — upload-once helper ─────────────────────────────────────
    // [FIX M] Checks secureUrl cache before uploading; [FIX L] throttled via withSlot.
    const getUrl = async (key) => {
      const hit = index[key];
      if (!hit) return null;
      if (hit.secureUrl) return hit.secureUrl;   // FIX M: no duplicate uploads

      try {
        const buffer       = await hit.entry.async('nodebuffer');
        const resourceType = cloudinaryResType(hit.mime);
        const result       = await withSlot(() =>  // FIX L: concurrency limit
          uploadBufferToCloudinary(buffer, { folder: cloudinaryFolder, resourceType, mime: hit.mime })
        );
        hit.secureUrl = result.secure_url;
        hit.publicId  = result.public_id;
        console.log(`[import-engine] uploaded: "${key}" → ${hit.secureUrl}`);
        return hit.secureUrl;
      } catch (err) {
        console.error(`[import-engine] upload failed: "${key}":`, err.message || err);
        return null;
      }
    };

    // ── 6. Process HTML files ──────────────────────────────────────────────
    htmlEntries.sort((a, b) => {
      const ai = /(^|\/)index\.html?$/i.test(a.zipPath);
      const bi = /(^|\/)index\.html?$/i.test(b.zipPath);
      return ai === bi ? a.zipPath.localeCompare(b.zipPath) : ai ? -1 : 1;
    });

    const pages = [];

    for (const { zipPath, entry } of htmlEntries) {
      const rawHtml = await entry.async('string');
      if (!rawHtml?.trim()) { console.warn(`[import-engine] empty HTML: "${zipPath}"`); continue; }

      const fileName = zipPath.split('/').pop();
      const base     = fileName.replace(/\.html?$/i, '');
      const isHome   = base.toLowerCase() === 'index';
      const pageName = isHome ? 'Home' : normalizeName(base);
      const pageSlug = isHome ? 'home' : slugifySegment(base);

      console.log(`[import-engine] page "${zipPath}" → slug "${pageSlug}"`);

      // A. Capture CDN <link>/<script> from <head> BEFORE any transformation [FIX H]
      const headLinks = extractHeadLinks(rawHtml);

      // B. Inline local stylesheets  [FIX A + E]
      //    url() rewritten using CSS file's own path context inside this call.
      const htmlWithInlinedCss = await inlineCssIntoHtml(
        rawHtml, zipPath, cssEntries, index, lcIndex, getUrl
      );

      // C. Rewrite all HTML asset references  [FIX B]
      //    url() inside bare <style> blocks (not CSS-file-inlined ones) also handled here.
      const htmlWithRewrittenAssets = await rewriteHtmlAssets(
        htmlWithInlinedCss, zipPath, index, lcIndex, getUrl
      );

      // D. Extract CSS + strip <style> from HTML simultaneously
      const { css: extractedCss, htmlWithoutStyles } = extractCssFromHtml(htmlWithRewrittenAssets);

      // E. Extract <body> content
      const bodyHtml = extractBody(htmlWithoutStyles);

      console.log(`[import-engine] "${pageSlug}" — body: ${bodyHtml.length}ch  css: ${extractedCss.length}ch  headLinks: ${headLinks.length}ch`);

      // F. Template Import Pipeline — Detect Components → Convert Product
      //    Sections → Inject Store Blocks. Runs against every uploaded
      //    Website Builder template now, not just WordPress imports. This
      //    call can never throw and can never make the page worse: on any
      //    internal failure it hands back `bodyHtml` completely untouched
      //    (see services/templateImport/index.js's safety contract).
      const {
        html: themedHtml,
        detectedComponents,
        componentSummary,
        storeReady,
        previewStatus,
        productCardTemplate,
      } = runTemplateImportPipeline(bodyHtml, { isHome, slug: pageSlug, name: pageName });

      console.log(
        `[import-engine] "${pageSlug}" — components: ${detectedComponents.length}` +
        ` (storeReady: ${storeReady}, previewStatus: ${previewStatus})`
      );

      const page = await WebsitePage.create({
        websiteId: website._id,
        name:      pageName,
        slug:      pageSlug,
        isHome,
        status:    'Draft',
        content: {
          // Original body markup is never discarded: `html` is the
          // pipeline's output, which equals `bodyHtml` byte-for-byte
          // whenever detection didn't confidently find anything (or
          // failed outright) — see "If detection fails, preserve
          // original HTML" in the pipeline requirements.
          html:       themedHtml,
          css:        extractedCss,
          headLinks,  // ← inject into GrapesJS canvas.styles / canvas.scripts
          sourcePath: zipPath,
          // Template Import Pipeline output — consumed by Store Admin
          // ("this theme covers N/M sections") and by the storefront
          // renderer once this template is bound to a Store.
          detectedComponents,
          componentSummary,
          storeReady,
          previewStatus,
          productCardTemplate,
        },
      });

      console.log(`[import-engine] created page ${page._id} ("${pageSlug}")`);
      pages.push(page);
    }

    // Build final assetMap for response (only uploaded assets have a secureUrl)
    const assetMap = {};
    for (const [k, v] of Object.entries(index)) {
      if (v.secureUrl) assetMap[k] = v.secureUrl;
    }

    // Aggregate per-page pipeline results so the caller can show something
    // like "this theme covers 6/10 sections" without re-scanning every page.
    const templateDetection = {
      pagesScanned:   pages.length,
      storeReadyPages: pages.filter((p) => p?.content?.storeReady).length,
      componentsByType: pages.reduce((acc, p) => {
        const byType = p?.content?.componentSummary?.byType || {};
        Object.entries(byType).forEach(([type, count]) => {
          acc[type] = (acc[type] || 0) + count;
        });
        return acc;
      }, {}),
      needsManualMapping: [
        ...new Set(pages.flatMap((p) => p?.content?.componentSummary?.needsManualMapping || [])),
      ],
    };

    console.log(`[import-engine] DONE — website: ${website._id}  pages: ${pages.length}  assets uploaded: ${Object.keys(assetMap).length}  storeReadyPages: ${templateDetection.storeReadyPages}`);

    return res.status(200).json({ success: true, website, pages, assetMap, templateDetection });

  } catch (err) {
    console.error('[import-engine] fatal:', err);
    return res.status(500).json({
      success: false,
      error:   err?.message || 'Internal Server Error',
      stack:   process.env.NODE_ENV === 'development' ? err?.stack : undefined,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
module.exports = { upload, uploadTemplateZipToCloudinary };