const express = require('express');
const router = express.Router();

const stationsController = require('../controllers/stationsController');
const announcementsController = require('../controllers/announcementsController');
const requireAdmin = require('../middleware/requireAdmin');
const {
  listAnnouncementsValidators,
  createAnnouncementValidators,
} = require('../middleware/validators');

// Public reads
router.get('/', stationsController.getStations);
router.get(
  '/:stationId/announcements',
  listAnnouncementsValidators,
  announcementsController.getAnnouncements
);

router.post(
  '/:stationId/announcements',
  requireAdmin,
  createAnnouncementValidators,
  announcementsController.createAnnouncement
);

module.exports = router;
