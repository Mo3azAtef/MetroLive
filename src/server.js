require('dotenv').config();
const http = require('http');

const createApp = require('./app');
const { connectDB } = require('./utils/db');
const { initSocket } = require('./sockets');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB(process.env.MONGO_URI);
  } catch (err) {
    console.error('[server] Failed to connect to MongoDB. Exiting.');
    process.exit(1);
  }

  const app = createApp();
  const httpServer = http.createServer(app);

  initSocket(httpServer, process.env.CLIENT_ORIGIN);

  httpServer.listen(PORT, () => {
    console.log(`[server] Metro Live System API listening on port ${PORT}`);
  });
}

start();
