import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['insight', 'research', 'tutorial', 'project', 'question', 'resource', 'news'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  content: {
    type: String,
    required: [true, 'Please provide post content']
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    required: true,
    index: true
  },
  tags: {
    type: [String],
    default: [],
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  readingTime: {
    type: Number,
    default: 1
  },
  language: {
    type: String,
    default: 'en'
  },
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public',
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  featuredUntil: {
    type: Date
  },
  upvotesCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  attachments: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  sourceLinks: {
    type: [String],
    default: []
  },
  researchDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Research',
    index: true
  },
  projectDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
  resourceDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    index: true
  }
}, {
  timestamps: true
});

// Auto-calculate reading time before saving
postSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const words = this.content ? this.content.split(/\s+/).length : 0;
    this.readingTime = Math.max(1, Math.ceil(words / 200));
  }
  next();
});

const Post = mongoose.model('Post', postSchema);
export default Post;
