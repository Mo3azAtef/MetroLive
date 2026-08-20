const loginCard = document.getElementById('loginCard');
const postCard = document.getElementById('postCard');
const loginBtn = document.getElementById('loginBtn');
const loginStatus = document.getElementById('loginStatus');
const postBtn = document.getElementById('postBtn');
const postStatus = document.getElementById('postStatus');
const stationSelectAdmin = document.getElementById('stationSelectAdmin');
const adminViewerCountEl = document.getElementById('adminViewerCount');

let token = null;
let socket;
let currentStationId = null;

async function loadStationsIntoAdmin() {
  const res = await fetch(`${window.API_BASE_URL}/api/v1/stations`);
  const json = await res.json();
  (json.data || []).forEach((station) => {
    const opt = document.createElement('option');
    opt.value = station._id;
    opt.textContent = `${station.line} — ${station.name}`;
    stationSelectAdmin.appendChild(opt);
  });
}

function connectSocket() {
  socket = io(window.API_BASE_URL);

  socket.on('presenceUpdate', (payload) => {
    if (payload.stationId === currentStationId) {
      adminViewerCountEl.textContent = payload.viewers;
    }
  });
}

stationSelectAdmin.addEventListener('change', () => {
  const stationId = stationSelectAdmin.value;
  if (!stationId) return;

  if (currentStationId) {
    socket.emit('leaveStation');
  }

  currentStationId = stationId;
  adminViewerCountEl.textContent = '0';
  socket.emit('joinStation', stationId);
});

loginBtn.addEventListener('click', async () => {
  loginStatus.textContent = '';
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  loginBtn.disabled = true;
  try {
    const res = await fetch(`${window.API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error?.message || 'Login failed');
    }

    token = json.data.token;
    loginCard.style.display = 'none';
    postCard.style.display = 'block';
    await loadStationsIntoAdmin();
    connectSocket();
  } catch (err) {
    loginStatus.textContent = err.message;
    loginStatus.className = 'status-msg error';
  } finally {
    loginBtn.disabled = false;
  }
});

postBtn.addEventListener('click', async () => {
  postStatus.textContent = '';
  const stationId = stationSelectAdmin.value;
  const text = document.getElementById('text').value.trim();
  const severity = document.getElementById('severity').value;

  postBtn.disabled = true;
  try {
    const res = await fetch(
      `${window.API_BASE_URL}/api/v1/stations/${stationId}/announcements`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, severity }),
      }
    );
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error?.message || 'Failed to post announcement');
    }

    postStatus.textContent = 'Broadcast sent to passengers at this station.';
    postStatus.className = 'status-msg success';
    document.getElementById('text').value = '';
  } catch (err) {
    postStatus.textContent = err.message;
    postStatus.className = 'status-msg error';
  } finally {
    postBtn.disabled = false;
  }
});
