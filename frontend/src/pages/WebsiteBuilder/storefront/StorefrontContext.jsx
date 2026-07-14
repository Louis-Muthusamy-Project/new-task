import React, { createContext, useContext, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { storefrontApi } from '../../../api/storefrontApi';
import { useStorefrontQuery } from './hooks/useStorefrontQuery';

// StorefrontContext.jsx — the single source of truth for:
//   - which store this Preview instance is rendering (storeId)
//   - that store's public info (name/currency/logo), fetched once and
//     shared by Header/Footer/ProductCard/etc. instead of every section
//     re-fetching (and re-holding) its own copy
//   - internal "which screen is showing" navigation state, so Home /
//     Category / Product / Search behave like real pages without pulling
//     in a full router for what is, today, a Preview surface
//   - ONE real-time connection (Server-Sent Events) to the Store Engine's
//     event stream (GET /store/:storeId/events), fanned out to every
//     useProducts()/useProduct()/useFeaturedProducts()/etc hook in the
//     tree via `subscribeToStoreEvents`. This is what replaces manual
//     refresh logic: Admin creates a product → the backend emits
//     `product.created` → this one connection receives it → every
//     subscribed hook reloads its own query.
//
// Every storefront component reads from this context rather than
// accepting storeId as a prop chain or fetching store info itself — one
// place, one copy, no duplicated state.

const StorefrontContext = createContext(null);

const SSE_BASE = import.meta.env.VITE_WEBSITE_WIZARD_API_BASE || 'http://localhost:5500/api';

/**
 * Opens exactly one EventSource for `storeId` and fans events out to every
 * listener registered via the returned `subscribe` function. Reconnects
 * automatically (native EventSource behavior) if the connection drops.
 */
function useStoreEventSource(storeId) {
  const listenersRef = useRef(new Set());
  const [connected, setConnected] = useState(false);

  const subscribe = useCallback((listener) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  useEffect(() => {
    if (!storeId || typeof window === 'undefined' || typeof window.EventSource === 'undefined') {
      return undefined;
    }

    setConnected(false);
    const es = new EventSource(`${SSE_BASE}/store/${storeId}/events`);

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false); // EventSource retries on its own
    es.onmessage = (raw) => {
      let event;
      try {
        event = JSON.parse(raw.data);
      } catch {
        return;
      }
      if (event.type === 'connected') {
        setConnected(true);
        return;
      }
      // A write anywhere invalidates this store's short-lived client-side
      // GET cache once, up front, so every listener's reload() that fires
      // from this same event is guaranteed to hit the network instead of
      // replaying a stale cached response.
      storefrontApi.invalidate(storeId);
      for (const listener of listenersRef.current) listener(event);
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [storeId]);

  return { subscribe, connected };
}

export function useStorefront() {
  const ctx = useContext(StorefrontContext);
  if (!ctx) throw new Error('useStorefront must be used within a StorefrontProvider');
  return ctx;
}

export function StorefrontProvider({ storeId, initialView, children }) {
  const [view, setView] = useState(initialView || { name: 'home' });
  // Set by ProductPage once its slug lookup resolves to a real product —
  // lets DOM-level block hydration (ThemeRenderer's wishlist-button,
  // which mounts outside the React tree that fetched the product) know
  // the current product's internal id, since `view` itself only carries
  // the shopper-facing slug.
  const [viewedProduct, setViewedProduct] = useState(null);

  const navigate = useCallback((next) => setView(next), []);
  const goHome = useCallback(() => setView({ name: 'home' }), []);
  const goToCollection = useCallback(
    (collectionId) => setView({ name: 'collection', collectionId }),
    []
  );
  // Product Detail Pages are addressed by slug (the shopper-facing
  // /products/:slug identifier), not the internal _id — see
  // pages/ProductPage.jsx / hooks/useProducts.js's useProductBySlug.
  const goToProduct = useCallback((slug) => setView({ name: 'product', slug }), []);
  // Any other stored StorePage — About, Contact, FAQ, Blog, or any custom
  // page a merchant uploaded — reachable by its own slug, exactly like
  // Home/Collection/Product already are. See CustomPageView in
  // StorefrontApp.jsx for what actually renders it (ThemeRenderer's
  // ThemePage, same as every other view).
  const goToPage = useCallback((slug) => setView({ name: 'page', slug }), []);
  const goToSearch = useCallback((q) => setView({ name: 'search', q }), []);
  const goToCheckout = useCallback(() => setView({ name: 'checkout' }), []);
  const goToConfirmation = useCallback((order) => setView({ name: 'confirmation', order }), []);
  const goToWishlist = useCallback(() => setView({ name: 'wishlist' }), []);

  const {
    data: storeInfo,
    loading: storeInfoLoading,
    error: storeInfoError,
  } = useStorefrontQuery(() => storefrontApi.getStoreInfo(storeId), [storeId]);

  const { subscribe: subscribeToStoreEvents, connected: realtimeConnected } = useStoreEventSource(storeId);

  // Theme tokens — fetched once on load, then kept live via the same
  // event stream every other storefront surface uses. Applied as CSS
  // custom properties on the document root so any component's CSS can
  // reference var(--color-primary) etc. without threading theme state
  // through props; a Theme tab edit lands here the instant `theme.updated`
  // arrives, no reload needed.
  const applyThemeVariables = useCallback((cssVariables) => {
    if (!cssVariables || typeof document === 'undefined') return;
    const root = document.documentElement;
    for (const [name, value] of Object.entries(cssVariables)) {
      root.style.setProperty(name, value);
    }
  }, []);

  const { data: themeData, reload: reloadTheme } = useStorefrontQuery(
    () => (storeId ? storefrontApi.getTheme(storeId) : Promise.resolve(null)),
    [storeId]
  );

  useEffect(() => {
    if (themeData?.cssVariables) applyThemeVariables(themeData.cssVariables);
  }, [themeData, applyThemeVariables]);

  useEffect(() => {
    const unsubscribe = subscribeToStoreEvents((event) => {
      if (event.type === 'theme.updated') reloadTheme();
    });
    return unsubscribe;
  }, [subscribeToStoreEvents, reloadTheme]);

  const value = useMemo(
    () => ({
      storeId,
      storeInfo,
      storeInfoLoading,
      storeInfoError,
      currency: storeInfo?.currency || 'USD',
      theme: themeData?.theme || null,
      view,
      navigate,
      goHome,
      goToCollection,
      goToProduct,
      goToPage,
      goToSearch,
      goToCheckout,
      goToConfirmation,
      goToWishlist,
      subscribeToStoreEvents,
      realtimeConnected,
      viewedProduct,
      setViewedProduct,
    }),
    [
      storeId,
      storeInfo,
      storeInfoLoading,
      storeInfoError,
      themeData,
      view,
      navigate,
      goHome,
      goToCollection,
      goToProduct,
      goToPage,
      goToSearch,
      goToCheckout,
      goToConfirmation,
      goToWishlist,
      subscribeToStoreEvents,
      realtimeConnected,
      viewedProduct,
    ]
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}