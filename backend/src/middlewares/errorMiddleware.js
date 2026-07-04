// Multer throws plain `MulterError`s (err.name === 'MulterError') without a
// `statusCode`, which previously fell through to a generic 500 here — e.g.
// a too-large ZIP upload on /api/wordpress-import/upload or
// /api/store-templates reported as an opaque server error instead of the
// client-fixable 413/400 it actually is. Map the common codes explicitly.
const MULTER_STATUS_BY_CODE = {
  LIMIT_FILE_SIZE: 413,
  LIMIT_UNEXPECTED_FILE: 400,
  LIMIT_FILE_COUNT: 400,
  LIMIT_FIELD_COUNT: 400,
};

const MULTER_MESSAGE_BY_CODE = {
  LIMIT_FILE_SIZE: 'File is too large.',
};

const errorMiddleware = (err, req, res, next) => {
  console.error('[errorMiddleware] request:', {
    method: req?.method,
    path: req?.originalUrl,
    body: req?.body,
  });
  console.error('[errorMiddleware] err.stack:', err?.stack);

  const isMulterError = err?.name === 'MulterError';
  const statusCode =
    err?.statusCode ||
    (isMulterError && MULTER_STATUS_BY_CODE[err.code]) ||
    500;
  const message =
    (isMulterError && MULTER_MESSAGE_BY_CODE[err.code]) ||
    err?.message ||
    'Internal Server Error';

  // Cloudinary/multer commonly throw without statusCode.
  // Provide extra details only in development.
  res.status(statusCode).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === 'development' ? {
      name: err?.name,
      code: err?.code,
      stack: err?.stack,
    } : undefined,
  });
};

module.exports = errorMiddleware;