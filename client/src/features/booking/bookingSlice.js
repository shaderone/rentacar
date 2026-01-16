import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import bookingService from './bookingService'

const initialState = {
    bookings: [],
    booking: {}, // Added single booking state just in case
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
}

// --- THUNKS ---

// 1. Create new booking (For Renters)
export const createBooking = createAsyncThunk(
    'bookings/create',
    async (bookingData, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await bookingService.createBooking(bookingData, token)
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

// 2. Get user's own bookings (For Renters - My Trips)
export const getMyBookings = createAsyncThunk(
    'bookings/getAll',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await bookingService.getMyBookings(token)
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

// 3. Get Host's received requests (For Hosts - Dashboard)
export const getHostBookings = createAsyncThunk(
    'bookings/getHost',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await bookingService.getHostBookings(token)
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

// 4. Update Status (Approve/Reject/Cancel/Complete)
export const updateBookingStatus = createAsyncThunk(
    'booking/updateStatus',
    async ({ id, status }, thunkAPI) => { // Receiving an object { id, status }
        try {
            const token = thunkAPI.getState().auth.user.token
            // 👇 PASSING (id, status, token) to service
            return await bookingService.updateBookingStatus(id, status, token)
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const cancelBooking = createAsyncThunk('booking/cancel', async (id, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token
        // Pass the ID and Token to the service
        return await bookingService.cancelBooking(id, token)
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

export const notifyUser = createAsyncThunk('booking/notify', async (id, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token
        return await bookingService.notifyUser(id, token)
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

export const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false
            state.isSuccess = false
            state.isError = false
            state.message = ''
        },
    },
    extraReducers: (builder) => {
        builder
            // --- CREATE BOOKING ---
            .addCase(createBooking.pending, (state) => {
                state.isLoading = true
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.bookings.push(action.payload)
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })

            // --- GET MY BOOKINGS (RENTER) ---
            .addCase(getMyBookings.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getMyBookings.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.bookings = action.payload
            })
            .addCase(getMyBookings.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })

            // --- GET HOST BOOKINGS (HOST) ---
            .addCase(getHostBookings.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getHostBookings.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.bookings = action.payload
            })
            .addCase(getHostBookings.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })

            // --- UPDATE STATUS ---
            .addCase(updateBookingStatus.pending, (state) => {
                state.isLoading = true
            })
            .addCase(updateBookingStatus.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                // INSTANT UI UPDATE: Find the booking in our list and update it with the response
                state.bookings = state.bookings.map((booking) =>
                    booking._id === action.payload._id ? action.payload : booking
                )
            })
            .addCase(updateBookingStatus.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            }).addCase(cancelBooking.pending, (state) => {
                state.isLoading = true
            })
            .addCase(cancelBooking.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true

                // ⚡ INSTANT UI UPDATE:
                // Find the booking in the local state and mark it as Cancelled immediately
                const index = state.bookings.findIndex(booking => booking._id === action.payload._id)
                if (index !== -1) {
                    state.bookings[index] = action.payload // Replace with the updated booking from backend
                }
            })
            .addCase(cancelBooking.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
    },
})

export const { reset } = bookingSlice.actions
export default bookingSlice.reducer