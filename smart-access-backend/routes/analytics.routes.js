const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const { analytics } = require('../controllers/analytics.controller');

router.use(authenticateToken);

// Admin full access, guards own/team users
router.use((req, res, next) => {
  const { userId } = req.query;
  if (req.user.role === 'admin' || !userId || req.user._id.toString() === userId || req.user.role === 'guard') {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized for this user stats' });
  }
});
router.use(authorizeRoles('admin', 'guard'));

router.get('/', analytics); // ?period=week&userId=...

module.exports = router;

