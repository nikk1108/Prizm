import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['internship', 'research_position', 'open_source_program', 'university_lab'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'Remote'
  },
  stipend: {
    type: String,
    default: 'Unpaid'
  },
  link: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: [],
    index: true
  }
}, {
  timestamps: true
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
