import { useEffect } from 'react';
import { storefrontApi } from '../../../../api/storefrontApi';
import { useStorefront } from '../StorefrontContext';
import { useStorefrontQuery } from './useStorefrontQuery';

/**
 * hooks/useProducts.js — the reusable data layer every storefront surface
 * (Homepage, Category, Product Page, Search, Collections) is built on.
 *
 * Each hook here does two things:
 *   1. Fetches from the Store Engine's public API via `useStorefrontQuery`
 *      (loading/data/error state, request-race handling).
 *   2. Subscribes to the store's real-time event stream (see
 *      StorefrontContext's `subscribeToStoreEvents`, fed by the backend's
 *      SSE route in storeStorefrontController.js) and calls `reload()`
 *      whenever an event arrives that could change this hook's result.
 *
 * That combination is what makes the full chain automatic:
 *
 *   Admin creates a product
 *     → Database updates (ProductService.createProduct)
 *     → Store Engine emits `product.created` (storeEvents.js)
 *     → SSE stream pushes it to every open storefront tab
 *     → useFeaturedProducts/useLatestProducts/useProducts/useCollections
 *       (whichever are mounted) reload from the same public API
 *     → Homepage, Category, Product Page, Search, Collections, and
 *       Inventory (via `inventory.updated`) all reflect it — no manual
 *       refresh, no page reload, no duplicated copy of the product data.
 *
 * No component needs to know the event vocabulary itself — that lives
 * once, here, per hook.
 */

const PRODUCT_EVENTS = ['product.created', 'product.updated', 'product.deleted', 'inventory.updated'];
const COLLECTION_EVENTS = ['collection.created', 'collection.updated', 'collection.deleted'];

/**
 * Subscribes `reload` to fire whenever the store's event stream emits one
 * of `eventTypes`. Shared by every hook below instead of each one
 * re-implementing the same subscribe/filter/cleanup dance.
 */
