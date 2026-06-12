/**
 * Atmosfera — Interactive Weather Globe
 * Uses Three.js for the 3D globe, Open-Meteo for weather data (no API key needed),
 * and Nominatim (OpenStreetMap) for geocoding.
 */

'use strict';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_CITIES = ['London', 'Tokyo', 'New York', 'Paris', 'Dubai', 'Bengaluru'];
const RECENT_CITY_KEY = 'atmosfera.recentCities';
const MAX_RECENT_CITIES = 5;

// ── WMO Weather Code Interpreter ──────────────────────────────────────────────
/**
 * Maps WMO weather interpretation codes to a human-readable label and emoji.
 * @param {number} code - WMO weather code
 * @returns {{ label: string, icon: string }}
 */
function wmoInfo(code) {
  if (code === 0)   return { label: 'Clear sky',      icon: '☀️' };
  if (code <= 2)    return { label: 'Partly cloudy',  icon: '⛅' };
  if (code === 3)   return { label: 'Overcast',       icon: '☁️' };
  if (code <= 49)   return { label: 'Foggy',          icon: '🌫️' };
  if (code <= 57)   return { label: 'Drizzle',        icon: '🌦️' };
  if (code <= 67)   return { label: 'Rain',           icon: '🌧️' };
  if (code <= 77)   return { label: 'Snow',           icon: '❄️' };
  if (code <= 82)   return { label: 'Rain showers',   icon: '🌧️' };
  if (code <= 86)   return { label: 'Snow showers',   icon: '🌨️' };
  if (code <= 99)   return { label: 'Thunderstorm',   icon: '⛈️' };
  return { label: 'Unknown', icon: '🌡️' };
}

// ── Geocoding (Nominatim / OpenStreetMap — free, no key) ──────────────────────
/**
 * Converts a city name string into lat/lon coordinates and location metadata.
 * @param {string} query - City name to search
 * @returns {Promise<{ lat: number, lon: number, city: string, country: string } | null>}
 */
async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = await res.json();

  if (!data.length) return null;

  const addr = data[0].address || {};
  return {
    lat:     parseFloat(data[0].lat),
    lon:     parseFloat(data[0].lon),
    city:    addr.city || addr.town || addr.village || addr.county || data[0].display_name.split(',')[0],
    country: addr.country_code ? addr.country_code.toUpperCase() : '',
  };
}

// ── Weather Data (Open-Meteo — free, no API key) ───────────────────────────────
/**
 * Fetches current weather and 6-day forecast from Open-Meteo.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object>} Open-Meteo response JSON
 */
async function fetchWeather(lat, lon) {
  const url = 'https://api.open-meteo.com/v1/forecast'
    + `?latitude=${lat}&longitude=${lon}`
    + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,'
    + 'wind_speed_10m,weather_code,uv_index,precipitation_probability'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
    + '&timezone=auto&forecast_days=6';

  const res = await fetch(url);
  return res.json();
}

// ── Three.js Globe Setup ───────────────────────────────────────────────────────
const container = document.getElementById('globe-container');
const canvas    = document.getElementById('globe-canvas');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.z = 2.8;

// Earth mesh
const texLoader = new THREE.TextureLoader();
const globeMesh = new THREE.Mesh(
  new THREE.SphereGeometry(1, 64, 64),
  new THREE.MeshPhongMaterial({
    map:       texLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'),
    specular:  new THREE.Color(0x111111),
    shininess: 10,
  })
);
scene.add(globeMesh);

// Atmosphere glow
scene.add(new THREE.Mesh(
  new THREE.SphereGeometry(1.025, 64, 64),
  new THREE.MeshPhongMaterial({
    color:      0x3399ff,
    transparent: true,
    opacity:    0.06,
    side:       THREE.FrontSide,
    depthWrite: false,
  })
));

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const sunLight = new THREE.DirectionalLight(0xffffff, 1.1);
sunLight.position.set(5, 3, 5);
scene.add(sunLight);

// Location pin dot
const pinMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.022, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0x64b4ff })
);
pinMesh.visible = false;
scene.add(pinMesh);

