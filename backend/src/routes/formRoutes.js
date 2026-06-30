const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
// Assuming there might be an auth middleware in the future, we could add it here
// const { protect } = require('../middlewares/auth');

// router.use(protect);

router
  .route('/forms')
  .post(formController.createForm)
  .get(formController.getForms);

router
  .route('/forms/:id')
  .get(formController.getFormById)
  .put(formController.updateForm)
  .delete(formController.deleteForm);

module.exports = router;
