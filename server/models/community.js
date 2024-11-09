import mongoose from 'mongoose';

// Define the schema for the community model
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

// Create the community model
const Community = mongoose.model('Community', communitySchema);
export default Community;
