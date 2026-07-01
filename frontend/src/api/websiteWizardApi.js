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
    if (res.status === 413) {
      throw new Error(`413 Payload Too Large — page content exceeds server limit. Remove large embedded images and try again.`);
    }
    throw new Error(`API ${method} ${path} failed: ${res.status} ${text}`);
  }

  return res.json();
}

async function requestMultipart(path, formData) {
  console.log('[websiteWizardApi] POST multipart', API_BASE + path);
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API POST ${path} failed: ${res.status} ${text}`);
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

  createTemplate: async (payload) => {
    const form = new FormData();
    if (payload.file) form.append('file', payload.file);
    if (payload.name) form.append('name', payload.name);
    if (payload.category) form.append('category', payload.category);
    if (payload.description) form.append('description', payload.description);
    if (payload.thumbnailUrl) form.append('thumbnailUrl', payload.thumbnailUrl);
    if (payload.pages) form.append('pages', JSON.stringify(payload.pages));
    
    return unwrapSuccess(await requestMultipart('/templates', form));
  },

  getFormTemplates: async () => unwrapSuccess(await request('/website-builder/forms/templates', { method: 'GET' })),

  createFormTemplate: async (payload) =>
    unwrapSuccess(
      await request('/website-builder/forms', {
        method: 'POST',
        body: { ...payload, isTemplate: true },
      })
    ),

  updateForm: async (id, payload) =>
    unwrapSuccess(
      await request(`/website-builder/forms/${id}`, {
        method: 'PUT',
        body: payload,
      })
    ),

  getFormSubmissions: async (params = {}) => {
    const query = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    return unwrapSuccess(
      await request(`/website-builder/forms/submissions${query ? `?${query}` : ''}`, { method: 'GET' })
    );
  },

  listQrcodes: async () => unwrapSuccess(await request('/website-builder/qrcodes', { method: 'GET' })),

  createQr: async (payload) =>
    unwrapSuccess(
      await request('/website-builder/qrcodes', {
        method: 'POST',
        body: payload,
      })
    ),

  deleteQr: async (id) => unwrapSuccess(await request(`/website-builder/qrcodes/${id}`, { method: 'DELETE' })),
};