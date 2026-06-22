// Compatibility wrapper to mount website-template upload routes under /website.
const express = require('express');
const router = express.Router();

router.use('/', require('./websiteWizardCloudinaryRoutes'));

module.exports = router;

