'use strict';

/**
 * storeEvents.js — Store Engine real-time event bus
 *
 * The single place that understands "something in this store's Product
 * graph just changed." Every write path in the Store Engine (ProductService,
 * CollectionService, InventoryService) calls `emitStoreEvent()` right after
 * it commits a change; every live consumer (the SSE stream in
 * storeStorefrontController.js, and — indirectly — every storefront hook on
 * the frontend) calls `subscribe()` to hear about it.
 *
 * This is what makes "no manual refresh logic" possible: nothing polls,
 * nothing guesses a TTL short enough to feel live — a write emits an event,
 * the event streams to every open storefront tab via SSE, and the
 * corresponding hook re-fetches its own query. One event bus, no per-surface
 * copies of "when should I refetch."
 *
 * Deliberately dependency-free (a plain Node EventEmitter) — same trade-off
 * `storeCache.js` documents for itself: this app is single-process, so this
 * is sufficient. If the app is ever scaled horizontally, swap this module's
 * internals for a shared pub/sub (Redis, etc.) without changing the calling
 * code (same emitStoreEvent/subscribe shape) or the SSE wire format.
 */

const { EventEmitter } = require('events');

const bus = new EventEmitter();
// Many concurrent storefront tabs/preview panels can subscribe to the same
// store; this is a fan-out event bus, not a leak.
bus.setMaxListeners(0);

const channelName = (storeId) => `store:${String(storeId)}`;

/**
 * Event `type` vocabulary (dot-namespaced by entity):
 *   product.created | product.updated | product.deleted
 *   collection.created | collection.updated | collection.deleted
 *   inventory.updated
 *
 * `payload` is intentionally small (ids + the bit that changed) — every
 * subscriber re-fetches the real data from the Store Engine's public API
 * rather than trusting a denormalized copy carried on the event itself.
 */
function emitStoreEvent(storeId, type, payload = {}) {
  if (!storeId) return;
  bus.emit(channelName(storeId), {
    type,
    storeId: String(storeId),
    payload,
    ts: Date.now(),
  });
}

/**
 * Subscribes `listener` to every event for `storeId`. Returns an
 * unsubscribe function — callers (the SSE route) must call it when the
 * underlying connection closes, or the listener leaks for the life of the
 * process.
 */
function subscribe(storeId, listener) {
  const name = channelName(storeId);
  bus.on(name, listener);
  return () => bus.off(name, listener);
}

module.exports = { emitStoreEvent, subscribe };
