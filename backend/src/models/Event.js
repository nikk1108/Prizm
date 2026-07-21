import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['hackathon', 'conference', 'meetup', 'workshop', 'webinar'],
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
  location: {
    type: String, // Physical location or URL link
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  deadline: {
    type: Date
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  link: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
