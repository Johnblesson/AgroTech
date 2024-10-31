import mongoose from "mongoose";

const expensesSchema = new mongoose.Schema({
    date: String,
    purpose: String,
    amount: Number,
    receivedBy: String,
    approvedBy: String,
    createdBy : String,
    username: String,
    comments : String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
});

const Expenses = mongoose.model('expenses', expensesSchema);

export default Expenses;