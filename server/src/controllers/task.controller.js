const Task = require('../models/Task');
const List = require('../models/List');
const Board = require('../models/Board');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { sendSuccess } = require('../utils/apiResponse');

// Helper to check user membership in a board
const verifyBoardMembership = async (boardId, userId) => {
  const board = await Board.findById(boardId);
  if (!board) {
    throw new AppError('Associated board not found', 404, 'BOARD_NOT_FOUND');
  }

  const isMember = board.members.some(
    (m) => m.toString() === userId.toString()
  );

  if (!isMember) {
    throw new AppError('You do not have access to this board', 403, 'FORBIDDEN_BOARD_ACCESS');
  }

  return board;
};

// @desc    Create a new task in a list
// @route   POST /api/lists/:listId/tasks
// @access  Private (Board member)
const createTask = async (req, res, next) => {
  try {
    const { listId } = req.params;
    const { title, description, assignedTo, status, priority, dueDate, position } = req.body;

    const list = await List.findById(listId);
    if (!list) {
      return next(new AppError('List not found', 404, 'LIST_NOT_FOUND'));
    }

    const board = await verifyBoardMembership(list.board, req.user._id);

    // Validate assigned user belongs to this board
    if (assignedTo) {
      const isAssignedMember = board.members.some(
        (m) => m.toString() === assignedTo.toString()
      );
      if (!isAssignedMember) {
        return next(
          new AppError('Assigned user must be a member of this board', 400, 'USER_NOT_BOARD_MEMBER')
        );
      }
    }

    // Determine position
    let taskPosition = position;
    if (taskPosition === undefined) {
      const highestTask = await Task.findOne({ list: listId }).sort({ position: -1 });
      taskPosition = highestTask ? highestTask.position + 1000 : 1000;
    }

    const task = await Task.create({
      title,
      description,
      list: listId,
      board: board._id,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      position: taskPosition
    });

    await task.populate([
      { path: 'assignedTo', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' }
    ]);

    return sendSuccess(res, 201, { task });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks in a list
// @route   GET /api/lists/:listId/tasks
// @access  Private (Board member)
const getTasksByList = async (req, res, next) => {
  try {
    const { listId } = req.params;

    const list = await List.findById(listId);
    if (!list) {
      return next(new AppError('List not found', 404, 'LIST_NOT_FOUND'));
    }

    await verifyBoardMembership(list.board, req.user._id);

    const tasks = await Task.find({ list: listId })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ position: 1 });

    return sendSuccess(res, 200, { tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:taskId
// @access  Private (Board member)
const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('list', 'title board');

    if (!task) {
      return next(new AppError('Task not found', 404, 'TASK_NOT_FOUND'));
    }

    await verifyBoardMembership(task.board, req.user._id);

    return sendSuccess(res, 200, { task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PATCH /api/tasks/:taskId
// @access  Private (Board member)
const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const {
      title,
      description,
      assignedTo,
      status,
      priority,
      dueDate,
      position,
      list: newListId
    } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return next(new AppError('Task not found', 404, 'TASK_NOT_FOUND'));
    }

    const board = await verifyBoardMembership(task.board, req.user._id);

    // If moving to another list, verify target list is on same board
    if (newListId && newListId !== task.list.toString()) {
      const targetList = await List.findById(newListId);
      if (!targetList) {
        return next(new AppError('Target list not found', 404, 'TARGET_LIST_NOT_FOUND'));
      }
      if (targetList.board.toString() !== task.board.toString()) {
        return next(new AppError('Cannot move task to a list on another board', 400, 'CROSS_BOARD_MOVE_INVALID'));
      }
      task.list = newListId;
    }

    // Validate assignedTo if changing
    if (assignedTo !== undefined) {
      if (assignedTo) {
        const isAssignedMember = board.members.some(
          (m) => m.toString() === assignedTo.toString()
        );
        if (!isAssignedMember) {
          return next(
            new AppError('Assigned user must be a member of this board', 400, 'USER_NOT_BOARD_MEMBER')
          );
        }
        task.assignedTo = assignedTo;
      } else {
        task.assignedTo = null;
      }
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (position !== undefined) task.position = position;

    await task.save();

    await task.populate([
      { path: 'assignedTo', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'list', select: 'title board' }
    ]);

    return sendSuccess(res, 200, { task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:taskId/status
// @access  Private (Board member)
const updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return next(new AppError('Task not found', 404, 'TASK_NOT_FOUND'));
    }

    await verifyBoardMembership(task.board, req.user._id);

    task.status = status;
    await task.save();

    await task.populate([
      { path: 'assignedTo', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' }
    ]);

    return sendSuccess(res, 200, { task });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign task to a user
// @route   PATCH /api/tasks/:taskId/assign
// @access  Private (Board member)
const assignTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return next(new AppError('Task not found', 404, 'TASK_NOT_FOUND'));
    }

    const board = await verifyBoardMembership(task.board, req.user._id);

    if (userId) {
      const isMember = board.members.some(
        (m) => m.toString() === userId.toString()
      );
      if (!isMember) {
        return next(
          new AppError('Assigned user must be a member of this board', 400, 'USER_NOT_BOARD_MEMBER')
        );
      }
      task.assignedTo = userId;
    } else {
      task.assignedTo = null;
    }

    await task.save();

    await task.populate([
      { path: 'assignedTo', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' }
    ]);

    return sendSuccess(res, 200, { task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:taskId
// @access  Private (Board member)
const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return next(new AppError('Task not found', 404, 'TASK_NOT_FOUND'));
    }

    await verifyBoardMembership(task.board, req.user._id);

    await Task.findByIdAndDelete(taskId);

    return sendSuccess(res, 200, { message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Filter and paginate tasks across user's accessible boards
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const {
      boardId,
      listId,
      status,
      priority,
      assignedTo,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Determine boards accessible to user
    const userBoards = await Board.find({ members: req.user._id }).select('_id');
    const accessibleBoardIds = userBoards.map((b) => b._id);

    const query = {};

    if (boardId) {
      // Validate access to specific board
      const hasAccess = accessibleBoardIds.some((id) => id.toString() === boardId.toString());
      if (!hasAccess) {
        return next(new AppError('You do not have access to this board', 403, 'FORBIDDEN_BOARD_ACCESS'));
      }
      query.board = boardId;
    } else {
      query.board = { $in: accessibleBoardIds };
    }

    if (listId) {
      query.list = listId;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignedTo) {
      if (assignedTo === 'unassigned') {
        query.assignedTo = null;
      } else {
        query.assignedTo = assignedTo;
      }
    }

    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignedTo', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .populate('board', 'title')
        .populate('list', 'title')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Task.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return sendSuccess(res, 200, tasks, {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasksByList,
  getTaskById,
  updateTask,
  updateTaskStatus,
  assignTask,
  deleteTask,
  getTasks
};
