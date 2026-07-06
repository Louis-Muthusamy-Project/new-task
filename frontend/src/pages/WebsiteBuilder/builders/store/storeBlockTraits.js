/**
 * storeBlockTraits.js
 *
 * Dynamic trait system for GrapesJS Store blocks.
 * Registers custom component types for each store block with configurable traits.
 *
 * Traits allow merchants to configure blocks from the GrapesJS sidebar without editing HTML:
 * - Product Grid: limit, columns, sort, show price/button/rating, collection
 * - Featured Product: product ID
 * - Collections: limit, sort
 * - Testimonials: limit, autoplay
 * - Search: placeholder
 * - Hero: custom styling flags
 * - Cart/Checkout/Footer: basic extensibility
 *
 * All configuration comes from data-* attributes only (no inline JS variables).
 */

/**
 * Helper: Create a trait definition object
 */
function createTrait(config) {
  return config;
}

/**
 * Hero Traits
 */
const heroTraits = [
  createTrait({
    name: 'data-height',
    label: 'Height',
    type: 'select',
    default: 'medium',
    options: [
      { value: 'small', name: 'Small (60px)' },
      { value: 'medium', name: 'Medium (96px)' },
      { value: 'large', name: 'Large (140px)' },
    ],
  }),
  createTrait({
    name: 'data-alignment',
    label: 'Content Alignment',
    type: 'select',
    default: 'center',
    options: [
      { value: 'left', name: 'Left' },
      { value: 'center', name: 'Center' },
      { value: 'right', name: 'Right' },
    ],
  }),
  createTrait({
    name: 'data-show-button',
    label: 'Show CTA Button',
    type: 'checkbox',
    default: true,
  }),
];

/**
 * Product Grid Traits
 */
const productGridTraits = [
  createTrait({
    name: 'data-limit',
    label: 'Products Limit',
    type: 'number',
    default: 8,
    min: 1,
    max: 50,
    placeholder: '8',
  }),
  createTrait({
    name: 'data-columns',
    label: 'Columns',
    type: 'select',
    default: '4',
    options: [
      { value: '2', name: '2 Columns' },
      { value: '3', name: '3 Columns' },
      { value: '4', name: '4 Columns' },
      { value: '5', name: '5 Columns' },
      { value: '6', name: '6 Columns' },
    ],
  }),
  createTrait({
    name: 'data-sort',
    label: 'Sort By',
    type: 'select',
    default: 'latest',
    options: [
      { value: 'latest', name: 'Latest' },
      { value: 'oldest', name: 'Oldest' },
      { value: 'price-low', name: 'Price: Low to High' },
      { value: 'price-high', name: 'Price: High to Low' },
      { value: 'name-asc', name: 'Name: A to Z' },
      { value: 'name-desc', name: 'Name: Z to A' },
    ],
  }),
  createTrait({
    name: 'data-show-price',
    label: 'Show Price',
    type: 'checkbox',
    default: true,
  }),
  createTrait({
    name: 'data-show-button',
    label: 'Show Add to Cart Button',
    type: 'checkbox',
    default: true,
  }),
  createTrait({
    name: 'data-show-rating',
    label: 'Show Rating',
    type: 'checkbox',
    default: false,
  }),
  createTrait({
    name: 'data-collection',
    label: 'Filter by Collection',
    type: 'text',
    default: '',
    placeholder: 'Collection ID (optional)',
  }),
];

/**
 * Featured Product Traits
 */
const featuredProductTraits = [
  createTrait({
    name: 'data-product-id',
    label: 'Product ID',
    type: 'text',
    default: '',
    placeholder: 'Leave empty for latest product',
  }),
  createTrait({
    name: 'data-show-price',
    label: 'Show Price',
    type: 'checkbox',
    default: true,
  }),
  createTrait({
    name: 'data-show-button',
    label: 'Show Add to Cart Button',
    type: 'checkbox',
    default: true,
  }),
];

/**
 * Collection Traits
 */
const collectionTraits = [
  createTrait({
    name: 'data-limit',
    label: 'Collections to Show',
    type: 'number',
    default: 6,
    min: 1,
    max: 50,
  }),
  createTrait({
    name: 'data-sort',
    label: 'Sort By',
    type: 'select',
    default: 'latest',
    options: [
      { value: 'latest', name: 'Latest' },
      { value: 'oldest', name: 'Oldest' },
      { value: 'name', name: 'Name' },
    ],
  }),
  createTrait({
    name: 'data-columns',
    label: 'Columns',
    type: 'select',
    default: '3',
    options: [
      { value: '2', name: '2 Columns' },
      { value: '3', name: '3 Columns' },
      { value: '4', name: '4 Columns' },
    ],
  }),
];

/**
 * Category Grid Traits
 */
const categoryGridTraits = [
  createTrait({
    name: 'data-limit',
    label: 'Categories to Show',
    type: 'number',
    default: 6,
    min: 1,
    max: 50,
  }),
  createTrait({
    name: 'data-columns',
    label: 'Columns',
    type: 'select',
    default: '3',
    options: [
      { value: '2', name: '2 Columns' },
      { value: '3', name: '3 Columns' },
      { value: '4', name: '4 Columns' },
    ],
  }),
];

