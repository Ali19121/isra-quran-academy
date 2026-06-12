/***********************************************************************
 * ISRA QURAN ACADEMY PORTAL - app.js v2.0
 ***********************************************************************/

let currentUser = null;
let mapInstance = null, mapMarker = null;
let cache = { maktabs: [], teachers: [], students: [], users: [], hadith: null };
let offlineQueue = JSON.parse(localStorage.getItem('isra_offline_queue') || '[]');
let isOnline = navigator.onLine;

/* ====================================================================
 * SVG ICONS
 * ==================================================================== */
const ICONS = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>`,
  maktab:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21V12h6v9"/><circle cx="12" cy="8" r="1.5" fill="currentColor"/></svg>`,
  teacher:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="7" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/><line x1="8" y1="14" x2="4" y2="20"/><line x1="16" y1="14" x2="20" y2="20"/></svg>`,
  student:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  map:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
  users:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  profile:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="5"/><path d="M3 21a9 9 0 0 1 18 0"/></svg>`,
  logout:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  more:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>`,
  location:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  search:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  edit:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  del:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  sync:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  book:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  add:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  wifi_off:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
};

/* ====================================================================
 * PWA SERVICE WORKER REGISTRATION
 * ==================================================================== */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(() => {
    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data && e.data.type === 'SYNC_NOW') syncOfflineQueue();
    });
  }).catch(() => {});
}

window.addEventListener('online',  () => { isOnline = true;  updateOnlineStatus(); syncOfflineQueue(); });
window.addEventListener('offline', () => { isOnline = false; updateOnlineStatus(); });

function updateOnlineStatus() {
  let banner = document.getElementById('offlineBanner');
  if (banner) banner.classList.toggle('show', !isOnline);
  let sideSt = document.getElementById('onlineStatusSidebar');
  if (sideSt) {
    sideSt.className = 'offline-indicator' + (isOnline ? ' online' : '');
    sideSt.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10"><circle cx="12" cy="12" r="6"/></svg> ${isOnline ? 'Online' : 'Offline'}`;
  }
  let syncBtn = document.getElementById('syncBtnSidebar');
  if (syncBtn) syncBtn.classList.toggle('hidden', offlineQueue.length === 0);
}

/* ====================================================================
 * OFFLINE QUEUE
 * ==================================================================== */
function queueOfflineAction(action, params) {
  offlineQueue.push({ action, params, time: Date.now() });
  localStorage.setItem('isra_offline_queue', JSON.stringify(offlineQueue));
  toast('آف لائن محفوظ — اِنٹرنیٹ آنے پر خودکار sync ہو گا', 'warning');
  updateOnlineStatus();
}

async function syncOfflineQueue() {
  if (!isOnline || offlineQueue.length === 0) return;
  toast('Sync ہو رہا ہے...', '');
  let failed = [];
  for (let item of offlineQueue) {
    try {
      let res = await api(item.action, item.params);
      if (!res.success) failed.push(item);
    } catch { failed.push(item); }
  }
  offlineQueue = failed;
  localStorage.setItem('isra_offline_queue', JSON.stringify(offlineQueue));
  toast(failed.length === 0 ? '✓ تمام ڈیٹا sync ہو گیا' : failed.length + ' records sync نہیں ہوئے', failed.length === 0 ? 'success' : 'error');
  updateOnlineStatus();
}

/* ====================================================================
 * API HELPER  (GET-only to avoid CORS)
 * ==================================================================== */
function api(action, params) {
  return new Promise((resolve, reject) => {
    let all = Object.assign({ action }, params || {});
    let q = new URLSearchParams();
    for (let k in all) q.append(k, all[k] == null ? '' : all[k]);
    fetch(CONFIG.SCRIPT_URL + '?' + q.toString(), { method: 'GET' })
      .then(r => r.json()).then(resolve).catch(reject);
  });
}

function apiWithOffline(action, params) {
  if (!isOnline) { queueOfflineAction(action, params); return Promise.resolve({ success: true, offline: true }); }
  return api(action, params).catch(() => { queueOfflineAction(action, params); return { success: true, offline: true }; });
}

/* ====================================================================
 * TOAST
 * ==================================================================== */
function toast(msg, type) {
  let t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(t._tmr);
  t._tmr = setTimeout(() => { t.className = 'toast'; }, 3500);
}

/* ====================================================================
 * AUTH
 * ==================================================================== */
function doLogin() {
  let user = (document.getElementById('loginUser').value || '').trim();
  let pass = (document.getElementById('loginPass').value || '').trim();
  let errEl = document.getElementById('loginError');
  let spin  = document.getElementById('loginSpin');
  let btn   = document.getElementById('loginBtn');
  errEl.textContent = '';
  if (!user || !pass) { errEl.textContent = 'Username اور password درج کریں۔'; return; }
  spin.innerHTML = '<span class="spinner"></span>';
  btn.disabled = true;
  api('login', { username: user, password: pass })
    .then(res => {
      spin.innerHTML = ''; btn.disabled = false;
      if (res.success) {
        currentUser = res.user;
        localStorage.setItem('isra_user', JSON.stringify(currentUser));
        enterApp();
      } else {
        errEl.textContent = res.message || 'Login fail ہو گیا۔';
      }
    })
    .catch(() => { spin.innerHTML = ''; btn.disabled = false; errEl.textContent = 'Connection error — انٹرنیٹ چیک کریں۔'; });
}

function logout() {
  localStorage.removeItem('isra_user');
  currentUser = null;
  cache = { maktabs: [], teachers: [], students: [], users: [] };
  document.getElementById('appShell').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').textContent = '';
}

function enterApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appShell').style.display = 'block';
  document.getElementById('sidebarUserName').textContent = currentUser.Name || currentUser.Username;
  document.getElementById('sidebarUserRole').textContent = currentUser.Role || '';
  buildNav();
  navigate('dashboard');
  updateOnlineStatus();
}

window.addEventListener('DOMContentLoaded', () => {
  let saved = localStorage.getItem('isra_user');
  if (saved) { try { currentUser = JSON.parse(saved); enterApp(); } catch { localStorage.removeItem('isra_user'); } }
  document.getElementById('loginPass').addEventListener('keypress', e => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('loginUser').addEventListener('keypress', e => { if (e.key === 'Enter') document.getElementById('loginPass').focus(); });
  updateOnlineStatus();
});

/* ====================================================================
 * NAVIGATION
 * ==================================================================== */
const ALL_NAV = [
  { id: 'dashboard', en: 'Dashboard', icon: 'dashboard', roles: ['Admin','Supervisor','Teacher'] },
  { id: 'maktabs',   en: 'Maktabs',   icon: 'maktab',   roles: ['Admin','Supervisor','Teacher'] },
  { id: 'teachers',  en: 'Teachers',  icon: 'teacher',  roles: ['Admin','Supervisor'] },
  { id: 'students',  en: 'Students',  icon: 'student',  roles: ['Admin','Supervisor','Teacher'] },
  { id: 'mapview',   en: 'Map',       icon: 'map',      roles: ['Admin','Supervisor'] },
  { id: 'users',     en: 'Users',     icon: 'users',    roles: ['Admin'] },
  { id: 'profile',   en: 'Profile',   icon: 'profile',  roles: ['Admin','Supervisor','Teacher'] },
];

function getNavItems() {
  let role = currentUser && currentUser.Role ? currentUser.Role : 'Teacher';
  return ALL_NAV.filter(n => n.roles.indexOf(role) >= 0);
}

function buildNav() {
  let items = getNavItems();
  // Desktop sidebar
  let nav = document.getElementById('navMenu');
  nav.innerHTML = items.map(it =>
    `<button class="nav-item" id="nav-${it.id}" onclick="navigate('${it.id}')">${ICONS[it.icon]} ${it.en}</button>`
  ).join('');

  // Mobile bottom nav: show first 4 + more
  let primary   = items.slice(0, 4);
  let secondary = items.slice(4);
  let bnInner = document.getElementById('bottomNavInner');
  bnInner.innerHTML = primary.map(it =>
    `<button class="bottom-nav-item" id="bnav-${it.id}" onclick="navigate('${it.id}')">${ICONS[it.icon]}<span>${it.en}</span></button>`
  ).join('');

  if (secondary.length > 0) {
    bnInner.innerHTML +=
      `<button class="bottom-nav-item" id="bnav-more" onclick="toggleMoreMenu()">${ICONS.more}<span>More</span></button>`;
    document.getElementById('moreMenu').innerHTML =
      secondary.map(it =>
        `<button class="more-menu-item" id="mmenu-${it.id}" onclick="navigate('${it.id}');closeMoreMenu()">${ICONS[it.icon]} ${it.en}</button>`
      ).join('') +
      `<button class="more-menu-item" onclick="logout();closeMoreMenu()">${ICONS.logout} Logout</button>`;
  }
}

function toggleMoreMenu() { document.getElementById('moreMenu').classList.toggle('open'); }
function closeMoreMenu()  { document.getElementById('moreMenu').classList.remove('open'); }

function setActiveNav(id) {
  document.querySelectorAll('.nav-item,.bottom-nav-item,.more-menu-item').forEach(el => el.classList.remove('active'));
  ['nav-','bnav-','mmenu-'].forEach(pfx => { let el = document.getElementById(pfx+id); if (el) el.classList.add('active'); });
}

function navigate(page) {
  closeMoreMenu();
  setActiveNav(page);
  if (mapInstance) { try { mapInstance.remove(); } catch(e){} mapInstance = null; mapMarker = null; }
  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'maktabs':   renderMaktabs();   break;
    case 'teachers':  renderTeachers();  break;
    case 'students':  renderStudents();  break;
    case 'mapview':   renderMapView();   break;
    case 'users':     renderUsers();     break;
    case 'profile':   renderProfile();   break;
    default:          renderDashboard(); break;
  }
}

