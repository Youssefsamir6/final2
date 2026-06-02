const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { createAccessEvent } = require('../controllers/accessEvent.controller');

// No auth - direct device access

router.post('/', createAccessEvent);

module.exports = router;

