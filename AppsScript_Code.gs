/***********************************************************************
 * ISRA QURAN ACADEMY PORTAL — Backend v4.0
 * Sheets: Users, Maktabs, Teachers, Students, Hadith, Logs
 ***********************************************************************/

function doGet(e)  { return handleReq(e); }
function doPost(e) { return handleReq(e); }

function handleReq(e) {
  try {
    var p = e.parameter || {};
    // Merge POST body
    if (e.postData && e.postData.contents) {
      try {
        e.postData.contents.split('&').forEach(function(pair) {
          var kv = pair.split('=');
          if (kv.length >= 2) {
            var k = decodeURIComponent(kv[0]);
            var v = decodeURIComponent(kv.slice(1).join('=').replace(/\+/g,' '));
            if (!p[k]) p[k] = v;
          }
        });
      } catch(ex) {}
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = p.action;
    var result;

    switch(action) {
      case 'login':          result = doLogin(ss, p);                    break;
      case 'getMaktabs':     result = getRows(ss, 'Maktabs', p);         break;
      case 'addMaktab':      result = addRow(ss, 'Maktabs', p);          break;
      case 'updateMaktab':   result = updateRow(ss, 'Maktabs', p);       break;
      case 'deleteMaktab':   result = deleteRow(ss, 'Maktabs', p);       break;
      case 'getTeachers':    result = getRows(ss, 'Teachers', p);        break;
      case 'addTeacher':     result = addRow(ss, 'Teachers', p);         break;
      case 'updateTeacher':  result = updateRow(ss, 'Teachers', p);      break;
      case 'deleteTeacher':  result = deleteRow(ss, 'Teachers', p);      break;
      case 'getStudents':    result = getRows(ss, 'Students', p);        break;
      case 'addStudent':     result = addRow(ss, 'Students', p);         break;
      case 'updateStudent':  result = updateRow(ss, 'Students', p);      break;
      case 'deleteStudent':  result = deleteRow(ss, 'Students', p);      break;
      case 'getUsers':       result = getRows(ss, 'Users', p);           break;
      case 'addUser':        result = addUserRow(ss, p);                 break;
      case 'updateUser':     result = updateUserRow(ss, p);              break;
      case 'deleteUser':     result = deleteUserRow(ss, p);              break;
      case 'getLogs':        result = getRows(ss, 'Logs', p);            break;
      case 'addLog':         result = addLogRow(ss, p);                  break;
      case 'getHadith':      result = getHadith(ss, p);                  break;
      default: result = { success: false, message: 'Unknown action: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, message: 'Server error: ' + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/* ===== AUTH ===== */
function doLogin(ss, p) {
  var sheet = ss.getSheetByName('Users');
  if (!sheet) return { success: false, message: 'Users sheet not found.' };
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row.join('') === '') continue;
    if (String(row[0]).trim().toLowerCase() === String(p.username||'').trim().toLowerCase()
     && String(row[1]).trim() === String(p.password||'').trim()) {
      if (String(row[6]).trim().toLowerCase() === 'inactive')
        return { success: false, message: 'Account inactive. Contact admin.' };
      var user = {};
      for (var j = 0; j < headers.length; j++) {
        if (headers[j] !== 'Password') user[headers[j]] = row[j];
      }
      return { success: true, user: user };
    }
  }
  return { success: false, message: 'Wrong username or password.' };
}

/* ===== GENERIC GET ===== */
function getRows(ss, sheetName, p) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: sheetName + ' sheet not found.' };
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, rows: [] };
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i].join('') === '') continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j] instanceof Date
        ? Utilities.formatDate(data[i][j], Session.getScriptTimeZone(), 'yyyy-MM-dd')
        : data[i][j];
    }
    rows.push(obj);
  }
  return { success: true, rows: rows };
}

