import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { storefrontApi } from '../../../api/storefrontApi';
import { useStorefront } from './StorefrontContext';
import { useCart } from './CartContext';
import {
  useProducts,
  useCollections,
  useFeaturedProducts,
  useLatestProducts,
  useBestSellers,
} from './hooks/useProducts';
import { useWishlist, useWishlistProducts } from './hooks/useWishlist';
import ProductGrid from './components/ProductGrid';
import CollectionsGrid from './components/CollectionsGrid';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import { readConfigFromElement, CURRENT_COLLECTION_TOKEN } from '../builders/store/blockConfigSchema';
import { renderProductCards } from './productCardRenderer';

// ThemeRenderer.jsx
//
// Renders a Store's *actual themed page markup* — hand-built in GrapesJS,
// or produced by the WordPress Import pipeline (services/wordpressImport/*)
// — instead of the generic hardcoded StorefrontApp layout. This is the
// single render path for a themed page across every call site (Preview
// panel, "open in new tab", and — once wired into the live storefront
// route — the published site), matching the "same backend data, same
// render, no separate copy" pattern the rest of the storefront already
// follows.
//
// How it works:
//   1. Fetch the page's stored `content.html`/`content.css` from the
//      PUBLIC storefront API (GET /store/:storeId/pages/:slug) — the
//      exact same document the WordPress Import pipeline produced, or a
//      merchant's GrapesJS page, unmodified.
//   2. Inject the CSS and set the HTML via a plain container ref — the
//      theme's layout, fonts, colors, and images render pixel-for-pixel
//      as authored, because nothing about the markup itself changes.
//   3. Walk the DOM for `data-store-block="<type>"` regions — the same
//      attribute contract storeComponentDetector.js tags during import
//      (and storeBlockTraits.js's GrapesJS blocks already use) — and:
//        - `product-grid` / `category-grid`: MOUNT a real React
//          component (ImportedProductGrid / CollectionsGrid) via
//          `createRoot`, replacing the static placeholder content with a
//          live listing from the Store Engine's public API. This is the
//          literal "Static Product Grid -> <ProductGrid />" /
//          "Static Categories -> <CollectionGrid />" conversion.
//        - `header` / `footer` / `navigation` / `search` / `cart-button`
//          / `checkout-button`: HYDRATE in place — wire up click/submit
//          behavior and swap in live text (store name, nav links, cart
//          count) using the theme's own markup and CSS, rather than
//          replacing it with a different-looking component. This keeps
//          the imported theme's exact visual design intact while making
//          it functionally real.
//        - `widget-area` (and anything unrecognized): left completely
//          untouched — a WordPress widget is arbitrary static content,
//          not a data-driven section.
//
// Requires an ancestor <StorefrontProvider storeId=...> and <CartProvider>
// (see StorefrontApp.jsx) — it reads live store/cart state through the
// same hooks every other storefront section uses, never a separate copy.

const DATA_ROOTS = new WeakMap(); // element -> createRoot() instance, for cleanup

// ── Pagination store ─────────────────────────────────────────────────────
// A tiny plain-JS pub/sub store (NOT React context) shared by every
// data-driven grid block and every `pagination` block on one themed page.
// It has to be plain JS rather than context because each `data-store-block`
// mounts its own independent `createRoot()` tree (see mountDataDrivenBlock
// below) — those trees don't inherit an ancestor's React context, but they
// can all read/write the same object. Blocks opt in via a shared
// `data-group` attribute (default group: "default"), so a themed page can
// have more than one independently-paginated grid.
function createPaginationStore() {
  const state = new Map();
  const listeners = new Map();
  const notify = (group) => (listeners.get(group) || new Set()).forEach((fn) => fn());
  return {
    getPage: (group) => state.get(group)?.page || 1,
    getTotalPages: (group) => state.get(group)?.totalPages || 1,
    setPage: (group, page) => {
      const cur = state.get(group) || { page: 1, totalPages: 1 };
      if (cur.page === page) return;
      state.set(group, { ...cur, page });
      notify(group);
    },
    setTotalPages: (group, totalPages) => {
      const cur = state.get(group) || { page: 1, totalPages: 1 };
      if (cur.totalPages === totalPages) return;
      state.set(group, { ...cur, totalPages });
      notify(group);
    },
    subscribe: (group, fn) => {
      if (!listeners.has(group)) listeners.set(group, new Set());
      listeners.get(group).add(fn);
      return () => listeners.get(group)?.delete(fn);
    },
  };
}

