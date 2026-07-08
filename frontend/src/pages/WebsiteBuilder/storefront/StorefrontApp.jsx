import React, { useEffect } from 'react';
import { StorefrontProvider, useStorefront } from './StorefrontContext';
import { CartProvider } from './CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import SearchResultsPage from './pages/SearchResultsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import { storefrontApi } from '../../../api/storefrontApi';

// StorefrontApp.jsx — the dynamic storefront preview. Replaces the old
// static-HTML iframe (buildPreviewHtml over a stored StorePage snapshot)
// with a real, mounted React tree: every section below fetches live data
// from the Store Engine's public API, so anything a merchant changes in
// Admin (a new product, a renamed collection, a published page) shows up
// here on the next fetch — no hardcoded products, no static JSON, no
// pre-baked HTML snapshot anywhere in this tree.
//
// Cart + Checkout flow: Customer -> Add to Cart -> Checkout -> Shipping
// -> Payment -> Order -> Inventory -> Confirmation -> Analytics. The
// cart itself is never local React state (see CartContext.jsx — every
// mutation round-trips to the persisted StoreCart on the backend); this
// component just wires the provider in and renders the 'checkout' /
// 'confirmation' views alongside the existing product-browsing ones.
function StorefrontScreens() {
  const { view } = useStorefront();

  switch (view.name) {
    case 'collection':
      return <CategoryPage collectionId={view.collectionId} />;
    case 'product':
      return <ProductPage productId={view.productId} />;
    case 'search':
      return <SearchResultsPage q={view.q} />;
    case 'checkout':
      return <CheckoutPage />;
    case 'confirmation':
      return <OrderConfirmationPage order={view.order} />;
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
            : view.name === 'checkout'
              ? '/checkout'
              : view.name === 'confirmation'
                ? '/checkout/confirmation'
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
      <CartProvider storeId={storeId}>
        <div style={{ minHeight: '100%', background: '#fff', fontFamily: 'Inter, Segoe UI, sans-serif' }}>
          <Header />
          <StorefrontScreens />
          <Footer />
          <CartDrawer />
          <AuthModal />
          <VisitTracker storeId={storeId} />
        </div>
      </CartProvider>
    </StorefrontProvider>
  );
}