// storeDynamicBlocks.js
//
// "Dynamic Blocks" — the Shopify-style theme sections available to the
// Store Website Builder: Header, Menu, Hero, Product Grid, Latest
// Products, Featured Product(s), Collection Grid, Testimonials, Blog,
// Search, Cart, Checkout, Footer. Registered into editor.BlockManager
// (category "Store") only when the GrapesPageEditor is being used for a
// StorePage (see BccBuilder's `isStore` flag / GrapesPageEditor's
// `isStore` prop).
//
// This is the mechanism that makes the builder a *theme* builder rather
// than a page builder that happens to embed product HTML: dropping a
// block never writes a product's title/price/image into the page. Each
// block's `content` is a small HTML shell (a `data-store-block="<type>"`
// container holding only placeholder/loading markup and its editable
// `data-*` settings) plus an inline <script> that fetches real data from
// the public storefront API
// (backend/src/controllers/store/storeStorefrontController.js) and
// hydrates itself client-side. That's the only thing ever persisted when
// a page is saved — the shell + script, never a snapshot of product data
// — so what actually renders always reflects whatever is in the database
// *at render time*, both inside the GrapesJS canvas iframe
// (allowScripts: 1 is enabled in GrapesPageEditor's config) and on the
// published storefront.
//
// Component, not markup: every block also has a matching
// `editor.DomComponents.addType(...)` entry in
// `../builders/store/storeBlockTraits.js`, which turns its `data-*`
// settings into a Traits panel a merchant edits from the sidebar (limit,
// columns, sort, which collection, etc.) instead of hand-editing HTML —
// so a "block" here means an actual configurable component, the same way
// a Shopify theme section + its schema settings do. Every block that
// renders a product "Add to cart" button (Product Grid, Latest Products,
// Featured Product, Featured Products) also carries a `data-redirect-url`
// trait — "Button Redirect Link" in the Traits panel — so a merchant can
// send the shopper straight to the cart, checkout, or any other URL right
// after the item is added, instead of leaving them on the section. Left
// empty (the default), the button behaves exactly as before.
//
// Hydration pattern: every block wraps its markup in a container carrying
// `data-store-block="<type>"`. Its script selects ALL not-yet-hydrated
// containers of that type (`:not([data-hydrated])`) and hydrates each one.
// This makes it safe to drop the same block multiple times on one page
// without id collisions, and safe to call the hydrate script more than once
// (e.g. GrapesJS re-running scripts on re-render) since already-hydrated
// containers are skipped.

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Shared runtime helpers injected once per block script: money formatting,
 * a tiny fetch-JSON wrapper, localStorage cart, and result caching.
 * Duplicated (not imported) into every block since each block's `content`
 * is an independent, self-contained HTML/JS string.
 */
const runtimeHelpers = (apiBase, storeId) => `
    var API_BASE = ${JSON.stringify(apiBase)};
    var FIXED_STORE_ID = ${JSON.stringify(storeId)};
    // The store id baked in at block-registration time is only reliable on
    // a real StorePage. On a Funnel step it's actually the funnel's own id
    // (GrapesPageEditor has no per-funnel "store" concept — a Funnel
    // Checkout step can sell a product from ANY store, chosen per-product
    // via the Store tool's "insert single product" flow). That flow always
    // records which real store id "Add to cart" was last used with — see
    // addToCart() below and buildStoreProductHtml() in GrapesPageEditor.jsx.
    //
    // IMPORTANT: this must be resolved fresh every time it's needed, NOT
    // once when this script first runs — a shopper who lands on the page,
    // then clicks "Add to cart" a moment later, updates this AFTER this
    // script has already executed. A single top-level "var STORE_ID = ..."
    // would capture the pre-click (wrong) value forever for the rest of
    // the page's life, which is exactly what made Cart/Checkout blocks get
    // permanently stuck pointed at the wrong store. activeStoreId() below
    // is called at the moment of every cart read/write instead.
    function activeStoreId() {
      try { return localStorage.getItem('jeema_active_store_id') || FIXED_STORE_ID; }
      catch (e) { return FIXED_STORE_ID; }
    }
    // Kept for blocks that show ONE specific store's catalog regardless of
    // cart state (Product Grid, Header, etc.) — those should still use the
    // store id they were actually configured with, not whichever store a
    // shopper's cart happens to belong to.
    var STORE_ID = FIXED_STORE_ID;
    var CACHE_KEY = 'jeema_store_cache_';
    var CACHE_TTL = 60000; // 60 seconds
    function money(amount, currency) {
      var n = Number(amount || 0);
      try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(n); }
      catch (e) { return (currency || 'USD') + ' ' + n.toFixed(2); }
    }
    function cacheKey(url) { return CACHE_KEY + btoa(url); }
    function getCache(url) {
      try {
        var item = localStorage.getItem(cacheKey(url));
        if (!item) return null;
        var data = JSON.parse(item);
        if (Date.now() - data.time > CACHE_TTL) { localStorage.removeItem(cacheKey(url)); return null; }
        return data.value;
      } catch (e) { return null; }
    }
    function setCache(url, value) {
      try { localStorage.setItem(cacheKey(url), JSON.stringify({ time: Date.now(), value: value })); } catch (e) {}
    }
    function fetchJson(url) {
      var cached = getCache(url);
      if (cached) return Promise.resolve(cached);
      return fetch(url).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (j) {
        if (!j || j.success === false) throw new Error((j && j.error) || 'Request failed');
        setCache(url, j.data);
        return j.data;
      });
    }
    function readCart() {
      try { return JSON.parse(localStorage.getItem('jeema_store_cart_' + activeStoreId()) || '[]'); } catch (e) { return []; }
    }
    function writeCart(items) {
      try {
        localStorage.setItem('jeema_store_cart_' + activeStoreId(), JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('store-cart-updated', { detail: { items: items } }));
      } catch (e) {}
    }
    function addToCart(productId, quantity) {
      try { localStorage.setItem('jeema_active_store_id', STORE_ID); } catch (e) {}
      var items = readCart();
      var existing = items.find(function (i) { return i.productId === productId; });
      if (existing) existing.quantity += (quantity || 1);
      else items.push({ productId: productId, quantity: quantity || 1 });
      writeCart(items);
    }
`;

