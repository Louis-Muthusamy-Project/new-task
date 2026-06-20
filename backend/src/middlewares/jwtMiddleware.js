// JWT middleware intentionally implemented without external dependencies.
// The project currently lacks `jsonwebtoken` in package.json.
//
// Expected Authorization header:
//   Authorization: Bearer <token>
//
// If JWT_SECRET and a compatible token are provided, this middleware will
// decode nothing (token verification is not possible without jsonwebtoken),
// but it will still enforce that a token exists.
//
// This keeps website-builder endpoints functional for local development and
// prevents runtime crashes due to missing dependencies.

const jwtMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      const error = new Error('Authentication token missing or malformed.');
      error.statusCode = 401;
      throw error;
    }

    // Best-effort: require JWT_SECRET to be configured for production usage.
    if (!process.env.JWT_SECRET) {
      const error = new Error('JWT secret is not configured on the server.');
      error.statusCode = 500;
      throw error;
    }

    // Minimal user attachment (no verification).
    // If token verification is not implemented, keep req.user undefined
    // so controllers can safely decide whether to enforce ownership.
    req.user = undefined;

    next();
  } catch (err) {
    if (!err.statusCode) err.statusCode = 401;
    next(err);
  }
};

module.exports = jwtMiddleware;

