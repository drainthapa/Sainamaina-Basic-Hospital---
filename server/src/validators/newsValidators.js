const { body } = require('express-validator');

const MODULE_TYPES = ['news', 'notice', 'press_release', 'tender_notice', 'health_article', 'event', 'achievement'];

const createValidator = [
  body('title_en').isString().trim().notEmpty().withMessage('English title is required'),
  body('title_np').isString().trim().notEmpty().withMessage('Nepali title is required'),
  body('module_type').optional().isIn(MODULE_TYPES).withMessage('Invalid module type'),
  body('category_id').optional({ checkFalsy: true }).isUUID(),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('ad_date').optional().isISO8601(),
  body('expiry_date').optional({ checkFalsy: true }).isISO8601(),
];

const updateValidator = [
  body('title_en').optional().isString().trim().notEmpty(),
  body('title_np').optional().isString().trim().notEmpty(),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('category_id').optional({ checkFalsy: true }).isUUID(),
];

module.exports = { createValidator, updateValidator, MODULE_TYPES };
