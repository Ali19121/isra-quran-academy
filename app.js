/***********************************************************************
 * ISRA QURAN ACADEMY PORTAL - app.js
 ***********************************************************************/

let currentUser = null;
let mapInstance = null;
let mapMarker = null;
let cache = { maktabs: [], teachers: [], students: [] };

/* ---------------------- API HELPER ---------------------- */
function api(action, params, method) {
  return new Promise((resolve, reject) => {
    let url = CONFIG.SCRIPT_URL + "?action=" + encodeURIComponent(action);
    let body = null;
    let opts = { method: "POST" };

    let allParams = Object.assign({ action: action }, params || {});

    if (!method || method === "POST") {
      let formData = new URLSearchParams();
      for (let k in allParams) formData.append(k, allParams[k] === undefined || allParams[k] === null ? "" : allParams[k]);
      opts.body = formData;
    } else {
      let q = new URLSearchParams(allParams);
      url = CONFIG.SCRIPT_URL + "?" + q.toString();
      opts = { method: "GET" };
    }

    fetch(url, opts)
      .then(r => r.json())
      .then(resolve)
      .catch(err => reject(err));
  });
}

/* ---------------------- TOAST ---------------------- */
function toast(msg, type) {
  let t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast show" + (type ? " " + type : "");
  setTimeout(() => { t.className = "toast"; }, 3000);
}

/* ---------------------- AUTH ---------------------- */
function doLogin() {
  let user = document.getElementById("loginUser").value.trim();
  let pass = document.getElementById("loginPass").value.trim();
  let errEl = document.getElementById("loginError");
  let spin = document.getElementById("loginSpin");
  errEl.textContent = "";

  if (!user || !pass) {
    errEl.textContent = "Username aur password darj karein.";
    return;
  }

  spin.innerHTML = '<span class="spinner"></span>';

  api("login", { username: user, password: pass }).then(res => {
    spin.innerHTML = "";
    if (res.success) {
      currentUser = res.user;
      sessionStorage.setItem("isra_user", JSON.stringify(currentUser));
      enterApp();
    } else {
      errEl.textContent = res.message || "Login fail ho gaya.";
    }
  }).catch(err => {
    spin.innerHTML = "";
    errEl.textContent = "Connection error. Internet check karein.";
  });
}

function logout() {
  sessionStorage.removeItem("isra_user");
  currentUser = null;
  document.getElementById("appShell").style.display = "none";
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("loginUser").value = "";
  document.getElementById("loginPass").value = "";
}

function enterApp() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("appShell").style.display = "block";
  document.getElementById("sidebarUserName").textContent = currentUser.Name || currentUser.Username;
  document.getElementById("sidebarUserRole").textContent = currentUser.Role || "";
  buildNav();
  navigate("dashboard");
}

// Auto-login if session exists
window.addEventListener("DOMContentLoaded", () => {
  let saved = sessionStorage.getItem("isra_user");
  if (saved) {
    currentUser = JSON.parse(saved);
    enterApp();
  }
  // Enter key login
  document.getElementById("loginPass").addEventListener("keypress", e => {
    if (e.key === "Enter") doLogin();
  });
});

/* ---------------------- NAVIGATION ---------------------- */
const NAV_ITEMS = {
  Admin: [
    { id: "dashboard", label: "ڈیش بورڈ", labelEn: "Dashboard", icon: "🏠" },
    { id: "maktabs", label: "مکاتب", labelEn: "Maktabs", icon: "🕌" },
    { id: "teachers", label: "اساتذہ", labelEn: "Teachers", icon: "👨‍🏫" },
    { id: "students", label: "طلباء", labelEn: "Students", icon: "🎓" },
    { id: "mapview", label: "نقشہ", labelEn: "Map View", icon: "🗺️" },
    { id: "users", label: "صارفین", labelEn: "Users", icon: "👥" },
  ],
  Supervisor: [
    { id: "dashboard", label: "ڈیش بورڈ", labelEn: "Dashboard", icon: "🏠" },
    { id: "maktabs", label: "مکاتب", labelEn: "Maktabs", icon: "🕌" },
    { id: "teachers", label: "اساتذہ", labelEn: "Teachers", icon: "👨‍🏫" },
    { id: "students", label: "طلباء", labelEn: "Students", icon: "🎓" },
    { id: "mapview", label: "نقشہ", labelEn: "Map View", icon: "🗺️" },
  ],
  Teacher: [
    { id: "dashboard", label: "ڈیش بورڈ", labelEn: "Dashboard", icon: "🏠" },
    { id: "students", label: "طلباء", labelEn: "Students", icon: "🎓" },
  ],
};

function buildNav() {
  let role = currentUser.Role || "Teacher";
  let items = NAV_ITEMS[role] || NAV_ITEMS.Teacher;
  let nav = document.getElementById("navMenu");
  nav.innerHTML = "";
  items.forEach(it => {
    let btn = document.createElement("button");
    btn.className = "nav-item";
    btn.id = "nav-" + it.id;
    btn.innerHTML = `<span class="nav-icon">${it.icon}</span> ${it.labelEn}`;
    btn.onclick = () => navigate(it.id);
    nav.appendChild(btn);
  });
}

function setActiveNav(id) {
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
  let el = document.getElementById("nav-" + id);
  if (el) el.classList.add("active");
}

function navigate(page) {
  setActiveNav(page);
  switch (page) {
    case "dashboard": renderDashboard(); break;
    case "maktabs": renderMaktabs(); break;
    case "teachers": renderTeachers(); break;
    case "students": renderStudents(); break;
    case "mapview": renderMapView(); break;
    case "users": renderUsers(); break;
    default: renderDashboard();
  }
}

/* ---------------------- UTIL ---------------------- */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
}

function formatDate(val) {
  if (!val) return "-";
  let d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("en-GB");
}

function statusBadge(status) {
  let cls = String(status).toLowerCase() === "active" ? "active" : "dropout";
  return `<span class="badge ${cls}">${escapeHtml(status || "-")}</span>`;
}

function loadingHTML(label) {
  return `<div class="empty-state"><span class="spinner"></span><p style="margin-top:10px;">${label || "Loading..."}</p></div>`;
}

/* ====================================================================
 * DASHBOARD
 * ==================================================================== */
