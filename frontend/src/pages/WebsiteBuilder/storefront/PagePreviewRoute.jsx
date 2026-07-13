import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { readStagedPreview } from '../utils/previewHtml';
import WebsitePagePreview from './WebsitePagePreview';

// PagePreviewRoute.jsx — renders at /preview/page/:previewId.
//
// Two render paths, chosen by what openPagePreview() staged:
//
//   mode: 'static' (no Store linked, or nothing for the Template Import
//   Pipeline to hydrate on this page) — unchanged from before: the
//   prebuilt HTML document goes into an `srcDoc` iframe. Full document
//   isolation, own <head>, own inline <script> execution — exactly what a
//   plain marketing/content page's preview needs and always got.
//
//   mode: 'live' (Website.storeId is set AND this page's pipeline output
//   says content.storeReady) — rendered in-page via WebsitePagePreview,
//   which mounts real React against the Store's public API. This can't be
//   done inside an iframe's srcDoc without a lot of extra cross-document
//   plumbing, and doesn't need to be — Preview Integration's whole point
//   is live data, not a static snapshot, so trading iframe isolation for a
//   real mounted tree here is the right trade.
export default function PagePreviewRoute() {
  const { previewId } = useParams();
  const [payload, setPayload] = useState(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const stored = readStagedPreview(previewId);
    if (stored) setPayload(stored);
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

  if (!payload) return null;

  if (payload.mode === 'live') {
    return (
      <div style={{ position: 'fixed', inset: 0, overflow: 'auto', background: '#fff' }}>
        <WebsitePagePreview page={payload.page} storeId={payload.storeId} chatWidget={payload.chatWidget} />
      </div>
    );
  }

  return (
    <iframe
      title="Page preview"
      srcDoc={payload.html}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 'none' }}
    />
  );
}