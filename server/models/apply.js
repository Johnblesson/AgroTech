import mongoose from "mongoose";

const applySchema = new mongoose.Schema({
    title: String,
    phone: String,
    location: String,
    username: String,
    applyAid: String,
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

const Application = mongoose.model('applications', applySchema);

export default Application;
