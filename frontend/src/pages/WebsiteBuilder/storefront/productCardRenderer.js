/**
 * productCardRenderer.js
 *
 * Theme-Aware Product Card Renderer — the frontend counterpart of
 * backend/src/utils/productCardExtractor.js.
 *
 * Takes the product card template HTML that was extracted at import time
 * (stored as StorePage.content.productCardTemplate and passed down through
 * the API) and clones it once per product, injecting real product data
 * into each clone's tagged sub-elements.
 *
 * Design goals:
 *   - Pure JS, zero React: this runs inside a useEffect after the page's
 *     raw HTML has been set via dangerouslySetInnerHTML. At that point we
 *     are already in the imperative DOM-manipulation world, so a pure-JS
 *     approach is a better fit than trying to bolt a React tree on top.
 *   - Preserve the theme 100%: every class, inline style, attribute, and
 *     wrapper element from the uploaded theme card stays exactly as-is.
 *     Only the VALUES of the tagged elements (src, textContent, href) are
 *     changed — nothing else.
 *   - Works for any ecommerce theme: detection is driven entirely by the
 *     data-store-field attributes Stage 2 of the import pipeline already
 *     wrote — no hardcoded class names or selectors.
 *
 * Field injection contract (mirrors productSectionConverter.js Stage 2):
 *
 *   data-store-field="image"
 *     The first <img> inside this element gets:
 *       src   = product.images[0]  (Cloudinary-optimized card URL)
 *       alt   = product.title
 *     If the product has no image, the <img> gets style="display:none"
 *     so the theme's placeholder layout doesn't break.
 *
 *   data-store-field="title"
 *     textContent = product.title
 *     If it's an <a>, href is also set to the product page URL.
 *
 *   data-store-field="price"
 *     textContent = formatted price string (e.g. "$29.99")
 *     If product.compareAtPrice > product.price, a strikethrough sibling
 *     for the compare price is injected after it (only when the element
 *     has no pre-existing compare-price child).
 *
 *   data-store-field="add-to-cart"
 *     If it's an <a>: href = /products/:slug
 *     If it's a <button>: data-product-id and data-product-slug are set
 *     so the click handler wired after render can call addItem().
 *
 * Every card root element also receives:
 *   data-product-slug  = product.slug   (for click-to-navigate wiring)
 *   data-product-id    = product.id     (for add-to-cart wiring)
 *
 * Anything NOT tagged with data-store-field is left byte-for-byte as the
 * theme author designed it — this is the "only inject data" contract the
 * architecture plan requires.
 */

// ── Price formatting ──────────────────────────────────────────────────────
/**
 * Formats a numeric price as a locale-aware currency string.
 * Falls back to `$${price.toFixed(2)}` if Intl.NumberFormat is unavailable.
 */
function formatPrice(amount, currency = 'USD') {
  if (amount == null || Number.isNaN(Number(amount))) return '';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
    }).format(Number(amount));
  } catch {
    return `$${Number(amount).toFixed(2)}`;
  }
}

// ── Field injectors ───────────────────────────────────────────────────────

/** Injects the product image into a data-store-field="image" element. */
function injectImage(fieldEl, product) {
  const imgSrc = (product.images && product.images[0]) || product.image || '';
  const img = fieldEl.tagName === 'IMG' ? fieldEl : fieldEl.querySelector('img');
  if (!img) return;
  if (imgSrc) {
    img.src = imgSrc;
    img.alt = product.title || '';
    img.removeAttribute('style'); // undo any display:none from a previous render
  } else {
    img.style.display = 'none';
  }
}

/** Injects the product title into a data-store-field="title" element. */
function injectTitle(fieldEl, product, storeBasePath) {
  const tag = (fieldEl.tagName || '').toLowerCase();
  const title = product.title || '';
  if (tag === 'a') {
    fieldEl.textContent = title;
    fieldEl.href = `${storeBasePath}/products/${product.slug || ''}`;
  } else {
    // Prefer the inner <a> if one exists (some themes wrap the heading in a link)
    const innerA = fieldEl.querySelector('a');
    if (innerA) {
      innerA.textContent = title;
      innerA.href = `${storeBasePath}/products/${product.slug || ''}`;
    } else {
      fieldEl.textContent = title;
    }
  }
}

