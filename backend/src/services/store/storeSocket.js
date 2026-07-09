'use strict';

/**
 * storeSocket.js — Socket.io bridge for the Store Engine event bus
 *
 * storeEvents.js is the single source of truth for "something in this
 * store's data just changed." Two transports read from it, each used
 * where it's actually the right tool:
 *
 *   - SSE (storeStorefrontController.streamEvents) — the public, live
 *     STOREFRONT. One-way server->client, unauthenticated, works with a
 *     plain native EventSource, auto-reconnects on its own. Exactly
 *     right for "many anonymous read-only tabs, no client->server
 *     traffic needed."
 *
 *   - Socket.io (this file) — the ADMIN dashboard. A merchant/agency user
 *     can have several tabs (or several team members) open on the same
 *     store's Products/Orders/Discounts/Collections/Customers/Theme
 *     screens at once; Socket.io's room model lets every one of those
 *     connections join a single `store:<id>` room and receive the exact
 *     same event fan-out SSE gives the storefront, with the added
 *     benefit of a real bidirectional channel (acks, join/leave,
 *     presence) if the Admin UI ever needs one — which a plain
 *     EventSource can't offer. This is "Socket.io where appropriate":
 *     the storefront never needed a back-channel, the admin dashboard
 *     might, so it gets the transport that supports one.
 *
 * Both transports are driven by the exact same `emitStoreEvent` calls
 * already made throughout services/store/*.js — nothing upstream needs
 * to know two transports exist, and there is no dual-write or drift risk
 * between "what the storefront sees live" and "what the admin dashboard
 * sees live."
 */

const { subscribe } = require('./storeEvents');

let io = null;

// One storeEvents subscription per storeId for the life of the process,
// no matter how many sockets join that room — fan-out to N connected
// admin clients happens at the Socket.io layer (`io.to(room).emit(...)`),
// not by re-subscribing to the event bus per socket. Same "dependency-free,
// single-process is enough for now" trade-off storeEvents.js and
// storeCache.js each already document for themselves.
const bridgedStoreIds = new Set();

const roomName = (storeId) => `store:${String(storeId)}`;

function ensureBridged(storeId) {
  const id = String(storeId);
  if (bridgedStoreIds.has(id)) return;
  bridgedStoreIds.add(id);

  subscribe(id, (event) => {
    if (!io) return;
    io.to(roomName(id)).emit('store:event', event);
  });
}

/**
 * Attaches a Socket.io server to the given HTTP server. Call once, from
 * server.js, alongside `httpServer.listen(...)`.
 *
 * Wire contract (mirrors the SSE event shape 1:1 so Admin-side listeners
 * can share the same event-type vocabulary/handling code the storefront
 * hooks already use):
 *   Client -> Server:  socket.emit('store:join', storeId)
 *   Server -> Client:  socket.emit('store:event', { type, storeId, payload, ts })
 *
 * Deliberately unauthenticated for now, matching the SSE stream's own
 * trust level (read-only fan-out, nothing is ever written from a
 * socket) — see the module docstring above. If Admin-only data ever
 * needs to travel over this channel, add a handshake auth check here
 * (e.g. verifying the same JWT jwtMiddleware.js already validates on
 * REST) before trusting `store:join`.
 */
function initStoreSocket(httpServer, { path = '/socket.io', corsOrigin = '*' } = {}) {
  // Require lazily so a backend that hasn't run `npm install` yet for
  // this feature doesn't crash on require() for routes that never touch
  // sockets — server.js is the only caller, and it already guards this.
  const { Server } = require('socket.io');

  io = new Server(httpServer, {
    path,
    cors: { origin: corsOrigin, credentials: true },
  });

  io.on('connection', (socket) => {
    let joinedStoreId = null;

    socket.on('store:join', (storeId) => {
      if (!storeId || typeof storeId !== 'string') return;
      if (joinedStoreId === storeId) return;

      if (joinedStoreId) socket.leave(roomName(joinedStoreId));
      joinedStoreId = storeId;
      socket.join(roomName(storeId));
      ensureBridged(storeId);

      socket.emit('store:joined', { storeId });
    });

    socket.on('store:leave', () => {
      if (joinedStoreId) socket.leave(roomName(joinedStoreId));
      joinedStoreId = null;
    });
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = { initStoreSocket, getIO };
