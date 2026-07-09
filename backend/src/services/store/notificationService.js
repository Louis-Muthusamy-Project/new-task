'use strict';

/**
 * notificationService.js — Notification Service
 *
 * Owns the "send a transactional email" concern for a Store: resolving the
 * merchant's editable StoreEmailSettings template for a given event
 * (Order Confirmation / Shipping Update / Order Cancelled), substituting
 * `{{variable}}` placeholders with real order/customer data, and
 * delivering it over the store's configured SMTP connection.
 *
 * This is the single place that:
 *   - finds-or-creates a store's StoreEmailSettings document (previously
 *     duplicated inline inside emailController.getEmailSettings — that
 *     controller now calls the copy here instead of keeping its own).
 *   - knows how to turn a template + order + customer into an actual
 *     sendable email.
 *   - is the only caller of nodemailer anywhere in the codebase.
 *
 * OrderService is the only caller of this module: it calls
 * `sendOrderConfirmation()` right after checkout and `sendOrderStatusEmail()`
 * on Shipped/Cancelled transitions. Both funnel through the same
 * `resolveAndSend()` so there is exactly one implementation of "compose +
 * deliver a transactional email," not one per event type, and exactly one
 * place ("was this order's confirmation actually sent?") for the Orders
 * Module to read back from.
 *
 * Delivery never throws. A store that hasn't configured its own SMTP
 * connection yet gets the same "simulated" treatment OrderService already
 * documents for unwired payment gateways: the email is composed and
 * logged, `sent: false` is recorded with a reason, and checkout/status
 * updates are never blocked or rolled back by a mail failure.
 */

const nodemailer = require('nodemailer');
const StoreEmailSettings = require('../../models/store/StoreEmailSettings');
const Store = require('../../models/store/Store');
const { emitStoreEvent } = require('./storeEvents');

// Which StoreEmailSettings.templates key backs each notification "type".
// Kept here, not per-caller, so "which template does this event use" is
// decided in exactly one place.
const TEMPLATE_FOR_TYPE = {
  orderConfirmation: 'orderConfirmation',
  shippingUpdate: 'shippingUpdate',
  orderCancelled: 'orderCancelled',
};

async function getOrCreateEmailSettings(storeId) {
  let settings = await StoreEmailSettings.findOne({ storeId });
  if (!settings) {
    settings = await StoreEmailSettings.create({ storeId });
  }
  return settings;
}

function renderTemplate(str, vars) {
  return String(str || '').replace(/{{\s*(\w+)\s*}}/g, (_match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : ''
  );
}

function formatMoney(amount, currency) {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(value);
  } catch {
    return `${currency || 'USD'} ${value.toFixed(2)}`;
  }
}

// One cached transporter per distinct SMTP config seen so far — cheap
// reuse across requests without needing a per-store registry to manage.
let cachedTransporter = null;
let cachedTransporterKey = null;

function getTransporter(smtp) {
  if (!smtp?.isCustom || !smtp.host) return null;

  const key = `${smtp.host}:${smtp.port}:${smtp.username}:${smtp.useSSL}`;
  if (cachedTransporter && cachedTransporterKey === key) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port || 587,
    secure: !!smtp.useSSL,
    auth: smtp.username ? { user: smtp.username, pass: smtp.password } : undefined,
  });
  cachedTransporterKey = key;
  return cachedTransporter;
}

/**
 * Resolves the named template, fills in order/customer variables, attempts
 * delivery, records the attempt on the order's `notifications` array, and
 * emits a `notification.sent` store event (mirrors the fan-out pattern
 * every other Store Engine write already uses). Never throws — a
 * notification failure must never unwind order creation or a status
 * update.
 */
async function resolveAndSend(storeId, type, { order, customer }) {
  const templateKey = TEMPLATE_FOR_TYPE[type];
  if (!templateKey) {
    throw new Error(`Unknown notification type "${type}".`);
  }

  const recipientEmail = customer?.email || '';
  const result = { attempted: false, sent: false, to: recipientEmail, reason: undefined };

  if (!recipientEmail) {
    result.reason = 'no-recipient-email';
    return recordAndEmit(storeId, order, type, result);
  }

  const [settings, store] = await Promise.all([
    getOrCreateEmailSettings(storeId),
    Store.findOne({ _id: storeId, isDeleted: false }).select('name storeName').lean(),
  ]);

  const template = settings.templates[templateKey];
  if (!template?.enabled) {
    result.reason = 'template-disabled';
    return recordAndEmit(storeId, order, type, result);
  }

  const storeName = store?.storeName || store?.name || 'our store';
  const vars = {
    customerName: [customer?.firstName, customer?.lastName].filter(Boolean).join(' ') || 'there',
    orderNumber: order.orderNumber,
    orderTotal: formatMoney(order.total, order.currency),
    storeName,
  };

  const subject = renderTemplate(template.subject, vars);
  const body = renderTemplate(template.body, vars);
  const fromAddress =
    settings.useCustomSender && settings.senderEmail
      ? `${settings.senderName || storeName} <${settings.senderEmail}>`
      : `${storeName} <no-reply@storefront.local>`;

  result.attempted = true;

  const transporter = getTransporter(settings.smtp);
  if (!transporter) {
    // No SMTP configured for this store yet — compose and log the email so
    // the order flow stays fully observable/testable end to end, same
    // simulated-delivery approach OrderService documents for payment
    // capture in this environment.
    result.reason = 'smtp-not-configured';
    // eslint-disable-next-line no-console
    console.log(`[NotificationService] (simulated) ${type} → ${recipientEmail}: "${subject}"\n${body}`);
    return recordAndEmit(storeId, order, type, result);
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: recipientEmail,
      replyTo: settings.replyToEmail || undefined,
      subject,
      text: body,
    });
    result.sent = true;
  } catch (err) {
    result.reason = err.message;
    // eslint-disable-next-line no-console
    console.error(`[NotificationService] delivery failed (${type}) for order`, order._id, err);
  }

  return recordAndEmit(storeId, order, type, result);
}

async function recordAndEmit(storeId, order, type, result) {
  // Best-effort audit trail on the order itself — read by the Orders
  // Module so "was the confirmation actually sent" is answerable from the
  // order record instead of only living in server logs.
  try {
    await order.constructor.updateOne(
      { _id: order._id },
      {
        $push: {
          notifications: {
            type,
            sent: result.sent,
            to: result.to || '',
            reason: result.reason || '',
            sentAt: new Date(),
          },
        },
      }
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[NotificationService] failed to record notification on order', order._id, err);
  }

  emitStoreEvent(storeId, 'notification.sent', {
    orderId: order._id,
    type,
    to: result.to,
    sent: result.sent,
    reason: result.reason,
  });

  return result;
}

/** Called once by OrderService.createOrder, right after checkout completes. */
async function sendOrderConfirmation(storeId, order, customer) {
  return resolveAndSend(storeId, 'orderConfirmation', { order, customer });
}

/**
 * Called by OrderService.updateOrderStatus on a Shipped/Cancelled
 * transition. Any other status is a no-op (no template maps to it) —
 * returned as an unattempted result rather than the caller having to know
 * the status→template mapping itself.
 */
async function sendOrderStatusEmail(storeId, order, customer, status) {
  const type = status === 'Shipped' ? 'shippingUpdate' : status === 'Cancelled' ? 'orderCancelled' : null;
  if (!type) return { attempted: false, sent: false, reason: 'no-template-for-status' };
  return resolveAndSend(storeId, type, { order, customer });
}

module.exports = {
  getOrCreateEmailSettings,
  sendOrderConfirmation,
  sendOrderStatusEmail,
};
