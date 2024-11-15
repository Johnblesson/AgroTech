import mongoose from "mongoose";

// Define the schema for the application model
const applySchema = new mongoose.Schema({
    title: String,
    phone: String,
    location: String,
    username: String,
    applyPid: String,
    price: String,
    qty: String,
    address: String,
    address2: String,
    createdBy : String,
    role: String,
    comments : String,
    assignedStaff: String,
    staffInCharge: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
});

// Create the application model
const Application = mongoose.model('applications', applySchema);

export default Application;
