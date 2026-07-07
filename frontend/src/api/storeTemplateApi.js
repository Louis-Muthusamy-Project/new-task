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

// XHR-based multipart POST — used instead of fetch() only where callers need
// real upload-progress events (fetch has no progress API). Kept separate
// from requestMultipart above so every existing caller (createStoreTemplate,
// uploadTemplateZipToCloudinary) is completely unaffected by this addition.
function requestMultipartWithProgress(path, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}${path}`);

    xhr.upload.onprogress = (e) => {
      if (typeof onProgress === 'function' && e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      let json = null;
      try {
        json = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch (_) {
        // non-JSON response — fall through, handled below
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(json);
      } else {
        const message =
          (json && (json.error || (Array.isArray(json.errors) && json.errors.join(' ')))) ||
          `Request failed (${xhr.status})`;
        const err = new Error(message);
        err.status = xhr.status;
        err.payload = json;
        reject(err);
      }
    };

    xhr.onerror = () => reject(new Error('Network error while uploading the file.'));
    xhr.onabort = () => reject(new Error('Upload cancelled.'));

    xhr.send(formData);
  });
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
  createStoreTemplate: async ({
    file,
    name,
    category,
    description,
    thumbnail,
    preview,
    pages,
    theme,
    status,
    version,
    uploadedByRole,
  } = {}) => {
    const form = new FormData();
    if (file) form.append('file', file);
    if (name) form.append('name', name);
    if (category) form.append('category', category);
    if (description) form.append('description', description);
    if (thumbnail) form.append('thumbnail', thumbnail);
    if (preview) form.append('preview', preview);
    if (pages) form.append('pages', JSON.stringify(pages));
    if (theme) form.append('theme', JSON.stringify(theme));
    if (status) form.append('status', status);
    if (version) form.append('version', version);
    if (uploadedByRole) form.append('uploadedByRole', uploadedByRole);

    const json = unwrap(await requestMultipart('/store-templates', form));
    return json.data;
  },

  // GET /api/store-templates/:id/versions — version history for the v1/v2/…
  // tab switcher in StoreTemplateLibraryModal.
  getTemplateVersions: async (templateId) => {
    const json = unwrap(await requestJson(`/store-templates/${templateId}/versions`, { method: 'GET' }));
    return json.data;
  },

  // POST /api/store-templates/:id/versions — snapshot the template's current
  // content as a new version (e.g. v1 -> v2).
  createTemplateVersion: async (templateId, { label } = {}) => {
    const json = unwrap(
      await requestJson(`/store-templates/${templateId}/versions`, { method: 'POST', body: { label } })
    );
    return json.data;
  },

  // POST /api/store-templates/:id/rollback/:version — restore the template
  // to a prior version's snapshot (recorded as a new version, history kept).
  rollbackTemplateVersion: async (templateId, version) => {
    const json = unwrap(
      await requestJson(`/store-templates/${templateId}/rollback/${version}`, { method: 'POST' })
    );
    return json.data;
  },

  // POST /api/store-templates/:id/duplicate — clone a library entry into a
  // brand-new, independently-editable template ("Duplicate Template").
  duplicateStoreTemplate: async (templateId, { name } = {}) => {
    const json = unwrap(
      await requestJson(`/store-templates/${templateId}/duplicate`, { method: 'POST', body: { name } })
    );
    return json.data;
  },

  // POST /api/wordpress-import/upload — WordPress (Simply Static) import
  // pipeline: Extract -> Validate Structure -> Upload Assets -> Rewrite
  // Asset URLs -> Create StoreTemplate (see the WordPress Import Pipeline
  // architecture doc). Reuses the same StoreTemplate collection/shape as
  // createStoreTemplate() above — the only difference is the source ZIP is
  // validated as a Simply Static export first. Returns
  // { template, warnings } on success; throws with `.errors` (validation
  // failures from Stage 3) or `.payload` set when available.
  importWordPressTemplate: async ({ file, name, category, description, status, onProgress, templateId } = {}) => {
    const form = new FormData();
    if (file) form.append('file', file);
    if (name) form.append('name', name);
    if (category) form.append('category', category);
    if (description) form.append('description', description);
    if (status) form.append('status', status);
    if (templateId) form.append('templateId', templateId);

    const json = await requestMultipartWithProgress('/wordpress-import/upload', form, onProgress);
    if (!json || json.success === false) {
      const err = new Error(
        (json && (json.error || (Array.isArray(json.errors) && json.errors.join(' ')))) ||
          'WordPress import failed.'
      );
      err.errors = json?.errors;
      err.warnings = json?.warnings;
      throw err;
    }
    return { template: json.data, warnings: json.warnings || [] };
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