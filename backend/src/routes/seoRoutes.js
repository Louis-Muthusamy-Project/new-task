const express = require('express');
const router = express.Router();
const projectController = require('../controllers/seo/projectController');
const auditController = require('../controllers/seo/auditController');
const keywordController = require('../controllers/seo/keywordController');
const strategyController = require('../controllers/seo/strategyController');

// Projects CRUD
router.post('/projects', projectController.createProject);
router.get('/projects', projectController.getProjects);
router.get('/projects/:slug', projectController.getProjectBySlug);
router.put('/projects/:slug', projectController.updateProject);
router.delete('/projects/:slug', projectController.deleteProject);

// Crawl & Audits
router.post('/projects/:slug/audit', auditController.triggerAudit);
router.get('/projects/:slug/audits', auditController.getAudits);
router.get('/projects/:slug/issues', auditController.getIssues);
router.put('/issues/:id', auditController.updateIssueStatus);

// Keywords & Competitors
router.post('/projects/:slug/keywords', keywordController.addKeywords);
router.get('/projects/:slug/keywords', keywordController.getKeywords);
router.delete('/keywords/:id', keywordController.deleteKeyword);
router.post('/projects/:slug/keywords/refresh', keywordController.refreshKeywordRanks);
router.get('/projects/:slug/competitors', keywordController.getCompetitors);

// Strategy & Approval Gate 1
router.post('/projects/:slug/strategy', strategyController.generateStrategy);
router.get('/projects/:slug/strategy', strategyController.getStrategy);
router.post('/projects/:slug/strategy/submit', strategyController.submitStrategy);
router.post('/projects/:slug/strategy/approve', strategyController.approveStrategy);
router.post('/projects/:slug/strategy/reject', strategyController.rejectStrategy);

// Content Workspaces
router.get('/projects/:slug/drafts', strategyController.getDrafts);
router.post('/projects/:slug/drafts', strategyController.createDraft);
router.put('/drafts/:id', strategyController.updateDraft);
router.post('/drafts/:id/humanize', strategyController.humanizeDraft);

module.exports = router;