/** Injects the formatted price into a data-store-field="price" element. */
function injectPrice(fieldEl, product, currency) {
  const priceStr = formatPrice(product.price, product.currency || currency);
  fieldEl.textContent = priceStr;

  // If the product has a compare-at price, add a strikethrough element —
  // but only when the card doesn't already have one (avoid double-injection
  // on re-renders triggered by SSE events).
  if (
    product.compareAtPrice &&
    product.compareAtPrice > product.price &&
    !fieldEl.parentElement?.querySelector('[data-dynamic-compare-price]')
  ) {
    const compareEl = document.createElement('span');
    compareEl.setAttribute('data-dynamic-compare-price', '1');
    compareEl.textContent = formatPrice(product.compareAtPrice, product.currency || currency);
    compareEl.style.cssText = 'text-decoration:line-through;opacity:0.55;margin-left:6px;font-size:0.85em;';
    fieldEl.after(compareEl);
  }
}

/** Wires the add-to-cart element for the theme-aware path. */
function injectAddToCart(fieldEl, product, storeBasePath) {
  const tag = (fieldEl.tagName || '').toLowerCase();
  // Store slug/id as data attributes — click wiring happens after innerHTML
  // is set (see mountThemeAwareBlock in ThemeRenderer.jsx).
  fieldEl.setAttribute('data-product-slug', product.slug || '');
  fieldEl.setAttribute('data-product-id', product.id || '');

  if (tag === 'a') {
    // For <a> CTA buttons: navigate to the product page.
    fieldEl.href = `${storeBasePath}/products/${product.slug || ''}`;
  }

  // Mark out-of-stock products so CSS can style them (the theme's own
  // class won't be touched — only this additive attribute is added).
  if (!product.inStock) {
    fieldEl.setAttribute('data-out-of-stock', '1');
    fieldEl.setAttribute('disabled', '');
  } else {
    fieldEl.removeAttribute('data-out-of-stock');
    fieldEl.removeAttribute('disabled');
  }
}

// ── Main renderer ─────────────────────────────────────────────────────────

/**
 * Clones `cardTemplateHtml` once per product in `products`, injects real
 * product data into the tagged sub-elements, and returns the populated
 * card DOM nodes as a DocumentFragment.
 *
 * @param {object[]} products       Array of public product objects from the API
 * @param {string}   cardTemplateHtml  outerHTML of one product card (from productCardTemplate)
 * @param {object}   opts
 * @param {string}   [opts.currency='USD']  Store currency for price formatting
 * @param {string}   [opts.storeBasePath='']  Base path for product URLs (e.g. '' for SPA hash routing)
 *
 * @returns {DocumentFragment}  Ready-to-insert fragment; empty on error
 */
export function renderProductCards(products, cardTemplateHtml, opts = {}) {
  const { currency = 'USD', storeBasePath = '' } = opts;
  const fragment = document.createDocumentFragment();

  if (!products?.length || !cardTemplateHtml) return fragment;

  // Parse the template once, then clone it N times.
  const parser = new DOMParser();
  const templateDoc = parser.parseFromString(
    `<div id="__card_root__">${cardTemplateHtml}</div>`,
    'text/html'
  );
  const templateRoot = templateDoc.getElementById('__card_root__');
  if (!templateRoot || !templateRoot.firstElementChild) return fragment;
  const templateNode = templateRoot.firstElementChild;

  for (const product of products) {
    const card = templateNode.cloneNode(true);

    // Root-level attributes for click wiring.
    card.setAttribute('data-product-slug', product.slug || '');
    card.setAttribute('data-product-id', product.id || '');
    card.style.cursor = 'pointer';

    // Walk tagged sub-elements and inject live data.
    card.querySelectorAll('[data-store-field]').forEach((fieldEl) => {
      const field = fieldEl.getAttribute('data-store-field');
      switch (field) {
        case 'image':       injectImage(fieldEl, product);                         break;
        case 'title':       injectTitle(fieldEl, product, storeBasePath);          break;
        case 'price':       injectPrice(fieldEl, product, currency);               break;
        case 'add-to-cart': injectAddToCart(fieldEl, product, storeBasePath);      break;
        // Any other data-store-field values are left as-is — the theme's
        // static content for unknown fields is preserved, not wiped.
        default: break;
      }
    });

    fragment.appendChild(card);
  }

  return fragment;
}
