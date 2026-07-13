import { useEffect, useState } from 'react';
import { storefrontApi } from '../../../../api/storefrontApi';
import { hasThemedContent } from '../ThemeRenderer';

// useThemedPage.js
//
// Generalizes what used to be a home-only "does this store have an
// uploaded/GrapesJS theme for its home page" check into one hook any
// route can call: StorefrontScreens uses this for every view — home,
// collection (catalog), product, checkout — falling back to the generic
// Home/Category/Product/Checkout component only when the active theme
// has no themed page for that route's slug (see defaultStorePages.js for
// the fixed slug set: home / catalog / product / cart / checkout).
//
// One fetch per (storeId, slug); ThemePage (from ThemeRenderer.jsx) is
// what actually renders the result — this hook only decides *whether* to.
export function useThemedPage(storeId, slug) {
  const [state, setState] = useState({ page: null, loading: true, error: null });

  useEffect(() => {
    if (!storeId || !slug) {
      setState({ page: null, loading: false, error: null });
      return undefined;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    storefrontApi
      .getPage(storeId, slug)
      .then((page) => {
        if (!cancelled) setState({ page, loading: false, error: null });
      })
      .catch((err) => {
        // A 404 (no themed page at this slug) is the expected, common
        // case that triggers the generic fallback — not an error state.
        if (!cancelled) setState({ page: null, loading: false, error: err?.message || null });
      });
    return () => {
      cancelled = true;
    };
  }, [storeId, slug]);

  return {
    page: state.page,
    loading: state.loading,
    isThemed: hasThemedContent(state.page),
  };
}