/**
 * Reads every configuration knob a block container can carry — §3/§6 of
 * the redesign. `readConfigFromElement` checks the canonical
 * `data-block-config` JSON attribute first (what a fresh detection pass
 * or any GrapesJS trait edit from this point forward writes); if that
 * attribute is entirely absent, it falls back to the legacy individual
 * `data-*` attributes (including `data-collection` as a recognized alias
 * for collection binding) so an already-imported page's merchant-set
 * value is never silently dropped (§6 dual-read, single-write).
 *
 * `collectionId` here is left as whatever the config says
 * (`CURRENT_COLLECTION_TOKEN`, a literal id, or undefined) — resolving
 * the "current" token into a real id from navigation context happens in
 * each consuming component below via `resolveCollectionBinding()`, since
 * only the component knows whether it's even meaningful to look at
 * `view.collectionId` (e.g. Related Products resolves it differently).
 */
function blockConfig(container) {
  const config = readConfigFromElement(container);
  return {
    limit: Number(config.limit) || undefined,
    collectionId: config.collectionBinding || config.collectionId || undefined,
    sort: config.sort || undefined,
    group: (config.pagination && config.pagination.group) || config.group || 'default',
    productId: config.productId || undefined,
  };
}

/**
 * §4 Category Binding, mode 1 (contextual, zero-configuration): resolves
 * a config's `collectionBinding` into a real collection id for THIS page
 * visit. When the config carries the symbolic `"current"` token (the
 * default seeded at import time), the current navigation context's
 * `view.collectionId` — the same value that already correctly drives the
 * generic `CategoryPage.jsx` — supplies the real id. A literal id
 * (mode 2, merchant-set via the collection-picker trait) is returned
 * as-is, unresolved.
 */
function resolveCollectionBinding(collectionBinding, viewCollectionId) {
  if (collectionBinding === CURRENT_COLLECTION_TOKEN || !collectionBinding) {
    return viewCollectionId || undefined;
  }
  return collectionBinding;
}

// ── Data-driven block components (§ "Product Grid" / "Featured Products" /
//    "Category Grid" / "Latest Products" / "Best Sellers" /
//    "Related Products" / "Product Detail" / "Cart" / "Checkout" /
//    "Wishlist"). Each is a thin adapter: real data in, the *existing*
//    generic presentation component out — never a bespoke visual fork. ──

function ImportedProductGrid({ container, paginationStore }) {
  const { view } = useStorefront();
  const { limit = 12, collectionId: configuredBinding, sort, group } = blockConfig(container);
  // §4 Category Binding — a product-grid dropped onto a Category page
  // (the common "one stored 'catalog' page reused for every category"
  // case the audit found) resolves its binding from THIS page visit's
  // navigation context by default, rather than a literal id baked in at
  // import time. A merchant-set explicit binding (mode 2) passes through
  // unresolved, since it's already a real collection id.
  const collectionId = resolveCollectionBinding(configuredBinding, view.collectionId);
  const [page, setPage] = useState(paginationStore.getPage(group));
  useEffect(() => paginationStore.subscribe(group, () => setPage(paginationStore.getPage(group))), [group]); // eslint-disable-line react-hooks/exhaustive-deps
  const { products, meta, loading, error } = useProducts({ limit, collectionId, sort, page });
  useEffect(() => {
    if (meta?.totalPages) paginationStore.setTotalPages(group, meta.totalPages);
  }, [meta?.totalPages, group]); // eslint-disable-line react-hooks/exhaustive-deps
  return <ProductGrid products={products} loading={loading} error={error} />;
}

function ImportedFeaturedProducts({ container }) {
  const { limit = 8 } = blockConfig(container);
  const { products, loading, error } = useFeaturedProducts(limit);
  return <ProductGrid products={products} loading={loading} error={error} emptyLabel="No featured products yet." />;
}

function ImportedLatestProducts({ container }) {
  const { limit = 8 } = blockConfig(container);
  const { products, loading, error } = useLatestProducts(limit);
  return <ProductGrid products={products} loading={loading} error={error} emptyLabel="No products yet." />;
}

