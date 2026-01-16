import axios from 'axios'

const API_URL = '/api/bookings/'

// Create new booking
const createBooking = async (bookingData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } }
    const response = await axios.post(API_URL, bookingData, config)
    return response.data
}

// Get user's own bookings
const getMyBookings = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } }
    const response = await axios.get(API_URL + 'my-bookings', config)
    return response.data
}

// Get host's received requests
const getHostBookings = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } }
    const response = await axios.get(API_URL + 'host-requests', config)
    return response.data
}

// Update status (Approve, Reject, or Cancel by User)
const updateBookingStatus = async (bookingId, status, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } }
    const response = await axios.put(API_URL + bookingId, { status }, config)
    return response.data
}

const bookingService = {
    createBooking,
    getMyBookings,
    getHostBookings,
    updateBookingStatus
}

export default bookingService