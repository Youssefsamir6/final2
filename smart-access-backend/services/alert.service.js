const { executeQuery, sql } = require('../config/db');

// Reusable io from server
const io = global.io;

const createAlert = async ({ userId, type, message = '', severity = 'Medium' }) => {
  try {
    const query = `
      INSERT INTO security_alerts (alert_type, description, severity, user_id, created_at, status)
      VALUES (@alertType, @description, @severity, @userId, GETDATE(), 'Open');
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const result = await executeQuery(query, [
      { name: 'alertType', type: sql.VarChar, value: type },
      { name: 'description', type: sql.VarChar, value: message },
      { name: 'severity', type: sql.VarChar, value: severity },
      { name: 'userId', type: sql.Int, value: userId }
    ]);
    
    const newAlert = {
      id: result[0]?.id,
      userId, 
      alert_type: type, 
      description: message, 
      severity,
      created_at: new Date(),
      status: 'Open'
    };
    
    // Socket emit
    io.emit('newAlert', newAlert);
    
    return newAlert;
  } catch (error) {
    console.error('Error creating alert:', error.message);
    // Still emit even if DB fails
    const newAlert = {
      id: Date.now(),
      userId, 
      alert_type: type, 
      description: message, 
      severity,
      created_at: new Date()
    };
    io.emit('newAlert', newAlert);
    return newAlert;
  }
};

const getAlerts = async (filter = {}) => {
  try {
    let query = `
      SELECT 
        id,
        alert_type,
        description,
        severity,
        user_id,
        created_at,
        status
      FROM security_alerts
    `;
    
    // Add WHERE clause if filtering
    const conditions = [];
    if (filter.status) {
      conditions.push('status = @status');
    }
    if (filter.severity) {
      conditions.push('severity = @severity');
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const params = [];
    if (filter.status) params.push({ name: 'status', type: sql.VarChar, value: filter.status });
    if (filter.severity) params.push({ name: 'severity', type: sql.VarChar, value: filter.severity });
    
    const result = await executeQuery(query, params);
    return result;
  } catch (error) {
    console.error('Error fetching alerts:', error.message);
    return [];
  }
};

const getUnreadCount = async (userId) => {
  try {
    const query = `
      SELECT COUNT(*) AS count 
      FROM security_alerts 
      WHERE status = 'Open'
    `;
    const result = await executeQuery(query);
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error.message);
    return 0;
  }
};

module.exports = { createAlert, getAlerts, getUnreadCount };
