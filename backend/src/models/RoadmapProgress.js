import mongoose from 'mongoose';

const roadmapProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  roadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    required: true,
    index: true
  },
  completedSteps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoadmapStep'
  }],
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure a user can only have one progress tracker per roadmap
roadmapProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });

const RoadmapProgress = mongoose.model('RoadmapProgress', roadmapProgressSchema);
export default RoadmapProgress;
