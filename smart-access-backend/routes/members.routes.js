const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/members.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// All members endpoints require authentication
router.use(authenticateToken);

// GET: any authenticated user can list members
router.get('/', ctrl.getMembers);

// POST/DELETE/PUT: restricted to operator/admin roles
router.post('/', authorizeRoles('admin', 'operator'), ctrl.createMember);
router.delete('/:id', authorizeRoles('admin', 'operator'), ctrl.deleteMember);
router.put('/:id', authorizeRoles('admin', 'operator'), ctrl.updateMember);

module.exports = router;
