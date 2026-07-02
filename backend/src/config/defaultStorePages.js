'use strict';

/**
 * defaultStorePages.js — the default page set every new Store gets.
 *
 * Used by controllers/storeController.js during "Create Default Pages"
 * (both the from-template flow, when a template doesn't define its own
 * pages, and the from-scratch flow). Each entry maps 1:1 onto a StorePage
 * document:
 *
 *   slug     -> StorePage.slug            (unique per store)
 *   seo      -> StorePage.seo             (title / description / ogImageUrl)
 *   content  -> StorePage.content         { projectData, html, css }
 *
 * `projectData` is left `null` here — it's populated once the page is
 * opened in the GrapesJS builder (editor.getProjectData()); `html`/`css`
 * are plain fallback markup so the storefront has something to render
 * before the page has ever been opened in the editor.
 */

const page = ({ name, slug, isHome = false, title, description, html, css = '' }) => ({
  name,
  slug,
  isHome,
  seo: {
    title: title || name,
    description: description || '',
    ogImageUrl: '',
  },
  content: {
    projectData: null,
    html,
    css,
  },
});

const DEFAULT_STORE_PAGES = [
  page({
    name: 'Home',
    slug: 'home',
    isHome: true,
    title: 'Home',
    description: 'Welcome to the store.',
    html: `<section class="hero"><h1>Welcome to your store</h1><p>Start customizing this page in the editor.</p></section>`,
    css: `.hero { padding: 80px 24px; text-align: center; }`,
  }),
  page({
    name: 'Catalog',
    slug: 'catalog',
    title: 'Shop All',
    description: 'Browse the full product catalog.',
    html: `<section class="catalog"><h1>Shop all products</h1><div class="catalog-grid" data-store-block="product-grid"></div></section>`,
    css: `.catalog { padding: 48px 24px; } .catalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }`,
  }),
  page({
    name: 'Product',
    slug: 'product',
    title: 'Product',
    description: 'Product detail page.',
    html: `<section class="product-detail" data-store-block="product-detail"><h1 data-bind="product.title">Product name</h1><div data-bind="product.price">$0.00</div></section>`,
    css: `.product-detail { padding: 48px 24px; }`,
  }),
  page({
    name: 'Cart',
    slug: 'cart',
    title: 'Your Cart',
    description: 'Review items before checkout.',
    html: `<section class="cart" data-store-block="cart"><h1>Your cart</h1><div class="cart-items"></div></section>`,
    css: `.cart { padding: 48px 24px; }`,
  }),
  page({
    name: 'Checkout',
    slug: 'checkout',
    title: 'Checkout',
    description: 'Complete your purchase.',
    html: `<section class="checkout" data-store-block="checkout"><h1>Checkout</h1></section>`,
    css: `.checkout { padding: 48px 24px; }`,
  }),
  page({
    name: 'Contact',
    slug: 'contact',
    title: 'Contact Us',
    description: 'Get in touch with us.',
    html: `<section class="contact"><h1>Contact us</h1><form data-store-block="contact-form"></form></section>`,
    css: `.contact { padding: 48px 24px; }`,
  }),
  page({
    name: 'Blog',
    slug: 'blog',
    title: 'Blog',
    description: 'News and updates.',
    html: `<section class="blog" data-store-block="blog-list"><h1>Blog</h1></section>`,
    css: `.blog { padding: 48px 24px; }`,
  }),
  page({
    name: '404',
    slug: '404',
    title: 'Page Not Found',
    description: 'The page you were looking for could not be found.',
    html: `<section class="not-found"><h1>404</h1><p>Page not found.</p></section>`,
    css: `.not-found { padding: 80px 24px; text-align: center; }`,
  }),
];

module.exports = { DEFAULT_STORE_PAGES };
