const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Board owner is required'],
      index: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

boardSchema.index({ members: 1 });

// Ensure owner is always in members list
boardSchema.pre('save', function (next) {
  if (this.owner && !this.members.some((m) => m.toString() === this.owner.toString())) {
    this.members.push(this.owner);
  }
  next();
});

const Board = mongoose.model('Board', boardSchema);
module.exports = Board;
