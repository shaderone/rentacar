const mongoose = require('mongoose');

const carSchema = mongoose.Schema({
    // RELATIONAL LINK: connects this car to a specific Host User
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    make: {
        type: String,
        required: [true, 'Please add the car make (e.g. Toyota)']
    },
    model: {
        type: String,
        required: [true, 'Please add the car model (e.g. Camry)']
    },
    year: {
        type: Number,
        required: [true, 'Please add the car year']
    },
    plateNumber: {
        type: String,
        required: [true, 'Please add the license plate number'],
        unique: true // No two cars can have the same plate
    },
    pricePerDay: {
        type: Number,
        required: [true, 'Please add the daily rental price']
    },

    // SPECIFICATIONS
    fuelType: {
        type: String,
        enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
        required: true
    },
    transmission: {
        type: String,
        enum: ['Automatic', 'Manual'],
        required: true
    },
    seats: {
        type: Number,
        default: 5
    },
    mileage: {
        type: String, // e.g., "15 km/l" or "400 km range"
        required: false
    },

    // IMAGES (We will store URLs here later)
    images: {
        type: [String],
        default: []
    },

    // STATUS FLAGS
    status: {
        type: String,
        enum: ['Available', 'Rented', 'Maintenance'],
        default: 'Available'
    },
    description: {
        type: String,
        required: [true, 'Please add a brief description']
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    // ADMIN CONTROL
    adminApproved: {
        type: Boolean,
        default: false // Default to false so they require approval
    }
});

module.exports = mongoose.model('Car', carSchema);