function ImportedBestSellers({ container }) {
  const { limit = 8 } = blockConfig(container);
  const { products, loading, error } = useBestSellers(limit);
  return <ProductGrid products={products} loading={loading} error={error} emptyLabel="No sales yet." />;
}

function ImportedRelatedProducts({ container }) {
  const { view } = useStorefront();
  const { limit = 4, collectionId: configuredBinding } = blockConfig(container);
  const configuredCollectionId = resolveCollectionBinding(configuredBinding, view.collectionId);
  const slug = container?.dataset?.productSlug || view.slug;
  // "Related" = other Active products in the same collection as the
  // current product; falls back to Latest Products for a store/product
  // with no collection to relate against, so the block is never empty
  // by construction.
  const { products: sameCollection, loading, error } = useProducts({ limit: limit + 1, collectionId: configuredCollectionId });
  const { products: latest } = useLatestProducts(limit + 1);
  const source = configuredCollectionId || sameCollection.length ? sameCollection : latest;
  const products = source.filter((p) => p.slug !== slug).slice(0, limit);
  return <ProductGrid products={products} loading={loading} error={error} emptyLabel="No related products yet." />;
}

function ImportedProductDetail({ container }) {
  const { view } = useStorefront();
  const slug = container?.dataset?.productSlug || view.slug;
  if (!slug) return <div style={{ padding: 24, color: '#94a3b8', fontWeight: 600 }}>No product selected.</div>;
  return <ProductPage slug={slug} />;
}

function ImportedCart() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const { currency, goToCheckout } = useStorefront();
  const items = cart?.items || [];
  const fmt = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n || 0);

  if (loading) return <div style={{ padding: 24, color: '#64748b', fontWeight: 600 }}>Loading cart…</div>;
  if (!items.length) return <div style={{ padding: 24, color: '#94a3b8', fontWeight: 600 }}>Your cart is empty.</div>;

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item) => (
        <div key={item.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</div>
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => updateItem(item.productId, Number(e.target.value) || 1)}
            style={{ width: 56, padding: 4 }}
          />
          <div style={{ fontWeight: 700 }}>{fmt(item.price * item.quantity)}</div>
          <button onClick={() => removeItem(item.productId)} style={{ color: '#ef4444', fontWeight: 700 }}>
            Remove
          </button>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, paddingTop: 8 }}>
        <span>Total</span>
        <span>{fmt(cart?.total)}</span>
      </div>
      <button
        onClick={goToCheckout}
        style={{ padding: '10px 16px', borderRadius: 8, background: '#0f172a', color: '#fff', fontWeight: 700 }}
      >
        Checkout
      </button>
    </div>
  );
}

function ImportedCheckout() {
  return <CheckoutPage />;
}

function ImportedWishlist() {
  const { products, loading, error } = useWishlistProducts();
  return <ProductGrid products={products} loading={loading} error={error} emptyLabel="Nothing saved yet." />;
}

