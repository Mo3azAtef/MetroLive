process.env.JWT_SECRET = 'test_secret';

const request = require('supertest');
const bcrypt = require('bcryptjs');
const createApp = require('../src/app');
const Admin = require('../src/models/Admin');
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

describe('POST /api/v1/auth/login', () => {
  it('returns a JWT for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('correctpassword', 10);
    await Admin.create({ email: 'admin@metro.com', passwordHash, role: 'admin' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@metro.com', password: 'correctpassword' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.token).toBe('string');
  });

  it('rejects invalid credentials with 401', async () => {
    const passwordHash = await bcrypt.hash('correctpassword', 10);
    await Admin.create({ email: 'admin@metro.com', passwordHash, role: 'admin' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@metro.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
