const express = require('express');
const router = express.Router();

// Minimal templates endpoint to satisfy frontend websiteWizardApi.listTemplates.
// If templates are stored elsewhere, wire it here.
const WebsiteTemplate = require('../models/WebsiteTemplate');
const asyncHandler = require('../utils/asyncHandler');

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const templates = await WebsiteTemplate.find({ isActive: true }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      data: templates,
    });
  })
);

module.exports = router;