/** Mounts (or re-mounts) the right live component into one `data-store-block` container. */
function mountDataDrivenBlock(el, type, paginationStore, page) {
  if (el.dataset.themeHydrated === '1') return;
  el.dataset.themeHydrated = '1';

  // ── Theme-Aware Path ────────────────────────────────────────────────────
  // When the page carries a productCardTemplate (extracted at import time
  // from the uploaded ZIP by productCardExtractor.js), we clone the theme's
  // own card markup per-product instead of wiping the container and mounting
  // a generic React component. This preserves the theme's exact layout, CSS
  // classes, hover effects, spacing, and animations byte-for-byte.
  //
  // Applies to all product-listing grid types; NOT to cart/checkout/wishlist
  // (those have no card template concept) or to category-grid (different
  // card shape — no price/CTA — handled by the generic path unchanged).
  const cardTemplate = page?.content?.productCardTemplate;
  const THEME_AWARE_TYPES = new Set([
    'product-grid', 'featured-products', 'latest-products',
    'best-sellers', 'related-products',
  ]);

  if (cardTemplate && THEME_AWARE_TYPES.has(type)) {
    mountThemeAwareBlock(el, type, cardTemplate, page, paginationStore);
    return;
  }

  // ── Generic Fallback Path (unchanged from original) ──────────────────────
  // Activated when:
  //   - productCardTemplate is null (non-ecommerce page, detection missed cards)
  //   - type is cart / checkout / wishlist / product-detail / category-grid
  // These types have no theme-card concept and always use the generic components.

  // Replace the static placeholder content with a mount point — the
  // container element itself (and every class/style the theme's CSS
  // targets) is preserved; only its children are swapped.
  el.innerHTML = '';
  const root = createRoot(el);
  DATA_ROOTS.set(el, root);

  switch (type) {
    case 'product-grid':
      root.render(<ImportedProductGrid container={el} paginationStore={paginationStore} />);
      break;
    case 'category-grid':
      root.render(<CollectionsGrid limit={blockConfig(el).limit || 8} />);
      break;
    case 'featured-products':
      root.render(<ImportedFeaturedProducts container={el} />);
      break;
    case 'latest-products':
      root.render(<ImportedLatestProducts container={el} />);
      break;
    case 'best-sellers':
      root.render(<ImportedBestSellers container={el} />);
      break;
    case 'related-products':
      root.render(<ImportedRelatedProducts container={el} />);
      break;
    case 'product-detail':
      root.render(<ImportedProductDetail container={el} />);
      break;
    case 'cart':
      root.render(<ImportedCart />);
      break;
    case 'checkout':
      root.render(<ImportedCheckout />);
      break;
    case 'wishlist':
      root.render(<ImportedWishlist />);
      break;
    default:
      break;
  }
}

