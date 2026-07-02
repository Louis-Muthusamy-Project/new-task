// Store-module counterpart of websiteWizardCloudinaryApi.js + the
// createTemplate() helper in websiteWizardApi.js. Talks to the same backend
// import-engine pipeline, but the Store endpoints persist to Store /
// StorePage / StoreTemplate instead of Website / WebsitePage / WebsiteTemplate.
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

async function requestMultipart(path, formData) {
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

function unwrap(json) {
  if (!json || json.success === false) {
    throw new Error(json?.error || 'Unknown API error');
  }
  return json;
}

export const storeTemplateApi = {
  // GET /api/store-templates — list the store template library
  getAllStoreTemplates: async () => {
    const json = unwrap(await requestJson('/store-templates', { method: 'GET' }));
    return json.data;
  },

  // POST /api/store-templates — add a ZIP to the store template library
  // (library catalogue entry only — mirrors websiteWizardApi.createTemplate).
  createStoreTemplate: async ({ file, name, category, description, thumbnailUrl, pages, uploadedByRole } = {}) => {
    const form = new FormData();
    if (file) form.append('file', file);
    if (name) form.append('name', name);
    if (category) form.append('category', category);
    if (description) form.append('description', description);
    if (thumbnailUrl) form.append('thumbnailUrl', thumbnailUrl);
    if (pages) form.append('pages', JSON.stringify(pages));
    if (uploadedByRole) form.append('uploadedByRole', uploadedByRole);

    const json = unwrap(await requestMultipart('/store-templates', form));
    return json.data;
  },

  // POST /api/store/upload-template — full ZIP-parse pipeline that creates a
  // Store + its StorePage documents (Store-module counterpart of
  // websiteWizardCloudinaryApi.uploadTemplateZipToCloudinary).
  uploadTemplateZipToCloudinary: async ({ file, name, storeName, description, status, installDemo } = {}) => {
    const form = new FormData();
    if (file) form.append('file', file);
    if (name) form.append('name', name);
    if (storeName) form.append('storeName', storeName);
    if (description) form.append('description', description);
    if (status) form.append('status', status);
    if (installDemo !== undefined) form.append('installDemo', String(installDemo));

    return unwrap(await requestMultipart('/store/upload-template', form));
  },
};
