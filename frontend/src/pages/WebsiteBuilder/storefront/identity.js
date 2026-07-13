// identity.js — shared guest-token / signed-in-session bootstrapping.
//
// Both CartContext and WishlistContext need to know "who is shopping
// right now" (a guest token persisted in localStorage, or a signed-in
// customer's JWT) before they can talk to their respective backend
// resources. That identity concept — how a token is created, read,
// persisted, and turned into request headers — belongs in exactly one
// place rather than being re-implemented per context, even though Cart
// and Wishlist otherwise own fully independent state.

export const guestTokenKey = (storeId) => `storefront_guest_token_${storeId}`;
export const sessionKey = (storeId) => `storefront_session_${storeId}`;

export function readLocalStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocalStorage(key, value) {
  try {
    if (value == null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable (private mode, etc.) — callers still work
    // for this tab's lifetime via in-memory state, it just won't survive
    // a reload. Not worth failing the whole storefront over.
  }
}

export function makeGuestToken() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `guest_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

/** Builds the { 'X-Guest-Token' } | { Authorization } header pair for a resolved identity. */
export function headersForIdentity({ session, guestToken }) {
  if (session?.token) return { Authorization: `Bearer ${session.token}` };
  if (guestToken) return { 'X-Guest-Token': guestToken };
  return null;
}

/**
 * A tiny same-tab event bridge for "the signed-in session just changed."
 * CartContext owns login/register/logout (the only place session state is
 * decided); WishlistContext doesn't duplicate that flow — it just listens
 * here so a shopper's wishlist merges into their account at the same
 * moment their cart does, without WishlistContext needing to know how a
 * session is obtained.
 */
const SESSION_EVENT = 'storefront:session-changed';

export function emitSessionChange(storeId, detail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail: { storeId, ...detail } }));
}

export function subscribeSessionChange(storeId, listener) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => {
    if (e.detail?.storeId === storeId) listener(e.detail);
  };
  window.addEventListener(SESSION_EVENT, handler);
  return () => window.removeEventListener(SESSION_EVENT, handler);
}
