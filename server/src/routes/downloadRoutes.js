const express = require('express');
const downloadController = require('../controllers/downloadController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { createValidator, updateValidator } = require('../validators/downloadValidators');

const router = express.Router();

const CMS_WRITE_ROLES = ['super_admin', 'hospital_administrator', 'content_editor'];

router.get('/', optionalAuth, downloadController.list);
router.get('/:id', optionalAuth, downloadController.getById);
router.post('/:id/track', downloadController.trackDownload);

router.post('/', requireAuth, requireRole(...CMS_WRITE_ROLES), createValidator, validate, downloadController.create);
router.put('/:id', requireAuth, requireRole(...CMS_WRITE_ROLES), updateValidator, validate, downloadController.update);
router.delete('/:id', requireAuth, requireRole(...CMS_WRITE_ROLES), downloadController.remove);

module.exports = router;
