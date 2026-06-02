const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateDevice, authorizeRoles } = require('../middleware/auth.middleware');

const { recognition, smartAccess, extractEmbedding } = require('../controllers/ai.controller');

// Device endpoints (no user token, API key only)
router.post('/device/recognition', authenticateDevice, recognition);
router.post('/device/smart-access', authenticateDevice, smartAccess);

// Admin endpoints (user token + role)
router.post('/admin/recognition', authenticateToken, authorizeRoles('admin'), recognition);
router.post('/admin/extract-embedding', authenticateToken, authorizeRoles('admin'), extractEmbedding);

module.exports = router;

