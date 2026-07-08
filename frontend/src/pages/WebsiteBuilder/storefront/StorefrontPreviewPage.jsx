import React from 'react';
import { useParams } from 'react-router-dom';
import StorefrontApp from './StorefrontApp';

// StorefrontPreviewPage.jsx — full-page mount of the dynamic storefront,
// used by StorePreviewModal's "Open in new tab" action. Same StorefrontApp
// component as the modal — one implementation of the storefront renderer,
// two places it's mounted, matching the Store Engine's "one Preview
// Engine, multiple call sites" principle rather than duplicating a second
// rendering path for the new-tab case.
export default function StorefrontPreviewPage() {
  const { storeId } = useParams();
  return (
    <div style={{ minHeight: '100vh' }}>
      <StorefrontApp storeId={storeId} />
    </div>
  );
}