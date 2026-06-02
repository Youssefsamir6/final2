// In-memory history store (audit log only - not critical data)
let history = [];

function addHistory({ action, entityType, entityId, entityName, userEmail, userRole, details }) {
  const entry = {
    _id: String(Date.now()) + Math.random().toString(36).slice(2),
    action,           // 'create', 'update', 'delete'
    entityType,       // 'member', 'person'
    entityId: entityId || null,
    entityName: entityName || null,
    userEmail: userEmail || 'unknown',
    userRole: userRole || 'unknown',
    details: details || null,
    timestamp: new Date().toISOString()
  };
  history.unshift(entry);
  // Keep only last 500 entries
  if (history.length > 500) history.length = 500;
  return entry;
}

function getHistory(limit = 100) {
  return history.slice(0, limit);
}

function getHistoryByEntity(entityType, entityId) {
  return history.filter(h => h.entityType === entityType && h.entityId === entityId);
}

module.exports = { addHistory, getHistory, getHistoryByEntity };
