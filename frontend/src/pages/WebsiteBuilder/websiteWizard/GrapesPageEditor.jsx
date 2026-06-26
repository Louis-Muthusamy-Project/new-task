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
      assetManager: { ...assetManager },
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
  }, [height]);

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
      body.querySelectorAll(`
      style,
      script,
      #spinner,
      .spinner,
      .preloader,
      .loader
    `).forEach(el => el.remove());

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

  const applyContentToEditor = (editor, html, css, key) => {

    const currentHtml = editor.getHtml();
    const currentCss = editor.getCss();

    // Don't block on empty HTML - just skip the setComponents call but still set the gate
    const htmlIsEmpty = html.length === 0;
    const cssIsEmpty = css.length === 0;

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

    // Force canvas repaint after programmatic update.
    // rAF ensures this runs after the browser's current paint cycle.
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

    // Gate closes HERE — only after a successful write to the canvas.
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