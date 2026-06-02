const { getAnalytics } = require('../services/analytics.service');
const { AppError } = require('../middleware/errorHandler');
const { logSuccess, logDB } = require('../utils/logger');

const analytics = async (req, res) => {
  const { period, userId } = req.query;
  
  const startTime = Date.now();
  const data = await getAnalytics({ period, userId });
  logDB('SELECT', 'Analytics', Date.now() - startTime);
  
  if (!data) {
    throw new AppError('Failed to retrieve analytics', 500);
  }
  
  logSuccess('Retrieved analytics', { period, userId });
  res.json({ success: true, data });
};

module.exports = { analytics };

