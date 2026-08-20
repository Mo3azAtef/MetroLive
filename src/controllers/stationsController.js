const stationsService = require('../services/stationsService');

async function getStations(req, res, next) {
  try {
    const stations = await stationsService.listStations();
    res.status(200).json({ success: true, data: stations });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStations };
