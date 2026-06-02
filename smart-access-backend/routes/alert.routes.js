const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const { validateRequest } = require('../middleware/validation.middleware');
const { getAlertsSchema } = require('../utils/schemas');
const {
  getAllAlerts,
  getUserAlertsHandler,
  getUnreadCountHandler,
  markAlertAsRead
} = require('../controllers/alert.controller');

router.use(authenticateToken);

// Admin/Guard: all alerts
router.get('/', validateRequest(getAlertsSchema), asyncHandler(getAllAlerts));
router.patch('/:id/read', asyncHandler(markAlertAsRead));

// Any auth user: own alerts + count
router.get('/user/:userId', asyncHandler(getUserAlertsHandler));
router.get('/user/:userId/unread-count', asyncHandler(getUnreadCountHandler));

module.exports = router;

