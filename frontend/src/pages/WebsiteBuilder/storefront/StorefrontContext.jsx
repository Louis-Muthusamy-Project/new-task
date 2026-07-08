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

export function StorefrontProvider({ storeId, children }) {
  const [view, setView] = useState({ name: 'home' });

  const navigate = useCallback((next) => setView(next), []);
  const goHome = useCallback(() => setView({ name: 'home' }), []);
  const goToCollection = useCallback(
    (collectionId) => setView({ name: 'collection', collectionId }),
    []
  );
  const goToProduct = useCallback((productId) => setView({ name: 'product', productId }), []);
  const goToSearch = useCallback((q) => setView({ name: 'search', q }), []);
  const goToCheckout = useCallback(() => setView({ name: 'checkout' }), []);
  const goToConfirmation = useCallback((order) => setView({ name: 'confirmation', order }), []);

  const {
    data: storeInfo,
    loading: storeInfoLoading,
    error: storeInfoError,
  } = useStorefrontQuery(() => storefrontApi.getStoreInfo(storeId), [storeId]);

  const { subscribe: subscribeToStoreEvents, connected: realtimeConnected } = useStoreEventSource(storeId);

  const value = useMemo(
    () => ({
      storeId,
      storeInfo,
      storeInfoLoading,
      storeInfoError,
      currency: storeInfo?.currency || 'USD',
      view,
      navigate,
      goHome,
      goToCollection,
      goToProduct,
      goToSearch,
      goToCheckout,
      goToConfirmation,
      subscribeToStoreEvents,
      realtimeConnected,
    }),
    [
      storeId,
      storeInfo,
      storeInfoLoading,
      storeInfoError,
      view,
      navigate,
      goHome,
      goToCollection,
      goToProduct,
      goToSearch,
      goToCheckout,
      goToConfirmation,
      subscribeToStoreEvents,
      realtimeConnected,
    ]
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}