const announcementsService = require('../services/announcementsService');

async function getAnnouncements(req, res, next) {
  try {
    const { stationId } = req.params;
    const { severity, page, limit } = req.query;
    const result = await announcementsService.listAnnouncementsForStation(stationId, {
      severity,
      page,
      limit,
    });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function createAnnouncement(req, res, next) {
  try {
    const { stationId } = req.params;
    const announcement = await announcementsService.createAnnouncement(stationId, req.body);
    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnnouncements, createAnnouncement };
