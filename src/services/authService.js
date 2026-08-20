const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');

async function login(email, password) {
  const admin = await Admin.findOne({ email: email.toLowerCase() });

  if (!admin) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    { sub: admin._id.toString(), role: admin.role, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return { token, admin: { id: admin._id, email: admin.email, role: admin.role } };
}

module.exports = { login };
