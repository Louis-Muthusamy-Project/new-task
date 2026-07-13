import { useCallback, useEffect, useState } from 'react';
import { useStorefront } from '../StorefrontContext';
import { useProducts } from './useProducts';

// useWishlist.js — the data layer behind the `wishlist` / `wishlist-button`
// store blocks (see ThemeRenderer.jsx). There is no dedicated backend
// surface for wishlists yet (see the architecture note on
// StoreWishlist/wishlistService as a future, separate vertical slice) —
// this keeps the *block system* itself fully self-contained by persisting
// the saved product-id set client-side, per store, exactly the way
// CartContext already persists its guest identity token. Swapping this
// for a real backend-synced wishlist later only touches this one file —
// every block that consumes `useWishlist()` keeps working unchanged.

const storageKey = (storeId) => `storefront_wishlist_${storeId}`;

function readIds(storeId) {
  try {
    const raw = window.localStorage.getItem(storageKey(storeId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeIds(storeId, ids) {
  try {
    window.localStorage.setItem(storageKey(storeId), JSON.stringify(ids));
  } catch {
    // localStorage unavailable — wishlist still works for this tab's
    // lifetime via in-memory state, it just won't survive a reload.
  }
}

/** useWishlist() — the saved-product-id set for the current store. */
export function useWishlist() {
  const { storeId } = useStorefront();
  const [ids, setIds] = useState(() => readIds(storeId));

  useEffect(() => {
    setIds(readIds(storeId));
  }, [storeId]);

  const toggle = useCallback(
    (productId) => {
      setIds((prev) => {
        const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId];
        writeIds(storeId, next);
        return next;
      });
    },
    [storeId]
  );

  const has = useCallback((productId) => ids.includes(productId), [ids]);

  return { ids, has, toggle };
}

/** useWishlistProducts() — the Wishlist page's data: full product records for every saved id. */
export function useWishlistProducts() {
  const { ids } = useWishlist();
  const { products: allProducts, loading, error, reload } = useProducts({ limit: 100 });
  const products = (allProducts || []).filter((p) => ids.includes(p.id));
  return { products, loading, error, reload };
}