/* ====================================================================
 * UTILS
 * ==================================================================== */
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function formatDate(v) { if (!v) return '-'; let d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString('en-GB'); }
function toDateInput(v) { if (!v) return ''; let d = new Date(v); return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]; }
function statusBadge(s) { let c = String(s||'').toLowerCase(); return `<span class="badge ${c}">${esc(s||'-')}</span>`; }
function roleBadge(r)   { return `<span class="badge ${String(r||'').toLowerCase()}">${esc(r||'-')}</span>`; }
function loadingHTML(m) { return `<div class="empty-state"><div class="spinner spinner-lg" style="margin:0 auto 12px;"></div><p>${m||'Loading...'}</p></div>`; }
function emptyHTML(m)   { return `<div class="empty-state">${ICONS.book}<p>${m}</p></div>`; }
function isAdmin()      { return currentUser && currentUser.Role === 'Admin'; }
function isSupervisor() { return currentUser && currentUser.Role === 'Supervisor'; }
function isTeacher()    { return currentUser && currentUser.Role === 'Teacher'; }
function canEdit()      { return !isTeacher(); }

function maktabName(id) {
  let m = cache.maktabs.find(x => String(x.ID) === String(id));
  return m ? m.MaktabName : (id || '-');
}

/* ---- Role-based data filter ---- */
function filterByRole(rows, type) {
  let role = currentUser && currentUser.Role;
  let assigned = (currentUser && currentUser.AssignedMaktab) || '';
  if (role === 'Admin') return rows;

  if (role === 'Supervisor') {
    if (!assigned || assigned === 'All') return rows;
    let ids = assigned.split(',').map(s => s.trim());
    if (type === 'maktabs') return rows.filter(r => ids.indexOf(String(r.ID)) >= 0 || ids.indexOf(r.MaktabName) >= 0);
    if (type === 'teachers' || type === 'students') {
      let mids = cache.maktabs
        .filter(m => ids.indexOf(String(m.ID)) >= 0 || ids.indexOf(m.MaktabName) >= 0)
        .map(m => String(m.ID));
      return rows.filter(r => mids.indexOf(String(r.MaktabID)) >= 0);
    }
  }

  if (role === 'Teacher') {
    if (type === 'students') {
      return rows.filter(r =>
        String(r.MaktabID) === String(assigned) ||
        r.MaktabName === assigned ||
        r.TeacherName === (currentUser.Name || currentUser.Username)
      );
    }
    if (type === 'maktabs') {
      return rows.filter(r => String(r.ID) === String(assigned) || r.MaktabName === assigned);
    }
  }
  return rows;
}

/* ====================================================================
 * HADITH
 * ==================================================================== */
