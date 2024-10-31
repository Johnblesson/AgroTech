import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    fullname: String,
    phone: String,
    location: String,
    createdBy : String,
    username: String,
    msg : String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
});

const Contacts = mongoose.model('contact', contactSchema);

export default Contacts;