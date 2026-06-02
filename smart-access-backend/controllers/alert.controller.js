const { getAlerts, getUserAlerts, getUnreadCount, markAsRead } = require('../services/alert.service');
const { AppError } = require('../middleware/errorHandler');
const { logSuccess, logDB } = require('../utils/logger');

const getAllAlerts = async (req, res) => {
  const startTime = Date.now();
  const alerts = await getAlerts(req.query);
  logDB('SELECT', 'Alerts', Date.now() - startTime);
  
  if (!alerts || !Array.isArray(alerts)) {
    throw new AppError('Failed to retrieve alerts', 500);
  }
  
  logSuccess('Retrieved alerts', { count: alerts.length });
  res.json({ success: true, data: alerts, count: alerts.length });
};

const getUserAlertsHandler = async (req, res) => {
  const { userId } = req.params;
  const { unread } = req.query;
  
  const startTime = Date.now();
  const alerts = await getUserAlerts(userId, unread === 'true');
  logDB('SELECT', 'Alerts', Date.now() - startTime);
  
  if (!alerts || !Array.isArray(alerts)) {
    throw new AppError('Failed to retrieve user alerts', 500);
  }
  
  res.json({ success: true, data: alerts, count: alerts.length });
};

const getUnreadCountHandler = async (req, res) => {
  const { userId } = req.params;
  
  const count = await getUnreadCount(userId);
  
  if (count === null) {
    throw new AppError('Failed to get unread count', 500);
  }
  
  res.json({ success: true, unreadCount: count });
};

const markAlertAsRead = async (req, res) => {
  const { id } = req.params;
  
  const startTime = Date.now();
  const alert = await markAsRead(id);
  logDB('UPDATE', 'Alerts', Date.now() - startTime);
  
  if (!alert) {
    throw new AppError('Alert not found', 404);
  }
  
  logSuccess('Alert marked as read', { alertId: id });
  res.json({ success: true, message: 'Alert marked as read', data: alert });
};

module.exports = { getAllAlerts, getUserAlertsHandler, getUnreadCountHandler, markAlertAsRead };
