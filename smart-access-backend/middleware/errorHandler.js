/**
 * Global Error Handler Middleware
 * Place this AFTER all other middleware/routes
 */

const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Default error values
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error
  console.error(`[ERROR] ${status} - ${message}`);
  if (isDevelopment) {
    console.error('Stack:', err.stack);
  }

  // Send response
  res.status(status).json({
    success: false,
    error: {
      message,
      ...(isDevelopment && { stack: err.stack, details: err })
    }
  });
};

/**
 * Custom AppError class for predictable errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  AppError
};
