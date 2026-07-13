import React from 'react';
import { useParams } from 'react-router-dom';
import StorefrontApp from './StorefrontApp';

// StorefrontPreviewPage.jsx — full-page mount of the dynamic storefront,
// used by StorePreviewModal's "Open in new tab" action, and directly
// reachable at /preview/store/:storeId/products/:slug for a Product
// Detail Page — a real, bookmarkable/shareable URL rather than an
// in-app-only view. Same StorefrontApp component as the modal — one
// implementation of the storefront renderer, two places it's mounted,
// matching the Store Engine's "one Preview Engine, multiple call sites"
// principle rather than duplicating a second rendering path. `syncUrl`
// is only passed here (never by the modal), so only this full-page route
// pushes storefront navigation into the browser's address bar.
export default function StorefrontPreviewPage() {
  const { storeId, slug } = useParams();
  const initialView = slug ? { name: 'product', slug } : undefined;

  return (
    <div style={{ minHeight: '100vh' }}>
      <StorefrontApp storeId={storeId} initialView={initialView} syncUrl />
    </div>
  );
}