const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimiter');
const { loginValidators } = require('../middleware/validators');

router.post('/login', loginLimiter, loginValidators, authController.login);

module.exports = router;
