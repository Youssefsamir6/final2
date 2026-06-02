const config = require('../config/env');

/**
 * Sentry Error Tracking Integration
 * Captures errors and sends them to Sentry for monitoring
 * Only enabled in production unless explicitly configured
 */

let Sentry = null;

// Initialize Sentry if DSN is provided
const initializeSentry = () => {
  if (!config.sentry?.dsn) {
    console.log('[INFO] Sentry not configured (no DSN provided)');
    return null;
  }

  try {
    Sentry = require('@sentry/node');
    
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.app.env,
      tracesSampleRate: config.sentry.tracesSampleRate || 1.0,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.OnUncaughtException(),
        new Sentry.Integrations.OnUnhandledRejection()
      ],
      // Don't send events in development
      enabled: config.app.env !== 'development',
      debug: config.app.env === 'development'
    });

    console.log(`[INFO] Sentry initialized for environment: ${config.app.env}`);
    return Sentry;
  } catch (error) {
    console.error('[ERROR] Failed to initialize Sentry:', error.message);
    return null;
  }
};

/**
 * Capture exception and send to Sentry
 */
const captureException = (error, context = {}) => {
  if (!Sentry) return;

  Sentry.captureException(error, {
    contexts: {
      request: context
    },
    level: 'error'
  });
};

/**
 * Capture message and send to Sentry
 */
const captureMessage = (message, level = 'info', context = {}) => {
  if (!Sentry) return;

  Sentry.captureMessage(message, {
    contexts: {
      request: context
    },
    level
  });
};

/**
 * Set user context for Sentry
 */
const setUser = (user) => {
  if (!Sentry) return;

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.email
    });
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Express middleware for Sentry request tracing
 */
const sentryRequestHandler = () => {
  if (!Sentry) return (req, res, next) => next();
  return Sentry.Handlers.requestHandler();
};

/**
 * Express middleware for Sentry error handling
 * Should be added AFTER all other middleware and routes
 */
const sentryErrorHandler = () => {
  if (!Sentry) return (err, req, res, next) => next(err);
  return Sentry.Handlers.errorHandler();
};

/**
 * Wrapper to automatically capture errors in promises
 */
const capturePromise = (promise, context = {}) => {
  if (!Sentry) return promise;

  return promise.catch(error => {
    captureException(error, context);
    throw error;
  });
};

module.exports = {
  initializeSentry,
  captureException,
  captureMessage,
  setUser,
  sentryRequestHandler,
  sentryErrorHandler,
  capturePromise,
  Sentry: () => Sentry
};
