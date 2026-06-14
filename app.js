/***********************************************************************
 * ISRA QURAN ACADEMY PORTAL — app.js v3.1
 ***********************************************************************/
let currentUser=null,mapInstance=null,mapMarker=null;
let cache={maktabs:[],teachers:[],students:[],users:[]};
let offlineQueue=JSON.parse(localStorage.getItem('isra_offline_queue')||'[]');
let isOnline=navigator.onLine;

/* ===== ICONS (small inline SVGs — NOT large display icons) ===== */
const IC={
  dashboard:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  maktab:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21V13h6v8"/></svg>`,
  teacher:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>`,
  student:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  map:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
  users:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  profile:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M3 21a9 9 0 0 1 18 0"/></svg>`,
  more:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>`,
  location: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  search:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  edit:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  del:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  add:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  sync:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  check:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  book:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  chart:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  boys:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="7" r="3.5"/><path d="M2 20v-1a6 6 0 0 1 12 0v1"/><circle cx="17" cy="7" r="3"/><path d="M21 20v-1a5 5 0 0 0-5-5h-.5"/></svg>`,
};

/* ===== PWA ===== */
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js').then(()=>{
    navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='SYNC_NOW')syncOfflineQueue();});
  }).catch(()=>{});
}
window.addEventListener('online', ()=>{isOnline=true; updateStatus(); syncOfflineQueue();});
window.addEventListener('offline',()=>{isOnline=false; updateStatus();});

function updateStatus(){
  document.getElementById('offlineBanner')?.classList.toggle('show',!isOnline);
  let dot=document.getElementById('sbDot'); if(dot) dot.classList.toggle('off',!isOnline);
  let txt=document.getElementById('sbOnlineText'); if(txt) txt.textContent=isOnline?'Online':'Offline';
  let sb=document.getElementById('syncBtn'); if(sb) sb.classList.toggle('hidden',offlineQueue.length===0);
}

/* ===== OFFLINE QUEUE ===== */
function queueAction(action,params){
  offlineQueue.push({action,params,time:Date.now()});
  localStorage.setItem('isra_offline_queue',JSON.stringify(offlineQueue));
  toast('آف لائن — بعد میں sync ہو گا','warning');
  updateStatus();
}
async function syncOfflineQueue(){
  if(!isOnline||!offlineQueue.length) return;
  toast('Sync ہو رہا ہے...','');
  let failed=[];
  for(let item of offlineQueue){
    try{let r=await api(item.action,item.params);if(!r.success)failed.push(item);}
    catch{failed.push(item);}
  }
  offlineQueue=failed;
  localStorage.setItem('isra_offline_queue',JSON.stringify(offlineQueue));
  toast(failed.length?`${failed.length} records fail ہوئے`:'✓ تمام sync ہو گیا',failed.length?'error':'success');
  updateStatus();
}

/* ===== API ===== */
function api(action,params){
  return new Promise((res,rej)=>{
    let all=Object.assign({action},params||{});
    let q=new URLSearchParams();
    for(let k in all) q.append(k,all[k]==null?'':all[k]);
    fetch(CONFIG.SCRIPT_URL+'?'+q.toString()).then(r=>r.json()).then(res).catch(rej);
  });
}
function apiS(action,params){
  if(!isOnline){queueAction(action,params);return Promise.resolve({success:true,offline:true});}
  return api(action,params).catch(()=>{queueAction(action,params);return{success:true,offline:true};});
}

/* ===== TOAST ===== */
function toast(msg,type){
  let t=document.getElementById('toast'); if(!t) return;
  let ico={success:IC.check,error:IC.x,warning:'⚠️'};
  t.innerHTML=(ico[type]||'')+msg;
  t.className='toast show'+(type?' '+type:'');
  clearTimeout(t._t); t._t=setTimeout(()=>{t.className='toast';},3500);
}

/* ===== AUTH ===== */
function doLogin(){
  let u=(document.getElementById('loginUser').value||'').trim();
  let p=(document.getElementById('loginPass').value||'').trim();
  let err=document.getElementById('loginError');
  let spin=document.getElementById('loginSpin');
  let btn=document.getElementById('loginBtn');
  err.textContent='';
  if(!u||!p){err.textContent='Username اور password درج کریں۔';return;}
  spin.innerHTML='<span class="spinner" style="width:13px;height:13px;border-top-color:#fff;"></span>';
  btn.disabled=true;
  api('login',{username:u,password:p}).then(res=>{
    spin.innerHTML='';btn.disabled=false;
    if(res.success){currentUser=res.user;localStorage.setItem('isra_user',JSON.stringify(currentUser));enterApp();}
    else err.textContent=res.message||'Login fail ہو گیا۔';
  }).catch(()=>{spin.innerHTML='';btn.disabled=false;err.textContent='Connection error — انٹرنیٹ چیک کریں۔';});
}
function logout(){
  localStorage.removeItem('isra_user');currentUser=null;
  cache={maktabs:[],teachers:[],students:[],users:[]};
  document.getElementById('appShell').style.display='none';
  document.getElementById('loginScreen').style.display='flex';
  document.getElementById('loginUser').value='';
  document.getElementById('loginPass').value='';
  document.getElementById('loginError').textContent='';
}
function enterApp(){
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('appShell').style.display='block';
  document.getElementById('sbUserName').textContent=currentUser.Name||currentUser.Username;
  let re=document.getElementById('sbUserRole');
  if(re){re.textContent=currentUser.Role||'';re.className='sb-role role-'+(currentUser.Role||'').toLowerCase();}
  buildNav();navigate('dashboard');updateStatus();
}
window.addEventListener('DOMContentLoaded',()=>{
  let s=localStorage.getItem('isra_user');
  if(s){try{currentUser=JSON.parse(s);enterApp();}catch{localStorage.removeItem('isra_user');}}
  document.getElementById('loginPass').addEventListener('keypress',e=>{if(e.key==='Enter')doLogin();});
  document.getElementById('loginUser').addEventListener('keypress',e=>{if(e.key==='Enter')document.getElementById('loginPass').focus();});
  updateStatus();
});

/* ===== NAV ===== */
const ALL_NAV=[
  {id:'dashboard',en:'Dashboard', icon:'dashboard',roles:['Admin','Supervisor','Teacher']},
  {id:'maktabs',  en:'Maktabs',   icon:'maktab',   roles:['Admin','Supervisor','Teacher']},
  {id:'teachers', en:'Teachers',  icon:'teacher',  roles:['Admin','Supervisor']},
  {id:'students', en:'Students',  icon:'student',  roles:['Admin','Supervisor','Teacher']},
  {id:'mapview',  en:'Map View',  icon:'map',      roles:['Admin','Supervisor']},
  {id:'users',    en:'Users',     icon:'users',    roles:['Admin']},
  {id:'profile',  en:'Profile',   icon:'profile',  roles:['Admin','Supervisor','Teacher']},
];
function getNav(){let r=currentUser?.Role||'Teacher';return ALL_NAV.filter(n=>n.roles.includes(r));}

function buildNav(){
  let items=getNav();
  // Sidebar
  document.getElementById('navMenu').innerHTML=items.map(it=>
    `<button class="nav-item" id="nav-${it.id}" onclick="navigate('${it.id}')"><div class="ni">${IC[it.icon]}</div>${it.en}</button>`
  ).join('');
  // Bottom nav
  let prim=items.slice(0,4), sec=items.slice(4);
  let bn=document.getElementById('bnInner');
  bn.innerHTML=prim.map(it=>
    `<button class="bn-item" id="bn-${it.id}" onclick="navigate('${it.id}')"><div class="bn-ib">${IC[it.icon]}</div><span>${it.en}</span></button>`
  ).join('');
  if(sec.length){
    bn.innerHTML+=`<button class="bn-item" onclick="openDrawer()"><div class="bn-ib">${IC.more}</div><span>More</span></button>`;
    document.getElementById('drawerItems').innerHTML=sec.map(it=>
      `<button class="drawer-item" id="dr-${it.id}" onclick="navigate('${it.id}');closeDrawer()">${IC[it.icon]}${it.en}</button>`
    ).join('');
  }
}

