const express = require('express')
const router = express.Router()
const { createBooking, getMyBookings } = require('../controllers/bookingController')
const { protect } = require('../middleware/authMiddleware')

// Both routes need protection (must be logged in)
router.post('/', protect, createBooking)
router.get('/my-bookings', protect, getMyBookings)

module.exports = router