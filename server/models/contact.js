import mongoose from "mongoose";

// Define the schema for the contact model
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

// Create the contact model
const Contacts = mongoose.model('contact', contactSchema);

export default Contacts;