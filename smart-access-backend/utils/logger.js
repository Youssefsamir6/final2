const winston = require('winston');
const path = require('path');
const config = require('../config/env');

/**
 * Winston Structured Logger
 * Provides consistent, parseable logging with multiple transports
 */

// Define log levels
const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5
  },
  colors: {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    trace: 'gray'
  }
};

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
const fs = require('fs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Console transport format
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ colors: customLevels.colors }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// File transport format (JSON for parsing)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  levels: customLevels.levels,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
      level: config.logging.level || 'info'
    }),

    // Error log file (errors and fatal)
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // Combined log file (all levels)
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),

    // Info log file
    new winston.transports.File({
      filename: path.join(logsDir, 'info.log'),
      level: 'info',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 7
    })
  ]
});

/**
 * Logging helpers for common scenarios
 */
const loggers = {
  /**
   * Log successful request
   */
  logSuccess: (message, data = {}) => {
    logger.info(message, {
      type: 'SUCCESS',
      ...data,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Log request error
   */
  logError: (message, error, data = {}) => {
    logger.error(message, {
      type: 'ERROR',
      error: error.message,
      stack: error.stack,
      ...data,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Log authentication event
   */
  logAuth: (action, email, success, reason = '') => {
    const level = success ? 'info' : 'warn';
    logger[level](`Auth: ${action}`, {
      type: 'AUTH',
      action,
      email,
      success,
      reason,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Log database operation
   */
  logDB: (operation, table, duration, success = true, error = null) => {
    const level = success ? 'debug' : 'error';
    logger[level](`DB: ${operation} on ${table}`, {
      type: 'DATABASE',
      operation,
      table,
      durationMs: duration,
      success,
      error: error?.message,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Log API request
   */
  logRequest: (method, url, statusCode, duration, user = null) => {
    const level = statusCode >= 400 ? 'warn' : 'info';
    logger[level](`${method} ${url} ${statusCode}`, {
      type: 'API_REQUEST',
      method,
      url,
      statusCode,
      durationMs: duration,
      userId: user?.id,
      userEmail: user?.email,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Log security event
   */
  logSecurity: (event, severity = 'warn', details = {}) => {
    logger[severity](`Security: ${event}`, {
      type: 'SECURITY',
      event,
      severity,
      ...details,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Log performance issue
   */
  logPerformance: (operation, durationMs, threshold = 1000) => {
    if (durationMs > threshold) {
      logger.warn(`Performance: Slow operation detected`, {
        type: 'PERFORMANCE',
        operation,
        durationMs,
        threshold,
        timestamp: new Date().toISOString()
      });
    }
  }
};

module.exports = { logger, ...loggers };
