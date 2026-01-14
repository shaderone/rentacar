// This file sets up the Redux store for the application. In simple terms it creates a centralized place to manage the state of the app, specifically handling user authentication data through the authReducer.

// Reducers are functions that determine how the state changes in response to actions. Here, we import the authReducer which manages authentication-related state changes.

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer
    }
})

