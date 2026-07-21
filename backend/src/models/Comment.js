import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: [true, 'Please provide comment content']
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  upvotesCount: {
    type: Number,
    default: 0
  },
  isSolution: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
