const express = require('express');
const galleryController = require('../controllers/galleryController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { createAlbumValidator, addMediaValidator } = require('../validators/galleryValidators');

const router = express.Router();

const CMS_WRITE_ROLES = ['super_admin', 'hospital_administrator', 'content_editor'];

router.get('/albums', optionalAuth, galleryController.listAlbums);
router.get('/albums/:id', optionalAuth, galleryController.getAlbum);

router.post('/albums', requireAuth, requireRole(...CMS_WRITE_ROLES), createAlbumValidator, validate, galleryController.createAlbum);
router.put('/albums/:id', requireAuth, requireRole(...CMS_WRITE_ROLES), galleryController.updateAlbum);
router.delete('/albums/:id', requireAuth, requireRole(...CMS_WRITE_ROLES), galleryController.removeAlbum);

router.post('/albums/:id/media', requireAuth, requireRole(...CMS_WRITE_ROLES), addMediaValidator, validate, galleryController.addMedia);
router.delete('/media/:mediaId', requireAuth, requireRole(...CMS_WRITE_ROLES), galleryController.removeMedia);

module.exports = router;
