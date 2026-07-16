# ISRA Quran Academy Portal

Maktab Management Portal — Students, Teachers, Maktabs, Map (Sindh/Pakistan), Google Sheets backend.

## Files
- `index.html` — main page
- `app.js` — saari app logic
- `config.js` — Apps Script URL (already filled with aap ka deployment URL)
- `AppsScript_Code.gs` — Google Sheet ke Apps Script me paste karne wala backend code
- `ISRA_QURAN_ACADEMY_LOGO.jpeg` — logo

## STEP 1 — Google Sheet Backend Setup

1. Apna Google Sheet kholein (jis ka URL already deploy kiya hua hai).
2. Top menu se **Extensions > Apps Script** kholein.
3. Jo bhi code pehle se hai usay select karke delete karein.
4. `AppsScript_Code.gs` ka **poora code copy-paste** karein.
5. Save karein (Ctrl+S).
6. Top dropdown se function select karein: **`Setup_CreateSheets`**
7. **Run** button dabayein (pehli baar permission allow karna padega — apna Google account select karke "Advanced > Go to project (unsafe) > Allow" karein).
8. Ye function automatically 4 sheets bana dega: `Users`, `Maktabs`, `Teachers`, `Students` — sahi columns ke saath.
9. Ek sample admin user bhi add ho jayega:
   - **Username:** `admin`
   - **Password:** `admin123`

   ⚠️ **Login ke baad ye password "Users" sheet me jaa kar change kar lein.**

## STEP 2 — Re-deploy Apps Script (agar code change kiya hai)

Aap ka deployment URL already config.js me hai:
```
https://script.google.com/macros/s/AKfycbzpCEPgE8KJyOUdIjRHWHiwwIRD1QPAnAprOhE2wtyIbIoK98yZKJO976CkI6_gaMzgpQ/exec
```

Agar `AppsScript_Code.gs` me future me changes karein, to:
1. Apps Script editor me **Deploy > Manage deployments**
2. Pencil (Edit) icon par click karein apne existing deployment par
3. Version: **New version** select karein
4. **Deploy** dabayein

(Naya URL nahi banega, purana URL hi kaam karta rahega — agar same deployment edit karein.)

## STEP 3 — GitHub Pages Hosting

1. Apne GitHub repo (jaise `ali19121.github.io/isra-quran-academy` ya naya repo) me ye sab files upload karein:
   - `index.html`
   - `app.js`
   - `config.js`
   - `ISRA_QURAN_ACADEMY_LOGO.jpeg`
   - (AppsScript_Code.gs upload karna optional hai — ye sirf reference ke liye hai)
2. Repo Settings > Pages > Source: `main` branch, `/ (root)` folder select karein.
3. Save karein. 1-2 minute me portal live ho jayega: `https://ali19121.github.io/<repo-name>/`

## Reports (NEW — Admin/Superadmin only)

Admin sidebar me ek naya **"Reports"** menu item hai. Isme 6 report types hain:

| Report Type | Kya karta hai |
|---|---|
| **Overall Summary (All Markaz)** | Tamam markaz ka majmui khulasa — donut chart (Boys/Girls), district-wise bar chart, aur table |
| **Supervisor-wise Report** | Har Supervisor ke paas kitne maktab hain (bar chart + table), maktab names, students/teachers count |
| **Course-wise Report** | Har course/level (Qaida, Nazra, Hifz, Fehm-ul-Quran, Alam, Tafseer) me kitne students hain — bar chart + Boys/Girls breakdown + % |
| **Markaz-wise Detailed Report** | Aik ya multiple markaz select kar ke har markaz ki full detail (teachers + students list) |
| **Students List Report** | Filtered students ki poori list |
| **Teachers List Report** | Filtered teachers ki poori list |
| **Attendance / Dropout-Risk Report** | Kam hazri (custom % threshold) aur Dropout status wale students ki list, risk badge ke sath |

