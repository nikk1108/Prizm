import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    indexed: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    optional: true,
    indexed: true
  },
  type: {
    type: String,
    enum: ['view', 'read_complete', 'like', 'bookmark', 'share'],
    required: true,
    indexed: true
  },
  duration: {
    type: Number, // duration in seconds (optional for read completion metrics)
    default: 0
  }
}, {
  timestamps: true
});

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
