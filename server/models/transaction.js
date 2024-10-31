import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    date: String,
    aid: String,
    ownerName: String,
    buyerName: String,
    tenantName: String,
    amount: Number,
    ownerPercent: Number,
    buyerTenantPercent: Number,
    totalPercentAmount: Number,
    createdBy: String,
    username: String,
    comments : String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
});

const Transactions = mongoose.model('transaction', transactionSchema);

export default Transactions;