function block({ id, label, category, iconSvg, content }) {
  return {
    id,
    label: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
        ${iconSvg}
        <div style="font-size:11px;line-height:1.2;">${label}</div>
      </div>
    `,
    category: category || 'Store',
    content,
  };
}

const ICONS = {
  hero: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M7 20h10M9 16v4M15 16v4"/></svg>',
  grid: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  featured: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2"/></svg>',
  collection: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
  testimonials: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  search: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
  cart: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
  checkout: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>',
  footer: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15h18"/></svg>',
  header: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>',
  menu: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  latest: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  featuredGrid: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><polygon points="17.5 13.5 19 16.5 22.3 17 20 19.3 20.5 22.6 17.5 21 14.5 22.6 15 19.3 12.7 17 16 16.5"/></svg>',
  blog: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 7h7M9 11h7"/></svg>',
};

// ── 0a. Header ───────────────────────────────────────────────────────────
function headerBlock(apiBase, storeId) {
  const content = `
    <header class="store-block store-header" data-store-block="header" data-show-cart="true" data-sticky="false" style="display:flex;align-items:center;justify-content:space-between;gap:24px;padding:16px 24px;background:#fff;border-bottom:1px solid #e5e7eb;font-family:sans-serif;">
      <a href="#home" class="store-header-name" style="font-weight:800;font-size:18px;color:#111827;text-decoration:none;">Store</a>
      <nav class="store-header-nav" style="display:flex;gap:20px;flex:1;justify-content:center;flex-wrap:wrap;">
        <span style="color:#9ca3af;font-size:13px;">Loading menu…</span>
      </nav>
      <a href="#cart" class="store-header-cart" style="display:flex;align-items:center;gap:6px;color:#111827;text-decoration:none;font-weight:700;font-size:13px;">
        ${ICONS.cart}
        <span class="store-header-cart-count">0</span>
      </a>
    </header>
    <script>
    (function () {
      ${runtimeHelpers(apiBase, storeId)}
      function renderCartCount(el) {
        var countEl = el.querySelector('.store-header-cart-count');
        if (!countEl) return;
        var items = readCart();
        countEl.textContent = items.reduce(function (n, i) { return n + (i.quantity || 1); }, 0);
      }
      function hydrate(el) {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        if (el.dataset.sticky === 'true') { el.style.position = 'sticky'; el.style.top = '0'; el.style.zIndex = '30'; }
        var cartLink = el.querySelector('.store-header-cart');
        if (cartLink && el.dataset.showCart === 'false') cartLink.style.display = 'none';
        renderCartCount(el);
        window.addEventListener('store-cart-updated', function () { renderCartCount(el); });
        fetchJson(API_BASE + '/store/' + STORE_ID + '/info').then(function (store) {
          el.querySelectorAll('.store-header-name').forEach(function (n) { n.textContent = store.name || 'Store'; });
        }).catch(function () {});
        fetchJson(API_BASE + '/store/' + STORE_ID + '/pages').then(function (pages) {
          var nav = el.querySelector('.store-header-nav');
          if (!pages.length) { nav.innerHTML = ''; return; }
          nav.innerHTML = pages.map(function (p) {
            return '<a href="' + (p.isHome ? '#home' : '#' + p.slug) + '" style="color:#374151;text-decoration:none;font-size:14px;font-weight:600;">' + p.name + '</a>';
          }).join('');
        }).catch(function () { el.querySelector('.store-header-nav').innerHTML = ''; });
      }
      document.querySelectorAll('[data-store-block="header"]').forEach(hydrate);
    })();
    <\/script>
  `;
  return block({ id: 'store-header', label: 'Header', iconSvg: ICONS.header, content });
}

// ── 0b. Menu ─────────────────────────────────────────────────────────────
function menuBlock(apiBase, storeId) {
  const content = `
    <nav class="store-block store-menu" data-store-block="menu" data-alignment="center" data-limit="8" style="display:flex;gap:24px;padding:14px 24px;font-family:sans-serif;">
      <span style="color:#9ca3af;font-size:13px;">Loading menu…</span>
    </nav>
    <script>
    (function () {
      ${runtimeHelpers(apiBase, storeId)}
      function hydrate(el) {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        var alignment = el.dataset.alignment || 'center';
        var limit = parseInt(el.dataset.limit) || 8;
        var justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
        el.style.justifyContent = justifyMap[alignment] || 'center';
        fetchJson(API_BASE + '/store/' + STORE_ID + '/pages').then(function (pages) {
          pages = pages.slice(0, limit);
          el.innerHTML = pages.length ? pages.map(function (p) {
            return '<a href="' + (p.isHome ? '#home' : '#' + p.slug) + '" style="color:#111827;text-decoration:none;font-size:14px;font-weight:600;">' + p.name + '</a>';
          }).join('') : '<span style="color:#9ca3af;font-size:13px;">No published pages yet.</span>';
        }).catch(function () { el.innerHTML = '<span style="color:#ef4444;font-size:13px;">Could not load menu.</span>'; });
      }
      document.querySelectorAll('[data-store-block="menu"]').forEach(hydrate);
    })();
    <\/script>
  `;
  return block({ id: 'store-menu', label: 'Menu', iconSvg: ICONS.menu, content });
}

// ── 1. Hero ──────────────────────────────────────────────────────────────
function heroBlock(apiBase, storeId) {
  const content = `
    <section class="store-block store-hero" data-store-block="hero" data-height="medium" data-alignment="center" data-show-button="true" style="padding:96px 32px;text-align:center;background:linear-gradient(135deg,#111827,#1f2937);color:#fff;font-family:sans-serif;">
      <h1 style="margin:0 0 12px;font-size:36px;font-weight:800;">Loading store…</h1>
      <p style="margin:0 auto 24px;max-width:560px;color:#d1d5db;line-height:1.6;">&nbsp;</p>
      <a href="#shop" style="display:inline-block;padding:14px 28px;border-radius:8px;background:#fff;color:#111827;font-weight:700;text-decoration:none;">Shop now</a>
    </section>
    <script>
    (function () {
      ${runtimeHelpers(apiBase, storeId)}
      function hydrate(el) {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        var showButton = el.dataset.showButton !== 'false';
        var alignment = el.dataset.alignment || 'center';
        var height = el.dataset.height || 'medium';
        var paddingMap = { small: '60px 32px', medium: '96px 32px', large: '140px 32px' };
        el.style.padding = paddingMap[height] || paddingMap.medium;
        el.style.textAlign = alignment;
        var link = el.querySelector('a');
        if (link && !showButton) link.style.display = 'none';
        fetchJson(API_BASE + '/store/' + STORE_ID + '/info').then(function (store) {
          var h1 = el.querySelector('h1');
          var p = el.querySelector('p');
          if (h1) h1.textContent = store.name || 'Welcome to our store';
          if (p) p.textContent = store.description || 'Discover our latest products, curated just for you.';
        }).catch(function (err) {
          var h1 = el.querySelector('h1');
          if (h1) h1.textContent = 'Welcome to our store';
        });
      }
      document.querySelectorAll('[data-store-block="hero"]').forEach(hydrate);
    })();
    <\/script>
  `;
  return block({ id: 'store-hero', label: 'Hero', iconSvg: ICONS.hero, content });
}

// ── 2. Product Grid ──────────────────────────────────────────────────────
function productGridBlock(apiBase, storeId) {
  const content = `
    <section class="store-block store-product-grid" data-store-block="product-grid" data-limit="8" data-columns="4" data-sort="latest" data-show-price="true" data-show-button="true" data-show-rating="false" data-collection="" data-redirect-url="" style="padding:48px 24px;font-family:sans-serif;">
      <h2 style="margin:0 0 20px;font-size:24px;font-weight:800;color:#111827;">Shop our products</h2>
      <div class="store-product-grid-items" style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;">
        <div style="color:#6b7280;">Loading products…</div>
      </div>
    </section>
    <script>
    (function () {
      ${runtimeHelpers(apiBase, storeId)}
      function card(p, opts) {
        var img = p.image ? '<img src="' + p.image + '" alt="" style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:8px;background:#f3f4f6;">' :
          '<div style="width:100%;aspect-ratio:1/1;border-radius:8px;background:#f3f4f6;"></div>';
        var price = opts.showPrice ? '<div style="color:#374151;font-weight:600;">' + money(p.price, p.currency) + '</div>' : '';
        var button = opts.showButton ? '<button type="button" data-add-to-cart="' + p.id + '" style="border:none;border-radius:6px;background:#111827;color:#fff;padding:8px 10px;font-weight:700;cursor:pointer;">Add to cart</button>' : '';
        var rating = opts.showRating ? '<div style="color:#6b7280;font-size:12px;">★★★★★ (0)</div>' : '';
        return '<div style="display:flex;flex-direction:column;gap:8px;">' + img +
          '<div style="font-weight:700;color:#111827;font-size:14px;">' + (p.title || '') + '</div>' +
          price + rating + button +
          '</div>';
      }
      function hydrate(el) {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        var wrap = el.querySelector('.store-product-grid-items');
        var limit = parseInt(el.dataset.limit) || 8;
        var columns = parseInt(el.dataset.columns) || 4;
        var sort = el.dataset.sort || 'latest';
        var showPrice = el.dataset.showPrice !== 'false';
        var showButton = el.dataset.showButton !== 'false';
        var showRating = el.dataset.showRating === 'true';
        var collection = el.dataset.collection || '';
        var url = API_BASE + '/store/' + STORE_ID + '/products?limit=' + limit;
        if (collection) url += '&collectionId=' + encodeURIComponent(collection);
        if (sort && sort !== 'latest') url += '&sort=' + encodeURIComponent(sort);
        wrap.style.gridTemplateColumns = 'repeat(' + columns + ',1fr)';
        fetchJson(url).then(function (products) {
          if (!products.length) { wrap.innerHTML = '<div style="color:#6b7280;">No products yet.</div>'; return; }
          wrap.innerHTML = products.map(function (p) { return card(p, { showPrice: showPrice, showButton: showButton, showRating: showRating }); }).join('');
          wrap.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-add-to-cart]');
            if (!btn) return;
            addToCart(btn.getAttribute('data-add-to-cart'), 1);
            btn.textContent = 'Added ✓';
            // Optional "Button Redirect Link" trait (data-redirect-url) —
            // read fresh at click time (see runtimeHelpers() note above on
            // why nothing here should be captured once at hydrate time), so
            // a merchant can point this button at a specific page (e.g. the
            // cart, checkout, or an external URL) instead of leaving the
            // shopper on the grid after "Add to cart".
            var redirectUrl = el.dataset.redirectUrl;
            if (redirectUrl) {
              btn.textContent = 'Redirecting…';
              setTimeout(function () { window.location.href = redirectUrl; }, 800);
            } else {
              setTimeout(function () { btn.textContent = 'Add to cart'; }, 1200);
            }
          });
        }).catch(function () { wrap.innerHTML = '<div style="color:#ef4444;">Could not load products.</div>'; });
      }
      document.querySelectorAll('[data-store-block="product-grid"]').forEach(hydrate);
    })();
    <\/script>
  `;
  return block({ id: 'store-product-grid', label: 'Product Grid', iconSvg: ICONS.grid, content });
}

// ── 2b. Latest Products ──────────────────────────────────────────────────
function latestProductsBlock(apiBase, storeId) {
  const content = `
    <section class="store-block store-latest-products" data-store-block="latest-products" data-limit="8" data-columns="4" data-show-price="true" data-show-button="true" data-redirect-url="" style="padding:48px 24px;font-family:sans-serif;">
      <h2 style="margin:0 0 20px;font-size:24px;font-weight:800;color:#111827;">New arrivals</h2>
      <div class="store-latest-products-items" style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;">
        <div style="color:#6b7280;">Loading products…</div>
      </div>
    </section>
    <script>
    (function () {
      ${runtimeHelpers(apiBase, storeId)}
      function card(p, opts) {
        var img = p.image ? '<img src="' + p.image + '" alt="" style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:8px;background:#f3f4f6;">' :
          '<div style="width:100%;aspect-ratio:1/1;border-radius:8px;background:#f3f4f6;"></div>';
        var price = opts.showPrice ? '<div style="color:#374151;font-weight:600;">' + money(p.price, p.currency) + '</div>' : '';
        var button = opts.showButton ? '<button type="button" data-add-to-cart="' + p.id + '" style="border:none;border-radius:6px;background:#111827;color:#fff;padding:8px 10px;font-weight:700;cursor:pointer;">Add to cart</button>' : '';
        return '<div style="display:flex;flex-direction:column;gap:8px;">' + img +
          '<div style="font-weight:700;color:#111827;font-size:14px;">' + (p.title || '') + '</div>' +
          price + button +
          '</div>';
      }
      function hydrate(el) {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        var wrap = el.querySelector('.store-latest-products-items');
        var limit = parseInt(el.dataset.limit) || 8;
        var columns = parseInt(el.dataset.columns) || 4;
        var showPrice = el.dataset.showPrice !== 'false';
        var showButton = el.dataset.showButton !== 'false';
        wrap.style.gridTemplateColumns = 'repeat(' + columns + ',1fr)';
        fetchJson(API_BASE + '/store/' + STORE_ID + '/products/latest?limit=' + limit).then(function (products) {
          if (!products.length) { wrap.innerHTML = '<div style="color:#6b7280;">No products yet.</div>'; return; }
          wrap.innerHTML = products.map(function (p) { return card(p, { showPrice: showPrice, showButton: showButton }); }).join('');
          wrap.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-add-to-cart]');
            if (!btn) return;
            addToCart(btn.getAttribute('data-add-to-cart'), 1);
            btn.textContent = 'Added ✓';
            // Optional "Button Redirect Link" trait (data-redirect-url) —
            // see the equivalent Product Grid handler above for why this is
            // read fresh at click time instead of once at hydrate time.
            var redirectUrl = el.dataset.redirectUrl;
            if (redirectUrl) {
              btn.textContent = 'Redirecting…';
              setTimeout(function () { window.location.href = redirectUrl; }, 800);
            } else {
              setTimeout(function () { btn.textContent = 'Add to cart'; }, 1200);
            }
          });
        }).catch(function () { wrap.innerHTML = '<div style="color:#ef4444;">Could not load products.</div>'; });
      }
      document.querySelectorAll('[data-store-block="latest-products"]').forEach(hydrate);
    })();
    <\/script>
  `;
  return block({ id: 'store-latest-products', label: 'Latest Products', iconSvg: ICONS.latest, content });
}

// ── 3. Featured Product ──────────────────────────────────────────────────
function featuredProductBlock(apiBase, storeId) {
  const content = `
    <section class="store-block store-featured-product" data-store-block="featured-product" data-product-id="" data-show-price="true" data-show-button="true" data-redirect-url="" style="padding:48px 24px;font-family:sans-serif;">
      <div class="store-featured-product-body" style="display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:center;">
        <div style="color:#6b7280;">Loading featured product…</div>
      </div>
    </section>
    <script>
    (function () {
      ${runtimeHelpers(apiBase, storeId)}
      function hydrate(el) {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        var body = el.querySelector('.store-featured-product-body');
        var productId = el.dataset.productId || '';
        var showPrice = el.dataset.showPrice !== 'false';
        var showButton = el.dataset.showButton !== 'false';
        var url = productId
          ? API_BASE + '/store/' + STORE_ID + '/products/' + encodeURIComponent(productId)
          : API_BASE + '/store/' + STORE_ID + '/products?limit=1';
        fetchJson(url).then(function (data) {
          var p = Array.isArray(data) ? data[0] : data;
          if (!p) { body.innerHTML = '<div style="color:#6b7280;">No product to feature yet.</div>'; return; }
          var img = p.image ? '<img src="' + p.image + '" alt="" style="width:100%;border-radius:12px;object-fit:cover;aspect-ratio:1/1;background:#f3f4f6;">' :
            '<div style="width:100%;border-radius:12px;aspect-ratio:1/1;background:#f3f4f6;"></div>';
          var price = showPrice ? '<div style="font-size:22px;font-weight:800;color:#111827;margin-bottom:16px;">' + money(p.price, p.currency) + '</div>' : '';
          var button = showButton ? '<button type="button" data-add-to-cart="' + p.id + '" style="border:none;border-radius:8px;background:#111827;color:#fff;padding:12px 22px;font-weight:700;cursor:pointer;">Add to cart</button>' : '';
          body.innerHTML = img +
            '<div>' +
            '<h2 style="margin:0 0 10px;font-size:28px;font-weight:800;color:#111827;">' + (p.title || '') + '</h2>' +
            '<p style="margin:0 0 14px;color:#4b5563;line-height:1.6;">' + (p.description || '') + '</p>' +
            price + button +
            '</div>';
          var btn = body.querySelector('[data-add-to-cart]');
          if (btn) {
            btn.addEventListener('click', function (e) {
              e.preventDefault();
              addToCart(btn.getAttribute('data-add-to-cart'), 1);
              btn.textContent = 'Added ✓';
              // Optional "Button Redirect Link" trait (data-redirect-url) —
              // see the equivalent Product Grid handler for why this is
              // read fresh at click time instead of once at hydrate time.
              var redirectUrl = el.dataset.redirectUrl;
              if (redirectUrl) {
                btn.textContent = 'Redirecting…';
                setTimeout(function () { window.location.href = redirectUrl; }, 800);
              } else {
                setTimeout(function () { btn.textContent = 'Add to cart'; }, 1200);
              }
            });
          }
        }).catch(function (err) { body.innerHTML = '<div style="color:#ef4444;">Could not load product.</div>'; });
      }
      document.querySelectorAll('[data-store-block="featured-product"]').forEach(hydrate);
    })();
    <\/script>
  `;
  return block({ id: 'store-featured-product', label: 'Featured Product', iconSvg: ICONS.featured, content });
}

// ── 3b. Featured Products (grid) ─────────────────────────────────────────
function featuredProductsBlock(apiBase, storeId) {
  const content = `
    <section class="store-block store-featured-products" data-store-block="featured-products" data-limit="8" data-columns="4" data-show-price="true" data-show-button="true" data-redirect-url="" style="padding:48px 24px;font-family:sans-serif;">
      <h2 style="margin:0 0 20px;font-size:24px;font-weight:800;color:#111827;">Featured products</h2>
      <div class="store-featured-products-items" style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;">
        <div style="color:#6b7280;">Loading products…</div>
      </div>
    </section>
    <script>
    (function () {
      ${runtimeHelpers(apiBase, storeId)}
      function card(p, opts) {
        var img = p.image ? '<img src="' + p.image + '" alt="" style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:8px;background:#f3f4f6;">' :
          '<div style="width:100%;aspect-ratio:1/1;border-radius:8px;background:#f3f4f6;"></div>';
        var price = opts.showPrice ? '<div style="color:#374151;font-weight:600;">' + money(p.price, p.currency) + '</div>' : '';
        var button = opts.showButton ? '<button type="button" data-add-to-cart="' + p.id + '" style="border:none;border-radius:6px;background:#111827;color:#fff;padding:8px 10px;font-weight:700;cursor:pointer;">Add to cart</button>' : '';
        return '<div style="display:flex;flex-direction:column;gap:8px;">' + img +
          '<div style="font-weight:700;color:#111827;font-size:14px;">' + (p.title || '') + '</div>' +
          price + button +
          '</div>';
      }
      function hydrate(el) {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        var wrap = el.querySelector('.store-featured-products-items');
        var limit = parseInt(el.dataset.limit) || 8;
        var columns = parseInt(el.dataset.columns) || 4;
        var showPrice = el.dataset.showPrice !== 'false';
        var showButton = el.dataset.showButton !== 'false';
        wrap.style.gridTemplateColumns = 'repeat(' + columns + ',1fr)';
        fetchJson(API_BASE + '/store/' + STORE_ID + '/products/featured?limit=' + limit).then(function (products) {
          if (!products.length) { wrap.innerHTML = '<div style="color:#6b7280;">No featured products yet.</div>'; return; }
          wrap.innerHTML = products.map(function (p) { return card(p, { showPrice: showPrice, showButton: showButton }); }).join('');
          wrap.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-add-to-cart]');
            if (!btn) return;
            addToCart(btn.getAttribute('data-add-to-cart'), 1);
            btn.textContent = 'Added ✓';
            // Optional "Button Redirect Link" trait (data-redirect-url) —
            // see the equivalent Product Grid handler above for why this is
            // read fresh at click time instead of once at hydrate time.
            var redirectUrl = el.dataset.redirectUrl;
            if (redirectUrl) {
              btn.textContent = 'Redirecting…';
              setTimeout(function () { window.location.href = redirectUrl; }, 800);
            } else {
              setTimeout(function () { btn.textContent = 'Add to cart'; }, 1200);
            }
          });
        }).catch(function () { wrap.innerHTML = '<div style="color:#ef4444;">Could not load products.</div>'; });
      }
      document.querySelectorAll('[data-store-block="featured-products"]').forEach(hydrate);
    })();
    <\/script>
  `;
  return block({ id: 'store-featured-products', label: 'Featured Products', iconSvg: ICONS.featuredGrid, content });
}

// ── 4. Collection ────────────────────────────────────────────────────────
function collectionBlock(apiBase, storeId) {
  const content = `
    <section class="store-block store-collections" data-store-block="collection" data-limit="6" data-sort="latest" data-columns="3" style="padding:48px 24px;font-family:sans-serif;">
      <h2 style="margin:0 0 20px;font-size:24px;font-weight:800;color:#111827;">Shop by collection</h2>
      <div class="store-collections-items" style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;">
        <div style="color:#6b7280;">Loading collections…</div>
      </div>
    </section>
    <script>
    (function () {
      ${runtimeHelpers(apiBase, storeId)}
      function tile(c) {
        var img = c.imageUrl ? '<img src="' + c.imageUrl + '" alt="" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px;background:#f3f4f6;">' :
          '<div style="width:100%;aspect-ratio:4/3;border-radius:10px;background:#f3f4f6;"></div>';
        return '<a href="#collection-' + c.slug + '" style="text-decoration:none;color:inherit;display:block;">' + img +
          '<div style="margin-top:8px;font-weight:700;color:#111827;">' + (c.title || '') + '</div>' +
          '<div style="font-size:12px;color:#6b7280;">' + (c.productCount || 0) + ' products</div>' +
          '</a>';
      }
      function hydrate(el) {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        var wrap = el.querySelector('.store-collections-items');
        var limit = parseInt(el.dataset.limit) || 6;
        var sort = el.dataset.sort || 'latest';
        var columns = parseInt(el.dataset.columns) || 3;
        var url = API_BASE + '/store/' + STORE_ID + '/collections?limit=' + limit;
        if (sort && sort !== 'latest') url += '&sort=' + encodeURIComponent(sort);
        wrap.style.gridTemplateColumns = 'repeat(' + columns + ',1fr)';
        fetchJson(url).then(function (collections) {
          wrap.innerHTML = collections.length ? collections.map(tile).join('') : '<div style="color:#6b7280;">No collections yet.</div>';
        }).catch(function (err) { wrap.innerHTML = '<div style="color:#ef4444;">Could not load collections.</div>'; });
      }
      document.querySelectorAll('[data-store-block="collection"]').forEach(hydrate);
    })();
    <\/script>
  `;
  return block({ id: 'store-collection', label: 'Collection Grid', iconSvg: ICONS.collection, content });
}

// ── 5. Category Grid ────────────────────────────────────────────────────
function categoryGridBlock(apiBase, storeId) {
  const content = `
    <section class="store-block store-category-grid" data-store-block="category-grid" data-limit="6" data-columns="3" style="padding:48px 24px;font-family:sans-serif;">
      <h2 style="margin:0 0 20px;font-size:24px;font-weight:800;color:#111827;">Shop by category</h2>
      <div class="store-category-grid-items" style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;">
        <div style="color:#6b7280;">Loading categories…</div>
      </div>
    </section>
    <script>
    (function () {
      ${runtimeHelpers(apiBase, storeId)}
      function tile(c) {
        var img = c.imageUrl ? '<img src="' + c.imageUrl + '" alt="" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px;background:#f3f4f6;">' :
          '<div style="width:100%;aspect-ratio:4/3;border-radius:10px;background:#f3f4f6;"></div>';
        return '<a href="#collection-' + c.slug + '" style="text-decoration:none;color:inherit;display:block;">' + img +
          '<div style="margin-top:8px;font-weight:700;color:#111827;">' + (c.title || '') + '</div>' +
          '<div style="font-size:12px;color:#6b7280;">' + (c.productCount || 0) + ' products</div>' +
          '</a>';
      }
      function hydrate(el) {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        var wrap = el.querySelector('.store-category-grid-items');
        var limit = parseInt(el.dataset.limit) || 6;
        var columns = parseInt(el.dataset.columns) || 3;
        wrap.style.gridTemplateColumns = 'repeat(' + columns + ',1fr)';
        fetchJson(API_BASE + '/store/' + STORE_ID + '/collections?limit=' + limit).then(function (collections) {
          wrap.innerHTML = collections.length ? collections.map(tile).join('') : '<div style="color:#6b7280;">No categories yet.</div>';
        }).catch(function (err) { wrap.innerHTML = '<div style="color:#ef4444;">Could not load categories.</div>'; });
      }
      document.querySelectorAll('[data-store-block="category-grid"]').forEach(hydrate);
    })();
    <\/script>
  `;
  return block({ id: 'store-category-grid', label: 'Category Grid', iconSvg: ICONS.collection, content });
}

// ── 6. Testimonials ──────────────────────────────────────────────────────
function testimonialsBlock(apiBase, storeId) {
  const content = `
    <section class="store-block store-testimonials" data-store-block="testimonials" data-limit="6" data-columns="3" data-autoplay="false" style="padding:48px 24px;background:#f9fafb;font-family:sans-serif;">
      <h2 style="margin:0 0 20px;font-size:24px;font-weight:800;color:#111827;text-align:center;">What our customers say</h2>
      <div class="store-testimonials-items" style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;">
        <div style="color:#6b7280;">Loading testimonials…</div>
      </div>
    </section>
    <script>
    (function () {
      ${runtimeHelpers(apiBase, storeId)}
      function stars(n) {
        n = Math.max(1, Math.min(5, n || 5));
        return '★★★★★☆☆☆☆☆'.slice(5 - n, 10 - n);
      }
      function card(t) {
        var avatar = t.avatarUrl ? '<img src="' + t.avatarUrl + '" alt="" style="width:40px;height:40px;border-radius:999px;object-fit:cover;">' :
          '<div style="width:40px;height:40px;border-radius:999px;background:#e5e7eb;"></div>';
        return '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:18px;">' +
          '<div style="color:#f59e0b;letter-spacing:2px;margin-bottom:10px;">' + stars(t.rating) + '</div>' +
          '<p style="margin:0 0 14px;color:#374151;line-height:1.6;">\u201c' + (t.quote || '') + '\u201d</p>' +
          '<div style="display:flex;align-items:center;gap:10px;">' + avatar +
          '<div><div style="font-weight:700;color:#111827;font-size:13px;">' + (t.customerName || '') + '</div>' +
          '<div style="font-size:12px;color:#6b7280;">' + (t.customerTitle || '') + '</div></div></div></div>';
      }
      function hydrate(el) {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        var wrap = el.querySelector('.store-testimonials-items');
        var limit = parseInt(el.dataset.limit) || 6;
        var columns = parseInt(el.dataset.columns) || 3;
        var autoplay = el.dataset.autoplay === 'true';
        wrap.style.gridTemplateColumns = 'repeat(' + columns + ',1fr)';
        fetchJson(API_BASE + '/store/' + STORE_ID + '/testimonials?limit=' + limit).then(function (items) {
          if (!items.length) {
            wrap.innerHTML = '<div style="color:#6b7280;">No testimonials yet.</div>';
            return;
          }
          wrap.innerHTML = items.map(card).join('');
          if (autoplay && items.length > 1) {
            var current = 0;
            setInterval(function () {
              current = (current + 1) % items.length;
              var cards = wrap.querySelectorAll('[style*="background:#fff"]');
              cards.forEach(function (c, i) { c.style.opacity = i === current ? '1' : '0.4'; });
            }, 4000);
          }
        }).catch(function (err) { wrap.innerHTML = '<div style="color:#ef4444;">Could not load testimonials.</div>'; });
      }
      document.querySelectorAll('[data-store-block="testimonials"]').forEach(hydrate);
    })();
    <\/script>
  `;
  return block({ id: 'store-testimonials', label: 'Testimonials', iconSvg: ICONS.testimonials, content });
}

// ── 6b. Blog ──────────────────────────────────────────────────────────────
function blogBlock(apiBase, storeId) {
  const content = `
    <section class="store-block store-blog" data-store-block="blog" data-limit="3" data-columns="3" data-show-excerpt="true" style="padding:48px 24px;font-family:sans-serif;">
      <h2 style="margin:0 0 20px;font-size:24px;font-weight:800;color:#111827;">From the blog</h2>
      <div class="store-blog-items" style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
        <div style="color:#6b7280;">Loading posts…</div>
      </div>
    </section>
    <script>
    (function () {
      ${runtimeHelpers(apiBase, storeId)}
      function formatDate(d) {
        if (!d) return '';
        try { return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
        catch (e) { return ''; }
      }
      function card(post, showExcerpt) {
        var excerpt = showExcerpt && post.excerpt ? '<p style="margin:8px 0 0;color:#4b5563;font-size:13px;line-height:1.6;">' + post.excerpt + '</p>' : '';
        var date = formatDate(post.publishedAt);
        return '<a href="' + (post.url || '#') + '" style="text-decoration:none;color:inherit;display:block;border:1px solid #e5e7eb;border-radius:10px;padding:18px;">' +
          (post.category ? '<div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;">' + post.category + '</div>' : '') +
          '<div style="font-weight:800;color:#111827;font-size:16px;line-height:1.4;">' + (post.title || '') + '</div>' +
          excerpt +
          (date ? '<div style="margin-top:10px;font-size:12px;color:#9ca3af;">' + date + '</div>' : '') +
          '</a>';
      }
      function hydrate(el) {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        var wrap = el.querySelector('.store-blog-items');
        var limit = parseInt(el.dataset.limit) || 3;
        var columns = parseInt(el.dataset.columns) || 3;
        var showExcerpt = el.dataset.showExcerpt !== 'false';
        wrap.style.gridTemplateColumns = 'repeat(' + columns + ',1fr)';
        fetchJson(API_BASE + '/store/' + STORE_ID + '/blog/posts?limit=' + limit).then(function (posts) {
          wrap.innerHTML = posts.length ? posts.map(function (p) { return card(p, showExcerpt); }).join('') : '<div style="color:#6b7280;">No blog posts yet.</div>';
        }).catch(function () { wrap.innerHTML = '<div style="color:#ef4444;">Could not load blog posts.</div>'; });
      }
      document.querySelectorAll('[data-store-block="blog"]').forEach(hydrate);
    })();
    <\/script>
  `;
  return block({ id: 'store-blog', label: 'Blog', iconSvg: ICONS.blog, content });
}

// ── 7. Search ─────────────────────────────────────────────────────────────
function searchBlock(apiBase, storeId) {
  const content = `
    <section class="store-block store-search" data-store-block="search" data-placeholder="Search products…" data-show-filters="false" style="padding:24px;font-family:sans-serif;position:relative;">
      <div style="position:relative;max-width:420px;">
        <input type="text" class="store-search-input" placeholder="Search products…" style="width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;" />
        <div class="store-search-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 6px);background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.08);max-height:360px;overflow:auto;z-index:20;"></div>
      </div>
    </section>
    <script>
    (function () {
      ${runtimeHelpers(apiBase, storeId)}
      function hydrate(el) {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        var input = el.querySelector('.store-search-input');
        var results = el.querySelector('.store-search-results');
        var placeholder = el.dataset.placeholder || 'Search products…';
        var showFilters = el.dataset.showFilters === 'true';
        input.placeholder = placeholder;
        var timer = null;
        input.addEventListener('input', function () {
          var q = input.value.trim();
          clearTimeout(timer);
          if (!q) { results.style.display = 'none'; results.innerHTML = ''; return; }
          timer = setTimeout(function () {
            fetchJson(API_BASE + '/store/' + STORE_ID + '/products?q=' + encodeURIComponent(q) + '&limit=6').then(function (data) {
              var products = (data.products || data || []).slice(0, 6);
              if (!products.length) {
                results.innerHTML = '<div style="padding:14px;color:#6b7280;font-size:13px;">No matches for \u201c' + q + '\u201d</div>';
              } else {
                results.innerHTML = products.map(function (p) {
                  return '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid #f3f4f6;">' +
                    '<div style="width:32px;height:32px;border-radius:6px;background:#f3f4f6;background-image:url(' + (p.image || '') + ');background-size:cover;"></div>' +
                    '<div style="font-size:13px;color:#111827;font-weight:600;flex:1;">' + (p.title || '') + '</div>' +
                    '<div style="font-size:13px;color:#374151;">' + money(p.price, p.currency) + '</div>' +
                    '</div>';
                }).join('');
              }
              results.style.display = 'block';
            }).catch(function (err) { results.style.display = 'none'; });
          }, 250);
        });
        document.addEventListener('click', function (e) {
          if (!el.contains(e.target)) results.style.display = 'none';
        });
      }
      document.querySelectorAll('[data-store-block="search"]').forEach(hydrate);
    })();
    <\/script>
  `;
  return block({ id: 'store-search', label: 'Search', iconSvg: ICONS.search, content });
}

// ── 7. Cart ───────────────────────────────────────────────────────────────
function cartBlock(apiBase, storeId) {
  const content = `
    <section class="store-block store-cart" data-store-block="cart" style="padding:48px 24px;font-family:sans-serif;max-width:720px;margin:0 auto;">
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:800;color:#111827;">Your cart</h1>
      <div class="store-cart-items" style="display:flex;flex-direction:column;gap:14px;margin-bottom:20px;">
        <div style="color:#6b7280;">Loading cart…</div>
      </div>
      <div class="store-cart-summary" style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e5e7eb;padding-top:16px;">
        <div style="font-weight:800;color:#111827;">Total: <span class="store-cart-total">—</span></div>
        <a href="#checkout" style="display:inline-block;padding:12px 22px;border-radius:8px;background:#111827;color:#fff;text-decoration:none;font-weight:700;">Checkout</a>
      </div>
    </section>
    <script>
    (function () {
      ${runtimeHelpers(apiBase, storeId)}
      function render(el) {
        var wrap = el.querySelector('.store-cart-items');
        var totalEl = el.querySelector('.store-cart-total');
        var items = readCart();
        if (!items.length) {
          wrap.innerHTML = '<div style="color:#6b7280;">Your cart is empty.</div>';
          totalEl.textContent = money(0, 'USD');
          return;
        }
        Promise.all(items.map(function (i) {
          return fetchJson(API_BASE + '/store/' + activeStoreId() + '/products/' + i.productId)
            .then(function (p) { return { product: p, quantity: i.quantity }; })
            .catch(function () { return null; });
        })).then(function (rows) {
          rows = rows.filter(Boolean);
          var total = 0;
          wrap.innerHTML = rows.map(function (row) {
            var p = row.product;
            var lineTotal = (p.price || 0) * row.quantity;
            total += lineTotal;
            var img = p.image ? '<img src="' + p.image + '" style="width:56px;height:56px;object-fit:cover;border-radius:8px;background:#f3f4f6;">' :
              '<div style="width:56px;height:56px;border-radius:8px;background:#f3f4f6;"></div>';
            return '<div style="display:flex;align-items:center;gap:12px;">' + img +
              '<div style="flex:1;"><div style="font-weight:700;color:#111827;">' + p.title + '</div>' +
              '<div style="font-size:12px;color:#6b7280;">Qty ' + row.quantity + ' × ' + money(p.price, p.currency) + '</div></div>' +
              '<div style="font-weight:700;color:#111827;">' + money(lineTotal, p.currency) + '</div>' +
              '<button type="button" data-remove="' + p.id + '" style="border:none;background:none;color:#ef4444;cursor:pointer;font-size:12px;">Remove</button>' +
              '</div>';
          }).join('');
          totalEl.textContent = money(total, (rows[0] && rows[0].product.currency) || 'USD');
          wrap.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-remove]');
            if (!btn) return;
            var pid = btn.getAttribute('data-remove');
            writeCart(readCart().filter(function (i) { return i.productId !== pid; }));
            render(el);
          });
        }).catch(function () { wrap.innerHTML = '<div style="color:#ef4444;">Could not load cart.</div>'; });
      }
      function hydrate(el) {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        render(el);
        window.addEventListener('store-cart-updated', function () { render(el); });
      }
      document.querySelectorAll('[data-store-block="cart"]').forEach(hydrate);
    })();
    <\/script>
  `;
  return block({ id: 'store-cart', label: 'Cart', iconSvg: ICONS.cart, content });
}

// ── 8. Checkout ──────────────────────────────────────────────────────────
function checkoutBlock(apiBase, storeId) {
  const content = `
    <section id="checkout" class="store-block store-checkout" data-store-block="checkout" data-redirect-url="" style="padding:48px 24px;font-family:sans-serif;max-width:520px;margin:0 auto;">
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:800;color:#111827;">Checkout</h1>
      <div class="store-checkout-summary" style="margin-bottom:20px;color:#6b7280;">Loading order summary…</div>
      <form class="store-checkout-form" style="display:flex;flex-direction:column;gap:12px;">
        <input required name="name" placeholder="Full name" style="padding:12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;" />
        <input required type="email" name="email" placeholder="Email address" style="padding:12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;" />
        <button type="submit" style="border:none;border-radius:8px;background:#111827;color:#fff;padding:14px;font-weight:800;cursor:pointer;">Place order</button>
      </form>
      <div class="store-checkout-message" style="margin-top:14px;font-size:13px;font-weight:700;"></div>
    </section>
    <script>
    (function () {
      ${runtimeHelpers(apiBase, storeId)}
      function hydrate(el) {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        var summary = el.querySelector('.store-checkout-summary');
        var form = el.querySelector('.store-checkout-form');
        var msg = el.querySelector('.store-checkout-message');

        function loadSummary() {
          // Read fresh every time this runs — NOT captured once at hydrate
          // — so an "Add to cart" click that happens after this script
          // already ran (the normal case: shopper adds an item, then
          // scrolls down to this same Checkout section) is picked up
          // instead of this section staying stuck on a cart snapshot from
          // before that click ever happened.
          var cartItems = readCart();
          if (!cartItems.length) {
            summary.textContent = 'Your cart is empty.';
            return;
          }
          Promise.all(cartItems.map(function (i) {
            return fetchJson(API_BASE + '/store/' + activeStoreId() + '/products/' + i.productId)
              .then(function (p) { return { product: p, quantity: i.quantity }; })
              .catch(function () { return null; });
          })).then(function (rows) {
            rows = rows.filter(Boolean);
            var total = rows.reduce(function (sum, r) { return sum + (r.product.price || 0) * r.quantity; }, 0);
            var currency = (rows[0] && rows[0].product.currency) || 'USD';
            summary.innerHTML = rows.map(function (r) {
              return '<div style="display:flex;justify-content:space-between;padding:6px 0;color:#374151;font-size:13px;">' +
                '<span>' + r.product.title + ' × ' + r.quantity + '</span><span>' + money(r.product.price * r.quantity, currency) + '</span></div>';
            }).join('') + '<div style="display:flex;justify-content:space-between;border-top:1px solid #e5e7eb;padding-top:10px;margin-top:6px;font-weight:800;color:#111827;"><span>Total</span><span>' + money(total, currency) + '</span></div>';
          }).catch(function () { summary.textContent = 'Could not load order summary.'; });
        }
        loadSummary();
        // Keep the summary in sync with the cart in real time — same event
        // the Cart block already listens for.
        window.addEventListener('store-cart-updated', loadSummary);

        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var cartItems = readCart();
          if (!cartItems.length) { msg.style.color = '#ef4444'; msg.textContent = 'Your cart is empty.'; return; }
          var submitBtn = form.querySelector('button[type="submit"]');
          submitBtn.disabled = true;
          submitBtn.textContent = 'Placing order…';
          fetch(API_BASE + '/store/' + activeStoreId() + '/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cartItems, customer: { name: form.name.value, email: form.email.value } })
          }).then(function (r) { return r.json(); }).then(function (json) {
            if (!json || json.success === false) throw new Error((json && json.error) || 'Order failed');
            writeCart([]);
            msg.style.color = '#16a34a';
            msg.textContent = 'Order ' + json.data.orderNumber + ' placed! Total ' + money(json.data.total, json.data.currency) + '.';
            form.style.display = 'none';
            // Advance to whatever page comes next (e.g. a Funnel's
            // Confirmation/Thank You step) — configured per-block via the
            // "Redirect after order" trait (data-redirect-url) in the
            // Settings panel. Left empty, the shopper just sees the
            // confirmation message on this same page, same as before.
            var redirectUrl = el.dataset.redirectUrl;
            if (redirectUrl) {
              msg.textContent += ' Redirecting…';
              setTimeout(function () { window.location.href = redirectUrl; }, 1200);
            }
          }).catch(function (err) {
            msg.style.color = '#ef4444';
            msg.textContent = err.message || 'Could not place order.';
          }).finally(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place order';
          });
        });
      }
      document.querySelectorAll('[data-store-block="checkout"]').forEach(hydrate);
    })();
    <\/script>
  `;
  return block({ id: 'store-checkout', label: 'Checkout', iconSvg: ICONS.checkout, content });
}

// ── 9. Footer ─────────────────────────────────────────────────────────────
function footerBlock(apiBase, storeId) {
  const content = `
    <footer class="store-block store-footer" data-store-block="footer" style="padding:40px 24px;background:#111827;color:#d1d5db;font-family:sans-serif;">
      <div style="max-width:1080px;margin:0 auto;display:flex;flex-wrap:wrap;justify-content:space-between;gap:24px;">
        <div>
          <div class="store-footer-name" style="font-weight:800;color:#fff;font-size:18px;margin-bottom:6px;">Store</div>
          <div class="store-footer-desc" style="font-size:13px;max-width:280px;line-height:1.6;">&nbsp;</div>
        </div>
        <div style="display:flex;gap:48px;flex-wrap:wrap;">
          <div>
            <div style="font-weight:700;color:#fff;margin-bottom:8px;font-size:13px;">Shop</div>
            <div style="display:flex;flex-direction:column;gap:6px;font-size:13px;">
              <a href="#shop" style="color:#d1d5db;text-decoration:none;">All products</a>
              <a href="#cart" style="color:#d1d5db;text-decoration:none;">Cart</a>
            </div>
          </div>
          <div>
            <div style="font-weight:700;color:#fff;margin-bottom:8px;font-size:13px;">Support</div>
            <div style="display:flex;flex-direction:column;gap:6px;font-size:13px;">
              <a href="#contact" style="color:#d1d5db;text-decoration:none;">Contact us</a>
            </div>
          </div>
        </div>
      </div>
      <div style="max-width:1080px;margin:24px auto 0;padding-top:16px;border-top:1px solid #374151;font-size:12px;color:#9ca3af;">
        © <span class="store-footer-year"></span> <span class="store-footer-name-inline">this store</span>. All rights reserved.
      </div>
    </footer>
    <script>
    (function () {
      ${runtimeHelpers(apiBase, storeId)}
      function hydrate(el) {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        el.querySelector('.store-footer-year').textContent = new Date().getFullYear();
        fetchJson(API_BASE + '/store/' + STORE_ID + '/info').then(function (store) {
          var name = store.name || 'this store';
          el.querySelectorAll('.store-footer-name').forEach(function (n) { n.textContent = name; });
          el.querySelectorAll('.store-footer-name-inline').forEach(function (n) { n.textContent = name; });
          var desc = el.querySelector('.store-footer-desc');
          if (desc) desc.textContent = store.description || '';
        }).catch(function () {});
      }
      document.querySelectorAll('[data-store-block="footer"]').forEach(hydrate);
    })();
    <\/script>
  `;
  return block({ id: 'store-footer', label: 'Footer', iconSvg: ICONS.footer, content });
}

/**
 * Registers every Store theme block into the given GrapesJS editor's
 * BlockManager under the "Store" category. Safe to call more than once
 * (BlockManager.add upserts by id).
 */
export function registerStoreBlocks(editor, { apiBase, storeId }) {
  if (!editor?.BlockManager || !storeId) return;

  const builders = [
    headerBlock,
    menuBlock,
    heroBlock,
    productGridBlock,
    latestProductsBlock,
    featuredProductBlock,
    featuredProductsBlock,
    collectionBlock,
    categoryGridBlock,
    testimonialsBlock,
    blogBlock,
    searchBlock,
    cartBlock,
    checkoutBlock,
    footerBlock,
  ];

  builders.forEach((build) => {
    const b = build(apiBase, storeId);
    editor.BlockManager.add(b.id, b);
  });
}

export { esc };