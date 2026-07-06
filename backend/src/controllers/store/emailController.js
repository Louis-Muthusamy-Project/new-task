'use strict';

/**
 * emailController.js — Email Sender Module (admin)
 *
 * Store-module counterpart of shippingController.js / paymentController.js.
 * A store has exactly one StoreEmailSettings document, so this is a
 * find-or-create "settings" resource with three write endpoints: sender
 * identity, SMTP connection, and per-event templates (Order Mail, Welcome
 * Mail, etc. — each an independently-editable sub-resource, same shape as
 * how Payments treats each gateway).
 *
 * Used by the Email sender tab in StoresTab.jsx (sub-tabs: SMTP,
 * Templates, Order Mail, Welcome Mail).
 */

const mongoose = require('mongoose');
const StoreEmailSettings = require('../../models/store/StoreEmailSettings');
const Store = require('../../models/store/Store');

const notFoundError = (message) => {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
};

const badRequestError = (message) => {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
};

const requireValidId = (id, label = 'id') => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw badRequestError(`Invalid ${label}.`);
  }
};

async function getOrCreateEmailSettings(storeId) {
  let settings = await StoreEmailSettings.findOne({ storeId });
  if (!settings) {
    settings = await StoreEmailSettings.create({ storeId });
  }
  return settings;
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/store/:storeId/admin/email
// Find-or-create — every store gets default templates + blank SMTP the
// first time this is requested, so the Email sender tab always has
// something to render.
// ─────────────────────────────────────────────────────────────────────────
exports.getEmailSettings = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const store = await Store.findOne({ _id: storeId, isDeleted: false }).lean();
  if (!store) throw notFoundError('Store not found.');

  const settings = await getOrCreateEmailSettings(storeId);
  res.status(200).json({ success: true, data: settings });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/email/sender
// Body: { useCustomSender, senderName, senderEmail, replyToEmail }
// ─────────────────────────────────────────────────────────────────────────
exports.updateSender = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const settings = await getOrCreateEmailSettings(storeId);
  const body = req.body || {};

  if (Object.prototype.hasOwnProperty.call(body, 'useCustomSender')) {
    settings.useCustomSender = !!body.useCustomSender;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'senderName')) {
    settings.senderName = String(body.senderName || '').trim();
  }
  if (Object.prototype.hasOwnProperty.call(body, 'senderEmail')) {
    settings.senderEmail = String(body.senderEmail || '').trim();
  }
  if (Object.prototype.hasOwnProperty.call(body, 'replyToEmail')) {
    settings.replyToEmail = String(body.replyToEmail || '').trim();
  }

  await settings.save();
  res.status(200).json({ success: true, data: settings });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/email/smtp
// Body: { isCustom, host, port, username, password, useSSL }
// ─────────────────────────────────────────────────────────────────────────
exports.updateSmtp = async (req, res) => {
  const { storeId } = req.params;
  requireValidId(storeId, 'storeId');

  const settings = await getOrCreateEmailSettings(storeId);
  const body = req.body || {};

  if (Object.prototype.hasOwnProperty.call(body, 'isCustom') && body.isCustom === true) {
    if (!body.host && !settings.smtp.host) {
      throw badRequestError('Add an SMTP host before enabling a custom connection.');
    }
  }

  const fields = ['isCustom', 'host', 'username', 'password', 'useSSL'];
  for (const field of fields) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
    if (field === 'isCustom' || field === 'useSSL') settings.smtp[field] = !!body[field];
    else settings.smtp[field] = String(body[field] || '').trim();
  }
  if (Object.prototype.hasOwnProperty.call(body, 'port')) {
    settings.smtp.port = Number(body.port) || 587;
  }

  await settings.save();
  res.status(200).json({ success: true, data: settings });
};

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/store/:storeId/admin/email/templates/:type
// type: orderConfirmation | shippingUpdate | orderCancelled | abandonedCart
//       | welcome
// Body: { enabled, subject, body }
// ─────────────────────────────────────────────────────────────────────────
exports.updateTemplate = async (req, res) => {
  const { storeId, type } = req.params;
  requireValidId(storeId, 'storeId');

  if (!StoreEmailSettings.TEMPLATE_TYPES.includes(type)) {
    throw badRequestError(
      `Unknown email template "${type}". Expected one of: ${StoreEmailSettings.TEMPLATE_TYPES.join(', ')}.`
    );
  }

  const settings = await getOrCreateEmailSettings(storeId);
  const payload = req.body || {};
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(payload, 'enabled')) updates.enabled = !!payload.enabled;
  if (Object.prototype.hasOwnProperty.call(payload, 'subject')) updates.subject = String(payload.subject || '').trim();
  if (Object.prototype.hasOwnProperty.call(payload, 'body')) updates.body = payload.body || '';

  if (updates.enabled === true && !(updates.subject || settings.templates[type].subject)) {
    throw badRequestError('Add a subject line before enabling this email.');
  }

  Object.assign(settings.templates[type], updates);
  settings.markModified(`templates.${type}`);
  await settings.save();

  res.status(200).json({ success: true, data: settings });
};
