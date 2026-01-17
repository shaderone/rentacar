// The slice file is responsible for creating the redux slice, defining initial state, reducers, and async thunks.
// It uses the service file to make api calls.
// reducer is a pure function that takes the previous state and an action, and returns the next state. eg: {state, action } => newState.
// thunk is a function that wraps an expression to delay its evaluation. In redux, thunks are used to write async logic that interacts with the store (dispatch, getState).
// Store is an object that holds the application state. The only way to change the state inside it is to dispatch an action on it.
// slice is a collection of reducer logic and actions for a single feature in the application.

// final overall flow: 
// Component dispatches an action -> action is handled by thunk -> thunk calls service to make api call -> service returns data to thunk -> thunk dispatches success/failure action -> reducer updates state based on action -> component gets updated state from store.

// thunk is a function that can be used inside a slice to handle async actions. slice is a collection of reducers and actions for a feature.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

// Get user from the localstorage
const user = JSON.parse(localStorage.getItem("user")); // why do we get user from localStorage at the start? because when we refresh the page, the redux state is lost but localStorage persists. so we need to initialize the state with the user from localStorage if it exists.

// The steps are : 

// 1. create initial state
const initialState = {
    user: user ? user : null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: "" // to store error/success messages. which we get from the backend via the service.
}

// 2. create async thunk for register, login and logout

export const register = createAsyncThunk(
    "auth/register", // action type or name or in simple terms a string that identifies the action.
    async (user, thunkApi) => {
        try {
            // call the registerUser function in authService to make the register api call.
            return await authService.registerUser(user);
            // the user parameter will be passed from the compoenent when dispatching the register action. 
            // is the user parameter the same as the user object in the initial state? No, the user parameter is the data we send to the backend to register a new user. it contains the user details like name, email, password etc. The user object in the initial state is the logged in user data we get from the backend after successful registration/login.
        } catch (err) {
            // capture the error msg from the backend response.
            const message = (err.response && err.response.data && err.response.data.message) || err.message || err.toString(); // explaination: if err.response exists and err.response.data exists and err.response.data.message exists, then use that message. else if err.message exists, use that. else convert the entire err object to string and use that.

            // return the error message to the thunkApi. here we use thunkApi.rejectWithValue to return a rejected promise with the error message. this will be caught in the extraReducers section of the slice.
            return thunkApi.rejectWithValue(message);
        }
    }
);

export const login = createAsyncThunk(
    "auth/login",
    async (user, thunkApi) => {
        try {
            return await authService.loginUser(user);
        } catch (err) {
            const message = (err.response && err.response.data && err.response.data.message) || err.message || err.toString();
            return thunkApi.rejectWithValue(message);
        }
    }
);

export const logout = createAsyncThunk(
    "auth/logout",
    async () => {
        authService.logoutUser();
    }
)

// 3. create slice with reducers and extraReducers to handle async thunk actions.

export const authSlice = createSlice({
    // parameters of createSlice are : 
    // 1. name of the slice (in simple terms : a strin that identifies the slice)
    name: "auth",
    // 2. initial state of the slice
    initialState,
    // 3. reducers : synchronous actions that directly modify the state.
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        }
    },

    extraReducers: (builder) => {
        builder
            // register user
            .addCase(register.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload; // payload is the data returned from the thunk. in this case, it's the user data returned from the backend after successful registration.
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload; // payload is the error message returned from the thunk.
                state.user = null;
            })
            // login user
            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })
            // logout user
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
            });
    }

})

// export the reset action to be used in components to reset the state.
export const { reset } = authSlice.actions;
// export the reducer to be used in the store.
export default authSlice.reducer; // the reducer is exported as default because when we import it in the store, we can give it any name we want.