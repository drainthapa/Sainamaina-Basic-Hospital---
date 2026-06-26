const { ApiError } = require('../utils/apiResponse');

/**
 * Restrict a route to one or more roles. Must be used after requireAuth.
 * Usage: router.post('/x', requireAuth, requireRole('super_admin', 'hospital_administrator'), handler)
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`This action requires one of these roles: ${allowedRoles.join(', ')}`));
    }
    return next();
  };
}

module.exports = { requireRole };
