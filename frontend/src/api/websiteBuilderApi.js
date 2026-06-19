const API_BASE = import.meta.env.VITE_WEBSITE_BUILDER_API_BASE || 'http://localhost:5500/api/website-builder';

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

export const websiteBuilderApi = {
  // Websites
  listWebsites: async () => unwrapSuccess(await request('/websites')),
  createWebsite: async (payload) => unwrapSuccess(await request('/websites', { method: 'POST', body: payload })),
  updateWebsite: async (id, payload) => unwrapSuccess(await request(`/websites/${id}`, { method: 'PATCH', body: payload })),
  deleteWebsite: async (id) => unwrapSuccess(await request(`/websites/${id}`, { method: 'DELETE' })).catch(() => ({})),

  // Funnels
  listFunnels: async () => unwrapSuccess(await request('/funnels')),
  createFunnel: async (payload) => unwrapSuccess(await request('/funnels', { method: 'POST', body: payload })),
  updateFunnel: async (id, payload) => unwrapSuccess(await request(`/funnels/${id}`, { method: 'PATCH', body: payload })),
  deleteFunnel: async (id) => unwrapSuccess(await request(`/funnels/${id}`, { method: 'DELETE' })).catch(() => ({})),

  // Stores
  listStores: async () => unwrapSuccess(await request('/stores')),
  createStore: async (payload) => unwrapSuccess(await request('/stores', { method: 'POST', body: payload })),
  updateStore: async (id, payload) => unwrapSuccess(await request(`/stores/${id}`, { method: 'PATCH', body: payload })),
  deleteStore: async (id) => unwrapSuccess(await request(`/stores/${id}`, { method: 'DELETE' })).catch(() => ({})),

  // Domains
  listDomains: async () => unwrapSuccess(await request('/domains')),
  createDomain: async (payload) => unwrapSuccess(await request('/domains', { method: 'POST', body: payload })),
  updateDomain: async (id, payload) => unwrapSuccess(await request(`/domains/${id}`, { method: 'PATCH', body: payload })),
  deleteDomain: async (id) => unwrapSuccess(await request(`/domains/${id}`, { method: 'DELETE' })).catch(() => ({})),

  // Chat widgets
  listChatWidgets: async () => unwrapSuccess(await request('/chat-widgets')),
  createChatWidget: async (payload) => unwrapSuccess(await request('/chat-widgets', { method: 'POST', body: payload })),
  updateChatWidget: async (id, payload) => unwrapSuccess(await request(`/chat-widgets/${id}`, { method: 'PATCH', body: payload })),
  deleteChatWidget: async (id) => unwrapSuccess(await request(`/chat-widgets/${id}`, { method: 'DELETE' })).catch(() => ({})),

  // QRs
  listQrs: async () => unwrapSuccess(await request('/qrs')),
  createQr: async (payload) => unwrapSuccess(await request('/qrs', { method: 'POST', body: payload })),
  deleteQr: async (id) => unwrapSuccess(await request(`/qrs/${id}`, { method: 'DELETE' })).catch(() => ({})),

  // Forms
  listForms: async () => unwrapSuccess(await request('/forms')),
  createForm: async (payload) => unwrapSuccess(await request('/forms', { method: 'POST', body: payload })),
  updateForm: async (id, payload) => unwrapSuccess(await request(`/forms/${id}`, { method: 'PATCH', body: payload })),
  deleteForm: async (id) => unwrapSuccess(await request(`/forms/${id}`, { method: 'DELETE' })).catch(() => ({})),

  // Blogs
  listBlogs: async () => unwrapSuccess(await request('/blogs')),
  createBlog: async (payload) => unwrapSuccess(await request('/blogs', { method: 'POST', body: payload })),
  updateBlog: async (id, payload) => unwrapSuccess(await request(`/blogs/${id}`, { method: 'PATCH', body: payload })),
  deleteBlog: async (id) => unwrapSuccess(await request(`/blogs/${id}`, { method: 'DELETE' })).catch(() => ({})),
};