/* ===== GENERIC ADD ===== */
function addRow(ss, sheetName, p) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: sheetName + ' sheet not found.' };
  var headers = sheet.getDataRange().getValues()[0];
  var id = getNextId(sheet, headers);
  var newRow = headers.map(function(h) {
    if (h === 'ID')        return id;
    if (h === 'CreatedAt') return new Date();
    return p[h] !== undefined ? p[h] : '';
  });
  sheet.appendRow(newRow);
  return { success: true, message: 'Row added.', id: id };
}

/* ===== GENERIC UPDATE ===== */
function updateRow(ss, sheetName, p) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: sheetName + ' sheet not found.' };
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idCol = headers.indexOf('ID');
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(p.ID || p.id)) {
      for (var j = 0; j < headers.length; j++) {
        var h = headers[j];
        if (h === 'ID' || h === 'CreatedAt' || h === 'CreatedBy') continue;
        if (p[h] !== undefined) sheet.getRange(i+1, j+1).setValue(p[h]);
      }
      return { success: true, message: 'Row updated.' };
    }
  }
  return { success: false, message: 'Record not found.' };
}

/* ===== GENERIC DELETE ===== */
function deleteRow(ss, sheetName, p) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: sheetName + ' sheet not found.' };
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idCol = headers.indexOf('ID');
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(p.ID || p.id)) {
      sheet.deleteRow(i+1);
      return { success: true, message: 'Row deleted.' };
    }
  }
  return { success: false, message: 'Record not found.' };
}

function getNextId(sheet, headers) {
  var data = sheet.getDataRange().getValues();
  var idCol = headers.indexOf('ID');
  var max = 0;
  for (var i = 1; i < data.length; i++) {
    var v = parseInt(data[i][idCol]);
    if (!isNaN(v) && v > max) max = v;
  }
  return max + 1;
}

/* ===== USERS CRUD (keyed by Username) ===== */
function addUserRow(ss, p) {
  var sheet = ss.getSheetByName('Users');
  if (!sheet) return { success: false, message: 'Users sheet not found.' };
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  // Check duplicate
  for (var i = 1; i < data.length; i++) {
    if (data[i].join('') === '') continue;
    if (String(data[i][0]).trim().toLowerCase() === String(p.Username||'').trim().toLowerCase())
      return { success: false, message: 'Username already exists.' };
  }
  var newRow = headers.map(function(h) { return p[h] !== undefined ? p[h] : ''; });
  sheet.appendRow(newRow);
  return { success: true, message: 'User added.' };
}

function updateUserRow(ss, p) {
  var sheet = ss.getSheetByName('Users');
  if (!sheet) return { success: false, message: 'Users sheet not found.' };
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var key = String(p.username_key || p.Username || '').trim().toLowerCase();
  for (var i = 1; i < data.length; i++) {
    if (data[i].join('') === '') continue;
    if (String(data[i][0]).trim().toLowerCase() === key) {
      for (var j = 0; j < headers.length; j++) {
        var h = headers[j];
        if (h === 'Username') continue;
        if (h === 'Password' && (!p.Password || p.Password === '')) continue;
        if (p[h] !== undefined) sheet.getRange(i+1, j+1).setValue(p[h]);
      }
      return { success: true, message: 'User updated.' };
    }
  }
  return { success: false, message: 'User not found.' };
}

function deleteUserRow(ss, p) {
  var sheet = ss.getSheetByName('Users');
  if (!sheet) return { success: false, message: 'Users sheet not found.' };
  var data = sheet.getDataRange().getValues();
  var key = String(p.username_key || p.ID || p.Username || '').trim().toLowerCase();
  for (var i = 1; i < data.length; i++) {
    if (data[i].join('') === '') continue;
    if (String(data[i][0]).trim().toLowerCase() === key) {
      sheet.deleteRow(i+1);
      return { success: true, message: 'User deleted.' };
    }
  }
  return { success: false, message: 'User not found.' };
}

/* ===== LOGS ===== */
function addLogRow(ss, p) {
  var sheet = ss.getSheetByName('Logs');
  if (!sheet) return { success: false, message: 'Logs sheet not found.' };
  var headers = sheet.getDataRange().getValues()[0];
  var newRow = headers.map(function(h) {
    if (h === 'time') return new Date();
    return p[h] !== undefined ? p[h] : '';
  });
  sheet.appendRow(newRow);
  return { success: true };
}

