const { getLogs } = require('../services/log.service');
const { AppError } = require('../middleware/errorHandler');
const { logSuccess, logDB } = require('../utils/logger');

const getAllLogs = async (req, res) => {
  const startTime = Date.now();
  const logs = await getLogs(req.query);
  logDB('SELECT', 'Logs', Date.now() - startTime);
  
  if (!logs || !Array.isArray(logs)) {
    throw new AppError('Failed to retrieve logs', 500);
  }
  
  logSuccess('Retrieved logs', { 
    count: logs.length,
    filters: req.query 
  });
  
  res.json({ 
    success: true,
    data: logs,
    count: logs.length
  });
};

module.exports = { getAllLogs };

