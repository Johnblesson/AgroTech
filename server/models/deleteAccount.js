import mongoose from "mongoose";

// Define the schema for the contact model
const deleteAccountSchema = new mongoose.Schema({
    fullname: String,
    createdBy : String,
    reason: String,
    msg : String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
});

// Create the deleteAccount model
const DeleteAccounts = mongoose.model('deleteAccount', deleteAccountSchema);

export default DeleteAccounts;