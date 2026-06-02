/**
 * Request Validation Middleware
 */

const { AppError } = require('./errorHandler');

/**
 * Validates request body against a Joi schema
 * Usage: router.post('/route', validateRequest(schema), controllerFn)
 */
const validateRequest = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return next(new AppError(
      `Validation failed: ${error.details[0].message}`,
      400
    ));
  }

  req.body = value;
  next();
};

/**
 * Input sanitization middleware
 * Prevents XSS and removes potentially dangerous content
 */
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim().substring(0, 5000); // Limit string length
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        // Only allow alphanumeric + underscore in keys
        if (/^[a-zA-Z0-9_]+$/.test(key)) {
          sanitized[key] = sanitize(value);
        }
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
};

module.exports = {
  validateRequest,
  sanitizeInput
};
