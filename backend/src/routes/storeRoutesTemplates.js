// Compatibility wrapper to mount store-template upload routes under /store.
const express = require('express');
const router = express.Router();

router.use('/', require('./storeWizardCloudinaryRoutes'));

module.exports = router;
