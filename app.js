/***********************************************************************
 * ISRA QURAN ACADEMY PORTAL — app.js v4.0
 * Features: Multi-language, PWA Install, Role-based strict access,
 *           Log History, Professional Dashboard, Reporting chain
 ***********************************************************************/
let currentUser=null, mapInstance=null, mapMarker=null;
let cache={maktabs:[],teachers:[],students:[],users:[],logs:[]};
let offlineQueue=JSON.parse(localStorage.getItem('isra_offline_queue')||'[]');
let isOnline=navigator.onLine;
let currentLang=localStorage.getItem('isra_lang')||'en';
let deferredInstall=null;

/* ===================== ICONS ===================== */
const IC={
  dashboard:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  maktab:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21V13h6v8"/></svg>`,
  teacher:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>`,
  student:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  map:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
  users:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  profile:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M3 21a9 9 0 0 1 18 0"/></svg>`,
  log:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  more:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>`,
  location: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  search:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  edit:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  del:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  add:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  check:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  chart:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  boys:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="7" r="3.5"/><path d="M2 20v-1a6 6 0 0 1 12 0v1"/><circle cx="17" cy="7" r="3"/><path d="M21 20v-1a5 5 0 0 0-5-5h-.5"/></svg>`,
  book:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  sync:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  report:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>`,
  print:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
};

/* ===================== TRANSLATIONS ===================== */
const LANG = {
  en: {
    dashboard:'Dashboard', maktabs:'Maktabs', teachers:'Teachers', students:'Students',
    mapview:'Map View', users:'Users', profile:'Profile', logs:'Activity Log',
    logout:'Logout', search:'Search...', save:'Save', cancel:'Cancel',
    new_maktab:'New Maktab', new_teacher:'New Teacher', new_student:'New Student', new_user:'New User',
    all_status:'All Status', all_maktabs:'All Maktabs', all_districts:'All Districts', all_levels:'All Levels',
    active:'Active', inactive:'Inactive', left:'Left', dropout:'Dropout',
    total_maktabs:'Total Maktabs', active_maktabs:'Active Maktabs', total_students:'Total Students',
    boys_girls:'Boys / Girls', total_teachers:'Total Teachers', active_teachers:'Active Teachers',
    schools_by_district:'Schools by District', overview:'Overview Summary',
    no_data:'No data available yet.', loading:'Loading...', deleted:'Deleted successfully',
    saved:'Saved successfully', offline_msg:'Offline — will sync when connected',
    error_name:'Name is required.', error_username:'Username is required.',
    error_pass:'Password required for new user.', confirm_delete:'Are you sure you want to delete this record?',
    good_morning:'Good morning', good_afternoon:'Good afternoon', good_evening:'Good evening',
    welcome:'Welcome to ISRA Quran Academy Portal',
    login:'Login', main_menu:'MAIN MENU', online:'Online', offline:'Offline',
    quick_actions_tip:'Use sidebar menu for quick navigation',
    report_to:'Reports To', supervisor:'Supervisor', assigned_maktab:'Assigned Maktab',
    log_title:'Activity Log', log_sub:'All actions performed in the system',
    lbl_user:'Username', lbl_pass:'Password', lbl_hint:'Admin / Supervisor / Teacher — account from administrator',
    install_title:'Install ISRA Portal', install_sub:'Add to home screen for quick access',
    install_now:'Install', not_now:'Not now',
    reports:'Reports', report_sub:'Generate maktab-wise (markaz) reports',
    report_type:'Report Type', select_maktab:'Select Maktab (Markaz)',
    rp_overall:'Overall Summary (All Markaz)', rp_maktab:'Markaz-wise Detailed Report',
    rp_students:'Students List Report', rp_teachers:'Teachers List Report',
    rp_supervisor:'Supervisor-wise Report', select_supervisor:'Select Supervisor', all_supervisors:'All Supervisors',
    unassigned:'Unassigned', maktab_names:'Maktab Names',
    generate_report:'Generate Report', print_report:'Print / Save PDF', export_csv:'Export CSV',
    export_excel:'Export Excel', from_date:'From Date', to_date:'To Date',
    rp_attendance:'Attendance / Dropout-Risk Report', attendance_threshold:'Low Attendance Below (%)',
    low_attendance:'Low Attendance', dropout:'Dropout', risk_level:'Risk Level',
    recent_reports:'Recent Reports Activity', selected_count:'selected', clear:'Clear',
    boys:'Boys', girls:'Girls',
    rp_course:'Course-wise Report', select_course:'Select Course', all_courses:'All Courses', course:'Course', top_course:'Top Course',
    report_generated_on:'Generated On', generated_by:'Generated By',
    select_filters:'Select report type and filters, then click Generate Report.',
  },
  ur: {
    dashboard:'ڈیش بورڈ', maktabs:'مکاتب', teachers:'اساتذہ', students:'طلباء',
    mapview:'نقشہ', users:'صارفین', profile:'پروفائل', logs:'سرگرمی لاگ',
    logout:'لاگ آؤٹ', search:'تلاش کریں...', save:'محفوظ کریں', cancel:'منسوخ',
    new_maktab:'نیا مکتب', new_teacher:'نیا استاد', new_student:'نیا طالب علم', new_user:'نیا صارف',
    all_status:'تمام حیثیت', all_maktabs:'تمام مکاتب', all_districts:'تمام اضلاع', all_levels:'تمام سطح',
    active:'فعال', inactive:'غیرفعال', left:'رخصت', dropout:'ترک',
    total_maktabs:'کل مکاتب', active_maktabs:'فعال مکاتب', total_students:'کل طلباء',
    boys_girls:'لڑکے / لڑکیاں', total_teachers:'کل اساتذہ', active_teachers:'فعال اساتذہ',
    schools_by_district:'اضلاع کے مطابق مکاتب', overview:'مجموعی خلاصہ',
    no_data:'ابھی کوئی ڈیٹا دستیاب نہیں۔', loading:'لوڈ ہو رہا ہے...', deleted:'حذف ہو گیا',
    saved:'محفوظ ہو گیا', offline_msg:'آف لائن — انٹرنیٹ آنے پر sync ہو گا',
    error_name:'نام ضروری ہے۔', error_username:'یوزرنیم ضروری ہے۔',
    error_pass:'نئے صارف کے لیے پاس ورڈ ضروری ہے۔', confirm_delete:'کیا آپ واقعی یہ ریکارڈ حذف کرنا چاہتے ہیں؟',
    good_morning:'صبح بخیر', good_afternoon:'دوپہر بخیر', good_evening:'شام بخیر',
    welcome:'اسرا قرآن اکیڈمی پورٹل میں خوش آمدید',
    login:'لاگ ان', main_menu:'مین مینو', online:'آن لائن', offline:'آف لائن',
    quick_actions_tip:'فوری navigation کے لیے sidebar مینو استعمال کریں',
    report_to:'رپورٹ کریں', supervisor:'سپروائزر', assigned_maktab:'متعلقہ مکتب',
    log_title:'سرگرمی لاگ', log_sub:'سسٹم میں تمام اقدامات',
    lbl_user:'یوزر نیم', lbl_pass:'پاس ورڈ', lbl_hint:'ایڈمن / سپروائزر / ٹیچر — اکاؤنٹ ایڈمنسٹریٹر سے ملے گا',
    install_title:'ISRA پورٹل انسٹال کریں', install_sub:'فوری رسائی کے لیے ہوم اسکرین پر شامل کریں',
    install_now:'انسٹال کریں', not_now:'ابھی نہیں',
    reports:'رپورٹس', report_sub:'مکتب (مرکز) کے حساب سے رپورٹ بنائیں',
    report_type:'رپورٹ کی قسم', select_maktab:'مکتب (مرکز) منتخب کریں',
    rp_overall:'مجموعی خلاصہ (تمام مراکز)', rp_maktab:'مرکز کے مطابق تفصیلی رپورٹ',
    rp_students:'طلباء کی فہرست رپورٹ', rp_teachers:'اساتذہ کی فہرست رپورٹ',
    rp_supervisor:'سپروائزر کے حساب سے رپورٹ', select_supervisor:'سپروائزر منتخب کریں', all_supervisors:'تمام سپروائزرز',
    unassigned:'غیر تفویض شدہ', maktab_names:'مکاتب کے نام',
    generate_report:'رپورٹ بنائیں', print_report:'پرنٹ / PDF محفوظ کریں', export_csv:'CSV ایکسپورٹ',
    export_excel:'ایکسل ایکسپورٹ', from_date:'تاریخ سے', to_date:'تاریخ تک',
    rp_attendance:'حاضری / ڈراپ آؤٹ رسک رپورٹ', attendance_threshold:'کم حاضری کی حد (%)',
    low_attendance:'کم حاضری', dropout:'ڈراپ آؤٹ', risk_level:'خطرے کی سطح',
    recent_reports:'حالیہ رپورٹس کی سرگرمی', selected_count:'منتخب', clear:'صاف کریں',
    boys:'لڑکے', girls:'لڑکیاں',
    rp_course:'کورس کے حساب سے رپورٹ', select_course:'کورس منتخب کریں', all_courses:'تمام کورسز', course:'کورس', top_course:'سب سے بڑا کورس',
    report_generated_on:'تیار کرنے کی تاریخ', generated_by:'تیار کنندہ',
    select_filters:'رپورٹ کی قسم اور فلٹر منتخب کریں، پھر رپورٹ بنائیں پر کلک کریں۔',
  },
  sd: {
    dashboard:'ڊيش بورڊ', maktabs:'مڪتب', teachers:'استاد', students:'شاگرد',
    mapview:'نقشو', users:'يوزر', profile:'پروفائل', logs:'لاگ هسٽري',
    logout:'لاگ آئوٽ', search:'ڳوليو...', save:'محفوظ ڪريو', cancel:'رد ڪريو',
    new_maktab:'نئون مڪتب', new_teacher:'نئون استاد', new_student:'نئون شاگرد', new_user:'نئون يوزر',
    all_status:'سڀ حيثيت', all_maktabs:'سڀ مڪتب', all_districts:'سڀ ضلعا', all_levels:'سڀ سطح',
    active:'فعال', inactive:'غيرفعال', left:'رخصت', dropout:'ڇڏيل',
    total_maktabs:'ڪل مڪتب', active_maktabs:'فعال مڪتب', total_students:'ڪل شاگرد',
    boys_girls:'ڇوڪرا / ڇوڪريون', total_teachers:'ڪل استاد', active_teachers:'فعال استاد',
    schools_by_district:'ضلعي مطابق مڪتب', overview:'مجموعي خلاصو',
    no_data:'ڊيٽا دستياب ناهي۔', loading:'لوڊ ٿي رهيو آهي...', deleted:'حذف ٿي ويو',
    saved:'محفوظ ٿي ويو', offline_msg:'آف لائن — انٽرنيٽ اچڻ تي sync ٿيندو',
    error_name:'نالو ضروري آهي۔', error_username:'يوزرنيم ضروري آهي۔',
    error_pass:'نئين يوزر لاءِ پاس ورڊ ضروري آهي۔', confirm_delete:'ڇا توهان واقعي هي رڪارڊ حذف ڪرڻ چاهيو ٿا؟',
    good_morning:'سڀاڻي خير', good_afternoon:'منجهند خير', good_evening:'شام خير',
    welcome:'اسرا قرآن اڪيڊمي پورٽل ۾ خوش آمديد',
    login:'لاگ ان', main_menu:'مين مينيو', online:'آن لائن', offline:'آف لائن',
    quick_actions_tip:'فوري navigation لاءِ sidebar مينيو استعمال ڪريو',
    report_to:'رپورٽ ڪريو', supervisor:'سپروائيزر', assigned_maktab:'لاڳاپيل مڪتب',
    log_title:'لاگ هسٽري', log_sub:'سسٽم ۾ سڀ عمل',
    lbl_user:'يوزر نيم', lbl_pass:'پاس ورڊ', lbl_hint:'ايڊمن / سپروائيزر / ٽيچر — اڪائونٽ ايڊمنسٽريٽر کان ملندو',
    install_title:'ISRA پورٽل انسٽال ڪريو', install_sub:'فوري رسائي لاءِ هوم اسڪرين تي شامل ڪريو',
    install_now:'انسٽال ڪريو', not_now:'هاڻي نه',
    reports:'رپورٽون', report_sub:'مڪتب (مرڪز) جي حساب سان رپورٽ ٺاهيو',
    report_type:'رپورٽ جو قسم', select_maktab:'مڪتب (مرڪز) چونڊيو',
    rp_overall:'مجموعي خلاصو (سڀ مرڪز)', rp_maktab:'مرڪز مطابق تفصيلي رپورٽ',
    rp_students:'شاگردن جي فهرست رپورٽ', rp_teachers:'استادن جي فهرست رپورٽ',
    rp_supervisor:'سپروائيزر مطابق رپورٽ', select_supervisor:'سپروائيزر چونڊيو', all_supervisors:'سڀ سپروائيزر',
    unassigned:'غير مقرر', maktab_names:'مڪتبن جا نالا',
    generate_report:'رپورٽ ٺاهيو', print_report:'پرنٽ / PDF محفوظ ڪريو', export_csv:'CSV ايڪسپورٽ',
    export_excel:'ايڪسل ايڪسپورٽ', from_date:'تاريخ کان', to_date:'تاريخ تائين',
    rp_attendance:'حاضري / ڊراپ آئوٽ خطرو رپورٽ', attendance_threshold:'گھٽ حاضري جي حد (%)',
    low_attendance:'گھٽ حاضري', dropout:'ڊراپ آئوٽ', risk_level:'خطري جو درجو',
    recent_reports:'تازيون رپورٽ سرگرميون', selected_count:'چونڊيل', clear:'صاف ڪريو',
    boys:'ڇوڪرا', girls:'ڇوڪريون',
    rp_course:'ڪورس مطابق رپورٽ', select_course:'ڪورس چونڊيو', all_courses:'سڀ ڪورس', course:'ڪورس', top_course:'سڀ کان وڏو ڪورس',
    report_generated_on:'ٺاهڻ جي تاريخ', generated_by:'تيار ڪندڙ',
    select_filters:'رپورٽ جو قسم ۽ فلٽر چونڊيو، پوءِ رپورٽ ٺاهيو تي ڪلڪ ڪريو۔',
  }
};

function T(key){ return (LANG[currentLang]||LANG.en)[key] || (LANG.en[key]||key); }

function setLang(lang, btn){
  currentLang = lang;
  localStorage.setItem('isra_lang', lang);
  // Update html dir
  let root = document.getElementById('htmlRoot');
  if(root){ root.lang = lang; root.style.fontFamily = lang==='en' ? 'Inter, sans-serif' : "'Noto Naskh Arabic', serif"; }
  // Update active buttons (both login + topbar)
  document.querySelectorAll('.ls-opt,.lls-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.trim().toLowerCase().startsWith(lang==='en'?'en':lang==='ur'?'ur':lang==='sd'?'sd':''));
    // More precise
    if(b.onclick && b.onclick.toString().includes(`'${lang}'`)) b.classList.add('active');
    else b.classList.remove('active');
  });
  if(btn){ btn.classList.add('active'); }
  // Update UI strings
  applyLangUI();
  // If app open, re-render current page
  if(currentUser) buildNav();
}

function applyLangUI(){
  let map = {
    'lbl_user':'lbl_user','lbl_pass':'lbl_pass','lbl_login':'login','lbl_hint':'lbl_hint',
    'lbl_logout':'logout','lbl_logout2':'logout','lbl_qa':'quick_actions_tip',
    'sb_menu_label':'main_menu','sbOT':'online','offlineText':'offline_msg',
    'installTitle':'install_title','installSub':'install_sub',
    'installBtn':'install_now','installDismiss':'not_now',
  };
  for(let id in map){ let el=document.getElementById(id); if(el) el.textContent=T(map[id]); }
  // Offline banner
  let ob=document.getElementById('offlineText'); if(ob) ob.textContent=isOnline?'':T('offline_msg');
  // Dot
  let sbOT=document.getElementById('sbOT'); if(sbOT) sbOT.textContent=isOnline?T('online'):T('offline');
}

/* ===================== PWA INSTALL ===================== */
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstall = e;
  let dismissed = localStorage.getItem('isra_install_dismissed');
  if(!dismissed){
    setTimeout(() => document.getElementById('installBanner')?.classList.add('show'), 3000);
  }
});
window.addEventListener('appinstalled', () => {
  document.getElementById('installBanner')?.classList.remove('show');
  deferredInstall = null;
  toast('✓ App installed successfully!', 'success');
});
function doInstall(){
  if(!deferredInstall) return;
  deferredInstall.prompt();
  deferredInstall.userChoice.then(r => {
    if(r.outcome === 'accepted') document.getElementById('installBanner')?.classList.remove('show');
    deferredInstall = null;
  });
}
function dismissInstall(){
  document.getElementById('installBanner')?.classList.remove('show');
  localStorage.setItem('isra_install_dismissed','1');
}

/* ===================== PWA SERVICE WORKER ===================== */
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js').then(() => {
    navigator.serviceWorker.addEventListener('message', e => { if(e.data?.type==='SYNC_NOW') syncQ(); });
  }).catch(()=>{});
}
window.addEventListener('online',  ()=>{ isOnline=true;  updateStatus(); syncQ(); });
window.addEventListener('offline', ()=>{ isOnline=false; updateStatus(); });

function updateStatus(){
  document.getElementById('offlineBanner')?.classList.toggle('show', !isOnline);
  let dot=document.getElementById('sbDot'); if(dot) dot.classList.toggle('off', !isOnline);
  let t=document.getElementById('sbOT'); if(t) t.textContent=isOnline?T('online'):T('offline');
  let sb=document.getElementById('syncBtn'); if(sb) sb.classList.toggle('hidden', offlineQueue.length===0);
  applyLangUI();
}

/* ===================== OFFLINE QUEUE ===================== */
function queueAction(action, params){
  offlineQueue.push({action,params,time:Date.now()});
  localStorage.setItem('isra_offline_queue',JSON.stringify(offlineQueue));
  toast(T('offline_msg'), 'warning');
  updateStatus();
}
async function syncQ(){
  if(!isOnline || !offlineQueue.length) return;
  toast(T('loading'),'');
  let failed=[];
  for(let item of offlineQueue){
    try{ let r=await api(item.action,item.params); if(!r.success) failed.push(item); }
    catch{ failed.push(item); }
  }
  offlineQueue=failed;
  localStorage.setItem('isra_offline_queue',JSON.stringify(offlineQueue));
  toast(failed.length?`${failed.length} records failed`:'✓ '+T('saved'), failed.length?'error':'success');
  updateStatus();
}

/* ===================== API ===================== */
function api(action, params){
  return new Promise((res,rej)=>{
    let all=Object.assign({action},params||{});
    let q=new URLSearchParams();
    for(let k in all) q.append(k, all[k]==null?'':all[k]);
    fetch(CONFIG.SCRIPT_URL+'?'+q.toString()).then(r=>r.json()).then(res).catch(rej);
  });
}
function apiS(action, params){
  if(!isOnline){ queueAction(action,params); return Promise.resolve({success:true,offline:true}); }
  return api(action,params).catch(()=>{ queueAction(action,params); return {success:true,offline:true}; });
}

/* ===================== TOAST ===================== */
function toast(msg, type){
  let t=document.getElementById('toast'); if(!t) return;
  let ico={success:IC.check, error:IC.x, warning:'⚠'};
  t.innerHTML=(ico[type]||'')+msg;
  t.className='toast show'+(type?' '+type:'');
  clearTimeout(t._t); t._t=setTimeout(()=>{ t.className='toast'; }, 3500);
}

/* ===================== LOG HELPER ===================== */
function writeLog(action, detail){
  if(!currentUser) return;
  let log={
    user: currentUser.Username, role: currentUser.Role,
    action, detail, time: new Date().toISOString()
  };
  api('addLog', log).catch(()=>{});
}

/* ===================== AUTH ===================== */
function doLogin(){
  let u=(document.getElementById('loginUser').value||'').trim();
  let p=(document.getElementById('loginPass').value||'').trim();
  let err=document.getElementById('loginError');
  let spin=document.getElementById('loginSpin');
  let btn=document.getElementById('loginBtn');
  err.textContent='';
  if(!u||!p){ err.textContent=T('error_name'); return; }
  spin.innerHTML='<span class="spinner" style="width:13px;height:13px;border-top-color:#fff;"></span>';
  btn.disabled=true;
  api('login',{username:u,password:p}).then(res=>{
    spin.innerHTML=''; btn.disabled=false;
    if(res.success){ currentUser=res.user; localStorage.setItem('isra_user',JSON.stringify(currentUser)); enterApp(); }
    else err.textContent=res.message||'Login failed.';
  }).catch(()=>{ spin.innerHTML=''; btn.disabled=false; err.textContent='Connection error — check internet.'; });
}

function logout(){
  if(currentUser) writeLog('logout','User logged out');
  localStorage.removeItem('isra_user'); currentUser=null;
  cache={maktabs:[],teachers:[],students:[],users:[],logs:[]};
  document.getElementById('appShell').style.display='none';
  document.getElementById('loginScreen').style.display='flex';
  ['loginUser','loginPass'].forEach(id=>{ let el=document.getElementById(id); if(el) el.value=''; });
  document.getElementById('loginError').textContent='';
}

function enterApp(){
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('appShell').style.display='block';
  document.getElementById('sbUN').textContent=currentUser.Name||currentUser.Username;
  let re=document.getElementById('sbRole');
  if(re){ re.textContent=currentUser.Role||''; re.className='sb-role role-'+(currentUser.Role||'').toLowerCase(); }
  writeLog('login','User logged in');
  buildNav(); navigate('dashboard'); updateStatus(); applyLangUI();
}

window.addEventListener('DOMContentLoaded',()=>{
  // Restore language
  let savedLang=localStorage.getItem('isra_lang')||'en';
  currentLang=savedLang;
  // Set active lang buttons
  document.querySelectorAll('.ls-opt,.lls-btn').forEach(b=>{
    if(b.onclick && b.onclick.toString().includes(`'${savedLang}'`)) b.classList.add('active');
    else b.classList.remove('active');
  });
  applyLangUI();
  let s=localStorage.getItem('isra_user');
  if(s){ try{ currentUser=JSON.parse(s); enterApp(); } catch{ localStorage.removeItem('isra_user'); } }
  document.getElementById('loginPass').addEventListener('keypress',e=>{ if(e.key==='Enter') doLogin(); });
  document.getElementById('loginUser').addEventListener('keypress',e=>{ if(e.key==='Enter') document.getElementById('loginPass').focus(); });
  updateStatus();
});

/* ===================== NAVIGATION ===================== */
const ALL_NAV=[
  {id:'dashboard',key:'dashboard',icon:'dashboard',roles:['Admin','Supervisor','Teacher']},
  {id:'maktabs',  key:'maktabs',  icon:'maktab',  roles:['Admin','Supervisor','Teacher']},
  {id:'teachers', key:'teachers', icon:'teacher', roles:['Admin','Supervisor']},
  {id:'students', key:'students', icon:'student', roles:['Admin','Supervisor','Teacher']},
  {id:'mapview',  key:'mapview',  icon:'map',     roles:['Admin','Supervisor']},
  {id:'reports',  key:'reports',  icon:'report',  roles:['Admin']},
  {id:'assistant',key:'assistant',icon:'bot',     roles:['Admin']},
  {id:'users',    key:'users',    icon:'users',   roles:['Admin']},
  {id:'logs',     key:'logs',     icon:'log',     roles:['Admin']},
  {id:'profile',  key:'profile',  icon:'profile', roles:['Admin','Supervisor','Teacher']},
];
function getNav(){ let r=currentUser?.Role||'Teacher'; return ALL_NAV.filter(n=>n.roles.includes(r)); }

function buildNav(){
  let items=getNav();
  document.getElementById('navMenu').innerHTML=items.map(it=>
    `<button class="ni" id="nav-${it.id}" onclick="navigate('${it.id}')"><div class="ni-ic">${IC[it.icon]}</div>${T(it.key)}</button>`
  ).join('');
  // Bottom nav
  let prim=items.slice(0,4), sec=items.slice(4);
  let bn=document.getElementById('bnInner');
  bn.innerHTML=prim.map(it=>
    `<button class="bn-i" id="bn-${it.id}" onclick="navigate('${it.id}')"><div class="bn-ib">${IC[it.icon]}</div><span>${T(it.key)}</span></button>`
  ).join('');
  if(sec.length){
    bn.innerHTML+=`<button class="bn-i" onclick="openDrawer()"><div class="bn-ib">${IC.more}</div><span>More</span></button>`;
    document.getElementById('drawerItems').innerHTML=sec.map(it=>
      `<button class="di" id="dr-${it.id}" onclick="navigate('${it.id}');closeDrawer()">${IC[it.icon]} ${T(it.key)}</button>`
    ).join('');
  }
}

function setActive(id){
  document.querySelectorAll('.ni,.bn-i,.di').forEach(el=>el.classList.remove('active'));
  ['nav-','bn-','dr-'].forEach(p=>{ let el=document.getElementById(p+id); if(el) el.classList.add('active'); });
}

function navigate(page){
  closeDrawer(); closeSb(); setActive(page);
  let el=document.getElementById('tbTitle'); if(el) el.textContent=T(page)||page;
  if(mapInstance){ try{mapInstance.remove();}catch(e){} mapInstance=null; mapMarker=null; }
  switch(page){
    case 'dashboard': renderDashboard(); break;
    case 'maktabs':   renderMaktabs();   break;
    case 'teachers':  renderTeachers();  break;
    case 'students':  renderStudents();  break;
    case 'mapview':   renderMapView();   break;
    case 'reports':   renderReports();   break;
    case 'assistant': renderAssistant(); break;
    case 'users':     renderUsers();     break;
    case 'logs':      renderLogs();      break;
    case 'profile':   renderProfile();   break;
    default:          renderDashboard();
  }
}

/* ===================== UTILS ===================== */
function esc(s){ if(s==null)return''; return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function toDI(v){ if(!v)return''; let d=new Date(v); return isNaN(d.getTime())?'':d.toISOString().split('T')[0]; }
function fmtDate(v){ if(!v)return'-'; let d=new Date(v); return isNaN(d.getTime())?v:d.toLocaleDateString('en-GB'); }
function fmtTime(v){ if(!v)return'-'; let d=new Date(v); return isNaN(d.getTime())?v:d.toLocaleString('en-GB',{hour12:false}); }
function mkName(id){ let m=cache.maktabs.find(x=>String(x.ID)===String(id)); return m?m.MaktabName:(id||'-'); }
function isAdmin(){ return currentUser?.Role==='Admin'; }
function isTeacher(){ return currentUser?.Role==='Teacher'; }
function isSupervisor(){ return currentUser?.Role==='Supervisor'; }
function canEdit(){ return !isTeacher(); }
function LD(m){ return `<div class="ls"><div class="spinner spinner-lg"></div><p>${m||T('loading')}</p></div>`; }
function ED(m){ return `<div class="es">${IC.book}<p>${m||T('no_data')}</p></div>`; }

/* ===================== ROLE FILTER — STRICT =====================
   - Admin: sees everything
   - Supervisor: ONLY sees maktabs/teachers/students where MaktabID is in their AssignedMaktab list
   - Teacher: ONLY sees students of their own maktab
   ============================================================= */
function filterByRole(rows, type){
  let role=currentUser?.Role;
  let assigned=(currentUser?.AssignedMaktab||'');
  if(role==='Admin') return rows;

  if(role==='Supervisor'){
    if(!assigned||assigned==='All') return rows;
    let ids=assigned.split(',').map(s=>s.trim()).filter(Boolean);
    // Build maktab IDs list for supervisor
    let myMaktabIds=cache.maktabs
      .filter(m=>ids.includes(String(m.ID))||ids.includes(m.MaktabName))
      .map(m=>String(m.ID));
    if(type==='maktabs') return rows.filter(r=>myMaktabIds.includes(String(r.ID)));
    if(type==='teachers') return rows.filter(r=>myMaktabIds.includes(String(r.MaktabID)));
    if(type==='students') return rows.filter(r=>myMaktabIds.includes(String(r.MaktabID)));
    return rows;
  }

  if(role==='Teacher'){
    let myMak=assigned;
    if(type==='maktabs') return rows.filter(r=>String(r.ID)===String(myMak)||r.MaktabName===myMak);
    if(type==='students') return rows.filter(r=>String(r.MaktabID)===String(myMak)||r.TeacherName===(currentUser.Name||currentUser.Username));
    return [];
  }
  return rows;
}

function sBadge(s){
  let map={Active:'bg',Inactive:'bgy',Left:'bo',Dropout:'br2'};
  let cls=map[s]||'bgy';
  return `<span class="badge ${cls}"><span class="bd"></span>${esc(T(s?.toLowerCase())||s||'-')}</span>`;
}
function rBadge(r){
  let map={Admin:'bp',Supervisor:'bb',Teacher:'bt'};
  return `<span class="badge ${map[r]||'bgy'}">${esc(r||'-')}</span>`;
}

/* ===================== DASHBOARD ===================== */
async function renderDashboard(){
  let h=new Date().getHours();
  let greet=h<12?T('good_morning'):h<17?T('good_afternoon'):T('good_evening');
  document.getElementById('pageContent').innerHTML=`
    <div class="ph" style="animation:fadeUp .3s ease;">
      <div class="ph-title" style="font-size:22px;">${greet}, <span style="color:var(--teal);">${esc(currentUser.Name||currentUser.Username)}</span></div>
      <div class="ph-sub">${T('welcome')}</div>
    </div>

    <div class="sg" id="dashStats">${[1,2,3,4,5,6].map(()=>`<div class="sc"><div style="width:40px;height:40px;border-radius:50%;background:#f1f5f9;margin-bottom:10px;"></div><div style="height:26px;width:55px;background:#f1f5f9;border-radius:5px;margin-bottom:6px;"></div><div style="height:12px;width:75px;background:#f1f5f9;border-radius:4px;"></div></div>`).join('')}</div>

    <div class="db2">
      <div class="card">
        <div class="ch">
          <div class="ch-l"><div class="ch-ic">${IC.chart}</div><div><div class="ch-t">${T('schools_by_district')}</div></div></div>
          <select class="fsel" id="dashF" onchange="drawChart()" style="font-size:11.5px;padding:5px 24px 5px 9px;">
            <option value="maktabs">${T('maktabs')}</option>
            <option value="students">${T('students')}</option>
            <option value="teachers">${T('teachers')}</option>
          </select>
        </div>
        <div class="cb"><div id="dashChart">${LD('')}</div></div>
      </div>
      <div class="card">
        <div class="ch"><div class="ch-l"><div class="ch-ic" style="background:#d1fae5;">${IC.check}</div><div class="ch-t">${T('overview')}</div></div></div>
        <div id="ovList">${LD('')}</div>
      </div>
    </div>`;

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
      {n:myM.length, lk:'total_maktabs',   slk:'maktabs',   icon:IC.maktab,  cls:'s-green'},
      {n:am,         lk:'active_maktabs',   slk:'active',    icon:IC.check,   cls:'s-purple'},
      {n:myS.length, lk:'total_students',   slk:'students',  icon:IC.student, cls:'s-blue'},
      {n:`${boys}/${girls}`,lk:'boys_girls',slk:'boys_girls',icon:IC.boys,    cls:'s-orange'},
      {n:myT.length, lk:'total_teachers',   slk:'teachers',  icon:IC.teacher, cls:'s-cyan'},
      {n:at,         lk:'active_teachers',  slk:'active',    icon:IC.check,   cls:'s-pink'},
    ];

    document.getElementById('dashStats').innerHTML=cards.map((c,i)=>`
      <div class="sc ${c.cls}" style="animation:fadeUp .4s ease ${i*0.06}s both;">
        <div class="sc-ic">${c.icon}</div>
        <div class="sc-n" data-t="${typeof c.n==='number'?c.n:''}">${c.n}</div>
        <div class="sc-l">${T(c.lk)}</div>
        <div class="sc-bg">${c.icon}</div>
      </div>`).join('');

    // Animate numbers
    document.querySelectorAll('.sc-n[data-t]').forEach(el=>{
      let tgt=parseInt(el.dataset.t); if(isNaN(tgt)) return;
      let t0=null, dur=900;
      function step(ts){ if(!t0)t0=ts; let p=Math.min((ts-t0)/dur,1); el.textContent=Math.floor(p*tgt); if(p<1)requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });

    document.getElementById('ovList').innerHTML=[
      {lk:'total_maktabs', v:myM.length, ic:IC.maktab,  bg:'background:#d1fae5;color:#065f46'},
      {lk:'total_students',v:myS.length, ic:IC.student, bg:'background:#ede9fe;color:#5b21b6'},
      {lk:'total_teachers',v:myT.length, ic:IC.teacher, bg:'background:#dbeafe;color:#1e40af'},
      {lk:'active_maktabs',v:am,         ic:IC.check,   bg:'background:#fef3c7;color:#92400e'},
      {lk:'active_teachers',v:at,        ic:IC.check,   bg:'background:#fce7f3;color:#9d174d'},
      {lk:'boys_girls',    v:`${boys}/${girls}`,ic:IC.boys, bg:'background:#ffedd5;color:#9a3412'},
    ].map(it=>`
      <div class="ov">
        <div class="ov-l"><div class="ov-ic" style="${it.bg}">${it.ic}</div>${T(it.lk)}</div>
        <div class="ov-v">${it.v}</div>
      </div>`).join('');

    window._dash={myM,myT,myS}; drawChart();
  }catch{
    document.getElementById('dashStats').innerHTML=`<div style="grid-column:1/-1;">${ED('Connection error — check internet.')}</div>`;
  }
}

function drawChart(){
  let el=document.getElementById('dashChart'); if(!el) return;
  let d=window._dash; if(!d){ el.innerHTML=ED(T('no_data')); return; }
  let f=(document.getElementById('dashF')||{}).value||'maktabs';
  let rows=f==='maktabs'?d.myM:f==='teachers'?d.myT:d.myS;
  let counts={}; rows.forEach(r=>{ let k=r.District||r.Tehsil||'Unknown'; counts[k]=(counts[k]||0)+1; });
  let keys=Object.keys(counts).sort((a,b)=>counts[b]-counts[a]);
  if(!keys.length){ el.innerHTML=`<div class="chart-empty">${IC.map}<p>${T('no_data')}</p></div>`; return; }
  let max=Math.max(...keys.map(k=>counts[k]));
  let clr={maktabs:'var(--teal)',students:'var(--purple)',teachers:'var(--cyan)'};
  el.innerHTML=keys.slice(0,8).map(k=>`
    <div class="br">
      <div class="br-l">${esc(k)}</div>
      <div class="br-t"><div class="br-f" style="background:${clr[f]};" data-w="${max?(counts[k]/max*100):0}"></div></div>
      <div class="br-v">${counts[k]}</div>
    </div>`).join('');
  setTimeout(()=>{ document.querySelectorAll('.br-f').forEach(b=>{ b.style.width=b.dataset.w+'%'; }); }, 30);
}

/* ===================== MAKTABS ===================== */
function renderMaktabs(){
  document.getElementById('pageContent').innerHTML=`
    <div class="ph" style="animation:fadeUp .3s ease;"><div class="ph-title">${T('maktabs')}</div><div class="ph-sub">Maktab Records</div></div>
    <div class="card">
      <div class="tb2">
        <div class="sb2">${IC.search}<input id="mkQ" placeholder="${T('search')}" oninput="applyMkF()"></div>
        <select class="fsel" id="mkDF" onchange="applyMkF()"><option value="">${T('all_districts')}</option></select>
        <select class="fsel" id="mkSF" onchange="applyMkF()"><option value="">${T('all_status')}</option><option value="active">${T('active')}</option><option value="inactive">${T('inactive')}</option></select>
        <div class="mla">${canEdit()?`<button class="btn btn-g btn-sm" onclick="openMkForm()">${IC.add} ${T('new_maktab')}</button>`:''}</div>
      </div>
      <div id="mkTW">${LD()}</div>
    </div>
    <div id="mkFW"></div>`;
  loadMaktabs();
}

async function loadMaktabs(){
  try{
    let res=await api('getMaktabs',{});
    if(!res.success){ document.getElementById('mkTW').innerHTML=ED(); return; }
    cache.maktabs=res.rows;
    let rows=filterByRole(cache.maktabs,'maktabs');
    let df=document.getElementById('mkDF');
    if(df){ let ds=[...new Set(rows.map(r=>r.District).filter(Boolean))].sort(); df.innerHTML=`<option value="">${T('all_districts')}</option>`+ds.map(d=>`<option value="${esc(d.toLowerCase())}">${esc(d)}</option>`).join(''); }
    renderMkT(rows);
  }catch{ document.getElementById('mkTW').innerHTML=ED(); }
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
  let w=document.getElementById('mkTW'); if(!rows.length){ w.innerHTML=ED(T('no_data')); return; }
  let ce=canEdit();
  w.innerHTML=`<div class="tw"><table id="mkTable">
    <thead><tr><th>${T('maktabs')}</th><th>Courses</th><th>UC / Tehsil / District</th><th>${T('total_students')}</th><th>${T('total_teachers')}</th><th>Head</th><th>${T('supervisor')}</th><th>Status</th><th></th></tr></thead>
    <tbody>${rows.map(r=>`
      <tr data-s="${esc((r.MaktabName+' '+r.District+' '+r.Tehsil).toLowerCase())}" data-d="${esc((r.District||'').toLowerCase())}" data-st="${esc((r.Status||'').toLowerCase())}">
        <td><div class="tm">${esc(r.MaktabName)}</div><div class="ts">${esc(r.FullAddress||'')}</div></td>
        <td>${esc(r.RunningCourses||'-')}</td>
        <td><div class="tm">${esc(r.Tehsil||'-')}</div><div class="ts">${esc(r.UC||'')} · ${esc(r.District||'-')}</div></td>
        <td><b>${r.TotalStudents||0}</b><div class="ts">${r.Boys||0}♂ ${r.Girls||0}♀</div></td>
        <td>${r.TotalTeachers||0}</td>
        <td><div class="tm">${esc(r.HeadName||'-')}</div><div class="ts">${esc(r.HeadContact||'')}</div></td>
        <td><div class="ts">${esc(r.SupervisorName||'-')}</div></td>
        <td>${sBadge(r.Status)}</td>
        <td><div class="ta">
          ${r.Latitude&&r.Longitude?`<a href="https://maps.google.com?q=${r.Latitude},${r.Longitude}" target="_blank" class="btn btn-o btn-ic btn-sm">${IC.location}</a>`:''}
          ${ce?`<button class="btn btn-o btn-ic btn-sm" onclick="openMkForm(${r.ID})">${IC.edit}</button><button class="btn btn-d btn-ic btn-sm" onclick="delMk(${r.ID})">${IC.del}</button>`:''}
        </div></td>
      </tr>`).join('')}
    </tbody></table></div>`;
}
function openMkForm(id){
  let r=id?(cache.maktabs.find(m=>String(m.ID)===String(id))||{}):{}; let isE=!!(id&&Object.keys(r).length);
  // Supervisor options — only Admin can assign supervisors
  let supOpts=(cache.users||[]).filter(u=>u.Role==='Supervisor').map(u=>`<option value="${esc(u.Username)}" ${r.SupervisorID===u.Username?'selected':''}>${esc(u.Name||u.Username)}</option>`).join('');
  document.getElementById('mkFW').innerHTML=`
    <div class="card anim" style="animation:fadeUp .3s ease;">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.maktab}</div><div class="ch-t">${isE?'Edit Maktab':T('new_maktab')}</div></div></div>
      <div class="cb"><div class="fg">
        <div class="fsec">Basic Info</div>
        <div class="ff"><label>Name *</label><input class="fi" id="mk_n" value="${esc(r.MaktabName||'')}"></div>
        <div class="ff"><label>Courses</label><input class="fi" id="mk_c" value="${esc(r.RunningCourses||'')}" placeholder="Qaida, Nazra, Hifz"></div>
        <div class="ff full"><label>Full Address</label><input class="fi" id="mk_a" value="${esc(r.FullAddress||'')}"></div>
        <div class="ff"><label>UC</label><input class="fi" id="mk_uc" value="${esc(r.UC||'')}"></div>
        <div class="ff"><label>Tehsil</label><input class="fi" id="mk_teh" value="${esc(r.Tehsil||'')}"></div>
        <div class="ff"><label>District</label><input class="fi" id="mk_dist" value="${esc(r.District||'')}"></div>
        <div class="ff"><label>Start Date</label><input class="fi" type="date" id="mk_sd" value="${toDI(r.StartDate)}"></div>
        <div class="ff"><label>Capacity</label><input class="fi" type="number" id="mk_cap" value="${r.Capacity||''}"></div>
        <div class="fsec">Counts</div>
        <div class="ff"><label>Total Students</label><input class="fi" type="number" id="mk_ts" value="${r.TotalStudents||''}"></div>
        <div class="ff"><label>Boys</label><input class="fi" type="number" id="mk_b" value="${r.Boys||''}"></div>
        <div class="ff"><label>Girls</label><input class="fi" type="number" id="mk_g" value="${r.Girls||''}"></div>
        <div class="ff"><label>Total Teachers</label><input class="fi" type="number" id="mk_tt" value="${r.TotalTeachers||''}"></div>
        <div class="fsec">Head / Incharge</div>
        <div class="ff"><label>Head Name</label><input class="fi" id="mk_hn" value="${esc(r.HeadName||'')}"></div>
        <div class="ff"><label>Contact</label><input class="fi" id="mk_hc" value="${esc(r.HeadContact||'')}"></div>
        <div class="ff"><label>WhatsApp</label><input class="fi" id="mk_hw" value="${esc(r.HeadWhatsApp||'')}"></div>
        <div class="ff"><label>${T('supervisor')} (assigned to)</label><select class="fsi" id="mk_sup"><option value="">-- Select --</option>${supOpts}</select></div>
        <div class="ff"><label>Status</label><select class="fsi" id="mk_st"><option value="Active" ${r.Status==='Active'?'selected':''}>${T('active')}</option><option value="Inactive" ${r.Status==='Inactive'?'selected':''}>${T('inactive')}</option></select></div>
        <div class="ff full"><label>Remarks</label><input class="fi" id="mk_rem" value="${esc(r.Remarks||'')}"></div>
        <div class="fsec">Location</div>
        <div class="ff"><label>Latitude</label><input class="fi" id="mk_lat" value="${r.Latitude||''}" placeholder="25.3960" oninput="updCC()"></div>
        <div class="ff"><label>Longitude</label><input class="fi" id="mk_lng" value="${r.Longitude||''}" placeholder="68.3578" oninput="updCC()"></div>
      </div>
      <div class="mc">
        <button class="btn btn-o btn-sm" onclick="useGPS()">${IC.location} Current Location</button>
        <button class="btn btn-o btn-sm" onclick="searchLoc()">${IC.search} Search by Name</button>
        <div class="cc" id="cchip">${IC.location}${r.Latitude&&r.Longitude?r.Latitude+', '+r.Longitude:'Click on map'}</div>
      </div>
      <div id="mapPicker" style="margin-top:10px;"></div>
      <div class="fa">
        <button class="btn btn-g" onclick="saveMk(${isE?r.ID:'null'})">${T('save')} <span id="mkSp"></span></button>
        <button class="btn btn-o" onclick="document.getElementById('mkFW').innerHTML=''">${T('cancel')}</button>
      </div></div>
    </div>`;
  document.getElementById('mkFW').scrollIntoView({behavior:'smooth'});
  setTimeout(()=>initMap(r.Latitude,r.Longitude),160);
}
function updCC(){ let lat=document.getElementById('mk_lat')?.value,lng=document.getElementById('mk_lng')?.value; let c=document.getElementById('cchip'); if(c&&lat&&lng)c.innerHTML=IC.location+lat+', '+lng; }
function useGPS(){
  if(!navigator.geolocation){ toast('Geolocation not supported','error'); return; }
  toast('Getting location...','');
  navigator.geolocation.getCurrentPosition(p=>{
    let lat=p.coords.latitude.toFixed(6),lng=p.coords.longitude.toFixed(6);
    document.getElementById('mk_lat').value=lat; document.getElementById('mk_lng').value=lng; updCC();
    if(mapInstance){ if(mapMarker)mapInstance.removeLayer(mapMarker); mapMarker=L.marker([+lat,+lng]).addTo(mapInstance); mapInstance.setView([+lat,+lng],14); }
    toast('✓ Location set','success');
  },()=>toast('Could not get location','error'));
}
function searchLoc(){
  let n=prompt('Enter place name (English):'); if(!n) return; toast('Searching...','');
  fetch('https://nominatim.openstreetmap.org/search?q='+encodeURIComponent(n+', Sindh, Pakistan')+'&format=json&limit=1')
    .then(r=>r.json()).then(data=>{
      if(!data.length){ toast('Location not found','error'); return; }
      let lat=parseFloat(data[0].lat).toFixed(6),lng=parseFloat(data[0].lon).toFixed(6);
      document.getElementById('mk_lat').value=lat; document.getElementById('mk_lng').value=lng; updCC();
      if(mapInstance){ if(mapMarker)mapInstance.removeLayer(mapMarker); mapMarker=L.marker([+lat,+lng]).addTo(mapInstance); mapInstance.setView([+lat,+lng],14); }
      toast('✓ '+(data[0].display_name||'').split(',')[0],'success');
    }).catch(()=>toast('Search failed','error'));
}
function initMap(lat,lng){
  if(mapInstance){ try{mapInstance.remove();}catch(e){} } mapInstance=null;
  let el=document.getElementById('mapPicker'); if(!el) return;
  let c=(lat&&lng)?[+lat,+lng]:CONFIG.MAP_DEFAULT_CENTER;
  mapInstance=L.map('mapPicker').setView(c,(lat&&lng)?13:CONFIG.MAP_DEFAULT_ZOOM);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(mapInstance);
  if(lat&&lng) mapMarker=L.marker(c).addTo(mapInstance);
  mapInstance.on('click',e=>{ let la=e.latlng.lat.toFixed(6),lo=e.latlng.lng.toFixed(6); if(mapMarker)mapInstance.removeLayer(mapMarker); mapMarker=L.marker([+la,+lo]).addTo(mapInstance); document.getElementById('mk_lat').value=la; document.getElementById('mk_lng').value=lo; updCC(); });
  setTimeout(()=>mapInstance.invalidateSize(),200);
}
async function saveMk(id){
  let sp=document.getElementById('mkSp');
  let name=(document.getElementById('mk_n').value||'').trim(); if(!name){ toast(T('error_name'),'error'); return; }
  let supSel=document.getElementById('mk_sup'); let supVal=supSel?supSel.value:'';
  let supUser=(cache.users||[]).find(u=>u.Username===supVal);
  let p={MaktabName:name,RunningCourses:document.getElementById('mk_c').value,FullAddress:document.getElementById('mk_a').value,UC:document.getElementById('mk_uc').value,Tehsil:document.getElementById('mk_teh').value,District:document.getElementById('mk_dist').value,StartDate:document.getElementById('mk_sd').value,Capacity:document.getElementById('mk_cap').value,TotalStudents:document.getElementById('mk_ts').value,Boys:document.getElementById('mk_b').value,Girls:document.getElementById('mk_g').value,TotalTeachers:document.getElementById('mk_tt').value,HeadName:document.getElementById('mk_hn').value,HeadContact:document.getElementById('mk_hc').value,HeadWhatsApp:document.getElementById('mk_hw').value,SupervisorID:supVal,SupervisorName:supUser?(supUser.Name||supUser.Username):supVal,Status:document.getElementById('mk_st').value,Remarks:document.getElementById('mk_rem').value,Latitude:document.getElementById('mk_lat').value,Longitude:document.getElementById('mk_lng').value,CreatedBy:currentUser.Username};
  if(id&&id!=='null')p.ID=id;
  sp.innerHTML='<span class="spinner" style="width:12px;height:12px;"></span>';
  let res=await apiS(id&&id!=='null'?'updateMaktab':'addMaktab',p); sp.innerHTML='';
  if(res.success){ writeLog(id&&id!=='null'?'Update Maktab':'Add Maktab',name); toast(res.offline?T('offline_msg'):'✓ '+T('saved'),res.offline?'warning':'success'); document.getElementById('mkFW').innerHTML=''; loadMaktabs(); }
  else toast(res.message||'Error','error');
}
async function delMk(id){
  if(!confirm(T('confirm_delete'))) return;
  let r=await api('deleteMaktab',{ID:id});
  if(r.success){ writeLog('Delete Maktab','ID:'+id); toast('✓ '+T('deleted'),'success'); loadMaktabs(); }
  else toast(r.message,'error');
}

/* ===================== TEACHERS ===================== */
function renderTeachers(){
  document.getElementById('pageContent').innerHTML=`
    <div class="ph" style="animation:fadeUp .3s ease;"><div class="ph-title">${T('teachers')}</div><div class="ph-sub">Teacher Records</div></div>
    <div class="card">
      <div class="tb2">
        <div class="sb2">${IC.search}<input id="tcQ" placeholder="${T('search')}" oninput="applyTcF()"></div>
        <select class="fsel" id="tcMF" onchange="applyTcF()"><option value="">${T('all_maktabs')}</option></select>
        <select class="fsel" id="tcSF" onchange="applyTcF()"><option value="">${T('all_status')}</option><option value="active">${T('active')}</option><option value="left">${T('left')}</option></select>
        <div class="mla">${canEdit()?`<button class="btn btn-g btn-sm" onclick="openTcForm()">${IC.add} ${T('new_teacher')}</button>`:''}</div>
      </div>
      <div id="tcTW">${LD()}</div>
    </div><div id="tcFW"></div>`;
  loadTeachers();
}
async function loadTeachers(){
  try{
    let [tR,mR,uR]=await Promise.all([api('getTeachers',{}),api('getMaktabs',{}),api('getUsers',{})]);
    cache.teachers=tR.success?tR.rows:[]; cache.maktabs=mR.success?mR.rows:cache.maktabs; cache.users=uR.success?uR.rows:cache.users;
    let rows=filterByRole(cache.teachers,'teachers');
    let mf=document.getElementById('tcMF'); if(mf){ let ids=[...new Set(rows.map(r=>String(r.MaktabID)).filter(Boolean))]; mf.innerHTML=`<option value="">${T('all_maktabs')}</option>`+ids.map(id=>`<option value="${id}">${esc(mkName(id))}</option>`).join(''); }
    renderTcT(rows);
  }catch{ document.getElementById('tcTW').innerHTML=ED(); }
}
function applyTcF(){
  let q=(document.getElementById('tcQ')?.value||'').toLowerCase(),mf=document.getElementById('tcMF')?.value||'',sf=document.getElementById('tcSF')?.value||'';
  document.querySelectorAll('#tcTable tbody tr').forEach(tr=>{ tr.style.display=(!q||(tr.dataset.s||'').includes(q))&&(!mf||(tr.dataset.m||'')===mf)&&(!sf||(tr.dataset.st||'')===sf)?'':'none'; });
}
function renderTcT(rows){
  let w=document.getElementById('tcTW'); if(!rows.length){ w.innerHTML=ED(T('no_data')); return; }
  let ce=canEdit();
  w.innerHTML=`<div class="tw"><table id="tcTable">
    <thead><tr><th>Name</th><th>Role</th><th>Maktab</th><th>${T('report_to')} (${T('supervisor')})</th><th>CNIC</th><th>Phone</th><th>Exp.</th><th>Status</th><th></th></tr></thead>
    <tbody>${rows.map(r=>`
      <tr data-s="${esc((r.Name+' '+r.CNIC+' '+(r.District||'')).toLowerCase())}" data-m="${esc(String(r.MaktabID||''))}" data-st="${esc((r.Status||'').toLowerCase())}">
        <td><div class="tm">${esc(r.Name)}</div><div class="ts">${esc(r.Gender||'')} · ${esc(r.Qualification||'')}</div></td>
        <td>${esc(r.Designation||'-')}</td>
        <td>${esc(mkName(r.MaktabID))}</td>
        <td><div class="tm">${esc(r.SupervisorName||'-')}</div><div class="ts">${esc(r.SupervisorID||'')}</div></td>
        <td style="font-family:monospace;font-size:11px;">${esc(r.CNIC||'-')}</td>
        <td>${esc(r.Phone||'-')}</td>
        <td>${r.Experience||0}y</td>
        <td>${sBadge(r.Status)}</td>
        <td><div class="ta">${ce?`<button class="btn btn-o btn-ic btn-sm" onclick="openTcForm(${r.ID})">${IC.edit}</button><button class="btn btn-d btn-ic btn-sm" onclick="delTc(${r.ID})">${IC.del}</button>`:'-'}</div></td>
      </tr>`).join('')}
    </tbody></table></div>`;
}
function openTcForm(id){
  let r=id?(cache.teachers.find(t=>String(t.ID)===String(id))||{}):{}; let isE=!!(id&&Object.keys(r).length);
  let mO=cache.maktabs.map(m=>`<option value="${m.ID}" ${String(r.MaktabID)===String(m.ID)?'selected':''}>${esc(m.MaktabName)}</option>`).join('');
  // Supervisor can only be assigned to supervisors linked to this teacher's maktab
  let sO=(cache.users||[]).filter(u=>u.Role==='Supervisor').map(u=>`<option value="${esc(u.Username)}" ${r.SupervisorID===u.Username?'selected':''}>${esc(u.Name||u.Username)}</option>`).join('');
  document.getElementById('tcFW').innerHTML=`
    <div class="card" style="animation:fadeUp .3s ease;">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.teacher}</div><div class="ch-t">${isE?'Edit Teacher':T('new_teacher')}</div></div></div>
      <div class="cb"><div class="fg">
        <div class="fsec">Personal Info</div>
        <div class="ff"><label>Name *</label><input class="fi" id="tc_n" value="${esc(r.Name||'')}"></div>
        <div class="ff"><label>Designation</label><input class="fi" id="tc_d" value="${esc(r.Designation||'')}" placeholder="Qari, Hifz Teacher..."></div>
        <div class="ff"><label>Father's Name</label><input class="fi" id="tc_f" value="${esc(r.FatherName||'')}"></div>
        <div class="ff"><label>CNIC</label><input class="fi" id="tc_cnic" value="${esc(r.CNIC||'')}" placeholder="00000-0000000-0"></div>
        <div class="ff"><label>Date of Birth</label><input class="fi" type="date" id="tc_dob" value="${toDI(r.DOB)}"></div>
        <div class="ff"><label>Gender</label><select class="fsi" id="tc_g"><option value="Male" ${r.Gender==='Male'?'selected':''}>Male</option><option value="Female" ${r.Gender==='Female'?'selected':''}>Female</option></select></div>
        <div class="ff"><label>Tehsil</label><input class="fi" id="tc_teh" value="${esc(r.Tehsil||'')}"></div>
        <div class="ff"><label>District</label><input class="fi" id="tc_dist" value="${esc(r.District||'')}"></div>
        <div class="ff full"><label>Address</label><input class="fi" id="tc_addr" value="${esc(r.Address||'')}"></div>
        <div class="fsec">Academic</div>
        <div class="ff"><label>Qualification</label><input class="fi" id="tc_q" value="${esc(r.Qualification||'')}"></div>
        <div class="ff"><label>Certification</label><input class="fi" id="tc_cert" value="${esc(r.Certification||'')}"></div>
        <div class="ff"><label>Experience (yrs)</label><input class="fi" type="number" id="tc_exp" value="${r.Experience||''}"></div>
        <div class="ff"><label>Appointment Date</label><input class="fi" type="date" id="tc_appt" value="${toDI(r.DateOfAppointment)}"></div>
        <div class="ff"><label>Phone / WhatsApp</label><input class="fi" id="tc_ph" value="${esc(r.Phone||'')}"></div>
        <div class="ff"><label>Salary (PKR)</label><input class="fi" type="number" id="tc_sal" value="${r.Salary||''}"></div>
        <div class="ff"><label>Payment Method</label><select class="fsi" id="tc_stype"><option value="Cash" ${r.SalaryType==='Cash'?'selected':''}>Cash</option><option value="Bank Account" ${r.SalaryType==='Bank Account'?'selected':''}>Bank Account</option></select></div>
        <div class="fsec">Maktab & Reporting</div>
        <div class="ff"><label>Assigned Maktab</label><select class="fsi" id="tc_mak"><option value="">-- Select --</option>${mO}</select></div>
        <div class="ff"><label>${T('report_to')} (${T('supervisor')})</label><select class="fsi" id="tc_sup"><option value="">-- Select --</option>${sO}</select></div>
        <div class="ff"><label>Status</label><select class="fsi" id="tc_st"><option value="Active" ${r.Status==='Active'?'selected':''}>${T('active')}</option><option value="Left" ${r.Status==='Left'?'selected':''}>${T('left')}</option></select></div>
      </div>
      <div class="fa">
        <button class="btn btn-g" onclick="saveTc(${isE?r.ID:'null'})">${T('save')} <span id="tcSp"></span></button>
        <button class="btn btn-o" onclick="document.getElementById('tcFW').innerHTML=''">${T('cancel')}</button>
      </div></div>
    </div>`;
  document.getElementById('tcFW').scrollIntoView({behavior:'smooth'});
}
async function saveTc(id){
  let sp=document.getElementById('tcSp');
  let name=(document.getElementById('tc_n').value||'').trim(); if(!name){ toast(T('error_name'),'error'); return; }
  let su=document.getElementById('tc_sup').value, suU=(cache.users||[]).find(u=>u.Username===su);
  let p={Name:name,Designation:document.getElementById('tc_d').value,FatherName:document.getElementById('tc_f').value,CNIC:document.getElementById('tc_cnic').value,DOB:document.getElementById('tc_dob').value,Gender:document.getElementById('tc_g').value,Tehsil:document.getElementById('tc_teh').value,District:document.getElementById('tc_dist').value,Address:document.getElementById('tc_addr').value,Qualification:document.getElementById('tc_q').value,Certification:document.getElementById('tc_cert').value,Experience:document.getElementById('tc_exp').value,DateOfAppointment:document.getElementById('tc_appt').value,Phone:document.getElementById('tc_ph').value,Salary:document.getElementById('tc_sal').value,SalaryType:document.getElementById('tc_stype').value,MaktabID:document.getElementById('tc_mak').value,SupervisorID:su,SupervisorName:suU?(suU.Name||suU.Username):su,Status:document.getElementById('tc_st').value,CreatedBy:currentUser.Username};
  if(id&&id!=='null')p.ID=id;
  sp.innerHTML='<span class="spinner" style="width:12px;height:12px;"></span>';
  let res=await apiS(id&&id!=='null'?'updateTeacher':'addTeacher',p); sp.innerHTML='';
  if(res.success){ writeLog(id&&id!=='null'?'Update Teacher':'Add Teacher',name); toast(res.offline?T('offline_msg'):'✓ '+T('saved'),res.offline?'warning':'success'); document.getElementById('tcFW').innerHTML=''; loadTeachers(); }
  else toast(res.message||'Error','error');
}
async function delTc(id){
  if(!confirm(T('confirm_delete'))) return;
  let r=await api('deleteTeacher',{ID:id});
  if(r.success){ writeLog('Delete Teacher','ID:'+id); toast('✓ '+T('deleted'),'success'); loadTeachers(); }
  else toast(r.message,'error');
}

/* ===================== STUDENTS ===================== */
function renderStudents(){
  document.getElementById('pageContent').innerHTML=`
    <div class="ph" style="animation:fadeUp .3s ease;"><div class="ph-title">${T('students')}</div><div class="ph-sub">Student Records</div></div>
    <div class="card">
      <div class="tb2">
        <div class="sb2">${IC.search}<input id="stQ" placeholder="${T('search')}" oninput="applyStF()"></div>
        <select class="fsel" id="stMF" onchange="applyStF()"><option value="">${T('all_maktabs')}</option></select>
        <select class="fsel" id="stLF" onchange="applyStF()"><option value="">${T('all_levels')}</option><option value="qaida">Qaida</option><option value="nazra">Nazra</option><option value="hifz">Hifz</option><option value="fehm-ul-quran">Fehm-ul-Quran</option><option value="alam">Alam</option><option value="tafseer">Tafseer</option></select>
        <select class="fsel" id="stSF" onchange="applyStF()"><option value="">${T('all_status')}</option><option value="active">${T('active')}</option><option value="dropout">${T('dropout')}</option></select>
        <div class="mla"><button class="btn btn-g btn-sm" onclick="openStForm()">${IC.add} ${T('new_student')}</button></div>
      </div>
      <div id="stTW">${LD()}</div>
    </div><div id="stFW"></div>`;
  loadStudents();
}
async function loadStudents(){
  try{
    let [sR,mR]=await Promise.all([api('getStudents',{}),api('getMaktabs',{})]);
    cache.students=sR.success?sR.rows:[]; cache.maktabs=mR.success?mR.rows:cache.maktabs;
    let rows=filterByRole(cache.students,'students');
    let mf=document.getElementById('stMF'); if(mf){ let ids=[...new Set(rows.map(r=>String(r.MaktabID)).filter(Boolean))]; mf.innerHTML=`<option value="">${T('all_maktabs')}</option>`+ids.map(id=>`<option value="${id}">${esc(mkName(id))}</option>`).join(''); }
    renderStT(rows);
  }catch{ document.getElementById('stTW').innerHTML=ED(); }
}
function applyStF(){
  let q=(document.getElementById('stQ')?.value||'').toLowerCase(),mf=document.getElementById('stMF')?.value||'',lf=document.getElementById('stLF')?.value||'',sf=document.getElementById('stSF')?.value||'';
  document.querySelectorAll('#stTable tbody tr').forEach(tr=>{ tr.style.display=(!q||(tr.dataset.s||'').includes(q))&&(!mf||(tr.dataset.m||'')===mf)&&(!lf||(tr.dataset.l||'')===lf)&&(!sf||(tr.dataset.st||'')===sf)?'':'none'; });
}
function renderStT(rows){
  let w=document.getElementById('stTW'); if(!rows.length){ w.innerHTML=ED(T('no_data')); return; }
  w.innerHTML=`<div class="tw"><table id="stTable">
    <thead><tr><th>Name</th><th>Father</th><th>Maktab</th><th>Teacher</th><th>Level</th><th>Att%</th><th>Gender</th><th>Status</th><th></th></tr></thead>
    <tbody>${rows.map(r=>`
      <tr data-s="${esc((r.Name+' '+(r.FatherName||'')+(r.CurrentLevel||'')).toLowerCase())}" data-m="${esc(String(r.MaktabID||''))}" data-l="${esc((r.CurrentLevel||'').toLowerCase())}" data-st="${esc((r.Status||'').toLowerCase())}">
        <td><div class="tm">${esc(r.Name)}</div></td>
        <td><div class="tm">${esc(r.FatherName||'-')}</div><div class="ts">${esc(r.FatherPhone||'')}</div></td>
        <td>${esc(mkName(r.MaktabID))}</td>
        <td>${esc(r.TeacherName||'-')}</td>
        <td><span class="badge bb">${esc(r.CurrentLevel||'-')}</span></td>
        <td>${r.Attendance||0}%</td>
        <td>${esc(r.Gender||'-')}</td>
        <td>${sBadge(r.Status)}</td>
        <td><div class="ta">
          <button class="btn btn-o btn-ic btn-sm" onclick="openStForm(${r.ID})">${IC.edit}</button>
          ${canEdit()?`<button class="btn btn-d btn-ic btn-sm" onclick="delSt(${r.ID})">${IC.del}</button>`:''}
        </div></td>
      </tr>`).join('')}
    </tbody></table></div>`;
}
function openStForm(id){
  let r=id?(cache.students.find(s=>String(s.ID)===String(id))||{}):{}; let isE=!!(id&&Object.keys(r).length);
  let mO=cache.maktabs.map(m=>`<option value="${m.ID}" ${String(r.MaktabID)===String(m.ID)?'selected':''}>${esc(m.MaktabName)}</option>`).join('');
  document.getElementById('stFW').innerHTML=`
    <div class="card" style="animation:fadeUp .3s ease;">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.student}</div><div class="ch-t">${isE?'Edit Student':T('new_student')}</div></div></div>
      <div class="cb"><div class="fg">
        <div class="fsec">Personal Info</div>
        <div class="ff"><label>Name *</label><input class="fi" id="st_n" value="${esc(r.Name||'')}"></div>
        <div class="ff"><label>Father's Name</label><input class="fi" id="st_f" value="${esc(r.FatherName||'')}"></div>
        <div class="ff"><label>Father CNIC</label><input class="fi" id="st_fc" value="${esc(r.FatherCNIC||'')}"></div>
        <div class="ff"><label>Father Phone</label><input class="fi" id="st_fp" value="${esc(r.FatherPhone||'')}"></div>
        <div class="ff"><label>Date of Birth</label><input class="fi" type="date" id="st_dob" value="${toDI(r.DOB)}"></div>
        <div class="ff"><label>Gender</label><select class="fsi" id="st_g"><option value="Male" ${r.Gender==='Male'?'selected':''}>Male</option><option value="Female" ${r.Gender==='Female'?'selected':''}>Female</option></select></div>
        <div class="ff full"><label>Address</label><input class="fi" id="st_a" value="${esc(r.Address||'')}"></div>
        <div class="fsec">Academic Info</div>
        <div class="ff"><label>Admission Date</label><input class="fi" type="date" id="st_adm" value="${toDI(r.DateOfAdmission)}"></div>
        <div class="ff"><label>Course Details</label><input class="fi" id="st_c" value="${esc(r.CourseDetails||'')}"></div>
        <div class="ff"><label>Current Level / Course</label><select class="fsi" id="st_l"><option value="Qaida" ${r.CurrentLevel==='Qaida'?'selected':''}>Qaida</option><option value="Nazra" ${r.CurrentLevel==='Nazra'?'selected':''}>Nazra</option><option value="Hifz" ${r.CurrentLevel==='Hifz'?'selected':''}>Hifz (Hafiz)</option><option value="Fehm-ul-Quran" ${r.CurrentLevel==='Fehm-ul-Quran'?'selected':''}>Fehm-ul-Quran</option><option value="Alam" ${r.CurrentLevel==='Alam'?'selected':''}>Alam</option><option value="Tafseer" ${r.CurrentLevel==='Tafseer'?'selected':''}>Tafseer</option><option value="Other" ${r.CurrentLevel==='Other'?'selected':''}>Other</option></select></div>
        <div class="ff"><label>Attendance %</label><input class="fi" type="number" min="0" max="100" id="st_att" value="${r.Attendance||''}"></div>
        <div class="ff"><label>School Going?</label><select class="fsi" id="st_sc" onchange="document.getElementById('st_scd').style.display=this.value==='Yes'?'block':'none'"><option value="No" ${r.SchoolGoing!=='Yes'?'selected':''}>No</option><option value="Yes" ${r.SchoolGoing==='Yes'?'selected':''}>Yes</option></select></div>
        <div class="ff full" id="st_scd" style="display:${r.SchoolGoing==='Yes'?'block':'none'}"><label>School Details</label><input class="fi" id="st_sdet" value="${esc(r.SchoolDetails||'')}"></div>
        <div class="fsec">Maktab & Teacher</div>
        <div class="ff"><label>Maktab</label><select class="fsi" id="st_mak"><option value="">-- Select --</option>${mO}</select></div>
        <div class="ff"><label>Teacher Name</label><input class="fi" id="st_tchr" value="${esc(r.TeacherName||'')}"></div>
        <div class="ff"><label>Status</label><select class="fsi" id="st_st"><option value="Active" ${r.Status==='Active'?'selected':''}>${T('active')}</option><option value="Dropout" ${r.Status==='Dropout'?'selected':''}>${T('dropout')}</option></select></div>
      </div>
      <div class="fa">
        <button class="btn btn-g" onclick="saveSt(${isE?r.ID:'null'})">${T('save')} <span id="stSp"></span></button>
        <button class="btn btn-o" onclick="document.getElementById('stFW').innerHTML=''">${T('cancel')}</button>
      </div></div>
    </div>`;
  document.getElementById('stFW').scrollIntoView({behavior:'smooth'});
}
async function saveSt(id){
  let sp=document.getElementById('stSp');
  let name=(document.getElementById('st_n').value||'').trim(); if(!name){ toast(T('error_name'),'error'); return; }
  let p={Name:name,FatherName:document.getElementById('st_f').value,FatherCNIC:document.getElementById('st_fc').value,FatherPhone:document.getElementById('st_fp').value,DOB:document.getElementById('st_dob').value,Gender:document.getElementById('st_g').value,Address:document.getElementById('st_a').value,DateOfAdmission:document.getElementById('st_adm').value,CourseDetails:document.getElementById('st_c').value,CurrentLevel:document.getElementById('st_l').value,Attendance:document.getElementById('st_att').value,SchoolGoing:document.getElementById('st_sc').value,SchoolDetails:(document.getElementById('st_sdet')||{}).value||'',MaktabID:document.getElementById('st_mak').value,TeacherName:document.getElementById('st_tchr').value,Status:document.getElementById('st_st').value,CreatedBy:currentUser.Username};
  if(id&&id!=='null')p.ID=id;
  sp.innerHTML='<span class="spinner" style="width:12px;height:12px;"></span>';
  let res=await apiS(id&&id!=='null'?'updateStudent':'addStudent',p); sp.innerHTML='';
  if(res.success){ writeLog(id&&id!=='null'?'Update Student':'Add Student',name); toast(res.offline?T('offline_msg'):'✓ '+T('saved'),res.offline?'warning':'success'); document.getElementById('stFW').innerHTML=''; loadStudents(); }
  else toast(res.message||'Error','error');
}
async function delSt(id){
  if(!confirm(T('confirm_delete'))) return;
  let r=await api('deleteStudent',{ID:id});
  if(r.success){ writeLog('Delete Student','ID:'+id); toast('✓ '+T('deleted'),'success'); loadStudents(); }
  else toast(r.message,'error');
}

/* ===================== MAP VIEW ===================== */
function renderMapView(){
  document.getElementById('pageContent').innerHTML=`
    <div class="ph" style="animation:fadeUp .3s ease;"><div class="ph-title">${T('mapview')}</div><div class="ph-sub">Maktab locations on map</div></div>
    <div class="card" style="overflow:hidden;"><div id="mvMap" style="height:380px;"></div></div>
    <div class="card"><div class="ch"><div class="ch-t">${T('maktabs')} with Location</div></div><div id="mvList">${LD()}</div></div>`;
  api('getMaktabs',{}).then(res=>{
    if(!res.success){ document.getElementById('mvList').innerHTML=ED(); return; }
    cache.maktabs=res.rows;
    let rows=filterByRole(res.rows,'maktabs');
    let map=L.map('mvMap').setView(CONFIG.MAP_DEFAULT_CENTER,CONFIG.MAP_DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
    let wl=rows.filter(r=>r.Latitude&&r.Longitude);
    wl.forEach(r=>L.marker([+r.Latitude,+r.Longitude]).addTo(map).bindPopup(`<b>${esc(r.MaktabName)}</b><br>${esc(r.Tehsil)}, ${esc(r.District)}<br>Students: ${r.TotalStudents||0}<br><a href="https://maps.google.com?q=${r.Latitude},${r.Longitude}" target="_blank">📍 Google Maps</a>`));
    if(wl.length>1) map.fitBounds(wl.map(r=>[+r.Latitude,+r.Longitude]),{padding:[20,20]});
    setTimeout(()=>map.invalidateSize(),200);
    document.getElementById('mvList').innerHTML=wl.length?`<div class="tw"><table><thead><tr><th>Maktab</th><th>Tehsil</th><th>District</th><th>Status</th><th></th></tr></thead><tbody>${wl.map(r=>`<tr><td><div class="tm">${esc(r.MaktabName)}</div></td><td>${esc(r.Tehsil)}</td><td>${esc(r.District)}</td><td>${sBadge(r.Status)}</td><td><a href="https://maps.google.com?q=${r.Latitude},${r.Longitude}" target="_blank" class="btn btn-o btn-sm">${IC.location} Maps</a></td></tr>`).join('')}</tbody></table></div>`:ED('No maktabs have location set.');
  }).catch(()=>{ document.getElementById('mvList').innerHTML=ED(); });
}

/* ===================== USERS ===================== */
function renderUsers(){
  if(!isAdmin()){ navigate('dashboard'); return; }
  document.getElementById('pageContent').innerHTML=`
    <div class="ph" style="animation:fadeUp .3s ease;"><div class="ph-title">${T('users')}</div><div class="ph-sub">Manage portal users and reporting structure</div></div>

    <div class="card" style="margin-bottom:16px;padding:16px 18px;background:linear-gradient(135deg,#0d3d4a,#0d7a8a);color:#fff;">
      <div style="font-size:13px;font-weight:700;margin-bottom:8px;">📋 Reporting Chain</div>
      <div style="font-size:12px;color:rgba(255,255,255,.7);line-height:1.8;">
        <b style="color:#fff;">Teacher</b> → reports to → <b style="color:var(--gold-l);">Supervisor</b> (assigned to same Maktab)<br>
        <b style="color:var(--gold-l);">Supervisor</b> → reports to → <b style="color:var(--teal-l);">Admin</b><br>
        <b style="color:var(--teal-l);">Admin</b> → has access to all data, all maktabs
      </div>
    </div>

    <div class="card">
      <div class="tb2"><div class="mla"><button class="btn btn-g btn-sm" onclick="openUsForm()">${IC.add} ${T('new_user')}</button></div></div>
      <div id="usTW">${LD()}</div>
    </div><div id="usFW"></div>`;
  loadUsers();
}
async function loadUsers(){
  try{
    let [uR,mR]=await Promise.all([api('getUsers',{}),api('getMaktabs',{})]);
    cache.users=uR.success?uR.rows:[]; cache.maktabs=mR.success?mR.rows:cache.maktabs;
    renderUsT(cache.users);
  }catch{ document.getElementById('usTW').innerHTML=ED(); }
}
function renderUsT(rows){
  let w=document.getElementById('usTW'); if(!rows.length){ w.innerHTML=ED(T('no_data')); return; }
  w.innerHTML=`<div class="tw"><table>
    <thead><tr><th>Username</th><th>Name</th><th>Role</th><th>${T('assigned_maktab')}</th><th>${T('report_to')}</th><th>Phone</th><th>Status</th><th></th></tr></thead>
    <tbody>${rows.map(r=>`<tr>
      <td><div class="tm">${esc(r.Username)}</div></td>
      <td>${esc(r.Name||'-')}</td>
      <td>${rBadge(r.Role)}</td>
      <td>${esc(r.AssignedMaktab||'-')}</td>
      <td><div class="ts">${r.Role==='Teacher'?'Supervisor':r.Role==='Supervisor'?'Admin':'-'}</div></td>
      <td>${esc(r.Phone||'-')}</td>
      <td>${sBadge(r.Status)}</td>
      <td><div class="ta"><button class="btn btn-o btn-ic btn-sm" onclick="openUsForm('${esc(r.Username)}')">${IC.edit}</button><button class="btn btn-d btn-ic btn-sm" onclick="delUs('${esc(r.Username)}')">${IC.del}</button></div></td>
    </tr>`).join('')}</tbody></table></div>`;
}
function openUsForm(username){
  let r=username?((cache.users||[]).find(u=>u.Username===username)||{}):{}; let isE=!!(username&&Object.keys(r).length);
  // Multi-maktab selection for supervisors
  let mOpts=cache.maktabs.map(m=>`<option value="${esc(m.MaktabName)}" ${r.AssignedMaktab===m.MaktabName||(r.AssignedMaktab||'').includes(m.MaktabName)?'selected':''}>${esc(m.MaktabName)}</option>`).join('');
  document.getElementById('usFW').innerHTML=`
    <div class="card" style="animation:fadeUp .3s ease;">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.users}</div><div><div class="ch-t">${isE?'Edit User':T('new_user')}</div><div class="ch-s">Role determines access level and reporting chain</div></div></div></div>
      <div class="cb"><div class="fg">
        <div class="ff"><label>Username *</label><input class="fi" id="us_u" value="${esc(r.Username||'')}" ${isE?'readonly style="background:#f1f5f9;"':''}></div>
        <div class="ff"><label>Password ${isE?'(blank = no change)':'*'}</label><input class="fi" id="us_p" type="text" placeholder="${isE?'Enter to change':''}"></div>
        <div class="ff"><label>Full Name</label><input class="fi" id="us_n" value="${esc(r.Name||'')}"></div>
        <div class="ff"><label>Role</label>
          <select class="fsi" id="us_r" onchange="showMaktabField(this.value)">
            <option value="Admin" ${r.Role==='Admin'?'selected':''}>Admin (All access)</option>
            <option value="Supervisor" ${r.Role==='Supervisor'?'selected':''}>Supervisor (Assigned maktabs)</option>
            <option value="Teacher" ${r.Role==='Teacher'?'selected':''}>Teacher (Own maktab only)</option>
          </select>
        </div>
        <div class="ff" id="maktabAssignField" style="${r.Role==='Admin'?'display:none':''}"><label>${T('assigned_maktab')} (${T('supervisor')}: comma-separated for multiple)</label>
          <input class="fi" id="us_mfree" value="${esc(r.AssignedMaktab||'')}" placeholder="MaktabName1, MaktabName2">
        </div>
        <div class="ff"><label>Phone</label><input class="fi" id="us_ph" value="${esc(r.Phone||'')}"></div>
        <div class="ff"><label>Status</label><select class="fsi" id="us_st"><option value="Active" ${r.Status==='Active'?'selected':''}>${T('active')}</option><option value="Inactive" ${r.Status==='Inactive'?'selected':''}>${T('inactive')}</option></select></div>
      </div>
      <div class="fa">
        <button class="btn btn-g" onclick="saveUs(${isE})">${T('save')} <span id="usSp"></span></button>
        <button class="btn btn-o" onclick="document.getElementById('usFW').innerHTML=''">${T('cancel')}</button>
      </div></div>
    </div>`;
  document.getElementById('usFW').scrollIntoView({behavior:'smooth'});
}
function showMaktabField(role){
  let f=document.getElementById('maktabAssignField');
  if(f) f.style.display=role==='Admin'?'none':'';
}
async function saveUs(isE){
  let sp=document.getElementById('usSp');
  let un=(document.getElementById('us_u').value||'').trim(), pw=document.getElementById('us_p').value;
  if(!un){ toast(T('error_username'),'error'); return; }
  if(!isE&&!pw){ toast(T('error_pass'),'error'); return; }
  let role=document.getElementById('us_r').value;
  let assigned=role==='Admin'?'All':(document.getElementById('us_mfree').value||'');
  let p={Username:un,Name:document.getElementById('us_n').value,Role:role,AssignedMaktab:assigned,Phone:document.getElementById('us_ph').value,Status:document.getElementById('us_st').value};
  if(pw)p.Password=pw; if(isE){p.username_key=un;p.ID=un;}
  sp.innerHTML='<span class="spinner" style="width:12px;height:12px;"></span>';
  let res=await api(isE?'updateUser':'addUser',p); sp.innerHTML='';
  if(res.success){ writeLog(isE?'Update User':'Add User',un); toast('✓ '+T('saved'),'success'); document.getElementById('usFW').innerHTML=''; loadUsers(); }
  else toast(res.message||'Error','error');
}
async function delUs(username){
  if(!confirm(T('confirm_delete'))) return;
  let r=await api('deleteUser',{ID:username,username_key:username});
  if(r.success){ writeLog('Delete User',username); toast('✓ '+T('deleted'),'success'); loadUsers(); }
  else toast(r.message,'error');
}

/* ===================== LOGS (Admin only) ===================== */
function renderLogs(){
  if(!isAdmin()){ navigate('dashboard'); return; }
  document.getElementById('pageContent').innerHTML=`
    <div class="ph" style="animation:fadeUp .3s ease;"><div class="ph-title">${T('log_title')}</div><div class="ph-sub">${T('log_sub')}</div></div>
    <div class="card">
      <div class="tb2">
        <div class="sb2">${IC.search}<input id="logQ" placeholder="${T('search')}" oninput="applyLogF()"></div>
        <select class="fsel" id="logRF" onchange="applyLogF()">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="supervisor">Supervisor</option>
          <option value="teacher">Teacher</option>
        </select>
        <select class="fsel" id="logAF" onchange="applyLogF()">
          <option value="">All Actions</option>
          <option value="login">Login</option>
          <option value="add">Add</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="logout">Logout</option>
        </select>
      </div>
      <div id="logWrap">${LD()}</div>
    </div>`;
  loadLogs();
}
async function loadLogs(){
  try{
    let res=await api('getLogs',{});
    if(!res.success){ document.getElementById('logWrap').innerHTML=ED(); return; }
    cache.logs=res.rows||[];
    renderLogT(cache.logs);
  }catch{ document.getElementById('logWrap').innerHTML=ED(); }
}
function applyLogF(){
  let q=(document.getElementById('logQ')?.value||'').toLowerCase();
  let rf=document.getElementById('logRF')?.value||'';
  let af=document.getElementById('logAF')?.value||'';
  document.querySelectorAll('#logTable tbody tr').forEach(tr=>{
    tr.style.display=(!q||(tr.dataset.s||'').includes(q))&&(!rf||(tr.dataset.r||'')===rf)&&(!af||(tr.dataset.a||'').startsWith(af))?'':'none';
  });
}
function renderLogT(rows){
  let w=document.getElementById('logWrap'); if(!rows.length){ w.innerHTML=ED('No activity log yet.'); return; }
  let roleColor={Admin:'#8b5cf6',Supervisor:'#3b82f6',Teacher:'#10b981'};
  let actionColor={login:'#10b981',logout:'#f97316',Add:'#3b82f6',Update:'#f59e0b',Delete:'#ef4444'};
  w.innerHTML=`<div class="tw"><table id="logTable">
    <thead><tr><th>Time</th><th>User</th><th>Role</th><th>Action</th><th>Detail</th></tr></thead>
    <tbody>${rows.slice().reverse().map(r=>{
      let aC=Object.keys(actionColor).find(k=>String(r.action||'').startsWith(k));
      let clr=actionColor[aC]||'#94a3b8';
      return `<tr data-s="${esc((r.user+' '+r.action+' '+r.detail).toLowerCase())}" data-r="${esc((r.role||'').toLowerCase())}" data-a="${esc((r.action||'').toLowerCase())}">
        <td style="font-size:11px;color:var(--text3);font-family:monospace;">${fmtTime(r.time)}</td>
        <td><div class="tm">${esc(r.user||'-')}</div></td>
        <td><span class="badge" style="background:${roleColor[r.role]||'#94a3b8'}22;color:${roleColor[r.role]||'#94a3b8'};">${esc(r.role||'-')}</span></td>
        <td><span class="badge" style="background:${clr}22;color:${clr};">${esc(r.action||'-')}</span></td>
        <td style="font-size:12px;">${esc(r.detail||'-')}</td>
      </tr>`;
    }).join('')}
    </tbody></table></div>`;
}

/* ===================== REPORTS (Admin only) ===================== */
let MSEL={rpMk:[], rpSup:[], rpCourse:[]};
window._rpLast=null;

function renderReports(){
  if(!isAdmin()){ navigate('dashboard'); return; }
  MSEL={rpMk:[], rpSup:[], rpCourse:[]}; window._rpLast=null;
  document.getElementById('pageContent').innerHTML=`
    <div class="ph" style="animation:fadeUp .3s ease;"><div class="ph-title">${T('reports')}</div><div class="ph-sub">${T('report_sub')}</div></div>
    <div class="card no-print">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.report}</div><div class="ch-t">${T('report_type')}</div></div></div>
      <div class="cb">
        <div class="fg">
          <div class="ff"><label>${T('report_type')}</label>
            <select class="fsi" id="rpType" onchange="onRpTypeChange()">
              <option value="overall">${T('rp_overall')}</option>
              <option value="supervisor">${T('rp_supervisor')}</option>
              <option value="course">${T('rp_course')}</option>
              <option value="maktab">${T('rp_maktab')}</option>
              <option value="students">${T('rp_students')}</option>
              <option value="teachers">${T('rp_teachers')}</option>
              <option value="attendance">${T('rp_attendance')}</option>
            </select>
          </div>
          <div class="ff"><label>${T('select_supervisor')}</label>
            <div class="msel" id="rpSupMsel">
              <button type="button" class="fsi msel-btn" id="rpSupBtn" onclick="toggleMselPanel('rpSup')">${T('all_supervisors')}</button>
              <div class="msel-panel" id="rpSupPanel"></div>
            </div>
          </div>
          <div class="ff"><label>${T('select_maktab')}</label>
            <div class="msel" id="rpMkMselWrap">
              <button type="button" class="fsi msel-btn" id="rpMkBtn" onclick="toggleMselPanel('rpMk')">${T('all_maktabs')}</button>
              <div class="msel-panel" id="rpMkPanel"></div>
            </div>
          </div>
          <div class="ff"><label>${T('select_course')}</label>
            <div class="msel" id="rpCourseMselWrap">
              <button type="button" class="fsi msel-btn" id="rpCourseBtn" onclick="toggleMselPanel('rpCourse')">${T('all_courses')}</button>
              <div class="msel-panel" id="rpCoursePanel"></div>
            </div>
          </div>
          <div class="ff"><label>${T('all_districts')}</label>
            <select class="fsi" id="rpDistrict"><option value="">${T('all_districts')}</option></select>
          </div>
          <div class="ff"><label>${T('all_status')}</label>
            <select class="fsi" id="rpStatus"><option value="">${T('all_status')}</option><option value="Active">${T('active')}</option><option value="Inactive">${T('inactive')}</option></select>
          </div>
          <div class="ff"><label>${T('from_date')}</label><input class="fsi" type="date" id="rpFrom"></div>
          <div class="ff"><label>${T('to_date')}</label><input class="fsi" type="date" id="rpTo"></div>
          <div class="ff" id="rpGenderWrap" style="display:none;"><label>${T('boys_girls')}</label>
            <select class="fsi" id="rpGender"><option value="">${T('all_status')}</option><option value="male">${T('boys')}</option><option value="female">${T('girls')}</option></select>
          </div>
          <div class="ff" id="rpThreshWrap" style="display:none;"><label>${T('attendance_threshold')}</label>
            <input class="fsi" type="number" min="0" max="100" id="rpThresh" value="75">
          </div>
        </div>
        <div class="fa">
          <button class="btn btn-g" onclick="generateReport()">${IC.report} ${T('generate_report')} <span id="rpSp"></span></button>
        </div>
      </div>
    </div>
    <div class="card no-print">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.log||IC.report}</div><div class="ch-t">${T('recent_reports')}</div></div></div>
      <div id="rpHistory">${LD()}</div>
    </div>
    <div id="rpOut"><div class="card"><div class="cb" style="color:var(--text3);font-size:12.5px;text-align:center;padding:30px 10px;">${T('select_filters')}</div></div></div>`;
  loadReportFilters();
  loadReportHistory();
  if(!window._rpOutsideBound){
    window._rpOutsideBound=true;
    document.addEventListener('click', e=>{
      if(!e.target.closest('.msel')) document.querySelectorAll('.msel-panel').forEach(p=>p.classList.remove('open'));
    });
  }
}

/* ---- Multi-select (Maktab / Supervisor / Course) ---- */
function toggleMselPanel(prefix){
  let panel=document.getElementById(prefix+'Panel');
  document.querySelectorAll('.msel-panel').forEach(p=>{ if(p.id!==prefix+'Panel') p.classList.remove('open'); });
  if(panel) panel.classList.toggle('open');
}
function buildMselPanel(prefix, items){
  let sel=MSEL[prefix]||[];
  if(!items.length) return `<div class="msel-empty">${T('no_data')}</div>`;
  return items.map(it=>`
    <label class="msel-item">
      <input type="checkbox" value="${esc(it.value)}" ${sel.includes(String(it.value))?'checked':''} onchange="onMselChange('${prefix}', this)">
      <span>${esc(it.label)}</span>
    </label>`).join('');
}
function onMselChange(prefix, cb){
  let sel=MSEL[prefix]||(MSEL[prefix]=[]);
  let v=cb.value;
  if(cb.checked){ if(!sel.includes(v)) sel.push(v); } else { let i=sel.indexOf(v); if(i>-1) sel.splice(i,1); }
  updateMselLabel(prefix);
}
function updateMselLabel(prefix){
  let sel=MSEL[prefix]||[];
  let btnId={rpMk:'rpMkBtn', rpSup:'rpSupBtn', rpCourse:'rpCourseBtn'}[prefix];
  let allLabel={rpMk:T('all_maktabs'), rpSup:T('all_supervisors'), rpCourse:T('all_courses')}[prefix];
  let btn=document.getElementById(btnId);
  if(btn) btn.innerHTML=(sel.length?(sel.length+' '+T('selected_count')):allLabel)+' <span style="opacity:.5;">▾</span>';
}

async function loadReportFilters(){
  try{
    if(!cache.maktabs.length){ let r=await api('getMaktabs',{}); if(r.success) cache.maktabs=r.rows; }
    if(!cache.students.length){ let r=await api('getStudents',{}); if(r.success) cache.students=r.rows; }
    let mkPanel=document.getElementById('rpMkPanel');
    if(mkPanel) mkPanel.innerHTML=buildMselPanel('rpMk', cache.maktabs.map(m=>({value:m.ID,label:m.MaktabName})));
    let dSel=document.getElementById('rpDistrict');
    let ds=[...new Set(cache.maktabs.map(m=>m.District).filter(Boolean))].sort();
    if(dSel) dSel.innerHTML=`<option value="">${T('all_districts')}</option>`+ds.map(d=>`<option value="${esc(d)}">${esc(d)}</option>`).join('');
    let supPanel=document.getElementById('rpSupPanel');
    if(supPanel){
      let seen={}, opts=[];
      cache.maktabs.forEach(m=>{ let id=m.SupervisorID; if(!id) return; if(!seen[id]){ seen[id]=1; opts.push({value:id, label:m.SupervisorName||id}); } });
      opts.sort((a,b)=>a.label.localeCompare(b.label));
      supPanel.innerHTML=buildMselPanel('rpSup', opts);
    }
    let coursePanel=document.getElementById('rpCoursePanel');
    if(coursePanel){
      let cs=[...new Set(cache.students.map(s=>s.CurrentLevel).filter(Boolean))].sort();
      coursePanel.innerHTML=buildMselPanel('rpCourse', cs.map(c=>({value:c,label:c})));
    }
    updateMselLabel('rpMk'); updateMselLabel('rpSup'); updateMselLabel('rpCourse');
  }catch{}
}

async function loadReportHistory(){
  let w=document.getElementById('rpHistory'); if(!w) return;
  try{
    let res=await api('getLogs',{});
    let logs=(res.success?(res.rows||[]):[]).filter(r=>r.action==='report'||r.action==='export').slice(-10).reverse();
    if(!logs.length){ w.innerHTML=`<div class="cb" style="color:var(--text3);font-size:12px;text-align:center;padding:16px;">${T('no_data')}</div>`; return; }
    w.innerHTML=`<div class="tw"><table>
      <thead><tr><th>${T('report_generated_on')}</th><th>User</th><th>Detail</th></tr></thead>
      <tbody>${logs.map(r=>`<tr><td style="font-size:11px;color:var(--text3);font-family:monospace;">${fmtTime(r.time)}</td><td><div class="tm">${esc(r.user||'-')}</div></td><td style="font-size:12px;">${esc(r.detail||r.action||'-')}</td></tr>`).join('')}</tbody>
    </table></div>`;
  }catch{ w.innerHTML=`<div class="cb" style="color:var(--text3);font-size:12px;text-align:center;padding:16px;">${T('no_data')}</div>`; }
}

function onRpTypeChange(){
  let t=document.getElementById('rpType')?.value;
  let gw=document.getElementById('rpGenderWrap'); if(gw) gw.style.display = t==='students' ? '' : 'none';
  let tw=document.getElementById('rpThreshWrap'); if(tw) tw.style.display = t==='attendance' ? '' : 'none';
}

async function generateReport(){
  let type=document.getElementById('rpType').value;
  let mkIds=MSEL.rpMk.slice();
  let supIds=MSEL.rpSup.slice();
  let courseIds=MSEL.rpCourse.slice();
  let dist=document.getElementById('rpDistrict').value;
  let status=document.getElementById('rpStatus').value;
  let gender=document.getElementById('rpGender')?.value||'';
  let fromD=document.getElementById('rpFrom')?.value||'';
  let toD=document.getElementById('rpTo')?.value||'';
  let threshold=parseFloat(document.getElementById('rpThresh')?.value)||75;
  let sp=document.getElementById('rpSp'); if(sp) sp.innerHTML='<span class="spinner" style="width:12px;height:12px;border-top-color:#fff;"></span>';
  document.getElementById('rpOut').innerHTML=LD();
  try{
    let [mR,tR,sR]=await Promise.all([api('getMaktabs',{}),api('getTeachers',{}),api('getStudents',{})]);
    cache.maktabs=mR.success?mR.rows:[];
    cache.teachers=tR.success?tR.rows:[];
    cache.students=sR.success?sR.rows:[];

    // Maktab-level filters (AND logic)
    let mk=cache.maktabs.slice();
    if(mkIds.length)  mk=mk.filter(m=>mkIds.includes(String(m.ID)));
    if(supIds.length) mk=mk.filter(m=>supIds.includes(String(m.SupervisorID||'')));
    if(dist)   mk=mk.filter(m=>m.District===dist);
    if(status) mk=mk.filter(m=>(m.Status||'')===status);

    let ids=mk.map(m=>String(m.ID));
    let tc=cache.teachers.filter(t=>ids.includes(String(t.MaktabID)));
    let st=cache.students.filter(s=>ids.includes(String(s.MaktabID)));
    if(status){ tc=tc.filter(t=>(t.Status||'')===status); st=st.filter(s=>(s.Status||'')===status); }
    if(courseIds.length) st=st.filter(s=>courseIds.includes(s.CurrentLevel||''));
    if(type==='students' && gender) st=st.filter(s=>String(s.Gender||'').toLowerCase().startsWith(gender==='male'?'m':'f'));

    if(fromD||toD){
      let f=fromD?new Date(fromD):null, t2=toD?new Date(toD):null;
      st=st.filter(s=>{ let d=s.DateOfAdmission?new Date(s.DateOfAdmission):null; if(!d||isNaN(d)) return false; return (!f||d>=f)&&(!t2||d<=t2); });
      tc=tc.filter(t3=>{ let d=t3.DateOfAppointment?new Date(t3.DateOfAppointment):null; if(!d||isNaN(d)) return false; return (!f||d>=f)&&(!t2||d<=t2); });
    }

    window._rpLast={type, mk, tc, st, threshold};

    let html='';
    if(type==='overall')          html=buildOverallReport(mk,tc,st);
    else if(type==='supervisor')  html=buildSupervisorReport(mk,tc,st);
    else if(type==='course')      html=buildCourseReport(st);
    else if(type==='maktab')      html=buildMaktabReport(mk,tc,st);
    else if(type==='students')    html=buildStudentsReport(st);
    else if(type==='teachers')    html=buildTeachersReport(tc);
    else if(type==='attendance')  html=buildAttendanceReport(st,threshold);

    document.getElementById('rpOut').innerHTML=html;
    writeLog('report','Generated '+type+' report'+(mkIds.length?(' | '+mkIds.length+' maktab(s)'):'')+(supIds.length?(' | '+supIds.length+' supervisor(s)'):''));
    loadReportHistory();
  }catch{
    document.getElementById('rpOut').innerHTML=`<div class="card"><div class="cb">${ED('Connection error — check internet.')}</div></div>`;
  }
  if(sp) sp.innerHTML='';
}

function rpHeader(title, sub){
  let now=new Date();
  return `<div class="rp-head">
    <img src="ISRA_QURAN_ACADEMY_LOGO.jpeg" alt="logo">
    <div class="rp-head-t">
      <h2>ISRA Quran Academy</h2>
      <div>${esc(title)}</div>
      <small>${esc(sub||'')}</small>
    </div>
    <div class="rp-head-m">
      <div>${T('report_generated_on')}: ${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB',{hour12:false})}</div>
      <div>${T('generated_by')}: ${esc(currentUser.Name||currentUser.Username)}</div>
    </div>
  </div>`;
}

function rpActions(){
  return `<div class="fa no-print" style="margin-top:0;padding-top:0;border-top:none;">
    <button class="btn btn-o btn-sm" onclick="printReport()">${IC.print} ${T('print_report')}</button>
    <button class="btn btn-o btn-sm" onclick="exportReportXLSX()">${IC.download} ${T('export_excel')}</button>
  </div>`;
}

function statCard(n,label){
  return `<div class="sc" style="min-width:100px;"><div class="sc-n">${esc(String(n))}</div><div class="sc-l">${esc(label)}</div></div>`;
}

/* ---- Mini charts (bar + donut) ---- */
function barChartHTML(dataObj, color){
  let keys=Object.keys(dataObj).sort((a,b)=>dataObj[b]-dataObj[a]);
  if(!keys.length) return `<div class="chart-empty">${IC.chart}<p>${T('no_data')}</p></div>`;
  let max=Math.max(...keys.map(k=>dataObj[k]));
  return keys.slice(0,10).map(k=>`
    <div class="br">
      <div class="br-l">${esc(k)}</div>
      <div class="br-t"><div class="br-f" style="background:${color};width:${max?(dataObj[k]/max*100):0}%;"></div></div>
      <div class="br-v">${dataObj[k]}</div>
    </div>`).join('');
}
function donutSVG(boys,girls){
  let total=boys+girls;
  if(!total) return `<div class="chart-empty">${IC.chart}<p>${T('no_data')}</p></div>`;
  let r=42, c=2*Math.PI*r;
  let boysFrac=boys/total, boysLen=c*boysFrac;
  return `<div class="rp-donut-wrap">
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r="${r}" fill="none" stroke="#f1f5f9" stroke-width="14"/>
      <circle cx="55" cy="55" r="${r}" fill="none" stroke="#3b82f6" stroke-width="14" stroke-dasharray="${boysLen} ${c-boysLen}" transform="rotate(-90 55 55)"/>
      <circle cx="55" cy="55" r="${r}" fill="none" stroke="#ec4899" stroke-width="14" stroke-dasharray="${c-boysLen} ${boysLen}" stroke-dashoffset="${-boysLen}" transform="rotate(-90 55 55)"/>
      <text x="55" y="50" text-anchor="middle" font-size="18" font-weight="800" fill="#1e293b">${total}</text>
      <text x="55" y="66" text-anchor="middle" font-size="9" fill="#94a3b8">${T('total_students')}</text>
    </svg>
    <div class="rp-donut-leg">
      <span><i style="background:#3b82f6;"></i>${T('boys')}: <b>${boys}</b> (${Math.round(boysFrac*100)}%)</span>
      <span><i style="background:#ec4899;"></i>${T('girls')}: <b>${girls}</b> (${Math.round(100-boysFrac*100)}%)</span>
    </div>
  </div>`;
}

/* ---- Shared data helpers ---- */
function districtBreakdown(mk,tc,st){
  let byDist={};
  mk.forEach(m=>{ let d=m.District||'-'; byDist[d]=byDist[d]||{mk:0,st:0,tc:0}; byDist[d].mk++; });
  st.forEach(s=>{ let m=cache.maktabs.find(x=>String(x.ID)===String(s.MaktabID)); let d=m?(m.District||'-'):'-'; byDist[d]=byDist[d]||{mk:0,st:0,tc:0}; byDist[d].st++; });
  tc.forEach(t=>{ let m=cache.maktabs.find(x=>String(x.ID)===String(t.MaktabID)); let d=m?(m.District||'-'):'-'; byDist[d]=byDist[d]||{mk:0,st:0,tc:0}; byDist[d].tc++; });
  return byDist;
}
function groupBySupervisor(mk,tc,st){
  let groups={};
  mk.forEach(m=>{
    let key=m.SupervisorID||'__none__'; let name=m.SupervisorName||T('unassigned');
    if(!groups[key]) groups[key]={name, maktabs:[], students:0, teachers:0};
    groups[key].maktabs.push(m);
  });
  st.forEach(s=>{ let m=mk.find(x=>String(x.ID)===String(s.MaktabID)); if(!m) return; let key=m.SupervisorID||'__none__'; if(groups[key]) groups[key].students++; });
  tc.forEach(t=>{ let m=mk.find(x=>String(x.ID)===String(t.MaktabID)); if(!m) return; let key=m.SupervisorID||'__none__'; if(groups[key]) groups[key].teachers++; });
  return groups;
}
function attendanceRiskList(st, threshold){
  return st.filter(s=>(parseFloat(s.Attendance)||0)<threshold || String(s.Status||'').toLowerCase()==='dropout')
    .sort((a,b)=>(parseFloat(a.Attendance)||0)-(parseFloat(b.Attendance)||0));
}
function riskLabel(s, threshold){
  if(String(s.Status||'').toLowerCase()==='dropout') return T('dropout');
  if((parseFloat(s.Attendance)||0)<threshold) return T('low_attendance');
  return '-';
}

/* ---- Report builders (on-screen HTML) ---- */
function buildOverallReport(mk,tc,st){
  let am=mk.filter(m=>(m.Status||'')==='Active').length;
  let boys=st.filter(s=>String(s.Gender||'').toLowerCase().startsWith('m')).length;
  let girls=st.filter(s=>String(s.Gender||'').toLowerCase().startsWith('f')).length;
  let byDist=districtBreakdown(mk,tc,st);
  let barData={}; Object.keys(byDist).forEach(d=>barData[d]=byDist[d].mk);

  return `<div id="reportPrintArea">
    ${rpHeader(T('rp_overall'), T('report_sub'))}
    ${rpActions()}
    <div class="sg" style="margin-top:14px;grid-template-columns:repeat(5,1fr);">
      ${statCard(mk.length,T('total_maktabs'))}
      ${statCard(am,T('active_maktabs'))}
      ${statCard(st.length,T('total_students'))}
      ${statCard(boys+' / '+girls,T('boys_girls'))}
      ${statCard(tc.length,T('total_teachers'))}
    </div>
    <div class="card">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.chart}</div><div class="ch-t">${T('boys_girls')}</div></div></div>
      <div class="cb">${donutSVG(boys,girls)}</div>
    </div>
    <div class="card">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.chart}</div><div class="ch-t">${T('schools_by_district')}</div></div></div>
      <div class="cb">${barChartHTML(barData,'var(--teal)')}</div>
    </div>
    <div class="card">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.chart}</div><div class="ch-t">${T('schools_by_district')}</div></div></div>
      <div class="tw"><table id="rpOverallTable">
        <thead><tr><th>District</th><th>${T('total_maktabs')}</th><th>${T('total_students')}</th><th>${T('total_teachers')}</th></tr></thead>
        <tbody>${Object.keys(byDist).length?Object.keys(byDist).sort().map(d=>`<tr><td>${esc(d)}</td><td>${byDist[d].mk}</td><td>${byDist[d].st}</td><td>${byDist[d].tc}</td></tr>`).join(''):`<tr><td colspan="4" style="text-align:center;color:var(--text3);">${T('no_data')}</td></tr>`}</tbody>
      </table></div>
    </div>
  </div>`;
}

function buildSupervisorReport(mk,tc,st){
  if(!mk.length) return `<div class="card no-print"><div class="cb">${ED(T('no_data'))}</div></div>`;
  let groups=groupBySupervisor(mk,tc,st);
  let keys=Object.keys(groups).sort((a,b)=>groups[b].maktabs.length-groups[a].maktabs.length);
  let barData={}; keys.forEach(k=>barData[groups[k].name]=groups[k].maktabs.length);

  return `<div id="reportPrintArea">
    ${rpHeader(T('rp_supervisor'), T('report_sub'))}
    ${rpActions()}
    <div class="sg" style="margin-top:14px;grid-template-columns:repeat(4,1fr);">
      ${statCard(keys.length,T('supervisor'))}
      ${statCard(mk.length,T('total_maktabs'))}
      ${statCard(st.length,T('total_students'))}
      ${statCard(tc.length,T('total_teachers'))}
    </div>
    <div class="card">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.chart}</div><div class="ch-t">${T('rp_supervisor')}</div></div></div>
      <div class="cb">${barChartHTML(barData,'var(--purple)')}</div>
    </div>
    <div class="card">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.users}</div><div class="ch-t">${T('rp_supervisor')}</div></div></div>
      <div class="tw"><table id="rpSupTable">
        <thead><tr><th>${T('supervisor')}</th><th>${T('total_maktabs')}</th><th>${T('maktab_names')}</th><th>${T('total_students')}</th><th>${T('total_teachers')}</th></tr></thead>
        <tbody>${keys.map(k=>{
          let g=groups[k];
          return `<tr><td><b>${esc(g.name)}</b></td><td style="text-align:center;"><b>${g.maktabs.length}</b></td><td style="font-size:11px;color:var(--text2);">${esc(g.maktabs.map(m=>m.MaktabName).join(', '))}</td><td>${g.students}</td><td>${g.teachers}</td></tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>
  </div>`;
}

function buildCourseReport(st){
  if(!st.length) return `<div class="card no-print"><div class="cb">${ED(T('no_data'))}</div></div>`;
  let groups={};
  st.forEach(s=>{
    let key=s.CurrentLevel||T('unassigned');
    if(!groups[key]) groups[key]={total:0, boys:0, girls:0};
    groups[key].total++;
    let g=String(s.Gender||'').toLowerCase();
    if(g.startsWith('m')) groups[key].boys++; else if(g.startsWith('f')) groups[key].girls++;
  });
  let keys=Object.keys(groups).sort((a,b)=>groups[b].total-groups[a].total);
  let barData={}; keys.forEach(k=>barData[k]=groups[k].total);
  let total=st.length;

  return `<div id="reportPrintArea">
    ${rpHeader(T('rp_course'), T('report_sub'))}
    ${rpActions()}
    <div class="sg" style="margin-top:14px;grid-template-columns:repeat(3,1fr);">
      ${statCard(keys.length,T('course'))}
      ${statCard(total,T('total_students'))}
      ${statCard(keys[0]||'-',T('top_course'))}
    </div>
    <div class="card">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.chart}</div><div class="ch-t">${T('rp_course')}</div></div></div>
      <div class="cb">${barChartHTML(barData,'var(--cyan)')}</div>
    </div>
    <div class="card">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.student}</div><div class="ch-t">${T('rp_course')}</div></div></div>
      <div class="tw"><table id="rpCourseTable">
        <thead><tr><th>${T('course')}</th><th>${T('total_students')}</th><th>${T('boys')}</th><th>${T('girls')}</th><th>%</th></tr></thead>
        <tbody>${keys.map(k=>{
          let g=groups[k];
          return `<tr><td><b>${esc(k)}</b></td><td>${g.total}</td><td>${g.boys}</td><td>${g.girls}</td><td>${total?Math.round(g.total/total*100):0}%</td></tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>
  </div>`;
}

function buildMaktabReport(mk,tc,st){
  if(!mk.length) return `<div class="card no-print"><div class="cb">${ED(T('no_data'))}</div></div>`;
  return `<div id="reportPrintArea">
    ${rpActions()}
    ${mk.map((m,i)=>buildSingleMaktabBlock(m,tc,st)+(i<mk.length-1?'<div class="rp-pagebreak"></div>':'')).join('')}
  </div>`;
}

function buildSingleMaktabBlock(m,tc,st){
  let myT=tc.filter(t=>String(t.MaktabID)===String(m.ID));
  let myS=st.filter(s=>String(s.MaktabID)===String(m.ID));
  let boys=myS.filter(s=>String(s.Gender||'').toLowerCase().startsWith('m')).length;
  let girls=myS.filter(s=>String(s.Gender||'').toLowerCase().startsWith('f')).length;
  return `
    ${rpHeader(m.MaktabName, (m.FullAddress||'')+(m.District?(' — '+m.District):''))}
    <div class="sg" style="margin-top:14px;grid-template-columns:repeat(4,1fr);">
      ${statCard(myS.length,T('total_students'))}
      ${statCard(boys+' / '+girls,T('boys_girls'))}
      ${statCard(myT.length,T('total_teachers'))}
      ${statCard(T(String(m.Status||'-').toLowerCase())||m.Status||'-','Status')}
    </div>
    <div class="card">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.teacher}</div><div class="ch-t">${T('teachers')}</div></div></div>
      <div class="tw"><table>
        <thead><tr><th>Name</th><th>Designation</th><th>Phone</th><th>Status</th></tr></thead>
        <tbody>${myT.length?myT.map(t=>`<tr><td>${esc(t.Name)}</td><td>${esc(t.Designation||'-')}</td><td>${esc(t.Phone||'-')}</td><td>${esc(t.Status||'-')}</td></tr>`).join(''):`<tr><td colspan="4" style="text-align:center;color:var(--text3);">${T('no_data')}</td></tr>`}</tbody>
      </table></div>
    </div>
    <div class="card">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.student}</div><div class="ch-t">${T('students')}</div></div></div>
      <div class="tw"><table>
        <thead><tr><th>Name</th><th>Father</th><th>Gender</th><th>Level</th><th>Status</th></tr></thead>
        <tbody>${myS.length?myS.map(s=>`<tr><td>${esc(s.Name)}</td><td>${esc(s.FatherName||'-')}</td><td>${esc(s.Gender||'-')}</td><td>${esc(s.CurrentLevel||'-')}</td><td>${esc(s.Status||'-')}</td></tr>`).join(''):`<tr><td colspan="5" style="text-align:center;color:var(--text3);">${T('no_data')}</td></tr>`}</tbody>
      </table></div>
    </div>`;
}

function buildStudentsReport(st){
  return `<div id="reportPrintArea">
    ${rpHeader(T('rp_students'),T('report_sub'))}
    ${rpActions()}
    <div class="sg" style="margin-top:14px;grid-template-columns:repeat(3,1fr);">${statCard(st.length,T('total_students'))}</div>
    <div class="card"><div class="tw"><table id="rpStTable">
      <thead><tr><th>Name</th><th>Father</th><th>Gender</th><th>Maktab</th><th>Level</th><th>Admission</th><th>Status</th></tr></thead>
      <tbody>${st.length?st.map(s=>`<tr><td>${esc(s.Name)}</td><td>${esc(s.FatherName||'-')}</td><td>${esc(s.Gender||'-')}</td><td>${esc(mkName(s.MaktabID))}</td><td>${esc(s.CurrentLevel||'-')}</td><td>${fmtDate(s.DateOfAdmission)}</td><td>${esc(s.Status||'-')}</td></tr>`).join(''):`<tr><td colspan="7" style="text-align:center;color:var(--text3);">${T('no_data')}</td></tr>`}</tbody>
    </table></div></div>
  </div>`;
}

function buildTeachersReport(tc){
  return `<div id="reportPrintArea">
    ${rpHeader(T('rp_teachers'),T('report_sub'))}
    ${rpActions()}
    <div class="sg" style="margin-top:14px;grid-template-columns:repeat(3,1fr);">${statCard(tc.length,T('total_teachers'))}</div>
    <div class="card"><div class="tw"><table id="rpTcTable">
      <thead><tr><th>Name</th><th>Designation</th><th>Maktab</th><th>Phone</th><th>Appointment</th><th>Status</th></tr></thead>
      <tbody>${tc.length?tc.map(t=>`<tr><td>${esc(t.Name)}</td><td>${esc(t.Designation||'-')}</td><td>${esc(mkName(t.MaktabID))}</td><td>${esc(t.Phone||'-')}</td><td>${fmtDate(t.DateOfAppointment)}</td><td>${esc(t.Status||'-')}</td></tr>`).join(''):`<tr><td colspan="6" style="text-align:center;color:var(--text3);">${T('no_data')}</td></tr>`}</tbody>
    </table></div></div>
  </div>`;
}

function buildAttendanceReport(st, threshold){
  let risky=attendanceRiskList(st, threshold);
  let dropoutCount=risky.filter(s=>String(s.Status||'').toLowerCase()==='dropout').length;
  let barData={}; barData[T('low_attendance')]=risky.length-dropoutCount; barData[T('dropout')]=dropoutCount;

  return `<div id="reportPrintArea">
    ${rpHeader(T('rp_attendance'), T('report_sub')+' — < '+threshold+'%')}
    ${rpActions()}
    <div class="sg" style="margin-top:14px;grid-template-columns:repeat(3,1fr);">
      ${statCard(risky.length, T('rp_attendance'))}
      ${statCard(dropoutCount, T('dropout'))}
      ${statCard(risky.length-dropoutCount, T('low_attendance'))}
    </div>
    <div class="card">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.chart}</div><div class="ch-t">${T('risk_level')}</div></div></div>
      <div class="cb">${barChartHTML(barData,'#ef4444')}</div>
    </div>
    <div class="card">
      <div class="ch"><div class="ch-l"><div class="ch-ic">${IC.student}</div><div class="ch-t">${T('rp_attendance')}</div></div></div>
      <div class="tw"><table id="rpAttTable">
        <thead><tr><th>Name</th><th>Father</th><th>Maktab</th><th>Attendance %</th><th>Status</th><th>${T('risk_level')}</th></tr></thead>
        <tbody>${risky.length?risky.map(s=>{
          let dropped=String(s.Status||'').toLowerCase()==='dropout';
          let rl=riskLabel(s,threshold), clr=dropped?'#ef4444':'#f59e0b';
          return `<tr><td>${esc(s.Name)}</td><td>${esc(s.FatherName||'-')}</td><td>${esc(mkName(s.MaktabID))}</td><td><b>${s.Attendance||0}%</b></td><td>${esc(s.Status||'-')}</td><td><span class="badge" style="background:${clr}22;color:${clr};">${esc(rl)}</span></td></tr>`;
        }).join(''):`<tr><td colspan="6" style="text-align:center;color:var(--text3);">${T('no_data')}</td></tr>`}</tbody>
      </table></div>
    </div>
  </div>`;
}

function printReport(){ window.print(); }

/* ---- Excel export (SheetJS) ---- */
function xlsxTitleRows(title){
  return [
    ['ISRA Quran Academy'],
    [title],
    ['Generated: '+new Date().toLocaleString('en-GB')+'   |   By: '+(currentUser.Name||currentUser.Username)],
    []
  ];
}
function studentsAOA(st){
  return [
    ['Name','Father','Gender','Maktab','Level','Admission','Status'],
    ...(st.length?st.map(s=>[s.Name||'',s.FatherName||'',s.Gender||'',mkName(s.MaktabID),s.CurrentLevel||'',fmtDate(s.DateOfAdmission),s.Status||'']):[['-','-','-','-','-','-','-']])
  ];
}
function teachersAOA(tc){
  return [
    ['Name','Designation','Maktab','Phone','Appointment','Status'],
    ...(tc.length?tc.map(t=>[t.Name||'',t.Designation||'',mkName(t.MaktabID),t.Phone||'',fmtDate(t.DateOfAppointment),t.Status||'']):[['-','-','-','-','-','-']])
  ];
}
function attendanceAOA(st, threshold){
  let risky=attendanceRiskList(st, threshold);
  return [
    ['Name','Father','Maktab','Attendance %','Status','Risk'],
    ...(risky.length?risky.map(s=>[s.Name||'',s.FatherName||'',mkName(s.MaktabID),(s.Attendance||0)+'%',s.Status||'',riskLabel(s,threshold)]):[['-','-','-','-','-','-']])
  ];
}
function addListSheet(wb, sheetName, aoaBody){
  let aoa=[...xlsxTitleRows(sheetName), ...aoaBody];
  let ws=XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols']=(aoaBody[0]||[]).map(()=>({wch:20}));
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0,31));
}
function addOverallSheet(wb,mk,tc,st){
  let am=mk.filter(m=>(m.Status||'')==='Active').length;
  let boys=st.filter(s=>String(s.Gender||'').toLowerCase().startsWith('m')).length;
  let girls=st.filter(s=>String(s.Gender||'').toLowerCase().startsWith('f')).length;
  let summaryAOA=[
    ...xlsxTitleRows(T('rp_overall')),
    ['Metric','Value'],
    [T('total_maktabs'), mk.length],
    [T('active_maktabs'), am],
    [T('total_students'), st.length],
    [T('boys'), boys],
    [T('girls'), girls],
    [T('total_teachers'), tc.length],
  ];
  let ws1=XLSX.utils.aoa_to_sheet(summaryAOA); ws1['!cols']=[{wch:26},{wch:14}];
  XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

  let byDist=districtBreakdown(mk,tc,st);
  let distAOA=[['District','Maktabs','Students','Teachers'], ...Object.keys(byDist).sort().map(d=>[d,byDist[d].mk,byDist[d].st,byDist[d].tc])];
  let ws2=XLSX.utils.aoa_to_sheet(distAOA); ws2['!cols']=[{wch:18},{wch:12},{wch:12},{wch:12}];
  XLSX.utils.book_append_sheet(wb, ws2, 'District Breakdown');
}
function addSupervisorSheet(wb,mk,tc,st){
  let groups=groupBySupervisor(mk,tc,st);
  let keys=Object.keys(groups).sort((a,b)=>groups[b].maktabs.length-groups[a].maktabs.length);
  let aoa=[['Supervisor','Total Maktabs','Maktab Names','Students','Teachers'], ...keys.map(k=>{let g=groups[k]; return [g.name,g.maktabs.length,g.maktabs.map(m=>m.MaktabName).join(', '),g.students,g.teachers];})];
  let ws=XLSX.utils.aoa_to_sheet(aoa); ws['!cols']=[{wch:20},{wch:14},{wch:40},{wch:12},{wch:12}];
  XLSX.utils.book_append_sheet(wb, ws, 'Supervisors');
}
function addMaktabSheets(wb,mk,tc,st){
  mk.forEach(m=>{
    let myT=tc.filter(t=>String(t.MaktabID)===String(m.ID));
    let myS=st.filter(s=>String(s.MaktabID)===String(m.ID));
    let aoa=[
      ...xlsxTitleRows(m.MaktabName),
      ['Teachers'], ['Name','Designation','Phone','Status'],
      ...(myT.length?myT.map(t=>[t.Name||'',t.Designation||'',t.Phone||'',t.Status||'']):[['-','-','-','-']]),
      [],
      ['Students'], ['Name','Father','Gender','Level','Status'],
      ...(myS.length?myS.map(s=>[s.Name||'',s.FatherName||'',s.Gender||'',s.CurrentLevel||'',s.Status||'']):[['-','-','-','-','-']]),
    ];
    let ws=XLSX.utils.aoa_to_sheet(aoa); ws['!cols']=[{wch:22},{wch:16},{wch:14},{wch:12}];
    let name=(m.MaktabName||'Maktab').replace(/[\[\]\*\/\\\?:]/g,'').slice(0,28)||'Sheet';
    let final=name, i=1;
    while(wb.SheetNames.includes(final)){ final=(name.slice(0,25)+'_'+i); i++; }
    XLSX.utils.book_append_sheet(wb, ws, final);
  });
}
function addCourseSheet(wb,st){
  let groups={};
  st.forEach(s=>{
    let key=s.CurrentLevel||T('unassigned');
    if(!groups[key]) groups[key]={total:0, boys:0, girls:0};
    groups[key].total++;
    let g=String(s.Gender||'').toLowerCase();
    if(g.startsWith('m')) groups[key].boys++; else if(g.startsWith('f')) groups[key].girls++;
  });
  let keys=Object.keys(groups).sort((a,b)=>groups[b].total-groups[a].total);
  let total=st.length;
  let aoa=[['Course','Total Students','Boys','Girls','%'], ...keys.map(k=>{let g=groups[k]; return [k,g.total,g.boys,g.girls,(total?Math.round(g.total/total*100):0)+'%'];})];
  let ws=XLSX.utils.aoa_to_sheet(aoa); ws['!cols']=[{wch:20},{wch:14},{wch:10},{wch:10},{wch:10}];
  XLSX.utils.book_append_sheet(wb, ws, 'Courses');
}
function exportReportXLSX(){
  if(typeof XLSX==='undefined'){ toast('Excel library abhi load nahi hui — internet check karein.','error'); return; }
  let d=window._rpLast;
  if(!d){ toast('Pehle report generate karein.','error'); return; }
  let wb=XLSX.utils.book_new();
  if(d.type==='overall')          addOverallSheet(wb,d.mk,d.tc,d.st);
  else if(d.type==='supervisor')  addSupervisorSheet(wb,d.mk,d.tc,d.st);
  else if(d.type==='course')      addCourseSheet(wb,d.st);
  else if(d.type==='maktab')      addMaktabSheets(wb,d.mk,d.tc,d.st);
  else if(d.type==='students')    addListSheet(wb,'Students', studentsAOA(d.st));
  else if(d.type==='teachers')    addListSheet(wb,'Teachers', teachersAOA(d.tc));
  else if(d.type==='attendance')  addListSheet(wb,'Attendance', attendanceAOA(d.st, d.threshold));
  if(!wb.SheetNames.length){ toast('Nothing to export','error'); return; }
  XLSX.writeFile(wb, 'ISRA_Report_'+d.type+'_'+Date.now()+'.xlsx');
  toast('✓ '+T('saved'),'success');
  writeLog('export','Exported Excel report: '+d.type);
  loadReportHistory();
}

/* ===================== PROFILE ===================== */
function renderProfile(){
  let u=currentUser||{};
  let myS=filterByRole(cache.students||[],'students');
  document.getElementById('pageContent').innerHTML=`
    <div class="ph" style="animation:fadeUp .3s ease;"><div class="ph-title">${T('profile')}</div></div>
    <div class="prof-hero">
      <div class="ph-av"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M3 21a9 9 0 0 1 18 0"/></svg></div>
      <div>
        <div class="ph-n">${esc(u.Name||u.Username)}</div>
        <div style="margin-top:5px;">${rBadge(u.Role)}</div>
        <div class="ph-m" style="margin-top:5px;">${T('assigned_maktab')}: ${esc(u.AssignedMaktab||'N/A')}</div>
        ${u.Role==='Teacher'?`<div class="ph-m">${T('report_to')}: <b style="color:rgba(255,255,255,.8);">Supervisor</b></div>`:''}
        ${u.Role==='Supervisor'?`<div class="ph-m">${T('report_to')}: <b style="color:rgba(255,255,255,.8);">Admin</b></div>`:''}
      </div>
    </div>
    ${isTeacher()?`
    <div class="sg" style="margin-bottom:16px;">
      <div class="sc s-teal" style="animation:fadeUp .35s ease .05s both;"><div class="sc-ic">${IC.student}</div><div class="sc-n">${myS.length}</div><div class="sc-l">My Students</div></div>
      <div class="sc s-green" style="animation:fadeUp .35s ease .1s both;"><div class="sc-ic">${IC.check}</div><div class="sc-n">${myS.filter(s=>String(s.Status||'').toLowerCase()==='active').length}</div><div class="sc-l">${T('active')}</div></div>
      <div class="sc s-blue" style="animation:fadeUp .35s ease .15s both;"><div class="sc-ic">${IC.boys}</div><div class="sc-n">${myS.filter(s=>String(s.Gender||'').toLowerCase().startsWith('m')).length}</div><div class="sc-l">Boys</div></div>
      <div class="sc s-pink" style="animation:fadeUp .35s ease .2s both;"><div class="sc-ic">${IC.boys}</div><div class="sc-n">${myS.filter(s=>String(s.Gender||'').toLowerCase().startsWith('f')).length}</div><div class="sc-l">Girls</div></div>
    </div>`:''}
    <div class="card">
      <div class="ch"><div class="ch-t">Update Profile</div></div>
      <div class="cb"><div class="fg" style="max-width:480px;">
        <div class="ff"><label>Name</label><input class="fi" value="${esc(u.Name||u.Username)}" readonly style="background:#f8fafc;"></div>
        <div class="ff"><label>Username</label><input class="fi" value="${esc(u.Username)}" readonly style="background:#f8fafc;"></div>
        <div class="ff"><label>Role</label><input class="fi" value="${esc(u.Role)}" readonly style="background:#f8fafc;"></div>
        <div class="ff"><label>Phone</label><input class="fi" id="pf_ph" value="${esc(u.Phone||'')}"></div>
        <div class="ff full"><label>New Password (blank = no change)</label><input class="fi" type="password" id="pf_pw" placeholder="New password"></div>
      </div>
      <div class="fa"><button class="btn btn-g" onclick="savePf()">Update <span id="pfSp"></span></button></div></div>
    </div>`;
}
async function savePf(){
  let sp=document.getElementById('pfSp'),ph=document.getElementById('pf_ph').value,pw=document.getElementById('pf_pw').value;
  let p={username_key:currentUser.Username,Username:currentUser.Username,Phone:ph}; if(pw)p.Password=pw;
  sp.innerHTML='<span class="spinner" style="width:12px;height:12px;"></span>';
  let res=await api('updateUser',p); sp.innerHTML='';
  if(res.success){ currentUser.Phone=ph; localStorage.setItem('isra_user',JSON.stringify(currentUser)); toast('✓ '+T('saved'),'success'); }
  else toast(res.message||'Error','error');
}
