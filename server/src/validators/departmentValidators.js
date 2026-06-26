const { body, param } = require('express-validator');

const createValidator = [
  body('name_en').isString().trim().notEmpty().withMessage('English name is required'),
  body('name_np').isString().trim().notEmpty().withMessage('Nepali name is required'),
  body('description_en').optional().isString(),
  body('description_np').optional().isString(),
  body('sort_order').optional().isInt(),
];

const updateValidator = [
  param('id').isUUID().withMessage('Invalid department id'),
  body('name_en').optional().isString().trim().notEmpty(),
  body('name_np').optional().isString().trim().notEmpty(),
];

module.exports = { createValidator, updateValidator };
