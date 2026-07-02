const express = require('express');
const router = express.Router();

const emailController = require('../controllers/emailController');
const asyncHandler = require('../utils/asyncHandler');

// Mounted under /api/store
// Admin Email sender config (SMTP, sender identity, per-event templates —
// Order Mail, Welcome Mail, etc.) used by the Email sender tab in
// StoresTab.jsx. One StoreEmailSettings document per store.

router.get('/:storeId/admin/email', asyncHandler(emailController.getEmailSettings));
router.patch('/:storeId/admin/email/sender', asyncHandler(emailController.updateSender));
router.patch('/:storeId/admin/email/smtp', asyncHandler(emailController.updateSmtp));
router.patch('/:storeId/admin/email/templates/:type', asyncHandler(emailController.updateTemplate));

module.exports = router;
