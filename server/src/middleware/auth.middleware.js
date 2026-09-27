const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Board = require('../models/Board');
const AppError = require('../utils/appError');

// Authenticate user by verifying JWT
const protect = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('Authentication required. Please provide a valid token.', 401, 'UNAUTHORIZED')
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401, 'USER_NOT_FOUND')
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Check if authenticated user is a member of the board
const requireBoardMember = async (req, res, next) => {
  try {
    const boardId = req.params.boardId || req.body.boardId;
    if (!boardId) {
      return next(new AppError('Board ID is required for authorization check', 400, 'BOARD_ID_REQUIRED'));
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return next(new AppError('Board not found', 404, 'BOARD_NOT_FOUND'));
    }

    const isMember = board.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return next(
        new AppError('You do not have permission to access this board', 403, 'FORBIDDEN_BOARD_ACCESS')
      );
    }

    req.board = board;
    next();
  } catch (error) {
    next(error);
  }
};

// Check if authenticated user is the owner of the board
const requireBoardOwner = async (req, res, next) => {
  try {
    const boardId = req.params.boardId || req.body.boardId;
    if (!boardId) {
      return next(new AppError('Board ID is required', 400, 'BOARD_ID_REQUIRED'));
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return next(new AppError('Board not found', 404, 'BOARD_NOT_FOUND'));
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return next(
        new AppError('Only the board owner can perform this operation', 403, 'FORBIDDEN_OWNER_ONLY')
      );
    }

    req.board = board;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect,
  requireBoardMember,
  requireBoardOwner
};
