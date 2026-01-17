// The service file is only responsible for making api calls.

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/auth/";

const registerUser = async (userData) => {
    // make a post request to /auth/register
    const res = await axios.post(API_URL + "register", userData);

    if (res.data) {
        localStorage.setItem("user", JSON.stringify(res.data));
    }
    return res.data;

};

const loginUser = async (userData) => {
    const res = await axios.post(API_URL + "login", userData);

    if (res.data) {
        localStorage.setItem("user", JSON.stringify(res.data));
    }

    // "Login response data:", res.data); // Debug log 
    return res.data;
}

const logoutUser = () => {
    localStorage.removeItem("user");
}

const AuthService = {
    registerUser,
    loginUser,
    logoutUser
};

export default AuthService;