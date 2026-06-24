const API_BASE = import.meta.env.VITE_WEBSITE_WIZARD_API_BASE || 'http://localhost:5500/api';

async function requestMultipart(path, { file, name, folder, websiteName } = {}) {
  console.log('[websiteWizardCloudinaryApi] uploading to', path, { name, websiteName, folder, fileSize: file?.size });
  const form = new FormData();
  if (file) form.append('file', file);
  if (name) form.append('name', name);
  if (folder) form.append('folder', folder);
  // FIX: forward websiteName so backend uses it as the Website.websiteName field
  if (websiteName) form.append('websiteName', websiteName);

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API POST ${path} failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  console.log('[websiteWizardCloudinaryApi] response:', { success: json?.success, websiteId: json?.website?._id, pagesCount: json?.pages?.length });
  if (!json || json.success === false) {
    throw new Error(json?.error || 'Unknown API error');
  }
  // Backend returns: { success:true, website:{...}, pages:[...] }
  return json;
}

export const websiteWizardCloudinaryApi = {
  uploadTemplateZipToCloudinary: async ({ file, name, folder, websiteName } = {}) => {
    return requestMultipart('/website/upload-template', { file, name, folder, websiteName });
  },
};