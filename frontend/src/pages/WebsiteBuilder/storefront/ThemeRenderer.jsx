import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { storefrontApi } from '../../../api/storefrontApi';
import { useStorefront } from './StorefrontContext';
import { useCart } from './CartContext';
import { useProducts, useCollections } from './hooks/useProducts';
import ProductGrid from './components/ProductGrid';
import CollectionsGrid from './components/CollectionsGrid';

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

function ImportedProductGrid({ container }) {
  const limit = Number(container?.dataset?.limit) || 12;
  const collectionId = container?.dataset?.collectionId || undefined;
  const sort = container?.dataset?.sort || undefined;
  const { products, loading, error } = useProducts({ limit, collectionId, sort });
  return <ProductGrid products={products} loading={loading} error={error} />;
}

function ImportedCollectionsGrid({ container }) {
  const limit = Number(container?.dataset?.limit) || 8;
  // CollectionsGrid fetches via useCollections itself; passing limit
  // through as a prop keeps this a thin adapter rather than a fork.
  return <CollectionsGrid limit={limit} />;
}

/** Mounts (or re-mounts) the right live component into one `data-store-block` container. */
function mountDataDrivenBlock(el, type) {
  if (el.dataset.themeHydrated === '1') return;
  el.dataset.themeHydrated = '1';

  // Replace the static placeholder content with a mount point — the
  // container element itself (and every class/style the theme's CSS
  // targets) is preserved; only its children are swapped.
  el.innerHTML = '';
  const root = createRoot(el);
  DATA_ROOTS.set(el, root);

  if (type === 'product-grid') {
    root.render(<ImportedProductGrid container={el} />);
  } else if (type === 'category-grid') {
    root.render(<ImportedCollectionsGrid container={el} />);
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
    default:
      break;
  }
}

const DATA_DRIVEN_TYPES = new Set(['product-grid', 'category-grid']);
const STATIC_HYDRATE_TYPES = new Set([
  'header',
  'footer',
  'navigation',
  'search',
  'cart-button',
  'checkout-button',
]);

function ThemePage({ page }) {
  const containerRef = useRef(null);
  const storefront = useStorefront();
  const cart = useCart();

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return undefined;

    const blocks = root.querySelectorAll('[data-store-block]');
    blocks.forEach((el) => {
      const type = el.getAttribute('data-store-block');
      if (DATA_DRIVEN_TYPES.has(type)) {
        mountDataDrivenBlock(el, type);
      } else if (STATIC_HYDRATE_TYPES.has(type)) {
        hydrateStaticBlock(el, type, { storefront, cart });
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
