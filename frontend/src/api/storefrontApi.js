// storefrontApi.js — client for the PUBLIC storefront endpoints
// (controllers/store/storeStorefrontController.js on the backend).
//
// This is the only place the dynamic Storefront Preview talks to the
// network. Every exported method maps 1:1 to a real Store Engine public
// route — there is no local/static product, collection, or page data
// anywhere in this file or its callers.
//
// Follows the same GET-cache-with-dedupe convention as storeApi.js: a
// short-TTL in-memory cache keyed by URL, where concurrent requests for
// the same URL share a single in-flight promise. That's what keeps
// multiple storefront sections (e.g. Featured Products + Latest Products
// both requesting /products) from creating duplicated fetch state.

const API_BASE = import.meta.env.VITE_WEBSITE_WIZARD_API_BASE || 'http://localhost:5500/api';

const GET_CACHE_TTL_MS = 15 * 1000; // short — a merchant adding a product in Admin should show up fast
const getCache = new Map(); // url -> { expiresAt, promise }

async function requestJson(path) {
  const url = `${API_BASE}${path}`;

  const cached = getCache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise;
  }

  const fetchPromise = (async () => {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Storefront API GET ${path} failed: ${res.status} ${text}`);
    }
    return res.json();
  })();

  getCache.set(url, { expiresAt: Date.now() + GET_CACHE_TTL_MS, promise: fetchPromise });
  try {
    return await fetchPromise;
  } catch (err) {
    getCache.delete(url); // never cache a failure
    throw err;
  }
}

async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Storefront API POST ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

function unwrap(json) {
  if (!json || json.success === false) {
    throw new Error(json?.error || 'Unknown storefront API error');
  }
  return json;
}

/** Forces the next matching GET(s) to hit the network instead of the cache. */
function invalidate(storeId) {
  for (const key of getCache.keys()) {
    if (key.includes(String(storeId))) getCache.delete(key);
  }
}

function qs(params = {}) {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') usp.set(key, value);
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

export const storefrontApi = {
  // GET /api/store/:storeId/info
  getStoreInfo: async (storeId) => unwrap(await requestJson(`/store/${storeId}/info`)).data,

  // GET /api/store/:storeId/pages — Published pages only, for Menu/Footer nav
  listPages: async (storeId) => unwrap(await requestJson(`/store/${storeId}/pages`)).data,

  // GET /api/store/:storeId/products
  listProducts: async (storeId, params = {}) => {
    const json = unwrap(await requestJson(`/store/${storeId}/products${qs(params)}`));
    return { items: json.data, meta: json.meta };
  },

  // GET /api/store/:storeId/products/:productId
  getProduct: async (storeId, productId) =>
    unwrap(await requestJson(`/store/${storeId}/products/${productId}`)).data,

  // GET /api/store/:storeId/products/featured
  listFeaturedProducts: async (storeId, limit = 8) =>
    unwrap(await requestJson(`/store/${storeId}/products/featured${qs({ limit })}`)).data,

  // GET /api/store/:storeId/products/latest
  listLatestProducts: async (storeId, limit = 8) =>
    unwrap(await requestJson(`/store/${storeId}/products/latest${qs({ limit })}`)).data,

  // GET /api/store/:storeId/products/bestsellers
  listBestSellers: async (storeId, limit = 8) =>
    unwrap(await requestJson(`/store/${storeId}/products/bestsellers${qs({ limit })}`)).data,

  // GET /api/store/:storeId/collections
  listCollections: async (storeId, params = {}) =>
    unwrap(await requestJson(`/store/${storeId}/collections${qs(params)}`)).data,

  // GET /api/store/:storeId/collections/:collectionId — collection + its products
  getCollection: async (storeId, collectionId, params = {}) =>
    unwrap(await requestJson(`/store/${storeId}/collections/${collectionId}${qs(params)}`)).data,

  // GET /api/store/:storeId/testimonials
  listTestimonials: async (storeId, limit = 9) =>
    unwrap(await requestJson(`/store/${storeId}/testimonials${qs({ limit })}`)).data,

  // GET /api/store/:storeId/search?q=
  search: async (storeId, q, limit = 8) =>
    unwrap(await requestJson(`/store/${storeId}/search${qs({ q, limit })}`)).data,

  // POST /api/store/:storeId/orders — checkout
  createOrder: async (storeId, payload) =>
    unwrap(await postJson(`/store/${storeId}/orders`, payload)).data,

  // POST /api/store/:storeId/track — fire-and-forget pageview ping
  trackVisit: async (storeId, payload) =>
    postJson(`/store/${storeId}/track`, payload).catch(() => null),

  invalidate,
};
