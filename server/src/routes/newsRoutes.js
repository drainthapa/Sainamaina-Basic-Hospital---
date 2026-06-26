const express = require('express');
const newsController = require('../controllers/newsController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { createValidator, updateValidator } = require('../validators/newsValidators');

const router = express.Router();

const CMS_WRITE_ROLES = ['super_admin', 'hospital_administrator', 'content_editor'];
const CMS_RECEPTION_ROLES = [...CMS_WRITE_ROLES, 'reception_staff'];

router.get('/', optionalAuth, newsController.list);
router.get('/slug/:slug', optionalAuth, newsController.getBySlug);
router.get('/:id', requireAuth, newsController.getById);

router.post('/', requireAuth, requireRole(...CMS_RECEPTION_ROLES), createValidator, validate, newsController.create);
router.put('/:id', requireAuth, requireRole(...CMS_WRITE_ROLES), updateValidator, validate, newsController.update);
router.delete('/:id', requireAuth, requireRole(...CMS_WRITE_ROLES), newsController.remove);

module.exports = router;
