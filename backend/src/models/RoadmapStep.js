import mongoose from 'mongoose';

const roadmapStepSchema = new mongoose.Schema({
  roadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  resources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  recommendedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }]
}, {
  timestamps: true
});

// Compound unique index for order in a roadmap
roadmapStepSchema.index({ roadmapId: 1, order: 1 }, { unique: true });

const RoadmapStep = mongoose.model('RoadmapStep', roadmapStepSchema);
export default RoadmapStep;
