import mongoose from "mongoose";

// Define the schema for the agroNews model
const agroNewsSchema = new mongoose.Schema({
    title: String,
    date: { type: Date, default: Date.now },
    source: String,
    sourceLink: String,
    location: String,
    createdBy : String,
    newsDetail : String,
    hashtags: [String], // Ensure this is an array
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
});

// Create the agroNews model
const AgroNews = mongoose.model('agroNews', agroNewsSchema);

export default AgroNews;