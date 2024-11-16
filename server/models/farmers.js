import mongoose from "mongoose";

// Define the schema for the agents model
const agentSchema = new mongoose.Schema({
    fullname: String,
    phone: String,
    email: String,
    address: String,
    address2: String,
    username: String,
    createdBy : String,
    comments : String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
});

// Create the agents model
const Farmers = mongoose.model('agents-program', agentSchema);

export default Farmers;