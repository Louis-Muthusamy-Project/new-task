import React from 'react';
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

const SLUG_BY_VIEW = {
  home: 'home',
  collection: 'catalog',
  product: 'product',
  checkout: 'checkout',
};

/** Renders the active theme's real page markup for `viewName`'s slug when one exists, else `generic`. */
function RouteView({ viewName, generic }) {
  const { storeId } = useStorefront();
  const slug = SLUG_BY_VIEW[viewName] || null;
  const { page, loading, isThemed } = useThemedPage(slug ? storeId : null, slug);

  if (!slug) return generic;
  if (loading) return null; // themed-page check in flight — avoid a generic flash
  if (isThemed) return <ThemePage page={page} />;
  return generic;
}

function StorefrontScreens() {
  const { view } = useStorefront();

  switch (view?.name) {
    case 'collection':
      return <RouteView viewName="collection" generic={<CategoryPage collectionId={view.collectionId} />} />;
    case 'product':
      return <RouteView viewName="product" generic={<ProductPage slug={view.slug} />} />;
    case 'search':
      return <SearchResultsPage q={view.q} />;
    case 'checkout':
      return <RouteView viewName="checkout" generic={<CheckoutPage />} />;
    case 'confirmation':
      return <OrderConfirmationPage order={view.order} />;
    case 'wishlist':
      return <WishlistPage />;
    case 'home':
    default:
      return <RouteView viewName="home" generic={<HomePage />} />;
  }
}

export default function StorefrontApp({ storeId, initialView }) {
  return (
    <StorefrontProvider storeId={storeId} initialView={initialView}>
      <CartProvider>
        <WishlistProvider>
          <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
            <Header />
            <main style={{ flex: 1 }}>
              <StorefrontScreens />
            </main>
            <Footer />
            <CartDrawer />
            <AuthModal />
          </div>
        </WishlistProvider>
      </CartProvider>
    </StorefrontProvider>
  );
}