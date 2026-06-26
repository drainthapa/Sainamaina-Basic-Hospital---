/**
 * Wraps an async route handler so thrown errors / rejected promises are passed to next().
 * Usage: router.get('/x', asyncHandler(async (req, res) => { ... }))
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
