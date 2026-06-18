exports.checkHealth = (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Backend API is running smoothly.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};
