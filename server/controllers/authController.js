const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper: Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, businessName, licenseNumber } = req.body;
    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // if user is new, create the user by using the User Model
        const user = await User.create({
            name,
            email,
            password,
            role,
            // only add hostprofile if the role is == 'host'
            hostProfile: role === 'host' ? {
                businessName,
                licenseNumber,
                verified: false
            } : undefined
        });

        // here we check if user is created successfully because mongoose create() method may fail silently sometimes. 
        // it happens when validation fails but no error is thrown. an example is when password length is less than minlength defined in the schema.
        // if the password length is less than minlength. mongoose will not create the user and return null.
        // to mitiagate this, we can also validate the input data before calling create() or use try-catch block to catch any validation errors.


        if (user) {
            // if user is created successfully without errors
            // step 1 : Create JWT Token. we do this on registration to keep the user logged in right after registering and also in the login time as well. to avoid making the user login again after registering.
            const token = generateToken(user._id);

            // Step 2: Set JWT as HttpOnly cookie. This is more secure than storing it in localStorage or sessionStorage. Because it is not accessible via Javascript.

            res.cookie('jwt', token, {
                httpOnly: true,
                // secure: process.env.NODE_ENV !== 'development' means the cookie will be sent on http. 
                secure: process.env.NODE_ENV !== 'development',
                // samesite strict means the cookie will only be sent in a first-party context and not be sent along with requests initiated by third party websites. this helps to prevent CSRF or cross-site request forgery attacks.
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // the calculation is basically 30 days in milliseconds. It is calculated this way for better readability. the calculation is done by multiplying 30 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
                // 1 day in milliseconds = 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                hostProfile: user.hostProfile || null,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Explicitly select password because we set select:false in model. the password returned is the hashed password.
        const user = await User.findOne({ email }).select('+password');

        // checks if user exists and password matches. matchPassword is a method defined in the User model.
        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user._id);

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: token,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
const logoutUser = (req, res) => {
    // on logout we clear the cookie by setting it to an empty string and setting its expiration date to a past date. or new Date(0) which is January 1, 1970, the start of Unix time. kinda like a reset.
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// get all users - for testing protected route
const getAllUsers = async (req, res) => {
    // req.user was set by the middleware!
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getAllUsers
};


