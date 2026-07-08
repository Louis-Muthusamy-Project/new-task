const express = require('express');
const router = express.Router();

const storeThemeController = require('../../controllers/store/storeThemeController');
const asyncHandler = require('../../utils/asyncHandler');

// Mounted under /api/store
// Admin Theme tokens (colors/fonts/layout/custom) used by the Theme tab in
// StoresTab.jsx. Backed by Store Engine's Theme Service — see
// services/store/themeService.js.

router.get('/:storeId/admin/theme', asyncHandler(storeThemeController.getTheme));
router.patch('/:storeId/admin/theme', asyncHandler(storeThemeController.updateTheme));

module.exports = router;
