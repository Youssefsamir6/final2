require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const config = require('./config/env');
const { errorHandler } = require('./middleware/errorHandler');
const { sanitizeInput } = require('./middleware/validation.middleware');
const { logger, logSuccess, logError, logRequest } = require('./utils/logger');
const sentry = require('./utils/sentry');

// Initialize Sentry error tracking
sentry.initializeSentry();

const app = express();
const server = http.createServer(app);

// Sentry request tracking middleware
app.use(sentry.sentryRequestHandler());

// Security: Helmet for HTTP headers
app.use(helmet());

// Security: Enable trust proxy for HTTPS behind proxy
app.enable('trust proxy');

// CORS with configuration
// Support comma-separated CORS_ORIGIN allowlists
const corsOrigins = (() => {
  const raw = config.security.corsOrigin;
  if (raw === '*' || raw === undefined || raw === null) return '*';
  if (typeof raw === 'string') {
    if (raw.includes(',')) return raw.split(',').map(s => s.trim()).filter(Boolean);
    // Allow common local dev mismatches even if CORS_ORIGIN is only http://localhost:3000
    if (raw === 'http://localhost:3000') return ['http://localhost:3000', 'http://localhost:3001'];
  }
  return raw;
})();

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'x-api-key']
}));

// Socket.io with security headers
const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

// Rate limiting - General API
const generalLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health'
});

// Rate limiting - Auth endpoints (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 100 : 5,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true // Only count failed attempts, not successful logins
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Security: Input sanitization
app.use(sanitizeInput);

// Request timing and logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logRequest(req.method, req.url, res.statusCode, duration, req.user);
  });
  
  next();
});

// Socket.io connection with error handling
io.on('connection', (socket) => {
  logger.info('Socket client connected', {
    type: 'SOCKET_CONNECT',
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });
  
  socket.join('logs');
  socket.join('alerts');

  socket.on('error', (error) => {
    logger.error('Socket error', {
      type: 'SOCKET_ERROR',
      socketId: socket.id,
      error: error?.message,
      timestamp: new Date().toISOString()
    });
    sentry.captureException(error, { socketId: socket.id });
  });

  socket.on('disconnect', (reason) => {
    logger.info('Socket client disconnected', {
      type: 'SOCKET_DISCONNECT',
      socketId: socket.id,
      reason,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('connect_error', (error) => {
    logger.warn('Socket connection error', {
      type: 'SOCKET_CONNECT_ERROR',
      socketId: socket.id,
      error: error?.message,
      timestamp: new Date().toISOString()
    });
  });
});

// Export io for services
global.io = io;
module.exports.getIO = () => io;

// Load socket handlers
try {
  require('./sockets/socket');
  logSuccess('Loaded socket handlers');
} catch (e) {
  logError('Failed to load socket handlers', e);
}

// Test Route
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Access Backend',
    status: 'operational',
    environment: config.app.env,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes with rate limiting
app.use('/api/auth', authLimiter, require('./routes/auth.routes'));
app.use('/api/users', generalLimiter, require('./routes/user.routes'));
app.use('/api/logs', generalLimiter, require('./routes/log.routes'));
app.use('/api/alerts', generalLimiter, require('./routes/alert.routes'));
app.use('/api/ai', generalLimiter, require('./routes/ai.routes'));
app.use('/api/face-db', generalLimiter, require('./routes/faceDatabase.routes'));
app.use('/api/analytics', generalLimiter, require('./routes/analytics.routes'));
app.use('/api/access-event', generalLimiter, require('./routes/accessEvent.routes'));
app.use('/api/members', generalLimiter, require('./routes/members.routes'));
app.use('/api/people', generalLimiter, require('./routes/people.routes'));
app.use('/api/history', generalLimiter, require('./routes/history.routes'));

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found', {
    type: 'NOT_FOUND',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
  res.status(404).json({ error: 'Route not found' });
});

// Sentry error handler
app.use(sentry.sentryErrorHandler());

// Error handling middleware (MUST be last)
app.use(errorHandler);

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.fatal('Uncaught Exception', {
    type: 'UNCAUGHT_EXCEPTION',
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  sentry.captureException(error);
  process.exit(1);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.fatal('Unhandled Rejection', {
    type: 'UNHANDLED_REJECTION',
    reason: reason?.message || String(reason),
    timestamp: new Date().toISOString()
  });
  sentry.captureException(reason instanceof Error ? reason : new Error(String(reason)));
});

// Start Server
const PORT = config.app.port;
server.listen(PORT, () => {
  logger.info('Server started', {
    type: 'SERVER_START',
    port: PORT,
    environment: config.app.env,
    database: config.db.server,
    corsOrigin: config.security.corsOrigin
  });
  
  console.log(`\n✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${config.app.env}`);
  console.log(`✓ Database: SQL Server - ${config.db.server}:${config.db.port}`);
  console.log(`✓ CORS enabled for: ${config.security.corsOrigin}`);
  console.log(`✓ Logs location: ./logs/\n`);
});
