const { body } = require('express-validator');

const createValidator = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('fullName').isString().trim().notEmpty().withMessage('Full name is required'),
  body('roleId').isUUID().withMessage('A valid roleId is required'),
];

const updateRoleValidator = [
  body('roleId').isUUID().withMessage('A valid roleId is required'),
];

const setActiveValidator = [
  body('isActive').isBoolean().withMessage('isActive must be true or false'),
];

module.exports = { createValidator, updateRoleValidator, setActiveValidator };
