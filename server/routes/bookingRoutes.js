const express = require('express')
const router = express.Router()
const { createBooking, getMyBookings, getHostBookings, updateBookingStatus, cancelBooking, notifyUser } = require('../controllers/bookingController')
const { protect } = require('../middleware/authMiddleware')

// Both routes need protection (must be logged in)
router.post('/', protect, createBooking)
router.get('/my-bookings', protect, getMyBookings)
router.get('/host-requests', protect, getHostBookings)
router.put('/:id', protect, updateBookingStatus)
router.put('/:id/cancel', protect, cancelBooking)
router.post('/:id/notify', protect, notifyUser)


module.exports = router