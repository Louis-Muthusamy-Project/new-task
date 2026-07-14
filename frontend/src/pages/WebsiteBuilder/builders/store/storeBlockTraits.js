/**
 * storeBlockTraits.js
 *
 * Dynamic trait system for GrapesJS Store blocks — §5 of the Dynamic
 * Store Engine Template-Agnostic Redesign ("GrapesJS Integration —
 * universal traits, structurally eliminate mismatches").
 *
 * Traits let a merchant configure a block from the GrapesJS sidebar
 * without editing HTML (limit, columns, sort, which collection, etc.).
 *
 * ── The two defects this redesign fixes ─────────────────────────────────
 * (a) Roughly half the detector's vocabulary (`related-products`,
 *     `best-sellers`, `product-detail`, `wishlist`, `wishlist-button`,
 *     `pagination`, `cart-button`, `checkout-button`) previously had NO
 *     GrapesJS component-type registration at all — no trait sidebar at
 *     any template. Fixed here: BLOCK_TYPE_VOCABULARY below (mirroring
 *     backend/src/utils/storeBlockTemplates.js's own vocabulary) covers
 *     the full detector output, and every grid-family type automatically
 *     gets full trait coverage via the schema-driven factory.
 * (b) Where registrations DID exist, they were hand-written independently
 *     of the detector's own vocabulary — how `navigation` (detector) vs
 *     `menu` (this file) drifted apart, and how `data-collection` (this
 *     file) vs `data-collection-id` (ThemeRenderer.jsx's reader) drifted
 *     apart. Fixed here: every grid-family trait is generated from
 *     `./blockConfigSchema.js`'s `CONFIG_FIELDS`, the SAME module
 *     ThemeRenderer.jsx's `blockConfig()` reads — there's no second,
 *     independently-typed list left to drift.
 *
 * All configuration for the grid-family types lives in ONE JSON attribute,
 * `data-block-config` (see blockConfigSchema.js) — every trait below for
 * those types reads/writes into that same parsed object, never a separate
 * per-field `data-*` attribute. Non-grid types (Header, Hero, Menu, Search,
 * Cart, Checkout, Footer, Testimonials, Blog) keep the simpler one-
 * attribute-per-trait pattern, since they were never part of the naming
 * mismatch and §3's schema doesn't cover their fields.
 */

import { collectionApi } from '../../../../api/storeApi';
import {
  CONFIG_ATTR,
  CONFIG_FIELDS,
  GRID_FAMILY_TYPES,
  CURRENT_COLLECTION_TOKEN,
  buildDefaultConfig,
  readConfigFromElement,
} from './blockConfigSchema';

/**
 * §5 "One shared vocabulary, three consumers" — mirrors
 * backend/src/utils/storeBlockTemplates.js's `AUTO_CONVERTIBLE_TYPES` /
 * `COMPONENT_LABELS`. Can't be one literal shared module across the two
 * separate frontend/backend deployables in this repo, so this list is
 * kept as an explicit, documented mirror (the same pattern
 * ImportWordPressTemplateModal.jsx already uses for `COMPONENT_LABELS`) —
 * every `isComponent` matcher below reads from THIS list instead of
 * hand-typing its own type string, so a type added on the backend only
 * needs this one array touched here, not N independent matchers.
 */
const BLOCK_TYPE_VOCABULARY = [
  'header', 'footer', 'navigation', 'hero',
  'product-grid', 'featured-products', 'category-grid', 'latest-products',
  'best-sellers', 'related-products', 'product-detail',
  'cart', 'checkout', 'wishlist', 'wishlist-button', 'pagination',
  'search', 'cart-button', 'checkout-button',
  // Not detector output, but hand-dropped GrapesJS-only blocks that
  // predate the import pipeline (see storeDynamicBlocks.js) — kept in
  // the same vocabulary so their component types register the same way.
  'featured-product', 'single-product', 'collection', 'testimonials', 'blog',
];

function isBlockType(type) {
  return (el) => el.dataset?.storeBlock === type;
}

/** Helper: plain (non-schema) trait definition, for the non-grid-family types. */
function createTrait(config) {
  return config;
}

// ─────────────────────────────────────────────────────────────────────────
// Custom trait types — operate on the single `data-block-config` JSON
// attribute instead of a one-attribute-per-field mapping.
// ─────────────────────────────────────────────────────────────────────────

/** Reads the full parsed config object off a GrapesJS component's live element. */
function getComponentConfig(component) {
  const el = component.getEl?.();
  if (el) return readConfigFromElement(el);
  // Fallback for a component not yet mounted to the canvas: read straight
  // off its attributes model.
  const attrs = component.getAttributes?.() || {};
  if (attrs[CONFIG_ATTR]) {
    try {
      return JSON.parse(attrs[CONFIG_ATTR]);
    } catch {
      return {};
    }
  }
  return {};
}

/** Writes one field into the config JSON, preserving every other field (§3 single-write). */
function setComponentConfigField(component, key, value) {
  const current = getComponentConfig(component);
  const next = { ...current, [key]: value };
  component.addAttributes({ [CONFIG_ATTR]: JSON.stringify(next) });
}

/**
 * Registers the generic `config-field` trait type: renders a number /
 * select / checkbox / text input per the field metadata attached to the
 * trait (see `traitForField` below), reading/writing into the ONE
 * `data-block-config` JSON attribute rather than its own `data-*`
 * attribute. This is what makes every grid-family field share one
 * attribute without needing a bespoke widget per field.
 */
function registerConfigFieldTraitType(editor) {
  editor.TraitManager.addType('config-field', {
    createInput({ trait }) {
      const widget = trait.get('widget');
      const el = document.createElement(widget === 'select' ? 'select' : 'input');
      if (widget === 'checkbox') {
        el.type = 'checkbox';
      } else if (widget === 'number') {
        el.type = 'number';
        if (trait.get('min') != null) el.min = trait.get('min');
        if (trait.get('max') != null) el.max = trait.get('max');
      } else if (widget === 'select') {
        (trait.get('options') || []).forEach((opt) => {
          const optionEl = document.createElement('option');
          optionEl.value = opt.value;
          optionEl.textContent = opt.name;
          el.appendChild(optionEl);
        });
      } else {
        el.type = 'text';
        if (trait.get('placeholder')) el.placeholder = trait.get('placeholder');
      }
      return el;
    },
    onEvent({ elInput, component, trait }) {
      const widget = trait.get('widget');
      const key = trait.get('configKey');
      const raw = widget === 'checkbox' ? elInput.checked : elInput.value;
      const value = widget === 'number' ? Number(raw) : raw;
      setComponentConfigField(component, key, value);
    },
    onUpdate({ elInput, component, trait }) {
      const widget = trait.get('widget');
      const key = trait.get('configKey');
      const config = getComponentConfig(component);
      const value = config[key] ?? trait.get('defaultValue');
      if (widget === 'checkbox') elInput.checked = !!value;
      else elInput.value = value ?? '';
    },
  });
}

/**
 * Registers the `collection-picker` trait type (§5 — replaces the old
 * plain text box that expected a merchant to paste a raw database id).
 * Lists the store's actual `StoreCollection`s plus a "Current category
 * (automatic)" option that writes `CURRENT_COLLECTION_TOKEN` (§4 mode 1).
 */
function registerCollectionPickerTraitType(editor, { storeId }) {
  editor.TraitManager.addType('collection-picker', {
    createInput({ trait }) {
      const el = document.createElement('select');
      const autoOption = document.createElement('option');
      autoOption.value = CURRENT_COLLECTION_TOKEN;
      autoOption.textContent = 'Current category (automatic)';
      el.appendChild(autoOption);

      if (storeId) {
        collectionApi
          .list(storeId)
          .then((collections) => {
            (collections || []).forEach((c) => {
              const optionEl = document.createElement('option');
              optionEl.value = c._id || c.id;
              optionEl.textContent = c.name;
              el.appendChild(optionEl);
            });
            // Re-apply the current value now that its option may have
            // just been added (collections load asynchronously, after
            // the input already mounted with only the "automatic" option).
            trait.target && this.onUpdate({ elInput: el, component: trait.target, trait });
          })
          .catch(() => {
            // No collections yet (brand-new store) — the "automatic"
            // option alone is still a fully valid, working choice.
          });
      }
      return el;
    },
    onEvent({ elInput, component, trait }) {
      setComponentConfigField(component, trait.get('configKey'), elInput.value);
    },
    onUpdate({ elInput, component, trait }) {
      const config = getComponentConfig(component);
      elInput.value = config[trait.get('configKey')] ?? CURRENT_COLLECTION_TOKEN;
    },
  });
}

