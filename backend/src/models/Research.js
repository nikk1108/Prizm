import mongoose from 'mongoose';

const researchSchema = new mongoose.Schema({
  abstract: {
    type: String,
    required: [true, 'Please provide the research abstract']
  },
  summary: {
    type: String,
    default: ''
  },
  doi: {
    type: String,
    trim: true,
    index: true
  },
  publication: {
    type: String,
    default: ''
  },
  institution: {
    type: String,
    default: ''
  },
  publicationDate: {
    type: Date,
    default: Date.now
  },
  authors: {
    type: [String],
    default: []
  },
  pdfUrl: {
    type: String,
    default: ''
  },
  githubRepo: {
    type: String,
    default: ''
  },
  externalLinks: {
    type: [String],
    default: []
  },
  isApproved: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

const Research = mongoose.model('Research', researchSchema);
export default Research;
