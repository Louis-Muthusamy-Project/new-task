const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');

// Mount routes
router.use('/health', healthRoutes);

module.exports = router;
