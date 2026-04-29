const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');
// Load env variables first
dotenv.config({ path: '../.env' });
const { app } = require('../server'); // Importing your app

let mongoServer;

// Connect to DB before tests start
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

// Close DB connection after tests finish
afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
        await mongoServer.stop();
    }
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
