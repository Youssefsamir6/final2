require('dotenv').config();
const Joi = require('joi');

/**
 * Environment Configuration with Validation
 * All env vars validated on startup
 */

const envSchema = Joi.object({
  // Server
  NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
  PORT: Joi.number().default(5000),

  // Database
  DB_SERVER: Joi.string().required().messages({
    'any.required': 'DB_SERVER is required (e.g., localhost or 192.168.1.100)'
  }),
  DB_NAME: Joi.string().default('smart_access_system'),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_PORT: Joi.number().default(1433),
  DB_ENCRYPT: Joi.boolean().default(true),
  DB_TRUST_SERVER_CERTIFICATE: Joi.boolean().default(process.env.NODE_ENV !== 'production'),

  // Use Mock DB (for testing/dev without SQL Server)
  USE_MOCK_DB: Joi.boolean().default(false),

  // JWT
  JWT_SECRET: Joi.string().min(32).required().messages({
    'any.required': 'JWT_SECRET is required (min 32 chars)',
    'string.min': 'JWT_SECRET must be at least 32 characters'
  }),
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  // Security
CORS_ORIGIN: Joi.string().default('*'),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000), // 15 min
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  // AI
  OPENAI_API_KEY: Joi.string(),
  
  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),

  // Sentry Error Tracking
  // In development, allow an empty string (SENTRY_DSN=) without crashing startup.
  SENTRY_DSN: Joi.alternatives().try(
    Joi.string().uri(),
    Joi.string().valid('')
  ).optional(),
  SENTRY_TRACES_SAMPLE_RATE: Joi.number().min(0).max(1).default(1.0),


  // Frontend
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000')
}).unknown(true); // Allow other env vars

const { value: envVars, error } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

module.exports = {
  app: {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    frontendUrl: envVars.FRONTEND_URL
  },
  db: {
    server: envVars.DB_SERVER,
    name: envVars.DB_NAME,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    port: envVars.DB_PORT,
    encrypt: envVars.DB_ENCRYPT,
    trustServerCertificate: envVars.DB_TRUST_SERVER_CERTIFICATE,
    useMockDB: envVars.USE_MOCK_DB
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN
  },
  security: {
    corsOrigin: envVars.CORS_ORIGIN,
    rateLimitWindowMs: envVars.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: envVars.RATE_LIMIT_MAX_REQUESTS
  },
  ai: {
    openaiApiKey: envVars.OPENAI_API_KEY
  },
  logging: {
    level: envVars.LOG_LEVEL
  },
  sentry: {
    dsn: envVars.SENTRY_DSN,
    tracesSampleRate: envVars.SENTRY_TRACES_SAMPLE_RATE
  }
};
