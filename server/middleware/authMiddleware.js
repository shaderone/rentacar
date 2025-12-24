// Middleware to protect routes and ensure user is authenticated. before accessing any protected routes.
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// Middleware to protect routes and ensure user is authenticated. before accessing any protected routes.
const protect = async (req, res, next) => {
    let token;

    // 1. Check if the token exists in the cookies
    token = req.cookies.jwt;

    if (token) {
        // Custom try catch because asyncHandler won't work here. the reason is :
        // jwt.verify() throws generic errors like "jwt malformed" or "jwt expired". which we cannot catch in asyncHandler because its not an async function.
        try {
            // 2. Verify the token signature
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // console.log('Decoded JWT:', decoded);

            // 3. Find the user associated with this token (exclude password)
            // We attach the user object to the 'req' object so routes can use it
            req.user = await User.findById(decoded.id);

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next(); // Pass the baton to the next function (the Controller)
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        // No token found in cookies
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};


module.exports = { protect };   