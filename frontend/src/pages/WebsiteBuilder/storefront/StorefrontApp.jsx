import React, { useEffect } from 'react';
import { StorefrontProvider, useStorefront } from './StorefrontContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import SearchResultsPage from './pages/SearchResultsPage';
import { storefrontApi } from '../../../api/storefrontApi';

// StorefrontApp.jsx — the dynamic storefront preview. Replaces the old
// static-HTML iframe (buildPreviewHtml over a stored StorePage snapshot)
// with a real, mounted React tree: every section below fetches live data
// from the Store Engine's public API, so anything a merchant changes in
// Admin (a new product, a renamed collection, a published page) shows up
// here on the next fetch — no hardcoded products, no static JSON, no
// pre-baked HTML snapshot anywhere in this tree.
function StorefrontScreens() {
  const { view } = useStorefront();

  switch (view.name) {
    case 'collection':
      return <CategoryPage collectionId={view.collectionId} />;
    case 'product':
      return <ProductPage productId={view.productId} />;
    case 'search':
      return <SearchResultsPage q={view.q} />;
    case 'home':
    default:
      return <HomePage />;
  }
}

function VisitTracker({ storeId }) {
  const { view } = useStorefront();
  useEffect(() => {
    const path =
      view.name === 'home'
        ? '/'
        : view.name === 'collection'
          ? `/collections/${view.collectionId}`
          : view.name === 'product'
            ? `/products/${view.productId}`
            : `/search?q=${encodeURIComponent(view.q || '')}`;
    storefrontApi.trackVisit(storeId, { path });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, view.name, view.collectionId, view.productId, view.q]);
  return null;
}

export default function StorefrontApp({ storeId }) {
  if (!storeId) return null;

  return (
    <StorefrontProvider storeId={storeId}>
      <div style={{ minHeight: '100%', background: '#fff', fontFamily: 'Inter, Segoe UI, sans-serif' }}>
        <Header />
        <StorefrontScreens />
        <Footer />
        <VisitTracker storeId={storeId} />
      </div>
    </StorefrontProvider>
  );
}
