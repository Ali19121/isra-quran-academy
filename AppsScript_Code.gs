/***********************************************************************
 * ISRA QURAN ACADEMY PORTAL - BACKEND v2.0 (Google Apps Script)
 * ------------------------------------------------------------------
 * Sheet structures:
 * Users:    Username|Password|Role|Name|AssignedMaktab|Phone|Status
 * Maktabs:  ID|MaktabName|RunningCourses|FullAddress|UC|Tehsil|District|
 *           Latitude|Longitude|StartDate|Capacity|TotalStudents|Boys|Girls|
 *           HeadName|HeadContact|HeadWhatsApp|TotalTeachers|Status|Remarks|
 *           CreatedBy|CreatedAt
 * Teachers: ID|Name|Designation|FatherName|CNIC|DOB|Gender|Tehsil|District|
 *           Address|Qualification|Certification|Experience|DateOfAppointment|
 *           Phone|Salary|SalaryType|Status|MaktabID|SupervisorID|SupervisorName|
 *           CreatedBy|CreatedAt
 * Students: ID|Name|FatherName|FatherCNIC|FatherPhone|DOB|Gender|Address|
 *           DateOfAdmission|CourseDetails|CurrentLevel|Attendance|SchoolGoing|
 *           SchoolDetails|Status|MaktabID|TeacherName|CreatedBy|CreatedAt
 * Hadith:   Date|Text|Source   (optional — for daily hadith scheduling)
 ***********************************************************************/

function doGet(e)  { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  try {
    var params = e.parameter || {};
    // Merge POST body if present
    if (e.postData && e.postData.contents) {
      try {
        e.postData.contents.split('&').forEach(function(pair) {
          var kv = pair.split('=');
          if (kv.length >= 2) {
            var k = decodeURIComponent(kv[0]);
            var v = decodeURIComponent(kv.slice(1).join('=').replace(/\+/g,' '));
            if (!params[k]) params[k] = v;
          }
        });
      } catch(ex) {}
    }

    var action = params.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var result;

    switch (action) {
      case 'login':         result = login(ss, params);                    break;
      case 'getMaktabs':    result = getSheetData(ss, 'Maktabs', params);  break;
      case 'addMaktab':     result = addRow(ss, 'Maktabs', params);        break;
      case 'updateMaktab':  result = updateRow(ss, 'Maktabs', params);     break;
      case 'deleteMaktab':  result = deleteRow(ss, 'Maktabs', params);     break;
      case 'getTeachers':   result = getSheetData(ss, 'Teachers', params); break;
      case 'addTeacher':    result = addRow(ss, 'Teachers', params);       break;
      case 'updateTeacher': result = updateRow(ss, 'Teachers', params);    break;
      case 'deleteTeacher': result = deleteRow(ss, 'Teachers', params);    break;
      case 'getStudents':   result = getSheetData(ss, 'Students', params); break;
      case 'addStudent':    result = addRow(ss, 'Students', params);       break;
      case 'updateStudent': result = updateRow(ss, 'Students', params);    break;
      case 'deleteStudent': result = deleteRow(ss, 'Students', params);    break;
      case 'getUsers':      result = getSheetData(ss, 'Users', params);    break;
      case 'addUser':       result = addUserRow(ss, params);               break;
      case 'updateUser':    result = updateUserRow(ss, params);            break;
      case 'deleteUser':    result = deleteUserRow(ss, params);            break;
      case 'getDashboard':  result = getDashboard(ss, params);             break;
      case 'getHadith':     result = getHadith(ss, params);                break;
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

/* ---- AUTH ---- */
function login(ss, params) {
  var sheet = ss.getSheetByName('Users');
  if (!sheet) return { success: false, message: 'Users sheet nahi mili.' };
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[0]).trim().toLowerCase() === String(params.username).trim().toLowerCase() &&
        String(row[1]).trim() === String(params.password).trim()) {
      if (String(row[6]).trim().toLowerCase() === 'inactive')
        return { success: false, message: 'Account inactive hai. Admin se contact karein.' };
      var user = {};
      for (var j = 0; j < headers.length; j++) {
        if (headers[j] !== 'Password') user[headers[j]] = row[j];
      }
      return { success: true, user: user };
    }
  }
  return { success: false, message: 'Username ya password ghalat hai.' };
}

/* ---- GENERIC CRUD ---- */
function getSheetData(ss, sheetName, params) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: sheetName + ' sheet nahi mili.' };
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, rows: [] };
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i].join('') === '') continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    obj['_row'] = i + 1;
    rows.push(obj);
  }
  return { success: true, rows: rows };
}

