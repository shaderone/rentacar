// Middleware to protect routes and ensure user is authenticated. before accessing any protected routes.
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// Middleware to protect routes and ensure user is authenticated. before accessing any protected routes.
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 👇 1. Look for token in the Authorization Header (Bearer Token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (split "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // 🚨 DEBUG LOGS (Remove these later) 🚨
            console.log("------------------------------------------------");
            console.log("1. JWT_SECRET Exists?", !!process.env.JWT_SECRET);
            console.log("2. Header Received:", req.headers.authorization);
            console.log("3. Extracted Token:", token);
            console.log("------------------------------------------------");

            // 2. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token found in headers');
    }
});


module.exports = { protect };   