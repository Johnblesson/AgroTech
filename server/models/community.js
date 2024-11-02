// models/Community.js
import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  post: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
  ],
  comments: [
    {
      text: String,
      commentedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const Community = mongoose.model('Community', communitySchema);
export default Community;