// Location pin ring (pulsing)
const ringMesh = new THREE.Mesh(
  new THREE.RingGeometry(0.033, 0.053, 32),
  new THREE.MeshBasicMaterial({ color: 0x64b4ff, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
);
ringMesh.visible = false;
scene.add(ringMesh);

// Resize handler
function resize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener('resize', resize);

// ── Globe Drag Interaction ─────────────────────────────────────────────────────
let isDragging = false;
let lastMouse  = { x: 0, y: 0 };
let autoSpin   = true;

function startDrag(x, y) {
  isDragging = true;
  autoSpin   = false;
  lastMouse  = { x, y };
}

function moveDrag(x, y) {
  if (!isDragging) return;
  globeMesh.rotation.y += (x - lastMouse.x) * 0.005;
  globeMesh.rotation.x += (y - lastMouse.y) * 0.005;
  globeMesh.rotation.x  = Math.max(-1.2, Math.min(1.2, globeMesh.rotation.x));
  lastMouse = { x, y };
}

canvas.addEventListener('mousedown',  (e) => startDrag(e.clientX, e.clientY));
window.addEventListener('mouseup',    ()  => { isDragging = false; });
window.addEventListener('mousemove',  (e) => moveDrag(e.clientX, e.clientY));
canvas.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
canvas.addEventListener('touchend',   ()  => { isDragging = false; });
canvas.addEventListener('touchmove',  (e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });

// ── Fly-To Animation ───────────────────────────────────────────────────────────
let flyAnim = null;

/**
 * Returns the shortest angular path from `from` to `to` (avoids spinning the long way).
 */
function shortAngle(from, to) {
  const d = ((to - from) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
  return from + d;
}

/**
 * Animates the globe to rotate so the given lat/lon faces the camera,
 * and places the location pin on the surface.
 * @param {number} lat
 * @param {number} lon
 */
function flyTo(lat, lon) {
  const targetX = lat * (Math.PI / 180);
  const targetY = -lon * (Math.PI / 180);

  flyAnim = {
    fromX: globeMesh.rotation.x,
    fromY: globeMesh.rotation.y,
    toX:   targetX,
    toY:   shortAngle(globeMesh.rotation.y, targetY),
    t:     0,
    dur:   1.8,
  };

  // Place pin on globe surface
  const phi   = (90 - lat)  * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  const px = -Math.sin(phi) * Math.cos(theta);
  const py =  Math.cos(phi);
  const pz =  Math.sin(phi) * Math.sin(theta);

  pinMesh.position.set(px * 1.015, py * 1.015, pz * 1.015);
  ringMesh.position.set(px * 1.015, py * 1.015, pz * 1.015);
  pinMesh.visible  = true;
  ringMesh.visible = true;
}

// ── Render Loop ────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

(function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  if (flyAnim) {
    flyAnim.t = Math.min(1, flyAnim.t + dt / flyAnim.dur);
    const e = easeInOut(flyAnim.t);
    globeMesh.rotation.x = flyAnim.fromX + (flyAnim.toX - flyAnim.fromX) * e;
    globeMesh.rotation.y = flyAnim.fromY + (flyAnim.toY - flyAnim.fromY) * e;
    if (flyAnim.t >= 1) flyAnim = null;
  } else if (autoSpin && !isDragging) {
    globeMesh.rotation.y += dt * 0.07;
  }

  // Pin and ring follow globe rotation
  if (pinMesh.visible) {
    pinMesh.rotation.copy(globeMesh.rotation);
    ringMesh.rotation.copy(globeMesh.rotation);
    ringMesh.material.opacity = 0.3 + 0.35 * Math.sin(Date.now() * 0.003);
  }

  renderer.render(scene, camera);
})();

// ── UI Helpers ─────────────────────────────────────────────────────────────────
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

function setLoading(on) {
  document.getElementById('spinner').classList.toggle('show', on);
  document.getElementById('search-btn').disabled = on;
}

function normalizeCityName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function getRecentCities() {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_CITY_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveRecentCity(city) {
  const normalizedCity = normalizeCityName(city);
  if (!normalizedCity) return;

  const recentCities = getRecentCities().filter(
    (item) => item.toLowerCase() !== normalizedCity.toLowerCase()
  );
  recentCities.unshift(normalizedCity);
  localStorage.setItem(RECENT_CITY_KEY, JSON.stringify(recentCities.slice(0, MAX_RECENT_CITIES)));
  renderQuickCities();
}

function renderQuickCities() {
  const quickList = document.getElementById('quick-list');
  const recentCities = getRecentCities();
  const seen = new Set();
  const cities = [...recentCities, ...DEFAULT_CITIES].filter((city) => {
    const key = city.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  quickList.innerHTML = '';
  cities.forEach((city) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'quick-chip';
    chip.textContent = city;
    chip.addEventListener('click', () => {
      document.getElementById('city-input').value = city;
      handleSearch(city);
    });
    quickList.appendChild(chip);
  });
}

// ── Render Weather Panel ───────────────────────────────────────────────────────
/**
 * Populates the weather panel with current conditions and forecast.
 * @param {{ city: string, country: string }} geo
 * @param {object} weather - Open-Meteo response
 */
function renderPanel(geo, weather) {
  const cur   = weather.current;
  const daily = weather.daily;
  const info  = wmoInfo(cur.weather_code);

  document.getElementById('p-city').textContent    = geo.city;
  document.getElementById('p-country').textContent = geo.country;
  document.getElementById('p-date').textContent    = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  document.getElementById('p-temp').textContent    = `${Math.round(cur.temperature_2m)}°C`;
  document.getElementById('p-icon').textContent    = info.icon;
  document.getElementById('p-desc').textContent    = info.label;
  document.getElementById('p-feels').textContent   = `${Math.round(cur.apparent_temperature)}°C`;
  document.getElementById('p-hum').textContent     = `${cur.relative_humidity_2m}%`;
  document.getElementById('p-wind').textContent    = `${Math.round(cur.wind_speed_10m)} km/h`;
  document.getElementById('p-rain').textContent    = `${cur.precipitation_probability || 0}%`;
  document.getElementById('p-uv').textContent      = cur.uv_index != null ? cur.uv_index : '--';

  // 5-day forecast (index 0 = today, skip it)
  const fc = document.getElementById('forecast');
  fc.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    if (!daily.time[i]) break;
    const d   = new Date(`${daily.time[i]}T12:00:00`);
    const inf = wmoInfo(daily.weather_code[i]);
    const div = document.createElement('div');
    div.className = 'fc-day';
    div.innerHTML = `
      <span class="fc-name">${DAYS[d.getDay()]}</span>
      <span class="fc-icon">${inf.icon}</span>
      <span class="fc-hi">${Math.round(daily.temperature_2m_max[i])}°</span>
      <span class="fc-lo">${Math.round(daily.temperature_2m_min[i])}°</span>
    `;
    fc.appendChild(div);
  }

  document.getElementById('panel').classList.add('visible');
}

// ── Search Handler ─────────────────────────────────────────────────────────────
async function handleSearch(forcedQuery) {
  const query = normalizeCityName(forcedQuery || document.getElementById('city-input').value);
  if (!query) return;

  setLoading(true);
  try {
    const geo = await geocode(query);
    if (!geo) {
      showToast('City not found — try a different name');
      setLoading(false);
      return;
    }

    const weather = await fetchWeather(geo.lat, geo.lon);
    flyTo(geo.lat, geo.lon);
    renderPanel(geo, weather);
    saveRecentCity(geo.city);
    document.getElementById('city-input').value = geo.city;
  } catch (err) {
    showToast('Something went wrong — check your connection');
    console.error('[Atmosfera]', err);
  }

  setLoading(false);
}

document.getElementById('search-btn').addEventListener('click', handleSearch);
document.getElementById('city-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});

renderQuickCities();

// ── Intro Hint ─────────────────────────────────────────────────────────────────
setTimeout(() => {
  const hint = document.createElement('div');
  hint.className = 'hint';
  hint.textContent = '🌐  Drag to rotate  ·  Search any city for live weather';
  container.appendChild(hint);
  setTimeout(() => {
    hint.style.opacity = '0';
    setTimeout(() => hint.remove(), 1000);
  }, 4000);
}, 800);
