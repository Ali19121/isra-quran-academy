/***********************************************************************
 * ISRA QURAN ACADEMY PORTAL — app.js v3.0
 * New design: stat cards with icons, overview panel, animated charts
 ***********************************************************************/
let currentUser = null;
let mapInstance = null, mapMarker = null;
let cache = { maktabs:[], teachers:[], students:[], users:[] };
let offlineQueue = JSON.parse(localStorage.getItem('isra_offline_queue') || '[]');
let isOnline = navigator.onLine;

/* ===================== SVG ICON LIBRARY ===================== */
const IC = {
  dashboard:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>`,
  maktab:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21V12h6v9"/></svg>`,
  teacher: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="7" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/><line x1="8" y1="13" x2="5" y2="19"/><line x1="16" y1="13" x2="19" y2="19"/></svg>`,
  student: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  map:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
  users:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="5"/><path d="M3 21a9 9 0 0 1 18 0"/></svg>`,
  logout:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  more:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>`,
  location:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  search:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  edit:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  del:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  add:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  sync:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  chart:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  book:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  star:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  boys:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="7" r="4"/><path d="M3 21v-1a6 6 0 0 1 12 0v1"/><circle cx="17" cy="7" r="3"/><path d="M21 21v-1a5 5 0 0 0-5-5h-.5"/></svg>`,
  active:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
};

/* ===================== PWA ===================== */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(() => {
    navigator.serviceWorker.addEventListener('message', e => { if (e.data?.type === 'SYNC_NOW') syncOfflineQueue(); });
  }).catch(()=>{});
}
window.addEventListener('online',  () => { isOnline=true;  updateOnlineStatus(); syncOfflineQueue(); });
window.addEventListener('offline', () => { isOnline=false; updateOnlineStatus(); });

function updateOnlineStatus() {
  document.getElementById('offlineBanner')?.classList.toggle('show', !isOnline);
  let dot = document.getElementById('onlineDot');
  if (dot) {
    dot.querySelector('.dot')?.classList.toggle('offline', !isOnline);
    let t = dot.querySelector('#onlineText'); if(t) t.textContent = isOnline ? 'Online' : 'Offline';
  }
  let sb = document.getElementById('syncBtnSidebar');
  if (sb) sb.classList.toggle('hidden', offlineQueue.length === 0);
}

/* ===================== OFFLINE QUEUE ===================== */
function queueOfflineAction(action, params) {
  offlineQueue.push({ action, params, time: Date.now() });
  localStorage.setItem('isra_offline_queue', JSON.stringify(offlineQueue));
  toast('آف لائن — اِنٹرنیٹ آنے پر sync ہو گا', 'warning');
  updateOnlineStatus();
}
async function syncOfflineQueue() {
  if (!isOnline || !offlineQueue.length) return;
  toast('Sync ہو رہا ہے...', '');
  let failed = [];
  for (let item of offlineQueue) {
    try { let r = await api(item.action, item.params); if (!r.success) failed.push(item); }
    catch { failed.push(item); }
  }
  offlineQueue = failed;
  localStorage.setItem('isra_offline_queue', JSON.stringify(offlineQueue));
  toast(failed.length ? `${failed.length} records sync نہیں ہوئے` : '✓ تمام ڈیٹا sync ہو گیا', failed.length ? 'error' : 'success');
  updateOnlineStatus();
}

/* ===================== API ===================== */
function api(action, params) {
  return new Promise((res, rej) => {
    let all = Object.assign({ action }, params||{});
    let q = new URLSearchParams();
    for (let k in all) q.append(k, all[k]==null?'':all[k]);
    fetch(CONFIG.SCRIPT_URL + '?' + q.toString())
      .then(r => r.json()).then(res).catch(rej);
  });
}
function apiSafe(action, params) {
  if (!isOnline) { queueOfflineAction(action,params); return Promise.resolve({success:true,offline:true}); }
  return api(action,params).catch(()=>{ queueOfflineAction(action,params); return {success:true,offline:true}; });
}

