const { body } = require('express-validator');

const submitValidator = [
  body('fullName').isString().trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('message').isString().trim().notEmpty().withMessage('Message is required'),
  body('address').optional().isString(),
];

module.exports = { submitValidator };
