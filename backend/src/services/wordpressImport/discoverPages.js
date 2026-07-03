'use strict';

/**
 * discoverPages.js
 * Stage 4 ("Discover HTML pages") of the WordPress Import Pipeline.
 *
 * A lightweight, read-only scan of ZIP entries — it never reads/parses file
 * *content* (that's `parseStoreTemplateZip()`'s job, reused untouched in
 * uploadAssets.js). This module exists so that:
 *   - validateTemplate.js (Stage 3) can count HTML/asset files and confirm
 *     an `index.html` exists before committing to the expensive parse.
 *   - index.js can log/report page discovery independently of parsing.
 *
 * Deliberately duplicates none of `parseStoreTemplateZip`'s HTML *parsing*
 * logic — only the cheap "list + classify entry names" step, which is safe
 * to run twice (see extractZip.js's documented trade-off).
 */

const normZip = (p) =>
  (p || '').replace(/\\/g, '/').replace(/^\.\/?/, '').replace(/^\/+/, '');

const extOf = (zipPath) =>
  zipPath.includes('.') ? zipPath.slice(zipPath.lastIndexOf('.') + 1).toLowerCase() : '';

/**
 * Flattens a JSZip instance's entries into a plain array, normalizing paths
 * and pulling out the (best-effort) uncompressed/compressed size JSZip
 * tracks internally on each entry.
 *
 * @param {import('jszip')} zip
 * @returns {Array<{ zipPath: string, rawPath: string, ext: string, entry: object, uncompressedSize: number, compressedSize: number }>}
 */
function listEntries(zip) {
  const entries = [];
  zip.forEach((rawPath, entry) => {
    if (!entry || entry.dir) return;
    const zipPath = normZip(rawPath);
    entries.push({
      zipPath,
      // Kept alongside zipPath — normZip's leading "./" strip mangles a
      // leading "../" into "./" (stripping just the first char), which
      // would hide a traversal attempt from a check that only looks at
      // zipPath. Security checks in validateTemplate.js must test rawPath.
      rawPath,
      ext: extOf(zipPath),
      entry,
      // JSZip doesn't expose a public getter for these, but every entry
      // carries them internally after loadAsync(); fall back to 0 rather
      // than throwing if a future JSZip version changes shape.
      uncompressedSize: entry?._data?.uncompressedSize || 0,
      compressedSize: entry?._data?.compressedSize || 0,
    });
  });
  return entries;
}

/**
 * @param {import('jszip')} zip
 * @returns {Array<{ zipPath: string, fileName: string, isHome: boolean, uncompressedSize: number }>}
 *   HTML pages found in the archive, home page first, then alphabetical —
 *   same ordering `parseStoreTemplateZip()` uses so downstream page lists
 *   line up.
 */
function discoverHtmlPages(zip) {
  const pages = listEntries(zip)
    .filter(({ ext }) => ext === 'html' || ext === 'htm')
    .map(({ zipPath, uncompressedSize }) => ({
      zipPath,
      fileName: zipPath.split('/').pop(),
      isHome: /(^|\/)index\.html?$/i.test(zipPath),
      uncompressedSize,
    }));

  pages.sort((a, b) =>
    a.isHome === b.isHome ? a.zipPath.localeCompare(b.zipPath) : a.isHome ? -1 : 1
  );

  return pages;
}

module.exports = { listEntries, discoverHtmlPages, normZip };
