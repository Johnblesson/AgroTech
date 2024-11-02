import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    pid: { 
        type: Number,
        unique: true,
        default: 1000,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    typeOfProduct: {
        type: String,
        required: true,
        enum: ['Crop', 'Livestock', 'Equipment', 'Other']
    },
    price: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
        enum: ['SLL', 'USD', 'EUR'] // Add other relevant currencies
    },
    location: {
        type: String,
        required: true,
    },
    photos: [{
        type: String,
    }],
    region: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    }, 
    negotiation: {
        type: String,
        enum: ['Negotiable', 'Non Negotiable'],
        required: true,
    },
    availability: {
        type: String,
        enum: ['Available', 'Not Available'],
        default: 'Available',
    },
    verification: {
        type: String,
        enum: ['verified', 'not verified'],
        default: 'not verified',
    },
    sponsored: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: String,
        required: true,
    },
    role: {
        type: String,
    },
    clicks: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
});

// Virtual property to format the price with commas
productSchema.virtual('formattedPrice').get(function() {
    return this.price.toLocaleString();
});

const Products = mongoose.model('Product', productSchema);

export default Products;