function renderDashboard() {
  let content = document.getElementById("pageContent");
  content.innerHTML = `
    <div class="topbar">
      <div>
        <h1>السلام علیکم, ${escapeHtml(currentUser.Name || currentUser.Username)}</h1>
        <div class="sub">ISRA Quran Academy &mdash; Maktab Management Overview</div>
      </div>
    </div>
    <div id="dashStats">${loadingHTML("Stats load ho rahe hain...")}</div>
    <div class="panel">
      <div class="panel-header"><h3>اضلاع کے لحاظ سے مکاتب &nbsp;<span style="font-size:12px;color:#999;">(Maktabs by District)</span></h3></div>
      <div id="districtChart"><div class="empty-state"><span class="spinner"></span></div></div>
    </div>
  `;

  api("getDashboard", {}).then(res => {
    if (!res.success) {
      document.getElementById("dashStats").innerHTML = `<div class="empty-state">Data load nahi ho saka.</div>`;
      return;
    }
    document.getElementById("dashStats").innerHTML = `
      <div class="stats-grid">
        <div class="stat-card teal">
          <div class="num">${res.totalMaktabs}</div>
          <div class="lbl">کل مکاتب (Total Maktabs)</div>
        </div>
        <div class="stat-card green">
          <div class="num">${res.activeMaktabs}</div>
          <div class="lbl">فعال مکاتب (Active)</div>
        </div>
        <div class="stat-card">
          <div class="num">${res.totalStudents}</div>
          <div class="lbl">کل طلباء (Total Students)</div>
        </div>
        <div class="stat-card">
          <div class="num">${res.boys} / ${res.girls}</div>
          <div class="lbl">لڑکے / لڑکیاں (Boys / Girls)</div>
        </div>
        <div class="stat-card teal">
          <div class="num">${res.totalTeachers}</div>
          <div class="lbl">کل اساتذہ (Total Teachers)</div>
        </div>
        <div class="stat-card green">
          <div class="num">${res.activeTeachers}</div>
          <div class="lbl">فعال اساتذہ (Active Teachers)</div>
        </div>
      </div>
    `;

    let dc = res.districtCounts || {};
    let keys = Object.keys(dc);
    if (keys.length === 0) {
      document.getElementById("districtChart").innerHTML = `<div class="empty-state"><div class="glyph">🗺️</div>Abhi koi maktab data nahi hai.</div>`;
      return;
    }
    let max = Math.max(...keys.map(k => dc[k]));
    let html = keys.sort((a,b)=>dc[b]-dc[a]).map(k => {
      let pct = max ? (dc[k] / max * 100) : 0;
      return `
        <div style="margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
            <span style="font-weight:600; color:var(--teal-dark);">${escapeHtml(k)}</span>
            <span style="color:#888;">${dc[k]}</span>
          </div>
          <div style="background:var(--sand); border-radius:8px; height:10px; overflow:hidden;">
            <div style="background:var(--gold); height:100%; width:${pct}%; border-radius:8px;"></div>
          </div>
        </div>`;
    }).join("");
    document.getElementById("districtChart").innerHTML = html;
  }).catch(() => {
    document.getElementById("dashStats").innerHTML = `<div class="empty-state">Connection error &mdash; internet check karein.</div>`;
  });
}

/* ====================================================================
 * MAKTABS
 * ==================================================================== */
function renderMaktabs() {
  let content = document.getElementById("pageContent");
  content.innerHTML = `
    <div class="topbar">
      <div>
        <h1>مکاتب کا ریکارڈ</h1>
        <div class="sub">Maktab Records &mdash; ${currentUser.Role === "Teacher" ? "View only" : "Add / edit maktab details"}</div>
      </div>
      ${currentUser.Role !== "Teacher" ? `<button class="btn btn-gold btn-sm" onclick="openMaktabForm()">+ نیا مکتب شامل کریں</button>` : ""}
    </div>
    <div class="panel">
      <div class="panel-header">
        <h3>تمام مکاتب (All Maktabs)</h3>
        <input type="text" id="maktabSearch" placeholder="🔍 Search by name, district, tehsil..." style="padding:8px 14px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;width:240px;" oninput="filterMaktabTable()">
      </div>
      <div id="maktabTableWrap">${loadingHTML("Maktab records load ho rahe hain...")}</div>
    </div>
    <div id="maktabFormPanel"></div>
  `;
  loadMaktabs();
}

function loadMaktabs() {
  api("getMaktabs", {}, "GET").then(res => {
    if (!res.success) {
      document.getElementById("maktabTableWrap").innerHTML = `<div class="empty-state">Data load nahi ho saka.</div>`;
      return;
    }
    cache.maktabs = res.rows;
    renderMaktabTable(res.rows);
  }).catch(() => {
    document.getElementById("maktabTableWrap").innerHTML = `<div class="empty-state">Connection error.</div>`;
  });
}

