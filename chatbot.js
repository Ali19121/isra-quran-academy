/* ISRA AI Data Analyst — Gemini plans, the app calculates. No AI-generated code is ever executed. */
(function(G){
console.log('ISRA AI Analyst loaded');
const CB={ds:{},cols:{},types:{},t:null,items:[],res:{},n:0,busy:false};
const BLOCK=['Password','CNIC','FatherCNIC','FatherPhone','Phone','HeadContact','HeadWhatsApp'];
const NUMF=['Salary','Capacity','TotalStudents','Boys','Girls','TotalTeachers','Attendance','Latitude','Longitude','Experience'];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const num=v=>{const n=parseFloat(String(v==null?'':v).replace(/[,%\s]/g,''));return isNaN(n)?null:n};
const fmt=v=>typeof v==='number'?(Number.isInteger(v)?v.toLocaleString('en-US'):v.toLocaleString('en-US',{maximumFractionDigits:2})):esc(v);
const blank=v=>v==null||String(v).trim()==='';

/* ---------- data prep ---------- */
function prep(raw){
  const mk={};(raw.Maktabs||[]).forEach(m=>mk[String(m.ID)]=m.MaktabName);
  CB.ds={};CB.cols={};CB.types={};
  Object.keys(raw).forEach(name=>{
    const rows=raw[name].map(r=>{const o={};Object.keys(r).forEach(k=>{if(!BLOCK.includes(k))o[k]=r[k]});
      if(name!=='Maktabs'&&'MaktabID' in r)o.MaktabName=mk[String(r.MaktabID)]||'(unknown)';return o});
    const cols=rows.length?Object.keys(rows[0]):[];const types={};
    cols.forEach(c=>{const vals=rows.map(r=>r[c]).filter(v=>!blank(v));
      if(/ID$/.test(c)||!vals.length)types[c]='text';
      else if(NUMF.includes(c)||vals.filter(v=>num(v)!=null&&!/[a-z]/i.test(String(v))).length>=vals.length*.9)types[c]='number';
      else if(vals.filter(v=>/^\d{4}-\d{2}-\d{2}/.test(String(v))).length>=vals.length*.8)types[c]='date';
      else types[c]='text'});
    CB.ds[name]=rows;CB.cols[name]=cols;CB.types[name]=types;
  });
}
function schema(){
  return Object.keys(CB.ds).map(n=>{const rows=CB.ds[n];
    return n+' ('+rows.length+' rows): '+CB.cols[n].map(c=>{const t=CB.types[c]||CB.types[n][c];let s=c+':'+t;
      if(t==='text'){const d=[...new Set(rows.map(r=>r[c]).filter(v=>!blank(v)))];if(d.length&&d.length<=12)s+='['+d.join('|')+']'}
      if(t==='date'){const d=rows.map(r=>r[c]).filter(v=>!blank(v)).sort();if(d.length)s+='['+String(d[0]).slice(0,10)+'..'+String(d[d.length-1]).slice(0,10)+']'}
      return s}).join(', ')}).join('\n');
}

/* ---------- analytical engine (whitelisted operations only) ---------- */
function bucket(v,b){const d=new Date(v);if(isNaN(d))return'(blank)';const y=d.getFullYear(),m=d.getMonth()+1;
  return b==='year'?''+y:b==='quarter'?y+'-Q'+Math.ceil(m/3):y+'-'+String(m).padStart(2,'0')}
function keyOf(r,g){const p=g.split(':');const v=r[p[0]];if(blank(v))return'(blank)';return p[1]?bucket(v,p[1]):String(v).trim()}
function test(r,f,t){const v=r[f.field];
  if(f.op==='blank')return blank(v);if(f.op==='notblank')return!blank(v);
  let a,b=f.value;
  if(t==='number'){a=num(v);b=Array.isArray(b)?b.map(num):num(b)}
  else if(t==='date'){a=blank(v)?null:new Date(v).getTime();b=new Date(b).getTime()}
  else{a=String(v==null?'':v).toLowerCase().trim();b=Array.isArray(b)?b.map(x=>String(x).toLowerCase().trim()):String(b==null?'':b).toLowerCase().trim()}
  switch(f.op){case'=':return a===b;case'!=':return a!==b;case'>':return a!=null&&a>b;case'>=':return a!=null&&a>=b;
    case'<':return a!=null&&a<b;case'<=':return a!=null&&a<=b;case'contains':return String(a).includes(b);
    case'in':return Array.isArray(b)&&b.includes(a);default:throw Error('Unsupported filter operator: '+f.op)}
}
function agg(rows,m){const f=m.field,fn=m.fn;
  if(fn==='count')return rows.length;
  if(fn==='missing')return rows.filter(r=>blank(r[f])).length;
  if(fn==='distinct')return new Set(rows.map(r=>r[f]).filter(v=>!blank(v))).size;
  const v=rows.map(r=>num(r[f])).filter(x=>x!=null);if(!v.length)return null;
  if(fn==='sum')return v.reduce((a,b)=>a+b,0);if(fn==='avg')return v.reduce((a,b)=>a+b,0)/v.length;
  if(fn==='min')return Math.min(...v);if(fn==='max')return Math.max(...v);throw Error('Unsupported function: '+fn)}
const mlabel=m=>m.fn==='count'&&!m.field?'Count':m.fn+(m.field?'('+m.field+')':'');
function run(plan){
  const name=plan.dataset,all=CB.ds[name];if(!all)throw Error('Dataset not available: '+name);
  const cols=CB.cols[name],types=CB.types[name],base=c=>String(c).split(':')[0];
  const chk=c=>{if(!cols.includes(base(c)))throw Error('Column not found in '+name+': '+c)};
  const fl=plan.filters||[],gb=plan.groupBy||[],ms=(plan.metrics&&plan.metrics.length?plan.metrics:[{fn:'count'}]);
  fl.forEach(f=>chk(f.field));gb.forEach(chk);ms.forEach(m=>m.field&&chk(m.field));
  const rows=all.filter(r=>fl.every(f=>test(r,f,types[f.field])));
  const out={title:plan.title||name,dataset:name,total:all.length,matched:rows.length,plan,calc:[]};
  fl.forEach(f=>out.calc.push('Filter '+f.field+' '+f.op+' '+(Array.isArray(f.value)?f.value.join(','):f.value!=null?f.value:'')));
  const dcol=gb.map(base).find(c=>types[c]==='date')||fl.map(f=>f.field).find(c=>types[c]==='date');
  if(dcol){const d=rows.map(r=>r[dcol]).filter(v=>!blank(v)).sort();out.period=d.length?String(d[0]).slice(0,10)+' to '+String(d[d.length-1]).slice(0,10)+' ('+dcol+')':'no dated records'}
  else out.period='All records (no date filter)';
  if(!gb.length&&!plan.columns&&!plan.list){ // KPI mode
    out.columns=ms.map(mlabel);out.rows=[ms.map(m=>agg(rows,m))];out.kpi=ms.map((m,i)=>({l:mlabel(m),v:fmt(out.rows[0][i])}));
    out.calc.push(ms.map(m=>m.fn.toUpperCase()+'('+(m.field||'*')+')').join(', ')+' over '+rows.length+' records');return out}
  if(!gb.length){const c=(plan.columns||cols).filter(x=>cols.includes(x)).slice(0,8);
    out.columns=c;out.rows=rows.slice(0,Math.min(plan.limit||50,200)).map(r=>c.map(k=>r[k]));out.list=true;out.calc.push('Showing records');return out}
  const grp=new Map();rows.forEach(r=>{const k=gb.map(g=>keyOf(r,g));const kk=JSON.stringify(k);if(!grp.has(kk))grp.set(kk,{k,rows:[]});grp.get(kk).rows.push(r)});
  let list=[...grp.values()];
  if(plan.minCount)list=list.filter(g=>g.rows.length>=plan.minCount);
  if(gb.length===2&&!plan.minCount){ // pivot: g1 x g2 for first metric
    const k2=[...new Set(list.map(g=>g.k[1]))].sort(),k1=[...new Set(list.map(g=>g.k[0]))].sort();
    out.columns=[gb[0],...k2];out.rows=k1.map(a=>[a,...k2.map(b=>{const g=list.find(x=>x.k[0]===a&&x.k[1]===b);return g?agg(g.rows,ms[0]):0})]);
    out.pivot=true;out.calc.push('Group by '+gb.join(' x ')+', '+mlabel(ms[0]));return out}
  let r=list.map(g=>[...g.k,...ms.map(m=>agg(g.rows,m))]);
  out.columns=[...gb.map(base),...ms.map(mlabel)];
  const si=plan.sort&&out.columns.indexOf(plan.sort.by);
  if(si>=0)r.sort((a,b)=>(plan.sort.dir==='asc'?1:-1)*((a[si]>b[si])-(a[si]<b[si])||0));
  else if(gb.some(g=>g.includes(':')))r.sort((a,b)=>String(a[0])<String(b[0])?-1:1);
  else r.sort((a,b)=>(num(b[gb.length])||0)-(num(a[gb.length])||0));
  if(plan.pctChange){const i=gb.length;out.columns.push('Change %');r=r.map((x,j)=>[...x,j&&num(r[j-1][i])?+(((x[i]-r[j-1][i])/r[j-1][i])*100).toFixed(1):null]);out.calc.push('% change vs previous period = (current - previous) / previous x 100')}
  if(plan.limit)r=r.slice(0,Math.min(plan.limit,200));
  out.rows=r;out.calc.push('Group by '+gb.join(', ')+'; '+ms.map(mlabel).join(', '));return out;
}
function summarize(o){
  if(o.kpi)return o.kpi.map(k=>k.l+' = '+k.v).join('; ')+' (from '+o.matched+' matching records).';
  if(!o.rows.length)return'No matching records found in the connected data.';
  if(o.list)return o.rows.length+' of '+o.matched+' matching records shown.';
  if(o.pivot)return o.rows.length+' groups compared across '+(o.columns.length-1)+' categories.';
  const g=o.plan.groupBy.length,vi=g,v=o.rows.map(r=>num(r[vi])||0),tot=v.reduce((a,b)=>a+b,0),mi=v.indexOf(Math.max(...v));
  return 'Highest: '+o.rows[mi][0]+' ('+fmt(v[mi])+'). '+(o.plan.metrics&&o.plan.metrics[0]&&o.plan.metrics[0].fn!=='sum'&&o.plan.metrics[0].fn!=='count'?'':'Total across groups: '+fmt(tot)+'. ')+o.rows.length+' groups.';
}

/* ---------- data + AI calls ---------- */
async function loadData(force){
  if(CB.t&&!force)return;
  const [m,t,s]=await Promise.all([api('getMaktabs'),api('getTeachers'),api('getStudents')]);
  if(!m.success||!t.success||!s.success)throw Error('Could not read Google Sheet data.');
  cache.maktabs=m.rows;cache.teachers=t.rows;cache.students=s.rows;
  prep({Maktabs:filterByRole(m.rows,'maktabs'),Teachers:filterByRole(t.rows,'teachers'),Students:filterByRole(s.rows,'students')});
  CB.t=new Date();
}
async function askAI(q){
  const body=new URLSearchParams({action:'aiPlan',username:currentUser.Username,question:q,schema:schema()});
  const r=await fetch(CONFIG.SCRIPT_URL,{method:'POST',body}).then(r=>r.json());
  if(!r.success)throw Error(r.message||'AI request failed');return r.plan;
}

/* ---------- UI ---------- */
const SUGG=['Total students enrolled by maktab','Compare boys and girls across districts','Teachers headcount and average salary by district','Students admitted per year with % change','Find duplicate student records','Maktab-wise report with executive summary','Create a 6-slide PowerPoint on enrollment by district'];
const CSS=`.cbw{display:flex;flex-direction:column;height:calc(100vh - 130px);min-height:420px}.cbl{flex:1;overflow:auto;padding:4px}.cbm{max-width:92%;margin:8px 0;padding:10px 14px;border-radius:14px;background:var(--card);border:1px solid var(--border);box-shadow:var(--shadow);line-height:1.5}.cbm.u{background:var(--teal);color:#fff;margin-left:auto;border:0}.cbm.w{max-width:100%;width:100%}
.cbc .cbt{font-weight:700;color:var(--sb);font-size:1.05rem}.cbs{font-size:.74rem;color:var(--text3);margin:2px 0 8px}.cbk{display:flex;gap:10px;flex-wrap:wrap;margin:8px 0}.cbk div{background:var(--teal-l);border-radius:10px;padding:10px 16px;min-width:120px}.cbk b{display:block;font-size:1.5rem;color:var(--sb)}.cbk span{font-size:.75rem;color:var(--text2)}
.cbch{position:relative;height:280px;margin:8px 0}.cbtool{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.cbtool button,.cbsg button{border:1px solid var(--border);background:#fff;border-radius:16px;padding:4px 12px;font-size:.76rem;cursor:pointer;color:var(--text2)}.cbtool button:hover,.cbsg button:hover{background:var(--teal-l)}
.cbtb{overflow:auto;max-height:300px;margin:8px 0}.cbtb table{border-collapse:collapse;width:100%;font-size:.82rem}.cbtb th{background:var(--sb);color:#fff;padding:6px 8px;text-align:left;position:sticky;top:0}.cbtb td{padding:5px 8px;border-bottom:1px solid var(--border)}.cbsum{background:var(--gold-l);border-radius:8px;padding:8px 12px;margin:6px 0;font-size:.85rem}.cbin{display:flex;gap:8px;padding-top:8px}.cbin input{flex:1;padding:11px 14px;border:1px solid var(--border);border-radius:24px;font-size:.95rem}.cbin button.go{background:var(--teal);color:#fff;border:0;border-radius:24px;padding:0 22px;cursor:pointer;font-weight:600}.cbsg{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}details.cbd{font-size:.75rem;color:var(--text2)}`;
let charts={};
G.CBX={
  ask(q){q=(q||document.getElementById('cbq').value||'').trim();if(!q||CB.busy)return;document.getElementById('cbq').value='';
    CB.items.push({t:'u',x:q});paint();CB.busy=true;addLoad();
    (async()=>{try{await loadData(false);const plan=await askAI(q);
      const qs=(plan.queries||[]).slice(0,10),rs=[];
      for(const p of qs){try{rs.push(run(p))}catch(e){rs.push({err:e.message,title:p.title||'Query'})}}
      const ok=rs.filter(r=>!r.err);
      CB.items.pop&&0;
      if(plan.output==='ppt'&&ok.length){const f=await makePPT(plan.title||'ISRA Presentation',ok);CB.items.push({t:'b',x:plan.reply||'',ppt:f,res:ok.map(store),errs:rs.filter(r=>r.err)})}
      else CB.items.push({t:'b',x:plan.reply||'',rep:plan.output==='report'?{title:plan.title||'Report'}:null,res:ok.map(store),errs:rs.filter(r=>r.err)});
      if(!qs.length)CB.items.push({t:'b',x:plan.reply||'I could not map that question to the available data. Try naming a sheet column (e.g. District, Gender, Salary).',res:[]});
    }catch(e){CB.items.push({t:'b',x:'⚠ '+e.message,res:[]})}
    CB.busy=false;paint()})()},
  refresh(){CB.t=null;CBX.status('Refreshing…');loadData(true).then(()=>{CBX.status();toast('Data refreshed','success')}).catch(e=>toast(e.message,'error'))},
  status(m){const e=document.getElementById('cbst');if(e)e.textContent=m||(CB.t?'● Live data loaded '+CB.t.toLocaleTimeString()+' — '+Object.keys(CB.ds).map(k=>k+': '+CB.ds[k].length).join(', '):'Loading data…')},
  sw(id,t){draw(id,t)},
  csv(id){const r=CB.res[id],q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';dl(new Blob(['\ufeff'+[r.columns,...r.rows].map(x=>x.map(q).join(',')).join('\n')],{type:'text/csv'}),'isra_'+id+'.csv')},
  xlsx(id){const r=CB.res[id],wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([[r.title],[r.source],[],r.columns,...r.rows]),'Report');XLSX.writeFile(wb,'isra_'+id+'.xlsx')},
  png(id){if(charts[id])dl(dataURL(charts[id].toBase64Image()),'chart_'+id+'.png')},
  copy(i){const it=CB.items[i];const t=(it.x||'')+'\n'+it.res.map(id=>CB.res[id].title+': '+summarize(CB.res[id])).join('\n');navigator.clipboard.writeText(t).then(()=>toast('Copied','success'))},
  pdf(i){const el=document.getElementById('cbm'+i).cloneNode(true);el.querySelectorAll('canvas').forEach(c=>{const m=document.createElement('img');const ch=charts[c.id.slice(2)];m.src=ch?ch.toBase64Image():'';m.style.maxWidth='100%';c.parentNode.replaceChild(m,c)});
    el.querySelectorAll('.cbtool,button').forEach(b=>b.remove());const w=window.open('','_blank');w.document.write('<html><head><title>ISRA Report</title><style>'+CSS+'body{font-family:Inter,Arial;padding:20px}.cbm{box-shadow:none}</style></head><body><h2>ISRA Quran Academy — '+esc(CB.items[i].rep?CB.items[i].rep.title:'Report')+'</h2>'+el.innerHTML+'</body></html>');w.document.close();setTimeout(()=>w.print(),600)}
};
const store=r=>{const id=++CB.n;r.source='Source: Google Sheet ▸ '+r.dataset+' · '+r.matched+' of '+r.total+' records · Period: '+r.period+' · Live data loaded '+(CB.t?CB.t.toLocaleTimeString():'');CB.res[id]=r;return id};
const dl=(b,n)=>{const a=document.createElement('a');a.href=b instanceof Blob?URL.createObjectURL(b):b;a.download=n;a.click()};const dataURL=u=>u;
function addLoad(){const l=document.getElementById('cbl');if(l)l.insertAdjacentHTML('beforeend','<div class="cbm" id="cbld"><div class="spinner"></div> Analysing your data…</div>');l&&(l.scrollTop=l.scrollHeight)}
function table(r){return '<div class="cbtb"><table><tr>'+r.columns.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr>'+r.rows.slice(0,100).map(x=>'<tr>'+x.map(v=>'<td>'+(v==null?'':fmt(v))+'</td>').join('')+'</tr>').join('')+'</table></div>'}
function chartable(r){return !r.kpi&&!r.list&&r.rows.length>1&&r.rows.length<=40}
function draw(id,type){const r=CB.res[id],cv=document.getElementById('cv'+id);if(!cv||!G.Chart)return;if(charts[id])charts[id].destroy();
  r.type=type||r.type||(r.plan.chart&&r.plan.chart!=='none'?r.plan.chart:'bar');const t=r.type,stk=t==='stacked',ct=stk?'bar':t;
  const pal=['#0d7a8a','#f59e0b','#10b981','#8b5cf6','#ef4444','#3b82f6','#ec4899','#06b6d4','#f97316','#64748b'];
  const vi=r.pivot?1:r.plan.groupBy.length,labels=r.rows.map(x=>x[0]);
  const ds=(r.pivot?r.columns.slice(1):r.columns.slice(vi).filter(c=>c!=='Change %')).map((c,i)=>({label:c,data:r.rows.map(x=>num(x[vi+i])||0),backgroundColor:ct==='pie'||ct==='doughnut'?pal:pal[i%10],borderColor:pal[i%10],tension:.3}));
  charts[id]=new Chart(cv,{type:ct,data:{labels,datasets:ct==='pie'||ct==='doughnut'?[ds[0]]:ds},options:{responsive:true,maintainAspectRatio:false,scales:ct==='pie'||ct==='doughnut'?{}:{x:{stacked:stk},y:{stacked:stk,beginAtZero:true}}}})}
function card(id){const r=CB.res[id];return '<div class="cbc"><div class="cbt">'+esc(r.title)+'</div><div class="cbs">'+esc(r.source)+'</div>'+(r.kpi?'<div class="cbk">'+r.kpi.map(k=>'<div><b>'+k.v+'</b><span>'+esc(k.l)+'</span></div>').join('')+'</div>':'')+
  '<div class="cbsum">'+esc(summarize(r))+'</div>'+(chartable(r)?'<div class="cbtool">'+['bar','line','pie','doughnut','stacked'].map(t=>'<button onclick="CBX.sw('+id+',\''+t+'\')">'+t+'</button>').join('')+'<button onclick="CBX.png('+id+')">⬇ PNG</button></div><div class="cbch"><canvas id="cv'+id+'"></canvas></div>':'')+
  (r.kpi&&r.rows[0].length<2?'':table(r))+'<div class="cbtool"><button onclick="CBX.csv('+id+')">CSV</button><button onclick="CBX.xlsx('+id+')">Excel</button></div><details class="cbd"><summary>How this was calculated</summary>'+r.calc.map(esc).join('<br>')+'<br>All figures computed in-browser from the sheet data; the AI only chose the query.</details></div>'}
function paint(){const l=document.getElementById('cbl');if(!l)return;
  l.innerHTML=CB.items.map((it,i)=>it.t==='u'?'<div class="cbm u">'+esc(it.x)+'</div>':'<div class="cbm w" id="cbm'+i+'">'+(it.rep?'<div class="cbt" style="font-size:1.2rem">'+esc(it.rep.title)+'</div><div class="cbs">Generated '+new Date().toLocaleString()+'</div>':'')+(it.x?'<p>'+esc(it.x)+'</p>':'')+
    (it.ppt?'<div class="cbsum">✅ Presentation created and downloaded: <b>'+esc(it.ppt)+'</b></div>':'')+it.res.map(card).join('')+(it.errs||[]).map(e=>'<p>⚠ '+esc(e.title)+': '+esc(e.err)+'</p>').join('')+
    (it.rep&&it.res.length?'<div class="cbsum"><b>Conclusions:</b> '+it.res.map(id=>esc(summarize(CB.res[id]))).join(' ')+'</div>':'')+'<div class="cbtool"><button onclick="CBX.copy('+i+')">Copy</button>'+(it.rep?'<button onclick="CBX.pdf('+i+')">PDF / Print</button>':'')+'</div></div>').join('');
  CB.items.forEach(it=>it.res&&it.res.forEach(id=>chartable(CB.res[id])&&draw(id,CB.res[id].type)));l.scrollTop=l.scrollHeight}
G.renderAssistant=function(){
  if(!currentUser||currentUser.Role!=='Admin'){document.getElementById('pageContent').innerHTML='<div class="es"><p>AI Analyst is available to Admin only.</p></div>';return}
  if(!document.getElementById('cbcss')){const s=document.createElement('style');s.id='cbcss';s.textContent=CSS;document.head.appendChild(s)}
  document.getElementById('pageContent').innerHTML='<div class="cbw"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><small id="cbst" style="color:var(--text2)">Loading data…</small><button class="cbtool" style="border:1px solid var(--border);background:#fff;border-radius:16px;padding:4px 12px;cursor:pointer" onclick="CBX.refresh()">↻ Refresh data</button></div><div class="cbl" id="cbl"></div><div class="cbsg">'+SUGG.map(s=>'<button onclick="CBX.ask(this.textContent)">'+esc(s)+'</button>').join('')+'</div><div class="cbin"><input id="cbq" placeholder="Ask about students, teachers, maktabs… (English / اردو / Roman Urdu)" onkeydown="if(event.key===\'Enter\')CBX.ask()"><button class="go" onclick="CBX.ask()">Ask</button></div></div>';
  paint();loadData(false).then(()=>CBX.status()).catch(e=>CBX.status('⚠ '+e.message))};
if(typeof IC!=='undefined')IC.bot='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 8V4M9 13h.01M15 13h.01"/></svg>';
if(typeof LANG!=='undefined')Object.keys(LANG).forEach(k=>LANG[k].assistant=k==='ur'?'AI تجزیہ کار':'AI Analyst');

/* ---------- PowerPoint (PptxGenJS) ---------- */
async function makePPT(title,rs){
  if(!G.PptxGenJS)throw Error('PowerPoint library failed to load (check internet).');
  const p=new PptxGenJS();p.layout='LAYOUT_WIDE';const NAVY='0D3D4A',GOLD='F59E0B';
  let s=p.addSlide();s.background={color:NAVY};s.addText(title,{x:.6,y:2.3,w:12,h:1.2,fontSize:34,bold:true,color:'FFFFFF'});
  s.addText('ISRA Quran Academy · '+new Date().toLocaleDateString('en-GB'),{x:.6,y:3.6,w:12,h:.5,fontSize:16,color:GOLD});
  try{s.addImage({path:'ISRA_QURAN_ACADEMY_LOGO.jpeg',x:11,y:.4,w:1.6,h:1.6})}catch(e){}
  rs.forEach(r=>{const sl=p.addSlide();sl.addText(r.title,{x:.5,y:.3,w:12.3,h:.7,fontSize:24,bold:true,color:NAVY});
    sl.addText(r.source,{x:.5,y:6.95,w:12.3,h:.4,fontSize:9,color:'94A3B8'});
    if(r.kpi)r.kpi.slice(0,4).forEach((k,i)=>{sl.addText([{text:String(k.v)+'\n',options:{fontSize:30,bold:true,color:NAVY}},{text:k.l,options:{fontSize:12,color:'475569'}}],{x:.6+i*3.1,y:1.6,w:2.9,h:1.5,fill:{color:'E0F2F4'},align:'center'})});
    else if(chartable(r)){const vi=r.pivot?1:r.plan.groupBy.length,labels=r.rows.map(x=>String(x[0]));
      const names=r.pivot?r.columns.slice(1):r.columns.slice(vi).filter(c=>c!=='Change %');
      const data=names.map((n,i)=>({name:n,labels,values:r.rows.map(x=>num(x[vi+i])||0)}));
      const t=r.type||r.plan.chart,T={line:p.charts.LINE,pie:p.charts.PIE,doughnut:p.charts.DOUGHNUT}[t]||p.charts.BAR;
      sl.addChart(T,t==='pie'||t==='doughnut'?[data[0]]:data,{x:.5,y:1.1,w:7.6,h:5.6,showLegend:true,legendPos:'b',barGrouping:t==='stacked'?'stacked':'clustered',chartColors:['0D7A8A','F59E0B','10B981','8B5CF6','EF4444','3B82F6']});
      sl.addTable([r.columns.map(c=>({text:c,options:{bold:true,color:'FFFFFF',fill:{color:NAVY}}})),...r.rows.slice(0,14).map(x=>x.map(v=>({text:v==null?'':String(typeof v==='number'?+v.toFixed(2):v)})))],{x:8.3,y:1.1,w:4.6,fontSize:10})}
    else sl.addTable([r.columns.map(c=>({text:c,options:{bold:true,color:'FFFFFF',fill:{color:NAVY}}})),...r.rows.slice(0,14).map(x=>x.map(v=>({text:v==null?'':String(v)})))],{x:.5,y:1.2,w:12.3,fontSize:11});
    sl.addText(summarize(r),{x:.5,y:6.4,w:12.3,h:.5,fontSize:12,color:'475569',italic:true})});
  s=p.addSlide();s.addText('Conclusions',{x:.5,y:.3,w:12,h:.7,fontSize:26,bold:true,color:NAVY});
  s.addText(rs.map(r=>({text:r.title+': '+summarize(r),options:{bullet:true,breakLine:true}})),{x:.6,y:1.3,w:12,h:5,fontSize:15,color:'1E293B',valign:'top'});
  const fn='ISRA_'+title.replace(/[^\w]+/g,'_').slice(0,40)+'.pptx';await p.writeFile({fileName:fn});return fn;
}
G.__CB={CB,run,prep,test,summarize};
if(typeof module!=='undefined')module.exports=G.__CB;
})(typeof window!=='undefined'?window:globalThis);
