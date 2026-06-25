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

  // Prevent recursion when we programmatically set GrapesJS content
  const isSyncingRef = useRef(false);

  // Tracks which pageKey has been successfully written to the canvas.
  // ONLY set inside applyContentToEditor() — never pre-emptively.
  // This was the primary bug: setting it before the canvas was ready
  // meant post-save / post-refresh content was permanently blocked.
  const loadedForPageKeyRef = useRef(null);

  // FIX: mountEpoch is a state counter that increments inside Effect 1 each
  // time the editor is truly initialised. Adding it to Effect 2's dep array
  // forces Effect 2 to re-run after every remount — including when
  // initialHtml/initialCss/pageKey are byte-for-byte identical to the previous
  // mount. Without this React silently skips Effect 2 on same-page navigation,
  // leaving pendingContentRef=null and the canvas blank.
  const [mountEpoch, setMountEpoch] = useState(0);

  // GrapesJS canvas lives inside an <iframe> whose DOMContentLoaded fires
  // 100–300 ms after grapesjs.init(). Calling setComponents before that event
  // writes to a pre-iframe node the iframe startup then overwrites, leaving
  // Layers populated but the visible canvas blank.
  //
  // Strategy:
  //   • canvasReadyRef flips true on editor.on('load').
  //   • Content arriving before 'load' is queued in pendingContentRef.
  //   • The 'load' handler drains the queue once the iframe is safe to write to.
  const canvasReadyRef = useRef(false);
  const pendingContentRef = useRef(null); // { html, css, pageKey } | null

  // Stable config — container is passed at init time, not baked into the memo.
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
  // assetManager default `{}` is a new reference each render when the caller
  // omits the prop. That's fine here — config is only consumed by Effect 1
  // which has deps:[], so the memo churn has no runtime consequence.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

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
      const mergedCss = [cssBase.trim(), extractedCss].filter(Boolean).join('\n');

      return { componentsHtml: bodyHtml, stylesCss: mergedCss };
    } catch {
      return { componentsHtml: html, stylesCss: cssBase };
    }
  };

  // ── Shared helper: apply html+css to a ready editor ──────────────────────
  // Must only be called after canvasReadyRef.current === true.
  // Sets loadedForPageKeyRef AFTER writing — never before.
  const applyContentToEditor = (editor, html, css, key) => {
    console.log('[GrapesPageEditor] applyContentToEditor', {
      key,
      htmlLen: html.length,
      cssLen: css.length,
    });


    const currentHtml = editor.getHtml();
    const currentCss  = editor.getCss();

    // Safety valve A (your rule): prevent empty incoming HTML from overwriting substantial current HTML.
    const currentLen = String(currentHtml || '').length;
    if (html.length === 0 && currentLen > 1000) {
      console.warn('[GrapesPageEditor] Blocked empty HTML overwrite', {
        key,
        currentHtmlLen: currentLen,
        incomingHtmlLen: html.length,
      });
      return;
    }

    // Safety valve B: don't overwrite substantial existing content with near-empty input.
    const nextTrimLen = html.trim().length;
    const currentHtmlTrimLen = String(currentHtml || '').trim().length;
    if (nextTrimLen < 100 && currentHtmlTrimLen > 1000) {
      console.warn('[GrapesPageEditor] blocked suspicious near-empty overwrite', {
        key, nextTrimLen, currentHtmlTrimLen,
      });
      return;
    }


    if (html !== currentHtml) {
      isSyncingRef.current = true;
      try   { editor.setComponents(html); }
      finally { isSyncingRef.current = false; }
    }

    if (css !== currentCss) {
      isSyncingRef.current = true;
      try   { editor.setStyle(css); }
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

    console.log('[GrapesPageEditor] EDITOR_INIT', { pageKey });

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
      console.log('[GrapesPageEditor] CANVAS_READY', { pageKey });

      const pending = pendingContentRef.current;
      if (pending) {
        pendingContentRef.current = null;
        console.log('[GrapesPageEditor] draining pending', { pendingPageKey: pending.pageKey });
        applyContentToEditor(editor, pending.html, pending.css, pending.pageKey);
      }
    });

    const handler = () => {
      if (isSyncingRef.current) return;
      if (!onChange) return;
      onChange({ html: editor.getHtml(), css: editor.getCss() });
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
      console.log('[GrapesPageEditor] EDITOR_DESTROY', { pageKey });

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

  // ── Effect 2: apply content when props change or after a fresh mount ──────
  //
  // `mountEpoch` in the dep array is the critical addition. It ensures this
  // effect always runs after Effect 1 creates a new editor, even when the
  // parent passes identical initialHtml/initialCss/pageKey values — which
  // happens on refresh (cache hit) or navigating back to the same page.
  //
  // Queue-or-apply:
  //   • canvas ready  → applyContentToEditor() immediately.
  //   • canvas not ready → pendingContentRef queued; 'load' handler drains.
  //
  // The loadedForPageKeyRef gate is intentionally NOT set when queuing.
  // It is only set inside applyContentToEditor(). This means:
  //   (a) a queued-but-not-yet-applied key can still receive a fresh delivery,
  //   (b) post-save server-normalised HTML can always reach the canvas.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Already live on canvas — skip to avoid redundant setComponents calls.
    if (loadedForPageKeyRef.current === pageKey) return;

    const { componentsHtml, stylesCss } = normalizeToBodyAndCss(initialHtml, initialCss);
    const nextHtml = String(componentsHtml ?? '');
    const nextCss  = String(stylesCss  ?? '');

    console.log('[GrapesPageEditor] Effect2 content delivery', {
      pageKey,
      htmlLen: nextHtml.length,
      cssLen:  nextCss.length,
      canvasReady: canvasReadyRef.current,
      mountEpoch,
    });

    if (canvasReadyRef.current) {
      applyContentToEditor(editor, nextHtml, nextCss, pageKey);
    } else {
      // Queue — 'load' will drain. Gate stays open (loadedForPageKeyRef unchanged).
      console.log('[GrapesPageEditor] queuing content (canvas not ready)', {
        pageKey,
        queuedHtmlLen: nextHtml.length,
        queuedCssLen: nextCss.length,
      });
      pendingContentRef.current = { html: nextHtml, css: nextCss, pageKey };
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
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