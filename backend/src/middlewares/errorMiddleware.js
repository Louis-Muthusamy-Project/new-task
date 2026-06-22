const errorMiddleware = (err, req, res, next) => {
  console.error('[errorMiddleware] request:', {
    method: req?.method,
    path: req?.originalUrl,
    body: req?.body,
  });
  console.error('[errorMiddleware] err.stack:', err?.stack);

  const statusCode = err?.statusCode || 500;
  const message = err?.message || 'Internal Server Error';

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

