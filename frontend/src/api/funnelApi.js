const API_BASE = import.meta.env.VITE_WEBSITE_WIZARD_API_BASE || 'http://localhost:5500/api';

const GET_CACHE_TTL_MS = 30 * 1000;
const getCache = new Map(); // url -> { expiresAt, promise }

function invalidateGetCache() {
  getCache.clear();
}

async function requestJson(path, { method = 'GET', body } = {}) {
  const url = `${API_BASE}${path}`;

  if (method === 'GET') {
    const cached = getCache.get(url);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.promise.then((json) => json);
    }
  }

  const fetchPromise = (async () => {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`API ${method} ${path} failed: ${res.status} ${text}`);
    }
    return res.json();
  })();

  if (method === 'GET') {
    getCache.set(url, { expiresAt: Date.now() + GET_CACHE_TTL_MS, promise: fetchPromise });
    try {
      return await fetchPromise;
    } catch (err) {
      getCache.delete(url);
      throw err;
    }
  }

  try {
    return await fetchPromise;
  } finally {
    invalidateGetCache();
  }
}

function unwrap(json) {
  if (!json || json.success === false) {
    throw new Error(json?.error || 'Unknown API error');
  }
  return json;
}

export const funnelApi = {
  // ── Funnel CRUD ────────────────────────────────────────────────────────────
  list: async ({ search, status } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const json = unwrap(await requestJson(`/funnels${qs}`));
    return json.data;
  },

  create: async (payload) => {
    const json = unwrap(await requestJson('/funnels', { method: 'POST', body: payload }));
    return json.data;
  },

  get: async (id) => {
    const json = unwrap(await requestJson(`/funnels/${id}`));
    return json.data;
  },

  update: async (id, payload) => {
    const json = unwrap(await requestJson(`/funnels/${id}`, { method: 'PATCH', body: payload }));
    return json.data;
  },

  delete: async (id) => {
    const json = unwrap(await requestJson(`/funnels/${id}`, { method: 'DELETE' }));
    return json.data;
  },

  duplicate: async (id) => {
    const json = unwrap(await requestJson(`/funnels/${id}/duplicate`, { method: 'POST' }));
    return json.data;
  },

  preview: async (id) => {
    const json = unwrap(await requestJson(`/funnels/${id}/preview`));
    return json.data;
  },

  // ── Steps CRUD ──────────────────────────────────────────────────────────────
  listSteps: async (funnelId) => {
    const json = unwrap(await requestJson(`/funnels/${funnelId}/steps`));
    return json.data;
  },

  createStep: async (funnelId, payload) => {
    const json = unwrap(
      await requestJson(`/funnels/${funnelId}/steps`, { method: 'POST', body: payload })
    );
    return json.data;
  },

  reorderSteps: async (funnelId, orderedIds) => {
    const json = unwrap(
      await requestJson(`/funnels/${funnelId}/steps/reorder`, {
        method: 'POST',
        body: { orderedIds },
      })
    );
    return json;
  },

  getStep: async (id) => {
    const json = unwrap(await requestJson(`/funnels/steps/${id}`));
    return json.data;
  },

  updateStep: async (id, payload) => {
    const json = unwrap(
      await requestJson(`/funnels/steps/${id}`, { method: 'PUT', body: payload })
    );
    return json.data;
  },

  deleteStep: async (id) => {
    const json = unwrap(await requestJson(`/funnels/steps/${id}`, { method: 'DELETE' }));
    return json.data;
  },

  // ── Offers (Store Product → Funnel Offer → Checkout) ─────────────────────────
  getOffer: async (funnelId, stepId) => {
    const json = unwrap(await requestJson(`/funnels/${funnelId}/steps/${stepId}/offer`));
    return json.data; // { offer, preview }
  },

  saveOffer: async (funnelId, stepId, payload) => {
    const json = unwrap(
      await requestJson(`/funnels/${funnelId}/steps/${stepId}/offer`, { method: 'PUT', body: payload })
    );
    return json.data;
  },

  deleteOffer: async (funnelId, stepId) => {
    const json = unwrap(
      await requestJson(`/funnels/${funnelId}/steps/${stepId}/offer`, { method: 'DELETE' })
    );
    return json.data;
  },

  // ── Checkout (public — used by the live funnel renderer) ─────────────────────
  checkoutStep: async (funnelId, stepId, payload) => {
    const json = unwrap(
      await requestJson(`/funnels/${funnelId}/steps/${stepId}/checkout`, { method: 'POST', body: payload })
    );
    return json.data; // { order, nextStepId, redirectUrl }
  },

  // ── Contacts ────────────────────────────────────────────────────────────────
  listContacts: async (funnelId, { search, stepId, page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (stepId) params.set('stepId', stepId);
    params.set('page', page);
    params.set('limit', limit);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const json = unwrap(await requestJson(`/funnels/${funnelId}/contacts${qs}`));
    return json; // Contains .data and .meta
  },

  deleteContact: async (id) => {
    const json = unwrap(await requestJson(`/funnels/contacts/${id}`, { method: 'DELETE' }));
    return json.data;
  },

  // ── Publish ─────────────────────────────────────────────────────────────────
  publish: async (funnelId) => {
    const json = unwrap(await requestJson(`/funnels/${funnelId}/publish`, { method: 'POST' }));
    return json;
  },

  // ── Analytics ───────────────────────────────────────────────────────────────
  getAnalytics: async (funnelId, { days } = {}) => {
    const params = new URLSearchParams();
    if (days) params.set('days', days);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const json = unwrap(await requestJson(`/funnels/${funnelId}/analytics${qs}`));
    return json.data;
  },

  // ── Templates ───────────────────────────────────────────────────────────────
  listTemplates: async ({ category, search } = {}) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const json = unwrap(await requestJson(`/funnel-templates${qs}`));
    return json.data;
  },

  getTemplate: async (id) => {
    const json = unwrap(await requestJson(`/funnel-templates/${id}`));
    return json.data;
  },

  // POST /api/funnel-templates — add a template to the library from a
  // JSON blueprint (used by the "Upload template" flow in
  // FunnelTemplateLibraryModal, the funnel-module counterpart of
  // storeTemplateApi.createStoreTemplate). Unlike the store pipeline this
  // has no ZIP/asset parsing — a funnel template is just structured JSON
  // (name/category/steps), so it maps 1:1 onto the existing createTemplate
  // controller endpoint with no backend changes required.
  createTemplate: async ({ name, description, category, thumbnailUrl, steps, tags, isSystem } = {}) => {
    const json = unwrap(
      await requestJson('/funnel-templates', {
        method: 'POST',
        body: { name, description, category, thumbnailUrl, steps, tags, isSystem },
      })
    );
    return json.data;
  },

  saveAsTemplate: async (payload) => {
    const json = unwrap(
      await requestJson('/funnel-templates/save-from-funnel', { method: 'POST', body: payload })
    );
    return json.data;
  },
};