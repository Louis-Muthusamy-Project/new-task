const express = require('express');

const storePageController = require('../controllers/storePageController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Mounted under /api/store
// Base path expected by frontend:
//   /store/pages/:id

router.get(
  '/pages/:id',
  asyncHandler(storePageController.getStorePageById)
);

router.put(
  '/pages/:id',
  asyncHandler(storePageController.updateStorePage)
);

module.exports = router;
