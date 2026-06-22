const express = require('express');

const { upload, uploadTemplateZipToCloudinary } = require('../controllers/websiteTemplateController');

const router = express.Router();

// Public endpoint (no JWT middleware) - matches frontend caller.
// POST /api/website/upload-template
router.post(
  '/upload-template',
  upload.single('file'),
  uploadTemplateZipToCloudinary
);

module.exports = router;

