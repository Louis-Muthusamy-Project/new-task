/**
 * storeBlockTraits.js
 *
 * Dynamic trait system for GrapesJS Store blocks.
 * Registers custom component types for each store block with configurable traits.
 *
 * Traits allow merchants to configure blocks from the GrapesJS sidebar without editing HTML:
 * - Header: show cart icon, sticky
 * - Menu: alignment, max links
 * - Hero: custom styling flags
 * - Product Grid: limit, columns, sort, show price/button/rating, collection
 * - Latest Products: limit, columns, show price/button
 * - Featured Product: product ID
 * - Featured Products (grid): limit, columns, show price/button
 * - Collection Grid / Category Grid: limit, sort, columns
 * - Testimonials: limit, autoplay
 * - Blog: limit, columns, show excerpt
 * - Search: placeholder
 * - Cart/Checkout/Footer: basic extensibility
 * - Product Grid / Latest Products / Featured Product / Featured Products /
 *   Single Product: also get a "Button Redirect Link" (data-redirect-url)
 *   trait, letting a merchant send shoppers straight to a URL (cart,
 *   checkout, an external link, etc.) right after "Add to cart" fires.
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
  createTrait({
    name: 'data-redirect-url',
    label: 'Button Redirect Link (optional)',
    type: 'text',
    default: '',
    placeholder: '/cart, /checkout, or https://...',
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
  createTrait({
    name: 'data-redirect-url',
    label: 'Button Redirect Link (optional)',
    type: 'text',
    default: '',
    placeholder: '/cart, /checkout, or https://...',
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
 * Header Traits
 */
const headerTraits = [
  createTrait({
    name: 'data-show-cart',
    label: 'Show Cart Icon',
    type: 'checkbox',
    default: true,
  }),
  createTrait({
    name: 'data-sticky',
    label: 'Sticky on Scroll',
    type: 'checkbox',
    default: false,
  }),
];

/**
 * Menu Traits
 */
const menuTraits = [
  createTrait({
    name: 'data-alignment',
    label: 'Alignment',
    type: 'select',
    default: 'center',
    options: [
      { value: 'left', name: 'Left' },
      { value: 'center', name: 'Center' },
      { value: 'right', name: 'Right' },
    ],
  }),
  createTrait({
    name: 'data-limit',
    label: 'Max Links',
    type: 'number',
    default: 8,
    min: 1,
    max: 20,
  }),
];

/**
 * Latest Products Traits
 */
const latestProductsTraits = [
  createTrait({
    name: 'data-limit',
    label: 'Products Limit',
    type: 'number',
    default: 8,
    min: 1,
    max: 50,
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
    name: 'data-redirect-url',
    label: 'Button Redirect Link (optional)',
    type: 'text',
    default: '',
    placeholder: '/cart, /checkout, or https://...',
  }),
];

/**
 * Featured Products (grid) Traits
 */
const featuredProductsTraits = [
  createTrait({
    name: 'data-limit',
    label: 'Products Limit',
    type: 'number',
    default: 8,
    min: 1,
    max: 50,
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
    name: 'data-redirect-url',
    label: 'Button Redirect Link (optional)',
    type: 'text',
    default: '',
    placeholder: '/cart, /checkout, or https://...',
  }),
];

/**
 * Blog Traits
 */
const blogTraits = [
  createTrait({
    name: 'data-limit',
    label: 'Posts to Show',
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
    name: 'data-show-excerpt',
    label: 'Show Excerpt',
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

  // ── Header Component ─────────────────────────────────────────────────
  editor.DomComponents.addType('header', {
    isComponent: (el) => {
      return el.dataset?.storeBlock === 'header';
    },
    model: {
      defaults: {
        traits: headerTraits,
        attributes: {
          'data-show-cart': 'true',
          'data-sticky': 'false',
        },
      },
    },
  });

  // ── Menu Component ───────────────────────────────────────────────────
  editor.DomComponents.addType('menu', {
    isComponent: (el) => {
      return el.dataset?.storeBlock === 'menu';
    },
    model: {
      defaults: {
        traits: menuTraits,
        attributes: {
          'data-alignment': 'center',
          'data-limit': '8',
        },
      },
    },
  });

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
          'data-redirect-url': '',
        },
      },
    },
  });

  // ── Latest Products Component ────────────────────────────────────────
  editor.DomComponents.addType('latest-products', {
    isComponent: (el) => {
      return el.dataset?.storeBlock === 'latest-products';
    },
    model: {
      defaults: {
        traits: latestProductsTraits,
        attributes: {
          'data-limit': '8',
          'data-columns': '4',
          'data-show-price': 'true',
          'data-show-button': 'true',
          'data-redirect-url': '',
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
          'data-redirect-url': '',
        },
      },
    },
  });

  // ── Featured Products (grid) Component ───────────────────────────────
  editor.DomComponents.addType('featured-products', {
    isComponent: (el) => {
      return el.dataset?.storeBlock === 'featured-products';
    },
    model: {
      defaults: {
        traits: featuredProductsTraits,
        attributes: {
          'data-limit': '8',
          'data-columns': '4',
          'data-show-price': 'true',
          'data-show-button': 'true',
          'data-redirect-url': '',
        },
      },
    },
  });

  // ── Single Product Component ─────────────────────────────────────────
  // Built by GrapesPageEditor.jsx's "insert single product" flow
  // (buildStoreProductHtml), not by a BlockManager drag-in like the
  // sections above — but it renders the same kind of "Add to cart" button,
  // so it gets the same optional redirect trait for consistency.
  editor.DomComponents.addType('single-product', {
    isComponent: (el) => {
      return el.dataset?.storeBlock === 'single-product';
    },
    model: {
      defaults: {
        traits: [
          createTrait({
            name: 'data-redirect-url',
            label: 'Button Redirect Link (optional)',
            type: 'text',
            default: '',
            placeholder: '/cart, /checkout, or https://...',
          }),
        ],
        attributes: {
          'data-redirect-url': '',
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

  // ── Blog Component ───────────────────────────────────────────────────
  editor.DomComponents.addType('blog', {
    isComponent: (el) => {
      return el.dataset?.storeBlock === 'blog';
    },
    model: {
      defaults: {
        traits: blogTraits,
        attributes: {
          'data-limit': '3',
          'data-columns': '3',
          'data-show-excerpt': 'true',
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
        traits: [
          createTrait({
            name: 'data-redirect-url',
            label: 'Redirect after order (next step URL)',
            type: 'text',
            default: '',
            placeholder: '/confirmed',
          }),
        ],
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