// ── Theme-Aware Grid Block Mounter ─────────────────────────────────────────
// Replaces the static product cards in a theme-uploaded grid container with
// real product data from the Store Engine, while keeping the theme's card
// layout and CSS entirely intact. Called INSTEAD of the generic createRoot
// path when page.content.productCardTemplate is available.
//
// Lifecycle:
//   1. Reads block config (limit, sort, collectionBinding) from the container.
//   2. Fetches live products from the Store Engine public API.
//   3. Clones the card template per-product via renderProductCards().
//   4. Replaces the container's children with the cloned cards.
//   5. Wires per-card click handlers (navigate to product page).
//   6. On SSE-driven reload: steps 2–5 repeat; step 3 re-clones fresh cards.
//
// Important: this function intentionally does NOT use createRoot() — the
// container element is manipulated imperatively after the page's raw HTML
// has already been rendered via dangerouslySetInnerHTML.
async function mountThemeAwareBlock(el, type, cardTemplateHtml, page, paginationStore) {
  // Guard: don't double-mount if already hydrated.
  if (el.dataset.themeAwareHydrated === '1') return;
  el.dataset.themeAwareHydrated = '1';

  const config = blockConfig(el);
  const limit   = config.limit || 8;
  const sort    = config.sort  || 'latest';
  const storeId = page?.storeId; // may be undefined in some contexts; API handles it via StorefrontContext

  // Determine which API endpoint to call for this block type.
  // The storefrontApi is the same public API every other storefront section
  // uses — no new endpoint, just a direct call outside the React hook cycle.
  const fetchProducts = async () => {
    try {
      switch (type) {
        case 'featured-products':
          return await storefrontApi.listFeaturedProducts(storeId, limit);
        case 'latest-products':
          return await storefrontApi.listLatestProducts(storeId, limit);
        case 'best-sellers':
          return await storefrontApi.listBestSellers(storeId, limit);
        default: {
          // product-grid, related-products: use the general listProducts endpoint
          const collectionId = config.collectionId;
          const result = await storefrontApi.listProducts(storeId, { limit, sort, collectionId });
          // listProducts returns { items, meta }; featured/latest/best-sellers return arrays
          return result?.items || result || [];
        }
      }
    } catch (err) {
      console.warn('[ThemeRenderer] theme-aware fetch failed:', err?.message || err);
      return [];
    }
  };

  // injectCards: fetches products and replaces the container's children
  // with cloned, data-injected cards. Called on first mount and on every
  // SSE-driven reload (product.created / product.updated / product.deleted).
  const injectCards = async () => {
    const rawProducts = await fetchProducts();
    const products = Array.isArray(rawProducts) ? rawProducts : [];

    if (!products.length) {
      // No products yet — leave the static template cards visible so the
      // page doesn't go blank. (Same "never empty by construction" pattern
      // the generic useLatestProducts hook uses.)
      return;
    }

    // Build the currency from the container's nearest storeInfo context.
    // Accessing StorefrontContext here would require a React hook (not
    // available outside a component). We use a data attribute that
    // StorefrontContext writes to the document root as a light bridge,
    // falling back to USD if not set.
    const currency =
      document.documentElement.dataset.storeCurrency ||
      products[0]?.currency ||
      'USD';

    const fragment = renderProductCards(products, cardTemplateHtml, { currency });
    if (!fragment.childNodes.length) return; // renderProductCards returned empty on error

    // Replace the container's children (the static template cards)
    // with the populated clones. The container element itself — with all
    // its CSS classes, grid layout, and data attributes — is never touched.
    el.innerHTML = '';
    el.appendChild(fragment);

    // Wire per-card click handlers: the rendered cards are plain HTML, so
    // navigation and add-to-cart must be wired imperatively.
    el.querySelectorAll('[data-product-slug]').forEach((card) => {
      const slug = card.getAttribute('data-product-slug');
      if (!slug) return;
      card.addEventListener('click', (e) => {
        // Don't hijack clicks on the add-to-cart button — it has its own handler below.
        if (e.target.closest('[data-store-field="add-to-cart"]')) return;
        // Navigate: ThemeRenderer lives inside StorefrontApp/StorefrontContext
        // which manages SPA routing. We dispatch a custom event the context
        // listens to rather than coupling directly.
        window.dispatchEvent(new CustomEvent('storefront:navigate', { detail: { type: 'product', slug } }));
      });

      // Add-to-cart button: dispatch a cart-add event the CartContext listens to.
      const ctaEl = card.querySelector('[data-store-field="add-to-cart"]');
      const productId = card.getAttribute('data-product-id');
      if (ctaEl && productId) {
        ctaEl.addEventListener('click', (e) => {
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent('storefront:addToCart', { detail: { productId, quantity: 1 } }));
        });
      }
    });
  };

  // Initial render.
  await injectCards();

  // SSE-driven re-render: when a product is created/updated/deleted, the
  // ThemePage's storefront context fires a storeEvent. We listen for it
  // on the el itself (dispatched below) and re-inject cards so the live
  // storefront always reflects the current product catalogue — same
  // "add a product, see it immediately" guarantee the generic hooks provide.
  const PRODUCT_EVENTS = ['product.created', 'product.updated', 'product.deleted', 'inventory.updated'];
  const onStoreEvent = (e) => {
    if (PRODUCT_EVENTS.includes(e?.detail?.type)) {
      // Debounce slightly so rapid consecutive events (e.g. bulk import)
      // don't fire N simultaneous fetches.
      clearTimeout(el.__themeAwareReloadTimer);
      el.__themeAwareReloadTimer = setTimeout(injectCards, 250);
    }
  };
  // ThemePage dispatches 'storefront:storeEvent' on the container when an
  // SSE event arrives — see ThemePage's useEffect below.
  el.addEventListener('storefront:storeEvent', onStoreEvent);
  el.__themeAwareCleanup = () => {
    el.removeEventListener('storefront:storeEvent', onStoreEvent);
    clearTimeout(el.__themeAwareReloadTimer);
  };
}

