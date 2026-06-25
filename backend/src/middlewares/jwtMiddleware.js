const jwt = require('jsonwebtoken');

const jwtMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      const error = new Error('Authentication token missing or malformed.');
      error.statusCode = 401;
      throw error;
    }

    if (!process.env.JWT_SECRET) {
      const error = new Error('JWT secret is not configured on the server.');
      error.statusCode = 500;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (!err.statusCode) err.statusCode = 401;
    next(err);
  }
};

module.exports = jwtMiddleware;

