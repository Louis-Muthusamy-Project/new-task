import React, { useEffect, useState } from 'react';
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
import ThemeRenderer, { hasThemedContent } from './ThemeRenderer';

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
// Checked once per store (see `useThemedHome` below): does this store have
// an actual themed home page (GrapesJS-authored, or produced by the
// WordPress Import pipeline) worth rendering via ThemeRenderer, instead of
// the generic hardcoded Home section? `null` = "still checking", so the
// generic screens don't flash before the check resolves.
function useThemedHome(storeId) {
  const [themed, setThemed] = useState(null);

  useEffect(() => {
    let cancelled = false;
    storefrontApi
      .getPage(storeId, 'home')
      .then((page) => {
        if (!cancelled) setThemed(hasThemedContent(page));
      })
      .catch(() => {
        if (!cancelled) setThemed(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  return themed;
}

function StorefrontScreens({ storeId, themedHome }) {
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
      // A themed home page (its own header/footer/nav baked in per the
      // Simply-Static/GrapesJS document convention) replaces the generic
      // Header/HomePage/Footer stack entirely for this view — see
      // ThemeRenderer.jsx. Every other view keeps the generic Store
      // sections today; extending themed rendering to Category/Product/
      // Search is straightforward follow-up (same ThemeRenderer, a
      // different page slug) once those pages exist as themed content.
      return themedHome ? <ThemeRenderer storeId={storeId} slug="home" /> : <HomePage />;
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

    // Every view change already pings the generic pageview above; a
    // Product Page or Search view additionally pings a typed funnel
    // event (see StoreAnalyticsEvent on the backend) so the Analytics
    // tab can report Product Views / Searches and top-viewed products /
    // top search terms, not just raw pageviews.
    if (view.name === 'product' && view.productId) {
      storefrontApi.trackEvent(storeId, 'product_view', { productId: view.productId });
    } else if (view.name === 'search' && String(view.q || '').trim()) {
      storefrontApi.trackEvent(storeId, 'search', { query: view.q });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, view.name, view.collectionId, view.productId, view.q]);
  return null;
}

function StorefrontChrome({ storeId }) {
  const { view } = useStorefront();
  const themedHome = useThemedHome(storeId);
  // Only the 'home' view can currently be themed (see StorefrontScreens);
  // every other view keeps the generic Header/Footer chrome around it.
  const showGenericChrome = !(view.name === 'home' && themedHome);

  return (
    <>
      {showGenericChrome && <Header />}
      <StorefrontScreens storeId={storeId} themedHome={themedHome} />
      {showGenericChrome && <Footer />}
    </>
  );
}

export default function StorefrontApp({ storeId }) {
  if (!storeId) return null;

  return (
    <StorefrontProvider storeId={storeId}>
      <CartProvider storeId={storeId}>
        <div style={{ minHeight: '100%', background: '#fff', fontFamily: 'Inter, Segoe UI, sans-serif' }}>
          <StorefrontChrome storeId={storeId} />
          <CartDrawer />
          <AuthModal />
          <VisitTracker storeId={storeId} />
        </div>
      </CartProvider>
    </StorefrontProvider>
  );
}