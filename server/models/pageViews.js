import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the schema for page views
const pageViewsSchema = new Schema({
  page: {
    type: String,
    required: true, // e.g., 'guestPage', 'homePage', etc.
    unique: true,   // Ensures there's only one document per page
  },
  views: {
    type: Number,
    default: 0,    // Default views is 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now,  // Timestamp of the last view
  },
});

// Add a pre-save hook to update the lastUpdated field automatically
pageViewsSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Create the model from the schema
const PageViews = mongoose.model('PageViews', pageViewsSchema);

export default PageViews;
