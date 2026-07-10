const express = require('express');
const router = express.Router();
const funnelController = require('../controllers/funnelController');
const funnelStepController = require('../controllers/funnelStepController');
const funnelContactController = require('../controllers/funnelContactController');
const funnelPublishController = require('../controllers/funnelPublishController');
const funnelAnalyticsController = require('../controllers/funnelAnalyticsController');
const asyncHandler = require('../utils/asyncHandler');

// ── Funnels CRUD ─────────────────────────────────────────────────────────────
router.get('/', asyncHandler(funnelController.getFunnels));
router.post('/', asyncHandler(funnelController.createFunnel));
router.get('/:id', asyncHandler(funnelController.getFunnelById));
router.patch('/:id', asyncHandler(funnelController.updateFunnel));
router.delete('/:id', asyncHandler(funnelController.deleteFunnel));
router.post('/:id/duplicate', asyncHandler(funnelController.duplicateFunnel));
router.get('/:id/preview', asyncHandler(funnelController.previewFunnel));

// ── Steps CRUD ────────────────────────────────────────────────────────────────
router.post('/:funnelId/steps', asyncHandler(funnelStepController.createStep));
router.get('/:funnelId/steps', asyncHandler(funnelStepController.listSteps));
router.post('/:funnelId/steps/reorder', asyncHandler(funnelStepController.reorderSteps));

// Direct Step Access
router.get('/steps/:id', asyncHandler(funnelStepController.getStep));
router.put('/steps/:id', asyncHandler(funnelStepController.updateStep));
router.delete('/steps/:id', asyncHandler(funnelStepController.deleteStep));

// ── Contacts ──────────────────────────────────────────────────────────────────
// Public contact submission
router.post('/:funnelId/steps/:stepId/contacts', asyncHandler(funnelContactController.submitContact));
// Admin list contacts
router.get('/:funnelId/contacts', asyncHandler(funnelContactController.listContacts));

// Direct Contact Access
router.get('/contacts/:id', asyncHandler(funnelContactController.getContact));
router.delete('/contacts/:id', asyncHandler(funnelContactController.deleteContact));

// ── Publish ───────────────────────────────────────────────────────────────────
router.post('/:funnelId/publish', asyncHandler(funnelPublishController.publishFunnel));

// ── Analytics ─────────────────────────────────────────────────────────────────
router.get('/:funnelId/analytics', asyncHandler(funnelAnalyticsController.getFunnelAnalytics));
router.post('/:funnelId/steps/:stepId/events', asyncHandler(funnelAnalyticsController.trackEvent));

module.exports = router;
