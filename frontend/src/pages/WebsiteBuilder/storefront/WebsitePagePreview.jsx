import React from 'react';
import { StorefrontProvider } from './StorefrontContext';
import { CartProvider } from './CartContext';
import { ThemePage } from './ThemeRenderer';
import ChatWidgetLauncher from './components/ChatWidgetLauncher';

// WebsitePagePreview.jsx — Preview Integration for the Website Builder.
//
// Flow (matches the requested architecture 1:1):
//
//   Website Page (WebsitePage.content.html, tagged by the Template Import
//   Pipeline's `data-store-block` attributes — see services/templateImport/)
//         |
//   Dynamic Block   (ThemePage walks the DOM for data-store-block regions)
//         |
//   Store API       (storefrontApi.* — cached + deduped, see storefrontApi.js)
//         |
//   React Component (ImportedProductGrid / CollectionsGrid / ProductPage / ...)
//         |
//   Final Preview
//
// This intentionally reuses ThemeRenderer's `ThemePage` — the exact same
// hydration engine the Store module's own live preview/storefront already
// uses — rather than a second implementation. One engine, two callers
// (Store pages, Website pages); whatever perf/caching/event-driven-refresh
// work happens there benefits both automatically.
//
// Falls back to a plain, static render (no providers, no live data) when:
//   - the Website has no linked Store (`storeId` is null — the common case
//     for a non-commerce site), or
//   - the page's own pipeline output says it isn't store-ready
//     (`content.storeReady` false — nothing detectable to hydrate).
// This fallback is intentionally the SAME markup the old static preview
// showed — nothing about a non-commerce page's preview changes.
export default function WebsitePagePreview({ page, storeId, chatWidget = null }) {
  const html = page?.content?.html || '';
  const css = page?.content?.css || '';
  const isLive = !!storeId && !!page?.content?.storeReady;

  if (!isLive) {
    return (
      <>
        {css ? <style>{css}</style> : null}
        <div dangerouslySetInnerHTML={{ __html: html }} />
        {chatWidget ? <ChatWidgetLauncher widget={chatWidget} /> : null}
      </>
    );
  }

  return (
    <StorefrontProvider storeId={storeId}>
      <CartProvider>
        <ThemePage page={page} />
        {chatWidget ? <ChatWidgetLauncher widget={chatWidget} /> : null}
      </CartProvider>
    </StorefrontProvider>
  );
}
