const express = require('express');
const multer = require('multer');

const mediaController = require('../controllers/mediaController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Mounted under /api/website-builder
// POST /media/upload  (field name: file)
// GET  /media         (list)
// GET  /media/:id
// DELETE /media/:id

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.post(
  '/media/upload',
  upload.single('file'),
  asyncHandler(mediaController.uploadMedia)
);

router.get('/media', asyncHandler(mediaController.getMediaList));

router.get('/media/:id', asyncHandler(mediaController.getMediaById));

router.delete('/media/:id', asyncHandler(mediaController.deleteMedia));

module.exports = router;

