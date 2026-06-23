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

    // Try to parse as full HTML document
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

  useEffect(() => {
    if (!holderRef.current) return;
    if (editorRef.current) return; // prevent duplicate init

    const editor = grapesjs.init({
      ...config,
      container: holderRef.current,
    });

    editorRef.current = editor;

    const handler = () => {
      if (isSyncingRef.current) return;
      if (!onChange) return;

      onChange({
        html: editor.getHtml(),
        css: editor.getCss(),
      });
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

  // Apply incoming props to GrapesJS.
  // Root fix: prevent clobbering after the first successful load for a given pageKey.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const { componentsHtml, stylesCss } = normalizeToBodyAndCss(initialHtml, initialCss);
    const nextHtml = String(componentsHtml ?? '');
    const nextCss = String(stylesCss ?? '');

    console.log('[INITIAL HTML LENGTH]', initialHtml?.length);
    console.log('[SET COMPONENTS]', nextHtml?.length);
    console.log('[CURRENT HTML]', editor.getHtml()?.length);

    const currentHtml = editor.getHtml();
    const currentCss = editor.getCss();

    const htmlChanged = nextHtml !== currentHtml;
    const cssChanged = nextCss !== currentCss;

    // Empty content protection (requested)
    const nextTrimLen = nextHtml.trim().length;
    const currentHtmlTrimLen = String(currentHtml || '').trim().length;
    if (nextTrimLen < 100 && currentHtmlTrimLen > 1000) {
      console.warn('Blocked suspicious overwrite', {
        pageKey,
        nextTrimLen,
        currentHtmlTrimLen,
      });
      return;
    }

    const isFirstApplyForThisPage = loadedForPageKeyRef.current !== pageKey;

    if (!isFirstApplyForThisPage) {
      // After initial load for this pageKey: ignore prop updates
      if (htmlChanged || cssChanged) {
        console.warn('[GrapesPageEditor] Ignored prop overwrite after initial load', {
          pageKey,
          htmlLen: nextHtml.length,
          cssLen: nextCss.length,
        });
      }
      return;
    }

    // First apply for this pageKey
    if (htmlChanged) {
      isSyncingRef.current = true;
      try {
        editor.setComponents(nextHtml);
      } finally {
        isSyncingRef.current = false;
      }
    }

    if (cssChanged) {
      isSyncingRef.current = true;
      try {
        editor.setStyle(nextCss);
      } finally {
        isSyncingRef.current = false;
      }
    }

    loadedForPageKeyRef.current = pageKey;
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

