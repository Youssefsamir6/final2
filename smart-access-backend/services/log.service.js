const { createAlert } = require('./alert.service');
const { executeQuery, sql } = require('../config/db');

// Reusable io from server
const io = global.io;

const createLog = async ({ photoUrl, name, studentId, location, userId, status, method, reason, gateName = 'Main Gate', deviceId, confidence, timestamp, identificationReason = '' }) => {
  const defaults = {
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&fit=crop&w=100&h=100&q=80',
    name: name || 'Unknown Person',
    studentId: studentId || null,
    location: location || gateName || 'North Gate',
    userId: userId || null,
    status: status || 'authorized',
    method: method || 'access',
    reason: reason || '',
    gateName,
    deviceId: deviceId || null,
    confidence: confidence || null,
    timestamp: timestamp || new Date(),
    identificationReason
  };

  // Save to SQL Server database
  try {
    const query = `
      INSERT INTO access_logs (user_id, status, access_time)
      VALUES (@userId, @status, @accessTime);
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const result = await executeQuery(query, [
      { name: 'userId', type: sql.Int, value: userId },
      { name: 'status', type: sql.VarChar, value: status === 'authorized' ? 'allowed' : 'denied' },
      { name: 'accessTime', type: sql.DateTime, value: new Date() }
    ]);
    
    const log = { 
      ...defaults, 
      id: result[0]?.id,
      _id: result[0]?.id?.toString() 
    };

    // Normalize status casing for frontend sound/logic compatibility
    const normalizedLog = {
      ...log,
      status: log.status === 'Authorized' ? 'authorized' : (log.status === 'Unauthorized' ? 'unauthorized' : log.status)
    };

    // Socket emit - general logs
    io.emit('liveLog', normalizedLog);


    // Auth-specific emit
    if (method === 'login') {
      io.emit('authLog', log);
    }
    
    // Unauthorized → alert
    if (status === 'Unauthorized' || status === 'denied') {
      const mockAlert = {
        id: Date.now(),
        userId,
        alert_type: 'Unauthorized Access',
        message: `Unauthorized ${method} at ${gateName}: ${reason}`,
        severity: 'High',
        created_at: new Date()
      };
      io.emit('newAlert', mockAlert);
    }

    return log;
  } catch (error) {
    console.error('Error creating log:', error.message);
    // Still emit even if DB fails
    const log = { ...defaults, _id: Date.now().toString() };
    io.emit('liveLog', log);
    return log;
  }
};

const getLogs = async (query = {}) => {
  try {
    const querySQL = `
      SELECT 
        al.id,
        al.user_id,
        al.status,
        al.access_time,
        u.name,
        u.role
      FROM access_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.access_time DESC
    `;
    const result = await executeQuery(querySQL);
    return result;
  } catch (error) {
    console.error('Error fetching logs:', error.message);
    return [];
  }
};

module.exports = { createLog, getLogs };
