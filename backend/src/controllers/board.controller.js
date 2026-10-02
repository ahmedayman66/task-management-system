const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { sendSuccess } = require('../utils/apiResponse');

// @desc    Create a new board
// @route   POST /api/boards
// @access  Private
const createBoard = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const board = await Board.create({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id]
    });

    await board.populate([
      { path: 'owner', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' }
    ]);

    return sendSuccess(res, 201, { board });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all boards for current user
// @route   GET /api/boards
// @access  Private
const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({
      members: req.user._id
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 });

    return sendSuccess(res, 200, { boards });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single board by ID
// @route   GET /api/boards/:boardId
// @access  Private (Member)
const getBoardById = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findById(boardId)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!board) {
      return next(new AppError('Board not found', 404, 'BOARD_NOT_FOUND'));
    }

    // Verify membership
    const isMember = board.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return next(
        new AppError('You do not have access to this board', 403, 'FORBIDDEN_BOARD_ACCESS')
      );
    }

    return sendSuccess(res, 200, { board });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a board
// @route   PATCH /api/boards/:boardId
// @access  Private (Owner only)
const updateBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { title, description } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return next(new AppError('Board not found', 404, 'BOARD_NOT_FOUND'));
    }

    // Only owner can update board settings
    if (board.owner.toString() !== req.user._id.toString()) {
      return next(
        new AppError('Only the board owner can update board settings', 403, 'FORBIDDEN_OWNER_ONLY')
      );
    }

    if (title !== undefined) board.title = title;
    if (description !== undefined) board.description = description;

    await board.save();
    await board.populate([
      { path: 'owner', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' }
    ]);

    return sendSuccess(res, 200, { board });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a board (cascades to lists and tasks)
// @route   DELETE /api/boards/:boardId
// @access  Private (Owner only)
const deleteBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findById(boardId);
    if (!board) {
      return next(new AppError('Board not found', 404, 'BOARD_NOT_FOUND'));
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return next(
        new AppError('Only the board owner can delete this board', 403, 'FORBIDDEN_OWNER_ONLY')
      );
    }

    // Cascade delete: lists and tasks belonging to board
    await Task.deleteMany({ board: boardId });
    await List.deleteMany({ board: boardId });
    await Board.findByIdAndDelete(boardId);

    return sendSuccess(res, 200, { message: 'Board and all associated data deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a member to a board
// @route   POST /api/boards/:boardId/members
// @access  Private (Owner or member)
const addMember = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { email, userId } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return next(new AppError('Board not found', 404, 'BOARD_NOT_FOUND'));
    }

    // Check membership of requester
    const isMember = board.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return next(
        new AppError('You must be a member of this board to add others', 403, 'FORBIDDEN_BOARD_ACCESS')
      );
    }

    let userToAdd;
    if (userId) {
      userToAdd = await User.findById(userId);
    } else if (email) {
      userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!userToAdd) {
      return next(new AppError('User to add not found', 404, 'USER_NOT_FOUND'));
    }

    if (board.members.some((m) => m.toString() === userToAdd._id.toString())) {
      return next(new AppError('User is already a member of this board', 409, 'ALREADY_MEMBER'));
    }

    board.members.push(userToAdd._id);
    await board.save();

    await board.populate([
      { path: 'owner', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' }
    ]);

    return sendSuccess(res, 200, { board });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a member from a board
// @route   DELETE /api/boards/:boardId/members/:userId
// @access  Private (Owner only)
const removeMember = async (req, res, next) => {
  try {
    const { boardId, userId } = req.params;

    const board = await Board.findById(boardId);
    if (!board) {
      return next(new AppError('Board not found', 404, 'BOARD_NOT_FOUND'));
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return next(
        new AppError('Only the board owner can remove members', 403, 'FORBIDDEN_OWNER_ONLY')
      );
    }

    if (board.owner.toString() === userId) {
      return next(
        new AppError('Board owner cannot be removed from the board', 400, 'CANNOT_REMOVE_OWNER')
      );
    }

    board.members = board.members.filter((m) => m.toString() !== userId);
    await board.save();

    // Also unassign this user from tasks on this board
    await Task.updateMany(
      { board: boardId, assignedTo: userId },
      { $set: { assignedTo: null } }
    );

    await board.populate([
      { path: 'owner', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' }
    ]);

    return sendSuccess(res, 200, { board });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  addMember,
  removeMember
};
