import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  targetType: {
    type: String,
    enum: ['post', 'comment'],
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['like', 'upvote'],
    default: 'upvote'
  }
}, {
  timestamps: true
});

// Ensure a user can only react once per post/comment
reactionSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

const Reaction = mongoose.model('Reaction', reactionSchema);
export default Reaction;
