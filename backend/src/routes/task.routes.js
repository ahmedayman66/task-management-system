const express = require('express');
const {
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  assignTask,
  deleteTask
} = require('../controllers/task.controller');
const {
  updateTaskValidator,
  updateStatusValidator,
  assignTaskValidator,
  taskQueryValidator
} = require('../validators/task.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

// Global tasks endpoint with filtering and pagination
router.get('/', validate(taskQueryValidator), getTasks);

// Single task endpoints
router.get('/:taskId', getTaskById);
router.patch('/:taskId', validate(updateTaskValidator), updateTask);
router.delete('/:taskId', deleteTask);

// Specialized task action endpoints
router.patch('/:taskId/status', validate(updateStatusValidator), updateTaskStatus);
router.patch('/:taskId/assign', validate(assignTaskValidator), assignTask);

module.exports = router;
