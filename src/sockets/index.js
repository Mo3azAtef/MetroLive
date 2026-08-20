const { Server } = require('socket.io');

let io = null;

const roomViewerCounts = new Map();

function roomName(stationId) {
  return `station:${stationId}`;
}

function currentViewers(stationId) {
  return roomViewerCounts.get(stationId) || 0;
}

function emitPresence(stationId) {
  io.to(roomName(stationId)).emit('presenceUpdate', {
    stationId,
    viewers: currentViewers(stationId),
  });
}

function joinRoom(socket, stationId) {
  socket.join(roomName(stationId));
  roomViewerCounts.set(stationId, currentViewers(stationId) + 1);
  emitPresence(stationId);
}

function leaveRoom(socket, stationId) {
  socket.leave(roomName(stationId));
  const next = Math.max(0, currentViewers(stationId) - 1);
  if (next === 0) {
    roomViewerCounts.delete(stationId);
  } else {
    roomViewerCounts.set(stationId, next);
  }
  emitPresence(stationId);
}

function initSocket(httpServer, corsOrigin) {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.data.currentStationId = null;

    socket.on('joinStation', (stationId) => {
      if (!stationId || typeof stationId !== 'string') return;

      const previousStationId = socket.data.currentStationId;
      if (previousStationId && previousStationId !== stationId) {
        leaveRoom(socket, previousStationId);
      }

      if (previousStationId !== stationId) {
        socket.data.currentStationId = stationId;
        joinRoom(socket, stationId);
      }
    });

    socket.on('leaveStation', () => {
      const stationId = socket.data.currentStationId;
      if (stationId) {
        leaveRoom(socket, stationId);
        socket.data.currentStationId = null;
      }
    });

    socket.on('disconnect', () => {
      const stationId = socket.data.currentStationId;
      if (stationId) {
        leaveRoom(socket, stationId);
        socket.data.currentStationId = null;
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet');
  }
  return io;
}

function broadcastAnnouncement(stationId, announcement) {
  if (!io) return; 
  io.to(roomName(stationId)).emit('announcementPosted', announcement);
}

module.exports = {
  initSocket,
  getIO,
  broadcastAnnouncement,
};
