const { verifyAccessToken } = require('../utils/tokenService');
const { ApiError } = require('../utils/apiResponse');

/**
 * Requires a valid access token. Populates req.user = { id, role, email }.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    return next();
  } catch (err) {
    return next(ApiError.unauthorized('Invalid or expired access token'));
  }
}

/**
 * Like requireAuth, but does not fail if no token is present (req.user stays undefined).
 * Useful for routes that behave differently for logged-in vs anonymous users.
 */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
  } catch (err) {
    // ignore invalid token in optional mode
  }
  return next();
}

module.exports = { requireAuth, optionalAuth };
