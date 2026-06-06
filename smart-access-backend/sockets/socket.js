const getIO = require('../server').getIO;
const { getLogs, createLog } = require('../services/log.service');
const { getAlerts, createAlert } = require('../services/alert.service');
const { getUsers } = require('../services/user.service');
const io = getIO();

async function getUsersList() {
  try {
    const users = await getUsers();
    return users || [];
  } catch (error) {
    console.error('Error fetching users for socket:', error.message);
    return [];
  }
}

async function generateRandomLog() {
  const statuses = ['allowed', 'denied'];
  const locations = ['North Gate', 'Main Entrance', 'South Gate', 'Library Exit', 'Admin Building'];
  
  const users = await getUsersList();
  if (users.length === 0) {
    console.log('No users found for random log generation');
    return null;
  }
  
  const user = users[Math.floor(Math.random() * users.length)];
  const status = Math.random() > 0.85 ? 'denied' : 'allowed'; // 15% deny rate

  return createLog({
    photoUrl: `https://images.unsplash.com/photo-${Math.floor(Math.random()*1500)}?w=100&h=100&fit=crop`,
    name: user.name || user.email || 'Unknown',
    studentId: user.studentId || null,
    location: locations[Math.floor(Math.random() * locations.length)],
    status: status === 'allowed' ? 'authorized' : 'denied',
    userId: status === 'allowed' ? user.id : null,
    timestamp: new Date()
  });
}

function generateRandomAlert() {
  const severities = ['low', 'medium', 'high'];
  const types = ['Unauthorized Access', 'Tailgating Detected', 'Suspicious Loitering', 'Off-Hours Access'];
  const locations = ['North Gate', 'Main Entrance', 'South Gate', 'Library Exit'];

  return createAlert({
    type: types[Math.floor(Math.random() * types.length)],
    message: `${types[Math.floor(Math.random() * types.length)]} at ${locations[Math.floor(Math.random() * locations.length)]}`,
    severity: severities[Math.floor(Math.random() * severities.length)],
    gateName: locations[Math.floor(Math.random() * locations.length)],
    timestamp: new Date(),
    userId: null,
    isRead: false
  }).then((a) => {
    // Ensure payload matches frontend AlertsPanel expectations
    return {
      ...a,
      title: a.alert_type,
      location: locations[Math.floor(Math.random() * locations.length)],
      source: 'camera-client',
      severity: a.severity === 'high' ? 'critical' : (a.severity === 'medium' ? 'warning' : 'info')
    };
  });
}



// Socket room management for real-time logs/alerts/access events
io.on('connection', (socket) => {
  (async () => {
    console.log('Backend socket client connected:', socket.id);

    // Auto join key rooms
    socket.join('logs');
    socket.join('alerts');

    // Send initial data (await async getters)
    try {
      const logsArr = await getLogs({ limit: 50 });
      const alertsArr = await getAlerts({});
      socket.emit('liveLog', Array.isArray(logsArr) ? logsArr.slice(0, 50) : []);
      socket.emit('newAlert', Array.isArray(alertsArr) ? alertsArr.slice(0, 50) : []);
    } catch (e) {
      console.error('Error fetching initial logs/alerts for socket:', e);
      socket.emit('liveLog', []);
      socket.emit('newAlert', []);
    }

    // Debug: log any incoming events for this socket
    socket.onAny((event, ...args) => {
      console.log(`Socket ${socket.id} received event:`, event, args.length ? args : 'no args');
    });

    socket.on('ping-test', (data) => {
      console.log(`Received ping-test from ${socket.id}:`, data);
    });

    // Simulate periodic events (disable for real camera demo)
    const demoSimulation = (process.env.DEMO_SIMULATION || '').toLowerCase() !== 'false';

    let logInterval = null;
    let alertInterval = null;

    if (demoSimulation) {
      logInterval = setInterval(() => {
        (async () => {
          try {
            const newLog = await generateRandomLog();
            if (newLog) {
              io.to('logs').emit('liveLog', newLog);
              console.log('Emitted new log:', newLog.location, newLog.status);
            }
          } catch (e) {
            console.error('Error generating/emitting random log:', e);
          }
        })();
      }, 20000); // Every 20s

      alertInterval = setInterval(() => {
        (async () => {
          try {
            const newAlert = await generateRandomAlert();
// Ensure payload matches smart-main AlertsPanel expectations
          const normalizedAlert = {
            id: newAlert.id ?? Date.now(),
            title: newAlert.title || newAlert.alert_type || newAlert.type || 'Alert',
            location: newAlert.location || newAlert.gateName || 'Main Gate',
            source: newAlert.source || newAlert.userId ? 'Access Control' : 'Camera AI',
            severity: (newAlert.severity === 'High' || newAlert.severity === 'critical')
              ? 'critical'
              : (newAlert.severity === 'Medium' || newAlert.severity === 'warning')
                ? 'warning'
                : 'info',
            created_at: newAlert.created_at || new Date(),
            description: newAlert.description || newAlert.message || '',
          };

          io.to('alerts').emit('newAlert', normalizedAlert);
          console.log('Emitted new alert:', normalizedAlert.title, normalizedAlert.severity);

          } catch (e) {
            console.error('Error generating/emitting random alert:', e);
          }
        })();
      }, 45000); // Every 45s
    }


    socket.on('join-logs', async () => {
      socket.join('logs');
      try {
        const logsArr = await getLogs({ limit: 20 });
        socket.emit('liveLog', Array.isArray(logsArr) ? logsArr.slice(0, 20) : []);
      } catch (e) {
        console.error('Error on join-logs:', e);
        socket.emit('liveLog', []);
      }
      console.log(`${socket.id} joined logs room`);
    });

    socket.on('join-alerts', async () => {
      socket.join('alerts');
      try {
        const alertsArr = await getAlerts({});
        socket.emit('newAlert', Array.isArray(alertsArr) ? alertsArr.slice(0, 50) : []);
      } catch (e) {
        console.error('Error on join-alerts:', e);
        socket.emit('newAlert', []);
      }
      console.log(`${socket.id} joined alerts room`);
    });

    socket.on('simulate-unknown-person', async (data, callback) => {
      console.log('Simulate unknown person requested:', data);
      try {
        const log = await createLog({
          ...data,
          status: 'denied',
          userId: null,
          method: 'access',
          reason: 'Unknown person - no match found',
          gateName: data.location || 'North Gate'
        });
        io.to('logs').emit('liveLog', log);
        socket.emit('simulated-log', log); // Emit event back to the requester
        if (typeof callback === 'function') callback(null, log);
        console.log('Emitted simulated denied log');
      } catch (err) {
        console.error('Simulation error:', err);
        if (typeof callback === 'function') callback(err);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      if (logInterval) clearInterval(logInterval);
      if (alertInterval) clearInterval(alertInterval);
    });

  })();
});

module.exports = io;
