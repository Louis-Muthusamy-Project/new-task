import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { readStagedPreviewHtml } from '../utils/previewHtml';

// PagePreviewRoute.jsx — renders at /preview/page/:previewId.
//
// Replaces the old openPagePreview() behaviour of window.open("", "_blank")
// + document.write(...), which always left the new tab's address bar
// showing "about:blank" (no real URL to copy/share/refresh, and nothing
// for the browser history to hang on to).
//
// Instead, openPagePreview() now stages the built preview HTML into
// sessionStorage under a generated id and opens this route with that id in
// the URL. sessionStorage written just before window.open() is inherited by
// the new tab (same-origin auxiliary browsing context), so it's available
// here on first render with no backend round-trip and no change to any of
// openPagePreview's existing callers (BccBuilder, WebsiteEditPage,
// WebsitesTab all keep calling it exactly as before).
export default function PagePreviewRoute() {
  const { previewId } = useParams();
  const [html, setHtml] = useState(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const stored = readStagedPreviewHtml(previewId);
    if (stored) setHtml(stored);
    else setExpired(true);
  }, [previewId]);

  if (expired) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#6b7280',
          textAlign: 'center',
          padding: 24,
        }}
      >
        This preview link has expired. Go back to the editor and click Preview again.
      </div>
    );
  }

  if (!html) return null;

  return (
    <iframe
      title="Page preview"
      srcDoc={html}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 'none' }}
    />
  );
}
