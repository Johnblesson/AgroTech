import mongoose from "mongoose";

const staffsSchema = new mongoose.Schema({
    dateOfEmployment: String,
    staffName: String,
    position: String,
    phone: String,
    email: String,
    address: String,
    address2: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    createdBy : String,
    username: String,
    comments : String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
});

const Staffs = mongoose.model('staffs', staffsSchema);

export default Staffs;