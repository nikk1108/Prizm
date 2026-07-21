import mongoose from 'mongoose';

const reputationHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  points: {
    type: Number,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['post_upvote', 'comment_upvote', 'answer_accepted', 'post_created', 'spam_penalty', 'admin_adjustment']
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  referenceType: {
    type: String,
    enum: ['post', 'comment', 'report']
  }
}, {
  timestamps: true
});

const ReputationHistory = mongoose.model('ReputationHistory', reputationHistorySchema);
export default ReputationHistory;
