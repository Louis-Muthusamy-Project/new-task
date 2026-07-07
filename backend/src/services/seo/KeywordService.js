const https = require('https');
const { SeoKeyword, SeoCompetitor } = require('../../models');

const DATAFORSEO_USER = process.env.DATAFORSEO_USER;
const DATAFORSEO_PASS = process.env.DATAFORSEO_PASS;

/**
 * Make a DataForSEO REST API request.
 * Falls back to returning null if credentials are not configured — fail-soft.
 */
function dfsRequest(path, body) {
  if (!DATAFORSEO_USER || !DATAFORSEO_PASS) {
    console.warn('[KeywordService] DataForSEO credentials not configured. Set DATAFORSEO_USER and DATAFORSEO_PASS in .env. Returning mock data.');
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${DATAFORSEO_USER}:${DATAFORSEO_PASS}`).toString('base64');
    const bodyStr = JSON.stringify(body);

    const options = {
      hostname: 'api.dataforseo.com',
      path,
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(null); }
      });
    });
    req.on('error', (e) => { console.error('[KeywordService]', e); resolve(null); });
    req.write(bodyStr);
    req.end();
  });
}

/**
 * Generate mock keyword data — used when DataForSEO is not configured.
 */
function mockKeywordMetrics(keyword) {
  const volumes = [1200, 2800, 5400, 8800, 15000, 22000, 4100, 900];
  const difficulties = ['Low', 'Medium', 'High'];
  const intents = ['Informational', 'Commercial', 'Transactional', 'Navigational'];
  return {
    keyword,
    volume: volumes[Math.floor(Math.random() * volumes.length)],
    cpc: parseFloat((Math.random() * 3).toFixed(2)),
    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    position: Math.floor(Math.random() * 60) + 1,
    intent: intents[Math.floor(Math.random() * intents.length)]
  };
}

/**
 * Refresh keyword rank positions for a project.
 * Pulls live data from DataForSEO or generates mock data.
 */
exports.refreshRanks = async (project) => {
  const keywords = await SeoKeyword.find({ projectId: project._id });
  const updated = [];
  const locationCode = project.targets?.locationCode || 2840;
  const languageCode = project.targets?.languageCode || 'en';

  for (const kwDoc of keywords) {
    let metrics = null;

    const response = await dfsRequest('/v3/keywords_data/google_ads/search_volume/live', [
      {
        keywords: [kwDoc.keyword],
        location_code: locationCode,
        language_code: languageCode
      }
    ]);

    if (response && response.tasks && response.tasks[0] && response.tasks[0].result) {
      const item = response.tasks[0].result[0];
      metrics = {
        volume: item.search_volume || 0,
        cpc: item.cpc || 0,
        competition: item.competition
      };
    } else {
      metrics = mockKeywordMetrics(kwDoc.keyword);
    }

    kwDoc.previousPosition = kwDoc.position;
    kwDoc.position = metrics.position || kwDoc.position;
    kwDoc.volume = metrics.volume;
    kwDoc.cpc = metrics.cpc;
    kwDoc.difficulty = metrics.difficulty || kwDoc.difficulty;
    kwDoc.history.push({ date: new Date(), position: kwDoc.position, volume: kwDoc.volume });
    await kwDoc.save();
    updated.push(kwDoc);
  }

  return updated;
};

/**
 * Discover top organic competitors for a project's site URL.
 * Uses DataForSEO Labs Competitors Domain or falls back to mock.
 */
exports.discoverCompetitors = async (project) => {
  const { siteUrl, _id: projectId } = project;
  const domain = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const locationCode = project.targets?.locationCode || 2840;
  const languageCode = project.targets?.languageCode || 'en';

  const response = await dfsRequest('/v3/dataforseo_labs/google/competitors_domain/live', [
    {
      target: domain,
      location_code: locationCode,
      language_code: languageCode,
      limit: 10
    }
  ]);

  const competitors = [];

  if (response && response.tasks && response.tasks[0] && response.tasks[0].result) {
    const items = response.tasks[0].result[0]?.items || [];
    for (const item of items) {
      try {
        const comp = new SeoCompetitor({
          projectId,
          domain: item.domain || 'unknown',
          name: item.domain || 'unknown',
          organicTraffic: item.metrics?.organic?.etv || 0,
          sharedKeywordsCount: item.intersections || 0,
          authorityScore: item.domain_rank || 0
        });
        await comp.save();
        competitors.push(comp);
      } catch (err) {
        if (err.code !== 11000) console.error('[KeywordService] Competitor save error:', err);
      }
    }
  } else {
    // Mock competitors
    const mockDomains = ['competitor1.com', 'competitor2.com', 'topsite.com'];
    for (const d of mockDomains) {
      try {
        const comp = new SeoCompetitor({
          projectId,
          domain: d,
          name: d,
          organicTraffic: Math.floor(Math.random() * 50000),
          sharedKeywordsCount: Math.floor(Math.random() * 200),
          authorityScore: Math.floor(Math.random() * 80) + 20
        });
        await comp.save();
        competitors.push(comp);
      } catch (err) {
        if (err.code !== 11000) console.error('[KeywordService]', err);
      }
    }
  }

  return competitors;
};

/**
 * Get keyword difficulty and volume metrics for a list of keywords (batch).
 */
exports.getKeywordMetrics = async (keywords, locationCode = 2840, languageCode = 'en') => {
  const response = await dfsRequest('/v3/keywords_data/google_ads/search_volume/live', [
    { keywords, location_code: locationCode, language_code: languageCode }
  ]);

  if (response && response.tasks && response.tasks[0] && response.tasks[0].result) {
    return response.tasks[0].result;
  }

  // Fallback mock
  return keywords.map(kw => mockKeywordMetrics(kw));
};
