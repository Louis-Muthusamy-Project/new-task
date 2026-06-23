const API_BASE = import.meta.env?.VITE_WEBSITE_WIZARD_API_BASE || 'http://localhost:5500/api';

async function request(path, { method = 'GET', body } = {}) {
  console.log('[websiteWizardApi]', method, API_BASE + path);
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${method} ${path} failed: ${res.status} ${text}`);
  }

  return res.json();
}

function unwrapSuccess(json) {
  if (!json || json.success === false) {
    throw new Error(json?.error || 'Unknown API error');
  }
  return json.data;
}

export const websiteWizardApi = {
  // ─── Websites ────────────────────────────────────────────────────────────

  /**
   * GET /api/website-builder/websites
   * Returns { data: Website[], meta: { total, ... } }
   * We return the raw json so callers can access both .data and .meta.
   */
  getAllWebsites: async () => {
    const json = await request('/website-builder/websites', { method: 'GET' });
    if (!json || json.success === false) {
      throw new Error(json?.error || 'Unknown API error');
    }
    // Return raw json — callers read json.data (array) and json.meta (pagination)
    return json;
  },

  createWebsite: async (payload) =>
    unwrapSuccess(
      await request('/website-builder/websites', {
        method: 'POST',
        body: payload,
      })
    ),

  getWebsite: async (id) =>
    unwrapSuccess(
      await request(`/website-builder/websites/${id}`, { method: 'GET' })
    ),

  updateWebsite: async (id, payload) =>
    unwrapSuccess(
      await request(`/website-builder/websites/${id}`, {
        method: 'PATCH',
        body: payload,
      })
    ),

  deleteWebsite: async (id) =>
    unwrapSuccess(
      await request(`/website-builder/websites/${id}`, { method: 'DELETE' })
    ),

  previewWebsite: async (id) =>
    unwrapSuccess(
      await request(`/website-builder/websites/${id}/preview`, { method: 'GET' })
    ),

  // ─── Pages ───────────────────────────────────────────────────────────────

  createPage: async (payload) =>
    unwrapSuccess(
      await request(`/website-builder/websites/${payload.websiteId}/pages`, {
        method: 'POST',
        body: payload,
      })
    ),

  listPagesByWebsite: async (websiteId) =>
    unwrapSuccess(
      await request(`/website-builder/websites/${websiteId}/pages`, {
        method: 'GET',
      })
    ),

  getPage: async (pageId) =>
    unwrapSuccess(
      await request(`/website-builder/pages/${pageId}`, { method: 'GET' })
    ),

  updatePage: async (pageId, payload) =>
    unwrapSuccess(
      await request(`/website-builder/pages/${pageId}`, {
        method: 'PUT',
        body: payload,
      })
    ),

  deletePage: async (pageId) =>
    unwrapSuccess(
      await request(`/website-builder/pages/${pageId}`, { method: 'DELETE' })
    ),

  // ─── Templates ───────────────────────────────────────────────────────────

  listTemplates: async () => unwrapSuccess(await request('/templates', { method: 'GET' })),
};