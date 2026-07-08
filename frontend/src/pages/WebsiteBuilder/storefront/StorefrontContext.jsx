import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
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
//
// Every storefront component reads from this context rather than
// accepting storeId as a prop chain or fetching store info itself — one
// place, one copy, no duplicated state.

const StorefrontContext = createContext(null);

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

  const {
    data: storeInfo,
    loading: storeInfoLoading,
    error: storeInfoError,
  } = useStorefrontQuery(() => storefrontApi.getStoreInfo(storeId), [storeId]);

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
    }),
    [storeId, storeInfo, storeInfoLoading, storeInfoError, view, navigate, goHome, goToCollection, goToProduct, goToSearch]
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}
