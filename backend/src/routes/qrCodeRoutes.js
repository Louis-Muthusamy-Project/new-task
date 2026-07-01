const express = require('express');
const router = express.Router();
const qrCodeController = require('../controllers/qrCodeController');
const asyncHandler = require('../utils/asyncHandler');

router.route('/qrcodes')
  .get(asyncHandler(qrCodeController.listQRCodes))
  .post(asyncHandler(qrCodeController.createQRCode));

router.route('/qrcodes/:id')
  .delete(asyncHandler(qrCodeController.deleteQRCode));

module.exports = router;
