const Log = require('../models/Log.model');
const User = require('../models/User.model');

const getAnalytics = async ({ period = 'day', userId } = {}) => {
  let days = 1;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let endDate = new Date(now);

  if (period === 'week') {
    days = 7;
    endDate.setDate(endDate.getDate() + 1);
  } else if (period === 'month') {
    days = 30;
    endDate.setDate(endDate.getDate() + 1);
  }

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  const filter = {
    timestamp: { $gte: startDate, $lt: endDate }
  };
  if (userId) filter.userId = userId;

  const logs = await Log.find(filter).populate('userId', 'email role');

  if (period !== 'day') {
    // Trends data
    const trends = [];
    for (let i = 0; i < days; i++) {
      const dayStart = new Date(startDate);
      dayStart.setDate(dayStart.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayLogs = logs.filter(l => l.timestamp >= dayStart && l.timestamp < dayEnd);
      const total = dayLogs.length;
      const denied = dayLogs.filter(l => l.status === 'Unauthorized').length;
      trends.push({
        date: dayStart.toISOString().split('T')[0],
        total,
        denied,
        deniedPercent: total ? ((denied / total) * 100).toFixed(1) : 0
      });
    }
    return { period, trends };
  }

  // Single day details
  const total = logs.length;
  const denied = logs.filter(l => l.status === 'Unauthorized').length;
  const deniedPercent = total ? ((denied / total) * 100).toFixed(1) : 0;

  const hours = {};
  logs.forEach(log => {
    const hour = log.timestamp.getHours();
    hours[hour] = (hours[hour] || 0) + 1;
  });
  const peakHour = Object.entries(hours).reduce((a, b) => a[1] > b[1] ? a : b, [0, 0])[0];

  // Top gates
  const gates = {};
  logs.forEach(log => {
    gates[log.gateName] = (gates[log.gateName] || 0) + 1;
  });
  const topGates = Object.entries(gates)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([gate, count]) => ({ gate, count }));

  // Anomalies
  const anomalies = deniedPercent > 20 ? ['High denial rate detected'] : [];

  return {
    period,
    date: now.toISOString().split('T')[0],
    totalEntries: total,
    deniedAttempts: denied,
    deniedPercent,
    peakHour: `${peakHour}:00-${peakHour + 1}:00`,
    topGates,
    anomalies,
    avgConfidence: 'N/A' // AI future
  };
};

module.exports = { getAnalytics };

