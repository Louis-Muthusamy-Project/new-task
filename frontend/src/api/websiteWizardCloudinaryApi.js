
const API_BASE = import.meta.env.VITE_WEBSITE_WIZARD_API_BASE || 'http://localhost:5500/api';

async function requestMultipart(path, { file, name, folder } = {}) {
  console.log("data",file,name,folder,path)
  const form = new FormData();
  if (file) form.append('file', file);
  if (name) form.append('name', name);
  if (folder) form.append('folder', folder);

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API POST ${path} failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  if (!json || json.success === false) {
    throw new Error(json?.error || 'Unknown API error');
  }
  // Backend now returns: { success:true, website:{...}, pages:[...] }
  // Do not unwrap json.data (legacy) because it's not present anymore.
  return json;
}

export const websiteWizardCloudinaryApi = {
  uploadTemplateZipToCloudinary: async ({ file, name, folder } = {}) => {
    return requestMultipart('/website/upload-template', { file, name, folder });
  },
};

