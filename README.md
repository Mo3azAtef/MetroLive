# Metro Live System

## About This project

Metro Live System is a real-time backend (plus a small demo frontend) that
powers a live metro information system for two kinds of users:

- **Passengers** join a live station "room" and see announcements the
  moment an admin posts them — no page refresh needed.
- **Admins** log in securely, post announcements (with a severity level) to
  a specific station, and see how many passengers are currently watching
  that station.

**Stack:** Node.js, Express, MongoDB (Mongoose), Socket.io, JWT + bcrypt,
express-validator, express-rate-limit, Jest + Supertest.

**Architecture:** strict separation of concerns — `routes` wire URLs to
`controllers`, `controllers` handle req/res only, `services` hold all
database logic, `models` define schemas, and `sockets` own all Socket.io
room/presence/broadcast logic.

```
src/
  app.js            Express app (exported for tests, no listen())
  server.js         Entry point: connects DB, starts HTTP + Socket.io
  models/           Station, Announcement, Admin (Mongoose schemas)
  routes/           stations.js, auth.js
  controllers/      stationsController.js, authController.js, announcementsController.js
  services/         stationsService.js, authService.js, announcementsService.js
  middleware/       requireAdmin.js, errorHandler.js, rateLimiter.js, validators.js
  sockets/          Socket.io rooms, presence counts, broadcast helper
scripts/seed.js      Loads stations + one seed admin
tests/               Jest + Supertest integration tests
public/              Demo frontend (passenger.html, admin.html)
```

## Install

1. **Prerequisites**: Node.js 18+, npm, a MongoDB Atlas account (free tier
   is enough), and Git.

## Run

**Seed the database** (run once, before starting the server for the first
time, and any time you want to reset station data):

```bash
npm run seed
```

This clears and reloads the `stations` collection and creates one admin
account from your `.env` values, if it doesn't already exist.

**Start the server in development** (auto-restarts on file changes):

```bash
npm run dev
```

**Start the server in production mode:**

```bash
npm start
```

By default the server listens on `PORT=5000` (override in `.env`).
Confirm it's alive:

```bash
curl http://localhost:5000/health
# {"status":"ok","timestamp":"..."}
```

Open the demo frontend in your browser:

- Passenger board: `http://localhost:5000/passenger.html`
- Admin panel: `http://localhost:5000/admin.html` (log in with your
  `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`)

## API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/health` | none | Health check |
| GET | `/api/v1/stations` | none | List all stations, sorted by line then order |
| GET | `/api/v1/stations/:stationId/announcements` | none | Announcements for a station, newest-first, paginated, filterable by `?severity=` |
| POST | `/api/v1/stations/:stationId/announcements` | Bearer JWT (admin) | Create an announcement; broadcasts live via Socket.io |
| POST | `/api/v1/auth/login` | none (rate-limited) | Admin login, returns a JWT |

### Socket.io events

| Event | Direction | Payload | Purpose |
|---|---|---|---|
| `joinStation` | client → server | `stationId` (string) | Join a station's live room, leaving any previous one |
| `leaveStation` | client → server | — | Leave the current station room |
| `presenceUpdate` | server → room | `{ stationId, viewers }` | Live viewer count for a station |
| `announcementPosted` | server → room | the created `Announcement` document | Broadcast the moment an admin posts an announcement |
