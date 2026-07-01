const express = require('express');
const router = express.Router();
const chatWidgetController = require('../controllers/chatWidgetController');
const asyncHandler = require('../utils/asyncHandler');

router
  .route('/chat-widgets')
  .post(asyncHandler(chatWidgetController.createChatWidget))
  .get(asyncHandler(chatWidgetController.getChatWidgets));

router
  .route('/chat-widgets/:id')
  .get(asyncHandler(chatWidgetController.getChatWidgetById))
  .put(asyncHandler(chatWidgetController.updateChatWidget))
  .delete(asyncHandler(chatWidgetController.deleteChatWidget));

module.exports = router;
