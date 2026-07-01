const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');


router.use('/health', healthRoutes);

// Mount routes
router.use('/website-builder', require('./websiteRoutes'));
router.use('/website-builder', require('./pageRoutes'));
router.use('/website-builder', require('./mediaRoutes'));
router.use('/website-builder', require('./publishRoutes'));
router.use('/website-builder', require('./formRoutes'));
router.use('/website-builder', require('./domainRoutes'));
router.use('/website-builder', require('./blogRoutes'));

// Templates endpoint used by WebsiteTemplatePage.jsx
router.use('/templates', require('./templatesRoutes'));

// Website template ZIP upload used by websiteWizardCloudinaryApi.js
router.use('/website', require('./websiteRoutesTemplates'));

module.exports = router;







