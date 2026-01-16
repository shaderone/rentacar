const asyncHandler = require('express-async-handler')
const Booking = require('../models/Booking')
const Car = require('../models/Car')

// @desc    Book a car
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
    // ⚠️ Added totalPrice to destructuring to accept the calculated total (w/ tax) from frontend
    const { carId, startDate, endDate, totalPrice } = req.body

    if (!carId || !startDate || !endDate || !totalPrice) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (new Date(startDate) < today) {
        res.status(400)
        throw new Error('Cannot book dates in the past')
    }

    const car = await Car.findById(carId)
    if (!car) {
        res.status(404)
        throw new Error('Car not found')
    }

    // --- OVERLAP CHECK (Keep this, it's good logic) ---
    const bookingConflict = await Booking.findOne({
        car: carId,
        status: { $nin: ['Cancelled', 'Rejected'] }, // Ignore Cancelled OR Rejected
        $or: [
            {
                startDate: { $lte: new Date(startDate) },
                endDate: { $gte: new Date(startDate) }
            },
            {
                startDate: { $lte: new Date(endDate) },
                endDate: { $gte: new Date(endDate) }
            },
            {
                startDate: { $gte: new Date(startDate) },
                endDate: { $lte: new Date(endDate) }
            }
        ]
    })

    if (bookingConflict) {
        res.status(400)
        throw new Error('Car is already booked for these dates')
    }

    // --- CREATE BOOKING ---
    const booking = await Booking.create({
        user: req.user.id,
        car: carId,
        startDate,
        endDate,
        totalPrice, // ⚠️ Use the price from frontend (includes tax/deposit)
        status: 'Pending' // ⚠️ Force status to Pending
    })

    res.status(201).json(booking)
})

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user.id })
        .populate({
            path: 'car',
            select: 'make model images location pricePerDay'
        })
        .sort('-createdAt'); // Sort by newest first

    res.status(200).json(bookings);
});

module.exports = {
    createBooking,
    getMyBookings,
}