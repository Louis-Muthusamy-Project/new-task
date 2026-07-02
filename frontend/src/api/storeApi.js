// Store-module counterpart of websiteWizardApi.js — talks to the
// /api/store endpoints that create a Store (as opposed to storeTemplateApi.js,
// which manages the StoreTemplate library).
const API_BASE = import.meta.env.VITE_WEBSITE_WIZARD_API_BASE || 'http://localhost:5500/api';

async function requestJson(path, { method = 'GET', body } = {}) {
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

function unwrap(json) {
  if (!json || json.success === false) {
    throw new Error(json?.error || 'Unknown API error');
  }
  return json;
}

export const storeApi = {
  // POST /api/store/create-from-template
  // Flow: Choose Template -> Clone Template -> Create Store ->
  //       Create Default Pages -> Copy Demo Products -> Return Store
  createStoreFromTemplate: async ({
    templateId,
    storeName,
    currency,
    status,
    installDemo,
    description,
  } = {}) => {
    const json = unwrap(
      await requestJson('/store/create-from-template', {
        method: 'POST',
        body: { templateId, storeName, currency, status, installDemo, description },
      })
    );
    return json.data; // { store, pages, products, collections, discount }
  },
};
