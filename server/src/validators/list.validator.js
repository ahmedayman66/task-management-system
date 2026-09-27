const { body } = require('express-validator');

const createListValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('List title is required')
    .isLength({ max: 100 })
    .withMessage('List title cannot exceed 100 characters'),
  body('position')
    .optional()
    .isNumeric()
    .withMessage('Position must be a number')
];

const updateListValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('List title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('List title cannot exceed 100 characters'),
  body('position')
    .optional()
    .isNumeric()
    .withMessage('Position must be a number')
];

module.exports = {
  createListValidator,
  updateListValidator
};