/* ===== HADITH ===== */
function getHadith(ss, p) {
  var sheet = ss.getSheetByName('Hadith');
  if (!sheet) return { success: false, message: 'Hadith sheet not found.' };
  var data = sheet.getDataRange().getValues();
  var today = p.date || '';
  for (var i = 1; i < data.length; i++) {
    if (data[i].join('') === '') continue;
    var d = '';
    try { d = Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), 'yyyy-MM-dd'); } catch(e) { d = String(data[i][0]); }
    if (d === today) return { success: true, hadith: { text: data[i][1], source: data[i][2] } };
  }
  if (data.length > 1) {
    var last = data[data.length - 1];
    return { success: true, hadith: { text: last[1], source: last[2] } };
  }
  return { success: false };
}

/* ===== ONE-TIME SETUP ===== */
function Setup_CreateSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var defs = {
    'Users':    ['Username','Password','Role','Name','AssignedMaktab','Phone','Status'],
    'Maktabs':  ['ID','MaktabName','RunningCourses','FullAddress','UC','Tehsil','District',
                 'Latitude','Longitude','StartDate','Capacity','TotalStudents','Boys','Girls',
                 'HeadName','HeadContact','HeadWhatsApp','TotalTeachers','Status','Remarks',
                 'SupervisorID','SupervisorName','CreatedBy','CreatedAt'],
    'Teachers': ['ID','Name','Designation','FatherName','CNIC','DOB','Gender','Tehsil','District',
                 'Address','Qualification','Certification','Experience','DateOfAppointment',
                 'Phone','Salary','SalaryType','Status','MaktabID','SupervisorID','SupervisorName',
                 'CreatedBy','CreatedAt'],
    'Students': ['ID','Name','FatherName','FatherCNIC','FatherPhone','DOB','Gender','Address',
                 'DateOfAdmission','CourseDetails','CurrentLevel','Attendance','SchoolGoing',
                 'SchoolDetails','Status','MaktabID','TeacherName','CreatedBy','CreatedAt'],
    'Hadith':   ['Date','Text','Source'],
    'Logs':     ['time','user','role','action','detail'],
  };

  for (var name in defs) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    sheet.clear();
    sheet.appendRow(defs[name]);
    sheet.getRange(1, 1, 1, defs[name].length)
      .setFontWeight('bold').setBackground('#0d3d4a').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  // Sample admin
  var users = ss.getSheetByName('Users');
  if (users.getDataRange().getNumRows() === 1) {
    users.appendRow(['admin','admin123','Admin','Administrator','All','','Active']);
  }

  // Sample hadiths
  var hadith = ss.getSheetByName('Hadith');
  if (hadith.getDataRange().getNumRows() === 1) {
    var today = new Date();
    var h = [
      ['طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ','Sunan Ibn Majah'],
      ['خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ','Sahih Bukhari'],
      ['مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ','Sahih Muslim'],
      ['اقْرَؤُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ','Sahih Muslim'],
      ['إِنَّمَا الْعِلْمُ بِالتَّعَلُّمِ وَإِنَّمَا الْحِلْمُ بِالتَّحَلُّمِ','Silsila Sahiha'],
    ];
    h.forEach(function(row, idx) {
      var d = new Date(today);
      d.setDate(today.getDate() + idx);
      hadith.appendRow([Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd'), row[0], row[1]]);
    });
  }

  // Remove Sheet1 if empty
  try {
    var def = ss.getSheetByName('Sheet1');
    if (def && def.getDataRange().getNumRows() <= 1) ss.deleteSheet(def);
  } catch(e) {}

  SpreadsheetApp.getUi().alert(
    '✅ Setup Complete!\n\n' +
    'Sheets created: Users, Maktabs, Teachers, Students, Hadith, Logs\n\n' +
    'Admin login:\n  Username: admin\n  Password: admin123\n\n' +
    '⚠️ Please change password after first login!'
  );
}
