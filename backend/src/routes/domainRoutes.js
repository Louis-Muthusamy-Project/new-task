const express = require('express');

const domainController = require('../controllers/domainController');
const asyncHandler = require('../utils/asyncHandler');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

const router = express.Router();

router.post(
  '/websites/:websiteId/domains',
  jwtMiddleware,
  asyncHandler(domainController.createDomain)
);

router.get(
  '/websites/:websiteId/domains',
  jwtMiddleware,
  asyncHandler(domainController.getDomainsByWebsite)
);

router.delete(
  '/domains/:id',
  jwtMiddleware,
  asyncHandler(domainController.deleteDomain)
);

module.exports = router;

