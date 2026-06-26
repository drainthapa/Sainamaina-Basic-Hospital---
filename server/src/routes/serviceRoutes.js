const express = require('express');
const serviceController = require('../controllers/serviceController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { createValidator, updateValidator } = require('../validators/serviceValidators');

const router = express.Router();

const CMS_WRITE_ROLES = ['super_admin', 'hospital_administrator'];

router.get('/', optionalAuth, serviceController.list);
router.get('/slug/:slug', optionalAuth, serviceController.getBySlug);
router.get('/:id', requireAuth, serviceController.getById);

router.post('/', requireAuth, requireRole(...CMS_WRITE_ROLES), createValidator, validate, serviceController.create);
router.put('/:id', requireAuth, requireRole(...CMS_WRITE_ROLES), updateValidator, validate, serviceController.update);
router.delete('/:id', requireAuth, requireRole(...CMS_WRITE_ROLES), serviceController.remove);

module.exports = router;
