const { validationResult } = require('express-validator');


const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.details = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return next(error);
  }
  next();
};

module.exports = validateRequest;
