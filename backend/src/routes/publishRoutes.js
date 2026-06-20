const express = require('express');

const publishController = require('../controllers/publishController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Mounted under /api/website-builder
// Expected endpoint:
//   POST /websites/:websiteId/publish

router.post(
  '/websites/:websiteId/publish',
  asyncHandler(publishController.publishWebsite)
);

module.exports = router;

