const express = require('express');
const contentController = require('../controllers/contentController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

const CMS_WRITE_ROLES = ['super_admin', 'hospital_administrator', 'content_editor'];
const CMS_ADMIN_ROLES = ['super_admin', 'hospital_administrator'];

// Pages
router.get('/pages', contentController.listPages);
router.get('/pages/:slug', contentController.getPage);
router.put('/pages/:slug', requireAuth, requireRole(...CMS_WRITE_ROLES), contentController.updatePage);

// FAQs
router.get('/faqs', optionalAuth, contentController.listFaqs);
router.post('/faqs', requireAuth, requireRole(...CMS_WRITE_ROLES), contentController.createFaq);
router.put('/faqs/:id', requireAuth, requireRole(...CMS_WRITE_ROLES), contentController.updateFaq);
router.delete('/faqs/:id', requireAuth, requireRole(...CMS_WRITE_ROLES), contentController.deleteFaq);

// Site settings
router.get('/settings', contentController.getSettings);
router.put('/settings/:key', requireAuth, requireRole(...CMS_ADMIN_ROLES), contentController.updateSetting);

// Categories
router.get('/news-categories', contentController.listNewsCategories);
router.post('/news-categories', requireAuth, requireRole(...CMS_ADMIN_ROLES), contentController.createNewsCategory);
router.get('/download-categories', contentController.listDownloadCategories);
router.post('/download-categories', requireAuth, requireRole(...CMS_ADMIN_ROLES), contentController.createDownloadCategory);

module.exports = router;
