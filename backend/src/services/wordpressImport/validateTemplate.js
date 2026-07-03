'use strict';

/**
 * validateTemplate.js
 * Stage 3 ("Validate Simply Static structure") of the WordPress Import
 * Pipeline — the one stage in this whole pipeline with genuinely new
 * business logic. Everything else either reuses the existing Store import
 * engine unmodified or is a thin wrapper around it (see uploadAssets.js).
 *
 * Two categories of checks, per the architecture doc:
 *
 *  A. Safety checks (hard rejects, non-negotiable):
 *     - executable/server-side file types (.php, .cgi, .py, .sh, ...)
 *     - server config files (.htaccess, .htpasswd)
 *     - path traversal ("../" segments)
 *     - zip-bomb / size sanity (uncompressed total, compression ratio)
 *
 *  B. Shape/recognition checks (confirms "this looks like a Simply Static
 *     export", informational + gating):
 *     - at least one index.html
 *     - at least one HTML file overall
 *     - WordPress-shaped asset paths (wp-content/, wp-includes/, wp-json/)
 *       — informational only, does not block import
 *     - external <form action="..."> pointing at the original WP domain
 *       — non-blocking warning only
 *
 * A failed safety or shape check aborts the entire import before any
 * Cloudinary upload or Mongo write happens — nothing partially imports.
 */

const { listEntries, discoverHtmlPages } = require('./discoverPages');

const FORBIDDEN_EXTS = new Set([
  'php', 'phtml', 'php3', 'php4', 'php5', 'php7', 'phar',
  'cgi', 'pl', 'py', 'rb', 'sh', 'exe', 'jsp', 'asp', 'aspx',
]);

const BLOCKED_FILENAMES = new Set(['.htaccess', '.htpasswd']);

const WORDPRESS_MARKERS = ['wp-content/', 'wp-includes/', 'wp-json/'];

// Uncompressed-total ceiling. Bounded well above the existing 50 MB multer
// (compressed) limit so it only ever fires on a genuinely anomalous archive.
const MAX_UNCOMPRESSED_BYTES = 500 * 1024 * 1024;

// A single entry expanding more than this multiple of its compressed size
// is treated as a decompression-bomb signal.
const MAX_COMPRESSION_RATIO = 200;

const FORM_ACTION_RE = /<form\b[^>]*\baction=["'](https?:\/\/[^"']+)["'][^>]*>/gi;

const hasPathTraversal = (rawPath) => {
  // Check the *raw* entry name, not the normZip'd zipPath: normZip's
  // leading "./" strip mangles a leading "../" into "./" (see
  // discoverPages.js), which would silently hide exactly the attack this
  // check exists to catch. Normalize backslashes only — nothing else —
  // before testing for a ".." path segment.
  const p = (rawPath || '').replace(/\\/g, '/');
  return /(^|\/)\.\.(\/|$)/.test(p);
};

/**
 * @param {import('jszip')} zip  a loaded JSZip instance (see extractZip.js)
 * @returns {Promise<{
 *   ok: boolean,
 *   errors: string[],
 *   warnings: string[],
 *   meta: {
 *     detectedAsWordPress: boolean,
 *     htmlFileCount: number,
 *     assetFileCount: number,
 *     totalUncompressedBytes: number,
 *     externalFormActionsFound: string[]
 *   }
 * }>}
 */
async function validateWordPressStructure(zip) {
  const errors = [];
  const warnings = [];
  const entries = listEntries(zip);

  let totalUncompressedBytes = 0;
  let detectedAsWordPress = false;
  let assetFileCount = 0;

  for (const { zipPath, rawPath, ext, uncompressedSize, compressedSize } of entries) {
    // ── Safety: path traversal (defense in depth — parseStoreTemplateZip's
    // own resolveHref/normZip already strip ".." during asset resolution,
    // but this rejects the *upload itself* outright). ──────────────────
    if (hasPathTraversal(rawPath)) {
      errors.push(`Unsafe path in archive: "${rawPath}".`);
      continue;
    }

    const baseName = zipPath.toLowerCase().split('/').pop();

    // ── Safety: executable / server-side file types ────────────────────
    if (FORBIDDEN_EXTS.has(ext)) {
      errors.push(`Executable/server-side file type not allowed: "${zipPath}".`);
    }

    // ── Safety: server config files ─────────────────────────────────────
    if (BLOCKED_FILENAMES.has(baseName)) {
      errors.push(`Server config file not allowed: "${zipPath}".`);
    }

    // ── Shape: WordPress-shaped asset path detection (informational) ───
    const lowerPath = zipPath.toLowerCase();
    if (WORDPRESS_MARKERS.some((marker) => lowerPath.includes(marker))) {
      detectedAsWordPress = true;
    }

    totalUncompressedBytes += uncompressedSize;

    // ── Safety: decompression-bomb ratio check (best-effort — only when
    // JSZip's internal size fields are available) ──────────────────────
    if (compressedSize > 0 && uncompressedSize / compressedSize > MAX_COMPRESSION_RATIO) {
      errors.push(`Suspicious compression ratio on "${zipPath}" — rejected as a possible decompression bomb.`);
    }

    if (ext && ext !== 'html' && ext !== 'htm') assetFileCount++;
  }

  // ── Safety: zip-bomb / size sanity (aggregate) ────────────────────────
  if (totalUncompressedBytes > MAX_UNCOMPRESSED_BYTES) {
    errors.push(
      `Archive is too large uncompressed (${Math.round(totalUncompressedBytes / (1024 * 1024))} MB) — limit is ${MAX_UNCOMPRESSED_BYTES / (1024 * 1024)} MB.`
    );
  }

  // ── Shape: HTML presence ───────────────────────────────────────────────
  const htmlPages = discoverHtmlPages(zip);
  const htmlFileCount = htmlPages.length;

  if (htmlFileCount === 0) {
    errors.push('No HTML pages found in this export.');
  } else if (!htmlPages.some((p) => p.isHome)) {
    errors.push("This doesn't look like a Simply Static export — no index.html found.");
  }

  // ── Shape: external form actions (non-blocking warning) ──────────────
  const externalFormActionsFound = new Set();
  for (const { ext, entry } of entries) {
    if (ext !== 'html' && ext !== 'htm') continue;
    const html = await entry.async('string');
    FORM_ACTION_RE.lastIndex = 0;
    let m;
    while ((m = FORM_ACTION_RE.exec(html)) !== null) externalFormActionsFound.add(m[1]);
  }
  if (externalFormActionsFound.size) {
    const sample = [...externalFormActionsFound].slice(0, 3).join(', ');
    warnings.push(
      `${externalFormActionsFound.size} form(s) still post to the original site and will need to be corrected manually: ${sample}${externalFormActionsFound.size > 3 ? ', …' : ''}`
    );
  }

  if (!detectedAsWordPress) {
    warnings.push(
      'Could not detect WordPress/Simply Static asset paths (wp-content, wp-includes, wp-json) — importing anyway as a generic static export.'
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    meta: {
      detectedAsWordPress,
      htmlFileCount,
      assetFileCount,
      totalUncompressedBytes,
      externalFormActionsFound: [...externalFormActionsFound],
    },
  };
}

module.exports = { validateWordPressStructure };