function addRow(ss, sheetName, params) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: sheetName + ' sheet nahi mili.' };
  var headers = sheet.getDataRange().getValues()[0];
  var id = generateId(sheet, headers);
  var newRow = headers.map(function(h) {
    if (h === 'ID') return id;
    if (h === 'CreatedAt') return new Date();
    return params[h] !== undefined ? params[h] : '';
  });
  sheet.appendRow(newRow);
  return { success: true, message: 'Record add ho gaya.', id: id };
}

function updateRow(ss, sheetName, params) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: sheetName + ' sheet nahi mili.' };
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idCol = headers.indexOf('ID');
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(params.ID || params.id)) {
      for (var j = 0; j < headers.length; j++) {
        var h = headers[j];
        if (h === 'ID' || h === 'CreatedAt' || h === 'CreatedBy') continue;
        if (params[h] !== undefined) sheet.getRange(i+1, j+1).setValue(params[h]);
      }
      return { success: true, message: 'Record update ho gaya.' };
    }
  }
  return { success: false, message: 'Record nahi mila.' };
}

function deleteRow(ss, sheetName, params) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: sheetName + ' sheet nahi mili.' };
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idCol = headers.indexOf('ID');
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(params.ID || params.id)) {
      sheet.deleteRow(i+1);
      return { success: true, message: 'Record delete ho gaya.' };
    }
  }
  return { success: false, message: 'Record nahi mila.' };
}

function generateId(sheet, headers) {
  var data = sheet.getDataRange().getValues();
  var idCol = headers.indexOf('ID');
  var max = 0;
  for (var i = 1; i < data.length; i++) {
    var v = parseInt(data[i][idCol]);
    if (!isNaN(v) && v > max) max = v;
  }
  return max + 1;
}

/* ---- USERS CRUD (keyed by Username) ---- */
function addUserRow(ss, params) {
  var sheet = ss.getSheetByName('Users');
  if (!sheet) return { success: false, message: 'Users sheet nahi mili.' };
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === String(params.Username).trim().toLowerCase())
      return { success: false, message: 'Ye username pehle se mojood hai.' };
  }
  var newRow = headers.map(function(h) { return params[h] !== undefined ? params[h] : ''; });
  sheet.appendRow(newRow);
  return { success: true, message: 'User add ho gaya.' };
}

function updateUserRow(ss, params) {
  var sheet = ss.getSheetByName('Users');
  if (!sheet) return { success: false, message: 'Users sheet nahi mili.' };
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var key = params.username_key || params.Username;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === String(key).trim().toLowerCase()) {
      for (var j = 0; j < headers.length; j++) {
        var h = headers[j];
        if (h === 'Username') continue;
        if (h === 'Password' && (!params.Password || params.Password === '')) continue;
        if (params[h] !== undefined) sheet.getRange(i+1, j+1).setValue(params[h]);
      }
      return { success: true, message: 'User update ho gaya.' };
    }
  }
  return { success: false, message: 'User nahi mila.' };
}

function deleteUserRow(ss, params) {
  var sheet = ss.getSheetByName('Users');
  if (!sheet) return { success: false, message: 'Users sheet nahi mili.' };
  var data = sheet.getDataRange().getValues();
  var key = params.username_key || params.ID || params.Username;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === String(key).trim().toLowerCase()) {
      sheet.deleteRow(i+1);
      return { success: true, message: 'User delete ho gaya.' };
    }
  }
  return { success: false, message: 'User nahi mila.' };
}

/* ---- DASHBOARD ---- */
function getDashboard(ss, params) {
  var maktabs  = ss.getSheetByName('Maktabs').getDataRange().getValues();
  var teachers = ss.getSheetByName('Teachers').getDataRange().getValues();
  var students = ss.getSheetByName('Students').getDataRange().getValues();
  var mH = maktabs[0], tH = teachers[0], sH = students[0];

  var totalMaktabs=0, activeMaktabs=0, totalTeachers=0, activeTeachers=0;
  var totalStudents=0, boys=0, girls=0;
  var districtCounts = {};

  for (var i=1; i<maktabs.length; i++) {
    if (maktabs[i].join('')==='') continue;
    totalMaktabs++;
    var si = mH.indexOf('Status'), di = mH.indexOf('District');
    if (String(maktabs[i][si]).toLowerCase()==='active') activeMaktabs++;
    var dist = maktabs[i][di] || 'Unknown';
    districtCounts[dist] = (districtCounts[dist]||0)+1;
  }
  for (var i=1; i<teachers.length; i++) {
    if (teachers[i].join('')==='') continue;
    totalTeachers++;
    if (String(teachers[i][tH.indexOf('Status')]).toLowerCase()==='active') activeTeachers++;
  }
  for (var i=1; i<students.length; i++) {
    if (students[i].join('')==='') continue;
    totalStudents++;
    var g = String(students[i][sH.indexOf('Gender')]||'').toLowerCase();
    if (g.startsWith('f')) girls++; else boys++;
  }
  return { success:true, totalMaktabs:totalMaktabs, activeMaktabs:activeMaktabs,
    totalTeachers:totalTeachers, activeTeachers:activeTeachers,
    totalStudents:totalStudents, boys:boys, girls:girls, districtCounts:districtCounts };
}

