import axios from 'axios'

const API_URL = '/api/bookings/'

// Create new booking
const createBooking = async (bookingData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.post(API_URL, bookingData, config)

    return response.data
}

// Get user bookings
const getMyBookings = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.get(API_URL + 'mybookings', config)

    return response.data
}

const bookingService = {
    createBooking,
    getMyBookings,
}

export default bookingService