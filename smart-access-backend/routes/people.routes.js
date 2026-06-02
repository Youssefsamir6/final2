const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/people.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// Require authentication for people endpoints
router.use(authenticateToken);

// GET: any authenticated user can list people
router.get('/', ctrl.getPeople);

// POST/DELETE/PUT: only admin/operator can add, remove, or update people
router.post('/', authorizeRoles('admin', 'operator'), ctrl.createPerson);
router.delete('/:id', authorizeRoles('admin', 'operator'), ctrl.deletePerson);
router.put('/:id', authorizeRoles('admin', 'operator'), ctrl.updatePerson);

module.exports = router;
