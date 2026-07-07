const API_BASE = import.meta.env.VITE_WEBSITE_WIZARD_API_BASE || 'http://localhost:5500/api';

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`SEO API ${method} ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

// ─── Projects ────────────────────────────────────────────────────────
export const getProjects = () => request('/seo/projects');
export const getProjectBySlug = (slug) => request(`/seo/projects/${slug}`);
export const createProject = (data) => request('/seo/projects', { method: 'POST', body: data });
export const updateProject = (slug, data) => request(`/seo/projects/${slug}`, { method: 'PUT', body: data });
export const deleteProject = (slug) => request(`/seo/projects/${slug}`, { method: 'DELETE' });

// ─── Audit ───────────────────────────────────────────────────────────
export const triggerAudit = (slug) => request(`/seo/projects/${slug}/audit`, { method: 'POST' });
export const getAudits = (slug) => request(`/seo/projects/${slug}/audits`);
export const getIssues = (slug, params = '') => request(`/seo/projects/${slug}/issues${params ? '?' + params : ''}`);
export const updateIssueStatus = (id, status) => request(`/seo/issues/${id}`, { method: 'PUT', body: { status } });

// ─── Keywords ────────────────────────────────────────────────────────
export const getKeywords = (slug) => request(`/seo/projects/${slug}/keywords`);
export const addKeywords = (slug, keywords) => request(`/seo/projects/${slug}/keywords`, { method: 'POST', body: { keywords } });
export const deleteKeyword = (id) => request(`/seo/keywords/${id}`, { method: 'DELETE' });
export const refreshKeywordRanks = (slug) => request(`/seo/projects/${slug}/keywords/refresh`, { method: 'POST' });
export const getCompetitors = (slug) => request(`/seo/projects/${slug}/competitors`);

// ─── Strategy & Gate ─────────────────────────────────────────────────
export const getStrategy = (slug) => request(`/seo/projects/${slug}/strategy`);
export const generateStrategy = (slug) => request(`/seo/projects/${slug}/strategy`, { method: 'POST' });
export const submitStrategy = (slug) => request(`/seo/projects/${slug}/strategy/submit`, { method: 'POST' });
export const approveStrategy = (slug, username) => request(`/seo/projects/${slug}/strategy/approve`, { method: 'POST', body: { username } });
export const rejectStrategy = (slug, notes, username) => request(`/seo/projects/${slug}/strategy/reject`, { method: 'POST', body: { notes, username } });

// ─── Content Drafts ──────────────────────────────────────────────────
export const getDrafts = (slug) => request(`/seo/projects/${slug}/drafts`);
export const createDraft = (slug, data) => request(`/seo/projects/${slug}/drafts`, { method: 'POST', body: data });
export const updateDraft = (id, data) => request(`/seo/drafts/${id}`, { method: 'PUT', body: data });
export const humanizeDraft = (id, brandVoiceNotes = '') => request(`/seo/drafts/${id}/humanize`, { method: 'POST', body: { brandVoiceNotes } });
