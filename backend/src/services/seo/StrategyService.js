const { SeoStrategy, SeoKeyword, SeoAudit, SeoIssue, SeoHistory } = require('../../models');
const aiService = require('./AIService');

/**
 * Build and persist a complete SEO strategy from audit results and keyword data.
 */
exports.createStrategy = async (project) => {
  const { _id: projectId, targets, siteUrl } = project;

  // Gather context data
  const [latestAudit, issues, keywords] = await Promise.all([
    SeoAudit.findOne({ projectId }).sort({ createdAt: -1 }),
    SeoIssue.find({ projectId, status: 'open', severity: { $in: ['critical', 'warning'] } }).limit(20),
    SeoKeyword.find({ projectId }).sort({ volume: -1 }).limit(30)
  ]);

  const issueList = issues.map(i => `- [${i.severity.toUpperCase()}] ${i.title} (${i.url})`).join('\n');
  const keywordList = keywords.map(k => `- "${k.keyword}" | Volume: ${k.volume} | Difficulty: ${k.difficulty} | Intent: ${k.intent}`).join('\n');

  const systemPrompt = `You are an expert SEO strategist. Analyse the provided website SEO audit data and keyword research, then produce a structured JSON strategy. Output ONLY a JSON object exactly matching the schema below — no markdown fences, no extra keys.\n\nSchema:\n{\n  "contentPlan": [ { "pageUrl": "string", "keyword": "string", "priority": "High|Medium|Low", "action": "optimize|create" } ],\n  "roadmapItems": [ { "title": "string", "description": "string", "impact": "High|Medium|Low", "difficulty": "Easy|Medium|Hard" } ],\n  "roiGoals": [ "string" ]\n}`;

  const prompt = `Website: ${siteUrl}\nGoals: ${(targets?.goals || []).join(', ') || 'Grow organic traffic'}\nTarget Keywords: ${(targets?.primaryKeywords || []).join(', ') || 'Not specified'}\n\nSEO Audit Overall Score: ${latestAudit ? latestAudit.scores.overall : 'Not yet audited'}/100\nURLs Crawled: ${latestAudit ? latestAudit.urlsCrawledCount : 0}\n\nTop Issues:\n${issueList || '- No issues found yet'}\n\nKeyword Research:\n${keywordList || '- No keywords tracked yet'}\n\nBased on this data, produce a comprehensive content plan with up to 10 page optimisation items, a prioritised roadmap of up to 15 technical + content tasks, and 3-5 ROI goals.`;

  const aiResult = await aiService.generateJSON(prompt, systemPrompt, 'gemini');

  let contentPlan = [];
  let roadmapItems = [];
  let roiGoals = ['Increase organic traffic by 30%', 'Improve SEO health score to 90+', 'Rank top-10 for 5 primary keywords'];

  if (aiResult) {
    contentPlan = (aiResult.contentPlan || []).slice(0, 10);
    roadmapItems = (aiResult.roadmapItems || []).slice(0, 15);
    roiGoals = aiResult.roiGoals || roiGoals;
  } else {
    // Fallback: build from keywords and issues data when AI is not available
    keywords.slice(0, 5).forEach((kw) => {
      contentPlan.push({
        pageUrl: `${siteUrl}/${kw.keyword.toLowerCase().replace(/\s+/g, '-')}`,
        keyword: kw.keyword,
        priority: kw.volume > 5000 ? 'High' : kw.volume > 1000 ? 'Medium' : 'Low',
        action: 'optimize'
      });
    });

    issues.slice(0, 10).forEach((issue) => {
      roadmapItems.push({
        title: issue.title,
        description: issue.description || `Fix ${issue.type} across affected pages.`,
        impact: issue.severity === 'critical' ? 'High' : 'Medium',
        difficulty: 'Medium',
        status: 'Todo'
      });
    });
  }

  // Delete old draft strategy if one exists
  await SeoStrategy.deleteOne({ projectId, status: 'draft' });

  const strategy = new SeoStrategy({
    projectId,
    status: 'draft',
    contentPlan,
    roadmapItems,
    roiGoals
  });
  await strategy.save();

  // Update project phase
  if (!project.phasesCompleted.includes('strategy')) {
    project.phasesCompleted.push('strategy');
  }
  project.phase = 'strategy';
  await project.save();

  // History log
  await new SeoHistory({
    projectId,
    phase: 'strategy',
    event: `Strategy generated with ${contentPlan.length} content plan items and ${roadmapItems.length} roadmap tasks.`,
    user: 'StrategyService'
  }).save();

  return strategy;
};
