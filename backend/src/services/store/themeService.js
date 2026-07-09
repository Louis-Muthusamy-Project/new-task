'use strict';

/**
 * themeService.js — Theme Service
 *
 * Per audit finding #7 ("theme tokens stored but never applied to
 * rendered pages"), this is the first real read/write home for a Store's
 * theme tokens: `Store.theme` (colors, fonts, layout, custom), seeded from
 * `StoreTemplate.theme` at creation time and independently editable after.
 *
 * `compileToCssVariables` turns those tokens into a flat map of CSS custom
 * properties — the same shape a future Preview Engine / storefront
 * renderer would inject as a single <style> block, so there is exactly one
 * place that decides "what CSS variable name does `colors.primary` become."
 */

const Store = require('../../models/store/Store');
const { notFoundError } = require('./errors');
const { emitStoreEvent } = require('./storeEvents');

const DEFAULT_THEME = {
  colors: { primary: '#111827', secondary: '#6B7280', background: '#FFFFFF', text: '#111827' },
  fonts: { heading: 'Inter, sans-serif', body: 'Inter, sans-serif' },
  layout: 'standard',
  custom: {},
};

function mergeTheme(base, incoming = {}) {
  return {
    colors: { ...base.colors, ...(incoming.colors || {}) },
    fonts: { ...base.fonts, ...(incoming.fonts || {}) },
    layout: incoming.layout ?? base.layout,
    custom: { ...(base.custom || {}), ...(incoming.custom || {}) },
  };
}

async function getTheme(storeId) {
  const store = await Store.findOne({ _id: storeId, isDeleted: false }).select('theme').lean();
  if (!store) throw notFoundError('Store not found.');
  return mergeTheme(DEFAULT_THEME, store.theme || {});
}

async function updateTheme(storeId, patch = {}) {
  const store = await Store.findOne({ _id: storeId, isDeleted: false });
  if (!store) throw notFoundError('Store not found.');

  const nextTheme = mergeTheme(mergeTheme(DEFAULT_THEME, store.theme || {}), patch);
  store.theme = nextTheme;
  await store.save();
  // The live storefront (StorefrontContext) re-fetches the compiled CSS
  // variables and re-applies them to the document root on this event, so
  // a color/font/layout change shows up on an already-open storefront tab
  // without a reload — the same "no manual refresh" contract every other
  // admin-editable entity gets via storeEvents.js.
  emitStoreEvent(storeId, 'theme.updated', { theme: nextTheme });
  return nextTheme;
}

/**
 * Compiles theme tokens into a flat { '--color-primary': '#...', ... }
 * map, ready to be serialized into a single CSS custom-property block by
 * whatever renders a page (builder canvas, preview, or live storefront).
 */
function compileToCssVariables(theme) {
  const resolved = mergeTheme(DEFAULT_THEME, theme || {});
  const vars = {
    '--color-primary': resolved.colors.primary,
    '--color-secondary': resolved.colors.secondary,
    '--color-background': resolved.colors.background,
    '--color-text': resolved.colors.text,
    '--font-heading': resolved.fonts.heading,
    '--font-body': resolved.fonts.body,
  };

  for (const [key, value] of Object.entries(resolved.custom || {})) {
    vars[`--${key}`] = value;
  }

  return vars;
}

module.exports = { DEFAULT_THEME, getTheme, updateTheme, compileToCssVariables };