const mongoose = require('mongoose');
const storePublishService = require('../../services/storePublishService');

const notFoundError = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

const invalidIdError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

/**
 * POST /api/store/:id/publish
 * Runs the publish flow for a store (Generate Build -> Upload Assets ->
 * Save -> Live URL) and returns the resulting publish URL. Store-module
 * counterpart of publishController.publishWebsite.
 */
exports.publishStore = async (req, res) => {
  const { id } = req.params;
  const triggeredBy = req?.user?.id || req?.user?._id || null;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError('Invalid store id.');
  }

  try {
    const { publishUrl } = await storePublishService.publishStore(id, triggeredBy, req);
    res.status(200).json({ success: true, publishUrl });
  } catch (err) {
    if (err?.message === 'Store not found.') {
      throw notFoundError('Store not found.');
    }
    throw err;
  }
};
