const express = require('express');
const {
  createList,
  getListsByBoard,
  updateList,
  deleteList
} = require('../controllers/list.controller');
const {
  createTask,
  getTasksByList
} = require('../controllers/task.controller');
const {
  createListValidator,
  updateListValidator
} = require('../validators/list.validator');
const {
  createTaskValidator
} = require('../validators/task.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.use(protect);

// Routes scoped under /api/lists/:listId
router.patch('/:listId', validate(updateListValidator), updateList);
router.delete('/:listId', deleteList);

// Nested tasks under list: /api/lists/:listId/tasks
router.post('/:listId/tasks', validate(createTaskValidator), createTask);
router.get('/:listId/tasks', getTasksByList);

module.exports = router;
