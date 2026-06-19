
const API_BASE = import.meta.env.VITE_WEBSITE_WIZARD_API_BASE || 'http://localhost:5500/api';



async function request(path, { method = 'GET', body } = {}) {
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
  createWebsite: async (payload) => unwrapSuccess(await request('/websites/create', { method: 'POST', body: payload })),
  getWebsite: async (id) => unwrapSuccess(await request(`/websites/${id}`, { method: 'GET' })),
  updateWebsite: async (id, payload) => unwrapSuccess(await request(`/websites/${id}`, { method: 'PUT', body: payload })),

  createPage: async (payload) => unwrapSuccess(await request('/pages/create', { method: 'POST', body: payload })),
  listPagesByWebsite: async (websiteId) => unwrapSuccess(await request(`/pages/${websiteId}`, { method: 'GET' })),
  updatePage: async (pageId, payload) => unwrapSuccess(await request(`/pages/${pageId}`, { method: 'PUT', body: payload })),
  deletePage: async (pageId) => unwrapSuccess(await request(`/pages/${pageId}`, { method: 'DELETE' })),
};

