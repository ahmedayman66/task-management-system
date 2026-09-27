const List = require('../models/List');
const Board = require('../models/Board');
const Task = require('../models/Task');
const AppError = require('../utils/appError');
const { sendSuccess } = require('../utils/apiResponse');

// @desc    Create a new list on a board
// @route   POST /api/boards/:boardId/lists
// @access  Private (Board member)
const createList = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { title, position } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return next(new AppError('Board not found', 404, 'BOARD_NOT_FOUND'));
    }

    const isMember = board.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return next(
        new AppError('You do not have permission to add lists to this board', 403, 'FORBIDDEN_BOARD_ACCESS')
      );
    }

    // Determine position if not explicitly supplied
    let listPosition = position;
    if (listPosition === undefined) {
      const highestPositionList = await List.findOne({ board: boardId }).sort({ position: -1 });
      listPosition = highestPositionList ? highestPositionList.position + 1000 : 1000;
    }

    const list = await List.create({
      title,
      board: boardId,
      position: listPosition
    });

    return sendSuccess(res, 201, { list });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all lists for a board
// @route   GET /api/boards/:boardId/lists
// @access  Private (Board member)
const getListsByBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findById(boardId);
    if (!board) {
      return next(new AppError('Board not found', 404, 'BOARD_NOT_FOUND'));
    }

    const isMember = board.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return next(
        new AppError('You do not have permission to access lists on this board', 403, 'FORBIDDEN_BOARD_ACCESS')
      );
    }

    const lists = await List.find({ board: boardId }).sort({ position: 1 });

    return sendSuccess(res, 200, { lists });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a list
// @route   PATCH /api/lists/:listId
// @access  Private (Board member)
const updateList = async (req, res, next) => {
  try {
    const { listId } = req.params;
    const { title, position } = req.body;

    const list = await List.findById(listId);
    if (!list) {
      return next(new AppError('List not found', 404, 'LIST_NOT_FOUND'));
    }

    const board = await Board.findById(list.board);
    if (!board) {
      return next(new AppError('Associated board not found', 404, 'BOARD_NOT_FOUND'));
    }

    const isMember = board.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return next(
        new AppError('You do not have permission to update this list', 403, 'FORBIDDEN_BOARD_ACCESS')
      );
    }

    if (title !== undefined) list.title = title;
    if (position !== undefined) list.position = position;

    await list.save();

    return sendSuccess(res, 200, { list });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a list and its tasks
// @route   DELETE /api/lists/:listId
// @access  Private (Board member)
const deleteList = async (req, res, next) => {
  try {
    const { listId } = req.params;

    const list = await List.findById(listId);
    if (!list) {
      return next(new AppError('List not found', 404, 'LIST_NOT_FOUND'));
    }

    const board = await Board.findById(list.board);
    if (!board) {
      return next(new AppError('Associated board not found', 404, 'BOARD_NOT_FOUND'));
    }

    const isMember = board.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return next(
        new AppError('You do not have permission to delete this list', 403, 'FORBIDDEN_BOARD_ACCESS')
      );
    }

    // Cascade delete tasks in this list
    await Task.deleteMany({ list: listId });
    await List.findByIdAndDelete(listId);

    return sendSuccess(res, 200, { message: 'List and associated tasks deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createList,
  getListsByBoard,
  updateList,
  deleteList
};
