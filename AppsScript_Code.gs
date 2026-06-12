/***********************************************************************
 * ISRA QURAN ACADEMY PORTAL - BACKEND (Google Apps Script)
 * ---------------------------------------------------------------------
 * SETUP STEPS:
 * 1. Google Sheet kholen jo backend ke taur pe use karna hai.
 * 2. Extensions > Apps Script kholein.
 * 3. Is poori file ka code paste karein (Code.gs me).
 * 4. Sheet me neeche diye gaye SHEET NAMES ke mutabiq tabs banayen:
 *      - Users
 *      - Maktabs
 *      - Teachers
 *      - Students
 * 5. Har sheet ki HEADER ROW (row 1) neeche diye gaye columns ke
 *    mutabiq honi chahiye (order important hai).
 * 6. Deploy > New deployment > Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 7. Deployment URL copy karke config.js me SCRIPT_URL me daalein.
 * 8. Users sheet me kam az kam 1 admin row manually daal dein
 *    (Sample data Setup_CreateSheets() function se ho jayega).
 *
 * SHEET STRUCTURES:
 * ---------------------------------------------------------------------
 * Users:
 *   Username | Password | Role (Admin/Supervisor/Teacher) | Name |
 *   AssignedMaktab | Phone | Status (Active/Inactive)
 *
 * Maktabs:
 *   ID | MaktabName | RunningCourses | FullAddress | UC | Tehsil |
 *   District | Latitude | Longitude | StartDate | Capacity |
 *   TotalStudents | Boys | Girls | HeadName | HeadContact |
 *   HeadWhatsApp | TotalTeachers | Status | Remarks |
 *   CreatedBy | CreatedAt
 *
 * Teachers:
 *   ID | Name | Designation | FatherName | CNIC | DOB | Gender |
 *   Tehsil | District | Address | Qualification | Certification |
 *   Experience | DateOfAppointment | Phone | Salary | SalaryType |
 *   Status | MaktabID | CreatedBy | CreatedAt
 *
 * Students:
 *   ID | Name | FatherName | FatherCNIC | FatherPhone | DOB | Gender |
 *   Address | DateOfAdmission | CourseDetails | CurrentLevel |
 *   Attendance | SchoolGoing | SchoolDetails | Status | MaktabID |
 *   TeacherName | CreatedBy | CreatedAt
 ***********************************************************************/

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    // Merge GET and POST params (GET params always available in e.parameter)
    var params = e.parameter || {};
    // If POST body has form params, merge them (fallback)
    if (e.postData && e.postData.contents) {
      try {
        var postParams = {};
        e.postData.contents.split("&").forEach(function(pair) {
          var kv = pair.split("=");
          if (kv.length === 2) postParams[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1].replace(/\+/g, " "));
        });
        for (var k in postParams) { if (!params[k]) params[k] = postParams[k]; }
      } catch(ex) {}
    }
    var action = params.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var result;

    switch (action) {
      case "login":
        result = login(ss, params);
        break;
      case "getMaktabs":
        result = getSheetData(ss, "Maktabs", params);
        break;
      case "addMaktab":
        result = addRow(ss, "Maktabs", params);
        break;
      case "updateMaktab":
        result = updateRow(ss, "Maktabs", params);
        break;
      case "deleteMaktab":
        result = deleteRow(ss, "Maktabs", params);
        break;

      case "getTeachers":
        result = getSheetData(ss, "Teachers", params);
        break;
      case "addTeacher":
        result = addRow(ss, "Teachers", params);
        break;
      case "updateTeacher":
        result = updateRow(ss, "Teachers", params);
        break;
      case "deleteTeacher":
        result = deleteRow(ss, "Teachers", params);
        break;

      case "getStudents":
        result = getSheetData(ss, "Students", params);
        break;
      case "addStudent":
        result = addRow(ss, "Students", params);
        break;
      case "updateStudent":
        result = updateRow(ss, "Students", params);
        break;
      case "deleteStudent":
        result = deleteRow(ss, "Students", params);
        break;

      case "getUsers":
        result = getSheetData(ss, "Users", params);
        break;
      case "addUser":
        result = addUserRow(ss, params);
        break;
      case "updateUser":
        result = updateUserRow(ss, params);
        break;
      case "deleteUser":
        result = deleteUserRow(ss, params);
        break;

      case "getDashboard":
        result = getDashboard(ss, params);
        break;

      default:
        result = { success: false, message: "Unknown action: " + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, message: "Server error: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/* ---------------------- AUTH ---------------------- */
function login(ss, params) {
  var sheet = ss.getSheetByName("Users");
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[0]).trim() === String(params.username).trim() &&
        String(row[1]).trim() === String(params.password).trim()) {
      if (String(row[6]).trim().toLowerCase() === "inactive") {
        return { success: false, message: "Account inactive hai. Admin se contact karein." };
      }
      var user = {};
      for (var j = 0; j < headers.length; j++) {
        if (headers[j] !== "Password") user[headers[j]] = row[j];
      }
      return { success: true, user: user };
    }
  }
  return { success: false, message: "Username ya password ghalat hai." };
}

