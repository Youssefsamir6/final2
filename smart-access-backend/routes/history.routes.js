const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/history.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// Require authentication for history endpoints
router.use(authenticateToken);

// GET: any authenticated user can view history
router.get('/', ctrl.getHistory);
router.get('/:entityType/:entityId', ctrl.getHistoryByEntity);

module.exports = router;
