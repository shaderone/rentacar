import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import carService from './carService'

// 1. Initial State (The empty vault)
const initialState = {
    cars: [],
    car: {},
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
}

// 2. Create Car Thunk (The Async Action)
// This function talks to the Service, waits, and returns the result to the Slice
export const createCar = createAsyncThunk(
    'cars/create',
    async (carData, thunkAPI) => {
        try {
            // We need the token from the Auth part of the state!
            // thunkAPI.getState() lets us look into other parts of the Redux Store
            const token = thunkAPI.getState().auth.user.token
            return await carService.createCar(carData, token)
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

// 3. Get Cars Thunk
export const getCars = createAsyncThunk(
    'cars/getAll',
    async (_, thunkAPI) => {
        try {
            return await carService.getCars()
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const carSlice = createSlice({
    name: 'car',
    initialState,
    reducers: {
        // Standard synchronous reducer (simple logic)
        reset: (state) => initialState,
    },
    // Extra Reducers: Handle the lifecycle of the Thunks (Async logic)
    extraReducers: (builder) => {
        builder
            // --- Create Car Lifecycle ---
            .addCase(createCar.pending, (state) => {
                state.isLoading = true
            })
            .addCase(createCar.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                // Add the new car to the existing list
                state.cars.push(action.payload)
                state.car = action.payload
            })
            .addCase(createCar.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            // --- Get Cars Lifecycle ---
            .addCase(getCars.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getCars.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                // Replace the empty array with the cars from backend
                state.cars = action.payload
            })
            .addCase(getCars.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
    },
})

export const { reset } = carSlice.actions
export default carSlice.reducer