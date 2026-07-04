import JSZip from "jszip";

/**
 * wordpressZipPrecheck.js
 *
 * Lightweight, client-side "does this ZIP even have HTML in it" check for
 * the Import WordPress Template modal. This is deliberately NOT a full
 * reimplementation of the backend's Stage 3 validator
 * (backend/src/services/wordpressImport/validateTemplate.js) — it exists
 * purely to give the user an instant, friendly explanation *before* they
 * spend time uploading a ZIP that the backend is going to reject anyway.
 *
 * The backend validator remains the single source of truth: it re-checks
 * everything (path traversal, zip-bomb ratios, server config files, etc.)
 * server-side regardless of what this function decides, so there's no
 * safety implication to this file being wrong, out of date, or skipped
 * entirely (e.g. because JSZip failed to parse the file client-side).
 *
 * Detection order mirrors validateTemplate.js's detectThemePackage /
 * detectPluginPackage for one reason: consistency. A user who sees "this
 * is theme X's source code" here and then (hypothetically) a different
 * diagnosis from the server would reasonably think something was broken.
 */

const HTML_EXT_RE = /\.(html?|htm)$/i;
const PHP_EXT_RE = /\.(php|phtml|php[3-7]|phar)$/i;

const THEME_HEADER_RE = /\/\*[\s\S]*?\*\//;
const THEME_NAME_RE = /Theme Name:\s*(.+)/i;
const THEME_VERSION_RE = /Version:\s*(.+)/i;
const PLUGIN_NAME_RE = /Plugin Name:\s*(.+)/i;

/**
 * @param {File} file  a browser File object (from antd's Upload/Dragger)
 * @returns {Promise<{ ok: boolean, message: string | null }>}
 *   ok: false means "don't bother uploading this, here's why" — the caller
 *   should surface `message` and block the Start Import button, the same
 *   way it already does for the synchronous extension/size checks.
 *   ok: true covers both "looks fine" and "couldn't tell, let the server
 *   decide" — those two cases are intentionally indistinguishable to the
 *   caller, since neither should block the upload.
 */
export async function precheckWordPressZip(file) {
  let zip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch {
    // Corrupt, encrypted, or just too large for the browser to parse
    // comfortably — don't guess. The backend's real ZIP parser (extractZip.js)
    // is the authoritative check for whether the archive is even valid.
    return { ok: true, message: null };
  }

  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  const hasHtml = entries.some((entry) => HTML_EXT_RE.test(entry.name));
  if (hasHtml) return { ok: true, message: null };

  // No HTML anywhere in the archive — figure out *why* using the same
  // positive-identification order the backend uses: a theme's "Theme
  // Name:" header in style.css first, then a plugin's "Plugin Name:"
  // header, falling back to a generic "raw PHP source" explanation only
  // when neither actually matches.
  const styleEntries = entries.filter(
    (entry) => entry.name.toLowerCase().split("/").pop() === "style.css"
  );
  for (const entry of styleEntries) {
    let content;
    try {
      content = await entry.async("string");
    } catch {
      continue;
    }
    const headerBlock = THEME_HEADER_RE.exec(content)?.[0] || content.slice(0, 1000);
    const nameMatch = THEME_NAME_RE.exec(headerBlock);
    if (nameMatch) {
      const versionMatch = THEME_VERSION_RE.exec(headerBlock);
      const version = versionMatch ? ` v${versionMatch[1].trim()}` : "";
      return {
        ok: false,
        message:
          `This ZIP is the WordPress theme "${nameMatch[1].trim()}"${version}'s ` +
          `source code, not a rendered export — its .php templates only produce ` +
          `HTML once WordPress renders them against a live database, so there's ` +
          `no HTML here to import. Install the theme on a WordPress site with ` +
          `real content, generate a static export with the Simply Static plugin ` +
          `(or \`wget --mirror\`), and upload that generated ZIP instead.`,
      };
    }
  }

  const phpEntries = entries.filter((entry) => PHP_EXT_RE.test(entry.name));
  for (const entry of phpEntries) {
    let content;
    try {
      content = await entry.async("string");
    } catch {
      continue;
    }
    const nameMatch = PLUGIN_NAME_RE.exec(content.slice(0, 2000));
    if (nameMatch) {
      return {
        ok: false,
        message:
          `This ZIP is the WordPress plugin "${nameMatch[1].trim()}"'s source code — ` +
          `plugins have no pages of their own to import; they extend a WordPress ` +
          `site rendered elsewhere. Export the site this plugin is installed and ` +
          `active on with a static-export tool instead.`,
      };
    }
  }

  if (phpEntries.length > 0) {
    return {
      ok: false,
      message:
        `This ZIP has no .html files — only ${phpEntries.length} .php file(s) — so ` +
        `it looks like raw WordPress source rather than a rendered export. Generate ` +
        `a static export of the live site (e.g. with the Simply Static plugin, or ` +
        `\`wget --mirror\`) and upload that output instead.`,
    };
  }

  return {
    ok: false,
    message:
      "This ZIP has no .html/.htm files, so it doesn't look like a static export. " +
      "Make sure you're uploading the generated output of a static-export tool " +
      "(e.g. the Simply Static plugin), not a theme, plugin, or raw WordPress folder.",
  };
}
