import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import carService from './carService'

const initialState = {
    cars: [],
    car: {},
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
}

// 2. Create Car Thunk
export const createCar = createAsyncThunk(
    'cars/create',
    async (carData, thunkAPI) => {
        try {
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

// Get single car
export const getCar = createAsyncThunk(
    'cars/getOne',
    async (id, thunkAPI) => {
        try {
            // UPDATED: No token needed here anymore!
            return await carService.getCar(id)
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

// Delete Car
export const deleteCar = createAsyncThunk(
    'cars/delete',
    async (id, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await carService.deleteCar(id, token)
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

// Update Car
export const updateCar = createAsyncThunk(
    'cars/update',
    async ({ id, carData }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await carService.updateCar(id, carData, token)
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

// Get User's Cars (Host Fleet)
export const getMyCars = createAsyncThunk(
    'cars/getMyCars',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await carService.getMyCars(token)
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const carSlice = createSlice({
    name: 'car',
    initialState,
    reducers: {
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(createCar.pending, (state) => {
                state.isLoading = true
            })
            .addCase(createCar.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.cars.push(action.payload)
                // Optional: Don't set state.car here if you want the form to clear cleanly
            })
            .addCase(createCar.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            .addCase(getCars.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getCars.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.cars = action.payload
            })
            .addCase(getCars.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            .addCase(getCar.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getCar.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.car = action.payload
            })
            .addCase(getCar.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })// DELETE CASES
            .addCase(deleteCar.pending, (state) => {
                state.isLoading = true
            })
            .addCase(deleteCar.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                // Remove the deleted car from the local array instantly
                state.cars = state.cars.filter((car) => car._id !== action.payload.id)
            })
            .addCase(deleteCar.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })

            // UPDATE CASES
            .addCase(updateCar.pending, (state) => {
                state.isLoading = true
            })
            .addCase(updateCar.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.cars = state.cars.map((car) =>
                    car._id === action.payload._id ? action.payload : car
                )
            })
            .addCase(updateCar.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            .addCase(getMyCars.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getMyCars.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.cars = action.payload // 👈 Populates state.cars with ONLY the host's cars
            })
            .addCase(getMyCars.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
    }
})

export const { reset } = carSlice.actions
export default carSlice.reducer