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
 *     - server config files (.htaccess, .htpasswd)
 *     - path traversal ("../" segments)
 *     - zip-bomb / size sanity (uncompressed total, compression ratio)
 *
 *  A2. Safety — skip-and-warn (not a hard reject):
 *     - executable/server-side file types (.php, .cgi, .py, .sh, ...).
 *       These are never opened, executed, or uploaded by this pipeline —
 *       parseStoreTemplateZip only ever reads .html/.htm files and the
 *       explicit UPLOADABLE_EXTS asset whitelist (storeTemplateController.js)
 *       — so a stray theme/plugin file like "twentytwentyone/404.php"
 *       bundled alongside a real Simply Static export is inert dead weight,
 *       not a risk. It's excluded from the import and reported as a
 *       warning instead of aborting the whole upload.
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
 * A failed Category-A safety or shape check aborts the entire import before
 * any Cloudinary upload or Mongo write happens — nothing partially imports.
 * Category-A2 hits never abort the import — the offending file is just
 * skipped.
 */

const { listEntries, discoverHtmlPages } = require('./discoverPages');

const FORBIDDEN_EXTS = new Set([
  'php', 'phtml', 'php3', 'php4', 'php5', 'php7', 'phar',
  'cgi', 'pl', 'py', 'rb', 'sh', 'exe', 'jsp', 'asp', 'aspx',
]);

const BLOCKED_FILENAMES = new Set(['.htaccess', '.htpasswd']);
const BLOCKED_PATH_SEGMENTS = new Set(['wp-content/uploads', 'wp-content/plugins', 'wp-content/themes']);

const WORDPRESS_MARKERS = ['wp-content/', 'wp-includes/', 'wp-json/'];

// Path substrings that indicate commerce *data* (products/orders/
// customers) rather than theme/layout files — out of scope for this
// pipeline by design (see the scope-guard check in
// validateWordPressStructure below).
const COMMERCE_DATA_MARKERS = [
  'wp-json/wc/',
  'woocommerce_schema',
  'wc-order-export',
  'wc-product-export',
  'wc-customer-export',
  '/exports/orders',
  '/exports/products',
  '/exports/customers',
];

// Uncompressed-total ceiling. Bounded well above the existing 200 MB multer
// (compressed) limit so it only ever fires on a genuinely anomalous archive.
// The WordPress Simply Static exports we support often include a large number
// of uploaded assets and plugin/theme files, so use a more permissive ceiling
// than the old 500 MB default to avoid rejecting otherwise valid imports.
const MAX_UNCOMPRESSED_BYTES = 800 * 1024 * 1024;

// A single entry expanding more than this multiple of its compressed size
// is treated as a decompression-bomb signal.
const MAX_COMPRESSION_RATIO = 200;

const FORM_ACTION_RE = /<form\b[^>]*\baction=["'](https?:\/\/[^"']+)["'][^>]*>/gi;

