// Store-module counterpart of websiteWizardApi.js's getPage/updatePage.
// Talks to the same GrapesJS builder (BccBuilder) but persists to
// StorePage instead of WebsitePage.
const API_BASE = import.meta.env?.VITE_WEBSITE_WIZARD_API_BASE || 'http://localhost:5500/api';

async function request(path, { method = 'GET', body } = {}) {
  console.log('[storeWizardApi]', method, API_BASE + path);
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

function unwrapSuccess(json) {
  if (!json || json.success === false) {
    throw new Error(json?.error || 'Unknown API error');
  }
  return json.data;
}

export const storeWizardApi = {
  // ─── Store pages ─────────────────────────────────────────────────────────

  getPage: async (pageId) =>
    unwrapSuccess(
      await request(`/store/pages/${pageId}`, { method: 'GET' })
    ),

  updatePage: async (pageId, payload) =>
    unwrapSuccess(
      await request(`/store/pages/${pageId}`, {
        method: 'PUT',
        body: payload,
      })
    ),
};
