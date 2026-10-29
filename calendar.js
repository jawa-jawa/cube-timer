(function(){
 'use strict';
 const pad=n=>String(n).padStart(2,'0');
 function key(date){return String(date.getFullYear()).padStart(4,'0')+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate())}
 function monthDate(year,month,day=1){const d=new Date(0);d.setFullYear(year,month,day);d.setHours(12,0,0,0);return d}
 function aggregate(records){
  const days=new Map();
  for(const r of records){
   const date=new Date(r.at);if(!Number.isFinite(date.getTime()))continue;
   const k=key(date),v=days.get(k)||{total:0,ok:0,dnf:0,best:null};
   v.total++;if(r.result==='ok'){v.ok++;v.best=v.best===null?r.ms:Math.min(v.best,r.ms)}else v.dnf++;
   days.set(k,v);
  }
  return days;
 }
 function mount(root,getRecords,format){
  const $=id=>root.querySelector('#'+id),today=new Date();
  let year=today.getFullYear(),month=today.getMonth(),mode='month',selected=key(today),days=new Map();
  try{if(localStorage.getItem('cube-time.calendar-view.v1')==='year')mode='year'}catch{}
  function node(tag,cls,text){const el=document.createElement(tag);el.className=cls;if(text!==undefined)el.textContent=text;return el}
  function detail(){
   const v=days.get(selected),d=new Date(selected+'T12:00:00');
   $('calendarDetail').textContent=d.toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric'})+'：'+(v?v.total+'回（成功 '+v.ok+'回・失敗 '+v.dnf+'回）'+(v.best===null?'':' ／ ベスト '+format(v.best)):'記録なし');
  }
  function makeMonth(m,compact){
   const box=node('div','calendar-month');
   if(compact){
    const title=node('button','calendar-month-title',(m+1)+'月');title.type='button';title.setAttribute('aria-label',year+'年'+(m+1)+'月を月表示で開く');
    title.onclick=()=>{month=m;setMode('month')};box.append(title);
   }
   const grid=node('div','calendar-grid');
   for(const w of ['日','月','火','水','木','金','土'])grid.append(node('span','calendar-weekday',w));
   const first=monthDate(year,m),length=monthDate(year,m+1,0).getDate();
   for(let i=0;i<first.getDay();i++){const blank=node('span','calendar-blank');blank.setAttribute('aria-hidden','true');grid.append(blank)}
   for(let day=1;day<=length;day++){
    const date=monthDate(year,m,day),k=key(date),v=days.get(k),button=node('button','calendar-day'+(v?' has-record':'')+(k===key(new Date())?' is-today':''));
    button.type='button';button.dataset.date=k;button.setAttribute('aria-pressed',String(k===selected));
    button.setAttribute('aria-label',year+'年'+(m+1)+'月'+day+'日、'+(v?v.total+'回の記録':'記録なし'));
    if(k===key(new Date()))button.setAttribute('aria-current','date');
    button.append(node('span','calendar-date',day));
    if(v)button.append(node('span','calendar-mark',compact?'●':v.total+'回'));
    button.onclick=()=>{
     selected=k;
     for(const b of root.querySelectorAll('[data-date]'))b.setAttribute('aria-pressed',String(b.dataset.date===k));
     detail();
    };
    grid.append(button);
   }
   box.append(grid);return box;
  }
  function render(){
   days=aggregate(getRecords());
   $('calendarMonth').setAttribute('aria-pressed',String(mode==='month'));
   $('calendarYear').setAttribute('aria-pressed',String(mode==='year'));
   $('calendarCaption').textContent=year+'年'+(mode==='month'?' '+(month+1)+'月':'');
   $('calendarPrev').setAttribute('aria-label',mode==='month'?'前の月':'前の年');
   $('calendarNext').setAttribute('aria-label',mode==='month'?'次の月':'次の年');
   $('calendarPrev').disabled=year<=1&&(mode==='year'||month===0);
   $('calendarNext').disabled=year>=9999&&(mode==='year'||month===11);
   const body=$('calendarBody');body.className=mode==='year'?'calendar-year':'calendar-single';body.replaceChildren();
   if(mode==='year')for(let m=0;m<12;m++)body.append(makeMonth(m,true));else body.append(makeMonth(month,false));
   const prefix=String(year).padStart(4,'0')+'-'+(mode==='month'?pad(month+1)+'-':'');
   let active=0,total=0;for(const [k,v] of days)if(k.startsWith(prefix)){active++;total+=v.total}
   $('calendarSummary').textContent='記録した日：'+active+'日 ／ 挑戦：'+total+'回';
   detail();
  }
  function setMode(value){mode=value;try{localStorage.setItem('cube-time.calendar-view.v1',mode)}catch{}render()}
  function shift(step){
   if(mode==='year')year=Math.min(9999,Math.max(1,year+step));
   else{const d=monthDate(year,month+step);if(d.getFullYear()<1||d.getFullYear()>9999)return;year=d.getFullYear();month=d.getMonth()}
   render();
  }
  $('calendarMonth').onclick=()=>setMode('month');$('calendarYear').onclick=()=>setMode('year');
  $('calendarPrev').onclick=()=>shift(-1);$('calendarNext').onclick=()=>shift(1);
  $('calendarToday').onclick=()=>{const now=new Date();year=now.getFullYear();month=now.getMonth();selected=key(now);render()};
  return {render};
 }
 globalThis.CubeCalendar={mount,aggregate,key,monthDate};
})();
