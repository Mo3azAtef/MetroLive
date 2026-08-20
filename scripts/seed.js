require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { connectDB } = require('../src/utils/db');
const Station = require('../src/models/Station');
const Admin = require('../src/models/Admin');

const stations = [
  { name: 'Al Shohadaa', line: 'Line 1', order: 1 },
  { name: 'Nasser', line: 'Line 1', order: 2 },
  { name: 'Sadat', line: 'Line 1', order: 3 },
  { name: 'Saad Zaghloul', line: 'Line 1', order: 4 },
  { name: 'Attaba', line: 'Line 2', order: 1 },
  { name: 'Mohamed Naguib', line: 'Line 2', order: 2 },
  { name: 'Gamal Abdel Nasser', line: 'Line 2', order: 3 },
  { name: 'Cairo University', line: 'Line 2', order: 4 },
  { name: 'Stadium', line: 'Line 3', order: 1 },
  { name: 'Fair Zone', line: 'Line 3', order: 2 },
];

async function seed() {
  await connectDB(process.env.MONGO_URI);

  console.log('[seed] Clearing existing stations...');
  await Station.deleteMany({});

  console.log('[seed] Inserting stations...');
  await Station.insertMany(stations);

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@metro.com').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    console.log(`[seed] Creating seed admin: ${adminEmail}`);
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await Admin.create({ email: adminEmail, passwordHash, role: 'admin' });
  } else {
    console.log(`[seed] Admin ${adminEmail} already exists, skipping.`);
  }

  console.log('[seed] Done.');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
