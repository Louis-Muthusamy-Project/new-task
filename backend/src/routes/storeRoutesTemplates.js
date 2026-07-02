// Compatibility wrapper to mount store-template upload routes under /store.
const express = require('express');
const router = express.Router();

router.use('/', require('./storeWizardCloudinaryRoutes'));

// POST /api/store/create-from-template — create a Store from a StoreTemplate
// library entry (Choose Template -> Clone Template -> Create Store ->
// Create Default Pages -> Copy Demo Products -> Return Store).
router.use('/', require('./storeRoutes'));

module.exports = router;