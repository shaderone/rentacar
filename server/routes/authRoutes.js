const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
router.post('/register', registerUser);

// @route   POST /api/auth/login
router.post('/login', loginUser);

// @route   POST /api/auth/logout
router.post('/logout', logoutUser);

// for testing protected route.
router.get('/all', protect, getAllUsers);

module.exports = router;