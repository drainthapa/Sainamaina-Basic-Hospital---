const { body } = require('express-validator');

const DOC_TYPES = [
  'act', 'policy', 'guideline', 'form', 'action_plan', 'budget_program', 'annual_report',
  'other_report', 'publication', 'citizen_charter', 'unicode_download', 'other',
];

const createValidator = [
  body('title_en').isString().trim().notEmpty().withMessage('English title is required'),
  body('title_np').isString().trim().notEmpty().withMessage('Nepali title is required'),
  body('doc_type').isIn(DOC_TYPES).withMessage('Invalid document type'),
  body('file_url').isString().trim().notEmpty().withMessage('file_url is required (upload the file first)'),
  body('category_id').optional({ checkFalsy: true }).isUUID(),
];

const updateValidator = [
  body('title_en').optional().isString().trim().notEmpty(),
  body('title_np').optional().isString().trim().notEmpty(),
  body('doc_type').optional().isIn(DOC_TYPES),
];

module.exports = { createValidator, updateValidator, DOC_TYPES };
