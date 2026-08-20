const Announcement = require('../models/Announcement');
const Station = require('../models/Station');
const ApiError = require('../utils/ApiError');
const { broadcastAnnouncement } = require('../sockets');

async function listAnnouncementsForStation(stationId, { severity, page = 1, limit = 20 } = {}) {
  const station = await Station.findById(stationId).lean();
  if (!station) {
    throw new ApiError(404, 'Station not found');
  }

  const filter = { station: stationId };
  if (severity) filter.severity = severity;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Announcement.find(filter)
      .sort({ createdAt: -1 }) // newest-first
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Announcement.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 0,
    },
  };
}

async function createAnnouncement(stationId, payload) {
  const station = await Station.findById(stationId).lean();
  if (!station) {
    throw new ApiError(404, 'Station not found');
  }

  const announcement = await Announcement.create({
    text: payload.text,
    severity: payload.severity || 'info',
    station: stationId,
  });

  broadcastAnnouncement(stationId.toString(), announcement.toObject());

  return announcement;
}

module.exports = { listAnnouncementsForStation, createAnnouncement };
