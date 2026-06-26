import React, { useEffect, useMemo, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import presetWebpage from 'grapesjs-preset-webpage';

const GrapesPageEditor = ({
  pageKey,
  height = '100%',
  initialHtml = '',
  initialCss = '',
  onChange,
  assetManager = {},
  onEditorReady,
}) => {
  const holderRef = useRef(null);
  const editorRef = useRef(null);
  const isSyncingRef = useRef(false);

  const loadedForPageKeyRef = useRef(null);

  const [mountEpoch, setMountEpoch] = useState(0);

  const canvasReadyRef = useRef(false);
  const pendingContentRef = useRef(null);

  const config = useMemo(() => {
    return {
      height,
      notice: false,
      storageManager: false,
      panels: { defaults: [] },
      assetManager: {
        ...assetManager,
        upload: '/api/website-builder/media/upload',
        uploadName: 'file',
        embedAsBase64: false,
        autoAdd: true,
        showUrlInput: true,
      },
      plugins: [presetWebpage],
      pluginsOpts: {
        [presetWebpage.name || 'grapesjs-preset-webpage']: {},
      },
      canvas: {
        styles: [
          'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap',
        ],
      },
    };
  }, [height, assetManager]);


  const normalizeToBodyAndCss = (rawHtml = '', rawCss = '') => {
    const html = String(rawHtml || '');
    const cssBase = String(rawCss || '');

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract only HEAD style tags
      const headStyles = Array.from(doc.head.querySelectorAll('style'));
      const extractedCss = headStyles
        .map(el => el.textContent || '')
        .filter(Boolean)
        .join('\n');

      // Clone body
      const body = doc.body.cloneNode(true);

      // Remove elements that should never appear inside the editor
      body.querySelectorAll('style, script, #spinner, .spinner, .preloader, .loader').forEach(el => el.remove());


      const bodyHtml = body.innerHTML;

      return {
        componentsHtml: bodyHtml,
        stylesCss: [cssBase, extractedCss].filter(Boolean).join('\n'),
      };
    } catch (e) {
      console.error(e);

      return {
        componentsHtml: html,
        stylesCss: cssBase,
      };
    }
  };

  const IMAGE_SRC_RE = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;

  const extractImageSrcsFromHtml = (htmlString) => {
    const srcs = [];
    if (!htmlString) return srcs;

    let m;
    const re = new RegExp(IMAGE_SRC_RE.source, IMAGE_SRC_RE.flags);
    while ((m = re.exec(htmlString)) !== null) {
      const src = m?.[1];
      if (typeof src === 'string' && src.trim()) srcs.push(src.trim());
    }
    return srcs;
  };

  const dedupeBy = (arr, keyFn) => {
    const seen = new Set();
    const out = [];
    for (const item of arr || []) {
      const k = keyFn(item);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(item);
    }
    return out;
  };

  const replaceCloudinaryUrl = (html, oldUrl, newUrl) => {
    if (!html || !oldUrl || !newUrl) return html;
    const escaped = oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return html.replace(new RegExp(`src=["']${escaped}`, 'gi'), `src="${newUrl}`);
  };

  const replaceAllCloudinaryUrls = (html, newBaseUrl) => {
    if (!html || !newBaseUrl) return html;
    return html.replace(/(src=["'])(https?:\/\/res\.cloudinary\.com\/[^"']+)(["'])/gi, (match, prefix, _old, suffix) => {
      return `${prefix}${newBaseUrl}${suffix}`;
    });
  };

  const populateAssetManagerFromHtml = (editor, htmlString) => {
    if (!editor?.AssetManager || typeof editor.AssetManager.add !== 'function') return;

    const srcs = dedupeBy(extractImageSrcsFromHtml(htmlString), (s) => String(s));

    const existing = new Set();
    try {
      const assets = editor.AssetManager.getAll?.() || [];
      for (const a of assets) {
        const url = a?.get?.('src') || a?.attributes?.src || a?.get?.('data')?.src || a?.src;
        if (url) existing.add(String(url));
      }
    } catch (e) { }

    for (const src of srcs) {
      if (existing.has(String(src))) continue;
      editor.AssetManager.add({ src, type: 'image' });
    }
  };

  const applyContentToEditor = (editor, html, css, key) => {
    const currentHtml = editor.getHtml();
    const currentCss = editor.getCss();

    const htmlIsEmpty = html.length === 0;
    const cssIsEmpty = css.length === 0;

    // Restore asset manager BEFORE setting components so img rendering can
    // resolve against the asset library immediately.
    if (!htmlIsEmpty) {
      try {
        populateAssetManagerFromHtml(editor, html);
      } catch (e) {
        console.warn('[GrapesPageEditor] populateAssetManagerFromHtml failed:', e);
      }
    }

    if (!htmlIsEmpty && html !== currentHtml) {
      isSyncingRef.current = true;
      try {
        editor.setComponents(html);
      }
      catch (e) { console.warn('[GrapesPageEditor] setComponents failed:', e); }
      finally { isSyncingRef.current = false; }
    }

    if (!cssIsEmpty && css !== currentCss) {
      isSyncingRef.current = true;
      try { editor.setStyle(css); }
      catch (e) { console.warn('[GrapesPageEditor] setStyle failed:', e); }
      finally { isSyncingRef.current = false; }
    }

    requestAnimationFrame(() => {
      try {
        if (editorRef.current === editor && !editor.destroyed) {
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

    editorRef.current = editor;
    canvasReadyRef.current = false;
    pendingContentRef.current = null;

    // Bump epoch so Effect 2 re-runs even when content props haven't changed.
    // Must call setMountEpoch AFTER editorRef is populated so Effect 2 sees
    // a live editor when it fires.
    setMountEpoch((n) => n + 1);

    // FIX: guard `editorRef.current === editor` so a stale 'load' event from
    // a destroyed editor (StrictMode teardown race) cannot flip canvasReadyRef
    // to true on the wrong instance.
    editor.on('load', () => {
      if (editorRef.current !== editor) {
        console.warn('[GrapesPageEditor] stale load ignored', { pageKey });
        return;
      }

      canvasReadyRef.current = true;

      const pending = pendingContentRef.current;
      if (pending) {
        pendingContentRef.current = null;
        try {
          applyContentToEditor(editor, pending.html, pending.css, pending.pageKey);
        } catch (e) {
          console.error('[GrapesPageEditor] applyContentToEditor in load handler failed:', e);
        }
      }

      // If NO pending content, and we have initialHtml/initialCss props, apply them now
      // (This handles the case where Effect 2 already ran but canvas wasn't ready)
      if (!pending) {
        console.log('[GrapesPageEditor] no pending on load, checking props', { initialHtmlLen: initialHtml?.length, initialCssLen: initialCss?.length });
      }
    });

    const handler = () => {
      if (isSyncingRef.current) return;
      if (!onChange) return;
      onChange({ html: editor.getHtml(), css: editor.getCss() });
    };

    editor.on('component:update', handler);
    editor.on('component:add', handler);
    editor.on('component:remove', handler);
    editor.on('styleManager:change', handler);
    editor.on('style:change', handler);
    editor.on('canvas:drop', handler);
    editor.on('asset:add', handler);
    editor.on('asset:upload', handler);

    onEditorReady?.(editor);

    return () => {

      // Null editorRef FIRST so any in-flight async callbacks (load event,
      // rAF in applyContentToEditor) see editorRef.current !== editor and bail.
      editorRef.current = null;
      canvasReadyRef.current = false;
      pendingContentRef.current = null;
      loadedForPageKeyRef.current = null;
      isSyncingRef.current = false;

      try { editor.destroy(); }
      catch (e) { console.warn('[GrapesPageEditor] destroy failed:', e); }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // CRITICAL FIX: Only skip if we have non-trivial content already loaded.
    // Empty content from initial render must NOT block later real content.
    const current = loadedForPageKeyRef.current;
    if (current === pageKey) {
      const currentHtml = editor.getHtml();
      const hasRealContent = currentHtml && currentHtml.length > 200;
      if (hasRealContent) {
        // Already has meaningful content, skip to avoid redundant setComponents
        return;
      }
      // Has only empty/placeholder content — allow re-apply with real content
    }

    const { componentsHtml, stylesCss } = normalizeToBodyAndCss(initialHtml, initialCss);
    const nextHtml = String(componentsHtml ?? '');
    const nextCss = String(stylesCss ?? '');


    if (canvasReadyRef.current) {
      applyContentToEditor(editor, nextHtml, nextCss, pageKey);
    } else {
      pendingContentRef.current = { html: nextHtml, css: nextCss, pageKey };
    }
  }, [initialHtml, initialCss, pageKey, mountEpoch]);

  return (
    <div
      style={{
        height,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <div
        ref={holderRef}
        style={{
          flex: 1,
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