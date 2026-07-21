import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  parentCollection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bookmark',
    default: null,
    index: true
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }]
}, {
  timestamps: true
});

// Compound unique constraint: name must be unique per user under the same parent
bookmarkSchema.index({ user: 1, name: 1, parentCollection: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
export default Bookmark;
