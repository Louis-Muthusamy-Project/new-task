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
// Checked once per (store, slug) pair (see `useThemedPage` below): does
// this store have actual themed page markup (GrapesJS-authored, or
// produced by the WordPress Import pipeline / Store Block System) for
// this route, worth rendering via ThemeRenderer instead of the generic
// hardcoded section? `null` = "still checking", so the generic screens
// don't flash before the check resolves.
function useThemedPage(storeId, slug) {
  const [themed, setThemed] = useState(null);

  useEffect(() => {
    if (!slug) {
      setThemed(false);
      return undefined;
    }
    let cancelled = false;
    setThemed(null);
    storefrontApi
      .getPage(storeId, slug)
      .then((page) => {
        if (!cancelled) setThemed(hasThemedContent(page));
      })
      .catch(() => {
        if (!cancelled) setThemed(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storeId, slug]);

  return themed;
}

// Maps the current storefront `view` to the themed-page slug (if any)
// that view could have — the same slug convention every StorePage
// already uses. `null` means "this view never has a themed page", so
// StorefrontScreens/StorefrontChrome always fall back to the generic
// component for it without a wasted lookup.
function themedSlugForView(view) {
  switch (view.name) {
    case 'home':
      return 'home';
    case 'collection':
      return 'shop';
    case 'product':
      return 'product';
    case 'search':
      return 'search';
    case 'checkout':
      return 'checkout';
    default:
      return null;
  }
}

function StorefrontScreens({ storeId, themedSlug, themed }) {
  const { view } = useStorefront();

  // Any themed view — home, collection, product, search, or checkout —
  // renders via the exact same ThemeRenderer path (its own header/
  // footer/nav baked in, per the Simply-Static/GrapesJS document
  // convention) instead of the generic hardcoded section; every other
  // view keeps the generic Store sections until a themed page exists
  // for that slug too. See ThemeRenderer.jsx for how each
  // `data-store-block` region inside it hydrates against live data.
  if (themedSlug && themed) {
    return <ThemeRenderer storeId={storeId} slug={themedSlug} />;
  }

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
  const themedSlug = themedSlugForView(view);
  const themed = useThemedPage(storeId, themedSlug);
  // Generic Header/Footer chrome is skipped only for a view that actually
  // resolved to themed markup — a themed page brings its own header/
  // footer/nav baked into its own document (see ThemeRenderer.jsx).
  const showGenericChrome = !(themedSlug && themed);

  return (
    <>
      {showGenericChrome && <Header />}
      <StorefrontScreens storeId={storeId} themedSlug={themedSlug} themed={themed} />
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