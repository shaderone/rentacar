const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Load env variables first
dotenv.config({ path: '../.env' });
const { app } = require('../server'); // Importing your app

// Connect to DB before tests start
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

// Close DB connection after tests finish
afterAll(async () => {
    await mongoose.connection.close();
});

describe('Booking API Endpoints', () => {

    // TEST 1: Reject Unauthorized Access to Bookings
    it('should deny access to fetch bookings if no token is provided', async () => {
        const res = await request(app).get('/api/bookings/my-bookings');

        // Expect HTTP 401 (Unauthorized)
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message.toLowerCase()).toContain('auth');
    });

    // TEST 2: Reject Missing Authorization Header on checkout
    it('should reject checkout sessions with no authorization', async () => {
        const res = await request(app)
            .post('/api/bookings')
            .send({ carId: 'dummyId123', days: 3 });

        // Expect HTTP 401
        expect(res.statusCode).toEqual(401);
    });
});
