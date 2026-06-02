const historyService = require('../services/history.service');

function getHistory(req, res) {
  const limit = parseInt(req.query.limit) || 100;
  const data = historyService.getHistory(limit);
  res.json(data);
}

function getHistoryByEntity(req, res) {
  const { entityType, entityId } = req.params;
  const data = historyService.getHistoryByEntity(entityType, entityId);
  res.json(data);
}

module.exports = { getHistory, getHistoryByEntity };
