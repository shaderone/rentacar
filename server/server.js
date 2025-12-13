require('dotenv').config(); // Load the secrets first
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db'); // Import the db connector

// 1. Initialize App
const app = express();

// 2. Connect to Database
connectDB();

// 3. Middleware (The Setup)
app.use(express.json()); // Allows server to accept JSON data
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL, // Only allow our React app to talk to us
    credentials: true
}));

// 4. A Simple Test Route (To check if it works)
app.get('/', (req, res) => {
    res.send('API is running...');
});

// 5. Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));