const { body, param } = require('express-validator');

const createBoardValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Board title is required')
    .isLength({ max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

const updateBoardValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Board title cannot be empty')
    .isLength({ max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

const addMemberValidator = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must provide a valid email')
    .normalizeEmail(),
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Must provide a valid Mongo ObjectId for userId'),
  body().custom((value) => {
    if (!value.email && !value.userId) {
      throw new Error('Either user email or userId must be provided to add a member');
    }
    return true;
  })
];

module.exports = {
  createBoardValidator,
  updateBoardValidator,
  addMemberValidator
};
