import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// useStoreSocket.js — the Admin dashboard's real-time connection.
//
// Mirrors StorefrontContext's `useStoreEventSource` (SSE) one-to-one in
// shape — same `{ subscribe, connected }` return, same event payload
// `{ type, storeId, payload, ts }` — but over Socket.io instead of SSE.
// See backend/src/services/store/storeSocket.js for why the Admin side
// gets Socket.io specifically (room-based fan-out to every open
// tab/team-member on the same store, with a real bidirectional channel
// available if the Admin UI ever needs one) while the public storefront
// keeps using a plain EventSource.
//
// Exactly one socket connection is opened per mounted `storeId`, no
// matter how many components on the page call this hook for the same
// store — React Strict Mode / multiple call sites do not open duplicate
// sockets, because the connection itself lives in this module-level
// cache, keyed by storeId, ref-counted by mount/unmount.
const SOCKET_BASE = import.meta.env.VITE_WEBSITE_WIZARD_API_BASE
  ? import.meta.env.VITE_WEBSITE_WIZARD_API_BASE.replace(/\/api\/?$/, '')
  : 'http://localhost:5500';

const connections = new Map(); // storeId -> { socket, refCount, listeners: Set, connected: boolean }

function getConnection(storeId) {
  let entry = connections.get(storeId);
  if (entry) {
    entry.refCount += 1;
    return entry;
  }

  const socket = io(SOCKET_BASE, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  entry = { socket, refCount: 1, listeners: new Set(), connected: false, connectionListeners: new Set() };
  connections.set(storeId, entry);

  const setConnected = (value) => {
    entry.connected = value;
    for (const cb of entry.connectionListeners) cb(value);
  };

  socket.on('connect', () => {
    socket.emit('store:join', storeId);
    setConnected(true);
  });
  socket.on('disconnect', () => setConnected(false));
  socket.on('connect_error', () => setConnected(false));
  socket.on('store:event', (event) => {
    for (const listener of entry.listeners) listener(event);
  });

  return entry;
}

function releaseConnection(storeId) {
  const entry = connections.get(storeId);
  if (!entry) return;
  entry.refCount -= 1;
  if (entry.refCount <= 0) {
    entry.socket.emit('store:leave');
    entry.socket.disconnect();
    connections.delete(storeId);
  }
}

/**
 * useStoreSocket(storeId) — subscribe to every real-time event for a
 * store from an Admin surface. Returns `{ subscribe, connected }`;
 * `subscribe(listener)` returns an unsubscribe function, same contract
 * as StorefrontContext's SSE subscription.
 */
export function useStoreSocket(storeId) {
  const [connected, setConnected] = useState(false);
  const entryRef = useRef(null);

  useEffect(() => {
    if (!storeId) return undefined;

    const entry = getConnection(storeId);
    entryRef.current = entry;
    setConnected(entry.connected);

    const onConnectionChange = (value) => setConnected(value);
    entry.connectionListeners.add(onConnectionChange);

    return () => {
      entry.connectionListeners.delete(onConnectionChange);
      releaseConnection(storeId);
      entryRef.current = null;
    };
  }, [storeId]);

  const subscribe = useCallback((listener) => {
    const entry = entryRef.current;
    if (!entry) return () => {};
    entry.listeners.add(listener);
    return () => entry.listeners.delete(listener);
  }, []);

  return { subscribe, connected };
}
