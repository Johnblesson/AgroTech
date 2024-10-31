import mongoose from "mongoose";

const boostSchema = new mongoose.Schema({
    phone: String,
    location: String,
    username: String,
    applyAid: String,
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

const Boost = mongoose.model('boosts', boostSchema);

export default Boost;
