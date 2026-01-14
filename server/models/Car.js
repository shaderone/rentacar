const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        make: {
            type: String,
            required: true,
            trim: true,
        },
        model: {
            type: String,
            required: true,
            trim: true,
        },
        year: {
            type: Number,
            required: true,
            min: 1900,
        },
        plateNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        pricePerDay: {
            type: Number,
            required: true,
            min: 0,
        },
        fuelType: {
            type: String,
            enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
            required: true,
        },
        transmission: {
            type: String,
            enum: ['Automatic', 'Manual'],
            required: true,
        },
        seats: {
            type: Number,
            default: 5,
            min: 1,
        },
        images: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: ['Available', 'Rented', 'Maintenance'],
            default: 'Available',
        },
        adminApproved: {
            type: Boolean,
            default: false,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Car', carSchema);
