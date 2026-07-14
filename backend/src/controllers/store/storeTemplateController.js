'use strict';

/**
 * storeTemplateController.js — Store Template Import Engine
 *
 * This is the Store-module counterpart of controllers/websiteTemplateController.js.
 * It is a deliberate 1:1 duplication of that file's ZIP-parsing / asset-rewriting
 * pipeline (per product requirement: "same pipeline, different collections").
 * The website controller is left completely untouched — this file writes to
 * its own Store / StorePage collections instead of Website / WebsitePage so
 * the two modules can evolve independently without risk of cross-breaking.
 *
 * Pipeline (identical stages to the website import engine):
 *   1. Open ZIP (JSZip)
 *   2. Catalogue HTML + CSS + uploadable asset entries
 *   3. Build a case-insensitive asset index
 *   4. Create the parent Store document
 *   5. Upload every referenced asset to Cloudinary once (concurrency-limited)
 *   6. For each HTML file: inline local CSS → rewrite asset refs → extract
 *      CSS/body → persist as a StorePage document (storeId relation)
 */

const multer  = require('multer');
const JSZip   = require('jszip');

const asyncHandler = require('../../utils/asyncHandler');
const Store        = require('../../models/store/Store');
const StorePage    = require('../../models/store/StorePage');
const { uploadBufferToCloudinary } = require('../../config/cloudinary');
const { minifyCss } = require('../../utils/minifyCss');
const { optimizeImageUrl } = require('../../utils/storeImageOptimizer');
const { runTemplateImportPipeline } = require('../../services/templateImplort');

// ─────────────────────────────────────────────────────────────────────────────
// Multer — in-memory, ZIP-only
//
// Shared by both upload entry points that ultimately call
// parseStoreTemplateZip: the manual "Upload template" flow
// (storeTemplatesRoutes.js) and the WordPress Import Pipeline
// (wordpressImportRoutes.js re-exports this exact `upload`) — see the
// comment there for why the two intentionally stay in sync.
//
// The compressed request payload limit is intentionally very high to
// support large static exports from WordPress/Simply Static, while the
// uncompressed-size validation pipeline still guards against zip bombs.
const MAX_UPLOAD_BYTES = 1024 * 1024 * 1024; // 1 GB

// Extension is the authoritative check — `file.mimetype` is a client-supplied
// header and unreliable (browsers/OSes send everything from
// "application/zip" to a generic "application/octet-stream" for the exact
// same .zip file), so it isn't trustworthy enough to gate on by itself.
const zipFileFilter = (req, file, cb) => {
  const isZipExt = /\.zip$/i.test(file.originalname || '');

  if (!isZipExt) {
    const err = new Error('Only .zip files are accepted.');
    err.statusCode = 400;
    return cb(err);
  }
  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    fields: 30,
    parts: 35,
    fieldNameSize: 100,
    fieldSize: 2 * 1024 * 1024, // 2 MB per non-file field
  },
  fileFilter: zipFileFilter,
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
// Cloudinary concurrency limiter — max 5 simultaneous uploads
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

const normZip = (p) =>
  (p || '').replace(/\\/g, '/').replace(/^\.\/?/, '').replace(/^\/+/, '');

const dirOf = (p) => {
  const n = normZip(p);
  const i = n.lastIndexOf('/');
  return i >= 0 ? n.slice(0, i + 1) : '';
};

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
// assetIndex + O(1) case-insensitive lookup index
// ─────────────────────────────────────────────────────────────────────────────
const buildAssetIndex = (zip) => {
  const index   = {};
  const lcIndex = {};

  zip.forEach((rawPath, entry) => {
    if (!entry || entry.dir) return;

    const zipPath = normZip(rawPath);

    const ext =
      zipPath.includes(".")
        ? zipPath.substring(zipPath.lastIndexOf(".") + 1).toLowerCase()
        : "";

    if (ext === "html" || ext === "htm") return;
    if (ext === "css") return;
    if (SKIP_EXTS.has(ext)) return;

    if (UPLOADABLE_EXTS.has(ext)) {
      const mime = getMime(ext);
      index[zipPath]                 = { entry, ext, mime, secureUrl: null };
      lcIndex[zipPath.toLowerCase()] = zipPath;
    }
  });

  return { index, lcIndex };
};

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

  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Attribute-safe value replacement
