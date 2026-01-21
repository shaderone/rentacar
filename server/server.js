// * Importing required packages and files

const path = require('path'); //? to help load the .env file when not in root directory or running from a different cwd
require('dotenv').config({ path: path.resolve(__dirname, './.env') }); // ? Load the secrets first
const { errorHandler } = require('./middleware/errorMiddleware');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db'); // ? db connector
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// 1. Initialize App
const app = express();
app.set('json spaces', 2); // to make the json responses pretty printed with 2 spaces

// 2. Connect to Database
connectDB();

// 3. Middleware (The Setup)
app.use(express.json()); // Allows server to accept JSON data
app.use(cookieParser());
app.use(cors({
    origin: [
        "https://rentacar-tan.vercel.app",
        process.env.FRONTEND_URL, "https://localhost:3000"], // Only allow our React app to talk to us
    credentials: true, // allow cookies to be sent or in simple terms : allow cross-site Access-Control requests to include cookies.
    // this is needed if we want to work with sessions and cookies in our api.
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);

// 4. A Simple Test Route (To check if it works)
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use(errorHandler); // custom error handling middleware

// 5. Start the Server
const PORT = process.env.PORT || 5000;
// Only start the server if this file is run directly (not imported by tests). in simple terms : this check prevents the server from starting during testing.
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = { app };