const mongoose = require('mongoose');

const listSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'List title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Board reference is required'],
      index: true
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

listSchema.index({ board: 1, position: 1 });

const List = mongoose.model('List', listSchema);
module.exports = List;
