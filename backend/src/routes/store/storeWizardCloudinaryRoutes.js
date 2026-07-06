const express = require('express');

const { upload, uploadStoreTemplateZipToCloudinary } = require('../../controllers/store/storeTemplateController');

const router = express.Router();

// Public endpoint (no JWT middleware) - matches frontend caller.
// POST /api/store/upload-template
router.post(
  '/upload-template',
  upload.single('file'),
  uploadStoreTemplateZipToCloudinary
);

module.exports = router;