/**
 * Testimonials Traits
 */
const testimonialsTraits = [
  createTrait({
    name: 'data-limit',
    label: 'Testimonials to Show',
    type: 'number',
    default: 3,
    min: 1,
    max: 20,
  }),
  createTrait({
    name: 'data-columns',
    label: 'Columns',
    type: 'select',
    default: '3',
    options: [
      { value: '1', name: '1 Column' },
      { value: '2', name: '2 Columns' },
      { value: '3', name: '3 Columns' },
    ],
  }),
  createTrait({
    name: 'data-autoplay',
    label: 'Autoplay',
    type: 'checkbox',
    default: false,
  }),
];

/**
 * Search Traits
 */
const searchTraits = [
  createTrait({
    name: 'data-placeholder',
    label: 'Placeholder Text',
    type: 'text',
    default: 'Search products...',
    placeholder: 'Enter placeholder text',
  }),
  createTrait({
    name: 'data-show-filters',
    label: 'Show Filters',
    type: 'checkbox',
    default: true,
  }),
];

/**
 * Register Store Block Component Types
 *
 * This function registers custom GrapesJS component types for each store block.
 * Component types extend the base block definition with traits and custom behavior.
 *
 * @param {Object} editor - GrapesJS editor instance
 */
export function registerStoreTraits(editor) {
  if (!editor || !editor.DomComponents) {
    console.warn('[storeBlockTraits] DomComponents not available');
    return;
  }

  // ── Hero Component ───────────────────────────────────────────────────
  editor.DomComponents.addType('hero', {
    isComponent: (el) => {
      return el.dataset?.storeBlock === 'hero';
    },
    model: {
      defaults: {
        traits: heroTraits,
        attributes: {
          'data-height': 'medium',
          'data-alignment': 'center',
          'data-show-button': 'true',
        },
      },
    },
  });

  // ── Product Grid Component ───────────────────────────────────────────
  editor.DomComponents.addType('product-grid', {
    isComponent: (el) => {
      return el.dataset?.storeBlock === 'product-grid';
    },
    model: {
      defaults: {
        traits: productGridTraits,
        attributes: {
          'data-limit': '8',
          'data-columns': '4',
          'data-sort': 'latest',
          'data-show-price': 'true',
          'data-show-button': 'true',
          'data-show-rating': 'false',
          'data-collection': '',
        },
      },
    },
  });

  // ── Featured Product Component ───────────────────────────────────────
  editor.DomComponents.addType('featured-product', {
    isComponent: (el) => {
      return el.dataset?.storeBlock === 'featured-product';
    },
    model: {
      defaults: {
        traits: featuredProductTraits,
        attributes: {
          'data-product-id': '',
          'data-show-price': 'true',
          'data-show-button': 'true',
        },
      },
    },
  });

  // ── Collection Component ─────────────────────────────────────────────
  editor.DomComponents.addType('collection', {
    isComponent: (el) => {
      return el.dataset?.storeBlock === 'collection';
    },
    model: {
      defaults: {
        traits: collectionTraits,
        attributes: {
          'data-limit': '6',
          'data-sort': 'latest',
          'data-columns': '3',
        },
      },
    },
  });

  // ── Category Grid Component ──────────────────────────────────────────
  editor.DomComponents.addType('category-grid', {
    isComponent: (el) => {
      return el.dataset?.storeBlock === 'category-grid';
    },
    model: {
      defaults: {
        traits: categoryGridTraits,
        attributes: {
          'data-limit': '6',
          'data-columns': '3',
        },
      },
    },
  });

  // ── Testimonials Component ───────────────────────────────────────────
  editor.DomComponents.addType('testimonials', {
    isComponent: (el) => {
      return el.dataset?.storeBlock === 'testimonials';
    },
    model: {
      defaults: {
        traits: testimonialsTraits,
        attributes: {
          'data-limit': '3',
          'data-columns': '3',
          'data-autoplay': 'false',
        },
      },
    },
  });

  // ── Search Component ─────────────────────────────────────────────────
  editor.DomComponents.addType('search', {
    isComponent: (el) => {
      return el.dataset?.storeBlock === 'search';
    },
    model: {
      defaults: {
        traits: searchTraits,
        attributes: {
          'data-placeholder': 'Search products...',
          'data-show-filters': 'true',
        },
      },
    },
  });

  // ── Cart Component ───────────────────────────────────────────────────
  editor.DomComponents.addType('cart', {
    isComponent: (el) => {
      return el.dataset?.storeBlock === 'cart';
    },
    model: {
      defaults: {
        traits: [],
      },
    },
  });

  // ── Checkout Component ───────────────────────────────────────────────
  editor.DomComponents.addType('checkout', {
    isComponent: (el) => {
      return el.dataset?.storeBlock === 'checkout';
    },
    model: {
      defaults: {
        traits: [],
      },
    },
  });

  // ── Footer Component ─────────────────────────────────────────────────
  editor.DomComponents.addType('footer', {
    isComponent: (el) => {
      return el.dataset?.storeBlock === 'footer';
    },
    model: {
      defaults: {
        traits: [],
      },
    },
  });
}
