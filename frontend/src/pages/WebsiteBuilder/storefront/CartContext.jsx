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
  emitSessionChange,
} from './identity';

// CartContext.jsx
//
// This is what makes "cart must not exist only in React state" true.
// React state here holds exactly two small identity tokens, nothing else:
//   - a guest token (a random id, persisted in localStorage per store)
//   - a customer session (a JWT, persisted in localStorage per store,
//     present only once a shopper has registered/logged in)
// The actual cart -- line items, quantities, discount code, shipping
// choice, contact/shipping address -- lives in the backend's StoreCart
// document (see cartService.js) and is fetched fresh after every
// mutation. Reloading the page, closing the tab, or opening the store on
// another device (once logged in) all still show the same cart, because
// the source of truth is the database, not this component tree.
//
// Guest -> logged-in -> merge: on successful login/register this calls
// POST /cart/merge once, which folds the guest cart's items into the
// now-current customer cart server-side
// (cartService.mergeGuestIntoCustomer), switches the active identity
// over to the customer session, and refetches.

const CartContext = createContext(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}

export function CartProvider({ children }) {
  const { storeId, subscribeToStoreEvents } = useStorefront();

  const [guestToken, setGuestToken] = useState(null);
  // { token, customer } | null -- null means "shopping as a guest"
  const [session, setSession] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const [cart, setCart] = useState(null); // the live CartView from the server
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Load (or create-and-persist) the guest token and any saved session
  // for this store as soon as we know which store we're on.
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
        writeLocalStorage(sessionKey(storeId), null);
      }
    }
    setSessionLoaded(true);
  }, [storeId]);

  const identityHeaders = useMemo(() => headersForIdentity({ session, guestToken }), [session, guestToken]);

  const refreshCart = useCallback(async () => {
    if (!storeId || !identityHeaders) return;
    setLoading(true);
    setError(null);
    try {
      const view = await storefrontApi.getCart(storeId, identityHeaders);
      setCart(view);
    } catch (err) {
      setError(err?.message || 'Failed to load cart.');
    } finally {
      setLoading(false);
    }
  }, [storeId, identityHeaders]);

  useEffect(() => {
    if (sessionLoaded) refreshCart();
  }, [sessionLoaded, refreshCart]);

  // Real-time re-pricing — a cart's totals depend on live product prices,
  // inventory (an item can sell out from under a shopper), and any
  // applied discount code's current validity. Rather than each of those
  // three concerns re-fetching separately, one subscription reloads the
  // single CartView the server already recomputes from scratch on every
  // fetch (cartService.getCartView), so this always converges on the
  // same truth the real checkout would charge.
  const hasCart = !!cart;
  useEffect(() => {
    if (!hasCart) return undefined; // nothing to keep in sync yet
    const unsubscribe = subscribeToStoreEvents((event) => {
      if (
        event.type.startsWith('product.') ||
        event.type === 'inventory.updated' ||
        event.type.startsWith('discount.')
      ) {
        refreshCart();
      }
    });
    return unsubscribe;
  }, [hasCart, subscribeToStoreEvents, refreshCart]);

  // Wraps every mutation so callers get the freshly-updated cart back and
  // the shared `cart` state stays in sync, without every call site
  // repeating try/catch/setCart boilerplate.
  const mutate = useCallback(
    async (fn) => {
      if (!storeId || !identityHeaders) throw new Error('Cart is not ready yet.');
      setError(null);
      try {
        const view = await fn(storeId, identityHeaders);
        setCart(view);
        return view;
      } catch (err) {
        setError(err?.message || 'Something went wrong with the cart.');
        throw err;
      }
    },
    [storeId, identityHeaders]
  );

  const addItem = useCallback(
    (productId, quantity = 1) => {
      setDrawerOpen(true);
      // Fire-and-forget funnel event — never blocks or fails the actual
      // cart mutation below (see storefrontApi.trackEvent).
      storefrontApi.trackEvent(storeId, 'cart_add', { productId, quantity });
      return mutate((sid, headers) => storefrontApi.addCartItem(sid, headers, productId, quantity));
    },
    [mutate, storeId]
  );

  const updateItem = useCallback(
    (productId, quantity) =>
      mutate((sid, headers) => storefrontApi.updateCartItem(sid, headers, productId, quantity)),
    [mutate]
  );

  const removeItem = useCallback(
    (productId) => mutate((sid, headers) => storefrontApi.removeCartItem(sid, headers, productId)),
    [mutate]
  );

  const clearCart = useCallback(
    () => mutate((sid, headers) => storefrontApi.clearCart(sid, headers)),
    [mutate]
  );

  const applyDiscount = useCallback(
    (code) => mutate((sid, headers) => storefrontApi.applyDiscountCode(sid, headers, code)),
    [mutate]
  );

  const removeDiscount = useCallback(
    () => mutate((sid, headers) => storefrontApi.removeDiscountCode(sid, headers)),
    [mutate]
  );

  const setContact = useCallback(
    (payload) => mutate((sid, headers) => storefrontApi.setCartContact(sid, headers, payload)),
    [mutate]
  );

  const setShipping = useCallback(
    (payload) => mutate((sid, headers) => storefrontApi.setCartShipping(sid, headers, payload)),
    [mutate]
  );

  const setPaymentMethod = useCallback(
    (method) => mutate((sid, headers) => storefrontApi.setCartPaymentMethod(sid, headers, method)),
    [mutate]
  );

  // Shared by login() and register() below -- moves the guest cart's
  // items onto the customer's cart, switches the active identity over,
  // and persists the new session so a reload stays logged in.
  const adoptSession = useCallback(
    async (nextSession) => {
      writeLocalStorage(sessionKey(storeId), JSON.stringify(nextSession));
      const priorGuestToken = guestToken;
      setSession(nextSession);
      try {
        const view = await storefrontApi.mergeCart(
          storeId,
          { Authorization: `Bearer ${nextSession.token}` },
          priorGuestToken
        );
        setCart(view);
      } catch {
        // Merge failing shouldn't block a successful login -- the
        // customer's own cart (possibly empty) still loads via the
        // effect below once `session` changes identityHeaders.
        await refreshCart();
      }
      // Tells WishlistContext (a sibling, not a descendant of this
      // context) that a session just became active, and what the prior
      // guest token was -- see identity.js's emitSessionChange. This is
      // what makes "save something, then sign in" merge the wishlist the
      // same moment cart items already merge above.
      emitSessionChange(storeId, { session: nextSession, priorGuestToken });
      setAuthOpen(false);
    },
    [storeId, guestToken, refreshCart]
  );

  const login = useCallback(
    async (email, password) => {
      const { token, customer } = await storefrontApi.login(storeId, { email, password });
      await adoptSession({ token, customer });
    },
    [storeId, adoptSession]
  );

  const register = useCallback(
    async (payload) => {
      const { token, customer } = await storefrontApi.register(storeId, payload);
      await adoptSession({ token, customer });
    },
    [storeId, adoptSession]
  );

  const logout = useCallback(() => {
    writeLocalStorage(sessionKey(storeId), null);
    setSession(null);
    emitSessionChange(storeId, { session: null, priorGuestToken: null });
    // Shopping continues as a guest under the same guest token as before
    // login (it was never deleted, only merged-from) -- refreshCart's
    // effect (via identityHeaders changing) loads whatever's left under
    // that guest token, typically an empty cart.
  }, [storeId]);

  const checkout = useCallback(
    async (payload) => {
      if (!identityHeaders) throw new Error('Cart is not ready yet.');
      setError(null);
      try {
        const order = await storefrontApi.checkout(storeId, identityHeaders, payload);
        setCart(null);
        return order;
      } catch (err) {
        setError(err?.message || 'Checkout failed.');
        throw err;
      }
    },
    [storeId, identityHeaders]
  );

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      itemCount: cart?.itemCount || 0,
      isSignedIn: !!session,
      customer: session?.customer || null,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      authOpen,
      openAuth: () => setAuthOpen(true),
      closeAuth: () => setAuthOpen(false),
      addItem,
      updateItem,
      removeItem,
      clearCart,
      applyDiscount,
      removeDiscount,
      setContact,
      setShipping,
      setPaymentMethod,
      login,
      register,
      logout,
      checkout,
      refreshCart,
    }),
    [
      cart,
      loading,
      error,
      session,
      drawerOpen,
      authOpen,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      applyDiscount,
      removeDiscount,
      setContact,
      setShipping,
      setPaymentMethod,
      login,
      register,
      logout,
      checkout,
      refreshCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}