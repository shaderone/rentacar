import axios from 'axios'

// 1. Use the Env Variable
// Result: "/api" + "/cars/" = "/api/cars/"
const API_URL = `${import.meta.env.VITE_API_URL || '/api'}/cars/`

// Create new car
const createCar = async (carData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    }

    const response = await axios.post(API_URL, carData, config)
    return response.data
}

// Get all cars
const getCars = async () => {
    const response = await axios.get(API_URL)
    return response.data
}

// Get single car by ID
const getCar = async (carId, token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    }
    // API_URL already has the slash at the end, so just add ID
    // "/api/cars/" + "123" = "/api/cars/123"
    const response = await axios.get(API_URL + carId, config)
    return response.data
}

const carService = {
    createCar,
    getCars,
    getCar,
}

export default carService