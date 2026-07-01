const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const asyncHandler = require('../utils/asyncHandler');
// Assuming there might be an auth middleware in the future, we could add it here
// const { protect } = require('../middlewares/auth');

// router.use(protect);

router
  .route('/forms')
  .post(asyncHandler(formController.createForm))
  .get(asyncHandler(formController.getForms));

router
  .route('/forms/templates')
  .get(asyncHandler(formController.getFormTemplates));

// Cross-form submissions list (Submissions tab). Must be declared before
// '/forms/:id' so Express doesn't treat "submissions" as an :id value.
router
  .route('/forms/submissions')
  .get(asyncHandler(formController.getSubmissions));

router
  .route('/forms/:id')
  .get(asyncHandler(formController.getFormById))
  .put(asyncHandler(formController.updateForm))
  .delete(asyncHandler(formController.deleteForm));

router
  .route('/forms/:id/submissions')
  .post(asyncHandler(formController.submitForm))
  .get(asyncHandler(formController.getSubmissionsForForm));

module.exports = router;