/* ---------------------- GENERIC CRUD ---------------------- */
function getSheetData(ss, sheetName, params) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: sheetName + " sheet nahi mili." };
  var data = sheet.getDataRange().getValues();
  if (data.length === 0) return { success: true, rows: [] };
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i].join("") === "") continue; // skip empty rows
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    obj["_row"] = i + 1; // sheet row number for update/delete
    rows.push(obj);
  }
  return { success: true, rows: rows };
}

function addRow(ss, sheetName, params) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: sheetName + " sheet nahi mili." };
  var headers = sheet.getDataRange().getValues()[0];

  var id = generateId(sheet, headers);
  var newRow = headers.map(function(h) {
    if (h === "ID") return id;
    if (h === "CreatedAt") return new Date();
    return params[h] !== undefined ? params[h] : "";
  });
  sheet.appendRow(newRow);
  return { success: true, message: "Record add ho gaya.", id: id };
}

function updateRow(ss, sheetName, params) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: sheetName + " sheet nahi mili." };
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idCol = headers.indexOf("ID");

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(params.ID || params.id)) {
      for (var j = 0; j < headers.length; j++) {
        var h = headers[j];
        if (h === "ID" || h === "CreatedAt" || h === "CreatedBy") continue;
        if (params[h] !== undefined) {
          sheet.getRange(i + 1, j + 1).setValue(params[h]);
        }
      }
      return { success: true, message: "Record update ho gaya." };
    }
  }
  return { success: false, message: "Record nahi mila." };
}

function deleteRow(ss, sheetName, params) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: sheetName + " sheet nahi mili." };
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idCol = headers.indexOf("ID");

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(params.ID || params.id)) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Record delete ho gaya." };
    }
  }
  return { success: false, message: "Record nahi mila." };
}

function generateId(sheet, headers) {
  var data = sheet.getDataRange().getValues();
  var idCol = headers.indexOf("ID");
  var max = 0;
  for (var i = 1; i < data.length; i++) {
    var v = parseInt(data[i][idCol]);
    if (!isNaN(v) && v > max) max = v;
  }
  return max + 1;
}

/* ---------------------- USERS CRUD (keyed by Username) ---------------------- */
function addUserRow(ss, params) {
  var sheet = ss.getSheetByName("Users");
  if (!sheet) return { success: false, message: "Users sheet nahi mili." };
  var headers = sheet.getDataRange().getValues()[0];
  var data = sheet.getDataRange().getValues();

  // check duplicate
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(params.Username).trim()) {
      return { success: false, message: "Ye username pehle se mojood hai." };
    }
  }
  var newRow = headers.map(function(h) { return params[h] !== undefined ? params[h] : ""; });
  sheet.appendRow(newRow);
  return { success: true, message: "User add ho gaya." };
}

function updateUserRow(ss, params) {
  var sheet = ss.getSheetByName("Users");
  if (!sheet) return { success: false, message: "Users sheet nahi mili." };
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var key = params.username_key || params.Username;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(key).trim()) {
      for (var j = 0; j < headers.length; j++) {
        var h = headers[j];
        if (h === "Username") continue;
        if (h === "Password" && (!params.Password || params.Password === "")) continue; // skip blank password
        if (params[h] !== undefined) {
          sheet.getRange(i + 1, j + 1).setValue(params[h]);
        }
      }
      return { success: true, message: "User update ho gaya." };
    }
  }
  return { success: false, message: "User nahi mila." };
}

