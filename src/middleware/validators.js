const { body, query, param, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const Announcement = require('../models/Announcement');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new ApiError(
        400,
        'Validation failed',
        errors.array().map((e) => ({ field: e.path, message: e.msg }))
      )
    );
  }
  next();
}

const loginValidators = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const listAnnouncementsValidators = [
  param('stationId').isMongoId().withMessage('stationId must be a valid ObjectId'),
  query('severity')
    .optional()
    .isIn(Announcement.SEVERITIES)
    .withMessage(`severity must be one of: ${Announcement.SEVERITIES.join(', ')}`),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  handleValidation,
];

const createAnnouncementValidators = [
  param('stationId').isMongoId().withMessage('stationId must be a valid ObjectId'),
  body('text').isString().trim().notEmpty().withMessage('text is required'),
  body('severity')
    .optional()
    .isIn(Announcement.SEVERITIES)
    .withMessage(`severity must be one of: ${Announcement.SEVERITIES.join(', ')}`),
  handleValidation,
];

module.exports = {
  handleValidation,
  loginValidators,
  listAnnouncementsValidators,
  createAnnouncementValidators,
};
