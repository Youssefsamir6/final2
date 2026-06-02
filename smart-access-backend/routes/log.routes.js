const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const { validateRequest } = require('../middleware/validation.middleware');
const { getLogsSchema } = require('../utils/schemas');
const { getAllLogs } = require('../controllers/log.controller');

router.use(authenticateToken);

router.get('/', validateRequest(getLogsSchema), asyncHandler(getAllLogs));

module.exports = router;

