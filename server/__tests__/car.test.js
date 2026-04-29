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

describe('Car API Endpoints', () => {

    // TEST 1: Get All Cars
    it('should fetch all available cars', async () => {
        const res = await request(app).get('/api/cars');

        // Expect HTTP 200 (OK)
        expect(res.statusCode).toEqual(200);
        
        // Expect response to be an array of cars
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    // TEST 2: Invalid Car ID Format (Security Check)
    it('should reject invalid object IDs when fetching a single car', async () => {
        const res = await request(app).get('/api/cars/thisisnotavalidid123');

        // Note: Depending on your exact error handling, Mongoose usually throws a CastError
        // which results in either a 404 or 500 error in a basic setup.
        // We ensure the app handles it rather than crashing.
        expect(res.statusCode).not.toEqual(200); 
    });
});
