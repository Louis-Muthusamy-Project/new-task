const express = require("express");
const router = express.Router();

const websiteController = require("../controllers/websiteController");
const asyncHandler = require("../utils/asyncHandler");

// NOTE: This project currently does NOT list `express-validator` as a dependency.
// To keep the backend running, these routes intentionally skip request validators.
// Controllers still perform essential id validation via mongoose.Types.ObjectId.

// GET /api/website-builder/websites
router.get("/websites", asyncHandler(websiteController.getWebsites));

// POST /api/website-builder/websites
router.post("/websites", asyncHandler(websiteController.createWebsite));

// GET /api/website-builder/websites/:id
router.get("/websites/:id", asyncHandler(websiteController.getWebsiteById));

// PATCH /api/website-builder/websites/:id
router.patch("/websites/:id", asyncHandler(websiteController.updateWebsite));

// DELETE /api/website-builder/websites/:id
router.delete("/websites/:id", asyncHandler(websiteController.deleteWebsite));

// GET /api/website-builder/websites/:id/preview
router.get("/websites/:id/preview", asyncHandler(websiteController.previewWebsite));

// POST /api/website-builder/websites/:id/duplicate
router.post("/websites/:id/duplicate", asyncHandler(websiteController.duplicateWebsite));

module.exports = router;

