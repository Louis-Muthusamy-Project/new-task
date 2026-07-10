'use strict';

/**
 * funnelEvents.js — Funnel Engine integration event bus
 *
 * The single integration point for "something happened in this funnel
 * that a downstream system might care about." Every write path that
 * produces a funnel-relevant business event (FunnelContact creation,
 * a funnel checkout order) calls `emitFunnelEvent()` right after it
 * commits; a future CRM, Automation, Email, or Webhook module calls
 * `subscribe()` to hear about it — without funnelContactController or
 * funnelCheckoutService ever needing to know that subscriber exists.
 *
 * No CRM/Automation/Email/Webhook module exists in this codebase yet
 * (the CRM pages under frontend/src/pages/CRM are static, backend-less
 * mocks). This bus is deliberately built ahead of that so those modules,
 * when built, plug in as a `subscribe()` call rather than requiring every
 * event-producing controller/service to be modified to know about them.
 *
 * Mirrors services/store/storeEvents.js exactly — same deliberately
 * dependency-free EventEmitter trade-off, same "swap the internals for a
 * shared pub/sub (Redis, etc.) later without changing calling code"
 * escape hatch if this ever needs to run across more than one process.
 */

const { EventEmitter } = require('events');

const bus = new EventEmitter();
// Many concurrent subscribers (a future CRM sync, an automation engine,
// a webhook dispatcher) can listen to the same funnel; this is a fan-out
// event bus, not a leak.
bus.setMaxListeners(0);

const channelName = (funnelId) => `funnel:${String(funnelId)}`;

/**
 * Event `type` vocabulary (dot-namespaced by entity):
 *   contact.created   — a FunnelContact was captured on any step
 *   order.created      — a funnel checkout step produced a StoreOrder
 *
 * `payload` is intentionally small (ids + the bit that changed) — every
 * subscriber re-fetches the real data (FunnelContact / StoreOrder) from
 * its own service rather than trusting a denormalized copy carried on
 * the event itself — same discipline storeEvents.js documents for
 * itself.
 */
function emitFunnelEvent(funnelId, type, payload = {}) {
  if (!funnelId) return;
  bus.emit(channelName(funnelId), {
    type,
    funnelId: String(funnelId),
    payload,
    ts: Date.now(),
  });
}

/**
 * Subscribes `listener` to every event for `funnelId`. Returns an
 * unsubscribe function — callers must call it when they no longer need
 * to listen (e.g. a webhook dispatcher shutting down), or the listener
 * leaks for the life of the process.
 */
function subscribe(funnelId, listener) {
  const name = channelName(funnelId);
  bus.on(name, listener);
  return () => bus.off(name, listener);
}

module.exports = { emitFunnelEvent, subscribe };
