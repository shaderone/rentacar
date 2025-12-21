const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 1. Check if the token exists in the cookies
    token = req.cookies.jwt;

    if (token) {
        try {
            // 2. Verify the token signature
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Find the user associated with this token (exclude password)
            // We attach the user object to the 'req' object so routes can use it
            req.user = await User.findById(decoded.userId).select('-password');

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