function deleteUserRow(ss, params) {
  var sheet = ss.getSheetByName("Users");
  if (!sheet) return { success: false, message: "Users sheet nahi mili." };
  var data = sheet.getDataRange().getValues();
  var key = params.username_key || params.ID || params.Username;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(key).trim()) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "User delete ho gaya." };
    }
  }
  return { success: false, message: "User nahi mila." };
}


function getDashboard(ss, params) {
  var maktabs = ss.getSheetByName("Maktabs").getDataRange().getValues();
  var teachers = ss.getSheetByName("Teachers").getDataRange().getValues();
  var students = ss.getSheetByName("Students").getDataRange().getValues();

  var mHeaders = maktabs[0], tHeaders = teachers[0], sHeaders = students[0];
  var totalMaktabs = 0, activeMaktabs = 0, totalStudents = 0, boys = 0, girls = 0;
  var totalTeachers = 0, activeTeachers = 0;
  var districtCounts = {};

  for (var i = 1; i < maktabs.length; i++) {
    if (maktabs[i].join("") === "") continue;
    totalMaktabs++;
    var statusIdx = mHeaders.indexOf("Status");
    var distIdx = mHeaders.indexOf("District");
    if (String(maktabs[i][statusIdx]).toLowerCase() === "active") activeMaktabs++;
    var dist = maktabs[i][distIdx] || "Unknown";
    districtCounts[dist] = (districtCounts[dist] || 0) + 1;
  }

  for (var i = 1; i < teachers.length; i++) {
    if (teachers[i].join("") === "") continue;
    totalTeachers++;
    var sIdx = tHeaders.indexOf("Status");
    if (String(teachers[i][sIdx]).toLowerCase() === "active") activeTeachers++;
  }

  for (var i = 1; i < students.length; i++) {
    if (students[i].join("") === "") continue;
    totalStudents++;
    var gIdx = sHeaders.indexOf("Gender");
    var g = String(students[i][gIdx]).toLowerCase();
    if (g.indexOf("f") === 0 || g.indexOf("girl") === 0) girls++;
    else boys++;
  }

  return {
    success: true,
    totalMaktabs: totalMaktabs,
    activeMaktabs: activeMaktabs,
    totalStudents: totalStudents,
    boys: boys,
    girls: girls,
    totalTeachers: totalTeachers,
    activeTeachers: activeTeachers,
    districtCounts: districtCounts
  };
}

/* ---------------------- ONE-TIME SETUP HELPER ---------------------- */
/* Run this function ONCE manually from Apps Script editor (select
   "Setup_CreateSheets" from dropdown, click Run). It creates all
   required sheets with correct headers + 1 sample admin user. */
function Setup_CreateSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var sheets = {
    "Users": ["Username","Password","Role","Name","AssignedMaktab","Phone","Status"],
    "Maktabs": ["ID","MaktabName","RunningCourses","FullAddress","UC","Tehsil","District","Latitude","Longitude","StartDate","Capacity","TotalStudents","Boys","Girls","HeadName","HeadContact","HeadWhatsApp","TotalTeachers","Status","Remarks","CreatedBy","CreatedAt"],
    "Teachers": ["ID","Name","Designation","FatherName","CNIC","DOB","Gender","Tehsil","District","Address","Qualification","Certification","Experience","DateOfAppointment","Phone","Salary","SalaryType","Status","MaktabID","CreatedBy","CreatedAt"],
    "Students": ["ID","Name","FatherName","FatherCNIC","FatherPhone","DOB","Gender","Address","DateOfAdmission","CourseDetails","CurrentLevel","Attendance","SchoolGoing","SchoolDetails","Status","MaktabID","TeacherName","CreatedBy","CreatedAt"]
  };

  for (var name in sheets) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    sheet.clear();
    sheet.appendRow(sheets[name]);
    sheet.getRange(1,1,1,sheets[name].length).setFontWeight("bold").setBackground("#0F4C5C").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }

  // Sample admin user - CHANGE PASSWORD AFTER FIRST LOGIN
  var usersSheet = ss.getSheetByName("Users");
  if (usersSheet.getDataRange().getNumRows() === 1) {
    usersSheet.appendRow(["admin", "admin123", "Admin", "Administrator", "All", "", "Active"]);
  }

  // remove default Sheet1 if empty
  var def = ss.getSheetByName("Sheet1");
  if (def && def.getDataRange().getNumRows() <= 1 && def.getDataRange().getNumColumns() <=1) {
    ss.deleteSheet(def);
  }
}