// ─────────────────────────────────────────────────────────────────────────────
const replaceAttrValue = (tagStr, attrName, oldValue, newValue) => {
  const escapedAttr = attrName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedVal  = oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(\\b${escapedAttr}=)(["'])${escapedVal}\\2`, 'i');
  return tagStr.replace(re, `$1$2${newValue}$2`);
};

// ─────────────────────────────────────────────────────────────────────────────
// Async string rewriter
// ─────────────────────────────────────────────────────────────────────────────
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
// srcset rewriter
// ─────────────────────────────────────────────────────────────────────────────
const rewriteSrcset = async (srcset, contextPath, index, lcIndex, getUrl) => {
  if (!srcset) return srcset;
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
// image-set() paren-depth parser
// ─────────────────────────────────────────────────────────────────────────────
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
// CSS url() rewriter — context-aware
// ─────────────────────────────────────────────────────────────────────────────
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
const expandCssImports = async (cssText, cssFilePath, cssEntries, visited = new Set()) => {
  if (!cssText) return '';
  const IMPORT_RE = /@import\s+(?:url\(\s*['"]?|['"])([^'"\s)]+)['"]?\s*\)?[^;]*;/gi;
  return rewriteAll(cssText, IMPORT_RE, async (full, href) => {
    if (!href) return full;
    const raw = href.trim();
    if (/^(https?:\/\/|\/\/|data:)/i.test(raw)) return full;
    const importedPath = resolveHref(dirOf(cssFilePath), raw);
    if (!importedPath || visited.has(importedPath)) return full;
    const record = cssEntries.get(importedPath) || cssEntries.get(importedPath.toLowerCase());
    if (!record) return full;
    visited.add(importedPath);
    const raw2     = await record.entry.async('string');
    const expanded = await expandCssImports(raw2 || '', importedPath, cssEntries, visited);
    return expanded;
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Head link extraction
// ─────────────────────────────────────────────────────────────────────────────
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
// CSS inlining
// ─────────────────────────────────────────────────────────────────────────────
const inlineCssIntoHtml = async (html, htmlPath, cssEntries, index, lcIndex, getUrl) => {
  const htmlDir = dirOf(htmlPath);

  const LINK_RE = /<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*\bhref=["']([^"']+)["'][^>]*\/?>/gi;

  const inlined = new Set();
  const ops     = [];

  let lm;
  LINK_RE.lastIndex = 0;
  while ((lm = LINK_RE.exec(html)) !== null) {
    const fullTag = lm[0];
    const href    = lm[1];

    if (!href || /^(https?:\/\/|\/\/|data:)/i.test(href.trim())) continue;

    const canonicalKey = resolveHref(htmlDir, href);
    if (!canonicalKey) continue;

    if (inlined.has(canonicalKey)) {
      ops.push({ fullTag, replacement: '' });
      continue;
    }

    const record =
      cssEntries.get(canonicalKey) ||
      cssEntries.get(lcIndex[canonicalKey.toLowerCase()] || '');

    if (!record) continue;

    let cssContent = await record.entry.async('string');
    if (!cssContent || !cssContent.trim()) continue;

    cssContent = await expandCssImports(cssContent, canonicalKey, cssEntries, new Set([canonicalKey]));
    cssContent = await rewriteCssUrls(cssContent, canonicalKey, index, lcIndex, getUrl);

    inlined.add(canonicalKey);
    ops.push({ fullTag, replacement: `<style data-css-inlined="1">\n${cssContent}\n</style>` });
  }

  let result = html;
  for (const { fullTag, replacement } of ops) {
    result = result.replace(fullTag, replacement);
  }
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// CSS extraction (strips <style> from HTML simultaneously)
// ─────────────────────────────────────────────────────────────────────────────
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
// HTML asset rewriting
// ─────────────────────────────────────────────────────────────────────────────
const rewriteHtmlAssets = async (html, htmlPath, index, lcIndex, getUrl) => {

  const resolve = (href) => resolveToIndexKey(htmlPath, href, index, lcIndex);

  const cdnFor = async (href) => {
    const key = resolve(href);
    if (!key) return null;
    const url = await getUrl(key);
    // Image Optimization + Asset CDN: request an auto-format/auto-quality,
    // width-capped derivative from Cloudinary instead of the raw upload —
    // Cloudinary caches the derivative at the CDN edge after first request.
    return url ? optimizeImageUrl(url, 'f_auto,q_auto,w_1600,c_limit') : null;
  };

  let out = html;

  // img[src]
  out = await rewriteAll(out, /<img\b[^>]*>/gi, async (tag) => {
    const m = /\bsrc=["']([^"']+)["']/i.exec(tag);
    if (!m) return tag;
    const cdnUrl = await cdnFor(m[1]);
    let rewritten = cdnUrl ? replaceAttrValue(tag, 'src', m[1], cdnUrl) : tag;
    // Lazy Loading: native browser lazy-load for every storefront <img>
    // that doesn't already declare a loading attribute. (Uniform across
    // the page rather than special-casing the first/hero image — simple,
    // dependency-free, and matches what most page-builder exports do.)
    if (!/\bloading=/i.test(rewritten)) {
      rewritten = rewritten.replace(/^<img\b/i, '<img loading="lazy" decoding="async"');
    }
    return rewritten;
  });

  // img[srcset]
  out = await rewriteAll(out, /<img\b[^>]*\bsrcset=["']([^"']+)["'][^>]*>/gi, async (tag, srcset) => {
    const rewritten = await rewriteSrcset(srcset, htmlPath, index, lcIndex, getUrl);
    return rewritten !== srcset ? replaceAttrValue(tag, 'srcset', srcset, rewritten) : tag;
  });

  // source[src] + source[srcset]
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

  // video[poster]
  out = await rewriteAll(out, /<video\b[^>]*>/gi, async (tag) => {
    const m = /\bposter=["']([^"']+)["']/i.exec(tag);
    if (!m) return tag;
    const cdnUrl = await cdnFor(m[1]);
    return cdnUrl ? replaceAttrValue(tag, 'poster', m[1], cdnUrl) : tag;
  });

  // audio[src]
  out = await rewriteAll(out, /<audio\b[^>]*>/gi, async (tag) => {
    const m = /\bsrc=["']([^"']+)["']/i.exec(tag);
    if (!m) return tag;
    const cdnUrl = await cdnFor(m[1]);
    return cdnUrl ? replaceAttrValue(tag, 'src', m[1], cdnUrl) : tag;
  });

  // script[src]
  out = await rewriteAll(out, /<script\b[^>]*><\/script>/gi, async (tag) => {
    const m = /\bsrc=["']([^"']+)["']/i.exec(tag);
    if (!m) return tag;
    const cdnUrl = await cdnFor(m[1]);
    return cdnUrl ? replaceAttrValue(tag, 'src', m[1], cdnUrl) : tag;
  });

  // link[href] — asset rels only (stylesheet already inlined)
  const STRIP_IF_MISSING = new Set(['icon', 'shortcut icon', 'apple-touch-icon']);
  const ASSET_RELS = new Set([
    'icon', 'shortcut icon', 'apple-touch-icon', 'apple-touch-icon-precomposed',
    'manifest', 'preload', 'prefetch', 'modulepreload',
  ]);
  out = await rewriteAll(out, /<link\b[^>]*>/gi, async (tag) => {
    const relM = /\brel=["']([^"']+)["']/i.exec(tag);
    const rel  = (relM ? relM[1] : '').toLowerCase().trim();
    if (rel === 'stylesheet') return tag;
    if (!ASSET_RELS.has(rel)) return tag;

    const hrefM = /\bhref=["']([^"']+)["']/i.exec(tag);
    if (!hrefM) return tag;
    const cdnUrl = await cdnFor(hrefM[1]);
    if (cdnUrl) return replaceAttrValue(tag, 'href', hrefM[1], cdnUrl);
    if (STRIP_IF_MISSING.has(rel)) return '';
    return tag;
  });

  // object[data]
  out = await rewriteAll(out, /<object\b[^>]*>/gi, async (tag) => {
    const m = /\bdata=["']([^"']+)["']/i.exec(tag);
    if (!m) return tag;
    const cdnUrl = await cdnFor(m[1]);
    return cdnUrl ? replaceAttrValue(tag, 'data', m[1], cdnUrl) : tag;
  });

  // embed[src]
  out = await rewriteAll(out, /<embed\b[^>]*>/gi, async (tag) => {
    const m = /\bsrc=["']([^"']+)["']/i.exec(tag);
    if (!m) return tag;
    const cdnUrl = await cdnFor(m[1]);
    return cdnUrl ? replaceAttrValue(tag, 'src', m[1], cdnUrl) : tag;
  });

  // iframe[src]
  out = await rewriteAll(out, /<iframe\b[^>]*>/gi, async (tag) => {
    const m = /\bsrc=["']([^"']+)["']/i.exec(tag);
    if (!m) return tag;
    const cdnUrl = await cdnFor(m[1]);
    return cdnUrl ? replaceAttrValue(tag, 'src', m[1], cdnUrl) : tag;
  });

  // input[type=image][src] — both attribute orderings
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

  // data-src / data-lazy / data-original / data-bg / data-background
  const DATA_ATTRS = ['data-src','data-lazy','data-original','data-bg','data-background','data-image'];
  for (const attr of DATA_ATTRS) {
    const re = new RegExp(`<[^>]+\\b${attr}=["']([^"']+)["'][^>]*>`, 'gi');
    out = await rewriteAll(out, re, async (tag, href) => {
      const cdnUrl = await cdnFor(href);
      return cdnUrl ? replaceAttrValue(tag, attr, href, cdnUrl) : tag;
    });
  }

  // data-srcset
  out = await rewriteAll(out, /\bdata-srcset=["']([^"']+)["']/gi, async (full, srcset) => {
    const rewritten = await rewriteSrcset(srcset, htmlPath, index, lcIndex, getUrl);
    return rewritten !== srcset ? full.replace(srcset, rewritten) : full;
  });

  // SVG <use xlink:href> and <use href> — preserve fragment
  out = await rewriteAll(out, /<use\b[^>]*>/gi, async (tag) => {
    let t = tag;
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

  // url() inside bare <style> blocks (HTML-authored, not CSS-file-inlined)
  out = await rewriteAll(
    out,
    /(<style\b(?![^>]*data-css-inlined)[^>]*>)([\s\S]*?)(<\/style>)/gi,
    async (full, openTag, cssBody, closeTag) => {
      const rewritten = await rewriteCssUrls(cssBody, htmlPath, index, lcIndex, getUrl);
      return `${openTag}${rewritten}${closeTag}`;
    }
  );

  out = out.replace(/\s*data-css-inlined="1"/gi, '');

  // url() in inline style="" attributes
  out = await rewriteAll(
    out,
    /(\bstyle=["'])([^"']*url\([^)]*\)[^"']*)(["'])/gi,
    async (full, open, styleVal, close) => {
      const rewritten = await rewriteCssUrls(styleVal, htmlPath, index, lcIndex, getUrl);
      return rewritten !== styleVal ? `${open}${rewritten}${close}` : full;
    }
  );

  // image-set() — paren-depth parser
  const IMAGE_SET_RE = /\bimage-set\s*\(/gi;
  {
    IMAGE_SET_RE.lastIndex = 0;
    const hits = [];
    let im;
    while ((im = IMAGE_SET_RE.exec(out)) !== null) hits.push(im.index);

    for (let h = hits.length - 1; h >= 0; h--) {
      const parsed = parseImageSet(out, hits[h]);
      if (!parsed) continue;

      let inner = parsed.innerSource;
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
// Unbuilt SPA source detection — a dev-time Vite/CRA/similar index.html has
// an empty mount div (<div id="root"></div> / <div id="app"></div>) and a
// <script type="module" src="/src/..."> pointing at raw, un-bundled source.
// That combination never resolves to real markup outside a dev server or a
// production build, so it's a reliable, low-false-positive signal that a
// ZIP is a project's source tree rather than a pre-rendered static export.
// ─────────────────────────────────────────────────────────────────────────────
const SPA_MOUNT_DIV_RE = /<div\s+id=["'](?:root|app)["'][^>]*>\s*<\/div>/i;
const SPA_DEV_SCRIPT_RE = /<script\b[^>]*\btype=["']module["'][^>]*\bsrc=["']\/src\/[^"']+\.(?:jsx?|tsx?)["']/i;

const isUnbuiltSpaShell = (html) => SPA_MOUNT_DIV_RE.test(html) && SPA_DEV_SCRIPT_RE.test(html);

// ─────────────────────────────────────────────────────────────────────────────
// Shared parse pipeline — Extract -> Read HTML -> Read CSS -> Upload Images ->
// Generate ProjectData (page docs), independent of *what* the caller does
// with the result (create a live Store + StorePages, or save straight onto
// a StoreTemplate library entry). Both call sites below share this so the
// "Save StoreTemplate" pipeline can no longer skip Extract/Read/Upload.
//
// @param {Buffer} zipBuffer
// @param {string}  cloudinaryFolder - e.g. `store-templates/${id}/assets`
// @returns {Promise<{ pages: Array, assetMap: Object }>}
//   pages[i] = { name, slug, isHome, content: { html, css, headLinks, sourcePath } }
// ─────────────────────────────────────────────────────────────────────────────
const parseStoreTemplateZip = async (zipBuffer, { cloudinaryFolder }) => {
  // 1. Open ZIP
  const zip = await JSZip.loadAsync(zipBuffer);

  // 2. Catalogue entries
  const htmlEntries = [];
  const cssEntries  = new Map();

  zip.forEach((rawPath, entry) => {
    if (!entry || entry.dir) return;
    const zipPath = normZip(rawPath);
    const ext     = (zipPath.split('.').pop() || '').toLowerCase();

    if (ext === 'html' || ext === 'htm') {
      htmlEntries.push({ zipPath, entry });
      return;
    }
    if (SKIP_EXTS.has(ext)) return;
    if (ext === 'css') cssEntries.set(zipPath, { entry });
  });

  if (!htmlEntries.some(({ zipPath }) => /(^|\/)index\.html?$/i.test(zipPath))) {
    const error = new Error('ZIP must contain index.html.');
    error.statusCode = 400;
    throw error;
  }

  // Sort *before* picking "the" home entry below — a ZIP can contain more
  // than one file literally named index.html (nested app folders, stray
  // build output, node_modules docs, ...). This is the same ordering used
  // to build `pages` further down (home first, then alphabetical), so
  // whichever entry is checked here for the unbuilt-SPA-shell signature is
  // guaranteed to be the exact same one that ends up persisted as the
  // page's home — previously this check ran on `zip.forEach`'s raw
  // iteration order (whatever the ZIP's internal entry order happened to
  // be), which could name a completely different index.html than the one
  // the (separately, alphabetically) sorted main loop below actually
  // marked isHome — letting a broken SPA shell slip through undetected
  // whenever the ZIP had more than one index.html.
  htmlEntries.sort((a, b) => {
    const ai = /(^|\/)index\.html?$/i.test(a.zipPath);
    const bi = /(^|\/)index\.html?$/i.test(b.zipPath);
    return ai === bi ? a.zipPath.localeCompare(b.zipPath) : ai ? -1 : 1;
  });

  // A ZIP containing an *unbuilt* single-page-app's index.html (the
  // Vite/CRA/etc. dev-time shell — an empty mount div plus a
  // <script type="module" src="/src/..."> reference to raw source) has no
  // real markup to import: that script path only resolves once a dev
  // server compiles it on the fly, or after a production build bundles it
  // into real <script>/<link> tags. Importing it verbatim silently
  // produces a StoreTemplate/StorePage whose content is permanently
  // blank, since nothing will ever serve /src/main.jsx on the storefront.
  // Caught here, up front, before any Cloudinary uploads happen.
  {
    const homeEntry = htmlEntries[0];
    const homeHtml = homeEntry ? await homeEntry.entry.async('string') : '';
    if (isUnbuiltSpaShell(homeHtml)) {
      const error = new Error(
        'This ZIP looks like an unbuilt web app\'s source code (a Vite/React/similar ' +
        'dev index.html with an empty #root/#app div and a <script type="module" ' +
        'src="/src/...."> reference), not a pre-rendered static export. That script ' +
        'path only resolves during local development or after a production build — ' +
        'the page has no real markup until then. Run a production build (e.g. ' +
        '`npm run build`) and ZIP the generated output folder (e.g. dist/) instead, ' +
        'or export the live site with a static-export tool (e.g. the Simply Static ' +
        'plugin, or `wget --mirror`).'
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // 3. Build assetIndex
  const { index, lcIndex } = buildAssetIndex(zip);
  cssEntries.forEach((_, zipPath) => {
    if (!index[zipPath]) {
      index[zipPath]  = { entry: cssEntries.get(zipPath).entry, ext: 'css', mime: 'text/css', secureUrl: null };
      lcIndex[zipPath.toLowerCase()] = zipPath;
    }
  });

  // getUrl — upload-once helper ("Upload Images", plus fonts/JS/etc.)
  const getUrl = async (key) => {
    const hit = index[key];
    if (!hit) return null;
    if (hit.secureUrl) return hit.secureUrl;

    try {
      const buffer       = await hit.entry.async('nodebuffer');
      const resourceType = cloudinaryResType(hit.mime);
      const result       = await withSlot(() =>
        uploadBufferToCloudinary(buffer, { folder: cloudinaryFolder, resourceType, mime: hit.mime })
      );
      hit.secureUrl = result.secure_url;
      hit.publicId  = result.public_id;
      return hit.secureUrl;
    } catch (err) {
      console.error(`[store-import-engine] upload failed: "${key}":`, err.message || err);
      return null;
    }
  };

  // htmlEntries is already sorted (home candidate(s) first, then
  // alphabetical) from the guard above — process in that same order.
  const pages = [];

  // Only the single, already-identified `homeEntry` (htmlEntries[0], once
  // sorting has run) should ever be treated as the store's home page.
  // Previously every file literally named "index.html" anywhere in the
  // archive (nested app folders, build output, docs, ...) was marked
  // isHome independently — if more than one existed, multiple StorePage
  // documents could each end up isHome: true, and which one a preview or
  // storefront actually rendered as "home" became a coin flip between
  // them (including, in practice, one that was never checked by the
  // guard above). Tracking it explicitly here guarantees at most one page
  // is ever the home page, and that it's the exact page already vetted.
  let homeAssigned = false;

  for (const { zipPath, entry } of htmlEntries) {
    const rawHtml = await entry.async('string');
    if (!rawHtml?.trim()) continue;

    const fileName = zipPath.split('/').pop();
    const base     = fileName.replace(/\.html?$/i, '');
    const isHome   = !homeAssigned && base.toLowerCase() === 'index';
    if (isHome) homeAssigned = true;
    const pageName = isHome ? 'Home' : normalizeName(base);
    const pageSlug = isHome ? 'home' : slugifySegment(base);

    const headLinks = extractHeadLinks(rawHtml);

    const htmlWithInlinedCss = await inlineCssIntoHtml(
      rawHtml, zipPath, cssEntries, index, lcIndex, getUrl
    );

    const htmlWithRewrittenAssets = await rewriteHtmlAssets(
      htmlWithInlinedCss, zipPath, index, lcIndex, getUrl
    );

    const { css: extractedCss, htmlWithoutStyles } = extractCssFromHtml(htmlWithRewrittenAssets);

    const bodyHtmlRaw = extractBody(htmlWithoutStyles);

    // Store Block System — the SAME full 3-stage Template Import Pipeline
    // the WordPress Import path runs (services/templateImplort/index.js),
    // now also applied to manually uploaded Store Template ZIPs so static
    // product sections in *any* uploaded theme become dynamic
    // `data-store-block` regions with a seeded starting configuration —
    // not just detection with no config, and not just WordPress exports.
    // §6 "Entry-point convergence is a prerequisite": before this change,
    // this path called Stage 1 (`detectAndReplaceComponents`) directly,
    // so pages uploaded through it never got Stage 2's per-card field
    // tagging or Stage 3's `data-block-config` seeding — the redesign's
    // widened detection signals and count preservation only reached
    // WordPress-imported pages, not this one. Purely additive, same as
    // before: only ever adds attributes to elements that were already
    // there — layout, CSS, spacing, and markup structure are untouched.
    // Product card extraction (one template PER grid-family container
    // instance — checklist item 1) already runs INSIDE
    // runTemplateImportPipeline (Stage 3.5). Reusing its result here
    // instead of re-parsing/re-extracting the same HTML a second time
    // avoids a redundant cheerio parse per page (checklist item 9 —
    // "avoid repeated template extraction") and picks up the
    // `data-card-template-id` stamps the pipeline's `html` output now
    // carries, so multi-section pages render every section with its own
    // theme card, not just the first one found on the page.
    const {
      html: bodyHtml,
      detectedComponents,
      componentSummary: pageComponentSummary,
      storeReady: pageStoreReady,
      previewStatus: pagePreviewStatus,
      productCardTemplate,
      productCardTemplates,
    } = runTemplateImportPipeline(bodyHtmlRaw, {
      isHome: isHome,
      slug: pageSlug,
      name: pageName,
    });

    if (productCardTemplates?.length) {
      console.log(
        `[store-import-engine] ${productCardTemplates.length} productCardTemplate(s) extracted for page "${pageSlug}"`,
        `(types=${productCardTemplates.map((t) => t.containerType).join(',')})`
      );
    }

    pages.push({
      name: pageName,
      slug: pageSlug,
      isHome,
      content: {
        html:       bodyHtml,
        // Minified once at import time so every downstream consumer
        // (template library preview, store creation, publish snapshot)
        // ships the smaller payload — see utils/minifyCss.js.
        css:        minifyCss(extractedCss),
        headLinks,
        sourcePath: zipPath,
        detectedComponents,
        componentSummary: pageComponentSummary,
        storeReady: pageStoreReady,
        previewStatus: pagePreviewStatus,
        // Stored once at import time; used by ThemeRenderer's Theme-Aware
        // path to clone the theme's own card markup per product instead of
        // rendering a generic React component (see utils/productCardExtractor.js
        // and frontend/storefront/productCardRenderer.js).
        // productCardTemplate: back-compat single template (first found).
        // productCardTemplates: full per-container array — [] = no tagged
        // card found; ThemeRenderer falls back to the generic renderer.
        productCardTemplate,
        productCardTemplates: productCardTemplates || [],
      },
    });
  }

  const assetMap = {};
  for (const [k, v] of Object.entries(index)) {
    if (v.secureUrl) assetMap[k] = v.secureUrl;
  }

  return { pages, assetMap };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main controller — Store counterpart of uploadTemplateZipToCloudinary
// Persists to Store + StorePage instead of Website + WebsitePage.
// ─────────────────────────────────────────────────────────────────────────────
const uploadStoreTemplateZipToCloudinary = asyncHandler(async (req, res) => {
  try {
    console.log('[store-import-engine] incoming upload —', {
      body: req.body,
      file: req.file ? { name: req.file.originalname, size: req.file.size } : null,
    });

    if (!req.file)
      return res.status(400).json({ success: false, error: 'No file. Send ZIP under "file" field.' });

    const { name, storeName, description, status, installDemo } = req.body || {};

    // 4. Create Store document
    const resolvedName = (storeName || name || req.file.originalname || 'Imported Store').toString();
    const ownerId       = req?.user?.id || req?.user?._id;

    const store = await Store.create({
      ownerId:   ownerId || new (require('mongoose').Types.ObjectId)(),
      storeName: resolvedName,
      name:      resolvedName,
      description: description || 'Store Template',
      status:      status      || 'Draft',
      installDemo: installDemo === true || installDemo === 'true',
      template: { templateId: null, templateName: name || null, imageUrl: null, cloudinaryPublicId: null },
      settings: { cloudinary: null },
    });

    const cloudinaryFolder = `store-templates/${store._id}/assets`;

    // 1-3, 5-6. Extract -> Read HTML/CSS -> Upload Images -> Generate ProjectData
    const { pages: parsedPages, assetMap } = await parseStoreTemplateZip(req.file.buffer, { cloudinaryFolder });

    console.log(`[store-import-engine] assets uploaded: ${Object.keys(assetMap).length}`);

    const pages = await Promise.all(
      parsedPages.map((p) =>
        StorePage.create({
          storeId: store._id,
          name:    p.name,
          slug:    p.slug,
          isHome:  p.isHome,
          status:  'Draft',
          content: p.content,
        })
      )
    );

    console.log(`[store-import-engine] DONE — store: ${store._id}  pages: ${pages.length}  assets uploaded: ${Object.keys(assetMap).length}`);

    return res.status(200).json({ success: true, store, pages, assetMap });

  } catch (err) {
    console.error('[store-import-engine] fatal:', err);
    return res.status(err?.statusCode || 500).json({
      success: false,
      error:   err?.message || 'Internal Server Error',
      stack:   process.env.NODE_ENV === 'development' ? err?.stack : undefined,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
module.exports = { upload, uploadStoreTemplateZipToCloudinary, parseStoreTemplateZip };