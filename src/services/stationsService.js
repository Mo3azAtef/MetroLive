const Station = require('../models/Station');

async function listStations() {
  return Station.find().sort({ line: 1, order: 1 }).lean();
}

async function getStationById(stationId) {
  return Station.findById(stationId).lean();
}

module.exports = { listStations, getStationById };
