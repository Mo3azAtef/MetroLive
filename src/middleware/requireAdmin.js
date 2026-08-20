const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Missing or malformed Authorization header'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.role !== 'admin') {
      return next(new ApiError(403, 'Admin privileges required'));
    }

    req.admin = { id: payload.sub, role: payload.role, email: payload.email };
    return next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

module.exports = requireAdmin;