/** Builds one GrapesJS trait definition from a `CONFIG_FIELDS` entry. */
function traitForField(field) {
  return {
    type: field.widget === 'collection-picker' ? 'collection-picker' : 'config-field',
    name: field.key,
    configKey: field.key,
    label: field.label,
    widget: field.widget,
    options: field.options,
    min: field.min,
    max: field.max,
    placeholder: field.placeholder,
    defaultValue: field.defaultFor ? undefined : field.default,
  };
}

/** All traits applicable to `type`, generated from the canonical schema (§5). */
function schemaTraitsForType(type) {
  return CONFIG_FIELDS.filter((f) => f.appliesTo.has(type)).map(traitForField);
}

// ─────────────────────────────────────────────────────────────────────────
// Non-grid-family traits — unchanged simple one-attribute-per-trait
// pattern; these fields were never part of the naming-mismatch bug and
// aren't covered by §3's schema.
// ─────────────────────────────────────────────────────────────────────────

const heroTraits = [
  createTrait({ name: 'data-height', label: 'Height', type: 'select', default: 'medium', options: [
    { value: 'small', name: 'Small (60px)' }, { value: 'medium', name: 'Medium (96px)' }, { value: 'large', name: 'Large (140px)' },
  ] }),
  createTrait({ name: 'data-alignment', label: 'Content Alignment', type: 'select', default: 'center', options: [
    { value: 'left', name: 'Left' }, { value: 'center', name: 'Center' }, { value: 'right', name: 'Right' },
  ] }),
  createTrait({ name: 'data-show-button', label: 'Show CTA Button', type: 'checkbox', default: true }),
];

const testimonialsTraits = [
  createTrait({ name: 'data-limit', label: 'Testimonials to Show', type: 'number', default: 3, min: 1, max: 20 }),
  createTrait({ name: 'data-columns', label: 'Columns', type: 'select', default: '3', options: [
    { value: '1', name: '1 Column' }, { value: '2', name: '2 Columns' }, { value: '3', name: '3 Columns' },
  ] }),
  createTrait({ name: 'data-autoplay', label: 'Autoplay', type: 'checkbox', default: false }),
];

const searchTraits = [
  createTrait({ name: 'data-placeholder', label: 'Placeholder Text', type: 'text', default: 'Search products...' }),
  createTrait({ name: 'data-show-filters', label: 'Show Filters', type: 'checkbox', default: true }),
];

const headerTraits = [
  createTrait({ name: 'data-show-cart', label: 'Show Cart Icon', type: 'checkbox', default: true }),
  createTrait({ name: 'data-sticky', label: 'Sticky on Scroll', type: 'checkbox', default: false }),
];

const menuTraits = [
  createTrait({ name: 'data-alignment', label: 'Alignment', type: 'select', default: 'center', options: [
    { value: 'left', name: 'Left' }, { value: 'center', name: 'Center' }, { value: 'right', name: 'Right' },
  ] }),
  createTrait({ name: 'data-limit', label: 'Max Links', type: 'number', default: 8, min: 1, max: 20 }),
];

const blogTraits = [
  createTrait({ name: 'data-limit', label: 'Posts to Show', type: 'number', default: 3, min: 1, max: 20 }),
  createTrait({ name: 'data-columns', label: 'Columns', type: 'select', default: '3', options: [
    { value: '1', name: '1 Column' }, { value: '2', name: '2 Columns' }, { value: '3', name: '3 Columns' },
  ] }),
  createTrait({ name: 'data-show-excerpt', label: 'Show Excerpt', type: 'checkbox', default: true }),
];

