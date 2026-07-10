const express = require('express');
const router = express.Router();
const funnelTemplateController = require('../controllers/funnelTemplateController');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(funnelTemplateController.listTemplates));
router.post('/', asyncHandler(funnelTemplateController.createTemplate));
router.post('/save-from-funnel', asyncHandler(funnelTemplateController.saveFromFunnel));

router.get('/:id', asyncHandler(funnelTemplateController.getTemplate));
router.patch('/:id', asyncHandler(funnelTemplateController.updateTemplate));
router.delete('/:id', asyncHandler(funnelTemplateController.deleteTemplate));

module.exports = router;
