const Joi = require('joi');

/**
 * Validation schemas using Joi
 */

const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'Password is required'
    }),
    role: Joi.string().valid('user', 'admin', 'moderator').default('user')
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  })
};

/**
 * Validation middleware factory
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const messages = error.details.map(detail => detail.message);
    return res.status(400).json({
      error: 'Validation failed',
      details: messages
    });
  }

  req.body = value;
  next();
};

module.exports = {
  authSchemas,
  validate
};
