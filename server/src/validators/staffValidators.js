const { body } = require('express-validator');

const createValidator = [
  body('full_name').isString().trim().notEmpty().withMessage('Full name is required'),
  body('staff_type').isIn(['doctor', 'nursing', 'administrative', 'technical', 'support'])
    .withMessage('Invalid staff type'),
  body('designation_en').isString().trim().notEmpty().withMessage('English designation is required'),
  body('designation_np').isString().trim().notEmpty().withMessage('Nepali designation is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('department_id').optional({ checkFalsy: true }).isUUID(),
  body('schedules').optional().isArray(),
];

const updateValidator = [
  body('staff_type').optional().isIn(['doctor', 'nursing', 'administrative', 'technical', 'support']),
  body('email').optional({ checkFalsy: true }).isEmail(),
  body('department_id').optional({ checkFalsy: true }).isUUID(),
];

module.exports = { createValidator, updateValidator };
