process.env.JWT_SECRET = 'test_secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const createApp = require('../src/app');
const Station = require('../src/models/Station');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');

const app = createApp();

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('POST /api/v1/stations/:stationId/announcements', () => {
  it('rejects a request with no token with 401', async () => {
    const station = await Station.create({ name: 'Attaba', line: 'Line 2', order: 1 });

    const res = await request(app)
      .post(`/api/v1/stations/${station._id}/announcements`)
      .send({ text: 'Train delayed by 5 minutes' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('creates an announcement and returns 201 for a valid admin token', async () => {
    const station = await Station.create({ name: 'Attaba', line: 'Line 2', order: 1 });
    const token = jwt.sign(
      { sub: 'fake-admin-id', role: 'admin', email: 'admin@metro.com' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .post(`/api/v1/stations/${station._id}/announcements`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Train delayed by 5 minutes', severity: 'delay' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.text).toBe('Train delayed by 5 minutes');
  });
});
