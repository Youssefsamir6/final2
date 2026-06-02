const Joi = require('joi');

/**
 * Comprehensive Joi validation schemas for all API endpoints
 */

// Common reusable schemas
const idSchema = Joi.string().required().messages({
  'any.required': 'ID is required'
});

const emailSchema = Joi.string().email().required().messages({
  'string.email': 'Invalid email format',
  'any.required': 'Email is required'
});

const passwordSchema = Joi.string().min(8).required().messages({
  'string.min': 'Password must be at least 8 characters',
  'any.required': 'Password is required'
});

// ==================== USER SCHEMAS ====================
const createUserSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  name: Joi.string().required(),
  studentId: Joi.string().optional(),
  role: Joi.string().valid('user', 'admin', 'moderator', 'guard', 'operator').default('user'),
  photoUrl: Joi.string().uri().optional()
});

const updateUserSchema = Joi.object({
  email: emailSchema.optional(),
  name: Joi.string().optional(),
  studentId: Joi.string().optional(),
  role: Joi.string().valid('user', 'admin', 'moderator', 'guard', 'operator').optional(),
  photoUrl: Joi.string().uri().optional()
});

// ==================== LOG SCHEMAS ====================
const getLogsSchema = Joi.object({
  userId: Joi.string().optional(),
  status: Joi.string().valid('authorized', 'denied').optional(),
  method: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  limit: Joi.number().max(1000).optional(),
  skip: Joi.number().optional()
});

// ==================== ALERT SCHEMAS ====================
const getAlertsSchema = Joi.object({
  unread: Joi.boolean().optional(),
  type: Joi.string().optional(),
  severity: Joi.string().valid('Low', 'Medium', 'High').optional(),
  limit: Joi.number().max(1000).optional(),
  skip: Joi.number().optional()
});

const markAlertAsReadSchema = Joi.object({
  id: idSchema
});

// ==================== ANALYTICS SCHEMAS ====================
const getAnalyticsSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  interval: Joi.string().valid('day', 'week', 'month').default('day'),
  groupBy: Joi.string().valid('location', 'status', 'user').optional()
});

// ==================== ACCESS EVENT SCHEMAS ====================
const createAccessEventSchema = Joi.object({
  userId: Joi.string().optional(),
  eventType: Joi.string().required(),
  location: Joi.string().required(),
  timestamp: Joi.date().iso().optional(),
  metadata: Joi.object().optional()
});

const getAccessEventsSchema = Joi.object({
  userId: Joi.string().optional(),
  location: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  limit: Joi.number().max(1000).optional(),
  skip: Joi.number().optional()
});

// ==================== AI SCHEMAS ====================
const recognizePersonSchema = Joi.object({
  image: Joi.string().required(),
  location: Joi.string().required(),
  confidence: Joi.number().min(0).max(100).optional()
});

// ==================== MEMBERS SCHEMAS ====================
const createMemberSchema = Joi.object({
  name: Joi.string().required(),
  email: emailSchema,
  role: Joi.string().required(),
  department: Joi.string().optional(),
  photoUrl: Joi.string().uri().optional()
});

const updateMemberSchema = Joi.object({
  name: Joi.string().optional(),
  email: emailSchema.optional(),
  role: Joi.string().optional(),
  department: Joi.string().optional(),
  photoUrl: Joi.string().uri().optional()
});

// ==================== PEOPLE SCHEMAS ====================
const createPersonSchema = Joi.object({
  name: Joi.string().required(),
  studentId: Joi.string().required(),
  email: emailSchema,
  department: Joi.string().optional(),
  photoUrl: Joi.string().uri().optional(),
  faceData: Joi.array().items(Joi.string()).optional()
});

const updatePersonSchema = Joi.object({
  name: Joi.string().optional(),
  studentId: Joi.string().optional(),
  email: emailSchema.optional(),
  department: Joi.string().optional(),
  photoUrl: Joi.string().uri().optional()
});

// ==================== HISTORY SCHEMAS ====================
const getHistorySchema = Joi.object({
  userId: Joi.string().optional(),
  action: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  limit: Joi.number().max(1000).optional(),
  skip: Joi.number().optional()
});

// Export all schemas
module.exports = {
  // Auth
  createUserSchema,
  updateUserSchema,
  
  // Logs
  getLogsSchema,
  
  // Alerts
  getAlertsSchema,
  markAlertAsReadSchema,
  
  // Analytics
  getAnalyticsSchema,
  
  // Access Events
  createAccessEventSchema,
  getAccessEventsSchema,
  
  // AI
  recognizePersonSchema,
  
  // Members
  createMemberSchema,
  updateMemberSchema,
  
  // People
  createPersonSchema,
  updatePersonSchema,
  
  // History
  getHistorySchema,
  
  // Common
  idSchema
};
