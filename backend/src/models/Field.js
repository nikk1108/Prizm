import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  parentField: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    default: null,
    index: true
  },
  hierarchyPath: {
    type: String,
    default: '',
    index: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followersCount: {
    type: Number,
    default: 0
  },
  postsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

fieldSchema.pre('save', async function (next) {
  if (this.isModified('parentField') || this.isModified('name')) {
    if (this.parentField) {
      const parent = await mongoose.model('Field').findById(this.parentField);
      if (parent) {
        this.hierarchyPath = parent.hierarchyPath 
          ? `${parent.hierarchyPath} → ${this.name}`
          : `${parent.name} → ${this.name}`;
      } else {
        this.hierarchyPath = this.name;
      }
    } else {
      this.hierarchyPath = this.name;
    }
  } else if (!this.hierarchyPath) {
    this.hierarchyPath = this.name;
  }
  next();
});

const Field = mongoose.model('Field', fieldSchema);
export default Field;