function useReloadOnStoreEvents(eventTypes, reload) {
  const { subscribeToStoreEvents } = useStorefront();

  useEffect(() => {
    const unsubscribe = subscribeToStoreEvents((event) => {
      if (eventTypes.includes(event.type)) reload();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribeToStoreEvents]);
}

/**
 * useProducts(params) — a general product listing (used by a plain
 * Product Grid block, or anywhere that needs filter/sort/pagination
 * rather than one of the named sections below).
 *
 * `params`: { limit, page, collectionId, q, sort, priceMin, priceMax, tag }
 */
export function useProducts(params = {}) {
  const { storeId } = useStorefront();
  const key = JSON.stringify(params);

  const { data, loading, error, reload } = useStorefrontQuery(
    () => storefrontApi.listProducts(storeId, params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeId, key]
  );

  useReloadOnStoreEvents(PRODUCT_EVENTS, reload);

  return { products: data?.items || [], meta: data?.meta, loading, error, reload };
}

/**
 * useProduct(productId) — a single Product Page's data. Reloads on any
 * product/inventory event for the store (cheap: one small GET), so an
 * admin edit or a stock change from a concurrent checkout shows up on an
 * already-open Product Page without the shopper refreshing.
 */
export function useProduct(productId) {
  const { storeId } = useStorefront();

  const { data, loading, error, reload } = useStorefrontQuery(
    () => storefrontApi.getProduct(storeId, productId),
    [storeId, productId]
  );

  useReloadOnStoreEvents(PRODUCT_EVENTS, reload);

  return { product: data, loading, error, reload };
}

/**
 * useProductBySlug(slug) — a Product Detail Page's data, looked up by the
 * shopper-facing `/products/:slug` identifier instead of the internal
 * _id. Returns the full PDP payload (gallery, price, description, stock,
 * category, rating summary, related products, SEO) in one request.
 * Reloads on the same product/inventory events useProduct does.
 */
export function useProductBySlug(slug) {
  const { storeId } = useStorefront();

  const { data, loading, error, reload } = useStorefrontQuery(
    () => storefrontApi.getProductBySlug(storeId, slug),
    [storeId, slug]
  );

  useReloadOnStoreEvents(PRODUCT_EVENTS, reload);

  return { product: data, loading, error, reload };
}

/**
 * useProductReviews(productId, limit) — a Product Detail Page's Reviews
 * section. Backed by StoreTestimonial (merchant-curated, no realtime
 * write path yet), so unlike the product/collection hooks above this one
 * doesn't subscribe to the store's event stream — `reload()` is still
 * exposed for an explicit refresh.
 */
export function useProductReviews(productId, limit = 20) {
  const { storeId } = useStorefront();

  const { data, loading, error, reload } = useStorefrontQuery(
    () => (productId ? storefrontApi.listProductReviews(storeId, productId, limit) : Promise.resolve([])),
    [storeId, productId, limit]
  );

  return { reviews: data || [], loading, error, reload };
}

/**
 * useFeaturedProducts(limit) — Homepage's "Featured Products" section.
 */
export function useFeaturedProducts(limit = 8) {
  const { storeId } = useStorefront();

  const { data, loading, error, reload } = useStorefrontQuery(
    () => storefrontApi.listFeaturedProducts(storeId, limit),
    [storeId, limit]
  );

  useReloadOnStoreEvents(PRODUCT_EVENTS, reload);

  return { products: data || [], loading, error, reload };
}

/**
 * useLatestProducts(limit) — Homepage's "Latest Products" section; also
 * the section that most directly proves "add a product in Admin, see it
 * on the Homepage" since it's always the newest Active products.
 */
export function useLatestProducts(limit = 8) {
  const { storeId } = useStorefront();

  const { data, loading, error, reload } = useStorefrontQuery(
    () => storefrontApi.listLatestProducts(storeId, limit),
    [storeId, limit]
  );

  useReloadOnStoreEvents(PRODUCT_EVENTS, reload);

  return { products: data || [], loading, error, reload };
}

/**
 * useBestSellers(limit) — Homepage's "Best Sellers" section, ranked by
 * units sold. Also reloads on `inventory.updated` so a sellout reflects
 * immediately (an out-of-stock best seller still shows, but its badge
 * updates without a refresh).
 */
export function useBestSellers(limit = 8) {
  const { storeId } = useStorefront();

  const { data, loading, error, reload } = useStorefrontQuery(
    () => storefrontApi.listBestSellers(storeId, limit),
    [storeId, limit]
  );

  useReloadOnStoreEvents(PRODUCT_EVENTS, reload);

  return { products: data || [], loading, error, reload };
}

/**
 * useSaleProducts(limit) — "Sale Products" section: Active products
 * currently marked down (`compareAtPrice` > `price`). Reloads on the same
 * product/inventory events every other listing hook does, so a price
 * change that starts/ends a discount shows up immediately.
 */
export function useSaleProducts(limit = 8) {
  const { storeId } = useStorefront();

  const { data, loading, error, reload } = useStorefrontQuery(
    () => storefrontApi.listSaleProducts(storeId, limit),
    [storeId, limit]
  );

  useReloadOnStoreEvents(PRODUCT_EVENTS, reload);

  return { products: data || [], loading, error, reload };
}

/**
 * useCollections(limit) — Homepage's "Shop by Collection" grid. Reloads on
 * collection events (a collection was created/renamed/deleted) AND
 * product events (a collection's `productCount` changes as products are
 * added/removed/archived).
 */
export function useCollections(limit = 8) {
  const { storeId } = useStorefront();

  const { data, loading, error, reload } = useStorefrontQuery(
    () => storefrontApi.listCollections(storeId, { limit }),
    [storeId, limit]
  );

  useReloadOnStoreEvents([...COLLECTION_EVENTS, ...PRODUCT_EVENTS], reload);

  return { collections: data || [], loading, error, reload };
}

/**
 * useCollection(collectionId) — a Category Page's data: the collection
 * itself plus its live Active products in one call. Reloads on both
 * collection events (title/description edited) and product events (a
 * product was added to/removed from/archived out of this collection).
 */
export function useCollection(collectionId) {
  const { storeId } = useStorefront();

  const { data, loading, error, reload } = useStorefrontQuery(
    () => storefrontApi.getCollection(storeId, collectionId),
    [storeId, collectionId]
  );

  useReloadOnStoreEvents([...COLLECTION_EVENTS, ...PRODUCT_EVENTS], reload);

  return { collection: data, loading, error, reload };
}

/**
 * useSearch(q) — the Search Results page. Reloads on product AND
 * collection events (search spans both) so a newly-created product or
 * collection that matches an already-open query appears without the
 * shopper re-submitting the search.
 */
export function useSearch(q) {
  const { storeId } = useStorefront();

  const { data, loading, error, reload } = useStorefrontQuery(
    () => storefrontApi.search(storeId, q),
    [storeId, q]
  );

  useReloadOnStoreEvents([...PRODUCT_EVENTS, ...COLLECTION_EVENTS], reload);

  return { products: data?.products || [], collections: data?.collections || [], loading, error, reload };
}