function setActive(id){
  document.querySelectorAll('.nav-item,.bn-item,.drawer-item').forEach(el=>el.classList.remove('active'));
  ['nav-','bn-','dr-'].forEach(p=>{let el=document.getElementById(p+id);if(el)el.classList.add('active');});
}
function navigate(page){
  closeDrawer();closeSidebar();setActive(page);
  let titles={dashboard:'Dashboard',maktabs:'Maktabs',teachers:'Teachers',students:'Students',mapview:'Map View',users:'Users',profile:'Profile'};
  let t=document.getElementById('tbTitle');if(t)t.textContent=titles[page]||page;
  if(mapInstance){try{mapInstance.remove();}catch(e){} mapInstance=null;mapMarker=null;}
  switch(page){
    case 'dashboard':renderDashboard();break;
    case 'maktabs':  renderMaktabs();  break;
    case 'teachers': renderTeachers(); break;
    case 'students': renderStudents(); break;
    case 'mapview':  renderMapView();  break;
    case 'users':    renderUsers();    break;
    case 'profile':  renderProfile();  break;
    default:         renderDashboard();
  }
}

/* ===== UTILS ===== */
function esc(s){if(s==null)return'';return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function toDate(v){if(!v)return'-';let d=new Date(v);return isNaN(d.getTime())?v:d.toLocaleDateString('en-GB');}
function toDI(v){if(!v)return'';let d=new Date(v);return isNaN(d.getTime())?'':d.toISOString().split('T')[0];}
function mkName(id){let m=cache.maktabs.find(x=>String(x.ID)===String(id));return m?m.MaktabName:(id||'-');}
function isAdmin(){return currentUser?.Role==='Admin';}
function isTeacher(){return currentUser?.Role==='Teacher';}
function canEdit(){return !isTeacher();}
function LD(m){return`<div class="loading-state"><div class="spinner spinner-lg"></div><p>${m||'Loading...'}</p></div>`;}
function ED(m){return`<div class="empty-state">${IC.book}<p>${m}</p></div>`;}

function filterByRole(rows,type){
  let role=currentUser?.Role,assigned=(currentUser?.AssignedMaktab||'');
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

function sBadge(s){
  let map={Active:'bg-green',Inactive:'bg-gray',Left:'bg-orange',Dropout:'bg-red'};
  return`<span class="badge ${map[s]||'bg-gray'}"><span class="badge-dot"></span>${esc(s||'-')}</span>`;
}
function rBadge(r){
  let map={Admin:'bg-purple',Supervisor:'bg-blue',Teacher:'bg-teal'};
  return`<span class="badge ${map[r]||'bg-gray'}">${esc(r||'-')}</span>`;
}

/* ===== HADITH ===== */
const FALLBACK=[
  {text:'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',source:'— Sunan Ibn Majah'},
  {text:'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',source:'— Sahih Bukhari'},
  {text:'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',source:'— Sahih Muslim'},
  {text:'اقْرَؤُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ',source:'— Sahih Muslim'},
];
async function loadHadith(){
  try{let r=await api('getHadith',{date:new Date().toISOString().split('T')[0]});if(r.success&&r.hadith)return r.hadith;}catch{}
  return FALLBACK[new Date().getDate()%FALLBACK.length];
}

/* ===== DASHBOARD ===== */
async function renderDashboard(){
  let h=new Date().getHours();
  let greet=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  let pc=document.getElementById('pageContent');
  pc.innerHTML=`
    <div class="ph" style="animation:fadeUp .35s ease;">
      <div class="ph-greeting">${greet} —</div>
      <div class="ph-title">Peace be upon you, <span class="name">${esc(currentUser.Name||currentUser.Username)}</span></div>
      <div class="ph-sub">ISRA Quran Academy — Maktab Management Overview</div>
    </div>

    <div class="hadith-card">
      <div class="hadith-bg-icon">${IC.book}</div>
      <div class="hadith-content">
        <div class="hadith-tag">${IC.book} TODAY'S HADITH</div>
        <div id="hadithText" style="color:rgba(255,255,255,.5);font-size:13px;">Loading...</div>
      </div>
    </div>

    <div class="stats-grid" id="dashStats">${[1,2,3,4,5,6].map(()=>`<div class="stat-card"><div class="sc-icon" style="background:#f1f5f9;width:44px;height:44px;border-radius:50%;"></div><div style="height:28px;width:60px;background:#f1f5f9;border-radius:6px;margin:12px 0 6px;"></div><div style="height:14px;width:80px;background:#f1f5f9;border-radius:4px;"></div></div>`).join('')}</div>

    <div class="dash-bottom">
      <div class="card" style="margin-bottom:0;">
        <div class="card-head">
          <div class="card-head-l"><div class="card-hicon">${IC.chart}</div><div><div class="card-htitle">Schools by districts</div><div class="card-hsub">Maktabs by District</div></div></div>
          <select class="fsel" id="dashF" onchange="drawChart()" style="font-size:12px;padding:6px 26px 6px 9px;">
            <option value="maktabs">Schools</option>
            <option value="students">Students</option>
            <option value="teachers">Teachers</option>
          </select>
        </div>
        <div class="card-body"><div id="dashChart">${LD('')}</div></div>
      </div>
      <div class="card" style="margin-bottom:0;">
        <div class="card-head">
          <div class="card-head-l"><div class="card-hicon" style="background:#d1fae5;">${IC.check}</div><div class="card-htitle">Overview Summary</div></div>
        </div>
        <div id="ovList">${LD('')}</div>
      </div>
    </div>`;

  // Hadith
  loadHadith().then(h=>{
    let el=document.getElementById('hadithText');
    if(el) el.outerHTML=`<div class="hadith-text">${esc(h.text)}</div><div class="hadith-source">${esc(h.source||'')}</div>`;
  });

  try{
    let [mR,tR,sR]=await Promise.all([api('getMaktabs',{}),api('getTeachers',{}),api('getStudents',{})]);
    cache.maktabs=mR.success?mR.rows:[];
    cache.teachers=tR.success?tR.rows:[];
    cache.students=sR.success?sR.rows:[];
    let myM=filterByRole(cache.maktabs,'maktabs');
    let myT=filterByRole(cache.teachers,'teachers');
    let myS=filterByRole(cache.students,'students');
    let am=myM.filter(r=>String(r.Status||'').toLowerCase()==='active').length;
    let at=myT.filter(r=>String(r.Status||'').toLowerCase()==='active').length;
    let boys=myS.filter(r=>String(r.Gender||'').toLowerCase().startsWith('m')).length;
    let girls=myS.filter(r=>String(r.Gender||'').toLowerCase().startsWith('f')).length;

    let cards=[
      {n:myM.length, l:'Total Maktabs',   sl:'Total schools',   icon:IC.maktab,   cls:'sc-green'},
      {n:am,         l:'Active Maktabs',   sl:'Active schools',  icon:IC.check,    cls:'sc-purple'},
      {n:myS.length, l:'Total Students',   sl:'Total students',  icon:IC.student,  cls:'sc-blue'},
      {n:`${boys}/${girls}`,l:'Boys / Girls',sl:'Boys/Girls',    icon:IC.boys,     cls:'sc-orange'},
      {n:myT.length, l:'Total Teachers',   sl:'Total teachers',  icon:IC.teacher,  cls:'sc-cyan'},
      {n:at,         l:'Active Teachers',  sl:'Active teachers', icon:IC.check,    cls:'sc-pink'},
    ];

    document.getElementById('dashStats').innerHTML=cards.map((c,i)=>`
      <div class="stat-card ${c.cls}" style="animation:fadeUp .4s ease ${i*0.06}s both;">
        <div class="sc-icon">${c.icon}</div>
        <div class="sc-num" data-t="${typeof c.n==='number'?c.n:''}">${c.n}</div>
        <div class="sc-label">${c.l}</div>
        <div class="sc-sublabel">${c.sl}</div>
        <div class="sc-bg">${c.icon}</div>
      </div>`).join('');

    // Animate numbers
    document.querySelectorAll('.sc-num[data-t]').forEach(el=>{
      let tgt=parseInt(el.dataset.t);if(isNaN(tgt))return;
      let s=0,dur=900,t0=null;
      (function step(ts){if(!t0)t0=ts;let p=Math.min((ts-t0)/dur,1);el.textContent=Math.floor(p*tgt);if(p<1)requestAnimationFrame(step);})(performance.now());
      requestAnimationFrame(function step(ts){if(!t0)t0=ts;let p=Math.min((ts-t0)/dur,1);el.textContent=Math.floor(p*tgt);if(p<1)requestAnimationFrame(step);});
    });

    document.getElementById('ovList').innerHTML=[
      {l:'Total Maktabs', v:myM.length,       ic:IC.maktab,  bg:'background:#d1fae5;color:#065f46'},
      {l:'Total Students',v:myS.length,        ic:IC.student, bg:'background:#ede9fe;color:#5b21b6'},
      {l:'Total Teachers',v:myT.length,        ic:IC.teacher, bg:'background:#dbeafe;color:#1e40af'},
      {l:'Active Maktabs',v:am,                ic:IC.check,   bg:'background:#fef3c7;color:#92400e'},
      {l:'Active Teachers',v:at,               ic:IC.check,   bg:'background:#fce7f3;color:#9d174d'},
      {l:'Boys / Girls',  v:`${boys}/${girls}`,ic:IC.boys,    bg:'background:#ffedd5;color:#9a3412'},
    ].map(it=>`
      <div class="ov-item">
        <div class="ov-item-l"><div class="ov-icon" style="${it.bg}">${it.ic}</div>${it.l}</div>
        <div class="ov-val">${it.v}</div>
      </div>`).join('');

    window._dash={myM,myT,myS};drawChart();
  }catch(e){
    document.getElementById('dashStats').innerHTML=`<div style="grid-column:1/-1;">${ED('Connection error — انٹرنیٹ چیک کریں۔')}</div>`;
  }
}

function drawChart(){
  let el=document.getElementById('dashChart');if(!el)return;
  let d=window._dash;if(!d){el.innerHTML=ED('ڈیٹا نہیں ہے۔');return;}
  let f=(document.getElementById('dashF')||{}).value||'maktabs';
  let rows=f==='maktabs'?d.myM:f==='teachers'?d.myT:d.myS;
  let counts={};rows.forEach(r=>{let k=r.District||r.Tehsil||'نامعلوم';counts[k]=(counts[k]||0)+1;});
  let keys=Object.keys(counts).sort((a,b)=>counts[b]-counts[a]);
  if(!keys.length){el.innerHTML=`<div class="chart-empty">${IC.map}<p>There is no school data yet.<br>The statement will be displayed when data is available.</p></div>`;return;}
  let max=Math.max(...keys.map(k=>counts[k]));
  let clr={maktabs:'#0d7a8a',students:'#8b5cf6',teachers:'#06b6d4'};
  el.innerHTML=keys.slice(0,8).map(k=>`
    <div class="bar-row">
      <div class="bar-lbl">${esc(k)}</div>
      <div class="bar-track"><div class="bar-fill" style="background:${clr[f]};" data-w="${max?(counts[k]/max*100):0}"></div></div>
      <div class="bar-val">${counts[k]}</div>
    </div>`).join('');
  setTimeout(()=>{document.querySelectorAll('.bar-fill').forEach(b=>{b.style.width=b.dataset.w+'%';});},30);
}

/* ===== MAKTABS ===== */
function renderMaktabs(){
  document.getElementById('pageContent').innerHTML=`
    <div class="ph" style="animation:fadeUp .3s ease;"><div class="ph-title" style="font-size:20px;">مکاتب کا ریکارڈ</div><div class="ph-sub">Maktab Records</div></div>
    <div class="card">
      <div class="toolbar">
        <div class="search-box">${IC.search}<input id="mkQ" placeholder="نام، ضلع، تحصیل..." oninput="applyMkF()"></div>
        <select class="fsel" id="mkDF" onchange="applyMkF()"><option value="">تمام اضلاع</option></select>
        <select class="fsel" id="mkSF" onchange="applyMkF()"><option value="">تمام حیثیت</option><option value="active">فعال</option><option value="inactive">غیرفعال</option></select>
        <div class="ml-auto">${canEdit()?`<button class="btn btn-gold btn-sm" onclick="openMkForm()">${IC.add} نیا مکتب</button>`:''}</div>
      </div>
      <div id="mkTW">${LD('مکاتب لوڈ ہو رہے ہیں...')}</div>
    </div>
    <div id="mkFW"></div>`;
  loadMaktabs();
}
async function loadMaktabs(){
  try{
    let res=await api('getMaktabs',{});
    if(!res.success){document.getElementById('mkTW').innerHTML=ED('ڈیٹا لوڈ نہیں ہو سکا۔');return;}
    cache.maktabs=res.rows;
    let rows=filterByRole(cache.maktabs,'maktabs');
    let df=document.getElementById('mkDF');
    if(df){let ds=[...new Set(rows.map(r=>r.District).filter(Boolean))].sort();df.innerHTML='<option value="">تمام اضلاع</option>'+ds.map(d=>`<option value="${esc(d.toLowerCase())}">${esc(d)}</option>`).join('');}
    renderMkT(rows);
  }catch{document.getElementById('mkTW').innerHTML=ED('Connection error.');}
}
function applyMkF(){
  let q=(document.getElementById('mkQ')?.value||'').toLowerCase();
  let df=document.getElementById('mkDF')?.value||'';
  let sf=document.getElementById('mkSF')?.value||'';
  document.querySelectorAll('#mkTable tbody tr').forEach(tr=>{
    tr.style.display=(!q||(tr.dataset.s||'').includes(q))&&(!df||(tr.dataset.d||'')===df)&&(!sf||(tr.dataset.st||'')===sf)?'':'none';
  });
}
function renderMkT(rows){
  let w=document.getElementById('mkTW');
  if(!rows.length){w.innerHTML=ED('کوئی مکتب موجود نہیں۔');return;}
  let ce=canEdit();
  w.innerHTML=`<div class="tw"><table id="mkTable">
    <thead><tr><th>مکتب</th><th>کورسز</th><th>تحصیل / ضلع</th><th>طلباء</th><th>اساتذہ</th><th>نگران</th><th>حیثیت</th><th></th></tr></thead>
    <tbody>${rows.map(r=>`
      <tr data-s="${esc((r.MaktabName+' '+r.District+' '+r.Tehsil).toLowerCase())}" data-d="${esc((r.District||'').toLowerCase())}" data-st="${esc((r.Status||'').toLowerCase())}">
        <td><div class="td-main">${esc(r.MaktabName)}</div><div class="td-sub">${esc(r.FullAddress||'')}</div></td>
        <td>${esc(r.RunningCourses||'-')}</td>
        <td><div class="td-main">${esc(r.Tehsil||'-')}</div><div class="td-sub">${esc(r.District||'-')}</div></td>
        <td><b>${r.TotalStudents||0}</b><div class="td-sub">${r.Boys||0}♂ ${r.Girls||0}♀</div></td>
        <td>${r.TotalTeachers||0}</td>
        <td><div class="td-main">${esc(r.HeadName||'-')}</div><div class="td-sub">${esc(r.HeadContact||'')}</div></td>
        <td>${sBadge(r.Status)}</td>
        <td><div class="td-actions">
          ${r.Latitude&&r.Longitude?`<a href="https://www.google.com/maps?q=${r.Latitude},${r.Longitude}" target="_blank" class="btn btn-outline btn-icon btn-sm">${IC.location}</a>`:''}
          ${ce?`<button class="btn btn-outline btn-icon btn-sm" onclick="openMkForm(${r.ID})">${IC.edit}</button><button class="btn btn-danger btn-icon btn-sm" onclick="delMk(${r.ID})">${IC.del}</button>`:''}
        </div></td>
      </tr>`).join('')}
    </tbody></table></div>`;
}
function openMkForm(id){
  let r=id?(cache.maktabs.find(m=>String(m.ID)===String(id))||{}):{}; let isE=!!(id&&Object.keys(r).length);
  document.getElementById('mkFW').innerHTML=`
    <div class="card" style="animation:fadeUp .3s ease;">
      <div class="card-head"><div class="card-head-l"><div class="card-hicon">${IC.maktab}</div><div class="card-htitle">${isE?'مکتب میں ترمیم':'نیا مکتب شامل کریں'}</div></div></div>
      <div class="card-body"><div class="form-grid">
        <div class="fsec">بنیادی معلومات</div>
        <div class="ff"><label>مکتب کا نام *</label><input class="fi" id="mk_n" value="${esc(r.MaktabName||'')}"></div>
        <div class="ff"><label>جاری کورسز</label><input class="fi" id="mk_c" value="${esc(r.RunningCourses||'')}" placeholder="Qaida, Nazra, Hifz"></div>
        <div class="ff full"><label>مکمل پتہ</label><input class="fi" id="mk_a" value="${esc(r.FullAddress||'')}"></div>
        <div class="ff"><label>UC</label><input class="fi" id="mk_uc" value="${esc(r.UC||'')}"></div>
        <div class="ff"><label>تحصیل</label><input class="fi" id="mk_teh" value="${esc(r.Tehsil||'')}"></div>
        <div class="ff"><label>ضلع</label><input class="fi" id="mk_dist" value="${esc(r.District||'')}"></div>
        <div class="ff"><label>قائمی تاریخ</label><input class="fi" type="date" id="mk_sd" value="${toDI(r.StartDate)}"></div>
        <div class="ff"><label>گنجائش</label><input class="fi" type="number" id="mk_cap" value="${r.Capacity||''}"></div>
        <div class="fsec">تعداد</div>
        <div class="ff"><label>کل طلباء</label><input class="fi" type="number" id="mk_ts" value="${r.TotalStudents||''}"></div>
        <div class="ff"><label>لڑکے</label><input class="fi" type="number" id="mk_b" value="${r.Boys||''}"></div>
        <div class="ff"><label>لڑکیاں</label><input class="fi" type="number" id="mk_g" value="${r.Girls||''}"></div>
        <div class="ff"><label>کل اساتذہ</label><input class="fi" type="number" id="mk_tt" value="${r.TotalTeachers||''}"></div>
        <div class="fsec">نگران</div>
        <div class="ff"><label>نگران کا نام</label><input class="fi" id="mk_hn" value="${esc(r.HeadName||'')}"></div>
        <div class="ff"><label>رابطہ</label><input class="fi" id="mk_hc" value="${esc(r.HeadContact||'')}"></div>
        <div class="ff"><label>واٹس ایپ</label><input class="fi" id="mk_hw" value="${esc(r.HeadWhatsApp||'')}"></div>
        <div class="ff"><label>حیثیت</label><select class="fsel2" id="mk_st"><option value="Active" ${r.Status==='Active'?'selected':''}>Active</option><option value="Inactive" ${r.Status==='Inactive'?'selected':''}>Inactive</option></select></div>
        <div class="ff full"><label>نوٹ</label><input class="fi" id="mk_rem" value="${esc(r.Remarks||'')}"></div>
        <div class="fsec">مقام (Location)</div>
        <div class="ff"><label>Latitude</label><input class="fi" id="mk_lat" value="${r.Latitude||''}" placeholder="25.3960" oninput="updCoord()"></div>
        <div class="ff"><label>Longitude</label><input class="fi" id="mk_lng" value="${r.Longitude||''}" placeholder="68.3578" oninput="updCoord()"></div>
      </div>
      <div class="map-ctrls">
        <button class="btn btn-outline btn-sm" onclick="useGPS()">${IC.location} موجودہ مقام</button>
        <button class="btn btn-outline btn-sm" onclick="searchLoc()">${IC.search} نام سے تلاش</button>
        <div class="coord-chip" id="cchip">${IC.location}${r.Latitude&&r.Longitude?r.Latitude+', '+r.Longitude:'نقشے پر کلک کریں'}</div>
      </div>
      <div id="mapPicker" style="margin-top:10px;"></div>
      <div class="form-actions">
        <button class="btn btn-gold" onclick="saveMk(${isE?r.ID:'null'})">محفوظ کریں <span id="mkSp"></span></button>
        <button class="btn btn-outline" onclick="document.getElementById('mkFW').innerHTML=''">منسوخ</button>
      </div></div>
    </div>`;
  document.getElementById('mkFW').scrollIntoView({behavior:'smooth'});
  setTimeout(()=>initMap(r.Latitude,r.Longitude),160);
}
function updCoord(){
  let lat=document.getElementById('mk_lat')?.value,lng=document.getElementById('mk_lng')?.value;
  let c=document.getElementById('cchip');if(c&&lat&&lng)c.innerHTML=IC.location+lat+', '+lng;
}
function useGPS(){
  if(!navigator.geolocation){toast('Geolocation سپورٹ نہیں۔','error');return;}
  toast('مقام تلاش ہو رہا ہے...','');
  navigator.geolocation.getCurrentPosition(p=>{
    let lat=p.coords.latitude.toFixed(6),lng=p.coords.longitude.toFixed(6);
    document.getElementById('mk_lat').value=lat;document.getElementById('mk_lng').value=lng;updCoord();
    if(mapInstance){if(mapMarker)mapInstance.removeLayer(mapMarker);mapMarker=L.marker([+lat,+lng]).addTo(mapInstance);mapInstance.setView([+lat,+lng],14);}
    toast('✓ مقام سیٹ','success');
  },()=>toast('مقام حاصل نہیں ہو سکا۔','error'));
}
function searchLoc(){
  let n=prompt('جگہ کا نام (انگریزی):');if(!n)return;toast('تلاش ہو رہی ہے...','');
  fetch('https://nominatim.openstreetmap.org/search?q='+encodeURIComponent(n+', Sindh, Pakistan')+'&format=json&limit=1')
    .then(r=>r.json()).then(data=>{
      if(!data.length){toast('مقام نہیں ملا۔','error');return;}
      let lat=parseFloat(data[0].lat).toFixed(6),lng=parseFloat(data[0].lon).toFixed(6);
      document.getElementById('mk_lat').value=lat;document.getElementById('mk_lng').value=lng;updCoord();
      if(mapInstance){if(mapMarker)mapInstance.removeLayer(mapMarker);mapMarker=L.marker([+lat,+lng]).addTo(mapInstance);mapInstance.setView([+lat,+lng],14);}
      toast('✓ '+(data[0].display_name||'').split(',')[0],'success');
    }).catch(()=>toast('تلاش میں خرابی۔','error'));
}
function initMap(lat,lng){
  if(mapInstance){try{mapInstance.remove();}catch(e){}} mapInstance=null;
  let el=document.getElementById('mapPicker');if(!el)return;
  let c=(lat&&lng)?[+lat,+lng]:CONFIG.MAP_DEFAULT_CENTER;
  mapInstance=L.map('mapPicker').setView(c,(lat&&lng)?13:CONFIG.MAP_DEFAULT_ZOOM);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(mapInstance);
  if(lat&&lng) mapMarker=L.marker(c).addTo(mapInstance);
  mapInstance.on('click',e=>{
    let la=e.latlng.lat.toFixed(6),lo=e.latlng.lng.toFixed(6);
    if(mapMarker)mapInstance.removeLayer(mapMarker);mapMarker=L.marker([+la,+lo]).addTo(mapInstance);
    document.getElementById('mk_lat').value=la;document.getElementById('mk_lng').value=lo;updCoord();
  });
  setTimeout(()=>mapInstance.invalidateSize(),200);
}
async function saveMk(id){
  let sp=document.getElementById('mkSp');
  let name=(document.getElementById('mk_n').value||'').trim();if(!name){toast('مکتب کا نام ضروری ہے۔','error');return;}
  let p={MaktabName:name,RunningCourses:document.getElementById('mk_c').value,FullAddress:document.getElementById('mk_a').value,UC:document.getElementById('mk_uc').value,Tehsil:document.getElementById('mk_teh').value,District:document.getElementById('mk_dist').value,StartDate:document.getElementById('mk_sd').value,Capacity:document.getElementById('mk_cap').value,TotalStudents:document.getElementById('mk_ts').value,Boys:document.getElementById('mk_b').value,Girls:document.getElementById('mk_g').value,TotalTeachers:document.getElementById('mk_tt').value,HeadName:document.getElementById('mk_hn').value,HeadContact:document.getElementById('mk_hc').value,HeadWhatsApp:document.getElementById('mk_hw').value,Status:document.getElementById('mk_st').value,Remarks:document.getElementById('mk_rem').value,Latitude:document.getElementById('mk_lat').value,Longitude:document.getElementById('mk_lng').value,CreatedBy:currentUser.Username};
  if(id&&id!=='null')p.ID=id;
  sp.innerHTML='<span class="spinner" style="width:12px;height:12px;"></span>';
  let res=await apiS(id&&id!=='null'?'updateMaktab':'addMaktab',p);sp.innerHTML='';
  if(res.success){toast(res.offline?'آف لائن: بعد sync':'✓ محفوظ',res.offline?'warning':'success');document.getElementById('mkFW').innerHTML='';loadMaktabs();}
  else toast(res.message||'خرابی۔','error');
}
async function delMk(id){
  if(!confirm('کیا آپ واقعی یہ مکتب حذف کرنا چاہتے ہیں؟'))return;
  let r=await api('deleteMaktab',{ID:id});
  if(r.success){toast('✓ حذف','success');loadMaktabs();}else toast(r.message,'error');
}

/* ===== TEACHERS ===== */
function renderTeachers(){
  document.getElementById('pageContent').innerHTML=`
    <div class="ph" style="animation:fadeUp .3s ease;"><div class="ph-title" style="font-size:20px;">اساتذہ کا ریکارڈ</div><div class="ph-sub">Teacher Records</div></div>
    <div class="card">
      <div class="toolbar">
        <div class="search-box">${IC.search}<input id="tcQ" placeholder="نام، CNIC، ضلع..." oninput="applyTcF()"></div>
        <select class="fsel" id="tcMF" onchange="applyTcF()"><option value="">تمام مکاتب</option></select>
        <select class="fsel" id="tcSF" onchange="applyTcF()"><option value="">تمام حیثیت</option><option value="active">Active</option><option value="left">Left</option></select>
        <div class="ml-auto">${canEdit()?`<button class="btn btn-gold btn-sm" onclick="openTcForm()">${IC.add} نیا استاد</button>`:''}</div>
      </div>
      <div id="tcTW">${LD('اساتذہ لوڈ ہو رہے ہیں...')}</div>
    </div><div id="tcFW"></div>`;
  loadTeachers();
}
async function loadTeachers(){
  try{
    let [tR,mR,uR]=await Promise.all([api('getTeachers',{}),api('getMaktabs',{}),api('getUsers',{})]);
    cache.teachers=tR.success?tR.rows:[];cache.maktabs=mR.success?mR.rows:cache.maktabs;cache.users=uR.success?uR.rows:cache.users;
    let rows=filterByRole(cache.teachers,'teachers');
    let mf=document.getElementById('tcMF');if(mf){let ids=[...new Set(rows.map(r=>String(r.MaktabID)).filter(Boolean))];mf.innerHTML='<option value="">تمام مکاتب</option>'+ids.map(id=>`<option value="${id}">${esc(mkName(id))}</option>`).join('');}
    renderTcT(rows);
  }catch{document.getElementById('tcTW').innerHTML=ED('Connection error.');}
}
function applyTcF(){
  let q=(document.getElementById('tcQ')?.value||'').toLowerCase(),mf=document.getElementById('tcMF')?.value||'',sf=document.getElementById('tcSF')?.value||'';
  document.querySelectorAll('#tcTable tbody tr').forEach(tr=>{tr.style.display=(!q||(tr.dataset.s||'').includes(q))&&(!mf||(tr.dataset.m||'')===mf)&&(!sf||(tr.dataset.st||'')===sf)?'':'none';});
}
function renderTcT(rows){
  let w=document.getElementById('tcTW');if(!rows.length){w.innerHTML=ED('کوئی استاد موجود نہیں۔');return;}
  let ce=canEdit();
  w.innerHTML=`<div class="tw"><table id="tcTable">
    <thead><tr><th>نام</th><th>عہدہ</th><th>مکتب</th><th>سپروائزر</th><th>CNIC</th><th>فون</th><th>تجربہ</th><th>حیثیت</th><th></th></tr></thead>
    <tbody>${rows.map(r=>`
      <tr data-s="${esc((r.Name+' '+r.CNIC+' '+(r.District||'')).toLowerCase())}" data-m="${esc(String(r.MaktabID||''))}" data-st="${esc((r.Status||'').toLowerCase())}">
        <td><div class="td-main">${esc(r.Name)}</div><div class="td-sub">${esc(r.Gender||'')} · ${esc(r.Qualification||'')}</div></td>
        <td>${esc(r.Designation||'-')}</td>
        <td>${esc(mkName(r.MaktabID))}</td>
        <td>${esc(r.SupervisorName||'-')}</td>
        <td style="font-family:monospace;font-size:11px;">${esc(r.CNIC||'-')}</td>
        <td>${esc(r.Phone||'-')}</td>
        <td>${r.Experience||0} سال</td>
        <td>${sBadge(r.Status)}</td>
        <td><div class="td-actions">${ce?`<button class="btn btn-outline btn-icon btn-sm" onclick="openTcForm(${r.ID})">${IC.edit}</button><button class="btn btn-danger btn-icon btn-sm" onclick="delTc(${r.ID})">${IC.del}</button>`:'-'}</div></td>
      </tr>`).join('')}
    </tbody></table></div>`;
}
function openTcForm(id){
  let r=id?(cache.teachers.find(t=>String(t.ID)===String(id))||{}):{}; let isE=!!(id&&Object.keys(r).length);
  let mO=cache.maktabs.map(m=>`<option value="${m.ID}" ${String(r.MaktabID)===String(m.ID)?'selected':''}>${esc(m.MaktabName)}</option>`).join('');
  let sO=(cache.users||[]).filter(u=>u.Role==='Supervisor').map(u=>`<option value="${esc(u.Username)}" ${r.SupervisorID===u.Username?'selected':''}>${esc(u.Name||u.Username)}</option>`).join('');
  document.getElementById('tcFW').innerHTML=`
    <div class="card" style="animation:fadeUp .3s ease;">
      <div class="card-head"><div class="card-head-l"><div class="card-hicon">${IC.teacher}</div><div class="card-htitle">${isE?'استاد میں ترمیم':'نیا استاد شامل کریں'}</div></div></div>
      <div class="card-body"><div class="form-grid">
        <div class="fsec">ذاتی معلومات</div>
        <div class="ff"><label>نام *</label><input class="fi" id="tc_n" value="${esc(r.Name||'')}"></div>
        <div class="ff"><label>عہدہ</label><input class="fi" id="tc_d" value="${esc(r.Designation||'')}" placeholder="Qari, Hifz Teacher..."></div>
        <div class="ff"><label>والد کا نام</label><input class="fi" id="tc_f" value="${esc(r.FatherName||'')}"></div>
        <div class="ff"><label>CNIC</label><input class="fi" id="tc_cnic" value="${esc(r.CNIC||'')}" placeholder="00000-0000000-0"></div>
        <div class="ff"><label>تاریخ پیدائش</label><input class="fi" type="date" id="tc_dob" value="${toDI(r.DOB)}"></div>
        <div class="ff"><label>جنس</label><select class="fsel2" id="tc_g"><option value="Male" ${r.Gender==='Male'?'selected':''}>Male</option><option value="Female" ${r.Gender==='Female'?'selected':''}>Female</option></select></div>
        <div class="ff"><label>تحصیل</label><input class="fi" id="tc_teh" value="${esc(r.Tehsil||'')}"></div>
        <div class="ff"><label>ضلع</label><input class="fi" id="tc_dist" value="${esc(r.District||'')}"></div>
        <div class="ff full"><label>پتہ</label><input class="fi" id="tc_addr" value="${esc(r.Address||'')}"></div>
        <div class="fsec">تعلیمی اور پیشہ ورانہ</div>
        <div class="ff"><label>قابلیت</label><input class="fi" id="tc_q" value="${esc(r.Qualification||'')}"></div>
        <div class="ff"><label>سرٹیفیکیشن</label><input class="fi" id="tc_cert" value="${esc(r.Certification||'')}"></div>
        <div class="ff"><label>تجربہ (سال)</label><input class="fi" type="number" id="tc_exp" value="${r.Experience||''}"></div>
        <div class="ff"><label>تقرری تاریخ</label><input class="fi" type="date" id="tc_appt" value="${toDI(r.DateOfAppointment)}"></div>
        <div class="ff"><label>فون / واٹس ایپ</label><input class="fi" id="tc_ph" value="${esc(r.Phone||'')}"></div>
        <div class="ff"><label>تنخواہ (روپے)</label><input class="fi" type="number" id="tc_sal" value="${r.Salary||''}"></div>
        <div class="ff"><label>ادائیگی</label><select class="fsel2" id="tc_stype"><option value="Cash" ${r.SalaryType==='Cash'?'selected':''}>Cash</option><option value="Bank Account" ${r.SalaryType==='Bank Account'?'selected':''}>Bank Account</option></select></div>
        <div class="fsec">مکتب اور سپروائزر</div>
        <div class="ff"><label>متعلقہ مکتب</label><select class="fsel2" id="tc_mak"><option value="">-- منتخب کریں --</option>${mO}</select></div>
        <div class="ff"><label>سپروائزر (جس کو رپورٹ کریں)</label><select class="fsel2" id="tc_sup"><option value="">-- منتخب کریں --</option>${sO}</select></div>
        <div class="ff"><label>حیثیت</label><select class="fsel2" id="tc_st"><option value="Active" ${r.Status==='Active'?'selected':''}>Active</option><option value="Left" ${r.Status==='Left'?'selected':''}>Left</option></select></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-gold" onclick="saveTc(${isE?r.ID:'null'})">محفوظ کریں <span id="tcSp"></span></button>
        <button class="btn btn-outline" onclick="document.getElementById('tcFW').innerHTML=''">منسوخ</button>
      </div></div>
    </div>`;
  document.getElementById('tcFW').scrollIntoView({behavior:'smooth'});
}
async function saveTc(id){
  let sp=document.getElementById('tcSp');
  let name=(document.getElementById('tc_n').value||'').trim();if(!name){toast('نام ضروری ہے۔','error');return;}
  let su=document.getElementById('tc_sup').value, suU=(cache.users||[]).find(u=>u.Username===su);
  let p={Name:name,Designation:document.getElementById('tc_d').value,FatherName:document.getElementById('tc_f').value,CNIC:document.getElementById('tc_cnic').value,DOB:document.getElementById('tc_dob').value,Gender:document.getElementById('tc_g').value,Tehsil:document.getElementById('tc_teh').value,District:document.getElementById('tc_dist').value,Address:document.getElementById('tc_addr').value,Qualification:document.getElementById('tc_q').value,Certification:document.getElementById('tc_cert').value,Experience:document.getElementById('tc_exp').value,DateOfAppointment:document.getElementById('tc_appt').value,Phone:document.getElementById('tc_ph').value,Salary:document.getElementById('tc_sal').value,SalaryType:document.getElementById('tc_stype').value,MaktabID:document.getElementById('tc_mak').value,SupervisorID:su,SupervisorName:suU?(suU.Name||suU.Username):su,Status:document.getElementById('tc_st').value,CreatedBy:currentUser.Username};
  if(id&&id!=='null')p.ID=id;
  sp.innerHTML='<span class="spinner" style="width:12px;height:12px;"></span>';
  let res=await apiS(id&&id!=='null'?'updateTeacher':'addTeacher',p);sp.innerHTML='';
  if(res.success){toast(res.offline?'آف لائن: بعد sync':'✓ محفوظ',res.offline?'warning':'success');document.getElementById('tcFW').innerHTML='';loadTeachers();}
  else toast(res.message||'خرابی۔','error');
}
async function delTc(id){
  if(!confirm('کیا آپ واقعی اس استاد کو حذف کرنا چاہتے ہیں؟'))return;
  let r=await api('deleteTeacher',{ID:id});if(r.success){toast('✓ حذف','success');loadTeachers();}else toast(r.message,'error');
}

/* ===== STUDENTS ===== */
function renderStudents(){
  document.getElementById('pageContent').innerHTML=`
    <div class="ph" style="animation:fadeUp .3s ease;"><div class="ph-title" style="font-size:20px;">طلباء کا ریکارڈ</div><div class="ph-sub">Student Records</div></div>
    <div class="card">
      <div class="toolbar">
        <div class="search-box">${IC.search}<input id="stQ" placeholder="نام، والد، سطح..." oninput="applyStF()"></div>
        <select class="fsel" id="stMF" onchange="applyStF()"><option value="">تمام مکاتب</option></select>
        <select class="fsel" id="stLF" onchange="applyStF()"><option value="">تمام سطح</option><option value="qaida">Qaida</option><option value="nazra">Nazra</option><option value="hifz">Hifz</option><option value="tafseer">Tafseer</option></select>
        <select class="fsel" id="stSF" onchange="applyStF()"><option value="">تمام حیثیت</option><option value="active">فعال</option><option value="dropout">Dropout</option></select>
        <div class="ml-auto"><button class="btn btn-gold btn-sm" onclick="openStForm()">${IC.add} نیا طالب علم</button></div>
      </div>
      <div id="stTW">${LD('طلباء لوڈ ہو رہے ہیں...')}</div>
    </div><div id="stFW"></div>`;
  loadStudents();
}
async function loadStudents(){
  try{
    let [sR,mR]=await Promise.all([api('getStudents',{}),api('getMaktabs',{})]);
    cache.students=sR.success?sR.rows:[];cache.maktabs=mR.success?mR.rows:cache.maktabs;
    let rows=filterByRole(cache.students,'students');
    let mf=document.getElementById('stMF');if(mf){let ids=[...new Set(rows.map(r=>String(r.MaktabID)).filter(Boolean))];mf.innerHTML='<option value="">تمام مکاتب</option>'+ids.map(id=>`<option value="${id}">${esc(mkName(id))}</option>`).join('');}
    renderStT(rows);
  }catch{document.getElementById('stTW').innerHTML=ED('Connection error.');}
}
function applyStF(){
  let q=(document.getElementById('stQ')?.value||'').toLowerCase(),mf=document.getElementById('stMF')?.value||'',lf=document.getElementById('stLF')?.value||'',sf=document.getElementById('stSF')?.value||'';
  document.querySelectorAll('#stTable tbody tr').forEach(tr=>{tr.style.display=(!q||(tr.dataset.s||'').includes(q))&&(!mf||(tr.dataset.m||'')===mf)&&(!lf||(tr.dataset.l||'')===lf)&&(!sf||(tr.dataset.st||'')===sf)?'':'none';});
}
function renderStT(rows){
  let w=document.getElementById('stTW');if(!rows.length){w.innerHTML=ED('کوئی طالب علم موجود نہیں۔');return;}
  w.innerHTML=`<div class="tw"><table id="stTable">
    <thead><tr><th>نام</th><th>والد</th><th>مکتب</th><th>استاد</th><th>سطح</th><th>حاضری</th><th>جنس</th><th>حیثیت</th><th></th></tr></thead>
    <tbody>${rows.map(r=>`
      <tr data-s="${esc((r.Name+' '+(r.FatherName||'')+(r.CurrentLevel||'')).toLowerCase())}" data-m="${esc(String(r.MaktabID||''))}" data-l="${esc((r.CurrentLevel||'').toLowerCase())}" data-st="${esc((r.Status||'').toLowerCase())}">
        <td><div class="td-main">${esc(r.Name)}</div></td>
        <td><div class="td-main">${esc(r.FatherName||'-')}</div><div class="td-sub">${esc(r.FatherPhone||'')}</div></td>
        <td>${esc(mkName(r.MaktabID))}</td>
        <td>${esc(r.TeacherName||'-')}</td>
        <td><span class="badge bg-blue">${esc(r.CurrentLevel||'-')}</span></td>
        <td>${r.Attendance||0}%</td>
        <td>${esc(r.Gender||'-')}</td>
        <td>${sBadge(r.Status)}</td>
        <td><div class="td-actions">
          <button class="btn btn-outline btn-icon btn-sm" onclick="openStForm(${r.ID})">${IC.edit}</button>
          ${canEdit()?`<button class="btn btn-danger btn-icon btn-sm" onclick="delSt(${r.ID})">${IC.del}</button>`:''}
        </div></td>
      </tr>`).join('')}
    </tbody></table></div>`;
}
function openStForm(id){
  let r=id?(cache.students.find(s=>String(s.ID)===String(id))||{}):{}; let isE=!!(id&&Object.keys(r).length);
  let mO=cache.maktabs.map(m=>`<option value="${m.ID}" ${String(r.MaktabID)===String(m.ID)?'selected':''}>${esc(m.MaktabName)}</option>`).join('');
  document.getElementById('stFW').innerHTML=`
    <div class="card" style="animation:fadeUp .3s ease;">
      <div class="card-head"><div class="card-head-l"><div class="card-hicon">${IC.student}</div><div class="card-htitle">${isE?'طالب علم میں ترمیم':'نیا طالب علم شامل کریں'}</div></div></div>
      <div class="card-body"><div class="form-grid">
        <div class="fsec">ذاتی معلومات</div>
        <div class="ff"><label>نام *</label><input class="fi" id="st_n" value="${esc(r.Name||'')}"></div>
        <div class="ff"><label>والد کا نام</label><input class="fi" id="st_f" value="${esc(r.FatherName||'')}"></div>
        <div class="ff"><label>والد CNIC</label><input class="fi" id="st_fc" value="${esc(r.FatherCNIC||'')}"></div>
        <div class="ff"><label>والد فون</label><input class="fi" id="st_fp" value="${esc(r.FatherPhone||'')}"></div>
        <div class="ff"><label>تاریخ پیدائش</label><input class="fi" type="date" id="st_dob" value="${toDI(r.DOB)}"></div>
        <div class="ff"><label>جنس</label><select class="fsel2" id="st_g"><option value="Male" ${r.Gender==='Male'?'selected':''}>Male</option><option value="Female" ${r.Gender==='Female'?'selected':''}>Female</option></select></div>
        <div class="ff full"><label>پتہ</label><input class="fi" id="st_a" value="${esc(r.Address||'')}"></div>
        <div class="fsec">تعلیمی معلومات</div>
        <div class="ff"><label>داخلے کی تاریخ</label><input class="fi" type="date" id="st_adm" value="${toDI(r.DateOfAdmission)}"></div>
        <div class="ff"><label>کورس کی تفصیل</label><input class="fi" id="st_c" value="${esc(r.CourseDetails||'')}"></div>
        <div class="ff"><label>موجودہ سطح</label><select class="fsel2" id="st_l"><option value="Qaida" ${r.CurrentLevel==='Qaida'?'selected':''}>Qaida</option><option value="Nazra" ${r.CurrentLevel==='Nazra'?'selected':''}>Nazra</option><option value="Hifz" ${r.CurrentLevel==='Hifz'?'selected':''}>Hifz</option><option value="Tafseer" ${r.CurrentLevel==='Tafseer'?'selected':''}>Tafseer</option><option value="Other" ${r.CurrentLevel==='Other'?'selected':''}>Other</option></select></div>
        <div class="ff"><label>حاضری %</label><input class="fi" type="number" min="0" max="100" id="st_att" value="${r.Attendance||''}"></div>
        <div class="ff"><label>سکول جاتا ہے؟</label><select class="fsel2" id="st_sc" onchange="document.getElementById('st_scd').style.display=this.value==='Yes'?'block':'none'"><option value="No" ${r.SchoolGoing!=='Yes'?'selected':''}>No</option><option value="Yes" ${r.SchoolGoing==='Yes'?'selected':''}>Yes</option></select></div>
        <div class="ff full" id="st_scd" style="display:${r.SchoolGoing==='Yes'?'block':'none'}"><label>سکول کی تفصیل</label><input class="fi" id="st_sdet" value="${esc(r.SchoolDetails||'')}"></div>
        <div class="fsec">مکتب اور استاد</div>
        <div class="ff"><label>مکتب</label><select class="fsel2" id="st_mak"><option value="">-- منتخب کریں --</option>${mO}</select></div>
        <div class="ff"><label>استاد کا نام</label><input class="fi" id="st_tchr" value="${esc(r.TeacherName||'')}"></div>
        <div class="ff"><label>حیثیت</label><select class="fsel2" id="st_st"><option value="Active" ${r.Status==='Active'?'selected':''}>Active</option><option value="Dropout" ${r.Status==='Dropout'?'selected':''}>Dropout</option></select></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-gold" onclick="saveSt(${isE?r.ID:'null'})">محفوظ کریں <span id="stSp"></span></button>
        <button class="btn btn-outline" onclick="document.getElementById('stFW').innerHTML=''">منسوخ</button>
      </div></div>
    </div>`;
  document.getElementById('stFW').scrollIntoView({behavior:'smooth'});
}
async function saveSt(id){
  let sp=document.getElementById('stSp');
  let name=(document.getElementById('st_n').value||'').trim();if(!name){toast('نام ضروری ہے۔','error');return;}
  let p={Name:name,FatherName:document.getElementById('st_f').value,FatherCNIC:document.getElementById('st_fc').value,FatherPhone:document.getElementById('st_fp').value,DOB:document.getElementById('st_dob').value,Gender:document.getElementById('st_g').value,Address:document.getElementById('st_a').value,DateOfAdmission:document.getElementById('st_adm').value,CourseDetails:document.getElementById('st_c').value,CurrentLevel:document.getElementById('st_l').value,Attendance:document.getElementById('st_att').value,SchoolGoing:document.getElementById('st_sc').value,SchoolDetails:(document.getElementById('st_sdet')||{}).value||'',MaktabID:document.getElementById('st_mak').value,TeacherName:document.getElementById('st_tchr').value,Status:document.getElementById('st_st').value,CreatedBy:currentUser.Username};
  if(id&&id!=='null')p.ID=id;
  sp.innerHTML='<span class="spinner" style="width:12px;height:12px;"></span>';
  let res=await apiS(id&&id!=='null'?'updateStudent':'addStudent',p);sp.innerHTML='';
  if(res.success){toast(res.offline?'آف لائن: بعد sync':'✓ محفوظ',res.offline?'warning':'success');document.getElementById('stFW').innerHTML='';loadStudents();}
  else toast(res.message||'خرابی۔','error');
}
async function delSt(id){
  if(!confirm('کیا آپ واقعی اس طالب علم کو حذف کرنا چاہتے ہیں؟'))return;
  let r=await api('deleteStudent',{ID:id});if(r.success){toast('✓ حذف','success');loadStudents();}else toast(r.message,'error');
}

/* ===== MAP VIEW ===== */
function renderMapView(){
  document.getElementById('pageContent').innerHTML=`
    <div class="ph" style="animation:fadeUp .3s ease;"><div class="ph-title" style="font-size:20px;">مکاتب کا نقشہ</div><div class="ph-sub">تمام مکاتب کے مقامات</div></div>
    <div class="card" style="overflow:hidden;padding:0;"><div id="mvMap" style="height:400px;"></div></div>
    <div class="card"><div class="card-head"><div class="card-htitle">مقامات کے ساتھ مکاتب</div></div><div id="mvList">${LD('لوڈ ہو رہا ہے...')}</div></div>`;
  api('getMaktabs',{}).then(res=>{
    if(!res.success){document.getElementById('mvList').innerHTML=ED('Error.');return;}
    cache.maktabs=res.rows;
    let rows=filterByRole(res.rows,'maktabs');
    let map=L.map('mvMap').setView(CONFIG.MAP_DEFAULT_CENTER,CONFIG.MAP_DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
    let wl=rows.filter(r=>r.Latitude&&r.Longitude);
    wl.forEach(r=>L.marker([+r.Latitude,+r.Longitude]).addTo(map).bindPopup(`<b>${esc(r.MaktabName)}</b><br>${esc(r.Tehsil)}, ${esc(r.District)}<br>طلباء: ${r.TotalStudents||0}<br><a href="https://maps.google.com?q=${r.Latitude},${r.Longitude}" target="_blank">🗺 Google Maps</a>`));
    if(wl.length>1) map.fitBounds(wl.map(r=>[+r.Latitude,+r.Longitude]),{padding:[20,20]});
    setTimeout(()=>map.invalidateSize(),200);
    document.getElementById('mvList').innerHTML=wl.length?`<div class="tw"><table><thead><tr><th>مکتب</th><th>تحصیل</th><th>ضلع</th><th>حیثیت</th><th></th></tr></thead><tbody>${wl.map(r=>`<tr><td><div class="td-main">${esc(r.MaktabName)}</div></td><td>${esc(r.Tehsil)}</td><td>${esc(r.District)}</td><td>${sBadge(r.Status)}</td><td><a href="https://maps.google.com?q=${r.Latitude},${r.Longitude}" target="_blank" class="btn btn-outline btn-sm">${IC.location} Maps</a></td></tr>`).join('')}</tbody></table></div>`:ED('کوئی مکتب نقشے پر سیٹ نہیں ہے۔');
  }).catch(()=>{document.getElementById('mvList').innerHTML=ED('Connection error.');});
}

/* ===== USERS ===== */
function renderUsers(){
  if(!isAdmin()){navigate('dashboard');return;}
  document.getElementById('pageContent').innerHTML=`
    <div class="ph" style="animation:fadeUp .3s ease;"><div class="ph-title" style="font-size:20px;">صارفین کا انتظام</div><div class="ph-sub">User Management</div></div>
    <div class="card">
      <div class="toolbar"><div class="ml-auto"><button class="btn btn-gold btn-sm" onclick="openUsForm()">${IC.add} نیا صارف</button></div></div>
      <div id="usTW">${LD('لوڈ ہو رہا ہے...')}</div>
    </div><div id="usFW"></div>`;
  loadUsers();
}
async function loadUsers(){
  try{
    let [uR,mR]=await Promise.all([api('getUsers',{}),api('getMaktabs',{})]);
    cache.users=uR.success?uR.rows:[];cache.maktabs=mR.success?mR.rows:cache.maktabs;
    renderUsT(cache.users);
  }catch{document.getElementById('usTW').innerHTML=ED('Connection error.');}
}
function renderUsT(rows){
  let w=document.getElementById('usTW');if(!rows.length){w.innerHTML=ED('کوئی صارف نہیں۔');return;}
  w.innerHTML=`<div class="tw"><table><thead><tr><th>Username</th><th>نام</th><th>کردار</th><th>مکتب</th><th>فون</th><th>حیثیت</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr><td><div class="td-main">${esc(r.Username)}</div></td><td>${esc(r.Name||'-')}</td><td>${rBadge(r.Role)}</td><td>${esc(r.AssignedMaktab||'-')}</td><td>${esc(r.Phone||'-')}</td><td>${sBadge(r.Status)}</td><td><div class="td-actions"><button class="btn btn-outline btn-icon btn-sm" onclick="openUsForm('${esc(r.Username)}')">${IC.edit}</button><button class="btn btn-danger btn-icon btn-sm" onclick="delUs('${esc(r.Username)}')">${IC.del}</button></div></td></tr>`).join('')}</tbody></table></div>`;
}
function openUsForm(username){
  let r=username?((cache.users||[]).find(u=>u.Username===username)||{}):{}; let isE=!!(username&&Object.keys(r).length);
  let mO=cache.maktabs.map(m=>`<option value="${esc(m.MaktabName)}" ${r.AssignedMaktab===m.MaktabName?'selected':''}>${esc(m.MaktabName)}</option>`).join('');
  document.getElementById('usFW').innerHTML=`
    <div class="card" style="animation:fadeUp .3s ease;">
      <div class="card-head"><div class="card-head-l"><div class="card-hicon">${IC.users}</div><div class="card-htitle">${isE?'صارف میں ترمیم':'نیا صارف شامل کریں'}</div></div></div>
      <div class="card-body"><div class="form-grid">
        <div class="ff"><label>یوزر نیم *</label><input class="fi" id="us_u" value="${esc(r.Username||'')}" ${isE?'readonly style="background:#f1f5f9;"':''}></div>
        <div class="ff"><label>پاس ورڈ ${isE?'(خالی = تبدیلی نہیں)':'*'}</label><input class="fi" id="us_p" type="text" placeholder="${isE?'تبدیل کرنے کے لیے درج کریں':''}"></div>
        <div class="ff"><label>مکمل نام</label><input class="fi" id="us_n" value="${esc(r.Name||'')}"></div>
        <div class="ff"><label>کردار</label><select class="fsel2" id="us_r"><option value="Admin" ${r.Role==='Admin'?'selected':''}>Admin</option><option value="Supervisor" ${r.Role==='Supervisor'?'selected':''}>Supervisor</option><option value="Teacher" ${r.Role==='Teacher'?'selected':''}>Teacher</option></select></div>
        <div class="ff"><label>متعلقہ مکتب</label><select class="fsel2" id="us_m"><option value="All">All</option>${mO}</select></div>
        <div class="ff"><label>فون</label><input class="fi" id="us_ph" value="${esc(r.Phone||'')}"></div>
        <div class="ff"><label>حیثیت</label><select class="fsel2" id="us_st"><option value="Active" ${r.Status==='Active'?'selected':''}>Active</option><option value="Inactive" ${r.Status==='Inactive'?'selected':''}>Inactive</option></select></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-gold" onclick="saveUs(${isE})">محفوظ کریں <span id="usSp"></span></button>
        <button class="btn btn-outline" onclick="document.getElementById('usFW').innerHTML=''">منسوخ</button>
      </div></div>
    </div>`;
  document.getElementById('usFW').scrollIntoView({behavior:'smooth'});
}
async function saveUs(isE){
  let sp=document.getElementById('usSp');
  let un=(document.getElementById('us_u').value||'').trim(), pw=document.getElementById('us_p').value;
  if(!un){toast('Username ضروری ہے۔','error');return;}
  if(!isE&&!pw){toast('نئے صارف کے لیے password ضروری ہے۔','error');return;}
  let p={Username:un,Name:document.getElementById('us_n').value,Role:document.getElementById('us_r').value,AssignedMaktab:document.getElementById('us_m').value,Phone:document.getElementById('us_ph').value,Status:document.getElementById('us_st').value};
  if(pw)p.Password=pw;if(isE){p.username_key=un;p.ID=un;}
  sp.innerHTML='<span class="spinner" style="width:12px;height:12px;"></span>';
  let res=await api(isE?'updateUser':'addUser',p);sp.innerHTML='';
  if(res.success){toast('✓ محفوظ','success');document.getElementById('usFW').innerHTML='';loadUsers();}
  else toast(res.message||'خرابی۔','error');
}
async function delUs(username){
  if(!confirm('کیا آپ واقعی اس صارف کو حذف کرنا چاہتے ہیں؟'))return;
  let r=await api('deleteUser',{ID:username,username_key:username});
  if(r.success){toast('✓ حذف','success');loadUsers();}else toast(r.message,'error');
}

/* ===== PROFILE ===== */
function renderProfile(){
  let u=currentUser||{};
  let myS=filterByRole(cache.students||[],'students');
  document.getElementById('pageContent').innerHTML=`
    <div class="ph" style="animation:fadeUp .3s ease;"><div class="ph-title" style="font-size:20px;">میرا پروفائل</div><div class="ph-sub">My Profile</div></div>
    <div class="profile-hero">
      <div class="ph-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M3 21a9 9 0 0 1 18 0"/></svg></div>
      <div><div class="ph-name">${esc(u.Name||u.Username)}</div><div style="margin-top:6px;">${rBadge(u.Role)}</div><div class="ph-meta" style="margin-top:6px;">مکتب: ${esc(u.AssignedMaktab||'N/A')} · ${esc(u.Phone||'')}</div></div>
    </div>
    ${isTeacher()?`
    <div class="stats-grid" style="margin-bottom:18px;">
      <div class="stat-card sc-teal" style="animation:fadeUp .3s ease 0.05s both;"><div class="sc-icon">${IC.student}</div><div class="sc-num">${myS.length}</div><div class="sc-label">کل طلباء</div></div>
      <div class="stat-card sc-green" style="animation:fadeUp .3s ease 0.1s both;"><div class="sc-icon">${IC.check}</div><div class="sc-num">${myS.filter(s=>String(s.Status||'').toLowerCase()==='active').length}</div><div class="sc-label">فعال طلباء</div></div>
      <div class="stat-card sc-blue" style="animation:fadeUp .3s ease 0.15s both;"><div class="sc-icon">${IC.boys}</div><div class="sc-num">${myS.filter(s=>String(s.Gender||'').toLowerCase().startsWith('m')).length}</div><div class="sc-label">لڑکے</div></div>
      <div class="stat-card sc-pink" style="animation:fadeUp .3s ease 0.2s both;"><div class="sc-icon">${IC.boys}</div><div class="sc-num">${myS.filter(s=>String(s.Gender||'').toLowerCase().startsWith('f')).length}</div><div class="sc-label">لڑکیاں</div></div>
    </div>`:''}
    <div class="card">
      <div class="card-head"><div class="card-htitle">پروفائل تبدیل کریں</div></div>
      <div class="card-body"><div class="form-grid" style="max-width:480px;">
        <div class="ff"><label>نام</label><input class="fi" value="${esc(u.Name||u.Username)}" readonly style="background:#f8fafc;"></div>
        <div class="ff"><label>Username</label><input class="fi" value="${esc(u.Username)}" readonly style="background:#f8fafc;"></div>
        <div class="ff"><label>کردار</label><input class="fi" value="${esc(u.Role)}" readonly style="background:#f8fafc;"></div>
        <div class="ff"><label>فون</label><input class="fi" id="pf_ph" value="${esc(u.Phone||'')}"></div>
        <div class="ff full"><label>نیا پاس ورڈ (خالی = تبدیلی نہیں)</label><input class="fi" type="password" id="pf_pw" placeholder="نیا پاس ورڈ"></div>
      </div>
      <div class="form-actions"><button class="btn btn-gold" onclick="savePf()">اپڈیٹ کریں <span id="pfSp"></span></button></div>
      </div>
    </div>`;
}
async function savePf(){
  let sp=document.getElementById('pfSp'),ph=document.getElementById('pf_ph').value,pw=document.getElementById('pf_pw').value;
  let p={username_key:currentUser.Username,Username:currentUser.Username,Phone:ph};if(pw)p.Password=pw;
  sp.innerHTML='<span class="spinner" style="width:12px;height:12px;"></span>';
  let res=await api('updateUser',p);sp.innerHTML='';
  if(res.success){currentUser.Phone=ph;localStorage.setItem('isra_user',JSON.stringify(currentUser));toast('✓ پروفائل اپڈیٹ ہو گیا','success');}
  else toast(res.message||'خرابی۔','error');
}
