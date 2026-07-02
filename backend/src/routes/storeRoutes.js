const express = require('express');
const router = express.Router();

const { createStoreFromTemplate } = require('../controllers/storeController');

// POST /api/store/create-from-template
// Body: { templateId, storeName, currency, status, installDemo, description }
// Flow: Choose Template -> Clone Template -> Create Store ->
//       Create Default Pages -> Copy Demo Products -> Return Store
router.post('/create-from-template', createStoreFromTemplate);

module.exports = router;
