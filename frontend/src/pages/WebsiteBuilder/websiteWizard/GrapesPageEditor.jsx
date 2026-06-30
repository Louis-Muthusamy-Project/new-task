import React, { useEffect, useMemo, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import presetWebpage from 'grapesjs-preset-webpage';
import axios from 'axios';

const API_BASE = import.meta.env?.VITE_WEBSITE_WIZARD_API_BASE || 'http://localhost:5500/api';

/**
 * Fetch existing media assets for a websiteId and return them as GrapesJS
 * asset objects: { src, name, type, width, height }
 */
async function fetchMediaAssets(websiteId) {
  if (!websiteId) return [];
  try {
    const url = `${API_BASE}/website-builder/media?websiteId=${websiteId}&type=image&limit=100`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    const items = Array.isArray(json?.data) ? json.data : [];
    return items.map((m) => ({
      src: m.url,
      name: m.fileName || m.url,
      type: 'image',
      width: m.width || 0,
      height: m.height || 0,
    }));
  } catch (e) {
    console.warn('[GrapesPageEditor] fetchMediaAssets failed:', e);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas stylesheet injection
//
// GrapesJS canvas.styles (set at init time) is the only supported way to load
// external stylesheets into the canvas iframe declaratively. However it is
// fixed at construction — we cannot add URLs discovered from page HTML later.
//
// For URLs found after init we inject <link> / <style> elements directly into
// the canvas iframe's <head>. Both paths are deduplicated so re-renders are
// safe and idempotent.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FIX 4: Wait until the canvas iframe document is in 'interactive' or 'complete'
 * readyState before attempting to inject styles into it. The old code queried
 * the doc inline with no readiness check — if the iframe wasn't ready yet the
 * helpers silently returned null and CSS was never injected.
 * Polls via requestAnimationFrame (no arbitrary setTimeout) with a 10 s safety
 * ceiling so a broken iframe never hangs the pipeline.
 */
function waitForCanvasDoc(editor, timeoutMs = 10_000) {
  return new Promise((resolve) => {
    const getDoc = () => {
      try {
        const iframe =
          editor.Canvas?.getFrameEl?.() ||
          editor.Canvas?.getBody?.()?.ownerDocument?.defaultView?.frameElement;
        return iframe?.contentDocument || iframe?.contentWindow?.document || null;
      } catch (_) { return null; }
    };

    const deadline = Date.now() + timeoutMs;
    const poll = () => {
      const d = getDoc();
      // FIX 4: require interactive or complete — 'loading' and 'uninitialized'
      // are not safe to inject into because the parser may reset the head.
      if (d && (d.readyState === 'interactive' || d.readyState === 'complete')) {
        resolve(d);
        return;
      }
      if (Date.now() >= deadline) { resolve(null); return; }
      requestAnimationFrame(poll);
    };
    poll();
  });
}

/**
 * FIX 2/3: Inject a <link rel="stylesheet"> into the canvas iframe head and
 * return a Promise that resolves only when the sheet has fully loaded (or
 * errored, or timed out after 15 s).
 *
 * Previous issues fixed here:
 *   • Function was synchronous — callers couldn't wait for sheets to load.
 *   • Used `existing.sheet` as a "loaded" signal. That property is set as soon
 *     as the CSSOM entry is created, before rules are parsed — it's truthy for
 *     sheets that are still being fetched on first load but are cached, which
 *     is exactly why the page appeared correct after a refresh but not before.
 *   • Did not wait for the iframe doc to be ready before injecting.
 */
function injectCanvasLink(editor, href) {
  if (!href) return Promise.resolve();
  return waitForCanvasDoc(editor).then((doc) => {
    if (!doc) return Promise.resolve();
    return new Promise((resolve) => {
      try {
        // Safe attribute-selector escape: replace backslashes and double-quotes.
        const escaped = href.replace(/  /g, '    ').replace(/"/g, '  "');
        const existing = doc.head.querySelector(`link[href="${escaped}"]`);
        if (existing) {
          // FIX 3: do NOT use existing.sheet as a "loaded" indicator.
          // Instead attach load/error listeners; if the events already fired
          // (sheet cached from a prior page load) the listener fires synchronously
          // in some browsers, but we guard with a fallback resolve below.
          let settled = false;
          const done = () => { if (!settled) { settled = true; resolve(); } };
          existing.addEventListener('load',  done, { once: true });
          existing.addEventListener('error', done, { once: true });
          // Fallback: if sheet is already applied (cached) fire immediately.
          if (existing.sheet) { done(); }
          return;
        }
        const link = doc.createElement('link');
        link.rel  = 'stylesheet';
        link.href = href;
        link.setAttribute('data-grapes-injected', '1');
        let settled = false;
        const timer = setTimeout(() => { if (!settled) { settled = true; resolve(); } }, 15_000);
        const done  = () => {
          if (!settled) { settled = true; clearTimeout(timer); resolve(); }
        };
        link.addEventListener('load',  done, { once: true });
        link.addEventListener('error', done, { once: true });
        doc.head.appendChild(link);
      } catch (e) {
        console.warn('[GrapesPageEditor] injectCanvasLink failed:', href, e);
        resolve();
      }
    });
  });
}

/**
 * Inject a <style> block into the canvas iframe head with a unique key so
 * subsequent calls with the same key replace rather than duplicate the block.
 * Now returns a Promise (resolved after the DOM write) so it can be awaited
 * consistently alongside injectCanvasLink.
 */
function injectCanvasStyle(editor, css, key) {
  if (!css || !css.trim()) return Promise.resolve();
  return waitForCanvasDoc(editor).then((doc) => {
    if (!doc) return;
    try {
      const attr    = 'data-grapes-style-key';
      const safeKey = String(key || 'page-css');
      const existing = doc.head.querySelector(`[${attr}="${safeKey}"]`);
      if (existing) {
        if (existing.textContent === css) return; // unchanged
        existing.textContent = css;
        return;
      }
      const style = doc.createElement('style');
      style.setAttribute(attr, safeKey);
      style.textContent = css;
      doc.head.appendChild(style);
    } catch (e) {
      console.warn('[GrapesPageEditor] injectCanvasStyle failed:', e);
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// normalizeToBodyAndCss
//
// Parses the raw HTML stored by the backend (which is always body-only HTML,
// already having had its <style> tags stripped into the separate `css` field
// by the upload pipeline).  However the editor may also receive full-document
// HTML in some paths, so we handle both.
//
// Returns:
//   componentsHtml  – clean body markup for editor.setComponents()
//   stylesCss       – all CSS rules for editor.setStyle() and canvas injection
//   externalLinks   – href strings for <link rel="stylesheet"> / fonts / icons
//                     that must be injected into the canvas iframe
//
// Key fixes vs. original:
//   1. Scans BOTH head and body for <style> tags (backend stores body-only HTML
//      so styles can appear in body after earlier pipeline steps).
//   2. Collects ALL <link rel="stylesheet|preconnect"> and font/icon CDN hrefs
//      from <head> so the caller can inject them into the canvas iframe.
//   3. Does NOT remove <style> from body before extracting their content — it
//      extracts first, then strips.
//   4. Removes loader/spinner elements (unchanged from original).
// ─────────────────────────────────────────────────────────────────────────────

const EXTERNAL_LINK_RELS = new Set([
  'stylesheet',
  'preconnect',
  'dns-prefetch',
  'preload',
]);

function normalizeToBodyAndCss(rawHtml = '', rawCss = '', rawHeadLinks = '') {
  const html    = String(rawHtml || '');
  const cssBase = String(rawCss  || '');
  const headLinks = String(rawHeadLinks || '');

  try {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(`${headLinks} n${html}`, 'text/html');

    // ── 1. Collect external stylesheet / font / icon links ────────────────
    // These must be injected into the canvas iframe, not fed to setStyle().
    const externalLinks = [];
    const seenHrefs     = new Set();

    // FIX 8: scan the entire document (head + body) so <link> tags that appear
    // inside the body (as some templates place them) are not silently dropped.
    for (const el of Array.from(doc.querySelectorAll('link[href]'))) {
      const rel  = (el.getAttribute('rel') || '').toLowerCase().trim();
      const href = (el.getAttribute('href') || '').trim();
      if (!href || seenHrefs.has(href)) continue;

      // Always forward stylesheet links; also forward preconnect/dns-prefetch
      // for font providers (Google Fonts uses them) and preload for fonts.
      const as = (el.getAttribute('as') || '').toLowerCase();
      const isStylesheet  = rel === 'stylesheet';
      const isPreconnect  = rel === 'preconnect' || rel === 'dns-prefetch';
      const isFontPreload = rel === 'preload' && as === 'font';
      const isFavicon     = rel === 'icon' || rel === 'shortcut icon' || rel === 'apple-touch-icon';

      if (isStylesheet || isPreconnect || isFontPreload) {
        seenHrefs.add(href);
        if (isStylesheet) externalLinks.push({ type: 'link', href });
        // preconnect / dns-prefetch have no visual impact inside the iframe,
        // but including them helps font CDNs resolve faster.
      }
      // Favicon: skip — irrelevant inside the canvas iframe.
    }

    // ── 2. Extract ALL <style> content (head + body) ──────────────────────
    // The backend stores body-only HTML, so styles in body are legitimate page
    // CSS. Extract before removal so nothing is silently lost.
    const allStyleEls = Array.from(doc.querySelectorAll('style'));
    const extractedCss = allStyleEls
      .map((el) => (el.textContent || '').trim())
      .filter(Boolean)
      .join(' n');

    // ── 3. Clean body ─────────────────────────────────────────────────────
    const body = doc.body.cloneNode(true);
    // Remove <style>/<link> (already captured above), scripts, and loader elements.
    body.querySelectorAll(
      'style, link, script, #spinner, .spinner, .preloader, .loader, [data-loader]'
    ).forEach((el) => el.remove());

    const bodyHtml = body.innerHTML;

    // ── 4. Merge CSS ──────────────────────────────────────────────────────
    // cssBase (the `css` field from the DB) + styles extracted from the HTML.
    // Deduplicate identical blocks to avoid double-application of the same rules.
    const cssBlocks = [];
    if (cssBase.trim()) cssBlocks.push(cssBase.trim());
    if (extractedCss.trim() && extractedCss.trim() !== cssBase.trim()) {
      cssBlocks.push(extractedCss.trim());
    }
    const stylesCss = cssBlocks.join(' n');

    return { componentsHtml: bodyHtml, stylesCss, externalLinks };
  } catch (e) {
    console.error('[GrapesPageEditor] normalizeToBodyAndCss failed:', e);
    return { componentsHtml: html, stylesCss: cssBase, externalLinks: [] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Asset extraction helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract all image-like URLs from HTML: img[src], img[srcset], source[srcset],
 * [data-srcset], and CSS url() found in style attributes and inline <style> blocks.
 * Returns a deduplicated array of absolute-looking URL strings.
 */
function extractAllAssetUrls(htmlString) {
  if (!htmlString) return [];
  const urls  = new Set();
  const isUrl = (s) => s && (s.startsWith('http') || s.startsWith('//') || s.startsWith('/') || s.startsWith('data:'));

  // img[src]
  const srcRe = /<img b[^>]* bsrc=["']([^"']+)["']/gi;
  let m;
  while ((m = srcRe.exec(htmlString)) !== null) {
    const v = m[1].trim();
    if (isUrl(v)) urls.add(v);
  }

  // img[srcset], source[srcset], [data-srcset]
  const srcsetRe = / b(?:srcset|data-srcset)=["']([^"']+)["']/gi;
  while ((m = srcsetRe.exec(htmlString)) !== null) {
    for (const part of m[1].split(',')) {
      const url = part.trim().split(/ s+/)[0];
      if (url && isUrl(url)) urls.add(url);
    }
  }

  // CSS url() — covers background-image in style attrs and <style> blocks
  const cssUrlRe = /url ( s*['"]?([^'")]+)['"]? s* )/gi;
  while ((m = cssUrlRe.exec(htmlString)) !== null) {
    const v = m[1].trim();
    if (isUrl(v)) urls.add(v);
  }

  return Array.from(urls);
}

const dedupeBy = (arr, keyFn) => {
  const seen = new Set();
  const out  = [];
  for (const item of arr || []) {
    const k = keyFn(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
};

/**
 * Add all image URLs found in the HTML to the GrapesJS AssetManager so they
 * appear in the media panel and resolve correctly in the canvas.
 */
function populateAssetManagerFromHtml(editor, htmlString) {
  if (!editor?.AssetManager || typeof editor.AssetManager.add !== 'function') return;

  const allUrls = extractAllAssetUrls(htmlString);
  if (!allUrls.length) return;

  const existing = new Set();
  try {
    const assets = editor.AssetManager.getAll?.() || [];
    for (const a of assets) {
      const url = a?.get?.('src') || a?.attributes?.src || a?.get?.('data')?.src || a?.src;
      if (url) existing.add(String(url));
    }
  } catch (_) {}

  for (const src of allUrls) {
    if (existing.has(src)) continue;
    editor.AssetManager.add({ src, type: 'image' });
  }
}

/**
 * Load existing media from the backend and add them to the asset manager.
 * Called once the editor canvas is ready and after every successful upload.
 */
async function syncAssetsFromBackend(editor, websiteId) {
  if (!editor?.AssetManager) return;
  const assets = await fetchMediaAssets(websiteId);
  if (!assets.length) return;

  const existing = new Set();
  try {
    const all = editor.AssetManager.getAll?.() || [];
    for (const a of all) {
      const url = a?.get?.('src') || a?.attributes?.src || a?.src;
      if (url) existing.add(String(url));
    }
  } catch (_) {}

  for (const asset of assets) {
    if (!existing.has(asset.src)) {
      editor.AssetManager.add(asset);
    }
  }
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildFormHtml(form, { isTemplate = false } = {}) {
  const fields = Array.isArray(form?.fields) ? form.fields : [];
  const formId = escapeHtml(form?._id || form?.id || '');
  const formName = escapeHtml(form?.name || 'Form');

  return `
    <form style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" data-form-id="${formId}"${isTemplate ? ' data-is-template="true"' : ''}>
      <h3 style="margin-top: 0; margin-bottom: 20px; font-family: sans-serif; color: #111827;">${formName}</h3>
      ${fields.map((field) => {
        const typeLower = String(field.type || '').toLowerCase();
        const fieldId = escapeHtml(field.id || field.label || 'field');
        const fieldLabel = escapeHtml(field.label || field.type || 'Field');
        const placeholder = escapeHtml(field.placeholder || '');
        const reqAttr = field.required ? 'required' : '';
        const placeholderAttr = placeholder ? `placeholder="${placeholder}"` : '';
        const labelHtml = typeLower === 'button' ? '' : `<label style="display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; font-family: sans-serif; color: #374151;">${fieldLabel}${field.required ? ' <span style="color: #ef4444;">*</span>' : ''}</label>`;
        const inputStyle = 'width: 100%; padding: 10px 12px; margin-bottom: 16px; border: 1px solid #d1d5db; border-radius: 6px; font-family: sans-serif; font-size: 14px; color: #111827; box-sizing: border-box;';

        let inputHtml = '';
        if (typeLower === 'textarea' || typeLower === 'text area') {
          inputHtml = `<textarea style="${inputStyle} min-height: 100px;" ${placeholderAttr} ${reqAttr}></textarea>`;
        } else if (typeLower === 'button') {
          inputHtml = `<button type="submit" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; font-family: sans-serif; font-size: 16px;">${fieldLabel || 'Submit'}</button>`;
        } else if (typeLower === 'select') {
          inputHtml = `<select style="${inputStyle}" ${reqAttr}>
            <option value="" disabled selected>${placeholder || 'Select an option'}</option>
            ${(field.options || []).map((option) => {
              const safeOption = escapeHtml(option);
              return `<option value="${safeOption}">${safeOption}</option>`;
            }).join('')}
          </select>`;
        } else if (typeLower === 'radio group') {
          inputHtml = `<div style="margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px;">${(field.options || []).map((option) => {
            const safeOption = escapeHtml(option);
            return `<label style="font-family: sans-serif; font-size: 14px; color: #374151; display: flex; align-items: center; gap: 8px;"><input type="radio" name="${fieldId}" value="${safeOption}" ${reqAttr}>${safeOption}</label>`;
          }).join('')}</div>`;
        } else if (typeLower === 'checkbox group') {
          inputHtml = `<div style="margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px;">${(field.options || []).map((option) => {
            const safeOption = escapeHtml(option);
            return `<label style="font-family: sans-serif; font-size: 14px; color: #374151; display: flex; align-items: center; gap: 8px;"><input type="checkbox" value="${safeOption}">${safeOption}</label>`;
          }).join('')}</div>`;
        } else {
          let inputType = 'text';
          if (typeLower.includes('email')) inputType = 'email';
          else if (typeLower.includes('tel') || typeLower.includes('phone')) inputType = 'tel';
          else if (typeLower.includes('number')) inputType = 'number';
          else if (typeLower.includes('date')) inputType = 'date';
          else if (typeLower.includes('time')) inputType = 'time';

          inputHtml = `<input type="${inputType}" style="${inputStyle}" ${placeholderAttr} ${reqAttr} />`;
        }

        return `<div>${labelHtml}${inputHtml}</div>`;
      }).join('')}
    </form>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// GrapesPageEditor component
// ─────────────────────────────────────────────────────────────────────────────

const GrapesPageEditor = ({
  pageKey,
  websiteId,
  height = '100%',
  initialHtml = '',
  initialCss = '',
  initialHeadLinks = '',
  onChange,
  assetManager = {},
  onEditorReady,
}) => {
  const holderRef  = useRef(null);
  const editorRef  = useRef(null);
  const isSyncingRef = useRef(false);

  const loadedForPageKeyRef = useRef(null);
  const [mountEpoch, setMountEpoch] = useState(0);
  const [formTemplates, setFormTemplates] = useState([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [formsError, setFormsError] = useState('');
  const [activeTool, setActiveTool] = useState('basic');

  const canvasReadyRef    = useRef(false);
  const pendingContentRef = useRef(null);

  const uploadUrl = `${API_BASE}/website-builder/media/upload`;

  // websiteId ref so async callbacks always see the latest value without
  // causing the init effect to re-run.
  const websiteIdRef = useRef(websiteId);
  useEffect(() => { websiteIdRef.current = websiteId; }, [websiteId]);

  useEffect(() => {
    if (activeTool !== 'forms') return;
    if (formsLoading || formTemplates.length > 0) return;
    fetchFormTools(editorRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool]);

  const fetchFormTools = async (editor) => {
    setFormsLoading(true);
    setFormsError('');
    try {
      const templatesRes = await axios.get(`${API_BASE}/website-builder/forms/templates`);
      let forms = [];
      try {
        const formsRes = await axios.get(`${API_BASE}/website-builder/forms`);
        forms = (formsRes.data?.data || []).filter((form) => !form.isTemplate);
      } catch (formsErr) {
        console.warn('[GrapesPageEditor] regular forms could not be loaded:', formsErr);
      }

      const templates = templatesRes.data?.data || [];
      setFormTemplates(templates);

      if (editor?.BlockManager) {
        forms.forEach((form) => {
          editor.BlockManager.add(`form-${form._id}`, {
            label: `
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 5px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <div style="font-size: 11px; margin-top: 5px; line-height: 1.2;">${escapeHtml(form.name)}</div>
            `,
            category: 'Forms',
            content: buildFormHtml(form),
          });
        });

        templates.forEach((form) => {
          editor.BlockManager.add(`form-template-${form._id}`, {
            label: `
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 5px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <div style="font-size: 11px; margin-top: 5px; line-height: 1.2;">${escapeHtml(form.name)} <span style="color: #10b981; font-weight: 800;">(T)</span></div>
            `,
            category: 'Form Templates',
            content: buildFormHtml(form, { isTemplate: true }),
          });
        });
      }
    } catch (err) {
      console.warn('[GrapesPageEditor] Error fetching forms/templates:', err);
      setFormsError('Forms could not be loaded.');
    } finally {
      setFormsLoading(false);
    }
  };

  const insertFormTemplate = (form) => {
    const editor = editorRef.current;
    if (!editor || !form) return;

    const htmlToInsert = buildFormHtml(form, { isTemplate: true });
    const selected = editor.getSelected?.();

    isSyncingRef.current = true;
    try {
      if (selected && typeof selected.append === 'function') {
        selected.append(htmlToInsert);
      } else {
        editor.addComponents(htmlToInsert);
      }
      editor.refresh();
    } catch (err) {
      console.warn('[GrapesPageEditor] insertFormTemplate failed:', err);
    } finally {
      isSyncingRef.current = false;
    }

    onChange?.({ html: editor.getHtml(), css: editor.getCss() });
  };

  const insertBasicBlock = (type) => {
    const editor = editorRef.current;
    if (!editor) return;

    const blocks = {
      section: '<section style="padding: 56px 32px; background: #f8fafc;"><div style="max-width: 960px; margin: 0 auto;"><h2 style="margin: 0 0 12px; font-family: sans-serif; color: #111827;">New section</h2><p style="margin: 0; font-family: sans-serif; color: #4b5563; line-height: 1.6;">Add your website content here.</p></div></section>',
      text: '<div style="padding: 16px 0; font-family: sans-serif; color: #111827;"><h3 style="margin: 0 0 8px;">Heading</h3><p style="margin: 0; color: #4b5563; line-height: 1.6;">Write your content here.</p></div>',
      image: '<div style="padding: 16px 0;"><img src="/placeholder-image.png" alt="Placeholder" style="display: block; width: 100%; max-width: 640px; min-height: 220px; object-fit: cover; border-radius: 8px; background: #e5e7eb;" /></div>',
      button: '<a href="#" style="display: inline-block; padding: 12px 22px; border-radius: 8px; background: #2563eb; color: #ffffff; text-decoration: none; font-family: sans-serif; font-weight: 700;">Call to action</a>',
    };

    isSyncingRef.current = true;
    try {
      editor.addComponents(blocks[type] || blocks.section);
      editor.refresh();
    } catch (err) {
      console.warn('[GrapesPageEditor] insertBasicBlock failed:', err);
    } finally {
      isSyncingRef.current = false;
    }

    onChange?.({ html: editor.getHtml(), css: editor.getCss() });
  };

  const config = useMemo(() => ({
    height,
    notice: false,
    storageManager: false,
    panels: { defaults: [] },
    assetManager: {
      ...assetManager,
      // NOTE: We use a custom uploadFile handler below instead of relying on
      // GrapesJS's built-in upload behaviour. The built-in uploader appends
      // '[]' to the uploadName (sending 'file[]'), but our backend multer
      // middleware uses upload.single('file') which expects exactly 'file'.
      // This field-name mismatch caused multer to silently ignore the file,
      // returning "No file uploaded".
      upload: uploadUrl,
      uploadName: 'file',
      embedAsBase64: false,
      autoAdd: true,
      showUrlInput: true,
      headers: {},
      // Custom upload handler — bypasses GrapesJS's default FormData logic
      // so we can control the exact field name sent to the server.
      uploadFile: (e) => {
        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        if (!files || files.length === 0) return;

        // Append each file with field name 'file' (matches multer.single('file'))
        // For single-file upload; if multiple files are dropped we upload them
        // sequentially to stay compatible with multer.single().
        const uploadSingle = async (file) => {
          const fd = new FormData();
          fd.append('file', file);
          if (websiteIdRef.current) {
            fd.append('websiteId', websiteIdRef.current);
          }

          try {
            const res = await fetch(uploadUrl, {
              method: 'POST',
              body: fd,
              // Do NOT set Content-Type — the browser sets it automatically
              // with the correct multipart boundary.
            });

            if (!res.ok) {
              const errText = await res.text().catch(() => res.statusText);
              console.error('[GrapesPageEditor] upload failed:', res.status, errText);
              return;
            }

            const json = await res.json();

            // Normalise response: backend returns { data: { src, ... } }
            // GrapesJS expects an array of assets.
            const assets = Array.isArray(json?.data)
              ? json.data
              : json?.data?.src
                ? [json.data]
                : [];

            // Add each uploaded asset to the AssetManager
            if (editorRef.current?.AssetManager) {
              for (const asset of assets) {
                editorRef.current.AssetManager.add(asset);
              }
            }
          } catch (err) {
            console.error('[GrapesPageEditor] uploadFile error:', err);
          }
        };

        // Process all dropped/selected files sequentially
        (async () => {
          for (let i = 0; i < files.length; i++) {
            await uploadSingle(files[i]);
          }
          // Refresh assets from backend after all uploads complete
          if (editorRef.current) {
            syncAssetsFromBackend(editorRef.current, websiteIdRef.current).catch(() => {});
          }
        })();
      },
    },
    plugins: [presetWebpage],
    pluginsOpts: {
      [presetWebpage.name || 'grapesjs-preset-webpage']: {},
    },
    canvas: {
      // Baseline styles injected at init; page-specific links are injected
      // dynamically by applyContentToEditor once the canvas is ready.
      styles: [
        'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap',
      ],
    },
  }), [height, assetManager, uploadUrl, websiteId]);

  // ── applyContentToEditor ─────────────────────────────────────────────────
  //
  // Called whenever a new page's content needs to be loaded into the editor.
  //
  // Strategy for CSS injection (two complementary paths):
  //
  //   Path A — editor.setStyle(css)
  //     Feeds GrapesJS's CSS Rule model. Works well for simple selectors and
  //     lets the Style Manager display/edit rules. However GrapesJS partially
  //     drops @font-face, @keyframes, @import, and complex at-rules.
  //
  //   Path B — injectCanvasStyle(editor, css, 'page-raw-css')
  //     Writes a <style> element directly into the canvas iframe <head> with a
  //     stable key so it is replaced (not duplicated) on re-renders. This is
  //     the source of truth for all CSS that GrapesJS's parser cannot handle.
  //
  //   Path C — injectCanvasLink(editor, href) per externalLink
  //     Writes <link rel="stylesheet"> for every external URL extracted from
  //     the original HTML (Google Fonts, icon CDNs, framework CSS, etc.).
  //
  // All three paths run together so the canvas sees exactly what a browser
  // would see when loading the original page.
  // ─────────────────────────────────────────────────────────────────────────

  // FIX 4/5: applyContentToEditor is now async so it can await stylesheet loads
  // before calling setComponents. The previous synchronous version fired
  // setComponents immediately while external sheets were still being fetched,
  // producing a correctly-styled canvas after a refresh (cache hit) but an
  // unstyled one on first load (cache miss).
  //
  // Corrected pipeline order:
  //   1. Populate AssetManager with all image URLs (so <img> resolves on first paint).
  //   2. Inject inline <style> (Path B) — synchronous DOM write, awaited for doc readiness.
  //   3. Inject + AWAIT all external <link> stylesheets (Path C) via Promise.all().
  //   4. editor.setStyle(css) (Path A) — GrapesJS rule model, runs after sheets are ready.
  //   5. editor.setComponents(html) — canvas renders into an already-styled document.
  //   6. FIX 6: re-inject the inline <style> block because setComponents rewrites
  //      the iframe head and can discard styles injected in step 2.
  //   7. FIX 7: force a full canvas repaint via the Canvas.getBody() reflow +
  //      editor.refresh() rather than only refresh() which is a layout hint.
  // ─────────────────────────────────────────────────────────────────────────
  const applyContentToEditor = async (editor, html, css, externalLinks, key) => {
    const currentHtml = editor.getHtml();
    const htmlIsEmpty = !html || html.length === 0;
    const cssIsEmpty  = !css  || css.length  === 0;

    // ── 1. Preload assets into AssetManager BEFORE setComponents ─────────
    if (!htmlIsEmpty) {
      try { populateAssetManagerFromHtml(editor, html); }
      catch (e) { console.warn('[GrapesPageEditor] populateAssetManagerFromHtml failed:', e); }
    }

    // ── 2. Inject inline <style> BEFORE setComponents (Path B) ───────────
    // Awaiting here ensures the iframe doc is ready and the block is in the
    // head before GrapesJS parses components.
    if (!cssIsEmpty) {
      try { await injectCanvasStyle(editor, css, 'page-raw-css'); }
      catch (e) { console.warn('[GrapesPageEditor] injectCanvasStyle (pre) failed:', e); }
    }

    // ── 3. Inject external stylesheets and WAIT for every one (Path C) ───
    // FIX 5: Promise.all() blocks until every external sheet is fully loaded.
    // This is the primary cause of the first-load FOUC: on a cache miss each
    // sheet takes a network round-trip; setComponents must not run until done.
    const links = Array.isArray(externalLinks) ? externalLinks : [];
    if (links.length > 0) {
      try {
        await Promise.all(
          links
            .filter(({ href }) => !!href)
            .map(({ href }) => injectCanvasLink(editor, href))
        );
      } catch (e) {
        // Non-fatal: log and continue — a failed CDN sheet should not block render.
        console.warn('[GrapesPageEditor] one or more external sheets failed to load:', e);
      }
    }

    // Stale-editor guard: the editor may have been destroyed while we awaited.
    if (editorRef.current !== editor || editor.destroyed) return;

    // ── 4. Feed parsed CSS into GrapesJS rule model (Path A) ─────────────
    // Runs after sheets are ready so the internal model and visual state agree.
    if (!cssIsEmpty) {
      isSyncingRef.current = true;
      try {
        const currentCss = editor.getCss();
        if (css !== currentCss) editor.setStyle(css);
      }
      catch (e) { console.warn('[GrapesPageEditor] setStyle failed:', e); }
      finally { isSyncingRef.current = false; }
    }

    // ── 5. Set HTML components ────────────────────────────────────────────
    // All stylesheets are loaded; the canvas will render fully styled on the
    // very first paint — no refresh required.
    if (!htmlIsEmpty && html !== currentHtml) {
      isSyncingRef.current = true;
      try { editor.setComponents(html); }
      catch (e) { console.warn('[GrapesPageEditor] setComponents failed:', e); }
      finally { isSyncingRef.current = false; }
    }

    // ── 6. Re-inject inline <style> after setComponents ──────────────────
    // FIX 6: editor.setComponents() rewrites the iframe body and can discard
    // <style> blocks that were injected into the head in step 2. Re-injecting
    // immediately after guarantees the styles survive the component parse.
    if (!cssIsEmpty) {
      try { await injectCanvasStyle(editor, css, 'page-raw-css'); }
      catch (e) { console.warn('[GrapesPageEditor] injectCanvasStyle (post) failed:', e); }
    }

    // ── 7. Force a complete canvas repaint ────────────────────────────────
    // FIX 7: editor.refresh() alone is a layout hint and does not trigger a
    // full repaint. Accessing Canvas.getBody() forces a reflow synchronously,
    // then refresh() tells GrapesJS to recalculate its component bounding boxes.
    requestAnimationFrame(() => {
      try {
        if (editorRef.current === editor && !editor.destroyed) {
          try { editor.Canvas.getBody(); } catch (_) {} // trigger reflow
          editor.refresh();
          console.log('[GrapesPageEditor] refreshed, component count:',
            editor.getWrapper()?.components()?.length ?? 0);
        }
      } catch (e) {
        console.warn('[GrapesPageEditor] refresh failed:', e);
      }
    });

    loadedForPageKeyRef.current = key;
  };

  // ── Effect 1: initialise GrapesJS once per mount ─────────────────────────
  useEffect(() => {
    if (!holderRef.current) return;
    if (editorRef.current) return; // StrictMode double-invoke guard

    const editor = grapesjs.init({
      ...config,
      container: holderRef.current,
    });

    editorRef.current    = editor;
    canvasReadyRef.current    = false;
    pendingContentRef.current = null;

    setMountEpoch((n) => n + 1);

    editor.on('load', async () => {
      if (editorRef.current !== editor) {
        console.warn('[GrapesPageEditor] stale load ignored', { pageKey });
        return;
      }

      canvasReadyRef.current = true;

      // Load backend media assets FIRST so images in the HTML resolve in the
      // AssetManager panel immediately on open.
      await syncAssetsFromBackend(editor, websiteIdRef.current);

      const pending = pendingContentRef.current;
      if (pending) {
        pendingContentRef.current = null;
        try {
          // FIX 9: await the async pipeline — the previous call was not awaited,
        // so any errors were silently swallowed and timing was not preserved.
        await applyContentToEditor(
            editor,
            pending.html,
            pending.css,
            pending.externalLinks,
            pending.pageKey
          );
        } catch (e) {
          console.error('[GrapesPageEditor] applyContentToEditor in load handler failed:', e);
        }
      } else {
        console.log('[GrapesPageEditor] no pending on load, checking props', {
          initialHtmlLen: initialHtml?.length,
          initialCssLen:  initialCss?.length,
          initialHeadLinksLen: initialHeadLinks?.length,
        });
      }

      await fetchFormTools(editor);
    });

    // ── Upload response normalisation ──────────────────────────────────────
    // GrapesJS expects: { data: [ { src, name, ... } ] }
    // Backend returns:  { success: true, data: { src, name, ... } }
    editor.on('asset:upload:response', (response) => {
      try {
        if (Array.isArray(response?.data)) return;
        if (response?.data?.src) {
          response.data = [response.data];
        }
      } catch (e) {
        console.warn('[GrapesPageEditor] asset:upload:response normalisation failed:', e);
      }
    });

    // After a successful upload, refresh the asset panel from the backend so
    // the newly uploaded image appears for all pages of this website.
    editor.on('asset:upload:end', () => {
      syncAssetsFromBackend(editor, websiteIdRef.current).catch(() => {});
    });

    const handler = () => {
      if (isSyncingRef.current) return;
      // FIX: Prevent async initialization events (asset:add, deferred component:add)
      // from firing onChange before the initial content pipeline has completely finished.
      if (loadedForPageKeyRef.current !== pageKey) return;
      if (!onChange) return;
      onChange({ html: editor.getHtml(), css: editor.getCss() });
    };

    editor.on('component:update',     handler);
    editor.on('component:add',        handler);
    editor.on('component:remove',     handler);
    editor.on('styleManager:change',  handler);
    editor.on('style:change',         handler);
    editor.on('canvas:drop',          handler);
    editor.on('asset:add',            handler);
    editor.on('asset:upload',         handler);

    onEditorReady?.(editor);

    return () => {
      editorRef.current         = null;
      canvasReadyRef.current    = false;
      pendingContentRef.current = null;
      loadedForPageKeyRef.current = null;
      isSyncingRef.current      = false;

      try { editor.destroy(); }
      catch (e) { console.warn('[GrapesPageEditor] destroy failed:', e); }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Effect 2: load content when page / HTML / CSS props change ────────────
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const current = loadedForPageKeyRef.current;
    if (current === pageKey) {
      const currentHtml = editor.getHtml();
      const hasRealContent = currentHtml && currentHtml.length > 200;
      if (hasRealContent) return;
    }

    const { componentsHtml, stylesCss, externalLinks } =
      normalizeToBodyAndCss(initialHtml, initialCss, initialHeadLinks);

    const nextHtml = String(componentsHtml ?? '');
    const nextCss  = String(stylesCss ?? '');

    if (canvasReadyRef.current) {
      // applyContentToEditor is async; useEffect cannot return a Promise so we
      // fire-and-forget with an explicit .catch() to surface any errors.
      applyContentToEditor(editor, nextHtml, nextCss, externalLinks, pageKey)
        .catch((e) => console.warn('[GrapesPageEditor] applyContentToEditor (effect) failed:', e));
    } else {
      pendingContentRef.current = {
        html:          nextHtml,
        css:           nextCss,
        externalLinks: externalLinks,
        pageKey,
      };
    }
  }, [initialHtml, initialCss, initialHeadLinks, pageKey, mountEpoch]);

  return (
    <div
      style={{
        height,
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '280px minmax(0, 1fr)',
        minHeight: 0,
      }}
    >
      <aside
        style={{
          minHeight: 0,
          overflow: 'auto',
          borderRight: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          padding: 12,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            padding: 4,
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
            marginBottom: 14,
          }}
        >
          {[
            { key: 'basic', label: 'Basic' },
            { key: 'forms', label: 'Forms' },
          ].map((tool) => (
            <button
              key={tool.key}
              type="button"
              onClick={() => setActiveTool(tool.key)}
              style={{
                height: 34,
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                background: activeTool === tool.key ? 'var(--accent-primary)' : 'transparent',
                color: activeTool === tool.key ? '#fff' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              {tool.label}
            </button>
          ))}
        </div>

        {activeTool === 'basic' ? (
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-tertiary)', marginBottom: 10 }}>
              BASIC
            </div>
            {[
              { key: 'section', label: 'Section', desc: 'Wide content band' },
              { key: 'text', label: 'Text', desc: 'Heading and paragraph' },
              { key: 'image', label: 'Image', desc: 'Responsive image' },
              { key: 'button', label: 'Button', desc: 'Call to action' },
            ].map((block) => (
              <button
                key={block.key}
                type="button"
                onClick={() => insertBasicBlock(block.key)}
                style={{
                  width: '100%',
                  minHeight: 58,
                  textAlign: 'left',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  marginBottom: 8,
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'block', fontWeight: 800, fontSize: 13, marginBottom: 3 }}>
                  {block.label}
                </span>
                <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.3 }}>
                  {block.desc}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-tertiary)' }}>
                FORM TEMPLATES
              </div>
              <button
                type="button"
                onClick={() => fetchFormTools(editorRef.current)}
                disabled={formsLoading}
                style={{
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  borderRadius: 6,
                  padding: '5px 8px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: formsLoading ? 'default' : 'pointer',
                }}
              >
                {formsLoading ? 'Loading' : 'Refresh'}
              </button>
            </div>

            {formsError && (
              <div style={{ border: '1px solid rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--accent-danger)', borderRadius: 8, padding: 10, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
                {formsError}
              </div>
            )}

            {!formsLoading && !formsError && formTemplates.length === 0 && (
              <div style={{ border: '1px dashed var(--border-color)', color: 'var(--text-secondary)', borderRadius: 8, padding: 14, fontSize: 13, lineHeight: 1.5 }}>
                No saved form templates yet.
              </div>
            )}

            {formTemplates.map((form) => (
              <div
                key={form._id || form.id}
                style={{
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 13, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {form.name || 'Form template'}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
                  {(form.fields || []).length} fields
                </div>
                <button
                  type="button"
                  onClick={() => insertFormTemplate(form)}
                  style={{
                    width: '100%',
                    height: 34,
                    border: 'none',
                    borderRadius: 6,
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Use form
                </button>
              </div>
            ))}
          </div>
        )}
      </aside>

      <div
        ref={holderRef}
        style={{
          minHeight: 0,
          width: '100%',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      />
    </div>
  );
};

export default GrapesPageEditor;
