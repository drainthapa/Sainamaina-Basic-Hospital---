const { body } = require('express-validator');

const createValidator = [
  body('name_en').isString().trim().notEmpty().withMessage('English name is required'),
  body('name_np').isString().trim().notEmpty().withMessage('Nepali name is required'),
  body('department_id').optional({ checkFalsy: true }).isUUID(),
  body('is_emergency').optional().isBoolean(),
];

const updateValidator = [
  body('name_en').optional().isString().trim().notEmpty(),
  body('name_np').optional().isString().trim().notEmpty(),
  body('department_id').optional({ checkFalsy: true }).isUUID(),
];

module.exports = { createValidator, updateValidator };
