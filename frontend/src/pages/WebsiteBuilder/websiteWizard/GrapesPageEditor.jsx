import React, { useEffect, useMemo, useRef } from 'react';
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

  // Prevent recursion when we programmatically set GrapesJS content
  const isSyncingRef = useRef(false);

  // Only apply incoming props once per pageKey
  const loadedForPageKeyRef = useRef(null);

  // ── FIX: canvas-ready gate ────────────────────────────────────────────────
  // GrapesJS initialises its canvas inside an <iframe>. The iframe's
  // DOMContentLoaded fires ASYNCHRONOUSLY — typically 100-300 ms after
  // grapesjs.init(). If setComponents/setStyle are called before that event
  // resolves, GrapesJS writes into a pre-iframe DOM node that the iframe
  // startup then OVERWRITES, leaving the canvas blank while the internal
  // component tree (Layers panel) already has the data.
  //
  // Fix strategy:
  //   • Keep a boolean `canvasReady` that flips to true on editor.on('load').
  //   • If content arrives before the canvas is ready, stash it in
  //     `pendingContentRef` (a queue of one) instead of calling setComponents.
  //   • Inside the 'load' handler, drain `pendingContentRef` — by now the
  //     iframe is fully initialised and setComponents is safe.
  //   • React StrictMode double-mount is handled by the existing
  //     `if (editorRef.current) return;` guard in Effect 1.
  const canvasReadyRef = useRef(false);
  const pendingContentRef = useRef(null); // { html, css, pageKey } | null

  const config = useMemo(() => {
    return {
      height,
      notice: false,
      storageManager: false,
      panels: { defaults: [] },
      assetManager: {
        ...assetManager,
      },
      container: holderRef.current,
      plugins: [presetWebpage],
      pluginsOpts: {
        [presetWebpage.name || 'grapesjs-preset-webpage']: {
          // keep defaults
        },
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

      const styleEls = Array.from(doc.querySelectorAll('style'));
      const extractedCss = styleEls
        .map((el) => el.textContent || '')
        .map((t) => t.trim())
        .filter(Boolean)
        .join('\n');

      const bodyHtml = doc.body ? doc.body.innerHTML || '' : '';

      const mergedCss = [cssBase.trim(), extractedCss]
        .filter(Boolean)
        .join('\n');

      return {
        componentsHtml: bodyHtml,
        stylesCss: mergedCss,
      };
    } catch {
      return {
        componentsHtml: html,
        stylesCss: cssBase,
      };
    }
  };

  // ── Shared helper: apply html+css to a ready editor ──────────────────────
  // Always called AFTER canvasReadyRef is true.
  const applyContentToEditor = (editor, html, css, key) => {
    console.log('PROJECT_DATA_LOADED', { pageKey: key, htmlLen: html.length, cssLen: css.length });

    const currentHtml = editor.getHtml();
    const currentCss  = editor.getCss();

    // Empty content protection: don't clobber real content with near-empty string
    const nextTrimLen        = html.trim().length;
    const currentHtmlTrimLen = String(currentHtml || '').trim().length;
    if (nextTrimLen < 100 && currentHtmlTrimLen > 1000) {
      console.warn('[GrapesPageEditor] Blocked suspicious overwrite', {
        key,
        nextTrimLen,
        currentHtmlTrimLen,
      });
      return;
    }

    const htmlChanged = html !== currentHtml;
    const cssChanged  = css  !== currentCss;

    if (htmlChanged) {
      isSyncingRef.current = true;
      try {
        editor.setComponents(html);
      } finally {
        isSyncingRef.current = false;
      }
    }

    if (cssChanged) {
      isSyncingRef.current = true;
      try {
        editor.setStyle(css);
      } finally {
        isSyncingRef.current = false;
      }
    }

    // ── FIX: force canvas re-render after programmatic content load ───────
    // Even when setComponents is called at the right time, GrapesJS can
    // finish its internal model update without re-painting the iframe.
    // editor.refresh() triggers a synchronous re-render of the canvas.
    // We wrap it in requestAnimationFrame so it runs after the browser has
    // committed the current paint cycle, guaranteeing the canvas is visible.
    requestAnimationFrame(() => {
      try {
        if (!editor.destroyed) {
          editor.refresh();
          console.log(
            'COMPONENT_COUNT',
            editor.getWrapper()?.components()?.length ?? 0
          );
        }
      } catch (e) {
        console.warn('[GrapesPageEditor] refresh failed:', e);
      }
    });

    loadedForPageKeyRef.current = key;
  };

  // ── Effect 1: initialise GrapesJS once ───────────────────────────────────
  useEffect(() => {
    if (!holderRef.current) return;
    if (editorRef.current) return; // guard against StrictMode double-mount

    console.log('EDITOR_INIT', { pageKey });

    const editor = grapesjs.init({
      ...config,
      container: holderRef.current,
    });

    editorRef.current = editor;
    canvasReadyRef.current = false;
    pendingContentRef.current = null;

    // ── FIX: wait for canvas iframe before loading content ────────────────
    // 'load' fires when the GrapesJS canvas iframe has fully initialised its
    // document. Only then is it safe to call setComponents / setStyle.
    editor.on('load', () => {
      canvasReadyRef.current = true;
      console.log('EDITOR_READY', { pageKey });

      // Drain any content that arrived before the canvas was ready
      const pending = pendingContentRef.current;
      if (pending) {
        pendingContentRef.current = null;
        console.log('EDITOR_READY: draining pending content', { pendingPageKey: pending.pageKey });
        applyContentToEditor(editor, pending.html, pending.css, pending.pageKey);
      }
    });

    const handler = () => {
      if (isSyncingRef.current) return;
      if (!onChange) return;
      onChange({
        html: editor.getHtml(),
        css: editor.getCss(),
      });
    };

    editor.on('component:update',    handler);
    editor.on('component:add',       handler);
    editor.on('component:remove',    handler);
    editor.on('styleManager:change', handler);
    editor.on('style:change',        handler);
    editor.on('canvas:drop',         handler);
    editor.on('asset:add',           handler);
    editor.on('asset:upload',        handler);

    onEditorReady?.(editor);

    return () => {
      console.log('EDITOR_INIT cleanup: destroying editor', { pageKey });
      canvasReadyRef.current = false;
      pendingContentRef.current = null;
      try {
        editor.destroy();
      } catch (e) {
        console.warn('[GrapesPageEditor] destroy failed:', e);
      }
      editorRef.current = null;
      loadedForPageKeyRef.current = null;
      isSyncingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Effect 2: apply content when props arrive / pageKey changes ───────────
  // This effect fires whenever initialHtml/initialCss/pageKey change.
  // The editor may or may not have its canvas ready yet.
  //
  // ── FIX: queue-or-apply pattern ──────────────────────────────────────────
  //   • Canvas ready  → apply immediately via applyContentToEditor().
  //   • Canvas not yet ready → store in pendingContentRef; the 'load' handler
  //     above will drain it once the iframe is up.
  //   • Already loaded for this pageKey → skip (prevents double-write).
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Skip if we've already loaded content for this exact page
    if (loadedForPageKeyRef.current === pageKey) return;

    const { componentsHtml, stylesCss } = normalizeToBodyAndCss(initialHtml, initialCss);
    const nextHtml = String(componentsHtml ?? '');
    const nextCss  = String(stylesCss  ?? '');

    console.log('PAGE_FETCHED', {
      pageKey,
      htmlLen: nextHtml.length,
      cssLen:  nextCss.length,
      canvasReady: canvasReadyRef.current,
    });

    if (canvasReadyRef.current) {
      // Safe to apply immediately
      applyContentToEditor(editor, nextHtml, nextCss, pageKey);
    } else {
      // Queue: 'load' handler will pick this up
      console.log('PAGE_FETCHED: canvas not ready yet — queuing content', { pageKey });
      pendingContentRef.current = { html: nextHtml, css: nextCss, pageKey };
      // Mark pageKey so a subsequent prop update with identical pageKey doesn't
      // re-queue (it will be loaded once the 'load' event fires)
      loadedForPageKeyRef.current = pageKey;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHtml, initialCss, pageKey]);

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