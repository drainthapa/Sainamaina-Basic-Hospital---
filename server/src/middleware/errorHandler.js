const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.isApiError ? err.statusCode : err.statusCode || 500;
  const message = err.isApiError ? err.message : 'Internal server error';

  if (statusCode >= 500) {
    logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });
  } else {
    logger.warn(`${statusCode} ${err.message}`, { path: req.path, method: req.method });
  }

  const body = { success: false, message };
  if (err.details) body.errors = err.details;
  if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFoundHandler };
