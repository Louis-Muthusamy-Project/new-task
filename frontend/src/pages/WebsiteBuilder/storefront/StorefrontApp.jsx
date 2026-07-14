import React, { useEffect, useState } from 'react';
import { StorefrontProvider, useStorefront } from './StorefrontContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';
import { useThemedPage } from './hooks/useThemedPage';
import { ThemePage } from './ThemeRenderer';

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
import WishlistPage from './pages/WishlistPage';

// StorefrontApp.jsx
//
// The live storefront's app shell — Header/Footer/CartDrawer/AuthModal
// mounted once, with `StorefrontScreens` switching what renders between
// them based on the current `view` (see StorefrontContext.jsx). This is
// the "one rendering contract, every route" piece of the theme-binding
// architecture: every view checks whether the active theme has a page
// for its slug (useThemedPage) and renders that real, uploaded/GrapesJS
// markup via ThemePage when it does — falling back to the generic
// Home/Category/Product/Search/Checkout screen only when it doesn't.
// Nothing here talks to the Store Engine directly; every screen (themed
// or generic) reads live data through the same CartContext/
// StorefrontContext/useProducts hooks the rest of the storefront uses —
// no duplicated cart/order/checkout logic anywhere in this file.
//
// defaultStorePages.js fixes the slug a themed page for each route would
// use: 'home', 'catalog' (Shop/Collections), 'product', 'checkout'.
// Search, Wishlist, and Order Confirmation have no themed-page concept
// (no default slug for them) and always render their generic screen.
// Every OTHER stored StorePage — About, Contact, FAQ, Blog, or any other
// custom page a merchant's uploaded template has — is reachable the same
// way via the `page` view (see goToPage in StorefrontContext.jsx and
// CustomPageView below): looked up by its own slug, no dedicated generic
// screen needed since ThemePage already renders it from its real stored
// content.html/css, same as Home/Category/Product/Checkout do.
//
// Chrome (Header/Footer) note: a themed page's `content.html` is the
// *entire* uploaded/GrapesJS/WordPress-imported page — it already carries
// its own `data-store-block="header"/"footer"/"navigation"` markup, which
// ThemeRenderer hydrates in place (see ThemeRenderer.jsx). So whenever the
// active view is rendering a themed page, StorefrontApp's own generic
// <Header/>/<Footer/> must stay hidden, or the storefront would show two
// headers and two footers stacked on top of the theme's real ones. The
// generic chrome only reappears for views that have no themed-page concept
// (Search/Wishlist/Order Confirmation) or when the current route's slug
// has no themed page yet, so the generic screen isn't left bare.

const SLUG_BY_VIEW = {
  home: 'home',
  collection: 'catalog',
  product: 'product',
  checkout: 'checkout',
};

/**
 * Renders the active theme's real page markup for `viewName`'s slug when
 * one exists, else `generic`. Reports the resolved themed/not-themed
 * status upward via `onThemedChange` so the app shell knows whether to
 * keep its own generic Header/Footer chrome hidden — a single source of
 * truth (this hook's result) rather than a second, duplicate check.
 */
function RouteView({ viewName, generic, onThemedChange }) {
  const { storeId } = useStorefront();
  const slug = SLUG_BY_VIEW[viewName] || null;
  const { page, loading, isThemed } = useThemedPage(slug ? storeId : null, slug);

  useEffect(() => {
    if (!slug) {
      onThemedChange(false);
      return;
    }
    if (loading) return; // keep previous chrome state until the check resolves
    onThemedChange(isThemed);
  }, [slug, loading, isThemed, onThemedChange]);

  if (!slug) return generic;
  if (loading) return null; // themed-page check in flight — avoid a generic flash
  if (isThemed) return <ThemePage page={page} />;
  return generic;
}

/** Views with no themed-page concept always show the generic screen + generic chrome. */
function GenericOnlyView({ onThemedChange, children }) {
  useEffect(() => {
    onThemedChange(false);
  }, [onThemedChange]);
  return children;
}

/**
 * Renders any stored StorePage by slug — About, Contact, FAQ, Blog, or any
 * other custom page a merchant's uploaded template has, none of which have
 * (or need) a dedicated generic React screen the way Home/Category/
 * Product/Checkout do. Reuses the exact same useThemedPage + ThemePage
 * pair RouteView uses above — one lookup-and-render path for every stored
 * page, core or custom. When the store has no Published page at this slug
 * (typo'd link, unpublished draft, deleted page), shows a plain message
 * instead of a blank screen or a crash — the generic chrome (Header/
 * Footer) stays visible throughout so the visitor can still get somewhere.
 */
function CustomPageView({ slug, onThemedChange }) {
  const { storeId } = useStorefront();
  const { page, loading, isThemed } = useThemedPage(storeId, slug);

  useEffect(() => {
    if (loading) return;
    onThemedChange(isThemed);
  }, [loading, isThemed, onThemedChange]);

  if (loading) return null;
  if (isThemed) return <ThemePage page={page} />;
  return (
    <div style={{ padding: '80px 24px', textAlign: 'center', color: '#64748b' }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Page not available</p>
      <p style={{ fontSize: 13, margin: 0 }}>
        This store doesn&apos;t have a published page at &ldquo;{slug}&rdquo; yet.
      </p>
    </div>
  );
}

function StorefrontScreens({ onThemedChange }) {
  const { view } = useStorefront();

  switch (view?.name) {
    case 'collection':
      return (
        <RouteView
          viewName="collection"
          generic={<CategoryPage collectionId={view.collectionId} />}
          onThemedChange={onThemedChange}
        />
      );
    case 'product':
      return (
        <RouteView viewName="product" generic={<ProductPage slug={view.slug} />} onThemedChange={onThemedChange} />
      );
    case 'page':
      return <CustomPageView slug={view.slug} onThemedChange={onThemedChange} />;
    case 'search':
      return (
        <GenericOnlyView onThemedChange={onThemedChange}>
          <SearchResultsPage q={view.q} />
        </GenericOnlyView>
      );
    case 'checkout':
      return <RouteView viewName="checkout" generic={<CheckoutPage />} onThemedChange={onThemedChange} />;
    case 'confirmation':
      return (
        <GenericOnlyView onThemedChange={onThemedChange}>
          <OrderConfirmationPage order={view.order} />
        </GenericOnlyView>
      );
    case 'wishlist':
      return (
        <GenericOnlyView onThemedChange={onThemedChange}>
          <WishlistPage />
        </GenericOnlyView>
      );
    case 'home':
    default:
      return <RouteView viewName="home" generic={<HomePage />} onThemedChange={onThemedChange} />;
  }
}

/** The app shell: generic Header/Footer chrome, hidden only while a themed page (which brings its own) is active. */
function StorefrontShell() {
  const [themedActive, setThemedActive] = useState(false);

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {!themedActive && <Header />}
      <main style={{ flex: 1 }}>
        <StorefrontScreens onThemedChange={setThemedActive} />
      </main>
      {!themedActive && <Footer />}
      <CartDrawer />
      <AuthModal />
    </div>
  );
}

export default function StorefrontApp({ storeId, initialView }) {
  return (
    <StorefrontProvider storeId={storeId} initialView={initialView}>
      <CartProvider>
        <WishlistProvider>
          <StorefrontShell />
        </WishlistProvider>
      </CartProvider>
    </StorefrontProvider>
  );
}