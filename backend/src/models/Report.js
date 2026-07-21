import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  contentType: {
    type: String,
    enum: ['post', 'comment', 'user'],
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending',
    index: true
  },
  actionTaken: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);
export default Report;
