import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  architecture: {
    type: String, // Mermaid markup text or architecture description
    default: ''
  },
  techStack: {
    type: [String],
    default: [],
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
    index: true
  },
  isOpenSourceContribution: {
    type: Boolean,
    default: false,
    index: true
  },
  screenshots: {
    type: [String],
    default: []
  },
  github: {
    type: String,
    default: ''
  },
  demo: {
    type: String,
    default: ''
  },
  installation: {
    type: String, // Installation Markdown command instructions
    default: ''
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
