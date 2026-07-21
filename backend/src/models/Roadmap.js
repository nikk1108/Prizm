import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  }
}, {
  timestamps: true
});

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
export default Roadmap;
