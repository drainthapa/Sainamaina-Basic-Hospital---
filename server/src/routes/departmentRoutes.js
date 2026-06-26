const express = require('express');
const departmentController = require('../controllers/departmentController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { createValidator, updateValidator } = require('../validators/departmentValidators');

const router = express.Router();

const CMS_WRITE_ROLES = ['super_admin', 'hospital_administrator'];

// Public + CMS read (optionalAuth lets the controller decide published-only vs all)
router.get('/', optionalAuth, departmentController.list);
router.get('/slug/:slug', optionalAuth, departmentController.getBySlug);
router.get('/:id', requireAuth, departmentController.getById);

// CMS-only writes
router.post('/', requireAuth, requireRole(...CMS_WRITE_ROLES), createValidator, validate, departmentController.create);
router.put('/:id', requireAuth, requireRole(...CMS_WRITE_ROLES), updateValidator, validate, departmentController.update);
router.delete('/:id', requireAuth, requireRole(...CMS_WRITE_ROLES), departmentController.remove);

module.exports = router;
