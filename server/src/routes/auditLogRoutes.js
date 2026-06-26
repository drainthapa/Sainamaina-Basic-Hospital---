const express = require('express');
const auditLogController = require('../controllers/auditLogController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, auditLogController.list);

module.exports = router;