/* ===================== TOAST ===================== */
function toast(msg, type) {
  let t = document.getElementById('toast'); if(!t) return;
  let icons = { success:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>', error:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', warning:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>' };
  t.innerHTML = (icons[type]||'') + msg;
  t.className = 'toast show' + (type ? ' '+type : '');
  clearTimeout(t._t); t._t = setTimeout(()=>{ t.className='toast'; }, 3500);
}

/* ===================== AUTH ===================== */
function doLogin() {
  let u = (document.getElementById('loginUser').value||'').trim();
  let p = (document.getElementById('loginPass').value||'').trim();
  let err = document.getElementById('loginError');
  let spin = document.getElementById('loginSpin');
  let btn  = document.getElementById('loginBtn');
  err.textContent = '';
  if (!u||!p) { err.textContent='Username اور password درج کریں۔'; return; }
  spin.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-top-color:#fff;"></span>';
  btn.disabled = true;
  api('login',{username:u,password:p}).then(res=>{
    spin.innerHTML=''; btn.disabled=false;
    if (res.success) { currentUser=res.user; localStorage.setItem('isra_user',JSON.stringify(currentUser)); enterApp(); }
    else err.textContent = res.message||'Login fail ہو گیا۔';
  }).catch(()=>{ spin.innerHTML=''; btn.disabled=false; err.textContent='Connection error — انٹرنیٹ چیک کریں۔'; });
}
function logout() {
  localStorage.removeItem('isra_user'); currentUser=null;
  cache={maktabs:[],teachers:[],students:[],users:[]};
  document.getElementById('appShell').style.display='none';
  document.getElementById('loginScreen').style.display='flex';
  ['loginUser','loginPass'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('loginError').textContent='';
}
function enterApp() {
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('appShell').style.display='block';
  document.getElementById('sidebarUserName').textContent = currentUser.Name||currentUser.Username;
  let roleEl = document.getElementById('sidebarUserRole');
  if (roleEl) { roleEl.textContent=currentUser.Role||''; roleEl.className='role-'+(currentUser.Role||'').toLowerCase(); }
  buildNav(); navigate('dashboard'); updateOnlineStatus();
}
window.addEventListener('DOMContentLoaded', ()=>{
  let s=localStorage.getItem('isra_user');
  if(s){try{currentUser=JSON.parse(s);enterApp();}catch{localStorage.removeItem('isra_user');}}
  document.getElementById('loginPass').addEventListener('keypress',e=>{if(e.key==='Enter')doLogin();});
  document.getElementById('loginUser').addEventListener('keypress',e=>{if(e.key==='Enter')document.getElementById('loginPass').focus();});
  updateOnlineStatus();
});

/* ===================== NAVIGATION ===================== */
const ALL_NAV = [
  {id:'dashboard',en:'Dashboard',  icon:'dashboard', roles:['Admin','Supervisor','Teacher']},
  {id:'maktabs',  en:'Maktabs',    icon:'maktab',    roles:['Admin','Supervisor','Teacher']},
  {id:'teachers', en:'Teachers',   icon:'teacher',   roles:['Admin','Supervisor']},
  {id:'students', en:'Students',   icon:'student',   roles:['Admin','Supervisor','Teacher']},
  {id:'mapview',  en:'Map View',   icon:'map',       roles:['Admin','Supervisor']},
  {id:'users',    en:'Users',      icon:'users',     roles:['Admin']},
  {id:'profile',  en:'Profile',    icon:'profile',   roles:['Admin','Supervisor','Teacher']},
];
function getNavItems() { let r=currentUser?.Role||'Teacher'; return ALL_NAV.filter(n=>n.roles.includes(r)); }

function buildNav() {
  let items = getNavItems();
  document.getElementById('navMenu').innerHTML = items.map(it=>
    `<button class="nav-item" id="nav-${it.id}" onclick="navigate('${it.id}')"><div class="nav-icon-wrap">${IC[it.icon]}</div>${it.en}</button>`
  ).join('');
  let prim = items.slice(0,4), sec = items.slice(4);
  let bn = document.getElementById('bottomNavInner');
  bn.innerHTML = prim.map(it=>
    `<button class="bn-item" id="bnav-${it.id}" onclick="navigate('${it.id}')"><div class="bn-icon">${IC[it.icon]}</div><span>${it.en}</span></button>`
  ).join('');
  if(sec.length){
    bn.innerHTML += `<button class="bn-item" id="bnav-more" onclick="openMoreSheet()">${IC.more}<span>More</span></button>`;
    document.getElementById('moreSheetItems').innerHTML = sec.map(it=>
      `<button class="more-item" id="mmenu-${it.id}" onclick="navigate('${it.id}');closeMoreSheet()"><div class="more-item-icon">${IC[it.icon]}</div>${it.en}</button>`
    ).join('');
  }
}
function openMoreSheet(){ document.getElementById('moreSheet').classList.add('open'); document.getElementById('moreOverlay').classList.add('show'); }
function closeMoreSheet(){ document.getElementById('moreSheet').classList.remove('open'); document.getElementById('moreOverlay').classList.remove('show'); }
function setActive(id){
  document.querySelectorAll('.nav-item,.bn-item,.more-item').forEach(el=>el.classList.remove('active'));
  ['nav-','bnav-','mmenu-'].forEach(p=>{ let el=document.getElementById(p+id); if(el) el.classList.add('active'); });
}
function navigate(page){
  closeMoreSheet(); setActive(page);
  let titles={dashboard:'Dashboard',maktabs:'Maktabs',teachers:'Teachers',students:'Students',mapview:'Map View',users:'Users',profile:'Profile'};
  let t=document.getElementById('topbarTitle'); if(t) t.textContent=titles[page]||page;
  if(mapInstance){try{mapInstance.remove();}catch(e){} mapInstance=null; mapMarker=null;}
  switch(page){
    case 'dashboard': renderDashboard(); break;
    case 'maktabs':   renderMaktabs();   break;
    case 'teachers':  renderTeachers();  break;
    case 'students':  renderStudents();  break;
    case 'mapview':   renderMapView();   break;
    case 'users':     renderUsers();     break;
    case 'profile':   renderProfile();   break;
    default: renderDashboard();
  }
}

/* ===================== UTILS ===================== */
function esc(s){if(s==null)return'';return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function toDate(v){if(!v)return'-';let d=new Date(v);return isNaN(d.getTime())?v:d.toLocaleDateString('en-GB');}
function toDateInput(v){if(!v)return'';let d=new Date(v);return isNaN(d.getTime())?'':d.toISOString().split('T')[0];}
function maktabName(id){let m=cache.maktabs.find(x=>String(x.ID)===String(id));return m?m.MaktabName:(id||'-');}
function isAdmin(){return currentUser?.Role==='Admin';}
function isTeacher(){return currentUser?.Role==='Teacher';}
function canEdit(){return !isTeacher();}
function loadHTML(m){return `<div class="loading-state"><div class="spinner spinner-lg"></div><p>${m||'Loading...'}</p></div>`;}
function emptyHTML(m){return `<div class="empty-state">${IC.book}<p>${m}</p></div>`;}

function filterByRole(rows,type){
  let role=currentUser?.Role, assigned=(currentUser?.AssignedMaktab||'');
  if(role==='Admin') return rows;
  if(role==='Supervisor'){
    if(!assigned||assigned==='All') return rows;
    let ids=assigned.split(',').map(s=>s.trim());
    if(type==='maktabs') return rows.filter(r=>ids.includes(String(r.ID))||ids.includes(r.MaktabName));
    if(type==='teachers'||type==='students'){
      let mids=cache.maktabs.filter(m=>ids.includes(String(m.ID))||ids.includes(m.MaktabName)).map(m=>String(m.ID));
      return rows.filter(r=>mids.includes(String(r.MaktabID)));
    }
  }
  if(role==='Teacher'){
    if(type==='students') return rows.filter(r=>String(r.MaktabID)===String(assigned)||r.TeacherName===(currentUser.Name||currentUser.Username));
    if(type==='maktabs') return rows.filter(r=>String(r.ID)===String(assigned)||r.MaktabName===assigned);
  }
  return rows;
}

function statusBadge(s){
  let cls={Active:'badge-green',Inactive:'badge-gray',Left:'badge-orange',Dropout:'badge-red'}[s]||'badge-gray';
  return `<span class="badge ${cls}"><span class="badge-dot"></span>${esc(s||'-')}</span>`;
}
function roleBadge(r){
  let cls={Admin:'badge-purple',Supervisor:'badge-blue',Teacher:'badge-green'}[r]||'badge-gray';
  return `<span class="badge ${cls}">${esc(r||'-')}</span>`;
}

/* ===================== HADITH ===================== */
const FALLBACK_HADITH=[
  {text:'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',source:'صحیح البخاری'},
  {text:'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',source:'سنن ابن ماجہ'},
  {text:'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',source:'صحیح مسلم'},
  {text:'اقْرَؤُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ',source:'صحیح مسلم'},
];
async function loadHadith(){
  try{
    let res=await api('getHadith',{date:new Date().toISOString().split('T')[0]});
    if(res.success&&res.hadith) return res.hadith;
  }catch{}
  return FALLBACK_HADITH[new Date().getDate()%FALLBACK_HADITH.length];
}

/* ===================== DASHBOARD ===================== */
async function renderDashboard(){
  let h=new Date().getHours(), greet=h<12?'صُبح بَخیر':h<17?'خُوش آمَدید':'شَام بَخیر';
  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;">
        <span class="page-greeting">السَّلَامُ عَلَيْكُمْ ,</span>
        <span class="page-greeting-name">${esc(currentUser.Name||currentUser.Username)}</span>
      </div>
      <div class="page-subtitle">${greet} — ISRA Quran Academy Maktab Management Overview</div>
    </div>

    <div class="hadith-card" id="hadithCard">
      <div class="hadith-label">${IC.book} آج کی حدیث</div>
      <div style="display:flex;justify-content:center;padding:10px 0;"><div class="spinner" style="border-top-color:#fff;"></div></div>
    </div>

    <div class="stats-row stagger" id="dashStats"></div>

    <div class="dashboard-grid">
      <div class="card" id="chartCard">
        <div class="card-header">
          <div class="card-header-left">
            <div class="card-header-icon">${IC.chart}</div>
            <div><div class="card-title">اضلاع کے لحاظ سے مکاتب</div><div class="card-subtitle">Maktabs by District</div></div>
          </div>
          <select class="filter-sel" id="dashFilter" onchange="drawChart()" style="font-size:12px;padding:6px 28px 6px 10px;">
            <option value="maktabs">مکاتب</option>
            <option value="students">طلباء</option>
            <option value="teachers">اساتذہ</option>
          </select>
        </div>
        <div class="card-body"><div class="chart-wrap" id="dashChart">${loadHTML('چارٹ لوڈ ہو رہا ہے...')}</div></div>
      </div>
      <div class="card" id="overviewCard">
        <div class="card-header">
          <div class="card-header-left">
            <div class="card-header-icon" style="background:#f0fdf4;">${IC.active}</div>
            <div><div class="card-title">Overview Summary</div></div>
          </div>
        </div>
        <div class="overview-list" id="overviewList">${loadHTML('')}</div>
      </div>
    </div>`;

  // Load hadith
  loadHadith().then(h=>{
    let hc=document.getElementById('hadithCard');
    if(hc) hc.innerHTML=`<div class="hadith-label">${IC.book} آج کی حدیث</div><div class="hadith-text">${esc(h.text)}</div><div class="hadith-source">— ${esc(h.source||'')}</div>`;
  });

  try{
    let [mR,tR,sR]=await Promise.all([api('getMaktabs',{}),api('getTeachers',{}),api('getStudents',{})]);
    cache.maktabs  = mR.success?mR.rows:[];
    cache.teachers = tR.success?tR.rows:[];
    cache.students = sR.success?sR.rows:[];
    let myM=filterByRole(cache.maktabs,'maktabs');
    let myT=filterByRole(cache.teachers,'teachers');
    let myS=filterByRole(cache.students,'students');
    let am=myM.filter(r=>String(r.Status||'').toLowerCase()==='active').length;
    let at_=myT.filter(r=>String(r.Status||'').toLowerCase()==='active').length;
    let as_=myS.filter(r=>String(r.Status||'').toLowerCase()==='active').length;
    let boys=myS.filter(r=>String(r.Gender||'').toLowerCase().startsWith('m')).length;
    let girls=myS.filter(r=>String(r.Gender||'').toLowerCase().startsWith('f')).length;

    let cards=[
      {num:myM.length,  label:'Total Maktabs', ur:'کل مکاتب',    icon:IC.maktab,  cls:'sc-green',  trend:IC.chart},
      {num:am,          label:'Active Maktabs',ur:'فعال مکاتب',   icon:IC.active,  cls:'sc-purple', trend:IC.active},
      {num:myS.length,  label:'Total Students',ur:'کل طلباء',     icon:IC.student, cls:'sc-blue',   trend:IC.student},
      {num:`${boys}/${girls}`,label:'Boys / Girls',ur:'لڑکے / لڑکیاں',icon:IC.boys,cls:'sc-orange',trend:IC.boys},
      {num:myT.length,  label:'Total Teachers',ur:'کل اساتذہ',    icon:IC.teacher, cls:'sc-cyan',   trend:IC.teacher},
      {num:at_,         label:'Active Teachers',ur:'فعال اساتذہ', icon:IC.active,  cls:'sc-pink',   trend:IC.active},
    ];

    document.getElementById('dashStats').innerHTML = cards.map(c=>`
      <div class="stat-card ${c.cls}">
        <div class="stat-icon-circle">${c.icon}</div>
        <div class="stat-num" data-target="${typeof c.num==='number'?c.num:''}">${c.num}</div>
        <div class="stat-label">${c.label}<span class="stat-label-ur">${c.ur}</span></div>
        <div class="stat-trend">${c.trend}</div>
      </div>`).join('');

    // Animate numbers
    document.querySelectorAll('.stat-num[data-target]').forEach(el=>{
      let target=parseInt(el.dataset.target);
      if(isNaN(target)) return;
      let start=0, duration=800, startTime=null;
      function step(t){ if(!startTime) startTime=t; let p=Math.min((t-startTime)/duration,1); el.textContent=Math.floor(p*target); if(p<1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });

    document.getElementById('overviewList').innerHTML=[
      {label:'Total Maktabs',  val:myM.length,  icon:IC.maktab,  iconCls:'background:#dcfce7;color:#16a34a'},
      {label:'Total Students', val:myS.length,  icon:IC.student, iconCls:'background:#ede9fe;color:#7c3aed'},
      {label:'Total Teachers', val:myT.length,  icon:IC.teacher, iconCls:'background:#dbeafe;color:#2563eb'},
      {label:'Active Maktabs', val:am,          icon:IC.active,  iconCls:'background:#fef3c7;color:#d97706'},
      {label:'Active Teachers',val:at_,         icon:IC.active,  iconCls:'background:#fce7f3;color:#db2777'},
      {label:'Boys / Girls',   val:`${boys}/${girls}`,icon:IC.boys,iconCls:'background:#ffedd5;color:#ea580c'},
    ].map(it=>`
      <div class="overview-item">
        <div class="overview-item-left">
          <div class="overview-item-icon" style="${it.iconCls}">${it.icon}</div>
          ${it.label}
        </div>
        <div class="overview-item-val">${it.val}</div>
      </div>`).join('');

    window._dash={myM,myT,myS}; drawChart();
  }catch{
    document.getElementById('dashStats').innerHTML=`<div class="card card-body" style="grid-column:1/-1;">${emptyHTML('Connection error — انٹرنیٹ چیک کریں۔')}</div>`;
  }
}

function drawChart(){
  let el=document.getElementById('dashChart'); if(!el) return;
  let d=window._dash; if(!d){el.innerHTML=emptyHTML('ڈیٹا نہیں ہے۔');return;}
  let f=(document.getElementById('dashFilter')||{}).value||'maktabs';
  let rows=f==='maktabs'?d.myM:f==='teachers'?d.myT:d.myS;
  let counts={};
  rows.forEach(r=>{let k=r.District||r.Tehsil||'نامعلوم';counts[k]=(counts[k]||0)+1;});
  let keys=Object.keys(counts).sort((a,b)=>counts[b]-counts[a]);
  if(!keys.length){el.innerHTML=`<div class="chart-empty">${IC.map}<p>ابھی کوئی مکتب data نہیں ہے۔<br>جب data موجود ہوگا تو بیان دکھایا جائے گا۔</p></div>`;return;}
  let max=Math.max(...keys.map(k=>counts[k]));
  let colors={maktabs:'var(--teal)',students:'var(--purple)',teachers:'var(--cyan)'};
  el.innerHTML=keys.slice(0,8).map(k=>`
    <div class="chart-bar-row">
      <div class="chart-bar-label">${esc(k)}</div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill" style="width:0%;background:${colors[f]};" data-w="${max?(counts[k]/max*100):0}"></div>
      </div>
      <div class="chart-bar-val">${counts[k]}</div>
    </div>`).join('');
  // Animate bars
  setTimeout(()=>{
    document.querySelectorAll('.chart-bar-fill').forEach(bar=>{
      bar.style.width = bar.dataset.w + '%';
    });
  }, 50);
}

/* ===================== MAKTABS ===================== */
function renderMaktabs(){
  document.getElementById('pageContent').innerHTML=`
    <div class="page-header"><h2 style="font-size:20px;font-weight:700;">مکاتب کا ریکارڈ</h2><div class="page-subtitle">Maktab Records</div></div>
    <div class="card">
      <div class="toolbar">
        <div class="search-box">${IC.search}<input id="mkQ" placeholder="نام، ضلع، تحصیل تلاش کریں..." oninput="applyMkFilter()"></div>
        <select class="filter-sel" id="mkDist" onchange="applyMkFilter()"><option value="">تمام اضلاع</option></select>
        <select class="filter-sel" id="mkStat" onchange="applyMkFilter()"><option value="">تمام حیثیت</option><option value="active">فعال</option><option value="inactive">غیرفعال</option></select>
        <div style="margin-left:auto;">
          ${canEdit()?`<button class="btn btn-gold btn-sm" onclick="openMaktabForm()">${IC.add} نیا مکتب</button>`:''}
        </div>
      </div>
      <div id="mkTableWrap">${loadHTML('مکاتب لوڈ ہو رہے ہیں...')}</div>
    </div>
    <div id="mkFormWrap"></div>`;
  loadMaktabs();
}
async function loadMaktabs(){
  try{
    let res=await api('getMaktabs',{});
    if(!res.success){document.getElementById('mkTableWrap').innerHTML=emptyHTML('ڈیٹا لوڈ نہیں ہو سکا۔');return;}
    cache.maktabs=res.rows;
    let rows=filterByRole(cache.maktabs,'maktabs');
    let dists=[...new Set(rows.map(r=>r.District).filter(Boolean))].sort();
    let df=document.getElementById('mkDist');
    if(df) df.innerHTML='<option value="">تمام اضلاع</option>'+dists.map(d=>`<option value="${esc(d.toLowerCase())}">${esc(d)}</option>`).join('');
    renderMkTable(rows);
  }catch{document.getElementById('mkTableWrap').innerHTML=emptyHTML('Connection error.');}
}
function applyMkFilter(){
  let q=(document.getElementById('mkQ')?.value||'').toLowerCase();
  let df=(document.getElementById('mkDist')?.value||'');
  let sf=(document.getElementById('mkStat')?.value||'');
  document.querySelectorAll('#mkTable tbody tr').forEach(tr=>{
    let ok=(!q||(tr.dataset.s||'').includes(q))&&(!df||(tr.dataset.d||'')===df)&&(!sf||(tr.dataset.st||'')===sf);
    tr.style.display=ok?'':'none';
  });
}
function renderMkTable(rows){
  let w=document.getElementById('mkTableWrap');
  if(!rows.length){w.innerHTML=emptyHTML('کوئی مکتب موجود نہیں۔');return;}
  let ce=canEdit();
  w.innerHTML=`<div class="table-wrap"><table id="mkTable">
    <thead><tr><th>مکتب</th><th>کورسز</th><th>تحصیل / ضلع</th><th>طلباء</th><th>اساتذہ</th><th>نگران</th><th>حیثیت</th><th></th></tr></thead>
    <tbody>${rows.map(r=>`
      <tr data-s="${esc((r.MaktabName+' '+r.District+' '+r.Tehsil).toLowerCase())}" data-d="${esc((r.District||'').toLowerCase())}" data-st="${esc((r.Status||'').toLowerCase())}">
        <td><div class="td-main">${esc(r.MaktabName)}</div><div class="td-sub">${esc(r.FullAddress||'')}</div></td>
        <td>${esc(r.RunningCourses||'-')}</td>
        <td><div class="td-main">${esc(r.Tehsil||'-')}</div><div class="td-sub">${esc(r.District||'-')}</div></td>
        <td><b>${r.TotalStudents||0}</b><div class="td-sub">${r.Boys||0}♂ ${r.Girls||0}♀</div></td>
        <td>${r.TotalTeachers||0}</td>
        <td><div class="td-main">${esc(r.HeadName||'-')}</div><div class="td-sub">${esc(r.HeadContact||'')}</div></td>
        <td>${statusBadge(r.Status)}</td>
        <td><div class="td-actions">
          ${r.Latitude&&r.Longitude?`<a href="https://www.google.com/maps?q=${r.Latitude},${r.Longitude}" target="_blank" class="btn btn-outline btn-icon btn-sm" title="Maps">${IC.location}</a>`:''}
          ${ce?`<button class="btn btn-outline btn-icon btn-sm" onclick="openMaktabForm(${r.ID})">${IC.edit}</button><button class="btn btn-danger btn-icon btn-sm" onclick="delMaktab(${r.ID})">${IC.del}</button>`:''}
        </div></td>
      </tr>`).join('')}
    </tbody></table></div>`;
}
function openMaktabForm(id){
  let r=id?(cache.maktabs.find(m=>String(m.ID)===String(id))||{}):{}; let isE=!!(id&&Object.keys(r).length);
  document.getElementById('mkFormWrap').innerHTML=`
    <div class="card anim-fade-up">
      <div class="card-header"><div class="card-header-left"><div class="card-header-icon">${IC.maktab}</div><div class="card-title">${isE?'مکتب میں ترمیم':'نیا مکتب شامل کریں'}</div></div></div>
      <div class="card-body">
      <div class="form-grid">
        <div class="form-section-title">بنیادی معلومات</div>
        <div class="form-field"><label class="form-label">مکتب کا نام *</label><input class="form-input" id="mk_name" value="${esc(r.MaktabName||'')}"></div>
        <div class="form-field"><label class="form-label">جاری کورسز</label><input class="form-input" id="mk_courses" value="${esc(r.RunningCourses||'')}" placeholder="Qaida, Nazra, Hifz"></div>
        <div class="form-field full"><label class="form-label">مکمل پتہ</label><input class="form-input" id="mk_address" value="${esc(r.FullAddress||'')}"></div>
        <div class="form-field"><label class="form-label">UC</label><input class="form-input" id="mk_uc" value="${esc(r.UC||'')}"></div>
        <div class="form-field"><label class="form-label">تحصیل</label><input class="form-input" id="mk_tehsil" value="${esc(r.Tehsil||'')}"></div>
        <div class="form-field"><label class="form-label">ضلع</label><input class="form-input" id="mk_district" value="${esc(r.District||'')}"></div>
        <div class="form-field"><label class="form-label">قائمی تاریخ</label><input class="form-input" type="date" id="mk_start" value="${toDateInput(r.StartDate)}"></div>
        <div class="form-field"><label class="form-label">گنجائش</label><input class="form-input" type="number" id="mk_cap" value="${r.Capacity||''}"></div>
        <div class="form-section-title">تعداد</div>
        <div class="form-field"><label class="form-label">کل طلباء</label><input class="form-input" type="number" id="mk_ts" value="${r.TotalStudents||''}"></div>
        <div class="form-field"><label class="form-label">لڑکے</label><input class="form-input" type="number" id="mk_boys" value="${r.Boys||''}"></div>
        <div class="form-field"><label class="form-label">لڑکیاں</label><input class="form-input" type="number" id="mk_girls" value="${r.Girls||''}"></div>
        <div class="form-field"><label class="form-label">کل اساتذہ</label><input class="form-input" type="number" id="mk_tt" value="${r.TotalTeachers||''}"></div>
        <div class="form-section-title">نگران</div>
        <div class="form-field"><label class="form-label">نگران کا نام</label><input class="form-input" id="mk_hname" value="${esc(r.HeadName||'')}"></div>
        <div class="form-field"><label class="form-label">رابطہ</label><input class="form-input" id="mk_hcon" value="${esc(r.HeadContact||'')}"></div>
        <div class="form-field"><label class="form-label">واٹس ایپ</label><input class="form-input" id="mk_hwa" value="${esc(r.HeadWhatsApp||'')}"></div>
        <div class="form-field"><label class="form-label">حیثیت</label><select class="form-select" id="mk_stat"><option value="Active" ${r.Status==='Active'?'selected':''}>Active</option><option value="Inactive" ${r.Status==='Inactive'?'selected':''}>Inactive</option></select></div>
        <div class="form-field full"><label class="form-label">نوٹ</label><input class="form-input" id="mk_rem" value="${esc(r.Remarks||'')}"></div>
        <div class="form-section-title">مقام (Location)</div>
        <div class="form-field"><label class="form-label">Latitude</label><input class="form-input" id="mk_lat" value="${r.Latitude||''}" placeholder="25.3960" oninput="updateCoord()"></div>
        <div class="form-field"><label class="form-label">Longitude</label><input class="form-input" id="mk_lng" value="${r.Longitude||''}" placeholder="68.3578" oninput="updateCoord()"></div>
      </div>
      <div class="map-controls">
        <button class="btn btn-outline btn-sm" onclick="useGPS()">${IC.location} موجودہ مقام</button>
        <button class="btn btn-outline btn-sm" onclick="searchLoc()">${IC.search} نام سے تلاش</button>
        <div class="coord-chip" id="coordChip">${IC.location}${r.Latitude&&r.Longitude?r.Latitude+', '+r.Longitude:'نقشے پر کلک کریں'}</div>
      </div>
      <div id="mapPicker" style="height:260px;border-radius:10px;border:1.5px solid var(--border);margin-top:12px;"></div>
      <div class="form-actions">
        <button class="btn btn-gold" onclick="saveMaktab(${isE?r.ID:'null'})">محفوظ کریں <span id="mkSpin"></span></button>
        <button class="btn btn-outline" onclick="document.getElementById('mkFormWrap').innerHTML=''">منسوخ</button>
      </div>
      </div>
    </div>`;
  document.getElementById('mkFormWrap').scrollIntoView({behavior:'smooth'});
  setTimeout(()=>initMap(r.Latitude,r.Longitude),150);
}
function updateCoord(){
  let lat=document.getElementById('mk_lat')?.value, lng=document.getElementById('mk_lng')?.value;
  let c=document.getElementById('coordChip'); if(c&&lat&&lng) c.innerHTML=IC.location+lat+', '+lng;
}
function useGPS(){
  if(!navigator.geolocation){toast('Geolocation سپورٹ نہیں۔','error');return;}
  toast('مقام تلاش ہو رہا ہے...','');
  navigator.geolocation.getCurrentPosition(p=>{
    let lat=p.coords.latitude.toFixed(6),lng=p.coords.longitude.toFixed(6);
    document.getElementById('mk_lat').value=lat; document.getElementById('mk_lng').value=lng; updateCoord();
    if(mapInstance){if(mapMarker)mapInstance.removeLayer(mapMarker);mapMarker=L.marker([+lat,+lng]).addTo(mapInstance);mapInstance.setView([+lat,+lng],14);}
    toast('✓ مقام سیٹ ہو گیا','success');
  },()=>toast('مقام حاصل نہیں ہو سکا۔','error'));
}
function searchLoc(){
  let n=prompt('جگہ کا نام (انگریزی):'); if(!n) return; toast('تلاش ہو رہی ہے...','');
  fetch('https://nominatim.openstreetmap.org/search?q='+encodeURIComponent(n+', Sindh, Pakistan')+'&format=json&limit=1')
    .then(r=>r.json()).then(data=>{
      if(!data.length){toast('مقام نہیں ملا۔','error');return;}
      let lat=parseFloat(data[0].lat).toFixed(6),lng=parseFloat(data[0].lon).toFixed(6);
      document.getElementById('mk_lat').value=lat; document.getElementById('mk_lng').value=lng; updateCoord();
      if(mapInstance){if(mapMarker)mapInstance.removeLayer(mapMarker);mapMarker=L.marker([+lat,+lng]).addTo(mapInstance);mapInstance.setView([+lat,+lng],14);}
      toast('✓ '+(data[0].display_name||'').split(',')[0],'success');
    }).catch(()=>toast('تلاش میں خرابی۔','error'));
}
function initMap(lat,lng){
  if(mapInstance){try{mapInstance.remove();}catch(e){}} mapInstance=null;
  let el=document.getElementById('mapPicker'); if(!el) return;
  let c=(lat&&lng)?[+lat,+lng]:CONFIG.MAP_DEFAULT_CENTER;
  mapInstance=L.map('mapPicker').setView(c,(lat&&lng)?13:CONFIG.MAP_DEFAULT_ZOOM);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(mapInstance);
  if(lat&&lng) mapMarker=L.marker(c).addTo(mapInstance);
  mapInstance.on('click',e=>{
    let la=e.latlng.lat.toFixed(6),lo=e.latlng.lng.toFixed(6);
    if(mapMarker)mapInstance.removeLayer(mapMarker);mapMarker=L.marker([+la,+lo]).addTo(mapInstance);
    document.getElementById('mk_lat').value=la; document.getElementById('mk_lng').value=lo; updateCoord();
  });
  setTimeout(()=>mapInstance.invalidateSize(),200);
}
async function saveMaktab(id){
  let spin=document.getElementById('mkSpin');
  let name=(document.getElementById('mk_name').value||'').trim();
  if(!name){toast('مکتب کا نام ضروری ہے۔','error');return;}
  let p={MaktabName:name,RunningCourses:document.getElementById('mk_courses').value,FullAddress:document.getElementById('mk_address').value,UC:document.getElementById('mk_uc').value,Tehsil:document.getElementById('mk_tehsil').value,District:document.getElementById('mk_district').value,StartDate:document.getElementById('mk_start').value,Capacity:document.getElementById('mk_cap').value,TotalStudents:document.getElementById('mk_ts').value,Boys:document.getElementById('mk_boys').value,Girls:document.getElementById('mk_girls').value,TotalTeachers:document.getElementById('mk_tt').value,HeadName:document.getElementById('mk_hname').value,HeadContact:document.getElementById('mk_hcon').value,HeadWhatsApp:document.getElementById('mk_hwa').value,Status:document.getElementById('mk_stat').value,Remarks:document.getElementById('mk_rem').value,Latitude:document.getElementById('mk_lat').value,Longitude:document.getElementById('mk_lng').value,CreatedBy:currentUser.Username};
  if(id&&id!=='null') p.ID=id;
  spin.innerHTML='<span class="spinner" style="width:13px;height:13px;"></span>';
  let res=await apiSafe(id&&id!=='null'?'updateMaktab':'addMaktab',p); spin.innerHTML='';
  if(res.success){toast(res.offline?'آف لائن: بعد میں sync ہو گا':'✓ محفوظ',res.offline?'warning':'success');document.getElementById('mkFormWrap').innerHTML='';loadMaktabs();}
  else toast(res.message||'خرابی۔','error');
}
async function delMaktab(id){
  if(!confirm('کیا آپ واقعی یہ مکتب حذف کرنا چاہتے ہیں؟')) return;
  let r=await api('deleteMaktab',{ID:id});
  if(r.success){toast('✓ حذف','success');loadMaktabs();}else toast(r.message,'error');
}

/* ===================== TEACHERS ===================== */
function renderTeachers(){
  document.getElementById('pageContent').innerHTML=`
    <div class="page-header"><h2 style="font-size:20px;font-weight:700;">اساتذہ کا ریکارڈ</h2><div class="page-subtitle">Teacher Records</div></div>
    <div class="card">
      <div class="toolbar">
        <div class="search-box">${IC.search}<input id="tcQ" placeholder="نام، CNIC، ضلع..." oninput="applyTcFilter()"></div>
        <select class="filter-sel" id="tcMak" onchange="applyTcFilter()"><option value="">تمام مکاتب</option></select>
        <select class="filter-sel" id="tcSt" onchange="applyTcFilter()"><option value="">تمام حیثیت</option><option value="active">Active</option><option value="left">Left</option></select>
        <div style="margin-left:auto;">${canEdit()?`<button class="btn btn-gold btn-sm" onclick="openTeacherForm()">${IC.add} نیا استاد</button>`:''}</div>
      </div>
      <div id="tcTableWrap">${loadHTML('اساتذہ لوڈ ہو رہے ہیں...')}</div>
    </div>
    <div id="tcFormWrap"></div>`;
  loadTeachers();
}
async function loadTeachers(){
  try{
    let [tR,mR,uR]=await Promise.all([api('getTeachers',{}),api('getMaktabs',{}),api('getUsers',{})]);
    cache.teachers=tR.success?tR.rows:[]; cache.maktabs=mR.success?mR.rows:cache.maktabs; cache.users=uR.success?uR.rows:cache.users;
    let rows=filterByRole(cache.teachers,'teachers');
    let mf=document.getElementById('tcMak');
    if(mf){let mids=[...new Set(rows.map(r=>String(r.MaktabID)).filter(Boolean))];mf.innerHTML='<option value="">تمام مکاتب</option>'+mids.map(id=>`<option value="${id}">${esc(maktabName(id))}</option>`).join('');}
    renderTcTable(rows);
  }catch{document.getElementById('tcTableWrap').innerHTML=emptyHTML('Connection error.');}
}
function applyTcFilter(){
  let q=(document.getElementById('tcQ')?.value||'').toLowerCase(),mf=document.getElementById('tcMak')?.value||'',sf=document.getElementById('tcSt')?.value||'';
  document.querySelectorAll('#tcTable tbody tr').forEach(tr=>{
    tr.style.display=(!q||(tr.dataset.s||'').includes(q))&&(!mf||(tr.dataset.m||'')===mf)&&(!sf||(tr.dataset.st||'')===sf)?'':'none';
  });
}
function renderTcTable(rows){
  let w=document.getElementById('tcTableWrap');
  if(!rows.length){w.innerHTML=emptyHTML('کوئی استاد موجود نہیں۔');return;}
  let ce=canEdit();
  w.innerHTML=`<div class="table-wrap"><table id="tcTable">
    <thead><tr><th>نام</th><th>عہدہ</th><th>مکتب</th><th>سپروائزر</th><th>CNIC</th><th>فون</th><th>تجربہ</th><th>حیثیت</th><th></th></tr></thead>
    <tbody>${rows.map(r=>`
      <tr data-s="${esc((r.Name+' '+r.CNIC+' '+(r.District||'')).toLowerCase())}" data-m="${esc(String(r.MaktabID||''))}" data-st="${esc((r.Status||'').toLowerCase())}">
        <td><div class="td-main">${esc(r.Name)}</div><div class="td-sub">${esc(r.Gender||'')} · ${esc(r.Qualification||'')}</div></td>
        <td>${esc(r.Designation||'-')}</td>
        <td>${esc(maktabName(r.MaktabID))}</td>
        <td>${esc(r.SupervisorName||'-')}</td>
        <td style="font-family:monospace;font-size:11px;">${esc(r.CNIC||'-')}</td>
        <td>${esc(r.Phone||'-')}</td>
        <td>${r.Experience||0} سال</td>
        <td>${statusBadge(r.Status)}</td>
        <td><div class="td-actions">${ce?`<button class="btn btn-outline btn-icon btn-sm" onclick="openTeacherForm(${r.ID})">${IC.edit}</button><button class="btn btn-danger btn-icon btn-sm" onclick="delTeacher(${r.ID})">${IC.del}</button>`:'-'}</div></td>
      </tr>`).join('')}
    </tbody></table></div>`;
}
function openTeacherForm(id){
  let r=id?(cache.teachers.find(t=>String(t.ID)===String(id))||{}):{}; let isE=!!(id&&Object.keys(r).length);
  let mOpts=cache.maktabs.map(m=>`<option value="${m.ID}" ${String(r.MaktabID)===String(m.ID)?'selected':''}>${esc(m.MaktabName)}</option>`).join('');
  let sOpts=(cache.users||[]).filter(u=>u.Role==='Supervisor').map(u=>`<option value="${esc(u.Username)}" ${r.SupervisorID===u.Username?'selected':''}>${esc(u.Name||u.Username)}</option>`).join('');
  document.getElementById('tcFormWrap').innerHTML=`
    <div class="card anim-fade-up">
      <div class="card-header"><div class="card-header-left"><div class="card-header-icon">${IC.teacher}</div><div class="card-title">${isE?'استاد میں ترمیم':'نیا استاد شامل کریں'}</div></div></div>
      <div class="card-body"><div class="form-grid">
        <div class="form-section-title">ذاتی معلومات</div>
        <div class="form-field"><label class="form-label">نام *</label><input class="form-input" id="tc_name" value="${esc(r.Name||'')}"></div>
        <div class="form-field"><label class="form-label">عہدہ</label><input class="form-input" id="tc_des" value="${esc(r.Designation||'')}" placeholder="Qari, Hifz Teacher..."></div>
        <div class="form-field"><label class="form-label">والد کا نام</label><input class="form-input" id="tc_father" value="${esc(r.FatherName||'')}"></div>
        <div class="form-field"><label class="form-label">CNIC</label><input class="form-input" id="tc_cnic" value="${esc(r.CNIC||'')}" placeholder="00000-0000000-0"></div>
        <div class="form-field"><label class="form-label">تاریخ پیدائش</label><input class="form-input" type="date" id="tc_dob" value="${toDateInput(r.DOB)}"></div>
        <div class="form-field"><label class="form-label">جنس</label><select class="form-select" id="tc_gen"><option value="Male" ${r.Gender==='Male'?'selected':''}>Male</option><option value="Female" ${r.Gender==='Female'?'selected':''}>Female</option></select></div>
        <div class="form-field"><label class="form-label">تحصیل</label><input class="form-input" id="tc_teh" value="${esc(r.Tehsil||'')}"></div>
        <div class="form-field"><label class="form-label">ضلع</label><input class="form-input" id="tc_dist" value="${esc(r.District||'')}"></div>
        <div class="form-field full"><label class="form-label">پتہ</label><input class="form-input" id="tc_addr" value="${esc(r.Address||'')}"></div>
        <div class="form-section-title">تعلیمی اور پیشہ ورانہ</div>
        <div class="form-field"><label class="form-label">قابلیت</label><input class="form-input" id="tc_qual" value="${esc(r.Qualification||'')}"></div>
        <div class="form-field"><label class="form-label">سرٹیفیکیشن</label><input class="form-input" id="tc_cert" value="${esc(r.Certification||'')}"></div>
        <div class="form-field"><label class="form-label">تجربہ (سال)</label><input class="form-input" type="number" id="tc_exp" value="${r.Experience||''}"></div>
        <div class="form-field"><label class="form-label">تقرری تاریخ</label><input class="form-input" type="date" id="tc_appt" value="${toDateInput(r.DateOfAppointment)}"></div>
        <div class="form-field"><label class="form-label">فون / واٹس ایپ</label><input class="form-input" id="tc_phone" value="${esc(r.Phone||'')}"></div>
        <div class="form-field"><label class="form-label">تنخواہ (روپے)</label><input class="form-input" type="number" id="tc_sal" value="${r.Salary||''}"></div>
        <div class="form-field"><label class="form-label">ادائیگی کا طریقہ</label><select class="form-select" id="tc_saltype"><option value="Cash" ${r.SalaryType==='Cash'?'selected':''}>Cash</option><option value="Bank Account" ${r.SalaryType==='Bank Account'?'selected':''}>Bank Account</option></select></div>
        <div class="form-section-title">مکتب اور سپروائزر</div>
        <div class="form-field"><label class="form-label">متعلقہ مکتب</label><select class="form-select" id="tc_mak"><option value="">-- منتخب کریں --</option>${mOpts}</select></div>
        <div class="form-field"><label class="form-label">سپروائزر (جس کو رپورٹ کریں)</label><select class="form-select" id="tc_sup"><option value="">-- منتخب کریں --</option>${sOpts}</select></div>
        <div class="form-field"><label class="form-label">حیثیت</label><select class="form-select" id="tc_stat"><option value="Active" ${r.Status==='Active'?'selected':''}>Active</option><option value="Left" ${r.Status==='Left'?'selected':''}>Left</option></select></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-gold" onclick="saveTeacher(${isE?r.ID:'null'})">محفوظ کریں <span id="tcSpin"></span></button>
        <button class="btn btn-outline" onclick="document.getElementById('tcFormWrap').innerHTML=''">منسوخ</button>
      </div></div>
    </div>`;
  document.getElementById('tcFormWrap').scrollIntoView({behavior:'smooth'});
}
async function saveTeacher(id){
  let spin=document.getElementById('tcSpin');
  let name=(document.getElementById('tc_name').value||'').trim(); if(!name){toast('نام ضروری ہے۔','error');return;}
  let su=document.getElementById('tc_sup').value, suUser=(cache.users||[]).find(u=>u.Username===su);
  let p={Name:name,Designation:document.getElementById('tc_des').value,FatherName:document.getElementById('tc_father').value,CNIC:document.getElementById('tc_cnic').value,DOB:document.getElementById('tc_dob').value,Gender:document.getElementById('tc_gen').value,Tehsil:document.getElementById('tc_teh').value,District:document.getElementById('tc_dist').value,Address:document.getElementById('tc_addr').value,Qualification:document.getElementById('tc_qual').value,Certification:document.getElementById('tc_cert').value,Experience:document.getElementById('tc_exp').value,DateOfAppointment:document.getElementById('tc_appt').value,Phone:document.getElementById('tc_phone').value,Salary:document.getElementById('tc_sal').value,SalaryType:document.getElementById('tc_saltype').value,MaktabID:document.getElementById('tc_mak').value,SupervisorID:su,SupervisorName:suUser?(suUser.Name||suUser.Username):su,Status:document.getElementById('tc_stat').value,CreatedBy:currentUser.Username};
  if(id&&id!=='null') p.ID=id;
  spin.innerHTML='<span class="spinner" style="width:13px;height:13px;"></span>';
  let res=await apiSafe(id&&id!=='null'?'updateTeacher':'addTeacher',p); spin.innerHTML='';
  if(res.success){toast(res.offline?'آف لائن: بعد sync':'✓ محفوظ',res.offline?'warning':'success');document.getElementById('tcFormWrap').innerHTML='';loadTeachers();}
  else toast(res.message||'خرابی۔','error');
}
async function delTeacher(id){
  if(!confirm('کیا آپ واقعی اس استاد کو حذف کرنا چاہتے ہیں؟'))return;
  let r=await api('deleteTeacher',{ID:id}); if(r.success){toast('✓ حذف','success');loadTeachers();}else toast(r.message,'error');
}

/* ===================== STUDENTS ===================== */
function renderStudents(){
  document.getElementById('pageContent').innerHTML=`
    <div class="page-header"><h2 style="font-size:20px;font-weight:700;">طلباء کا ریکارڈ</h2><div class="page-subtitle">Student Records</div></div>
    <div class="card">
      <div class="toolbar">
        <div class="search-box">${IC.search}<input id="stQ" placeholder="نام، والد، سطح..." oninput="applyStFilter()"></div>
        <select class="filter-sel" id="stMak" onchange="applyStFilter()"><option value="">تمام مکاتب</option></select>
        <select class="filter-sel" id="stLvl" onchange="applyStFilter()"><option value="">تمام سطح</option><option value="qaida">Qaida</option><option value="nazra">Nazra</option><option value="hifz">Hifz</option><option value="tafseer">Tafseer</option></select>
        <select class="filter-sel" id="stSt" onchange="applyStFilter()"><option value="">تمام حیثیت</option><option value="active">فعال</option><option value="dropout">Dropout</option></select>
        <div style="margin-left:auto;"><button class="btn btn-gold btn-sm" onclick="openStudentForm()">${IC.add} نیا طالب علم</button></div>
      </div>
      <div id="stTableWrap">${loadHTML('طلباء لوڈ ہو رہے ہیں...')}</div>
    </div>
    <div id="stFormWrap"></div>`;
  loadStudents();
}
async function loadStudents(){
  try{
    let [sR,mR]=await Promise.all([api('getStudents',{}),api('getMaktabs',{})]);
    cache.students=sR.success?sR.rows:[]; cache.maktabs=mR.success?mR.rows:cache.maktabs;
    let rows=filterByRole(cache.students,'students');
    let mf=document.getElementById('stMak'); if(mf){let ids=[...new Set(rows.map(r=>String(r.MaktabID)).filter(Boolean))];mf.innerHTML='<option value="">تمام مکاتب</option>'+ids.map(id=>`<option value="${id}">${esc(maktabName(id))}</option>`).join('');}
    renderStTable(rows);
  }catch{document.getElementById('stTableWrap').innerHTML=emptyHTML('Connection error.');}
}
function applyStFilter(){
  let q=(document.getElementById('stQ')?.value||'').toLowerCase(),mf=document.getElementById('stMak')?.value||'',lf=document.getElementById('stLvl')?.value||'',sf=document.getElementById('stSt')?.value||'';
  document.querySelectorAll('#stTable tbody tr').forEach(tr=>{
    tr.style.display=(!q||(tr.dataset.s||'').includes(q))&&(!mf||(tr.dataset.m||'')===mf)&&(!lf||(tr.dataset.l||'')===lf)&&(!sf||(tr.dataset.st||'')===sf)?'':'none';
  });
}
function renderStTable(rows){
  let w=document.getElementById('stTableWrap'); if(!rows.length){w.innerHTML=emptyHTML('کوئی طالب علم موجود نہیں۔');return;}
  w.innerHTML=`<div class="table-wrap"><table id="stTable">
    <thead><tr><th>نام</th><th>والد</th><th>مکتب</th><th>استاد</th><th>سطح</th><th>حاضری</th><th>جنس</th><th>حیثیت</th><th></th></tr></thead>
    <tbody>${rows.map(r=>`
      <tr data-s="${esc((r.Name+' '+(r.FatherName||'')+(r.CurrentLevel||'')).toLowerCase())}" data-m="${esc(String(r.MaktabID||''))}" data-l="${esc((r.CurrentLevel||'').toLowerCase())}" data-st="${esc((r.Status||'').toLowerCase())}">
        <td><div class="td-main">${esc(r.Name)}</div></td>
        <td><div class="td-main">${esc(r.FatherName||'-')}</div><div class="td-sub">${esc(r.FatherPhone||'')}</div></td>
        <td>${esc(maktabName(r.MaktabID))}</td>
        <td>${esc(r.TeacherName||'-')}</td>
        <td><span class="badge badge-blue">${esc(r.CurrentLevel||'-')}</span></td>
        <td>${r.Attendance||0}%</td>
        <td>${esc(r.Gender||'-')}</td>
        <td>${statusBadge(r.Status)}</td>
        <td><div class="td-actions">
          <button class="btn btn-outline btn-icon btn-sm" onclick="openStudentForm(${r.ID})">${IC.edit}</button>
          ${canEdit()?`<button class="btn btn-danger btn-icon btn-sm" onclick="delStudent(${r.ID})">${IC.del}</button>`:''}
        </div></td>
      </tr>`).join('')}
    </tbody></table></div>`;
}
function openStudentForm(id){
  let r=id?(cache.students.find(s=>String(s.ID)===String(id))||{}):{}; let isE=!!(id&&Object.keys(r).length);
  let mOpts=cache.maktabs.map(m=>`<option value="${m.ID}" ${String(r.MaktabID)===String(m.ID)?'selected':''}>${esc(m.MaktabName)}</option>`).join('');
  document.getElementById('stFormWrap').innerHTML=`
    <div class="card anim-fade-up">
      <div class="card-header"><div class="card-header-left"><div class="card-header-icon">${IC.student}</div><div class="card-title">${isE?'طالب علم میں ترمیم':'نیا طالب علم شامل کریں'}</div></div></div>
      <div class="card-body"><div class="form-grid">
        <div class="form-section-title">ذاتی معلومات</div>
        <div class="form-field"><label class="form-label">نام *</label><input class="form-input" id="st_name" value="${esc(r.Name||'')}"></div>
        <div class="form-field"><label class="form-label">والد کا نام</label><input class="form-input" id="st_father" value="${esc(r.FatherName||'')}"></div>
        <div class="form-field"><label class="form-label">والد CNIC</label><input class="form-input" id="st_fcnic" value="${esc(r.FatherCNIC||'')}"></div>
        <div class="form-field"><label class="form-label">والد فون</label><input class="form-input" id="st_fphone" value="${esc(r.FatherPhone||'')}"></div>
        <div class="form-field"><label class="form-label">تاریخ پیدائش</label><input class="form-input" type="date" id="st_dob" value="${toDateInput(r.DOB)}"></div>
        <div class="form-field"><label class="form-label">جنس</label><select class="form-select" id="st_gen"><option value="Male" ${r.Gender==='Male'?'selected':''}>Male</option><option value="Female" ${r.Gender==='Female'?'selected':''}>Female</option></select></div>
        <div class="form-field full"><label class="form-label">پتہ</label><input class="form-input" id="st_addr" value="${esc(r.Address||'')}"></div>
        <div class="form-section-title">تعلیمی معلومات</div>
        <div class="form-field"><label class="form-label">داخلے کی تاریخ</label><input class="form-input" type="date" id="st_adm" value="${toDateInput(r.DateOfAdmission)}"></div>
        <div class="form-field"><label class="form-label">کورس کی تفصیل</label><input class="form-input" id="st_course" value="${esc(r.CourseDetails||'')}"></div>
        <div class="form-field"><label class="form-label">موجودہ سطح</label><select class="form-select" id="st_lvl"><option value="Qaida" ${r.CurrentLevel==='Qaida'?'selected':''}>Qaida</option><option value="Nazra" ${r.CurrentLevel==='Nazra'?'selected':''}>Nazra</option><option value="Hifz" ${r.CurrentLevel==='Hifz'?'selected':''}>Hifz</option><option value="Tafseer" ${r.CurrentLevel==='Tafseer'?'selected':''}>Tafseer</option><option value="Other" ${r.CurrentLevel==='Other'?'selected':''}>Other</option></select></div>
        <div class="form-field"><label class="form-label">حاضری %</label><input class="form-input" type="number" min="0" max="100" id="st_att" value="${r.Attendance||''}"></div>
        <div class="form-field"><label class="form-label">سکول جاتا ہے؟</label><select class="form-select" id="st_sc" onchange="document.getElementById('st_scd').style.display=this.value==='Yes'?'block':'none'"><option value="No" ${r.SchoolGoing!=='Yes'?'selected':''}>No</option><option value="Yes" ${r.SchoolGoing==='Yes'?'selected':''}>Yes</option></select></div>
        <div class="form-field full" id="st_scd" style="display:${r.SchoolGoing==='Yes'?'block':'none'}"><label class="form-label">سکول کی تفصیل</label><input class="form-input" id="st_scdet" value="${esc(r.SchoolDetails||'')}"></div>
        <div class="form-section-title">مکتب اور استاد</div>
        <div class="form-field"><label class="form-label">مکتب</label><select class="form-select" id="st_mak"><option value="">-- منتخب کریں --</option>${mOpts}</select></div>
        <div class="form-field"><label class="form-label">استاد کا نام</label><input class="form-input" id="st_tchr" value="${esc(r.TeacherName||'')}"></div>
        <div class="form-field"><label class="form-label">حیثیت</label><select class="form-select" id="st_stat"><option value="Active" ${r.Status==='Active'?'selected':''}>Active</option><option value="Dropout" ${r.Status==='Dropout'?'selected':''}>Dropout</option></select></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-gold" onclick="saveStudent(${isE?r.ID:'null'})">محفوظ کریں <span id="stSpin"></span></button>
        <button class="btn btn-outline" onclick="document.getElementById('stFormWrap').innerHTML=''">منسوخ</button>
      </div></div>
    </div>`;
  document.getElementById('stFormWrap').scrollIntoView({behavior:'smooth'});
}
async function saveStudent(id){
  let spin=document.getElementById('stSpin');
  let name=(document.getElementById('st_name').value||'').trim(); if(!name){toast('نام ضروری ہے۔','error');return;}
  let p={Name:name,FatherName:document.getElementById('st_father').value,FatherCNIC:document.getElementById('st_fcnic').value,FatherPhone:document.getElementById('st_fphone').value,DOB:document.getElementById('st_dob').value,Gender:document.getElementById('st_gen').value,Address:document.getElementById('st_addr').value,DateOfAdmission:document.getElementById('st_adm').value,CourseDetails:document.getElementById('st_course').value,CurrentLevel:document.getElementById('st_lvl').value,Attendance:document.getElementById('st_att').value,SchoolGoing:document.getElementById('st_sc').value,SchoolDetails:(document.getElementById('st_scdet')||{}).value||'',MaktabID:document.getElementById('st_mak').value,TeacherName:document.getElementById('st_tchr').value,Status:document.getElementById('st_stat').value,CreatedBy:currentUser.Username};
  if(id&&id!=='null') p.ID=id;
  spin.innerHTML='<span class="spinner" style="width:13px;height:13px;"></span>';
  let res=await apiSafe(id&&id!=='null'?'updateStudent':'addStudent',p); spin.innerHTML='';
  if(res.success){toast(res.offline?'آف لائن: بعد sync':'✓ محفوظ',res.offline?'warning':'success');document.getElementById('stFormWrap').innerHTML='';loadStudents();}
  else toast(res.message||'خرابی۔','error');
}
async function delStudent(id){
  if(!confirm('کیا آپ واقعی اس طالب علم کو حذف کرنا چاہتے ہیں؟'))return;
  let r=await api('deleteStudent',{ID:id}); if(r.success){toast('✓ حذف','success');loadStudents();}else toast(r.message,'error');
}

/* ===================== MAP VIEW ===================== */
function renderMapView(){
  document.getElementById('pageContent').innerHTML=`
    <div class="page-header"><h2 style="font-size:20px;font-weight:700;">مکاتب کا نقشہ</h2><div class="page-subtitle">تمام مکاتب کے مقامات</div></div>
    <div class="card" style="overflow:hidden;">
      <div id="mapViewContainer" style="height:430px;"></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">مقامات کے ساتھ مکاتب</div></div>
      <div id="mapListWrap">${loadHTML('لوڈ ہو رہا ہے...')}</div>
    </div>`;
  api('getMaktabs',{}).then(res=>{
    if(!res.success){document.getElementById('mapListWrap').innerHTML=emptyHTML('Error.');return;}
    cache.maktabs=res.rows;
    let rows=filterByRole(res.rows,'maktabs');
    let map=L.map('mapViewContainer').setView(CONFIG.MAP_DEFAULT_CENTER,CONFIG.MAP_DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
    let withLoc=rows.filter(r=>r.Latitude&&r.Longitude);
    withLoc.forEach(r=>{
      L.marker([+r.Latitude,+r.Longitude]).addTo(map).bindPopup(`<b>${esc(r.MaktabName)}</b><br>${esc(r.Tehsil)}, ${esc(r.District)}<br>طلباء: ${r.TotalStudents||0} | اساتذہ: ${r.TotalTeachers||0}<br><a href="https://www.google.com/maps?q=${r.Latitude},${r.Longitude}" target="_blank">🗺️ Google Maps</a>`);
    });
    if(withLoc.length>1) map.fitBounds(withLoc.map(r=>[+r.Latitude,+r.Longitude]),{padding:[20,20]});
    setTimeout(()=>map.invalidateSize(),200);
    document.getElementById('mapListWrap').innerHTML=withLoc.length?`
      <div class="table-wrap"><table>
        <thead><tr><th>مکتب</th><th>تحصیل</th><th>ضلع</th><th>حیثیت</th><th></th></tr></thead>
        <tbody>${withLoc.map(r=>`<tr><td><div class="td-main">${esc(r.MaktabName)}</div></td><td>${esc(r.Tehsil)}</td><td>${esc(r.District)}</td><td>${statusBadge(r.Status)}</td><td><a href="https://www.google.com/maps?q=${r.Latitude},${r.Longitude}" target="_blank" class="btn btn-outline btn-sm">${IC.location} Maps</a></td></tr>`).join('')}</tbody>
      </table></div>`:emptyHTML('کوئی مکتب بھی نقشے پر سیٹ نہیں ہے۔');
  }).catch(()=>{document.getElementById('mapListWrap').innerHTML=emptyHTML('Connection error.');});
}

/* ===================== USERS ===================== */
function renderUsers(){
  if(!isAdmin()){navigate('dashboard');return;}
  document.getElementById('pageContent').innerHTML=`
    <div class="page-header"><h2 style="font-size:20px;font-weight:700;">صارفین کا انتظام</h2><div class="page-subtitle">User Management</div></div>
    <div class="card">
      <div class="toolbar">
        <div style="margin-left:auto;"><button class="btn btn-gold btn-sm" onclick="openUserForm()">${IC.add} نیا صارف</button></div>
      </div>
      <div id="usTableWrap">${loadHTML('لوڈ ہو رہا ہے...')}</div>
    </div>
    <div id="usFormWrap"></div>`;
  loadUsers();
}
async function loadUsers(){
  try{
    let [uR,mR]=await Promise.all([api('getUsers',{}),api('getMaktabs',{})]);
    cache.users=uR.success?uR.rows:[]; cache.maktabs=mR.success?mR.rows:cache.maktabs;
    renderUsTable(cache.users);
  }catch{document.getElementById('usTableWrap').innerHTML=emptyHTML('Connection error.');}
}
function renderUsTable(rows){
  let w=document.getElementById('usTableWrap'); if(!rows.length){w.innerHTML=emptyHTML('کوئی صارف نہیں۔');return;}
  w.innerHTML=`<div class="table-wrap"><table>
    <thead><tr><th>Username</th><th>نام</th><th>کردار</th><th>متعلقہ مکتب</th><th>فون</th><th>حیثیت</th><th></th></tr></thead>
    <tbody>${rows.map(r=>`<tr>
      <td><div class="td-main">${esc(r.Username)}</div></td>
      <td>${esc(r.Name||'-')}</td>
      <td>${roleBadge(r.Role)}</td>
      <td>${esc(r.AssignedMaktab||'-')}</td>
      <td>${esc(r.Phone||'-')}</td>
      <td>${statusBadge(r.Status)}</td>
      <td><div class="td-actions"><button class="btn btn-outline btn-icon btn-sm" onclick="openUserForm('${esc(r.Username)}')">${IC.edit}</button><button class="btn btn-danger btn-icon btn-sm" onclick="delUser('${esc(r.Username)}')">${IC.del}</button></div></td>
    </tr>`).join('')}</tbody></table></div>`;
}
function openUserForm(username){
  let r=username?((cache.users||[]).find(u=>u.Username===username)||{}):{}; let isE=!!(username&&Object.keys(r).length);
  let mOpts=cache.maktabs.map(m=>`<option value="${esc(m.MaktabName)}" ${r.AssignedMaktab===m.MaktabName?'selected':''}>${esc(m.MaktabName)}</option>`).join('');
  document.getElementById('usFormWrap').innerHTML=`
    <div class="card anim-fade-up">
      <div class="card-header"><div class="card-header-left"><div class="card-header-icon">${IC.users}</div><div class="card-title">${isE?'صارف میں ترمیم':'نیا صارف شامل کریں'}</div></div></div>
      <div class="card-body"><div class="form-grid">
        <div class="form-field"><label class="form-label">یوزر نیم *</label><input class="form-input" id="us_un" value="${esc(r.Username||'')}" ${isE?'readonly style="background:#f1f5f9;"':''}></div>
        <div class="form-field"><label class="form-label">پاس ورڈ ${isE?'(خالی = تبدیلی نہیں)':'*'}</label><input class="form-input" id="us_pw" type="text" placeholder="${isE?'تبدیل کرنے کے لیے درج کریں':''}"></div>
        <div class="form-field"><label class="form-label">مکمل نام</label><input class="form-input" id="us_name" value="${esc(r.Name||'')}"></div>
        <div class="form-field"><label class="form-label">کردار</label><select class="form-select" id="us_role"><option value="Admin" ${r.Role==='Admin'?'selected':''}>Admin</option><option value="Supervisor" ${r.Role==='Supervisor'?'selected':''}>Supervisor</option><option value="Teacher" ${r.Role==='Teacher'?'selected':''}>Teacher</option></select></div>
        <div class="form-field"><label class="form-label">متعلقہ مکتب</label><select class="form-select" id="us_mak"><option value="All">All</option>${mOpts}</select></div>
        <div class="form-field"><label class="form-label">فون</label><input class="form-input" id="us_ph" value="${esc(r.Phone||'')}"></div>
        <div class="form-field"><label class="form-label">حیثیت</label><select class="form-select" id="us_st"><option value="Active" ${r.Status==='Active'?'selected':''}>Active</option><option value="Inactive" ${r.Status==='Inactive'?'selected':''}>Inactive</option></select></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-gold" onclick="saveUser(${isE})">محفوظ کریں <span id="usSpin"></span></button>
        <button class="btn btn-outline" onclick="document.getElementById('usFormWrap').innerHTML=''">منسوخ</button>
      </div></div>
    </div>`;
  document.getElementById('usFormWrap').scrollIntoView({behavior:'smooth'});
}
async function saveUser(isE){
  let spin=document.getElementById('usSpin');
  let un=(document.getElementById('us_un').value||'').trim(), pw=document.getElementById('us_pw').value;
  if(!un){toast('Username ضروری ہے۔','error');return;}
  if(!isE&&!pw){toast('نئے صارف کے لیے password ضروری ہے۔','error');return;}
  let p={Username:un,Name:document.getElementById('us_name').value,Role:document.getElementById('us_role').value,AssignedMaktab:document.getElementById('us_mak').value,Phone:document.getElementById('us_ph').value,Status:document.getElementById('us_st').value};
  if(pw) p.Password=pw; if(isE){p.username_key=un;p.ID=un;}
  spin.innerHTML='<span class="spinner" style="width:13px;height:13px;"></span>';
  let res=await api(isE?'updateUser':'addUser',p); spin.innerHTML='';
  if(res.success){toast('✓ محفوظ','success');document.getElementById('usFormWrap').innerHTML='';loadUsers();}
  else toast(res.message||'خرابی۔','error');
}
async function delUser(username){
  if(!confirm('کیا آپ واقعی اس صارف کو حذف کرنا چاہتے ہیں؟'))return;
  let r=await api('deleteUser',{ID:username,username_key:username}); if(r.success){toast('✓ حذف','success');loadUsers();}else toast(r.message,'error');
}

/* ===================== PROFILE ===================== */
function renderProfile(){
  let u=currentUser||{};
  let myS=filterByRole(cache.students||[],'students');
  document.getElementById('pageContent').innerHTML=`
    <div class="page-header"><h2 style="font-size:20px;font-weight:700;">میرا پروفائل</h2><div class="page-subtitle">My Profile</div></div>
    <div class="profile-hero anim-scale">
      <div class="profile-avatar-lg">${IC.profile}</div>
      <div>
        <h2>${esc(u.Name||u.Username)}</h2>
        <p>${roleBadge(u.Role)} &nbsp; ${esc(u.Phone||'')}</p>
        <p style="margin-top:6px;font-size:12px;color:rgba(255,255,255,0.6);">مکتب: ${esc(u.AssignedMaktab||'N/A')}</p>
      </div>
    </div>
    ${isTeacher()?`
    <div class="stats-row stagger" style="margin-bottom:20px;">
      <div class="stat-card sc-teal"><div class="stat-icon-circle">${IC.student}</div><div class="stat-num">${myS.length}</div><div class="stat-label">کل طلباء</div></div>
      <div class="stat-card sc-green"><div class="stat-icon-circle">${IC.active}</div><div class="stat-num">${myS.filter(s=>String(s.Status||'').toLowerCase()==='active').length}</div><div class="stat-label">فعال طلباء</div></div>
      <div class="stat-card sc-blue"><div class="stat-icon-circle">${IC.boys}</div><div class="stat-num">${myS.filter(s=>String(s.Gender||'').toLowerCase().startsWith('m')).length}</div><div class="stat-label">لڑکے</div></div>
      <div class="stat-card sc-pink"><div class="stat-icon-circle">${IC.boys}</div><div class="stat-num">${myS.filter(s=>String(s.Gender||'').toLowerCase().startsWith('f')).length}</div><div class="stat-label">لڑکیاں</div></div>
    </div>`:''}
    <div class="card">
      <div class="card-header"><div class="card-title">پروفائل تبدیل کریں</div></div>
      <div class="card-body">
        <div class="form-grid" style="max-width:500px;">
          <div class="form-field"><label class="form-label">نام</label><input class="form-input" value="${esc(u.Name||u.Username)}" readonly style="background:#f8fafc;"></div>
          <div class="form-field"><label class="form-label">Username</label><input class="form-input" value="${esc(u.Username)}" readonly style="background:#f8fafc;"></div>
          <div class="form-field"><label class="form-label">کردار</label><input class="form-input" value="${esc(u.Role)}" readonly style="background:#f8fafc;"></div>
          <div class="form-field"><label class="form-label">فون</label><input class="form-input" id="pf_phone" value="${esc(u.Phone||'')}"></div>
          <div class="form-field full"><label class="form-label">نیا پاس ورڈ (خالی = تبدیلی نہیں)</label><input class="form-input" type="password" id="pf_pass" placeholder="نیا پاس ورڈ"></div>
        </div>
        <div class="form-actions">
          <button class="btn btn-gold" onclick="saveProfile()">اپڈیٹ کریں <span id="pfSpin"></span></button>
        </div>
      </div>
    </div>`;
}
async function saveProfile(){
  let spin=document.getElementById('pfSpin'), phone=document.getElementById('pf_phone').value, pass=document.getElementById('pf_pass').value;
  let p={username_key:currentUser.Username,Username:currentUser.Username,Phone:phone};
  if(pass) p.Password=pass;
  spin.innerHTML='<span class="spinner" style="width:13px;height:13px;"></span>';
  let res=await api('updateUser',p); spin.innerHTML='';
  if(res.success){currentUser.Phone=phone;localStorage.setItem('isra_user',JSON.stringify(currentUser));toast('✓ پروفائل اپڈیٹ ہو گیا','success');}
  else toast(res.message||'خرابی۔','error');
}
