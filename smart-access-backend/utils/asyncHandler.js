/**
 * Async Handler Wrapper
 * Wraps async controller functions to catch errors and pass to error middleware
 * Usage: router.post('/route', asyncHandler(controllerFn))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
