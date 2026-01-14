import axios from 'axios'

const API_URL = '/api/cars'

// Create new car (multipart/form-data with multiple images)
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

// Get all cars (public)
const getCars = async () => {
    const response = await axios.get(API_URL)
    return response.data
}

const carService = {
    createCar,
    getCars,
}

export default carService