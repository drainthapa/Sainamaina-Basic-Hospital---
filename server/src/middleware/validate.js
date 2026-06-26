const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/apiResponse');

/**
 * Place after a list of express-validator chains to short-circuit with a 400 on failure.
 * Usage: router.post('/x', [body('email').isEmail()], validate, handler)
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  return next(ApiError.badRequest('Validation failed', formatted));
}

module.exports = validate;
