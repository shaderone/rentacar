const asyncHandler = require('express-async-handler')
const Booking = require('../models/Booking')
const Car = require('../models/Car')

// @desc    Book a car
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
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

    const bookingConflict = await Booking.findOne({
        car: carId,
        status: { $nin: ['Cancelled', 'Rejected'] },
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
        totalPrice,
        status: 'Pending'
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

// @desc    Get bookings for cars owned by the logged-in user (Host)
// @route   GET /api/bookings/host-requests
// @access  Private
const getHostBookings = async (req, res) => {
    try {
        // 1. Find all cars that belong to this Host (req.user.id)
        const cars = await Car.find({ owner: req.user.id })

        // 2. If host has no cars, return empty array immediately
        if (!cars.length) {
            return res.status(200).json([])
        }

        // 3. Get the IDs of those cars
        const carIds = cars.map(car => car._id)

        // 4. Find Bookings where the 'car' field is one of those IDs
        const bookings = await Booking.find({ car: { $in: carIds } })
            .populate('user', 'name email') // Show Renter details (User model)
            .populate('car')                // Show Car details
            .sort({ createdAt: -1 })        // Newest requests first

        res.status(200).json(bookings)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Update booking status (Handles both Host & Renter actions)
// @route   PUT /api/bookings/:id
// @access  Private
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body

        // 1. Find booking and populate BOTH car and user to check permissions
        const booking = await Booking.findById(req.params.id)
            .populate('car')
            .populate('user')

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' })
        }

        // 2. Identify who is making the request
        const isHost = booking.car.owner.toString() === req.user.id
        const isRenter = booking.user._id.toString() === req.user.id

        // 3. Permission Logic
        if (isHost) {
            // Host can change status to anything (Approve, Reject, Active, Completed)
            booking.status = status
        }
        else if (isRenter) {
            // Renter can ONLY 'Cancel' or 'Confirmed' (Payment success)
            if (status === 'Cancelled' || status === 'Confirmed') {
                booking.status = status
            } else {
                return res.status(401).json({ message: 'Renters can only Cancel or Pay for bookings' })
            }
        }
        else {
            // User is neither the Host nor the Renter
            return res.status(401).json({ message: 'Not authorized to manage this booking' })
        }

        const updatedBooking = await booking.save()

        // Return fully populated booking so frontend UI updates correctly
        const fullBooking = await Booking.findById(updatedBooking._id)
            .populate('user', 'name email')
            .populate('car')

        res.status(200).json(fullBooking)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


// @desc    Cancel booking (User/Renter Only)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' })
        }

        // Ensure the logged-in user owns this booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' })
        }

        booking.status = 'Cancelled'
        await booking.save()

        res.status(200).json(booking)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Simulate sending a notification email
// @route   POST /api/bookings/:id/notify
// @access  Private (Host Only)
const notifyUser = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('user')

        if (!booking) return res.status(404).json({ message: 'Booking not found' })

        // Check if host owns the car (optional but good practice)
        // const isHost = ... (you can add this check if you want strict security)

        // SIMULATE EMAIL SERVICE
        console.log(`--------------------------------------------------`)
        console.log(`[MOCK EMAIL SERVICE]`)
        console.log(`TO: ${booking.user.email}`)
        console.log(`SUBJECT: Payment Reminder for Booking ${booking._id}`)
        console.log(`BODY: Dear ${booking.user.name}, please complete your payment.`)
        console.log(`--------------------------------------------------`)

        res.status(200).json({ message: `Reminder sent to ${booking.user.name}` })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Don't forget to export it!
module.exports = {
    // ... others
    notifyUser
}

module.exports = {
    createBooking,
    getMyBookings,
    getHostBookings,
    updateBookingStatus,
    cancelBooking,
    notifyUser,
}