### Filters (sab report types ke sath istamal ho sakte hain)
- **Report Type**
- **Select Supervisor** — multi-select (ek se zyada supervisor ek sath choose kar sakte hain)
- **Select Maktab** — multi-select (ek se zyada maktab ek sath choose kar sakte hain)
- **Select Course** — multi-select (Qaida/Nazra/Hifz/Fehm-ul-Quran/Alam/Tafseer/Other — jo bhi Students records me maujood hon, dropdown khud-b-khud us se bharta hai). Ye filter Overall/Supervisor reports ke "Total Students" count ko bhi us course tak mehdood kar deta hai — e.g. sirf "Hifz" select kar ke Overall Summary chalayen to sirf Hifz students ka total dikhega.
- **District**, **Status** (Active/Inactive)
- **From Date / To Date** — Students ke Admission Date aur Teachers ke Appointment Date par filter
- **Gender** (sirf Students report ke liye)
- **Attendance Threshold %** (sirf Attendance report ke liye, default 75%)

> Student Add/Edit form me "Current Level / Course" dropdown ab **Qaida, Nazra, Hifz (Hafiz), Fehm-ul-Quran, Alam, Tafseer, Other** options rakhta hai — inhi values se Reports me Course filter aur Course-wise Report banti hai.

### Charts
Overall, Supervisor-wise aur Course-wise reports me **donut chart** (Boys/Girls ratio) aur **bar charts** shamil hain — data ko tables ke sath visually bhi dekha ja sakta hai.

### Export Options
Har report me 2 buttons:
- 🖨️ **Print / Save PDF** — sirf report content print hota hai, browser ke "Save as PDF" se PDF bhi bana sakte hain.
- ⬇️ **Export Excel** — ab **real .xlsx file** banti hai (SheetJS library se), jisme headers, generated-date, aur multiple sheets bhi ho sakti hain (jaise Overall report me "Summary" + "District Breakdown" alag sheets, ya Markaz report me har maktab ki apni sheet).

### Recent Reports Activity
Reports page ke upar ek chhota panel hai jo pichli 10 generate/export activities dikhata hai (kis ne kab konsi report banayi) — Logs sheet se hi liya jata hai.

Ye poora feature 100% client-side hai (koi Apps Script change nahi chahiye) — existing `getMaktabs`, `getTeachers`, `getStudents`, `getLogs` APIs se hi data leta hai. Sirf Excel export ke liye ek external library (`SheetJS`, CDN se `unpkg.com`) index.html me add ki gayi hai.

## Roles & Login

| Role | Access |
|---|---|
| **Admin** | Sab kuch — Dashboard, Maktabs, Teachers, Students, Map, Users management |
| **Supervisor** | Dashboard, Maktabs, Teachers, Students, Map (Users management ke siwa sab) |
| **Teacher** | Dashboard + apne maktab ke Students (view-only Maktabs list) |

Naye users banane ke liye: Admin login > **Users** > "+ نیا صارف شامل کریں"

## Maktab Location (Map)

- Maktab add/edit karte waqt, form ke neeche ek interactive map hai (OpenStreetMap — free, no API key chahiye).
- Map par click karke location set karein — coordinates automatically save ho jayenge.
- **Map View** page par sab maktabs ek hi naqsha par dikhte hain, with popups.
- Har maktab ke aage 📍 icon par click karke Google Maps me location khol sakte hain.

## Data Structure Notes

- Saara data Google Sheet me real-time save hota hai.
- `Maktabs`, `Teachers`, `Students` sheets me `ID` column auto-generate hota hai.
- `Teachers` aur `Students` sheets `MaktabID` se Maktabs sheet ke saath linked hain (dropdown se select karein).
- `Users` sheet me `Username` unique identifier hai (no ID column).

## Troubleshooting

- **"Connection error"** — internet check karein, ya `config.js` me SCRIPT_URL sahi hai ya nahi confirm karein.
- **Login fail** — Users sheet me Username/Password column check karein (case-sensitive nahi, lekin extra space na ho).
- **Map nahi dikh raha** — internet connection chahiye (OpenStreetMap tiles online se load hoti hain).
- **Naya data sheet me nahi aa raha** — Apps Script deployment me "Who has access: Anyone" set hona chahiye, aur latest version deploy ho.
