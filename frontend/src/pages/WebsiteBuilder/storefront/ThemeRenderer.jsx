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

/** Reads every configuration knob a block container can carry (`data-*`). */
function blockConfig(container) {
  const d = container?.dataset || {};
  return {
    limit: Number(d.limit) || undefined,
    collectionId: d.collectionId || undefined,
    sort: d.sort || undefined,
    group: d.group || 'default',
    productId: d.productId || undefined,
  };
}

// ── Data-driven block components (§ "Product Grid" / "Featured Products" /
//    "Category Grid" / "Latest Products" / "Best Sellers" /
//    "Related Products" / "Product Detail" / "Cart" / "Checkout" /
//    "Wishlist"). Each is a thin adapter: real data in, the *existing*
//    generic presentation component out — never a bespoke visual fork. ──

function ImportedProductGrid({ container, paginationStore }) {
  const { limit = 12, collectionId, sort, group } = blockConfig(container);
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
  const { limit = 4, collectionId: configuredCollectionId } = blockConfig(container);
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
function mountDataDrivenBlock(el, type, paginationStore) {
  if (el.dataset.themeHydrated === '1') return;
  el.dataset.themeHydrated = '1';

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

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return undefined;

    const blocks = root.querySelectorAll('[data-store-block]');
    blocks.forEach((el) => {
      const type = el.getAttribute('data-store-block');
      if (DATA_DRIVEN_TYPES.has(type)) {
        mountDataDrivenBlock(el, type, paginationStoreRef.current);
      } else if (STATIC_HYDRATE_TYPES.has(type)) {
        hydrateStaticBlock(el, type, { storefront, cart, wishlist, paginationStore: paginationStoreRef.current });
      }
      // widget-area (and anything else) is intentionally left untouched.
    });

    return () => {
      // Unmount every React root this page mounted before the raw HTML
      // is replaced/removed, so React never operates on detached nodes.
      blocks.forEach((el) => {
        const mounted = DATA_ROOTS.get(el);
        if (mounted) {
          mounted.unmount();
          DATA_ROOTS.delete(el);
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