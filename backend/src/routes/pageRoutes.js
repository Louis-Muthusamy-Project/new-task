const express = require('express');

const pageController = require('../controllers/pageController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Mounted under /api/website-builder
// Base paths expected by frontend:
//   /websites/:websiteId/pages
//   /pages/:id

router.post(
  '/websites/:websiteId/pages',
  asyncHandler(pageController.createPage)
);

router.get(
  '/websites/:websiteId/pages',
  asyncHandler(pageController.getPagesByWebsite)
);

router.get(
  '/pages/:id',
  asyncHandler(pageController.getPageById)
);

router.put(
  '/pages/:id',
  asyncHandler(pageController.updatePage)
);

router.delete(
  '/pages/:id',
  asyncHandler(pageController.deletePage)
);

module.exports = router;