function renderMaktabTable(rows) {
  let wrap = document.getElementById("maktabTableWrap");
  if (!rows.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="glyph">🕌</div>کوئی مکتب موجود نہیں۔ نیا مکتب شامل کریں۔</div>`;
    return;
  }
  let canEdit = currentUser.Role !== "Teacher";
  let rowsHtml = rows.map(r => `
    <tr data-search="${escapeHtml((r.MaktabName + ' ' + r.District + ' ' + r.Tehsil + ' ' + r.UC).toLowerCase())}">
      <td>${r.ID}</td>
      <td><b>${escapeHtml(r.MaktabName)}</b></td>
      <td>${escapeHtml(r.RunningCourses)}</td>
      <td>${escapeHtml(r.Tehsil)}</td>
      <td>${escapeHtml(r.District)}</td>
      <td>${r.TotalStudents || 0} (${r.Boys||0}/${r.Girls||0})</td>
      <td>${r.TotalTeachers || 0}</td>
      <td>${escapeHtml(r.HeadName)}<br><span style="color:#999;font-size:11px;">${escapeHtml(r.HeadContact)}</span></td>
      <td>${statusBadge(r.Status)}</td>
      <td>
        ${r.Latitude && r.Longitude ? `<a href="https://www.google.com/maps?q=${r.Latitude},${r.Longitude}" target="_blank" title="Open in Google Maps">📍</a>` : "-"}
        ${canEdit ? `<button class="btn btn-outline btn-sm" style="margin-left:6px;" onclick="openMaktabForm(${r.ID})">Edit</button>
        <button class="btn btn-sm" style="margin-left:6px;background:var(--red);color:#fff;" onclick="deleteMaktab(${r.ID})">Del</button>` : ""}
      </td>
    </tr>`).join("");

  wrap.innerHTML = `
    <div class="table-wrap">
      <table id="maktabTable">
        <thead><tr>
          <th>ID</th><th>Maktab Name</th><th>Courses</th><th>Tehsil</th><th>District</th>
          <th>Students (B/G)</th><th>Teachers</th><th>Head</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}

function filterMaktabTable() {
  let q = document.getElementById("maktabSearch").value.toLowerCase();
  document.querySelectorAll("#maktabTable tbody tr").forEach(tr => {
    tr.style.display = tr.dataset.search.includes(q) ? "" : "none";
  });
}

function openMaktabForm(id) {
  let record = id ? cache.maktabs.find(m => String(m.ID) === String(id)) : null;
  let isEdit = !!record;
  let r = record || {};

  document.getElementById("maktabFormPanel").innerHTML = `
    <div class="panel">
      <div class="panel-header"><h3>${isEdit ? "مکتب میں ترمیم" : "نیا مکتب شامل کریں"}</h3></div>
      <div class="form-grid">
        <div class="field"><label>مکتب کا نام (Maktab Name) *</label><input id="mk_name" value="${escapeHtml(r.MaktabName||'')}"></div>
        <div class="field"><label>جاری کورسز (Running Courses)</label><input id="mk_courses" value="${escapeHtml(r.RunningCourses||'')}" placeholder="e.g. Qaida, Nazra, Hifz"></div>
        <div class="field field-full"><label>مکمل پتہ (Full Address)</label><input id="mk_address" value="${escapeHtml(r.FullAddress||'')}"></div>
        <div class="field"><label>UC</label><input id="mk_uc" value="${escapeHtml(r.UC||'')}"></div>
        <div class="field"><label>تحصیل (Tehsil)</label><input id="mk_tehsil" value="${escapeHtml(r.Tehsil||'')}"></div>
        <div class="field"><label>ضلع (District)</label><input id="mk_district" value="${escapeHtml(r.District||'')}"></div>
        <div class="field"><label>قائمی تاریخ (Start Date)</label><input type="date" id="mk_startdate" value="${r.StartDate ? toDateInput(r.StartDate) : ''}"></div>
        <div class="field"><label>گنجائش (Capacity)</label><input type="number" id="mk_capacity" value="${r.Capacity||''}"></div>
        <div class="field"><label>کل طلباء (Total Students)</label><input type="number" id="mk_totalstudents" value="${r.TotalStudents||''}"></div>
        <div class="field"><label>لڑکے (Boys)</label><input type="number" id="mk_boys" value="${r.Boys||''}"></div>
        <div class="field"><label>لڑکیاں (Girls)</label><input type="number" id="mk_girls" value="${r.Girls||''}"></div>
        <div class="field"><label>کل اساتذہ (Total Teachers)</label><input type="number" id="mk_totalteachers" value="${r.TotalTeachers||''}"></div>
        <div class="field"><label>نگران کا نام (Head Name)</label><input id="mk_headname" value="${escapeHtml(r.HeadName||'')}"></div>
        <div class="field"><label>نگران رابطہ (Head Contact)</label><input id="mk_headcontact" value="${escapeHtml(r.HeadContact||'')}"></div>
        <div class="field"><label>نگران واٹس ایپ (Head WhatsApp)</label><input id="mk_headwhatsapp" value="${escapeHtml(r.HeadWhatsApp||'')}"></div>
        <div class="field"><label>حیثیت (Status)</label>
          <select id="mk_status">
            <option value="Active" ${r.Status==='Active'?'selected':''}>Active</option>
            <option value="Inactive" ${r.Status==='Inactive'?'selected':''}>Inactive</option>
          </select>
        </div>
        <div class="field field-full"><label>تبصرہ (Remarks)</label><input id="mk_remarks" value="${escapeHtml(r.Remarks||'')}"></div>
        <div class="field field-full">
          <label>مکتب کا مقام نقشے پر منتخب کریں (Click on map to set location) *</label>
          <div id="mapPicker"></div>
          <div class="coord-display" id="coordDisplay">
            ${r.Latitude && r.Longitude ? `Selected: ${r.Latitude}, ${r.Longitude}` : "Map par click karke location set karein"}
          </div>
          <input type="hidden" id="mk_lat" value="${r.Latitude||''}">
          <input type="hidden" id="mk_lng" value="${r.Longitude||''}">
        </div>
      </div>
      <div style="margin-top:18px; display:flex; gap:10px;">
        <button class="btn btn-gold btn-sm" onclick="saveMaktab(${isEdit ? r.ID : 'null'})">محفوظ کریں (Save) <span id="mkSaveSpin"></span></button>
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('maktabFormPanel').innerHTML=''">منسوخ (Cancel)</button>
      </div>
    </div>
  `;

  document.getElementById("maktabFormPanel").scrollIntoView({ behavior: "smooth" });
  initMapPicker(r.Latitude || null, r.Longitude || null);
}

function toDateInput(val) {
  let d = new Date(val);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function initMapPicker(lat, lng) {
  setTimeout(() => {
    if (mapInstance) { mapInstance.remove(); mapInstance = null; }
    let center = (lat && lng) ? [parseFloat(lat), parseFloat(lng)] : CONFIG.MAP_DEFAULT_CENTER;
    let zoom = (lat && lng) ? 13 : CONFIG.MAP_DEFAULT_ZOOM;
    mapInstance = L.map("mapPicker").setView(center, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);

    if (lat && lng) {
      mapMarker = L.marker(center).addTo(mapInstance);
    }

    mapInstance.on("click", function(e) {
      let { lat, lng } = e.latlng;
      if (mapMarker) mapInstance.removeLayer(mapMarker);
      mapMarker = L.marker([lat, lng]).addTo(mapInstance);
      document.getElementById("mk_lat").value = lat.toFixed(6);
      document.getElementById("mk_lng").value = lng.toFixed(6);
      document.getElementById("coordDisplay").textContent = `Selected: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    });

    setTimeout(() => mapInstance.invalidateSize(), 200);
  }, 100);
}

function saveMaktab(id) {
  let spin = document.getElementById("mkSaveSpin");
  let name = document.getElementById("mk_name").value.trim();
  if (!name) { toast("Maktab ka naam zaroori hai.", "error"); return; }

  let payload = {
    MaktabName: name,
    RunningCourses: document.getElementById("mk_courses").value,
    FullAddress: document.getElementById("mk_address").value,
    UC: document.getElementById("mk_uc").value,
    Tehsil: document.getElementById("mk_tehsil").value,
    District: document.getElementById("mk_district").value,
    Latitude: document.getElementById("mk_lat").value,
    Longitude: document.getElementById("mk_lng").value,
    StartDate: document.getElementById("mk_startdate").value,
    Capacity: document.getElementById("mk_capacity").value,
    TotalStudents: document.getElementById("mk_totalstudents").value,
    Boys: document.getElementById("mk_boys").value,
    Girls: document.getElementById("mk_girls").value,
    TotalTeachers: document.getElementById("mk_totalteachers").value,
    HeadName: document.getElementById("mk_headname").value,
    HeadContact: document.getElementById("mk_headcontact").value,
    HeadWhatsApp: document.getElementById("mk_headwhatsapp").value,
    Status: document.getElementById("mk_status").value,
    Remarks: document.getElementById("mk_remarks").value,
    CreatedBy: currentUser.Username
  };

  spin.innerHTML = '<span class="spinner"></span>';
  let action = id ? "updateMaktab" : "addMaktab";
  if (id) payload.ID = id;

  api(action, payload).then(res => {
    spin.innerHTML = "";
    if (res.success) {
      toast(res.message || "Saved!", "success");
      document.getElementById("maktabFormPanel").innerHTML = "";
      loadMaktabs();
    } else {
      toast(res.message || "Error occurred.", "error");
    }
  }).catch(() => { spin.innerHTML = ""; toast("Connection error.", "error"); });
}

function deleteMaktab(id) {
  if (!confirm("Kya aap waqai is maktab ko delete karna chahte hain?")) return;
  api("deleteMaktab", { ID: id }).then(res => {
    if (res.success) { toast(res.message, "success"); loadMaktabs(); }
    else toast(res.message, "error");
  });
}

/* ====================================================================
 * TEACHERS
 * ==================================================================== */
function renderTeachers() {
  let content = document.getElementById("pageContent");
  let canEdit = currentUser.Role !== "Teacher";
  content.innerHTML = `
    <div class="topbar">
      <div>
        <h1>اساتذہ کا ریکارڈ</h1>
        <div class="sub">Teacher Records</div>
      </div>
      ${canEdit ? `<button class="btn btn-gold btn-sm" onclick="openTeacherForm()">+ نیا استاد شامل کریں</button>` : ""}
    </div>
    <div class="panel">
      <div class="panel-header">
        <h3>تمام اساتذہ (All Teachers)</h3>
        <input type="text" id="teacherSearch" placeholder="🔍 Search by name, CNIC, district..." style="padding:8px 14px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;width:240px;" oninput="filterTeacherTable()">
      </div>
      <div id="teacherTableWrap">${loadingHTML("Teacher records load ho rahe hain...")}</div>
    </div>
    <div id="teacherFormPanel"></div>
  `;
  loadTeachers();
}

function loadTeachers() {
  Promise.all([api("getTeachers", {}, "GET"), api("getMaktabs", {}, "GET")]).then(([tRes, mRes]) => {
    if (!tRes.success) {
      document.getElementById("teacherTableWrap").innerHTML = `<div class="empty-state">Data load nahi ho saka.</div>`;
      return;
    }
    cache.teachers = tRes.rows;
    cache.maktabs = mRes.success ? mRes.rows : [];
    renderTeacherTable(tRes.rows);
  }).catch(() => {
    document.getElementById("teacherTableWrap").innerHTML = `<div class="empty-state">Connection error.</div>`;
  });
}

function maktabName(id) {
  let m = cache.maktabs.find(x => String(x.ID) === String(id));
  return m ? m.MaktabName : "-";
}

function renderTeacherTable(rows) {
  let wrap = document.getElementById("teacherTableWrap");
  if (!rows.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="glyph">👨‍🏫</div>کوئی استاد موجود نہیں۔ نیا استاد شامل کریں۔</div>`;
    return;
  }
  let canEdit = currentUser.Role !== "Teacher";
  let rowsHtml = rows.map(r => `
    <tr data-search="${escapeHtml((r.Name+' '+r.CNIC+' '+r.District+' '+r.Tehsil+' '+r.Designation).toLowerCase())}">
      <td>${r.ID}</td>
      <td><b>${escapeHtml(r.Name)}</b></td>
      <td>${escapeHtml(r.Designation)}</td>
      <td>${escapeHtml(r.CNIC)}</td>
      <td>${escapeHtml(r.Gender)}</td>
      <td>${escapeHtml(r.Tehsil)}, ${escapeHtml(r.District)}</td>
      <td>${escapeHtml(r.Qualification)}</td>
      <td>${escapeHtml(r.Certification)}</td>
      <td>${escapeHtml(r.Experience)} yrs</td>
      <td>${escapeHtml(r.Phone)}</td>
      <td>${escapeHtml(maktabName(r.MaktabID))}</td>
      <td>${statusBadge(r.Status)}</td>
      <td>
        ${canEdit ? `<button class="btn btn-outline btn-sm" onclick="openTeacherForm(${r.ID})">Edit</button>
        <button class="btn btn-sm" style="margin-left:6px;background:var(--red);color:#fff;" onclick="deleteTeacher(${r.ID})">Del</button>` : "-"}
      </td>
    </tr>`).join("");

  wrap.innerHTML = `
    <div class="table-wrap">
      <table id="teacherTable">
        <thead><tr>
          <th>ID</th><th>Name</th><th>Designation</th><th>CNIC</th><th>Gender</th><th>Location</th>
          <th>Qualification</th><th>Certification</th><th>Exp.</th><th>Phone</th><th>Maktab</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}

function filterTeacherTable() {
  let q = document.getElementById("teacherSearch").value.toLowerCase();
  document.querySelectorAll("#teacherTable tbody tr").forEach(tr => {
    tr.style.display = tr.dataset.search.includes(q) ? "" : "none";
  });
}

function openTeacherForm(id) {
  let record = id ? cache.teachers.find(t => String(t.ID) === String(id)) : null;
  let isEdit = !!record;
  let r = record || {};

  let maktabOptions = cache.maktabs.map(m =>
    `<option value="${m.ID}" ${String(r.MaktabID)===String(m.ID)?'selected':''}>${escapeHtml(m.MaktabName)}</option>`
  ).join("");

  document.getElementById("teacherFormPanel").innerHTML = `
    <div class="panel">
      <div class="panel-header"><h3>${isEdit ? "استاد کی معلومات میں ترمیم" : "نیا استاد شامل کریں"}</h3></div>
      <div class="form-grid">
        <div class="field"><label>استاد کا نام (Name) *</label><input id="tc_name" value="${escapeHtml(r.Name||'')}"></div>
        <div class="field"><label>عہدہ (Designation)</label><input id="tc_designation" value="${escapeHtml(r.Designation||'')}" placeholder="e.g. Qari, Hifz Teacher"></div>
        <div class="field"><label>والد کا نام (Father's Name)</label><input id="tc_father" value="${escapeHtml(r.FatherName||'')}"></div>
        <div class="field"><label>شناختی کارڈ (CNIC No.)</label><input id="tc_cnic" value="${escapeHtml(r.CNIC||'')}" placeholder="00000-0000000-0"></div>
        <div class="field"><label>تاریخ پیدائش (DOB)</label><input type="date" id="tc_dob" value="${r.DOB?toDateInput(r.DOB):''}"></div>
        <div class="field"><label>جنس (Gender)</label>
          <select id="tc_gender">
            <option value="Male" ${r.Gender==='Male'?'selected':''}>Male</option>
            <option value="Female" ${r.Gender==='Female'?'selected':''}>Female</option>
          </select>
        </div>
        <div class="field"><label>تحصیل (Tehsil)</label><input id="tc_tehsil" value="${escapeHtml(r.Tehsil||'')}"></div>
        <div class="field"><label>ضلع (District)</label><input id="tc_district" value="${escapeHtml(r.District||'')}"></div>
        <div class="field field-full"><label>پتہ (Address)</label><input id="tc_address" value="${escapeHtml(r.Address||'')}"></div>
        <div class="field"><label>تعلیمی قابلیت (Qualification)</label><input id="tc_qualification" value="${escapeHtml(r.Qualification||'')}"></div>
        <div class="field"><label>سرٹیفیکیشن (Certification)</label><input id="tc_certification" value="${escapeHtml(r.Certification||'')}" placeholder="Hifz / Dars-e-Nizami / etc."></div>
        <div class="field"><label>تجربہ (Experience - years)</label><input type="number" id="tc_experience" value="${r.Experience||''}"></div>
        <div class="field"><label>تقرری کی تاریخ (Date of Appointment)</label><input type="date" id="tc_appointdate" value="${r.DateOfAppointment?toDateInput(r.DateOfAppointment):''}"></div>
        <div class="field"><label>فون / واٹس ایپ (Phone/WhatsApp)</label><input id="tc_phone" value="${escapeHtml(r.Phone||'')}"></div>
        <div class="field"><label>تنخواہ (Salary - Rs.)</label><input type="number" id="tc_salary" value="${r.Salary||''}"></div>
        <div class="field"><label>تنخواہ کا ذریعہ (Salary Type)</label>
          <select id="tc_salarytype">
            <option value="Cash" ${r.SalaryType==='Cash'?'selected':''}>Cash</option>
            <option value="Bank Account" ${r.SalaryType==='Bank Account'?'selected':''}>Bank Account</option>
          </select>
        </div>
        <div class="field"><label>متعلقہ مکتب (Assigned Maktab)</label>
          <select id="tc_maktab"><option value="">-- Select --</option>${maktabOptions}</select>
        </div>
        <div class="field"><label>حیثیت (Status)</label>
          <select id="tc_status">
            <option value="Active" ${r.Status==='Active'?'selected':''}>Active</option>
            <option value="Left" ${r.Status==='Left'?'selected':''}>Left</option>
          </select>
        </div>
      </div>
      <div style="margin-top:18px; display:flex; gap:10px;">
        <button class="btn btn-gold btn-sm" onclick="saveTeacher(${isEdit ? r.ID : 'null'})">محفوظ کریں (Save) <span id="tcSaveSpin"></span></button>
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('teacherFormPanel').innerHTML=''">منسوخ (Cancel)</button>
      </div>
    </div>
  `;
  document.getElementById("teacherFormPanel").scrollIntoView({ behavior: "smooth" });
}

function saveTeacher(id) {
  let spin = document.getElementById("tcSaveSpin");
  let name = document.getElementById("tc_name").value.trim();
  if (!name) { toast("استاد کا نام ضروری ہے۔", "error"); return; }

  let payload = {
    Name: name,
    Designation: document.getElementById("tc_designation").value,
    FatherName: document.getElementById("tc_father").value,
    CNIC: document.getElementById("tc_cnic").value,
    DOB: document.getElementById("tc_dob").value,
    Gender: document.getElementById("tc_gender").value,
    Tehsil: document.getElementById("tc_tehsil").value,
    District: document.getElementById("tc_district").value,
    Address: document.getElementById("tc_address").value,
    Qualification: document.getElementById("tc_qualification").value,
    Certification: document.getElementById("tc_certification").value,
    Experience: document.getElementById("tc_experience").value,
    DateOfAppointment: document.getElementById("tc_appointdate").value,
    Phone: document.getElementById("tc_phone").value,
    Salary: document.getElementById("tc_salary").value,
    SalaryType: document.getElementById("tc_salarytype").value,
    MaktabID: document.getElementById("tc_maktab").value,
    Status: document.getElementById("tc_status").value,
    CreatedBy: currentUser.Username
  };

  spin.innerHTML = '<span class="spinner"></span>';
  let action = id ? "updateTeacher" : "addTeacher";
  if (id) payload.ID = id;

  api(action, payload).then(res => {
    spin.innerHTML = "";
    if (res.success) {
      toast(res.message || "Saved!", "success");
      document.getElementById("teacherFormPanel").innerHTML = "";
      loadTeachers();
    } else toast(res.message || "Error occurred.", "error");
  }).catch(() => { spin.innerHTML = ""; toast("Connection error.", "error"); });
}

function deleteTeacher(id) {
  if (!confirm("Kya aap waqai is teacher ko delete karna chahte hain?")) return;
  api("deleteTeacher", { ID: id }).then(res => {
    if (res.success) { toast(res.message, "success"); loadTeachers(); }
    else toast(res.message, "error");
  });
}

/* ====================================================================
 * STUDENTS
 * ==================================================================== */
function renderStudents() {
  let content = document.getElementById("pageContent");
  content.innerHTML = `
    <div class="topbar">
      <div>
        <h1>طلباء کا ریکارڈ</h1>
        <div class="sub">Student Records</div>
      </div>
      <button class="btn btn-gold btn-sm" onclick="openStudentForm()">+ نیا طالب علم شامل کریں</button>
    </div>
    <div class="panel">
      <div class="panel-header">
        <h3>تمام طلباء (All Students)</h3>
        <input type="text" id="studentSearch" placeholder="🔍 Search by name, father, level..." style="padding:8px 14px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;width:240px;" oninput="filterStudentTable()">
      </div>
      <div id="studentTableWrap">${loadingHTML("Student records load ho rahe hain...")}</div>
    </div>
    <div id="studentFormPanel"></div>
  `;
  loadStudents();
}

function loadStudents() {
  Promise.all([api("getStudents", {}, "GET"), api("getMaktabs", {}, "GET")]).then(([sRes, mRes]) => {
    if (!sRes.success) {
      document.getElementById("studentTableWrap").innerHTML = `<div class="empty-state">Data load nahi ho saka.</div>`;
      return;
    }
    cache.students = sRes.rows;
    cache.maktabs = mRes.success ? mRes.rows : [];

    // Teacher role: only show their assigned maktab's students
    let rows = sRes.rows;
    if (currentUser.Role === "Teacher" && currentUser.AssignedMaktab) {
      let myMaktab = cache.maktabs.find(m => m.MaktabName === currentUser.AssignedMaktab);
      if (myMaktab) rows = rows.filter(r => String(r.MaktabID) === String(myMaktab.ID));
    }
    renderStudentTable(rows);
  }).catch(() => {
    document.getElementById("studentTableWrap").innerHTML = `<div class="empty-state">Connection error.</div>`;
  });
}

function renderStudentTable(rows) {
  let wrap = document.getElementById("studentTableWrap");
  if (!rows.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="glyph">🎓</div>کوئی طالب علم موجود نہیں۔ نیا طالب علم شامل کریں۔</div>`;
    return;
  }
  let rowsHtml = rows.map(r => `
    <tr data-search="${escapeHtml((r.Name+' '+r.FatherName+' '+r.CurrentLevel+' '+r.TeacherName).toLowerCase())}">
      <td>${r.ID}</td>
      <td><b>${escapeHtml(r.Name)}</b></td>
      <td>${escapeHtml(r.FatherName)}</td>
      <td>${escapeHtml(r.FatherPhone)}</td>
      <td>${escapeHtml(r.Gender)}</td>
      <td>${formatDate(r.DateOfAdmission)}</td>
      <td>${escapeHtml(r.CurrentLevel)}</td>
      <td>${escapeHtml(r.Attendance)}${r.Attendance ? '%' : ''}</td>
      <td>${escapeHtml(r.SchoolGoing)}</td>
      <td>${escapeHtml(maktabName(r.MaktabID))}</td>
      <td>${escapeHtml(r.TeacherName)}</td>
      <td>${statusBadge(r.Status)}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openStudentForm(${r.ID})">Edit</button>
        <button class="btn btn-sm" style="margin-left:6px;background:var(--red);color:#fff;" onclick="deleteStudent(${r.ID})">Del</button>
      </td>
    </tr>`).join("");

  wrap.innerHTML = `
    <div class="table-wrap">
      <table id="studentTable">
        <thead><tr>
          <th>ID</th><th>Name</th><th>Father's Name</th><th>Father's Phone</th><th>Gender</th>
          <th>Admission</th><th>Level</th><th>Attendance</th><th>School Going</th><th>Maktab</th><th>Teacher</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}

function filterStudentTable() {
  let q = document.getElementById("studentSearch").value.toLowerCase();
  document.querySelectorAll("#studentTable tbody tr").forEach(tr => {
    tr.style.display = tr.dataset.search.includes(q) ? "" : "none";
  });
}

function openStudentForm(id) {
  let record = id ? cache.students.find(s => String(s.ID) === String(id)) : null;
  let isEdit = !!record;
  let r = record || {};

  let maktabOptions = cache.maktabs.map(m =>
    `<option value="${m.ID}" ${String(r.MaktabID)===String(m.ID)?'selected':''}>${escapeHtml(m.MaktabName)}</option>`
  ).join("");

  document.getElementById("studentFormPanel").innerHTML = `
    <div class="panel">
      <div class="panel-header"><h3>${isEdit ? "طالب علم کی معلومات میں ترمیم" : "نیا طالب علم شامل کریں"}</h3></div>
      <div class="form-grid">
        <div class="field"><label>طالب علم کا نام (Name) *</label><input id="st_name" value="${escapeHtml(r.Name||'')}"></div>
        <div class="field"><label>والد کا نام (Father's Name)</label><input id="st_father" value="${escapeHtml(r.FatherName||'')}"></div>
        <div class="field"><label>والد کا شناختی کارڈ (Father's CNIC)</label><input id="st_fathercnic" value="${escapeHtml(r.FatherCNIC||'')}" placeholder="00000-0000000-0"></div>
        <div class="field"><label>والد کا فون (Father's Phone)</label><input id="st_fatherphone" value="${escapeHtml(r.FatherPhone||'')}"></div>
        <div class="field"><label>تاریخ پیدائش (DOB)</label><input type="date" id="st_dob" value="${r.DOB?toDateInput(r.DOB):''}"></div>
        <div class="field"><label>جنس (Gender)</label>
          <select id="st_gender">
            <option value="Male" ${r.Gender==='Male'?'selected':''}>Male</option>
            <option value="Female" ${r.Gender==='Female'?'selected':''}>Female</option>
          </select>
        </div>
        <div class="field field-full"><label>پتہ (Address)</label><input id="st_address" value="${escapeHtml(r.Address||'')}"></div>
        <div class="field"><label>داخلے کی تاریخ (Date of Admission)</label><input type="date" id="st_admissiondate" value="${r.DateOfAdmission?toDateInput(r.DateOfAdmission):''}"></div>
        <div class="field"><label>کورس کی تفصیل (Course Details)</label><input id="st_course" value="${escapeHtml(r.CourseDetails||'')}"></div>
        <div class="field"><label>موجودہ سطح (Current Level)</label>
          <select id="st_level">
            <option value="Qaida" ${r.CurrentLevel==='Qaida'?'selected':''}>Qaida</option>
            <option value="Nazra" ${r.CurrentLevel==='Nazra'?'selected':''}>Nazra</option>
            <option value="Hifz" ${r.CurrentLevel==='Hifz'?'selected':''}>Hifz</option>
            <option value="Tafseer" ${r.CurrentLevel==='Tafseer'?'selected':''}>Tafseer</option>
            <option value="Other" ${r.CurrentLevel==='Other'?'selected':''}>Other</option>
          </select>
        </div>
        <div class="field"><label>حاضری % (Attendance %)</label><input type="number" min="0" max="100" id="st_attendance" value="${r.Attendance||''}"></div>
        <div class="field"><label>سکول جاتا ہے؟ (School Going)</label>
          <select id="st_schoolgoing" onchange="document.getElementById('st_schooldetails_wrap').style.display=this.value==='Yes'?'block':'none'">
            <option value="No" ${r.SchoolGoing==='No'?'selected':''}>No</option>
            <option value="Yes" ${r.SchoolGoing==='Yes'?'selected':''}>Yes</option>
          </select>
        </div>
        <div class="field field-full" id="st_schooldetails_wrap" style="display:${r.SchoolGoing==='Yes'?'block':'none'}">
          <label>سکول کی تفصیل (School Details)</label><input id="st_schooldetails" value="${escapeHtml(r.SchoolDetails||'')}">
        </div>
        <div class="field"><label>حیثیت (Status)</label>
          <select id="st_status">
            <option value="Active" ${r.Status==='Active'?'selected':''}>Active</option>
            <option value="Dropout" ${r.Status==='Dropout'?'selected':''}>Dropout</option>
          </select>
        </div>
        <div class="field"><label>مکتب (Maktab)</label>
          <select id="st_maktab"><option value="">-- Select --</option>${maktabOptions}</select>
        </div>
        <div class="field"><label>استاد کا نام (Teacher Name)</label><input id="st_teacher" value="${escapeHtml(r.TeacherName||'')}"></div>
      </div>
      <div style="margin-top:18px; display:flex; gap:10px;">
        <button class="btn btn-gold btn-sm" onclick="saveStudent(${isEdit ? r.ID : 'null'})">محفوظ کریں (Save) <span id="stSaveSpin"></span></button>
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('studentFormPanel').innerHTML=''">منسوخ (Cancel)</button>
      </div>
    </div>
  `;
  document.getElementById("studentFormPanel").scrollIntoView({ behavior: "smooth" });
}

function saveStudent(id) {
  let spin = document.getElementById("stSaveSpin");
  let name = document.getElementById("st_name").value.trim();
  if (!name) { toast("طالب علم کا نام ضروری ہے۔", "error"); return; }

  let payload = {
    Name: name,
    FatherName: document.getElementById("st_father").value,
    FatherCNIC: document.getElementById("st_fathercnic").value,
    FatherPhone: document.getElementById("st_fatherphone").value,
    DOB: document.getElementById("st_dob").value,
    Gender: document.getElementById("st_gender").value,
    Address: document.getElementById("st_address").value,
    DateOfAdmission: document.getElementById("st_admissiondate").value,
    CourseDetails: document.getElementById("st_course").value,
    CurrentLevel: document.getElementById("st_level").value,
    Attendance: document.getElementById("st_attendance").value,
    SchoolGoing: document.getElementById("st_schoolgoing").value,
    SchoolDetails: document.getElementById("st_schooldetails").value,
    Status: document.getElementById("st_status").value,
    MaktabID: document.getElementById("st_maktab").value,
    TeacherName: document.getElementById("st_teacher").value,
    CreatedBy: currentUser.Username
  };

  spin.innerHTML = '<span class="spinner"></span>';
  let action = id ? "updateStudent" : "addStudent";
  if (id) payload.ID = id;

  api(action, payload).then(res => {
    spin.innerHTML = "";
    if (res.success) {
      toast(res.message || "Saved!", "success");
      document.getElementById("studentFormPanel").innerHTML = "";
      loadStudents();
    } else toast(res.message || "Error occurred.", "error");
  }).catch(() => { spin.innerHTML = ""; toast("Connection error.", "error"); });
}

function deleteStudent(id) {
  if (!confirm("Kya aap waqai is student ko delete karna chahte hain?")) return;
  api("deleteStudent", { ID: id }).then(res => {
    if (res.success) { toast(res.message, "success"); loadStudents(); }
    else toast(res.message, "error");
  });
}

/* ====================================================================
 * MAP VIEW - All Maktabs on Map
 * ==================================================================== */
function renderMapView() {
  let content = document.getElementById("pageContent");
  content.innerHTML = `
    <div class="topbar">
      <div>
        <h1>مکاتب کا نقشہ</h1>
        <div class="sub">All Maktab Locations across Sindh / Pakistan</div>
      </div>
    </div>
    <div class="panel">
      <div id="mapViewContainer" style="height:520px; border-radius:10px;"></div>
    </div>
    <div class="panel">
      <div class="panel-header"><h3>مکاتب کی فہرست (List with locations)</h3></div>
      <div id="mapListWrap">${loadingHTML("Loading...")}</div>
    </div>
  `;

  api("getMaktabs", {}, "GET").then(res => {
    if (!res.success) { document.getElementById("mapListWrap").innerHTML = `<div class="empty-state">Error.</div>`; return; }
    cache.maktabs = res.rows;

    let map = L.map("mapViewContainer").setView(CONFIG.MAP_DEFAULT_CENTER, CONFIG.MAP_DEFAULT_ZOOM);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let withLoc = res.rows.filter(r => r.Latitude && r.Longitude);
    let bounds = [];
    withLoc.forEach(r => {
      let lat = parseFloat(r.Latitude), lng = parseFloat(r.Longitude);
      let marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`
        <b>${escapeHtml(r.MaktabName)}</b><br>
        ${escapeHtml(r.Tehsil)}, ${escapeHtml(r.District)}<br>
        Students: ${r.TotalStudents||0} | Teachers: ${r.TotalTeachers||0}<br>
        Status: ${escapeHtml(r.Status)}
      `);
      bounds.push([lat, lng]);
    });
    if (bounds.length) map.fitBounds(bounds, { padding: [30,30] });

    setTimeout(() => map.invalidateSize(), 200);

    if (!withLoc.length) {
      document.getElementById("mapListWrap").innerHTML = `<div class="empty-state"><div class="glyph">🗺️</div>کسی مکتب کا مقام نقشے پر سیٹ نہیں کیا گیا۔</div>`;
      return;
    }

    document.getElementById("mapListWrap").innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Maktab</th><th>Tehsil</th><th>District</th><th>Coordinates</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${withLoc.map(r => `
              <tr>
                <td><b>${escapeHtml(r.MaktabName)}</b></td>
                <td>${escapeHtml(r.Tehsil)}</td>
                <td>${escapeHtml(r.District)}</td>
                <td>${r.Latitude}, ${r.Longitude}</td>
                <td>${statusBadge(r.Status)}</td>
                <td><a href="https://www.google.com/maps?q=${r.Latitude},${r.Longitude}" target="_blank" class="btn btn-outline btn-sm">Open in Maps</a></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  }).catch(() => {
    document.getElementById("mapListWrap").innerHTML = `<div class="empty-state">Connection error.</div>`;
  });
}

/* ====================================================================
 * USERS (Admin only)
 * ==================================================================== */
function renderUsers() {
  let content = document.getElementById("pageContent");
  content.innerHTML = `
    <div class="topbar">
      <div>
        <h1>صارفین کا انتظام</h1>
        <div class="sub">User Management &mdash; Admin / Supervisor / Teacher accounts</div>
      </div>
      <button class="btn btn-gold btn-sm" onclick="openUserForm()">+ نیا صارف شامل کریں</button>
    </div>
    <div class="panel">
      <div class="panel-header"><h3>تمام صارفین (All Users)</h3></div>
      <div id="userTableWrap">${loadingHTML("Loading...")}</div>
    </div>
    <div id="userFormPanel"></div>
  `;
  loadUsers();
}

function loadUsers() {
  Promise.all([api("getUsers", {}, "GET"), api("getMaktabs", {}, "GET")]).then(([uRes, mRes]) => {
    if (!uRes.success) { document.getElementById("userTableWrap").innerHTML = `<div class="empty-state">Error.</div>`; return; }
    cache.users = uRes.rows;
    cache.maktabs = mRes.success ? mRes.rows : [];
    renderUserTable(uRes.rows);
  }).catch(() => {
    document.getElementById("userTableWrap").innerHTML = `<div class="empty-state">Connection error.</div>`;
  });
}

function renderUserTable(rows) {
  let wrap = document.getElementById("userTableWrap");
  if (!rows.length) { wrap.innerHTML = `<div class="empty-state">کوئی صارف موجود نہیں۔</div>`; return; }
  let rowsHtml = rows.map(r => `
    <tr>
      <td><b>${escapeHtml(r.Username)}</b></td>
      <td>${escapeHtml(r.Name)}</td>
      <td>${escapeHtml(r.Role)}</td>
      <td>${escapeHtml(r.AssignedMaktab)}</td>
      <td>${escapeHtml(r.Phone)}</td>
      <td>${statusBadge(r.Status)}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openUserForm('${escapeHtml(r.Username)}')">Edit</button>
        <button class="btn btn-sm" style="margin-left:6px;background:var(--red);color:#fff;" onclick="deleteUser('${escapeHtml(r.Username)}')">Del</button>
      </td>
    </tr>`).join("");

  wrap.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Assigned Maktab</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}

function openUserForm(username) {
  let record = username ? cache.users.find(u => u.Username === username) : null;
  let isEdit = !!record;
  let r = record || {};

  let maktabOptions = cache.maktabs.map(m =>
    `<option value="${escapeHtml(m.MaktabName)}" ${r.AssignedMaktab===m.MaktabName?'selected':''}>${escapeHtml(m.MaktabName)}</option>`
  ).join("");

  document.getElementById("userFormPanel").innerHTML = `
    <div class="panel">
      <div class="panel-header"><h3>${isEdit ? "صارف میں ترمیم" : "نیا صارف شامل کریں"}</h3></div>
      <div class="form-grid">
        <div class="field"><label>یوزر نیم (Username) *</label><input id="us_username" value="${escapeHtml(r.Username||'')}" ${isEdit ? 'readonly style="background:#f0f0f0;"' : ''}></div>
        <div class="field"><label>پاس ورڈ (Password) ${isEdit ? '(blank = no change)' : '*'}</label><input id="us_password" type="text" placeholder="${isEdit ? 'leave blank to keep current' : ''}"></div>
        <div class="field"><label>نام (Full Name)</label><input id="us_name" value="${escapeHtml(r.Name||'')}"></div>
        <div class="field"><label>کردار (Role)</label>
          <select id="us_role">
            <option value="Admin" ${r.Role==='Admin'?'selected':''}>Admin</option>
            <option value="Supervisor" ${r.Role==='Supervisor'?'selected':''}>Supervisor</option>
            <option value="Teacher" ${r.Role==='Teacher'?'selected':''}>Teacher</option>
          </select>
        </div>
        <div class="field"><label>متعلقہ مکتب (Assigned Maktab)</label>
          <select id="us_maktab"><option value="All">All</option>${maktabOptions}</select>
        </div>
        <div class="field"><label>فون (Phone)</label><input id="us_phone" value="${escapeHtml(r.Phone||'')}"></div>
        <div class="field"><label>حیثیت (Status)</label>
          <select id="us_status">
            <option value="Active" ${r.Status==='Active'?'selected':''}>Active</option>
            <option value="Inactive" ${r.Status==='Inactive'?'selected':''}>Inactive</option>
          </select>
        </div>
      </div>
      <div style="margin-top:18px; display:flex; gap:10px;">
        <button class="btn btn-gold btn-sm" onclick="saveUser(${isEdit})">محفوظ کریں (Save) <span id="usSaveSpin"></span></button>
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('userFormPanel').innerHTML=''">منسوخ (Cancel)</button>
      </div>
    </div>
  `;
  document.getElementById("userFormPanel").scrollIntoView({ behavior: "smooth" });
}

function saveUser(isEdit) {
  let spin = document.getElementById("usSaveSpin");
  let username = document.getElementById("us_username").value.trim();
  let password = document.getElementById("us_password").value;
  if (!username) { toast("Username zaroori hai.", "error"); return; }
  if (!isEdit && !password) { toast("Naye user ke liye password zaroori hai.", "error"); return; }

  let payload = {
    Username: username,
    Name: document.getElementById("us_name").value,
    Role: document.getElementById("us_role").value,
    AssignedMaktab: document.getElementById("us_maktab").value,
    Phone: document.getElementById("us_phone").value,
    Status: document.getElementById("us_status").value
  };
  if (password) payload.Password = password;

  spin.innerHTML = '<span class="spinner"></span>';

  if (isEdit) {
    // updateUser uses ID field as identifier per generic CRUD - but Users sheet has Username as key, not ID
    payload.ID = username; // generic updateRow looks for "ID" column; Users sheet doesn't have one
    updateUserCustom(payload, spin);
  } else {
    if (!password) payload.Password = "";
    api("addUser", payload).then(res => {
      spin.innerHTML = "";
      if (res.success) { toast("User add ho gaya.", "success"); document.getElementById("userFormPanel").innerHTML=""; loadUsers(); }
      else toast(res.message || "Error.", "error");
    }).catch(() => { spin.innerHTML=""; toast("Connection error.", "error"); });
  }
}

// Users sheet doesn't have ID column - use a dedicated update via addUser fallback isn't ideal,
// but generic updateRow requires "ID". Since Users sheet header has no "ID", updateRow will fail.
// Workaround: delete + re-add isn't safe either. So: this requires Username-based update support
// in the backend's updateRow - it already checks headers.indexOf("ID") which is -1 for Users.
// To support Users sheet update properly, we pass Username as identifier via a small tweak below.
function updateUserCustom(payload, spin) {
  payload.username_key = payload.Username;
  api("updateUser", payload).then(res => {
    spin.innerHTML = "";
    if (res.success) { toast("User update ho gaya.", "success"); document.getElementById("userFormPanel").innerHTML=""; loadUsers(); }
    else toast(res.message || "Error.", "error");
  }).catch(() => { spin.innerHTML=""; toast("Connection error.", "error"); });
}

function deleteUser(username) {
  if (!confirm("Kya aap waqai is user ko delete karna chahte hain?")) return;
  api("deleteUser", { ID: username, username_key: username }).then(res => {
    if (res.success) { toast(res.message || "Deleted.", "success"); loadUsers(); }
    else toast(res.message || "Error.", "error");
  });
}
