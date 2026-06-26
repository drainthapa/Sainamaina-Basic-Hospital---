const express = require('express');
const rateLimit = require('express-rate-limit');
const contactController = require('../controllers/contactController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { submitValidator } = require('../validators/contactValidators');

const router = express.Router();

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions, please try again later.' },
});

const CMS_ROLES = ['super_admin', 'hospital_administrator', 'reception_staff'];

router.post('/', submitLimiter, submitValidator, validate, contactController.submit);
router.get('/', requireAuth, requireRole(...CMS_ROLES), contactController.list);
router.put('/:id/read', requireAuth, requireRole(...CMS_ROLES), contactController.markRead);
router.delete('/:id', requireAuth, requireRole(...CMS_ROLES), contactController.remove);

module.exports = router;
