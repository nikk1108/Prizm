import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  resourceType: {
    type: String,
    enum: ['book', 'course', 'documentation', 'dataset', 'cheatsheet', 'interview_q', 'github', 'paper', 'tool'],
    required: true,
    index: true
  },
  url: {
    type: String,
    required: [true, 'Please provide the resource link']
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
