const { body } = require('express-validator');

const createAlbumValidator = [
  body('title_en').isString().trim().notEmpty().withMessage('English title is required'),
  body('title_np').isString().trim().notEmpty().withMessage('Nepali title is required'),
  body('album_type').optional().isIn(['photo', 'video']),
  body('media').optional().isArray(),
];

const addMediaValidator = [
  body('media').isArray({ min: 1 }).withMessage('media must be a non-empty array'),
  body('media.*.media_url').isString().trim().notEmpty().withMessage('Each media item needs a media_url'),
];

module.exports = { createAlbumValidator, addMediaValidator };
