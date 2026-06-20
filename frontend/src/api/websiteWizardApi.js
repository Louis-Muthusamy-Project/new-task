
const API_BASE = 'http://localhost:5500/api' ;



async function request(path, { method = 'GET', body } = {}) {
  console.log(API_BASE,path)
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
  // Templates API (backend may not provide these yet; callers should handle failures)
  listTemplates: async () => unwrapSuccess(await request('/templates', { method: 'GET' })),

  // Website Builder API (MERN backend)
  // Base: /api/website-builder

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

  // Pages API
  // Base: /api/website-builder/websites/:websiteId/pages
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
};



