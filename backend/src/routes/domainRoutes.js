const express = require('express');

const domainController = require('../controllers/domainController');
const asyncHandler = require('../utils/asyncHandler');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

const router = express.Router();


router.use(jwtMiddleware);

router.post(
  '/websites/:websiteId/domains',
  asyncHandler(domainController.createDomain)
);

router.get(
  '/websites/:websiteId/domains',
  asyncHandler(domainController.getDomainsByWebsite)
);

router.delete(
  '/domains/:id',
  asyncHandler(domainController.deleteDomain)
);

module.exports = router;

