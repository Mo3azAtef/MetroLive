process.env.JWT_SECRET = 'test_secret';

const request = require('supertest');
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

describe('GET /api/v1/stations', () => {
  it('returns 200 and all stations sorted by line then order', async () => {
    await Station.insertMany([
      { name: 'Attaba', line: 'Line 2', order: 1 },
      { name: 'Sadat', line: 'Line 1', order: 3 },
      { name: 'Nasser', line: 'Line 1', order: 2 },
    ]);

    const res = await request(app).get('/api/v1/stations');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.data.map((s) => s.name)).toEqual(['Nasser', 'Sadat', 'Attaba']);
  });
});
