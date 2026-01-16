const mongoose = require('mongoose')

const bookingSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        car: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Car',
        },
        startDate: {
            type: Date,
            required: [true, 'Please add a start date'],
        },
        endDate: {
            type: Date,
            required: [true, 'Please add an end date'],
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            // ⚠️ UPDATED ENUM to match your full workflow
            enum: ['Pending', 'Approved', 'Confirmed', 'Active', 'Completed', 'Cancelled', 'Rejected'],
            default: 'Pending',
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Paid'],
            default: 'Pending',
        }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Booking', bookingSchema)