// An unbuilt single-page-app's dev-time index.html — an empty #root/#app
// mount div plus a <script type="module" src="/src/...."> reference to raw,
// un-bundled source — has no real markup to import: that script path only
// resolves once a dev server compiles it on the fly, or after a production
// build bundles it into real <script>/<link> tags. Mirrors the identical
// guard in storeTemplateController.js's parseStoreTemplateZip; duplicated
// here (rather than shared) because this pipeline validates *before*
// parseStoreTemplateZip ever runs, so the import is rejected immediately
// instead of silently producing a StoreTemplate whose page is permanently
// blank.
const SPA_MOUNT_DIV_RE = /<div\s+id=["'](?:root|app)["'][^>]*>\s*<\/div>/i;
const SPA_DEV_SCRIPT_RE = /<script\b[^>]*\btype=["']module["'][^>]*\bsrc=["']\/src\/[^"']+\.(?:jsx?|tsx?)["']/i;
const isUnbuiltSpaShell = (html) => SPA_MOUNT_DIV_RE.test(html) && SPA_DEV_SCRIPT_RE.test(html);

// WordPress themes self-identify via a standard header comment block at
// the top of their root style.css — this is the actual spec WordPress
// itself reads (see https://developer.wordpress.org/themes/basics/main-stylesheet-style-css/),
// not a heuristic. Finding it is a precise, positive signal that a ZIP is
// theme *source* — as opposed to guessing from "contains some .php files",
// which also matches plugins, raw WP-core dumps, or a Simply Static export
// that happens to still have a stray .php file mixed in (see the A2 skip
// logic below).
const THEME_HEADER_RE = /\/\*[\s\S]*?\*\//;
const THEME_NAME_RE = /Theme Name:\s*(.+)/i;
const THEME_VERSION_RE = /Version:\s*(.+)/i;

// Plugins self-identify the same way, but in their main PHP file's header
// comment instead of style.css.
const PLUGIN_NAME_RE = /Plugin Name:\s*(.+)/i;

/**
 * Scans style.css entries for the WordPress theme header block. Reads
 * only the first comment (a few hundred bytes in practice), so this stays
 * cheap even though it's the one place in Stage 3 that reads file content
 * ahead of the main parse.
 *
 * @param {Array} entries  from listEntries(zip)
 * @returns {Promise<{ name: string, version: string, path: string } | null>}
 */
async function detectThemePackage(entries) {
  const styleEntries = entries.filter(
    ({ zipPath }) => zipPath.toLowerCase().split('/').pop() === 'style.css'
  );
  for (const { zipPath, entry } of styleEntries) {
    const content = await entry.async('string');
    const headerBlock = THEME_HEADER_RE.exec(content)?.[0] || content.slice(0, 1000);
    const nameMatch = THEME_NAME_RE.exec(headerBlock);
    if (nameMatch) {
      const versionMatch = THEME_VERSION_RE.exec(headerBlock);
      return {
        name: nameMatch[1].trim(),
        version: versionMatch ? versionMatch[1].trim() : '',
        path: zipPath,
      };
    }
  }
  return null;
}

/**
 * Scans .php entries' first ~2KB for the WordPress plugin header block
 * (only checked when no theme was already detected, since a ZIP is
 * realistically one or the other for this pipeline's purposes).
 *
 * @param {Array} entries  from listEntries(zip)
 * @returns {Promise<{ name: string, path: string } | null>}
 */
async function detectPluginPackage(entries) {
  const phpEntries = entries.filter(({ ext }) => ext === 'php');
  for (const { zipPath, entry } of phpEntries) {
    const content = await entry.async('string');
    const nameMatch = PLUGIN_NAME_RE.exec(content.slice(0, 2000));
    if (nameMatch) {
      return { name: nameMatch[1].trim(), path: zipPath };
    }
  }
  return null;
}

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
 *     externalFormActionsFound: string[],
 *     skippedExecutableFiles: string[],
 *     detectedThemePackage: { name: string, version: string, path: string } | null,
 *     detectedPluginPackage: { name: string, path: string } | null
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
  const skippedExecutableFiles = [];

  for (const { zipPath, rawPath, ext, uncompressedSize, compressedSize } of entries) {
    // ── Safety: path traversal (defense in depth — parseStoreTemplateZip's
    // own resolveHref/normZip already strip ".." during asset resolution,
    // but this rejects the *upload itself* outright). ──────────────────
    if (hasPathTraversal(rawPath)) {
      errors.push(`Unsafe path in archive: "${rawPath}".`);
      continue;
    }

    const baseName = zipPath.toLowerCase().split('/').pop();

    // ── Safety: executable / server-side file types — skipped, not a
    // hard reject (see the A2 note in the file header). The pipeline
    // never reads these, so importing continues with the file excluded.
    // Still falls through to the size/zip-bomb accounting below — a
    // skipped file is still counted for those, since that protection
    // must hold regardless of file type. ──────────────────────────────
    const isSkippedExecutable = FORBIDDEN_EXTS.has(ext);
    if (isSkippedExecutable) {
      skippedExecutableFiles.push(zipPath);
    }

    // ── Safety: server config files ─────────────────────────────────────
    if (BLOCKED_FILENAMES.has(baseName)) {
      warnings.push(`Skipped server config file: "${zipPath}".`);
    }

    // ── Shape: WordPress-shaped asset path detection (informational) ───
    const lowerPath = zipPath.toLowerCase();
    if (WORDPRESS_MARKERS.some((marker) => lowerPath.includes(marker))) {
      detectedAsWordPress = true;
    }

    // ── Scope guard: this pipeline imports a Theme only (layout, HTML,
    // CSS, assets, sections, header/footer, menus, widgets) — never
    // product, order, or customer data. A Simply Static export never
    // contains these, but a WooCommerce (or similar plugin) data dump
    // occasionally gets zipped up alongside a theme export by mistake.
    // Any such file is skipped and reported — not read, not mapped onto
    // StoreTemplate.pages, and never turned into a StoreProduct/
    // StoreOrder/StoreCustomer record. ──────────────────────────────────
    if (COMMERCE_DATA_MARKERS.some((marker) => lowerPath.includes(marker))) {
      warnings.push(
        `Skipped "${zipPath}" — this import brings in the Theme only (layout/HTML/CSS/assets/sections); ` +
          `product, order, and customer data is never imported.`
      );
      continue;
    }

    totalUncompressedBytes += uncompressedSize;

    // ── Safety: decompression-bomb ratio check (best-effort — only when
    // JSZip's internal size fields are available) ──────────────────────
    if (compressedSize > 0 && uncompressedSize / compressedSize > MAX_COMPRESSION_RATIO) {
      errors.push(`Suspicious compression ratio on "${zipPath}" — rejected as a possible decompression bomb.`);
    }

    if (!isSkippedExecutable && ext && ext !== 'html' && ext !== 'htm') assetFileCount++;
  }

  // ── Safety: zip-bomb / size sanity (aggregate) ────────────────────────
  if (totalUncompressedBytes > MAX_UNCOMPRESSED_BYTES) {
    warnings.push(
      `Archive is large uncompressed (${Math.round(totalUncompressedBytes / (1024 * 1024))} MB); continuing with warnings.`
    );
  }

  // ── Shape: HTML presence ───────────────────────────────────────────────
  const htmlPages = discoverHtmlPages(zip);
  const htmlFileCount = htmlPages.length;
  let detectedThemePackage = null;
  let detectedPluginPackage = null;

  if (htmlFileCount === 0) {
    // Diagnostic tally so the error explains *why* — a raw WordPress
    // install/theme export (wp-content/, .php templates, no pre-rendered
    // output) is the most common reason this fires, and looks very
    // different from a genuinely broken/empty ZIP.
    const extCounts = {};
    for (const { ext } of entries) {
      const key = ext || '(no extension)';
      extCounts[key] = (extCounts[key] || 0) + 1;
    }
    const topExts = Object.entries(extCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ext, count]) => `${count} .${ext}`)
      .join(', ');

    // Positive identification first (style.css "Theme Name:" / plugin
    // header "Plugin Name:"), falling back to the generic "has some .php"
    // heuristic only when neither actually matches.
    detectedThemePackage = await detectThemePackage(entries);
    detectedPluginPackage = detectedThemePackage ? null : await detectPluginPackage(entries);

    let message = `No HTML pages found in this export. This ZIP contains ${entries.length} file(s)${topExts ? ` (${topExts})` : ''} but no .html/.htm file.`;

    if (detectedThemePackage) {
      message +=
        ` This is a WordPress theme's *source code* — "${detectedThemePackage.name}"` +
        (detectedThemePackage.version ? ` v${detectedThemePackage.version}` : '') +
        ` (identified from the "Theme Name:" header in ${detectedThemePackage.path}) —` +
        ' not a pre-rendered export. Its templates (get_header(), the_content(), ' +
        'the_post() and similar) only produce HTML once WordPress renders them ' +
        'against a live database; the theme files by themselves contain no HTML ' +
        'to import. Install this theme on a running WordPress site with real ' +
        'content, export it with a static-export tool (e.g. the Simply Static ' +
        'plugin, or `wget --mirror`), and ZIP *that* generated output instead.';
    } else if (detectedPluginPackage) {
      message +=
        ` This is a WordPress plugin's source code — "${detectedPluginPackage.name}"` +
        ` (identified from the "Plugin Name:" header in ${detectedPluginPackage.path}) —` +
        ' plugins have no pages of their own to import; they extend the ' +
        'behavior of a WordPress site rendered elsewhere. Export the site ' +
        'that has this plugin *installed and active* with a static-export ' +
        'tool instead.';
    } else {
      const phpLikeCount = skippedExecutableFiles.length;
      const looksLikeRawWpInstall = phpLikeCount > 0 || detectedAsWordPress;
      if (looksLikeRawWpInstall) {
        message +=
          ' This looks like a raw WordPress install or theme/plugin export' +
          (phpLikeCount ? ` (${phpLikeCount} .php file(s) found)` : '') +
          ' rather than a pre-rendered static export — WordPress renders ' +
          '.php templates into HTML at request time, so no .html files exist ' +
          'until that rendering actually happens. Run a static-export tool ' +
          '(e.g. the Simply Static plugin, or `wget --mirror`) against the ' +
          'live site first, then ZIP *that* generated output — not the theme ' +
          'or wp-content folder.';
      }
    }
    errors.push(message);
  } else if (!htmlPages.some((p) => p.isHome)) {
    errors.push("This doesn't look like a Simply Static export — no index.html found.");
  } else {
    // ── Shape: unbuilt SPA/dev-server shell (hard reject) ────────────────
    const homeMeta = htmlPages.find((p) => p.isHome);
    const homeEntryRecord = entries.find((e) => e.zipPath === homeMeta.zipPath);
    const homeHtml = homeEntryRecord ? await homeEntryRecord.entry.async('string') : '';
    if (isUnbuiltSpaShell(homeHtml)) {
      errors.push(
        'This ZIP looks like an unbuilt web app\'s source code (a Vite/React/similar ' +
        'dev index.html with an empty #root/#app div and a <script type="module" ' +
        'src="/src/...."> reference), not a pre-rendered static export. That script ' +
        'path only resolves during local development or after a production build — ' +
        'the page has no real markup until then. Run a production build (e.g. ' +
        '`npm run build`) and ZIP the generated output folder (e.g. dist/) instead, ' +
        'or export the live site with a static-export tool (e.g. the Simply Static ' +
        'plugin, or `wget --mirror`).'
      );
    }
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

  // ── Executable/server-side files — skipped, reported as one rolled-up
  // warning rather than one line per file (an exported WordPress theme
  // folder can easily contain a dozen+ .php templates). ──────────────────
  if (skippedExecutableFiles.length) {
    const sample = skippedExecutableFiles.slice(0, 3).join(', ');
    warnings.push(
      `${skippedExecutableFiles.length} executable/server-side file(s) were skipped and not imported (never executed or served): ${sample}${skippedExecutableFiles.length > 3 ? ', …' : ''}`
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
      skippedExecutableFiles,
      detectedThemePackage,
      detectedPluginPackage,
    },
  };
}

module.exports = { validateWordPressStructure };