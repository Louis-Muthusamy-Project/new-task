import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { storefrontApi } from '../../../api/storefrontApi';
import { useStorefront } from './StorefrontContext';
import {
  guestTokenKey,
  sessionKey,
  readLocalStorage,
  writeLocalStorage,
  makeGuestToken,
  headersForIdentity,
  subscribeSessionChange,
} from './identity';

// WishlistContext.jsx
//
// Same shape as CartContext.jsx on purpose: a wishlist is a persisted
// StoreWishlist document (see wishlistService.js), never component
// state, identified the same guest-token/customer-session way a cart is.
// This context does NOT re-implement login/register/logout — those stay
// owned by CartContext. It only listens for identity.js's
// "session-changed" event (emitted by CartContext right after a
// successful login/register) to merge the guest wishlist into the
// customer's wishlist at the same moment cart items already merge.
//
// Kept intentionally free of any cart/order logic: moving a saved item
// into the cart is just `useCart().addItem(productId)` from whichever
// component renders the wishlist — this context only ever talks to the
// wishlist endpoints.

const WishlistContext = createContext(null);

export function useWishlistContext() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlistContext must be used within a WishlistProvider');
  return ctx;
}

export function WishlistProvider({ children }) {
  const { storeId } = useStorefront();

  const [guestToken, setGuestToken] = useState(null);
  const [session, setSession] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const [wishlist, setWishlist] = useState(null); // the live WishlistView from the server
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!storeId) return;

    let token = readLocalStorage(guestTokenKey(storeId));
    if (!token) {
      token = makeGuestToken();
      writeLocalStorage(guestTokenKey(storeId), token);
    }
    setGuestToken(token);

    const savedSession = readLocalStorage(sessionKey(storeId));
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch {
        // ignore — CartContext already clears an unparseable session
      }
    }
    setSessionLoaded(true);
  }, [storeId]);

  const identityHeaders = useMemo(() => headersForIdentity({ session, guestToken }), [session, guestToken]);

  const refreshWishlist = useCallback(async () => {
    if (!storeId || !identityHeaders) return;
    setLoading(true);
    setError(null);
    try {
      const view = await storefrontApi.getWishlist(storeId, identityHeaders);
      setWishlist(view);
    } catch (err) {
      setError(err?.message || 'Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  }, [storeId, identityHeaders]);

  useEffect(() => {
    if (sessionLoaded) refreshWishlist();
  }, [sessionLoaded, refreshWishlist]);

  // React to a login/register that just happened in CartContext: merge
  // the guest wishlist into the customer's, then adopt that session as
  // our own identity so subsequent calls use it.
  useEffect(() => {
    if (!storeId) return undefined;
    return subscribeSessionChange(storeId, async (detail) => {
      if (detail.session?.token) {
        writeLocalStorage(sessionKey(storeId), JSON.stringify(detail.session));
        try {
          const view = await storefrontApi.mergeWishlist(
            storeId,
            { Authorization: `Bearer ${detail.session.token}` },
            detail.priorGuestToken
          );
          setWishlist(view);
        } catch {
          // non-fatal -- fall through and just load whatever's there
        }
        setSession(detail.session);
      } else {
        setSession(null);
      }
    });
  }, [storeId]);

  const mutate = useCallback(
    async (fn) => {
      if (!storeId || !identityHeaders) throw new Error('Wishlist is not ready yet.');
      setError(null);
      try {
        const view = await fn(storeId, identityHeaders);
        setWishlist(view);
        return view;
      } catch (err) {
        setError(err?.message || 'Something went wrong with the wishlist.');
        throw err;
      }
    },
    [storeId, identityHeaders]
  );

  const toggle = useCallback(
    (productId) => mutate((sid, headers) => storefrontApi.toggleWishlistItem(sid, headers, productId)),
    [mutate]
  );

  const addItem = useCallback(
    (productId) => mutate((sid, headers) => storefrontApi.addWishlistItem(sid, headers, productId)),
    [mutate]
  );

  const removeItem = useCallback(
    (productId) => mutate((sid, headers) => storefrontApi.removeWishlistItem(sid, headers, productId)),
    [mutate]
  );

  const clear = useCallback(() => mutate((sid, headers) => storefrontApi.clearWishlist(sid, headers)), [mutate]);

  const ids = useMemo(() => new Set(wishlist?.ids || []), [wishlist]);
  const has = useCallback((productId) => ids.has(String(productId)), [ids]);

  const value = useMemo(
    () => ({
      wishlist,
      items: wishlist?.items || [],
      ids: wishlist?.ids || [],
      itemCount: wishlist?.itemCount || 0,
      loading,
      error,
      has,
      toggle,
      addItem,
      removeItem,
      clear,
      refreshWishlist,
    }),
    [wishlist, loading, error, has, toggle, addItem, removeItem, clear, refreshWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
