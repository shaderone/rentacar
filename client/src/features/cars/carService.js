import axios from 'axios'

const API_URL = `${import.meta.env.VITE_API_URL || '/api'}/cars/`

// Create new car
const createCar = async (carData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            // REMOVED: 'Content-Type': 'multipart/form-data', 
            // Why? Axios detects FormData and sets the correct header + boundary automatically.
        },
    }

    const response = await axios.post(API_URL, carData, config)
    return response.data
}

// Get all cars (Public)
const getCars = async () => {
    const response = await axios.get(API_URL)
    return response.data
}

// Get single car by ID (Public)
// UPDATED: Removed token requirement so guests can see car details
const getCar = async (carId) => {
    const response = await axios.get(API_URL + carId)
    return response.data
}

// Delete user car
const deleteCar = async (carId, token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    }
    const response = await axios.delete(API_URL + carId, config)
    return response.data
}

// Update user car
const updateCar = async (carId, carData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            // No Content-Type needed for FormData, Axios handles it
        },
    }
    const response = await axios.put(API_URL + carId, carData, config)
    return response.data
}

const carService = {
    createCar,
    getCars,
    getCar,
    deleteCar,
    updateCar,
}

export default carService