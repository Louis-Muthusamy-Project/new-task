const https = require('https');
const http = require('http');
const { URL } = require('url');
const { SeoAudit, SeoIssue, SeoHistory } = require('../../models');

/**
 * Lightweight Node.js crawl engine — zero external deps.
 * Fetches a sitemap (or falls back to root URL), scrapes each page for
 * SEO signals, stores results in MongoDB.
 */

// Minimal fetch using built-in http/https
function nodeFetch(urlString, timeout = 8000) {
  return new Promise((resolve, reject) => {
    let parsed;
    try { parsed = new URL(urlString); } catch { return reject(new Error(`Invalid URL: ${urlString}`)); }
    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.get(urlString, { timeout }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
  });
}

// Naive HTML extractor — no cheerio dependency 
function extractMeta(html, url) {
  const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || '';
  const metaDesc = (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i) || [])[1]
    || (html.match(/<meta[^>]*content=["']([^"']*)[^>]*name=["']description["']/i) || [])[1] || '';
  const h1Matches = [...(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [])];
  const h1s = h1Matches.map(m => m[1].replace(/<[^>]+>/g, '').trim());
  const canonical = (html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i) || [])[1] || '';
  const robotsMeta = (html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)/i) || [])[1] || '';
  const imgsMissingAlt = [...(html.matchAll(/<img[^>]+(?!alt=["'][^"']+["'])[^>]*>/gi) || [])].length;
  const langAttr = (html.match(/<html[^>]*lang=["']([^"']*)/i) || [])[1] || '';

  return {
    title: title.trim(),
    metaDesc: metaDesc.trim(),
    h1s,
    canonical: canonical.trim(),
    robotsMeta: robotsMeta.trim(),
    imgsMissingAlt,
    langAttr: langAttr.trim()
  };
}

// Discover URLs from sitemap.xml or fallback to root
async function discoverUrls(siteUrl, limit = 50) {
  const base = siteUrl.replace(/\/$/, '');
  const sitemapUrls = [`${base}/sitemap.xml`, `${base}/sitemap_index.xml`, `${base}/sitemap/`];
  const discovered = new Set();
  discovered.add(base);

  for (const sitemapUrl of sitemapUrls) {
    try {
      const res = await nodeFetch(sitemapUrl, 6000);
      if (res.status === 200 && res.body.includes('<loc>')) {
        const locs = [...res.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
        locs.forEach(u => { if (u.startsWith('http')) discovered.add(u); });
        break;
      }
    } catch (_) { /* silent */ }
  }

  return [...discovered].slice(0, limit);
}

// Score a page based on crawl signals
function scorePage(signals) {
  const issues = [];
  let totalScore = 100;

  if (!signals.title) { issues.push({ type: 'missing_title', title: 'Missing page title', severity: 'critical', description: 'The page has no <title> tag.', url: signals.url }); totalScore -= 15; }
  else if (signals.title.length > 60) { issues.push({ type: 'long_title', title: 'Title too long', severity: 'warning', description: `Title is ${signals.title.length} chars (max 60).`, url: signals.url }); totalScore -= 5; }

  if (!signals.metaDesc) { issues.push({ type: 'missing_meta_desc', title: 'Missing meta description', severity: 'warning', description: 'No meta description found.', url: signals.url }); totalScore -= 10; }
  else if (signals.metaDesc.length > 160) { issues.push({ type: 'long_meta_desc', title: 'Meta description too long', severity: 'info', description: `Meta description is ${signals.metaDesc.length} chars (max 160).`, url: signals.url }); totalScore -= 3; }

  if (signals.h1s.length === 0) { issues.push({ type: 'missing_h1', title: 'Missing H1 tag', severity: 'critical', description: 'No H1 heading found on this page.', url: signals.url }); totalScore -= 15; }
  else if (signals.h1s.length > 1) { issues.push({ type: 'multiple_h1', title: 'Multiple H1 tags', severity: 'warning', description: `Found ${signals.h1s.length} H1 tags; pages should have exactly one.`, url: signals.url }); totalScore -= 8; }

  if (signals.imgsMissingAlt > 0) { issues.push({ type: 'missing_alt_text', title: `${signals.imgsMissingAlt} image(s) missing alt text`, severity: 'warning', description: 'Images without alt text reduce accessibility and SEO.', url: signals.url }); totalScore -= Math.min(signals.imgsMissingAlt * 2, 10); }

  if (!signals.canonical) { issues.push({ type: 'missing_canonical', title: 'Missing canonical URL', severity: 'info', description: 'A canonical link element is missing.', url: signals.url }); totalScore -= 3; }

  if (signals.statusCode >= 400) { issues.push({ type: 'broken_page', title: `HTTP ${signals.statusCode} Error`, severity: 'critical', description: `Page returned a ${signals.statusCode} status code.`, url: signals.url }); totalScore -= 20; }

  if (!signals.langAttr) { issues.push({ type: 'missing_lang', title: 'Missing lang attribute', severity: 'info', description: 'The <html> element is missing a lang attribute.', url: signals.url }); totalScore -= 2; }

  return { score: Math.max(totalScore, 0), issues };
}

exports.runCrawlAndAudit = async (project) => {
  const { siteUrl, _id: projectId } = project;

  // Discover URLs
  const urls = await discoverUrls(siteUrl);

  const allIssues = [];
  let totalScore = 0;
  let pagesScored = 0;

  for (const url of urls) {
    try {
      const res = await nodeFetch(url, 8000);
      const signals = { ...extractMeta(res.body, url), url, statusCode: res.status };
      const { score, issues } = scorePage(signals);
      totalScore += score;
      pagesScored++;
      allIssues.push(...issues);
    } catch (err) {
      // Record broken/unreachable page
      allIssues.push({
        type: 'unreachable_url',
        title: 'Unreachable URL',
        severity: 'critical',
        description: err.message,
        url
      });
    }
  }

  const overallScore = pagesScored > 0 ? Math.round(totalScore / pagesScored) : 0;

  // Persist audit record
  const audit = new SeoAudit({
    projectId,
    crawlDate: new Date(),
    urlsCrawledCount: urls.length,
    scores: { overall: overallScore, performance: null, crawlability: Math.min(overallScore + 10, 100), security: null, onPage: overallScore, mobileUsability: null },
    siteMap: urls,
    crawlSummary: { urlsAttempted: urls.length, issuesFound: allIssues.length }
  });
  await audit.save();

  // Persist issues
  const issueDocuments = allIssues.map(issue => ({
    projectId,
    auditId: audit._id,
    url: issue.url,
    type: issue.type,
    title: issue.title,
    description: issue.description || '',
    severity: issue.severity || 'warning',
    status: 'open',
    evidence: issue.evidence || {}
  }));
  if (issueDocuments.length > 0) {
    await SeoIssue.insertMany(issueDocuments);
  }

  // Advance phase
  if (!project.phasesCompleted.includes('audit')) {
    project.phasesCompleted.push('audit');
  }
  project.phase = 'strategy';
  await project.save();

  // History log
  const history = new SeoHistory({
    projectId,
    phase: 'audit',
    event: `Crawl completed — ${urls.length} URLs crawled, ${allIssues.length} issues found. Overall SEO score: ${overallScore}/100.`,
    user: 'AuditService'
  });
  await history.save();

  return { audit, issues: allIssues, score: overallScore };
};
