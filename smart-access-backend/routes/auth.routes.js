const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { validateRequest } = require("../middleware/validation.middleware");
const { registerUser, loginUser } = require("../controllers/auth.controller");
const Joi = require("joi");

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('user', 'admin', 'moderator').default('user')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Routes
router.post("/register", validateRequest(registerSchema), asyncHandler(registerUser));
router.post("/login", validateRequest(loginSchema), asyncHandler(loginUser));

module.exports = router;