/** Light, in-place hydration for header/footer/nav/search/cart/checkout — never replaces markup. */
function hydrateStaticBlock(el, type, ctx) {
  if (el.dataset.themeHydrated === '1') return;
  el.dataset.themeHydrated = '1';

  const { storeId, storeInfo, goToSearch, goToCheckout } = ctx.storefront;
  const { itemCount, openDrawer } = ctx.cart;

  switch (type) {
    case 'header':
    case 'footer': {
      // Swap in the real store name wherever the theme's own header/
      // footer already renders a title/brand string, without touching
      // anything else about the theme's markup.
      const name = storeInfo?.name;
      if (name) {
        el.querySelectorAll('h1, .site-title, .logo, [class*="brand"]').forEach((n) => {
          if (n.children.length === 0 && n.textContent.trim()) n.textContent = name;
        });
      }
      const year = el.querySelector('[class*="year"], .copyright-year');
      if (year) year.textContent = String(new Date().getFullYear());
      break;
    }
    case 'navigation': {
      // Live nav links from real Published StorePage documents, appended
      // after whatever links the theme already renders — never removes
      // the theme's own menu items.
      storefrontApi
        .listPages(storeId)
        .then((pages) => {
          (pages || [])
            .filter((p) => !p.isHome)
            .forEach((p) => {
              if (el.querySelector(`a[data-store-page="${p.slug}"]`)) return;
              const a = document.createElement('a');
              a.href = `#/${p.slug}`;
              a.textContent = p.name;
              a.dataset.storePage = p.slug;
              a.addEventListener('click', (e) => e.preventDefault());
              el.appendChild(a);
            });
        })
        .catch(() => {});
      break;
    }
    case 'search': {
      const form = el.tagName === 'FORM' ? el : el.querySelector('form');
      const input = el.querySelector('input[type=search], input[name=s], input[type=text]');
      if (form && input) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (input.value.trim()) goToSearch(input.value.trim());
        });
      }
      break;
    }
    case 'cart-button': {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openDrawer();
      });
      const badge = el.querySelector('[class*="count"], .cart-count');
      if (badge) badge.textContent = String(itemCount || 0);
      break;
    }
    case 'checkout-button': {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        goToCheckout();
      });
      break;
    }
    case 'wishlist-button': {
      // A single-product toggle — productId comes from an explicit
      // `data-product-id` (a template author can hand-set this), falling
      // back to whatever product the storefront is currently viewing.
      const { toggle, has } = ctx.wishlist;
      const productId = el.dataset.productId || ctx.storefront.viewedProduct?.id;
      const paint = () => el.classList.toggle('is-active', productId ? has(productId) : false);
      paint();
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (!productId) return;
        Promise.resolve(toggle(productId)).finally(paint);
      });
      break;
    }
    case 'pagination': {
      // Wires whatever prev/next/page-number controls the theme already
      // renders to the shared pagination store (see createPaginationStore
      // above) — never adds or removes markup, only reads each control's
      // own text/aria-label to decide what it means.
      const group = el.dataset.group || 'default';
      const store = ctx.paginationStore;
      const controls = Array.from(el.querySelectorAll('a, button'));
      const paint = () => {
        const page = store.getPage(group);
        const totalPages = store.getTotalPages(group);
        controls.forEach((c) => {
          const label = (c.textContent || c.getAttribute('aria-label') || '').trim().toLowerCase();
          const num = Number(label);
          if (!Number.isNaN(num) && num > 0) c.classList.toggle('active', num === page);
          if (/^(prev|previous|«|←)/.test(label)) c.classList.toggle('disabled', page <= 1);
          if (/^(next|»|→)/.test(label)) c.classList.toggle('disabled', page >= totalPages);
        });
      };
      controls.forEach((c) => {
        c.addEventListener('click', (e) => {
          e.preventDefault();
          const label = (c.textContent || c.getAttribute('aria-label') || '').trim().toLowerCase();
          const num = Number(label);
          const page = store.getPage(group);
          const totalPages = store.getTotalPages(group);
          if (!Number.isNaN(num) && num > 0) store.setPage(group, num);
          else if (/^(prev|previous|«|←)/.test(label)) store.setPage(group, Math.max(1, page - 1));
          else if (/^(next|»|→)/.test(label)) store.setPage(group, Math.min(totalPages, page + 1));
        });
      });
      store.subscribe(group, paint);
      paint();
      break;
    }
    default:
      break;
  }
}

const DATA_DRIVEN_TYPES = new Set([
  'product-grid',
  'category-grid',
  'featured-products',
  'latest-products',
  'best-sellers',
  'related-products',
  'product-detail',
  'cart',
  'checkout',
  'wishlist',
]);
const STATIC_HYDRATE_TYPES = new Set([
  'header',
  'footer',
  'navigation',
  'search',
  'cart-button',
  'checkout-button',
  'wishlist-button',
  'pagination',
]);

