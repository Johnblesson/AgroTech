import mongoose from "mongoose";

// Define the schema for the boost model
const boostSchema = new mongoose.Schema({
    title: String,
    phone: String,
    location: String,
    username: String,
    applyPid: String,
    address: String,
    address2: String,
    createdBy : String,
    comments : String,
    payment: {
        type: Boolean,
        default: false,
    },
    duration : String,
    expiration: {
        type: String,
        enum: ['vaild', 'invaild'],
        default: 'invaild',
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
});

// Create the boost model
const Boost = mongoose.model('boosts', boostSchema);

export default Boost;
