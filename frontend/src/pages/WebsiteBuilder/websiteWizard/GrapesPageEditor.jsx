import React, { useEffect, useMemo, useRef } from 'react';
import grapesjs from 'grapesjs';
import presetWebpage from 'grapesjs-preset-webpage';

// GrapesJS editor wrapper
// - Prevents infinite update loops between GrapesJS and React
// - Accepts backend responses that may be full HTML documents
//   by extracting <body> HTML for components and <style> tag CSS for styles.

const GrapesPageEditor = ({
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

  // Prevent re-applying initial content repeatedly
  const contentLoadedRef = useRef(false);

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

      // Merge extracted <style> css with provided initialCss
      const mergedCss = [cssBase.trim(), extractedCss]
        .filter(Boolean)
        .join('\n');

      // If bodyHtml looks like a parsed result (even if input wasn't full doc), use it.
      return {
        componentsHtml: bodyHtml,
        stylesCss: mergedCss,
      };
    } catch {
      // Fallback: treat initialHtml as GrapesJS components directly
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

    // Attach events
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
      contentLoadedRef.current = false;
      isSyncingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply incoming props to GrapesJS.
  // - Only loads content once
  // - Only calls setComponents/setStyle when editor content actually differs
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const { componentsHtml, stylesCss } = normalizeToBodyAndCss(initialHtml, initialCss);

    const nextHtml = String(componentsHtml ?? '');
    const nextCss = String(stylesCss ?? '');

    const currentHtml = editor.getHtml();
    const currentCss = editor.getCss();

    const htmlChanged = nextHtml !== currentHtml;
    const cssChanged = nextCss !== currentCss;

    if (!contentLoadedRef.current) {
      if (!htmlChanged && !cssChanged) {
        contentLoadedRef.current = true;
        return;
      }

      isSyncingRef.current = true;
      try {
        if (htmlChanged) editor.setComponents(nextHtml);
        if (cssChanged) editor.setStyle(nextCss);
      } catch (e) {
        console.warn('[GrapesPageEditor] setComponents/setStyle failed:', e);
      } finally {
        isSyncingRef.current = false;
        contentLoadedRef.current = true;
      }
      return;
    }

    // After initial load: do not clobber user edits unless props truly changed.
    if (htmlChanged || cssChanged) {
      isSyncingRef.current = true;
      try {
        if (htmlChanged) editor.setComponents(nextHtml);
        if (cssChanged) editor.setStyle(nextCss);
      } catch (e) {
        console.warn('[GrapesPageEditor] sync failed:', e);
      } finally {
        isSyncingRef.current = false;
      }
    }
  }, [initialHtml, initialCss]);

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