function ThemePage({ page }) {
  const containerRef = useRef(null);
  const storefront = useStorefront();
  const cart = useCart();
  const wishlist = useWishlist();
  const paginationStoreRef = useRef(null);
  if (!paginationStoreRef.current) paginationStoreRef.current = createPaginationStore();

  // Wires custom events fired from within Theme-Aware rendered template HTML
  // (which doesn't run inside React) back into React's application routing & cart contexts.
  useEffect(() => {
    const handleNavigate = (e) => {
      if (e.detail?.slug) {
        storefront.goToProduct(e.detail.slug);
      }
    };
    const handleAddToCart = (e) => {
      if (e.detail?.productId) {
        cart.addItem(e.detail.productId, e.detail.quantity || 1);
      }
    };

    window.addEventListener('storefront:navigate', handleNavigate);
    window.addEventListener('storefront:addToCart', handleAddToCart);
    return () => {
      window.removeEventListener('storefront:navigate', handleNavigate);
      window.removeEventListener('storefront:addToCart', handleAddToCart);
    };
  }, [storefront, cart]);

  // Bridges the context's SSE real-time sync stream (product.created, etc.)
  // down into the theme-aware DOM elements. When an event arrives, ThemePage
  // dispatches it as a storefront:storeEvent to all matching grid blocks,
  // which triggers them to reload their product lists from the API.
  useEffect(() => {
    if (!storefront?.subscribeToStoreEvents) return undefined;
    const unsubscribe = storefront.subscribeToStoreEvents((event) => {
      const root = containerRef.current;
      if (!root) return;
      const blocks = root.querySelectorAll('[data-store-block]');
      blocks.forEach((el) => {
        el.dispatchEvent(new CustomEvent('storefront:storeEvent', { detail: event }));
      });
    });
    return unsubscribe;
  }, [storefront]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return undefined;

    const blocks = root.querySelectorAll('[data-store-block]');
    blocks.forEach((el) => {
      const type = el.getAttribute('data-store-block');
      if (DATA_DRIVEN_TYPES.has(type)) {
        mountDataDrivenBlock(el, type, paginationStoreRef.current, page);
      } else if (STATIC_HYDRATE_TYPES.has(type)) {
        hydrateStaticBlock(el, type, { storefront, cart, wishlist, paginationStore: paginationStoreRef.current });
      }
      // widget-area (and anything else) is intentionally left untouched.
    });

    return () => {
      // Unmount every React root this page mounted before the raw HTML
      // is replaced/removed, so React never operates on detached nodes.
      // Also invoke cleanups on any theme-aware blocks.
      blocks.forEach((el) => {
        const mounted = DATA_ROOTS.get(el);
        if (mounted) {
          mounted.unmount();
          DATA_ROOTS.delete(el);
        }
        if (el.__themeAwareCleanup) {
          el.__themeAwareCleanup();
          delete el.__themeAwareCleanup;
        }
      });
    };
    // Re-run whenever the underlying page content changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page?.content?.html]);

  return (
    <>
      {page?.content?.css ? <style>{page.content.css}</style> : null}
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: page?.content?.html || '' }} />
    </>
  );
}

/**
 * ThemeRenderer — fetches Published page `slug` (default: home) for
 * `storeId` and renders it via ThemePage. Use this instead of the generic
 * Home/Category/Product screens whenever a store actually has themed
 * page markup (GrapesJS-authored, or WordPress-imported) to show.
 */
export default function ThemeRenderer({ storeId, slug = 'home' }) {
  const [state, setState] = useState({ page: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    storefrontApi
      .getPage(storeId, slug)
      .then((page) => {
        if (!cancelled) setState({ page, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ page: null, loading: false, error: err?.message || 'Failed to load page.' });
      });
    return () => {
      cancelled = true;
    };
  }, [storeId, slug]);

  if (state.loading) return null;
  if (state.error || !state.page) return null; // caller falls back to the generic layout

  return <ThemePage page={state.page} />;
}

/** True once a page actually has themed markup worth rendering via ThemeRenderer. */
export function hasThemedContent(page) {
  return !!page?.content?.html && page.content.html.trim().length > 0;
}

// Re-exported so other surfaces that already HAVE a page object in hand
// (e.g. the Website Builder's Preview Integration — see
// frontend/.../storefront/WebsitePagePreview.jsx) can mount the exact same
// Detect→Hydrate engine directly, without an extra network round-trip
// through storefrontApi.getPage(). Requires the same ancestor providers
// ThemeRenderer itself needs: <StorefrontProvider storeId=...><CartProvider>.
export { ThemePage };