/* ---- HADITH ---- */
function getHadith(ss, params) {
  var sheet = ss.getSheetByName('Hadith');
  if (!sheet) return { success: false, message: 'Hadith sheet nahi mili.' };
  var data = sheet.getDataRange().getValues();
  var today = params.date || '';
  // Find row matching today's date
  for (var i=1; i<data.length; i++) {
    if (data[i].join('')==='') continue;
    var rowDate = '';
    try { rowDate = new Date(data[i][0]).toISOString().split('T')[0]; } catch(e) { rowDate = String(data[i][0]); }
    if (rowDate === today) {
      return { success:true, hadith: { text: data[i][1], source: data[i][2] } };
    }
  }
  // Return latest if no date match
  if (data.length > 1) {
    var last = data[data.length-1];
    return { success:true, hadith: { text: last[1], source: last[2] } };
  }
  return { success: false, message: 'Koi hadith nahi mili.' };
}

/* ---- ONE-TIME SETUP ---- */
function Setup_CreateSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = {
    'Users':    ['Username','Password','Role','Name','AssignedMaktab','Phone','Status'],
    'Maktabs':  ['ID','MaktabName','RunningCourses','FullAddress','UC','Tehsil','District','Latitude','Longitude','StartDate','Capacity','TotalStudents','Boys','Girls','HeadName','HeadContact','HeadWhatsApp','TotalTeachers','Status','Remarks','CreatedBy','CreatedAt'],
    'Teachers': ['ID','Name','Designation','FatherName','CNIC','DOB','Gender','Tehsil','District','Address','Qualification','Certification','Experience','DateOfAppointment','Phone','Salary','SalaryType','Status','MaktabID','SupervisorID','SupervisorName','CreatedBy','CreatedAt'],
    'Students': ['ID','Name','FatherName','FatherCNIC','FatherPhone','DOB','Gender','Address','DateOfAdmission','CourseDetails','CurrentLevel','Attendance','SchoolGoing','SchoolDetails','Status','MaktabID','TeacherName','CreatedBy','CreatedAt'],
    'Hadith':   ['Date','Text','Source']
  };

  for (var name in sheets) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    sheet.clear();
    sheet.appendRow(sheets[name]);
    sheet.getRange(1,1,1,sheets[name].length)
      .setFontWeight('bold').setBackground('#0F4C5C').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  // Sample admin user
  var usersSheet = ss.getSheetByName('Users');
  if (usersSheet.getDataRange().getNumRows() === 1) {
    usersSheet.appendRow(['admin','admin123','Admin','Administrator','All','','Active']);
  }

  // Sample hadiths
  var hadithSheet = ss.getSheetByName('Hadith');
  if (hadithSheet.getDataRange().getNumRows() === 1) {
    var today = new Date();
    var hadiths = [
      ['خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ','(صحیح البخاری)'],
      ['طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ','(سنن ابن ماجہ)'],
      ['مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ','(صحیح مسلم)'],
      ['اقْرَؤُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ','(صحیح مسلم)'],
    ];
    hadiths.forEach(function(h, idx) {
      var d = new Date(today);
      d.setDate(today.getDate() + idx);
      hadithSheet.appendRow([Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd'), h[0], h[1]]);
    });
  }

  // Remove default Sheet1
  var def = ss.getSheetByName('Sheet1');
  if (def && def.getDataRange().getNumRows() <= 1) { try { ss.deleteSheet(def); } catch(e){} }

  SpreadsheetApp.getUi().alert('✓ Setup complete!\n\nSheets created: Users, Maktabs, Teachers, Students, Hadith\nAdmin login: admin / admin123\n\nPLEASE change password after first login!');
}
