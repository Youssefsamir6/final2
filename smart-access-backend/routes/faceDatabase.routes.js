const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

const {
  getStatus,
  addPerson,
  rebuild,
  healthCheck,
  upload
} = require('../controllers/faceDatabase.controller');

// Health check (no auth needed)
router.get('/health', healthCheck);

// Admin-only endpoints
router.get('/status', authenticateToken, authorizeRoles('admin'), getStatus);
router.post('/add-person', authenticateToken, authorizeRoles('admin'), upload, addPerson);
router.post('/rebuild', authenticateToken, authorizeRoles('admin'), rebuild);

module.exports = router;
