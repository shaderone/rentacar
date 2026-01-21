const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { app } = require('../server'); // Importing your app

// Load env variables
dotenv.config();

// Connect to DB before tests start
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

// Close DB connection after tests finish
afterAll(async () => {
    await mongoose.connection.close();
});

describe('Auth API Endpoints', () => {

    // Define a unique email so the test doesn't fail on "User already exists"
    const testUser = {
        name: 'DevOps Tester',
        email: `test${Date.now()}@devops.com`,
        password: 'password123',
        role: 'user'
    };

    // TEST 1: Registration
    it('should register a new user and return a token', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        // Expect HTTP 201 (Created)
        expect(res.statusCode).toEqual(201);
        // Expect a Token in the response
        expect(res.body).toHaveProperty('token');
        // Expect user data
        expect(res.body.email).toEqual(testUser.email);
    });

    // TEST 2: Login
    it('should login the user and return a token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        // Expect HTTP 200 (OK)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    // TEST 3: Invalid Login (Security Check)
    it('should reject invalid password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword'
            });

        // Expect HTTP 401 (Unauthorized)
        expect(res.statusCode).toEqual(401);
    });
});