const HADITH_FALLBACK = [
  { text: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ', source: '(صحیح البخاری)' },
  { text: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ', source: '(سنن ابن ماجہ)' },
  { text: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ', source: '(صحیح مسلم)' },
  { text: 'اقْرَؤُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ', source: '(صحیح مسلم)' },
];

async function loadHadith() {
  try {
    let today = new Date().toISOString().split('T')[0];
    let res = await api('getHadith', { date: today });
    if (res.success && res.hadith) return res.hadith;
  } catch {}
  return HADITH_FALLBACK[new Date().getDate() % HADITH_FALLBACK.length];
}

/* ====================================================================
 * DASHBOARD
 * ==================================================================== */
function getGreeting() {
  let h = new Date().getHours();
  if (h < 12) return 'صبح بخیر';
  if (h < 17) return 'خوش آمدید';
  return 'شام بخیر';
}

async function renderDashboard() {
  let content = document.getElementById('pageContent');
  content.innerHTML = `
    <div class="topbar">
      <div class="topbar-left">
        <div class="greeting-arabic">ٱلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ ٱللَّهِ وَبَرَكَاتُهُ</div>
        <div style="font-size:15px;font-weight:600;color:var(--teal-dark);margin-top:2px;">${esc(currentUser.Name || currentUser.Username)}</div>
        <div class="sub">${getGreeting()} &mdash; ISRA Quran Academy</div>
      </div>
      <div class="topbar-actions">
        <span id="onlineStatusTop" class="offline-indicator ${isOnline?'online':''}">
          <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10"><circle cx="12" cy="12" r="6"/></svg>
          ${isOnline ? 'Online' : 'Offline'}
        </span>
        ${offlineQueue.length > 0 ? `<button class="btn btn-sm" style="background:var(--gold);color:var(--teal-dark);" onclick="syncOfflineQueue()">${ICONS.sync} Sync (${offlineQueue.length})</button>` : ''}
      </div>
    </div>

    <div class="hadith-card" id="hadithCard">
      <div class="hadith-label">آج کی حدیث</div>
      <div class="spinner" style="margin:6px auto;display:block;border-top-color:#fff;"></div>
    </div>

    <div id="dashStats">${loadingHTML('Stats لوڈ ہو رہی ہیں...')}</div>

    <div class="panel" id="chartPanel" style="display:none;">
      <div class="panel-header">
        <h3>اضلاع کے مطابق ڈیٹا</h3>
        <select class="filter-select" id="dashChartFilter" onchange="renderDistrictChart()">
          <option value="maktabs">مکاتب</option>
          <option value="students">طلباء</option>
          <option value="teachers">اساتذہ</option>
        </select>
      </div>
      <div id="districtChart"></div>
    </div>
  `;

  // Load hadith async
  loadHadith().then(h => {
    let hc = document.getElementById('hadithCard');
    if (hc) hc.innerHTML = `
      <div class="hadith-label">📖 آج کی حدیث</div>
      <div class="hadith-text">${esc(h.text)}</div>
      <div class="hadith-source">${esc(h.source || '')}</div>`;
  });

  try {
    let [mRes, tRes, sRes] = await Promise.all([
      api('getMaktabs', {}), api('getTeachers', {}), api('getStudents', {})
    ]);
    cache.maktabs  = mRes.success ? mRes.rows : [];
    cache.teachers = tRes.success ? tRes.rows : [];
    cache.students = sRes.success ? sRes.rows : [];

    let myM = filterByRole(cache.maktabs,  'maktabs');
    let myT = filterByRole(cache.teachers, 'teachers');
    let myS = filterByRole(cache.students, 'students');

    let activeM = myM.filter(r => String(r.Status||'').toLowerCase() === 'active').length;
    let activeT = myT.filter(r => String(r.Status||'').toLowerCase() === 'active').length;
    let activeS = myS.filter(r => String(r.Status||'').toLowerCase() === 'active').length;
    let boys    = myS.filter(r => String(r.Gender||'').toLowerCase().startsWith('m')).length;
    let girls   = myS.filter(r => String(r.Gender||'').toLowerCase().startsWith('f')).length;

    document.getElementById('dashStats').innerHTML = `
      <div class="stats-grid">
        <div class="stat-card teal">
          <div class="stat-icon">${ICONS.maktab}</div>
          <div class="num">${myM.length}</div>
          <div class="lbl">کل مکاتب<br><small>${activeM} فعال</small></div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon">${ICONS.teacher}</div>
          <div class="num">${myT.length}</div>
          <div class="lbl">کل اساتذہ<br><small>${activeT} فعال</small></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">${ICONS.student}</div>
          <div class="num">${myS.length}</div>
          <div class="lbl">کل طلباء<br><small>${activeS} فعال</small></div>
        </div>
        <div class="stat-card blue">
          <div class="stat-icon">${ICONS.student}</div>
          <div class="num">${boys} / ${girls}</div>
          <div class="lbl">لڑکے / لڑکیاں</div>
        </div>
      </div>`;

    if (!isTeacher()) {
      window._dashData = { myM, myT, myS };
      document.getElementById('chartPanel').style.display = 'block';
      renderDistrictChart();
    }
  } catch {
    document.getElementById('dashStats').innerHTML = emptyHTML('Connection error — انٹرنیٹ چیک کریں۔');
  }
}

function renderDistrictChart() {
  let el = document.getElementById('districtChart');
  let filter = (document.getElementById('dashChartFilter') || {}).value || 'maktabs';
  let d = window._dashData;
  if (!d || !el) return;
  let rows = filter === 'maktabs' ? d.myM : filter === 'teachers' ? d.myT : d.myS;
  let counts = {};
  rows.forEach(r => { let k = r.District || r.Tehsil || 'نامعلوم'; counts[k] = (counts[k]||0) + 1; });
  let keys = Object.keys(counts).sort((a,b) => counts[b]-counts[a]);
  if (!keys.length) { el.innerHTML = emptyHTML('ڈیٹا دستیاب نہیں۔'); return; }
  let max = Math.max.apply(null, keys.map(k => counts[k]));
  let colors = { maktabs: 'var(--teal)', teachers: 'var(--green)', students: 'var(--gold)' };
  el.innerHTML = keys.slice(0,10).map(k => `
    <div class="chart-bar-wrap">
      <div class="chart-bar-label">
        <span style="font-weight:600;color:var(--teal-dark);">${esc(k)}</span>
        <span style="color:var(--gray);font-weight:700;">${counts[k]}</span>
      </div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill" style="width:${max?(counts[k]/max*100):0}%;background:${colors[filter]};"></div>
      </div>
    </div>`).join('');
}

/* ====================================================================
 * MAKTABS
 * ==================================================================== */
function renderMaktabs() {
  document.getElementById('pageContent').innerHTML = `
    <div class="topbar">
      <div class="topbar-left"><h1>مکاتب کا ریکارڈ</h1><div class="sub">Maktab Records</div></div>
      <div class="topbar-actions">
        ${canEdit() ? `<button class="btn btn-gold btn-sm" onclick="openMaktabForm()">${ICONS.add} نیا مکتب</button>` : ''}
      </div>
    </div>
    <div class="panel">
      <div class="panel-header">
        <h3>تمام مکاتب</h3>
        <div class="search-bar">${ICONS.search}<input id="maktabSearch" placeholder="نام، ضلع..." oninput="applyMaktabFilters()"></div>
      </div>
      <div class="filter-row">
        <select class="filter-select" id="mkDistFilter" onchange="applyMaktabFilters()"><option value="">تمام اضلاع</option></select>
        <select class="filter-select" id="mkStatFilter" onchange="applyMaktabFilters()">
          <option value="">تمام حیثیت</option><option value="active">فعال</option><option value="inactive">غیرفعال</option>
        </select>
      </div>
      <div id="maktabTableWrap">${loadingHTML('مکاتب لوڈ ہو رہے ہیں...')}</div>
    </div>
    <div id="maktabFormPanel"></div>`;
  loadMaktabs();
}

async function loadMaktabs() {
  try {
    let res = await api('getMaktabs', {});
    if (!res.success) { document.getElementById('maktabTableWrap').innerHTML = emptyHTML('ڈیٹا لوڈ نہیں ہو سکا۔'); return; }
    cache.maktabs = res.rows;
    let rows = filterByRole(cache.maktabs, 'maktabs');
    let dists = [...new Set(rows.map(r => r.District).filter(Boolean))].sort();
    let df = document.getElementById('mkDistFilter');
    if (df) df.innerHTML = '<option value="">تمام اضلاع</option>' + dists.map(d => `<option value="${esc(d.toLowerCase())}">${esc(d)}</option>`).join('');
    renderMaktabTable(rows);
  } catch { document.getElementById('maktabTableWrap').innerHTML = emptyHTML('Connection error.'); }
}

function applyMaktabFilters() {
  let q  = (document.getElementById('maktabSearch')?.value || '').toLowerCase();
  let df = (document.getElementById('mkDistFilter')?.value  || '');
  let sf = (document.getElementById('mkStatFilter')?.value  || '');
  document.querySelectorAll('#maktabTable tbody tr').forEach(tr => {
    let ok = (!q  || (tr.dataset.search||'').includes(q))
          && (!df || (tr.dataset.dist||'')   === df)
          && (!sf || (tr.dataset.stat||'')   === sf);
    tr.style.display = ok ? '' : 'none';
  });
}

function renderMaktabTable(rows) {
  let wrap = document.getElementById('maktabTableWrap');
  if (!rows.length) { wrap.innerHTML = emptyHTML('کوئی مکتب موجود نہیں۔'); return; }
  let ce = canEdit();
  wrap.innerHTML = `<div class="table-wrap"><table id="maktabTable">
    <thead><tr><th>نام / پتہ</th><th>کورسز</th><th>تحصیل / ضلع</th><th>طلباء</th><th>اساتذہ</th><th>نگران</th><th>حیثیت</th><th></th></tr></thead>
    <tbody>${rows.map(r => `
      <tr data-search="${esc((r.MaktabName+' '+r.District+' '+r.Tehsil+' '+(r.UC||'')).toLowerCase())}"
          data-dist="${esc((r.District||'').toLowerCase())}"
          data-stat="${esc((r.Status||'').toLowerCase())}">
        <td><b>${esc(r.MaktabName)}</b><br><small style="color:var(--gray);">${esc(r.FullAddress||'')}</small></td>
        <td>${esc(r.RunningCourses||'-')}</td>
        <td>${esc(r.Tehsil||'-')}<br><small>${esc(r.District||'-')}</small></td>
        <td>${r.TotalStudents||0}<br><small>${r.Boys||0}♂ ${r.Girls||0}♀</small></td>
        <td>${r.TotalTeachers||0}</td>
        <td><b>${esc(r.HeadName||'-')}</b><br><small style="color:var(--gray);">${esc(r.HeadContact||'')}</small></td>
        <td>${statusBadge(r.Status)}</td>
        <td style="white-space:nowrap;display:flex;gap:4px;align-items:center;">
          ${r.Latitude&&r.Longitude ? `<a href="https://www.google.com/maps?q=${r.Latitude},${r.Longitude}" target="_blank" class="btn btn-outline btn-icon btn-sm" title="Google Maps">${ICONS.location}</a>` : ''}
          ${ce ? `<button class="btn btn-outline btn-icon btn-sm" onclick="openMaktabForm(${r.ID})" title="Edit">${ICONS.edit}</button>
                  <button class="btn btn-danger btn-icon btn-sm" onclick="deleteMaktab(${r.ID})" title="Delete">${ICONS.del}</button>` : ''}
        </td>
      </tr>`).join('')}
    </tbody></table></div>`;
}

function openMaktabForm(id) {
  let r = id ? (cache.maktabs.find(m => String(m.ID) === String(id)) || {}) : {};
  let isEdit = !!(id && Object.keys(r).length);
  document.getElementById('maktabFormPanel').innerHTML = `
    <div class="panel">
      <div class="panel-header"><h3>${isEdit ? 'مکتب میں ترمیم' : 'نیا مکتب شامل کریں'}</h3></div>
      <div class="form-grid">
        <div class="form-section-title">بنیادی معلومات</div>
        <div class="field"><label>مکتب کا نام *</label><input id="mk_name" value="${esc(r.MaktabName||'')}"></div>
        <div class="field"><label>جاری کورسز</label><input id="mk_courses" value="${esc(r.RunningCourses||'')}" placeholder="Qaida, Nazra, Hifz"></div>
        <div class="field field-full"><label>مکمل پتہ</label><input id="mk_address" value="${esc(r.FullAddress||'')}"></div>
        <div class="field"><label>UC</label><input id="mk_uc" value="${esc(r.UC||'')}"></div>
        <div class="field"><label>تحصیل</label><input id="mk_tehsil" value="${esc(r.Tehsil||'')}"></div>
        <div class="field"><label>ضلع</label><input id="mk_district" value="${esc(r.District||'')}"></div>
        <div class="field"><label>قائمی تاریخ</label><input type="date" id="mk_startdate" value="${toDateInput(r.StartDate)}"></div>
        <div class="field"><label>گنجائش</label><input type="number" id="mk_capacity" value="${r.Capacity||''}"></div>
        <div class="form-section-title">تعداد</div>
        <div class="field"><label>کل طلباء</label><input type="number" id="mk_totalstudents" value="${r.TotalStudents||''}"></div>
        <div class="field"><label>لڑکے</label><input type="number" id="mk_boys" value="${r.Boys||''}"></div>
        <div class="field"><label>لڑکیاں</label><input type="number" id="mk_girls" value="${r.Girls||''}"></div>
        <div class="field"><label>کل اساتذہ</label><input type="number" id="mk_totalteachers" value="${r.TotalTeachers||''}"></div>
        <div class="form-section-title">نگران</div>
        <div class="field"><label>نگران کا نام</label><input id="mk_headname" value="${esc(r.HeadName||'')}"></div>
        <div class="field"><label>رابطہ</label><input id="mk_headcontact" value="${esc(r.HeadContact||'')}"></div>
        <div class="field"><label>واٹس ایپ</label><input id="mk_headwhatsapp" value="${esc(r.HeadWhatsApp||'')}"></div>
        <div class="field"><label>حیثیت</label>
          <select id="mk_status">
            <option value="Active" ${r.Status==='Active'?'selected':''}>Active</option>
            <option value="Inactive" ${r.Status==='Inactive'?'selected':''}>Inactive</option>
          </select>
        </div>
        <div class="field field-full"><label>نوٹ</label><input id="mk_remarks" value="${esc(r.Remarks||'')}"></div>

        <div class="form-section-title">مقام (Location)</div>
        <div class="field"><label>Latitude</label><input id="mk_lat" value="${r.Latitude||''}" placeholder="25.3960" oninput="updateCoordDisplay()"></div>
        <div class="field"><label>Longitude</label><input id="mk_lng" value="${r.Longitude||''}" placeholder="68.3578" oninput="updateCoordDisplay()"></div>
      </div>
      <div class="map-controls">
        <button class="btn btn-outline btn-sm" type="button" onclick="useCurrentLocation()">${ICONS.location} موجودہ مقام</button>
        <button class="btn btn-outline btn-sm" type="button" onclick="searchLocationByName()">${ICONS.search} نام سے تلاش</button>
        <span class="coord-display" id="coordDisplay">${r.Latitude&&r.Longitude ? r.Latitude+', '+r.Longitude : 'نقشے پر کلک کریں'}</span>
      </div>
      <div id="mapPicker" style="height:260px;border-radius:10px;border:1.5px solid var(--border);margin-top:10px;"></div>
      <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-gold btn-sm" onclick="saveMaktab(${isEdit?r.ID:'null'})">محفوظ کریں <span id="mkSaveSpin"></span></button>
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('maktabFormPanel').innerHTML=''">منسوخ</button>
      </div>
    </div>`;
  document.getElementById('maktabFormPanel').scrollIntoView({ behavior:'smooth' });
  setTimeout(() => initMapPicker(r.Latitude||null, r.Longitude||null), 150);
}

function updateCoordDisplay() {
  let lat = document.getElementById('mk_lat')?.value;
  let lng = document.getElementById('mk_lng')?.value;
  let d = document.getElementById('coordDisplay');
  if (d && lat && lng) d.textContent = lat + ', ' + lng;
}

function useCurrentLocation() {
  if (!navigator.geolocation) { toast('Geolocation سپورٹ نہیں۔', 'error'); return; }
  toast('مقام تلاش ہو رہا ہے...', '');
  navigator.geolocation.getCurrentPosition(pos => {
    let lat = pos.coords.latitude.toFixed(6);
    let lng = pos.coords.longitude.toFixed(6);
    document.getElementById('mk_lat').value = lat;
    document.getElementById('mk_lng').value = lng;
    document.getElementById('coordDisplay').textContent = lat + ', ' + lng;
    if (mapInstance) {
      if (mapMarker) mapInstance.removeLayer(mapMarker);
      mapMarker = L.marker([+lat, +lng]).addTo(mapInstance);
      mapInstance.setView([+lat, +lng], 14);
    }
    toast('✓ موجودہ مقام سیٹ ہو گیا', 'success');
  }, () => toast('مقام حاصل نہیں ہو سکا۔', 'error'));
}

function searchLocationByName() {
  let name = prompt('جگہ کا نام درج کریں (انگریزی):');
  if (!name) return;
  toast('تلاش ہو رہی ہے...', '');
  fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(name + ', Sindh, Pakistan') + '&format=json&limit=1')
    .then(r => r.json())
    .then(data => {
      if (!data.length) { toast('مقام نہیں ملا۔', 'error'); return; }
      let lat = parseFloat(data[0].lat).toFixed(6);
      let lng = parseFloat(data[0].lon).toFixed(6);
      document.getElementById('mk_lat').value = lat;
      document.getElementById('mk_lng').value = lng;
      document.getElementById('coordDisplay').textContent = lat + ', ' + lng;
      if (mapInstance) {
        if (mapMarker) mapInstance.removeLayer(mapMarker);
        mapMarker = L.marker([+lat, +lng]).addTo(mapInstance);
        mapInstance.setView([+lat, +lng], 14);
      }
      toast('✓ ' + (data[0].display_name||'').split(',')[0], 'success');
    }).catch(() => toast('تلاش میں خرابی۔', 'error'));
}

function initMapPicker(lat, lng) {
  if (mapInstance) { try { mapInstance.remove(); } catch(e){} mapInstance = null; }
  let el = document.getElementById('mapPicker');
  if (!el) return;
  let center = (lat && lng) ? [+lat, +lng] : CONFIG.MAP_DEFAULT_CENTER;
  let zoom   = (lat && lng) ? 13 : CONFIG.MAP_DEFAULT_ZOOM;
  mapInstance = L.map('mapPicker').setView(center, zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapInstance);
  if (lat && lng) mapMarker = L.marker(center).addTo(mapInstance);
  mapInstance.on('click', function(e) {
    let la = e.latlng.lat.toFixed(6), lo = e.latlng.lng.toFixed(6);
    if (mapMarker) mapInstance.removeLayer(mapMarker);
    mapMarker = L.marker([+la, +lo]).addTo(mapInstance);
    document.getElementById('mk_lat').value = la;
    document.getElementById('mk_lng').value = lo;
    document.getElementById('coordDisplay').textContent = la + ', ' + lo;
  });
  setTimeout(() => mapInstance.invalidateSize(), 200);
}

async function saveMaktab(id) {
  let spin = document.getElementById('mkSaveSpin');
  let name = (document.getElementById('mk_name').value || '').trim();
  if (!name) { toast('مکتب کا نام ضروری ہے۔', 'error'); return; }
  let payload = {
    MaktabName: name,
    RunningCourses: document.getElementById('mk_courses').value,
    FullAddress:    document.getElementById('mk_address').value,
    UC:             document.getElementById('mk_uc').value,
    Tehsil:         document.getElementById('mk_tehsil').value,
    District:       document.getElementById('mk_district').value,
    StartDate:      document.getElementById('mk_startdate').value,
    Capacity:       document.getElementById('mk_capacity').value,
    TotalStudents:  document.getElementById('mk_totalstudents').value,
    Boys:           document.getElementById('mk_boys').value,
    Girls:          document.getElementById('mk_girls').value,
    TotalTeachers:  document.getElementById('mk_totalteachers').value,
    HeadName:       document.getElementById('mk_headname').value,
    HeadContact:    document.getElementById('mk_headcontact').value,
    HeadWhatsApp:   document.getElementById('mk_headwhatsapp').value,
    Status:         document.getElementById('mk_status').value,
    Remarks:        document.getElementById('mk_remarks').value,
    Latitude:       document.getElementById('mk_lat').value,
    Longitude:      document.getElementById('mk_lng').value,
    CreatedBy:      currentUser.Username
  };
  if (id && id !== 'null') payload.ID = id;
  spin.innerHTML = '<span class="spinner"></span>';
  let res = await apiWithOffline(id && id !== 'null' ? 'updateMaktab' : 'addMaktab', payload);
  spin.innerHTML = '';
  if (res.success) {
    toast(res.offline ? 'آف لائن: بعد میں sync ہو گا' : '✓ محفوظ', res.offline ? 'warning' : 'success');
    document.getElementById('maktabFormPanel').innerHTML = '';
    loadMaktabs();
  } else toast(res.message || 'خرابی۔', 'error');
}

async function deleteMaktab(id) {
  if (!confirm('کیا آپ واقعی یہ مکتب حذف کرنا چاہتے ہیں؟')) return;
  let res = await api('deleteMaktab', { ID: id });
  if (res.success) { toast('✓ حذف', 'success'); loadMaktabs(); } else toast(res.message, 'error');
}

/* ====================================================================
 * TEACHERS
 * ==================================================================== */
function renderTeachers() {
  document.getElementById('pageContent').innerHTML = `
    <div class="topbar">
      <div class="topbar-left"><h1>اساتذہ کا ریکارڈ</h1><div class="sub">Teacher Records</div></div>
      <div class="topbar-actions">
        ${canEdit() ? `<button class="btn btn-gold btn-sm" onclick="openTeacherForm()">${ICONS.add} نیا استاد</button>` : ''}
      </div>
    </div>
    <div class="panel">
      <div class="panel-header">
        <h3>اساتذہ</h3>
        <div class="search-bar">${ICONS.search}<input id="tcSearch" placeholder="نام، CNIC..." oninput="applyTeacherFilters()"></div>
      </div>
      <div class="filter-row">
        <select class="filter-select" id="tcMakFilter" onchange="applyTeacherFilters()"><option value="">تمام مکاتب</option></select>
        <select class="filter-select" id="tcStatFilter" onchange="applyTeacherFilters()">
          <option value="">تمام حیثیت</option><option value="active">Active</option><option value="left">Left</option>
        </select>
      </div>
      <div id="teacherTableWrap">${loadingHTML('اساتذہ لوڈ ہو رہے ہیں...')}</div>
    </div>
    <div id="teacherFormPanel"></div>`;
  loadTeachers();
}

async function loadTeachers() {
  try {
    let [tRes, mRes, uRes] = await Promise.all([api('getTeachers',{}), api('getMaktabs',{}), api('getUsers',{})]);
    cache.teachers = tRes.success ? tRes.rows : [];
    cache.maktabs  = mRes.success ? mRes.rows : cache.maktabs;
    cache.users    = uRes.success ? uRes.rows : cache.users;
    let rows = filterByRole(cache.teachers, 'teachers');
    let mf = document.getElementById('tcMakFilter');
    if (mf) {
      let mids = [...new Set(rows.map(r => String(r.MaktabID)).filter(Boolean))];
      mf.innerHTML = '<option value="">تمام مکاتب</option>' + mids.map(mid => {
        let m = cache.maktabs.find(x => String(x.ID) === mid);
        return `<option value="${esc(mid)}">${esc(m ? m.MaktabName : mid)}</option>`;
      }).join('');
    }
    renderTeacherTable(rows);
  } catch { document.getElementById('teacherTableWrap').innerHTML = emptyHTML('Connection error.'); }
}

function applyTeacherFilters() {
  let q  = (document.getElementById('tcSearch')?.value   || '').toLowerCase();
  let mf = (document.getElementById('tcMakFilter')?.value || '');
  let sf = (document.getElementById('tcStatFilter')?.value || '');
  document.querySelectorAll('#teacherTable tbody tr').forEach(tr => {
    let ok = (!q  || (tr.dataset.search||'').includes(q))
          && (!mf || (tr.dataset.mak||'')    === mf)
          && (!sf || (tr.dataset.stat||'')   === sf);
    tr.style.display = ok ? '' : 'none';
  });
}

function renderTeacherTable(rows) {
  let wrap = document.getElementById('teacherTableWrap');
  if (!rows.length) { wrap.innerHTML = emptyHTML('کوئی استاد موجود نہیں۔'); return; }
  let ce = canEdit();
  wrap.innerHTML = `<div class="table-wrap"><table id="teacherTable">
    <thead><tr><th>نام</th><th>عہدہ</th><th>مکتب</th><th>سپروائزر</th><th>CNIC</th><th>فون</th><th>تجربہ</th><th>حیثیت</th><th></th></tr></thead>
    <tbody>${rows.map(r => `
      <tr data-search="${esc((r.Name+' '+r.CNIC+' '+(r.Tehsil||'')+' '+(r.District||'')).toLowerCase())}"
          data-mak="${esc(String(r.MaktabID||''))}" data-stat="${esc((r.Status||'').toLowerCase())}">
        <td><b>${esc(r.Name)}</b><br><small style="color:var(--gray);">${esc(r.Gender||'')} &bull; ${esc(r.Qualification||'')}</small></td>
        <td>${esc(r.Designation||'-')}</td>
        <td>${esc(maktabName(r.MaktabID))}</td>
        <td>${esc(r.SupervisorName||'-')}</td>
        <td style="font-family:monospace;font-size:11px;">${esc(r.CNIC||'-')}</td>
        <td>${esc(r.Phone||'-')}</td>
        <td>${r.Experience||0} سال</td>
        <td>${statusBadge(r.Status)}</td>
        <td style="white-space:nowrap;display:flex;gap:4px;">
          ${ce ? `<button class="btn btn-outline btn-icon btn-sm" onclick="openTeacherForm(${r.ID})">${ICONS.edit}</button>
                  <button class="btn btn-danger btn-icon btn-sm" onclick="deleteTeacher(${r.ID})">${ICONS.del}</button>` : '-'}
        </td>
      </tr>`).join('')}
    </tbody></table></div>`;
}

function openTeacherForm(id) {
  let r = id ? (cache.teachers.find(t => String(t.ID) === String(id)) || {}) : {};
  let isEdit = !!(id && Object.keys(r).length);
  let mOpts = cache.maktabs.map(m =>
    `<option value="${m.ID}" ${String(r.MaktabID)===String(m.ID)?'selected':''}>${esc(m.MaktabName)}</option>`).join('');
  let sOpts = (cache.users||[]).filter(u => u.Role === 'Supervisor').map(u =>
    `<option value="${esc(u.Username)}" ${r.SupervisorID===u.Username?'selected':''}>${esc(u.Name||u.Username)}</option>`).join('');

  document.getElementById('teacherFormPanel').innerHTML = `
    <div class="panel">
      <div class="panel-header"><h3>${isEdit ? 'استاد میں ترمیم' : 'نیا استاد شامل کریں'}</h3></div>
      <div class="form-grid">
        <div class="form-section-title">ذاتی معلومات</div>
        <div class="field"><label>نام *</label><input id="tc_name" value="${esc(r.Name||'')}"></div>
        <div class="field"><label>عہدہ</label><input id="tc_designation" value="${esc(r.Designation||'')}" placeholder="Qari, Hifz Teacher..."></div>
        <div class="field"><label>والد کا نام</label><input id="tc_father" value="${esc(r.FatherName||'')}"></div>
        <div class="field"><label>CNIC</label><input id="tc_cnic" value="${esc(r.CNIC||'')}" placeholder="00000-0000000-0"></div>
        <div class="field"><label>تاریخ پیدائش</label><input type="date" id="tc_dob" value="${toDateInput(r.DOB)}"></div>
        <div class="field"><label>جنس</label><select id="tc_gender"><option value="Male" ${r.Gender==='Male'?'selected':''}>Male</option><option value="Female" ${r.Gender==='Female'?'selected':''}>Female</option></select></div>
        <div class="field"><label>تحصیل</label><input id="tc_tehsil" value="${esc(r.Tehsil||'')}"></div>
        <div class="field"><label>ضلع</label><input id="tc_district" value="${esc(r.District||'')}"></div>
        <div class="field field-full"><label>پتہ</label><input id="tc_address" value="${esc(r.Address||'')}"></div>
        <div class="form-section-title">تعلیمی و پیشہ ورانہ</div>
        <div class="field"><label>قابلیت</label><input id="tc_qualification" value="${esc(r.Qualification||'')}"></div>
        <div class="field"><label>سرٹیفیکیشن</label><input id="tc_certification" value="${esc(r.Certification||'')}"></div>
        <div class="field"><label>تجربہ (سال)</label><input type="number" id="tc_experience" value="${r.Experience||''}"></div>
        <div class="field"><label>تقرری کی تاریخ</label><input type="date" id="tc_appointdate" value="${toDateInput(r.DateOfAppointment)}"></div>
        <div class="field"><label>فون / واٹس ایپ</label><input id="tc_phone" value="${esc(r.Phone||'')}"></div>
        <div class="field"><label>تنخواہ (روپے)</label><input type="number" id="tc_salary" value="${r.Salary||''}"></div>
        <div class="field"><label>تنخواہ کا طریقہ</label><select id="tc_salarytype"><option value="Cash" ${r.SalaryType==='Cash'?'selected':''}>Cash</option><option value="Bank Account" ${r.SalaryType==='Bank Account'?'selected':''}>Bank Account</option></select></div>
        <div class="form-section-title">مکتب اور سپروائزر</div>
        <div class="field"><label>متعلقہ مکتب</label><select id="tc_maktab"><option value="">-- منتخب کریں --</option>${mOpts}</select></div>
        <div class="field"><label>سپروائزر (جس کو رپورٹ کریں)</label><select id="tc_supervisor"><option value="">-- منتخب کریں --</option>${sOpts}</select></div>
        <div class="field"><label>حیثیت</label><select id="tc_status"><option value="Active" ${r.Status==='Active'?'selected':''}>Active</option><option value="Left" ${r.Status==='Left'?'selected':''}>Left</option></select></div>
      </div>
      <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-gold btn-sm" onclick="saveTeacher(${isEdit?r.ID:'null'})">محفوظ کریں <span id="tcSaveSpin"></span></button>
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('teacherFormPanel').innerHTML=''">منسوخ</button>
      </div>
    </div>`;
  document.getElementById('teacherFormPanel').scrollIntoView({ behavior:'smooth' });
}

async function saveTeacher(id) {
  let spin = document.getElementById('tcSaveSpin');
  let name = (document.getElementById('tc_name').value || '').trim();
  if (!name) { toast('استاد کا نام ضروری ہے۔', 'error'); return; }
  let supUsername = document.getElementById('tc_supervisor').value;
  let supUser = (cache.users||[]).find(u => u.Username === supUsername);
  let payload = {
    Name: name,
    Designation:       document.getElementById('tc_designation').value,
    FatherName:        document.getElementById('tc_father').value,
    CNIC:              document.getElementById('tc_cnic').value,
    DOB:               document.getElementById('tc_dob').value,
    Gender:            document.getElementById('tc_gender').value,
    Tehsil:            document.getElementById('tc_tehsil').value,
    District:          document.getElementById('tc_district').value,
    Address:           document.getElementById('tc_address').value,
    Qualification:     document.getElementById('tc_qualification').value,
    Certification:     document.getElementById('tc_certification').value,
    Experience:        document.getElementById('tc_experience').value,
    DateOfAppointment: document.getElementById('tc_appointdate').value,
    Phone:             document.getElementById('tc_phone').value,
    Salary:            document.getElementById('tc_salary').value,
    SalaryType:        document.getElementById('tc_salarytype').value,
    MaktabID:          document.getElementById('tc_maktab').value,
    SupervisorID:      supUsername,
    SupervisorName:    supUser ? (supUser.Name || supUser.Username) : supUsername,
    Status:            document.getElementById('tc_status').value,
    CreatedBy:         currentUser.Username
  };
  if (id && id !== 'null') payload.ID = id;
  spin.innerHTML = '<span class="spinner"></span>';
  let res = await apiWithOffline(id && id !== 'null' ? 'updateTeacher' : 'addTeacher', payload);
  spin.innerHTML = '';
  if (res.success) {
    toast(res.offline ? 'آف لائن: بعد میں sync ہو گا' : '✓ محفوظ', res.offline ? 'warning' : 'success');
    document.getElementById('teacherFormPanel').innerHTML = '';
    loadTeachers();
  } else toast(res.message || 'خرابی۔', 'error');
}

async function deleteTeacher(id) {
  if (!confirm('کیا آپ واقعی اس استاد کو حذف کرنا چاہتے ہیں؟')) return;
  let res = await api('deleteTeacher', { ID: id });
  if (res.success) { toast('✓ حذف', 'success'); loadTeachers(); } else toast(res.message, 'error');
}

/* ====================================================================
 * STUDENTS
 * ==================================================================== */
function renderStudents() {
  document.getElementById('pageContent').innerHTML = `
    <div class="topbar">
      <div class="topbar-left"><h1>طلباء کا ریکارڈ</h1><div class="sub">Student Records</div></div>
      <div class="topbar-actions">
        <button class="btn btn-gold btn-sm" onclick="openStudentForm()">${ICONS.add} نیا طالب علم</button>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header">
        <h3>طلباء</h3>
        <div class="search-bar">${ICONS.search}<input id="stSearch" placeholder="نام، والد..." oninput="applyStudentFilters()"></div>
      </div>
      <div class="filter-row">
        <select class="filter-select" id="stMakFilter" onchange="applyStudentFilters()"><option value="">تمام مکاتب</option></select>
        <select class="filter-select" id="stLvlFilter" onchange="applyStudentFilters()">
          <option value="">تمام سطح</option>
          <option value="qaida">Qaida</option><option value="nazra">Nazra</option>
          <option value="hifz">Hifz</option><option value="tafseer">Tafseer</option>
        </select>
        <select class="filter-select" id="stStatFilter" onchange="applyStudentFilters()">
          <option value="">تمام حیثیت</option><option value="active">فعال</option><option value="dropout">Dropout</option>
        </select>
      </div>
      <div id="studentTableWrap">${loadingHTML('طلباء لوڈ ہو رہے ہیں...')}</div>
    </div>
    <div id="studentFormPanel"></div>`;
  loadStudents();
}

async function loadStudents() {
  try {
    let [sRes, mRes] = await Promise.all([api('getStudents',{}), api('getMaktabs',{})]);
    cache.students = sRes.success ? sRes.rows : [];
    cache.maktabs  = mRes.success ? mRes.rows : cache.maktabs;
    let rows = filterByRole(cache.students, 'students');
    let mf = document.getElementById('stMakFilter');
    if (mf) {
      let mids = [...new Set(rows.map(r => String(r.MaktabID)).filter(Boolean))];
      mf.innerHTML = '<option value="">تمام مکاتب</option>' + mids.map(mid => {
        let m = cache.maktabs.find(x => String(x.ID) === mid);
        return `<option value="${esc(mid)}">${esc(m ? m.MaktabName : mid)}</option>`;
      }).join('');
    }
    renderStudentTable(rows);
  } catch { document.getElementById('studentTableWrap').innerHTML = emptyHTML('Connection error.'); }
}

function applyStudentFilters() {
  let q  = (document.getElementById('stSearch')?.value   || '').toLowerCase();
  let mf = (document.getElementById('stMakFilter')?.value || '');
  let lf = (document.getElementById('stLvlFilter')?.value || '');
  let sf = (document.getElementById('stStatFilter')?.value || '');
  document.querySelectorAll('#studentTable tbody tr').forEach(tr => {
    let ok = (!q  || (tr.dataset.search||'').includes(q))
          && (!mf || (tr.dataset.mak||'')    === mf)
          && (!lf || (tr.dataset.lvl||'')    === lf)
          && (!sf || (tr.dataset.stat||'')   === sf);
    tr.style.display = ok ? '' : 'none';
  });
}

function renderStudentTable(rows) {
  let wrap = document.getElementById('studentTableWrap');
  if (!rows.length) { wrap.innerHTML = emptyHTML('کوئی طالب علم موجود نہیں۔'); return; }
  wrap.innerHTML = `<div class="table-wrap"><table id="studentTable">
    <thead><tr><th>نام</th><th>والد</th><th>مکتب</th><th>استاد</th><th>سطح</th><th>حاضری</th><th>جنس</th><th>حیثیت</th><th></th></tr></thead>
    <tbody>${rows.map(r => `
      <tr data-search="${esc((r.Name+' '+(r.FatherName||'')+(r.CurrentLevel||'')).toLowerCase())}"
          data-mak="${esc(String(r.MaktabID||''))}"
          data-lvl="${esc((r.CurrentLevel||'').toLowerCase())}"
          data-stat="${esc((r.Status||'').toLowerCase())}">
        <td><b>${esc(r.Name)}</b></td>
        <td>${esc(r.FatherName||'-')}<br><small style="color:var(--gray);">${esc(r.FatherPhone||'')}</small></td>
        <td>${esc(maktabName(r.MaktabID))}</td>
        <td>${esc(r.TeacherName||'-')}</td>
        <td><span class="badge" style="background:var(--blue-light);color:var(--blue);">${esc(r.CurrentLevel||'-')}</span></td>
        <td>${r.Attendance||0}%</td>
        <td>${esc(r.Gender||'-')}</td>
        <td>${statusBadge(r.Status)}</td>
        <td style="white-space:nowrap;display:flex;gap:4px;">
          <button class="btn btn-outline btn-icon btn-sm" onclick="openStudentForm(${r.ID})">${ICONS.edit}</button>
          ${canEdit() ? `<button class="btn btn-danger btn-icon btn-sm" onclick="deleteStudent(${r.ID})">${ICONS.del}</button>` : ''}
        </td>
      </tr>`).join('')}
    </tbody></table></div>`;
}

function openStudentForm(id) {
  let r = id ? (cache.students.find(s => String(s.ID) === String(id)) || {}) : {};
  let isEdit = !!(id && Object.keys(r).length);
  let mOpts = cache.maktabs.map(m => `<option value="${m.ID}" ${String(r.MaktabID)===String(m.ID)?'selected':''}>${esc(m.MaktabName)}</option>`).join('');
  document.getElementById('studentFormPanel').innerHTML = `
    <div class="panel">
      <div class="panel-header"><h3>${isEdit ? 'طالب علم میں ترمیم' : 'نیا طالب علم شامل کریں'}</h3></div>
      <div class="form-grid">
        <div class="form-section-title">ذاتی معلومات</div>
        <div class="field"><label>طالب علم کا نام *</label><input id="st_name" value="${esc(r.Name||'')}"></div>
        <div class="field"><label>والد کا نام</label><input id="st_father" value="${esc(r.FatherName||'')}"></div>
        <div class="field"><label>والد کا CNIC</label><input id="st_fathercnic" value="${esc(r.FatherCNIC||'')}"></div>
        <div class="field"><label>والد کا فون</label><input id="st_fatherphone" value="${esc(r.FatherPhone||'')}"></div>
        <div class="field"><label>تاریخ پیدائش</label><input type="date" id="st_dob" value="${toDateInput(r.DOB)}"></div>
        <div class="field"><label>جنس</label><select id="st_gender"><option value="Male" ${r.Gender==='Male'?'selected':''}>Male</option><option value="Female" ${r.Gender==='Female'?'selected':''}>Female</option></select></div>
        <div class="field field-full"><label>پتہ</label><input id="st_address" value="${esc(r.Address||'')}"></div>
        <div class="form-section-title">تعلیمی معلومات</div>
        <div class="field"><label>داخلے کی تاریخ</label><input type="date" id="st_admissiondate" value="${toDateInput(r.DateOfAdmission)}"></div>
        <div class="field"><label>کورس کی تفصیل</label><input id="st_course" value="${esc(r.CourseDetails||'')}"></div>
        <div class="field"><label>موجودہ سطح</label>
          <select id="st_level">
            <option value="Qaida" ${r.CurrentLevel==='Qaida'?'selected':''}>Qaida</option>
            <option value="Nazra" ${r.CurrentLevel==='Nazra'?'selected':''}>Nazra</option>
            <option value="Hifz" ${r.CurrentLevel==='Hifz'?'selected':''}>Hifz</option>
            <option value="Tafseer" ${r.CurrentLevel==='Tafseer'?'selected':''}>Tafseer</option>
            <option value="Other" ${r.CurrentLevel==='Other'?'selected':''}>Other</option>
          </select>
        </div>
        <div class="field"><label>حاضری %</label><input type="number" min="0" max="100" id="st_attendance" value="${r.Attendance||''}"></div>
        <div class="field"><label>سکول جاتا ہے؟</label>
          <select id="st_schoolgoing" onchange="document.getElementById('st_sd').style.display=this.value==='Yes'?'block':'none'">
            <option value="No" ${r.SchoolGoing!=='Yes'?'selected':''}>No</option>
            <option value="Yes" ${r.SchoolGoing==='Yes'?'selected':''}>Yes</option>
          </select>
        </div>
        <div class="field field-full" id="st_sd" style="display:${r.SchoolGoing==='Yes'?'block':'none'}">
          <label>سکول کی تفصیل</label><input id="st_schooldetails" value="${esc(r.SchoolDetails||'')}">
        </div>
        <div class="form-section-title">مکتب اور استاد</div>
        <div class="field"><label>مکتب</label><select id="st_maktab"><option value="">-- منتخب کریں --</option>${mOpts}</select></div>
        <div class="field"><label>استاد کا نام</label><input id="st_teacher" value="${esc(r.TeacherName||'')}"></div>
        <div class="field"><label>حیثیت</label>
          <select id="st_status">
            <option value="Active" ${r.Status==='Active'?'selected':''}>Active</option>
            <option value="Dropout" ${r.Status==='Dropout'?'selected':''}>Dropout</option>
          </select>
        </div>
      </div>
      <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-gold btn-sm" onclick="saveStudent(${isEdit?r.ID:'null'})">محفوظ کریں <span id="stSaveSpin"></span></button>
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('studentFormPanel').innerHTML=''">منسوخ</button>
      </div>
    </div>`;
  document.getElementById('studentFormPanel').scrollIntoView({ behavior:'smooth' });
}

async function saveStudent(id) {
  let spin = document.getElementById('stSaveSpin');
  let name = (document.getElementById('st_name').value || '').trim();
  if (!name) { toast('طالب علم کا نام ضروری ہے۔', 'error'); return; }
  let payload = {
    Name: name,
    FatherName:      document.getElementById('st_father').value,
    FatherCNIC:      document.getElementById('st_fathercnic').value,
    FatherPhone:     document.getElementById('st_fatherphone').value,
    DOB:             document.getElementById('st_dob').value,
    Gender:          document.getElementById('st_gender').value,
    Address:         document.getElementById('st_address').value,
    DateOfAdmission: document.getElementById('st_admissiondate').value,
    CourseDetails:   document.getElementById('st_course').value,
    CurrentLevel:    document.getElementById('st_level').value,
    Attendance:      document.getElementById('st_attendance').value,
    SchoolGoing:     document.getElementById('st_schoolgoing').value,
    SchoolDetails:   (document.getElementById('st_schooldetails') || {}).value || '',
    MaktabID:        document.getElementById('st_maktab').value,
    TeacherName:     document.getElementById('st_teacher').value,
    Status:          document.getElementById('st_status').value,
    CreatedBy:       currentUser.Username
  };
  if (id && id !== 'null') payload.ID = id;
  spin.innerHTML = '<span class="spinner"></span>';
  let res = await apiWithOffline(id && id !== 'null' ? 'updateStudent' : 'addStudent', payload);
  spin.innerHTML = '';
  if (res.success) {
    toast(res.offline ? 'آف لائن: بعد میں sync ہو گا' : '✓ محفوظ', res.offline ? 'warning' : 'success');
    document.getElementById('studentFormPanel').innerHTML = '';
    loadStudents();
  } else toast(res.message || 'خرابی۔', 'error');
}

async function deleteStudent(id) {
  if (!confirm('کیا آپ واقعی اس طالب علم کو حذف کرنا چاہتے ہیں؟')) return;
  let res = await api('deleteStudent', { ID: id });
  if (res.success) { toast('✓ حذف', 'success'); loadStudents(); } else toast(res.message, 'error');
}

/* ====================================================================
 * MAP VIEW
 * ==================================================================== */
function renderMapView() {
  document.getElementById('pageContent').innerHTML = `
    <div class="topbar">
      <div class="topbar-left"><h1>مکاتب کا نقشہ</h1><div class="sub">تمام مکاتب کے مقامات</div></div>
    </div>
    <div class="panel" style="padding:0;overflow:hidden;">
      <div id="mapViewContainer" style="height:420px;"></div>
    </div>
    <div class="panel">
      <div class="panel-header"><h3>مقامات کے ساتھ مکاتب</h3></div>
      <div id="mapListWrap">${loadingHTML('لوڈ ہو رہا ہے...')}</div>
    </div>`;

  api('getMaktabs', {}).then(res => {
    if (!res.success) { document.getElementById('mapListWrap').innerHTML = emptyHTML('Error.'); return; }
    cache.maktabs = res.rows;
    let rows = filterByRole(res.rows, 'maktabs');

    let map = L.map('mapViewContainer').setView(CONFIG.MAP_DEFAULT_CENTER, CONFIG.MAP_DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

    let withLoc = rows.filter(r => r.Latitude && r.Longitude);
    withLoc.forEach(r => {
      L.marker([+r.Latitude, +r.Longitude]).addTo(map)
        .bindPopup(`<b>${esc(r.MaktabName)}</b><br>${esc(r.Tehsil)}, ${esc(r.District)}<br>طلباء: ${r.TotalStudents||0} | اساتذہ: ${r.TotalTeachers||0}<br><a href="https://www.google.com/maps?q=${r.Latitude},${r.Longitude}" target="_blank">🗺️ Google Maps</a>`);
    });
    if (withLoc.length > 1) map.fitBounds(withLoc.map(r => [+r.Latitude, +r.Longitude]), { padding: [20,20] });
    setTimeout(() => map.invalidateSize(), 200);

    document.getElementById('mapListWrap').innerHTML = withLoc.length ?
      `<div class="table-wrap"><table>
        <thead><tr><th>مکتب</th><th>تحصیل</th><th>ضلع</th><th>حیثیت</th><th></th></tr></thead>
        <tbody>${withLoc.map(r => `<tr>
          <td><b>${esc(r.MaktabName)}</b></td>
          <td>${esc(r.Tehsil)}</td><td>${esc(r.District)}</td>
          <td>${statusBadge(r.Status)}</td>
          <td><a href="https://www.google.com/maps?q=${r.Latitude},${r.Longitude}" target="_blank" class="btn btn-outline btn-sm">${ICONS.location} Maps</a></td>
        </tr>`).join('')}</tbody>
      </table></div>` :
      emptyHTML('کوئی مکتب بھی نقشے پر سیٹ نہیں ہے۔');
  }).catch(() => { document.getElementById('mapListWrap').innerHTML = emptyHTML('Connection error.'); });
}

/* ====================================================================
 * USERS (Admin only)
 * ==================================================================== */
function renderUsers() {
  if (!isAdmin()) { navigate('dashboard'); return; }
  document.getElementById('pageContent').innerHTML = `
    <div class="topbar">
      <div class="topbar-left"><h1>صارفین کا انتظام</h1><div class="sub">User Management</div></div>
      <div class="topbar-actions"><button class="btn btn-gold btn-sm" onclick="openUserForm()">${ICONS.add} نیا صارف</button></div>
    </div>
    <div class="panel">
      <div class="panel-header"><h3>تمام صارفین</h3></div>
      <div id="userTableWrap">${loadingHTML('لوڈ ہو رہا ہے...')}</div>
    </div>
    <div id="userFormPanel"></div>`;
  loadUsers();
}

async function loadUsers() {
  try {
    let [uRes, mRes] = await Promise.all([api('getUsers',{}), api('getMaktabs',{})]);
    cache.users   = uRes.success ? uRes.rows : [];
    cache.maktabs = mRes.success ? mRes.rows : cache.maktabs;
    renderUserTable(cache.users);
  } catch { document.getElementById('userTableWrap').innerHTML = emptyHTML('Connection error.'); }
}

function renderUserTable(rows) {
  let wrap = document.getElementById('userTableWrap');
  if (!rows.length) { wrap.innerHTML = emptyHTML('کوئی صارف موجود نہیں۔'); return; }
  wrap.innerHTML = `<div class="table-wrap"><table>
    <thead><tr><th>Username</th><th>نام</th><th>کردار</th><th>متعلقہ مکتب</th><th>فون</th><th>حیثیت</th><th></th></tr></thead>
    <tbody>${rows.map(r => `<tr>
      <td><b>${esc(r.Username)}</b></td>
      <td>${esc(r.Name||'-')}</td>
      <td>${roleBadge(r.Role)}</td>
      <td>${esc(r.AssignedMaktab||'-')}</td>
      <td>${esc(r.Phone||'-')}</td>
      <td>${statusBadge(r.Status)}</td>
      <td style="white-space:nowrap;display:flex;gap:4px;">
        <button class="btn btn-outline btn-icon btn-sm" onclick="openUserForm('${esc(r.Username)}')">${ICONS.edit}</button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="deleteUser('${esc(r.Username)}')">${ICONS.del}</button>
      </td>
    </tr>`).join('')}
    </tbody></table></div>`;
}

function openUserForm(username) {
  let r = username ? ((cache.users||[]).find(u => u.Username === username) || {}) : {};
  let isEdit = !!(username && Object.keys(r).length);
  let mOpts = cache.maktabs.map(m => `<option value="${esc(m.MaktabName)}" ${r.AssignedMaktab===m.MaktabName?'selected':''}>${esc(m.MaktabName)}</option>`).join('');
  document.getElementById('userFormPanel').innerHTML = `
    <div class="panel">
      <div class="panel-header"><h3>${isEdit ? 'صارف میں ترمیم' : 'نیا صارف شامل کریں'}</h3></div>
      <div class="form-grid">
        <div class="field"><label>یوزر نیم *</label><input id="us_username" value="${esc(r.Username||'')}" ${isEdit?'readonly style="background:#f0f0f0;"':''}></div>
        <div class="field"><label>پاس ورڈ ${isEdit?'(خالی = تبدیلی نہیں)':'*'}</label><input id="us_password" type="text" placeholder="${isEdit?'پرانا رکھنے کے لیے خالی چھوڑیں':''}"></div>
        <div class="field"><label>مکمل نام</label><input id="us_name" value="${esc(r.Name||'')}"></div>
        <div class="field"><label>کردار</label>
          <select id="us_role">
            <option value="Admin" ${r.Role==='Admin'?'selected':''}>Admin</option>
            <option value="Supervisor" ${r.Role==='Supervisor'?'selected':''}>Supervisor</option>
            <option value="Teacher" ${r.Role==='Teacher'?'selected':''}>Teacher</option>
          </select>
        </div>
        <div class="field"><label>متعلقہ مکتب / علاقہ</label>
          <select id="us_maktab"><option value="All">All</option>${mOpts}</select>
        </div>
        <div class="field"><label>فون</label><input id="us_phone" value="${esc(r.Phone||'')}"></div>
        <div class="field"><label>حیثیت</label>
          <select id="us_status">
            <option value="Active" ${r.Status==='Active'?'selected':''}>Active</option>
            <option value="Inactive" ${r.Status==='Inactive'?'selected':''}>Inactive</option>
          </select>
        </div>
      </div>
      <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-gold btn-sm" onclick="saveUser(${isEdit})">محفوظ کریں <span id="usSaveSpin"></span></button>
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('userFormPanel').innerHTML=''">منسوخ</button>
      </div>
    </div>`;
  document.getElementById('userFormPanel').scrollIntoView({ behavior:'smooth' });
}

async function saveUser(isEdit) {
  let spin = document.getElementById('usSaveSpin');
  let username = (document.getElementById('us_username').value || '').trim();
  let password = document.getElementById('us_password').value;
  if (!username) { toast('Username ضروری ہے۔', 'error'); return; }
  if (!isEdit && !password) { toast('نئے صارف کے لیے password ضروری ہے۔', 'error'); return; }
  let payload = {
    Username:       username,
    Name:           document.getElementById('us_name').value,
    Role:           document.getElementById('us_role').value,
    AssignedMaktab: document.getElementById('us_maktab').value,
    Phone:          document.getElementById('us_phone').value,
    Status:         document.getElementById('us_status').value,
  };
  if (password) payload.Password = password;
  if (isEdit) { payload.username_key = username; payload.ID = username; }
  spin.innerHTML = '<span class="spinner"></span>';
  let res = await api(isEdit ? 'updateUser' : 'addUser', payload);
  spin.innerHTML = '';
  if (res.success) { toast('✓ محفوظ', 'success'); document.getElementById('userFormPanel').innerHTML = ''; loadUsers(); }
  else toast(res.message || 'خرابی۔', 'error');
}

async function deleteUser(username) {
  if (!confirm('کیا آپ واقعی اس صارف کو حذف کرنا چاہتے ہیں؟')) return;
  let res = await api('deleteUser', { ID: username, username_key: username });
  if (res.success) { toast('✓ حذف', 'success'); loadUsers(); } else toast(res.message, 'error');
}

/* ====================================================================
 * PROFILE
 * ==================================================================== */
function renderProfile() {
  let u = currentUser || {};
  let myM = filterByRole(cache.maktabs || [], 'maktabs');
  let myS = filterByRole(cache.students || [], 'students');
  document.getElementById('pageContent').innerHTML = `
    <div class="topbar">
      <div class="topbar-left"><h1>میرا پروفائل</h1><div class="sub">My Profile</div></div>
    </div>
    <div class="panel">
      <div style="display:flex;align-items:center;gap:16px;padding:16px;background:var(--sand);border-radius:12px;margin-bottom:20px;">
        <div style="width:56px;height:56px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          ${ICONS.profile}
        </div>
        <div>
          <div style="font-size:18px;font-weight:700;">${esc(u.Name||u.Username)}</div>
          <div style="margin-top:4px;">${roleBadge(u.Role)}</div>
          <div style="font-size:12px;color:var(--gray);margin-top:4px;">مکتب: ${esc(u.AssignedMaktab||'N/A')} &bull; ${esc(u.Phone||'')}</div>
        </div>
      </div>
      ${isTeacher() ? `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:20px;">
          <div class="stat-card teal"><div class="num">${myS.length}</div><div class="lbl">کل طلباء</div></div>
          <div class="stat-card green"><div class="num">${myS.filter(s=>String(s.Status||'').toLowerCase()==='active').length}</div><div class="lbl">فعال</div></div>
          <div class="stat-card"><div class="num">${myS.filter(s=>String(s.Gender||'').toLowerCase().startsWith('m')).length}</div><div class="lbl">لڑکے</div></div>
          <div class="stat-card red"><div class="num">${myS.filter(s=>String(s.Gender||'').toLowerCase().startsWith('f')).length}</div><div class="lbl">لڑکیاں</div></div>
        </div>` : ''}
      <div style="display:flex;flex-direction:column;gap:14px;max-width:400px;">
        <div class="field"><label>نام</label><input value="${esc(u.Name||u.Username)}" readonly style="background:#f9f9f9;"></div>
        <div class="field"><label>Username</label><input value="${esc(u.Username)}" readonly style="background:#f9f9f9;"></div>
        <div class="field"><label>کردار</label><input value="${esc(u.Role)}" readonly style="background:#f9f9f9;"></div>
        <div class="field"><label>فون</label><input id="prof_phone" value="${esc(u.Phone||'')}"></div>
        <div class="field"><label>نیا پاس ورڈ (خالی = تبدیلی نہیں)</label><input type="password" id="prof_pass" placeholder="نیا پاس ورڈ"></div>
        <button class="btn btn-gold" onclick="saveProfile()">پروفائل اپڈیٹ کریں <span id="profSpin"></span></button>
      </div>
    </div>`;
}

async function saveProfile() {
  let spin = document.getElementById('profSpin');
  let phone = document.getElementById('prof_phone').value;
  let pass  = document.getElementById('prof_pass').value;
  let payload = { username_key: currentUser.Username, Username: currentUser.Username, Phone: phone };
  if (pass) payload.Password = pass;
  spin.innerHTML = '<span class="spinner"></span>';
  let res = await api('updateUser', payload);
  spin.innerHTML = '';
  if (res.success) {
    currentUser.Phone = phone;
    localStorage.setItem('isra_user', JSON.stringify(currentUser));
    toast('✓ پروفائل اپڈیٹ ہو گیا', 'success');
  } else toast(res.message || 'خرابی۔', 'error');
}
