const request = require('supertest');
const app = require('../server'); // Ensure this path points to my server file
const mongoose = require('mongoose');
const User = require('../models/User');

// Test database setup
const testDatabaseUrl = process.env.TEST_DATABASE_URL || 'mongodb://127.0.0.1:27017/chattify_test';

beforeAll(async () => {
  await mongoose.connect(testDatabaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  // Clear test users after each test
  await User.deleteMany({});
});

afterAll(async () => {
  // Disconnect from the database after all tests
  await mongoose.connection.close();
});

describe('Authentication API Tests', () => {
  test('Should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'testuser@example.com', password: 'password123' });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  test('Should fail registration for an existing user', async () => {
    // Prepopulate the test database with a user
    const user = new User({ email: 'testuser@example.com', password: 'password123' });
    await user.save();

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'testuser@example.com', password: 'password123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  test('Should login an existing user', async () => {
    // Prepopulate the test database with a user
    const passwordHash = await User.hashPassword('password123'); // Assuming hashPassword method exists
    const user = new User({ email: 'testuser@example.com', password: passwordHash });
    await user.save();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@example.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('Should fail login with incorrect credentials', async () => {
    // Prepopulate the test database with a user
    const passwordHash = await User.hashPassword('password123'); // Assuming hashPassword method exists
    const user = new User({ email: 'testuser@example.com', password: passwordHash });
    await user.save();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@example.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });
});