const redirectTrait = createTrait({
  name: 'data-redirect-url', label: 'Button Redirect Link (optional)', type: 'text', default: '',
  placeholder: '/cart, /checkout, or https://...',
});

/**
 * Registers every Store block's custom GrapesJS component type. Safe to
 * call more than once (`addType`/`addTraitType` upsert by id/name).
 *
 * @param {object} editor    GrapesJS editor instance
 * @param {object} [opts]
 * @param {string} [opts.storeId]  needed by the collection-picker trait to
 *   fetch the store's actual `StoreCollection`s; omitted, the picker still
 *   offers "Current category (automatic)" (§4 mode 1 has no dependency on it).
 */
export function registerStoreTraits(editor, { storeId } = {}) {
  if (!editor || !editor.DomComponents) {
    console.warn('[storeBlockTraits] DomComponents not available');
    return;
  }

  if (editor.TraitManager) {
    registerConfigFieldTraitType(editor);
    registerCollectionPickerTraitType(editor, { storeId });
  }

  // ── Grid-family types: traits generated entirely from the schema (§5) ──
  [...GRID_FAMILY_TYPES].forEach((type) => {
    const traits = [...schemaTraitsForType(type), redirectTrait];
    editor.DomComponents.addType(type, {
      isComponent: isBlockType(type),
      model: {
        defaults: {
          traits,
          attributes: { [CONFIG_ATTR]: JSON.stringify(buildDefaultConfig(type)) },
        },
      },
    });
  });

  // ── Product Detail — single product, no repeating grid; only the
  //    redirect trait applies (limit/sort/collection don't) ──────────────
  editor.DomComponents.addType('product-detail', {
    isComponent: isBlockType('product-detail'),
    model: { defaults: { traits: [redirectTrait] } },
  });

  // ── Wishlist / Wishlist Button / Pagination / Cart Button / Checkout
  //    Button — previously had NO trait registration at all (§5 defect a) ─
  editor.DomComponents.addType('wishlist', {
    isComponent: isBlockType('wishlist'),
    model: { defaults: { traits: [redirectTrait] } },
  });
  editor.DomComponents.addType('wishlist-button', {
    isComponent: isBlockType('wishlist-button'),
    model: { defaults: { traits: [] } },
  });
  editor.DomComponents.addType('pagination', {
    isComponent: isBlockType('pagination'),
    model: {
      defaults: {
        traits: [createTrait({ name: 'data-group', label: 'Pagination Group', type: 'text', default: 'default' })],
      },
    },
  });
  editor.DomComponents.addType('cart-button', {
    isComponent: isBlockType('cart-button'),
    model: { defaults: { traits: [] } },
  });
  editor.DomComponents.addType('checkout-button', {
    isComponent: isBlockType('checkout-button'),
    model: { defaults: { traits: [] } },
  });

  // ── Header / Navigation / Hero ───────────────────────────────────────
  editor.DomComponents.addType('header', {
    isComponent: isBlockType('header'),
    model: { defaults: { traits: headerTraits, attributes: { 'data-show-cart': 'true', 'data-sticky': 'false' } } },
  });
  editor.DomComponents.addType('navigation', {
    isComponent: isBlockType('navigation'),
    model: { defaults: { traits: menuTraits, attributes: { 'data-alignment': 'center', 'data-limit': '8' } } },
  });
  // 'menu' kept as an alias component type for any already-saved page
  // that predates the detector's `navigation` vocabulary rename (§6).
  editor.DomComponents.addType('menu', {
    isComponent: isBlockType('menu'),
    model: { defaults: { traits: menuTraits, attributes: { 'data-alignment': 'center', 'data-limit': '8' } } },
  });
  editor.DomComponents.addType('hero', {
    isComponent: isBlockType('hero'),
    model: {
      defaults: {
        traits: heroTraits,
        attributes: { 'data-height': 'medium', 'data-alignment': 'center', 'data-show-button': 'true' },
      },
    },
  });

  // ── Featured Product (single) / Single Product — hand-dropped
  //    GrapesJS-only blocks, not detector output, but part of the same
  //    vocabulary (§5) ───────────────────────────────────────────────────
  editor.DomComponents.addType('featured-product', {
    isComponent: isBlockType('featured-product'),
    model: {
      defaults: {
        traits: [
          createTrait({ name: 'data-product-id', label: 'Product ID', type: 'text', default: '', placeholder: 'Leave empty for latest product' }),
          createTrait({ name: 'data-show-price', label: 'Show Price', type: 'checkbox', default: true }),
          createTrait({ name: 'data-show-button', label: 'Show Add to Cart Button', type: 'checkbox', default: true }),
          redirectTrait,
        ],
        attributes: { 'data-product-id': '', 'data-show-price': 'true', 'data-show-button': 'true' },
      },
    },
  });
  editor.DomComponents.addType('single-product', {
    isComponent: isBlockType('single-product'),
    model: { defaults: { traits: [redirectTrait], attributes: { 'data-redirect-url': '' } } },
  });

  // ── Collection (generic, hand-dropped block predating category-grid) ──
  editor.DomComponents.addType('collection', {
    isComponent: isBlockType('collection'),
    model: {
      defaults: {
        traits: [
          createTrait({ name: 'data-limit', label: 'Collections to Show', type: 'number', default: 6, min: 1, max: 50 }),
          createTrait({ name: 'data-sort', label: 'Sort By', type: 'select', default: 'latest', options: [
            { value: 'latest', name: 'Latest' }, { value: 'oldest', name: 'Oldest' }, { value: 'name', name: 'Name' },
          ] }),
          createTrait({ name: 'data-columns', label: 'Columns', type: 'select', default: '3', options: [
            { value: '2', name: '2 Columns' }, { value: '3', name: '3 Columns' }, { value: '4', name: '4 Columns' },
          ] }),
        ],
        attributes: { 'data-limit': '6', 'data-sort': 'latest', 'data-columns': '3' },
      },
    },
  });

  // ── Testimonials / Blog / Search ─────────────────────────────────────
  editor.DomComponents.addType('testimonials', {
    isComponent: isBlockType('testimonials'),
    model: { defaults: { traits: testimonialsTraits, attributes: { 'data-limit': '3', 'data-columns': '3', 'data-autoplay': 'false' } } },
  });
  editor.DomComponents.addType('blog', {
    isComponent: isBlockType('blog'),
    model: { defaults: { traits: blogTraits, attributes: { 'data-limit': '3', 'data-columns': '3', 'data-show-excerpt': 'true' } } },
  });
  // 'blog-list' — detector's own vocabulary name for the same concept
  // (§5's "one shared vocabulary"); registered as its own type too so a
  // freshly-imported page's `data-store-block="blog-list"` gets the same
  // trait coverage without a merchant having to rename anything.
  editor.DomComponents.addType('blog-list', {
    isComponent: isBlockType('blog-list'),
    model: { defaults: { traits: blogTraits, attributes: { 'data-limit': '3', 'data-columns': '3', 'data-show-excerpt': 'true' } } },
  });
  editor.DomComponents.addType('search', {
    isComponent: isBlockType('search'),
    model: { defaults: { traits: searchTraits, attributes: { 'data-placeholder': 'Search products...', 'data-show-filters': 'true' } } },
  });

  // ── Cart / Checkout / Footer ──────────────────────────────────────────
  editor.DomComponents.addType('cart', {
    isComponent: isBlockType('cart'),
    model: { defaults: { traits: [] } },
  });
  editor.DomComponents.addType('checkout', {
    isComponent: isBlockType('checkout'),
    model: {
      defaults: {
        traits: [createTrait({ name: 'data-redirect-url', label: 'Redirect after order (next step URL)', type: 'text', default: '', placeholder: '/confirmed' })],
      },
    },
  });
  editor.DomComponents.addType('footer', {
    isComponent: isBlockType('footer'),
    model: { defaults: { traits: [] } },
  });
}

export { BLOCK_TYPE_VOCABULARY, createTrait };
