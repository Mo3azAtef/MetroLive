const stationSelect = document.getElementById('stationSelect');
const board = document.getElementById('board');
const emptyState = document.getElementById('emptyState');
const viewerCountEl = document.getElementById('viewerCount');

let socket;
let currentStationId = null;

async function loadStations() {
  const res = await fetch(`${window.API_BASE_URL}/api/v1/stations`);
  const json = await res.json();
  (json.data || []).forEach((station) => {
    const opt = document.createElement('option');
    opt.value = station._id;
    opt.textContent = `${station.line} — ${station.name}`;
    stationSelect.appendChild(opt);
  });
}

function statusClass(severity) {
  return `status-tag status-${severity}`;
}

function severityBarClass(severity) {
  return `severity-bar ${severity}`;
}

function renderAnnouncements(items) {
  [...board.querySelectorAll('.board-row:not(.header-row)')].forEach((el) => el.remove());
  emptyState.style.display = items.length ? 'none' : 'block';
  items.forEach((a) => prependAnnouncement(a, false));
}

function prependAnnouncement(a, animate = true) {
  emptyState.style.display = 'none';
  const row = document.createElement('div');
  row.className = 'board-row';
  if (!animate) row.style.animation = 'none';
  row.innerHTML = `
    <div class="${severityBarClass(a.severity)}"></div>
    <div>
      <div class="announcement-text">${a.text}</div>
      <span class="${statusClass(a.severity)}">${a.severity}</span>
    </div>
    <div class="timestamp">${new Date(a.createdAt).toLocaleTimeString()}</div>
  `;
  const headerRow = board.querySelector('.header-row');
  headerRow.insertAdjacentElement('afterend', row);
}

async function loadAnnouncements(stationId) {
  const res = await fetch(`${window.API_BASE_URL}/api/v1/stations/${stationId}/announcements`);
  const json = await res.json();
  renderAnnouncements(json.items || []);
}

function connectSocket() {
  socket = io(window.API_BASE_URL);

  socket.on('presenceUpdate', (payload) => {
    if (payload.stationId === currentStationId) {
      viewerCountEl.textContent = payload.viewers;
    }
  });

  socket.on('announcementPosted', (announcement) => {
    const belongsToCurrentStation =
      announcement.station === currentStationId ||
      announcement.station?.toString() === currentStationId;
    if (belongsToCurrentStation) {
      prependAnnouncement(announcement, true);
    }
  });
}

stationSelect.addEventListener('change', async () => {
  const stationId = stationSelect.value;
  if (!stationId) return;

  if (currentStationId) {
    socket.emit('leaveStation');
  }

  currentStationId = stationId;
  viewerCountEl.textContent = '0';
  await loadAnnouncements(stationId);
  socket.emit('joinStation', stationId);
});

(async function init() {
  await loadStations();
  connectSocket();
})();
