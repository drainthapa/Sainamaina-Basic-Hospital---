const express = require('express');
const staffController = require('../controllers/staffController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { createValidator, updateValidator } = require('../validators/staffValidators');

const router = express.Router();

const CMS_WRITE_ROLES = ['super_admin', 'hospital_administrator'];

router.get('/', optionalAuth, staffController.list);
router.get('/:id', optionalAuth, staffController.getById);

router.post('/', requireAuth, requireRole(...CMS_WRITE_ROLES), createValidator, validate, staffController.create);
router.put('/:id', requireAuth, requireRole(...CMS_WRITE_ROLES), updateValidator, validate, staffController.update);
router.delete('/:id', requireAuth, requireRole(...CMS_WRITE_ROLES), staffController.remove);

module.exports = router;
