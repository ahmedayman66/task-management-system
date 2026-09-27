const { body, query } = require('express-validator');

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 200 })
    .withMessage('Task title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('assignedTo')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('assignedTo must be a valid user ID or null'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status must be todo, in_progress, or done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('dueDate must be a valid ISO 8601 date string')
];

const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Task title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('assignedTo')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(val);
      if (!isValidMongoId) throw new Error('assignedTo must be a valid user ID or null');
      return true;
    }),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status must be todo, in_progress, or done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      if (isNaN(Date.parse(val))) throw new Error('dueDate must be a valid date');
      return true;
    }),
  body('position')
    .optional()
    .isNumeric()
    .withMessage('Position must be a number'),
  body('list')
    .optional()
    .isMongoId()
    .withMessage('List must be a valid Mongo ID')
];

const updateStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status must be todo, in_progress, or done')
];

const assignTaskValidator = [
  body('userId')
    .custom((val) => {
      if (val === null || val === '') return true;
      const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(val);
      if (!isValidMongoId) throw new Error('userId must be a valid user ID or null');
      return true;
    })
];

const taskQueryValidator = [
  query('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status filter must be todo, in_progress, or done'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority filter must be low, medium, or high'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  updateStatusValidator,
  assignTaskValidator,
  taskQueryValidator
};
