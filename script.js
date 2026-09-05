// ---------- Data ----------
let PLACES = [];

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    PLACES = data;
    buildFilters();
  })
  .catch(err => {
    document.getElementById('results').innerHTML =
      `<div class="empty-note">Couldn't load data.json — make sure it's in the same folder as index.html and that you're viewing this through a local/web server (not opened directly as a file://).</div>`;
  });

let USER_LAT = null, USER_LNG = null;

// ---------- Screen navigation ----------
function goToScreen(name){
  document.getElementById('screen-greeting').classList.toggle('active', name === 'greeting');
  document.getElementById('screen-finder').classList.toggle('active', name === 'finder');
}

// ---------- Build filter controls from data ----------
function buildFilters(){
  const typeSel = document.getElementById('filterType');
  const types = ['any', ...new Set(PLACES.map(p => p.establishment_type))];
  typeSel.innerHTML = types.map(t => `<option value="${t}">${t === 'any' ? 'Any type' : capitalize(t)}</option>`).join('');

  const catWrap = document.getElementById('filterCategories');
  const cats = [...new Set(PLACES.flatMap(p => p.food_categories))];
  catWrap.innerHTML = cats.map(c => `<button type="button" class="chip" data-cat="${c}">${capitalize(c)}</button>`).join('');
  catWrap.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('selected'));
  });
}
function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

// ---------- Distance slider ----------
const distSlider = document.getElementById('filterDistance');
const distLabel = document.getElementById('distValueLabel');
distSlider.addEventListener('input', () => { distLabel.textContent = `${distSlider.value} km`; });

// ---------- Geolocation ----------
document.getElementById('locBtn').addEventListener('click', () => {
  const locText = document.getElementById('locText');
  const locDot = document.getElementById('locDot');
  if(!navigator.geolocation){
    locText.textContent = "Geolocation not supported on this device";
    locDot.className = 'loc-dot bad';
    return;
  }
  locText.textContent = "Locating...";
  navigator.geolocation.getCurrentPosition(
    pos => {
      USER_LAT = pos.coords.latitude;
      USER_LNG = pos.coords.longitude;
      locText.textContent = "Location set — distance filter active";
      locDot.className = 'loc-dot ok';
    },
    err => {
      locText.textContent = "Location denied — showing all distances";
      locDot.className = 'loc-dot bad';
    }
  );
});

// ---------- Haversine distance in km ----------
function distanceKm(lat1, lng1, lat2, lng2){
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI/180;
  const dLng = (lng2 - lng1) * Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ---------- Filtering ----------
function getFiltered(){
  const type = document.getElementById('filterType').value;
  const selectedCats = [...document.querySelectorAll('.chip.selected')].map(c => c.dataset.cat);
  const maxDist = parseFloat(distSlider.value);
  const useDistance = USER_LAT !== null && USER_LNG !== null;

  return PLACES.filter(p => {
    if(type !== 'any' && p.establishment_type !== type) return false;
    if(selectedCats.length > 0 && !p.food_categories.some(c => selectedCats.includes(c))) return false;
    if(useDistance){
      const d = distanceKm(USER_LAT, USER_LNG, p.coordinates.lat, p.coordinates.lng);
      if(d > maxDist) return false;
    }
    return true;
  }).map(p => ({
    ...p,
    _distance: useDistance ? distanceKm(USER_LAT, USER_LNG, p.coordinates.lat, p.coordinates.lng) : null
  }));
}

function placeCardHTML(p){
  const dist = p._distance !== null ? `<div class="place-distance">${p._distance.toFixed(1)} km away</div>` : '';
  return `
    <div class="place-card">
      <div class="place-name">${p.name}</div>
      <div class="place-meta">${p.address} · ${capitalize(p.establishment_type)}</div>
      ${dist}
      <div class="place-tags">${p.food_categories.map(c => `<span class="tag">${capitalize(c)}</span>`).join('')}</div>
    </div>`;
}

function handleFind(){
  const results = getFiltered();
  const el = document.getElementById('results');
  if(results.length === 0){
    el.innerHTML = `<div class="empty-note">Wala gyud. No spots match those filters — try loosening them up.</div>`;
    return;
  }
  el.innerHTML = `<div class="results-heading">${results.length} place${results.length > 1 ? 's' : ''} found</div>` +
    results.map(placeCardHTML).join('');
}

function handleRandomize(){
  const pool = getFiltered();
  const el = document.getElementById('results');
  if(pool.length === 0){
    el.innerHTML = `<div class="empty-note">No matches to randomize from — adjust your filters first.</div>`;
    return;
  }
  const pick = pool[Math.floor(Math.random() * pool.length)];
  el.innerHTML = `
    <div class="results-heading">Today, you're eating at...</div>
    <div class="random-hero">
      ${placeCardHTML(pick)}
      <button class="reroll-btn" onclick="handleRandomize()">🎲 Reroll</button>
    </div>`;
}

// ---------- Custom JSON upload ----------
document.getElementById('uploadTrigger').addEventListener('click', () => document.getElementById('fileInput').click());
document.getElementById('fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try{
      const data = JSON.parse(evt.target.result);
      if(!Array.isArray(data)) throw new Error('not an array');
      PLACES = data;
      buildFilters();
      document.getElementById('results').innerHTML = `<div class="empty-note">List loaded — ${PLACES.length} places ready. Set your filters above.</div>`;
    }catch(err){
      document.getElementById('results').innerHTML = `<div class="empty-note">Couldn't read that file — make sure it matches the expected format.</div>`;
    }
  };
  reader.readAsText(file);
});
