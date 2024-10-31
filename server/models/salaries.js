import mongoose from "mongoose";

const salariesSchema = new mongoose.Schema({
    date: Date,
    staffName: String,
    position: String,
    salaries: String,
    salaryMonth: String,
    approvedBy: String,
    createdBy : String,
    username: String,
    comments : String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
});

const Salaries = mongoose.model('Salaries', salariesSchema);

export default Salaries;