const { verifyToken } = require('../services/auth.service');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: `Role '${req.user.role}' not authorized` });
  }
  next();
};

const DEVICE_KEYS = process.env.DEVICE_API_KEYS ? JSON.parse(process.env.DEVICE_API_KEYS) : ['dev-key-123'];

const authenticateDevice = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
  
  if (!apiKey || !DEVICE_KEYS.includes(apiKey)) {
    return res.status(401).json({ error: 'Device API key required' });
  }
  
  req.device = { apiKey, deviceId: req.body.deviceId };
  next();
};

module.exports = { authenticateToken, authorizeRoles, authenticateDevice };

