const express = require('express');
const { upload } = require('../utils/storage');
const uploadController = require('../controllers/uploadController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

const CMS_WRITE_ROLES = ['super_admin', 'hospital_administrator', 'content_editor'];

router.post(
  '/',
  requireAuth,
  requireRole(...CMS_WRITE_ROLES),
  upload.single('file'),
  uploadController.uploadSingle
);

module.exports = router;
