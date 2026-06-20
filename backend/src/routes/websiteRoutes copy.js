const express = require('express');
const { body, param, query } = require('express-validator');

const jwtMiddleware = require('../middlewares/jwtMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const asyncHandler = require('../utils/asyncHandler');

const websiteController = require('../controllers/websiteController');

const router = express.Router();

// All website routes require an authenticated user.
router.use(jwtMiddleware);

/**
 * POST /api/website-builder/websites
 * Create a new website.
 */
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Website name is required.')
      .isLength({ max: 150 })
      .withMessage('Website name must be 150 characters or fewer.'),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Description must be 1000 characters or fewer.'),
    body('status')
      .optional()
      .isIn(['Draft', 'Published'])
      .withMessage('Status must be either "Draft" or "Published".'),
    body('faviconUrl').optional().isURL().withMessage('Favicon URL must be a valid URL.'),
    body('tracking').optional().isObject().withMessage('Tracking must be an object.'),
    body('templateId').optional().isMongoId().withMessage('templateId must be a valid id.'),
    body('folderId').optional().isMongoId().withMessage('folderId must be a valid id.'),
  ],
  validateRequest,
  asyncHandler(websiteController.createWebsite)
);

/**
 * GET /api/website-builder/websites
 * List websites owned by the authenticated user/team.
 */
router.get(
  '/',
  [
    query('status')
      .optional()
      .isIn(['Draft', 'Published'])
      .withMessage('Status must be either "Draft" or "Published".'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit must be between 1 and 100.'),
  ],
  validateRequest,
  asyncHandler(websiteController.getWebsites)
);

/**
 * GET /api/website-builder/websites/:id
 * Fetch a single website by id.
 */
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid website id.')],
  validateRequest,
  asyncHandler(websiteController.getWebsiteById)
);

/**
 * PATCH /api/website-builder/websites/:id
 * Update a website.
 */
router.patch(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid website id.'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Website name cannot be empty.')
      .isLength({ max: 150 })
      .withMessage('Website name must be 150 characters or fewer.'),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Description must be 1000 characters or fewer.'),
    body('status')
      .optional()
      .isIn(['Draft', 'Published'])
      .withMessage('Status must be either "Draft" or "Published".'),
    body('faviconUrl').optional().isURL().withMessage('Favicon URL must be a valid URL.'),
    body('tracking').optional().isObject().withMessage('Tracking must be an object.'),
    body('chatWidgetId').optional().isMongoId().withMessage('chatWidgetId must be a valid id.'),
    body('domainId').optional().isMongoId().withMessage('domainId must be a valid id.'),
    body('templateId').optional().isMongoId().withMessage('templateId must be a valid id.'),
    body('folderId').optional().isMongoId().withMessage('folderId must be a valid id.'),
  ],
  validateRequest,
  asyncHandler(websiteController.updateWebsite)
);

/**
 * DELETE /api/website-builder/websites/:id
 * Soft-delete a website.
 */
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid website id.')],
  validateRequest,
  asyncHandler(websiteController.deleteWebsite)
);

module.exports = router;
