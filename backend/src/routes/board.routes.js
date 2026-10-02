const express = require('express');
const {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  addMember,
  removeMember
} = require('../controllers/board.controller');
const {
  createList,
  getListsByBoard
} = require('../controllers/list.controller');
const {
  createBoardValidator,
  updateBoardValidator,
  addMemberValidator
} = require('../validators/board.validator');
const {
  createListValidator
} = require('../validators/list.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

// Board collection routes
router.post('/', validate(createBoardValidator), createBoard);
router.get('/', getBoards);

// Single board routes
router.get('/:boardId', getBoardById);
router.patch('/:boardId', validate(updateBoardValidator), updateBoard);
router.delete('/:boardId', deleteBoard);

// Member management
router.post('/:boardId/members', validate(addMemberValidator), addMember);
router.delete('/:boardId/members/:userId', removeMember);

// Nested lists for board: /api/boards/:boardId/lists
router.post('/:boardId/lists', validate(createListValidator), createList);
router.get('/:boardId/lists', getListsByBoard);

module.exports = router;
