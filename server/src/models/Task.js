const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: [true, 'List reference is required'],
      index: true
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Board reference is required'],
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required']
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in_progress', 'done'],
        message: '{VALUE} is not a valid status'
      },
      default: 'todo',
      index: true
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority'
      },
      default: 'medium',
      index: true
    },
    dueDate: {
      type: Date,
      default: null
    },
    position: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ list: 1, position: 1 });
taskSchema.index({ board: 1, status: 1 });
taskSchema.index({ board: 1, priority: 1 });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
