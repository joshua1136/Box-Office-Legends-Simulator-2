/* BOLS2 Local Save Engine — localStorage only, continuous progress capture. */
(function(){
 'use strict';
 const AUTO='BOLS2_AUTOSAVE_V2',LEGACY='bol2_saves_v1',SLOTS=5;
 const tick=s=>((+s?.year||1)-1)*52+(+s?.week||1);
 const clone=s=>{try{return JSON.parse(JSON.stringify(s))}catch{return null}};
 const state=()=>window.__BOL_STATE__||window.state||null;
 const name=s=>String((s?.studio&&s.studio.name)||s?.studioName||s?.name||'Unnamed Studio');
 const slotFor=s=>Math.max(1,Math.min(SLOTS,Number(s?.saveSlot||s?.slot)||1));
 const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
 const candidates=()=>{
  const out=[];const a=read(AUTO);if(a?.state)out.push({state:a.state,source:'AUTOSAVE',savedAt:a.savedAt||''});
  const l=read(LEGACY);if(Array.isArray(l))l.forEach((x,i)=>x&&out.push({state:x,source:'LOCAL SLOT '+(i+1),savedAt:x.updatedAt||x.savedAt||''}));
  return out;
 };
 const bestForStudio=studio=>{let best=null;candidates().forEach(c=>{if(name(c.state)!==name(studio))return;if(!best||tick(c.state)>tick(best.state)||(tick(c.state)===tick(best.state)&&String(c.savedAt)>String(best.savedAt)))best=c});return best};
 const signature=s=>{try{const c=clone(s);if(!c)return '';delete c.updatedAt;delete c.__localSaveSignature;return JSON.stringify(c)}catch{return ''}};
 let lastSignature='';let saving=false;let initialized=false;
 function localCommit(input,reason='autosave'){
  const s=clone(input);if(!s)return false;
  const best=bestForStudio(s);
  if(best&&tick(best.state)>tick(s))return false;
  s.saveSlot=slotFor(s);s.updatedAt=new Date().toISOString();
  try{
   const arr=read(LEGACY);const slots=Array.isArray(arr)?arr.slice(0,SLOTS):[];
   const idx=s.saveSlot-1;const existing=slots[idx];
   if(!existing||name(existing)===name(s)||tick(s)>=tick(existing)){slots[idx]=s;localStorage.setItem(LEGACY,JSON.stringify(slots));}
   localStorage.setItem(AUTO,JSON.stringify({version:7,reason,savedAt:s.updatedAt,state:s}));
   lastSignature=signature(s);initialized=true;return true;
  }catch(e){console.warn('[BOLS2 Local Save]',e);return false}
 }
 function save(reason='autosave',s=state()){
  if(!s)return false;
  if(saving)return true;
  saving=true;try{return localCommit(s,reason)}finally{saving=false}
 }
 function detectAndSave(reason='progress'){
  const s=state();if(!s)return;
  const sig=signature(s);if(!initialized){lastSignature=sig;initialized=true;return}
  if(sig&&sig!==lastSignature)save(reason,s);
 }
 function recover(){
  const s=state();if(!s)return false;const best=bestForStudio(s);
  if(best&&tick(best.state)>tick(s)){const c=clone(best.state);if(!c)return false;Object.keys(s).forEach(k=>{try{delete s[k]}catch{}});Object.assign(s,c);window.state=s;window.__BOL_STATE__=s;window.__BOL_CURRENT_STATE__=s;lastSignature=signature(s);try{window.start?.(s)}catch{}return true}
  lastSignature=signature(s);initialized=true;return false;
 }
 function openLoad(){return window.__BOLS2_OPEN_LOAD_V6__?window.__BOLS2_OPEN_LOAD_V6__():false}
 function wire(){
  document.addEventListener('click',ev=>{const el=ev.target?.closest?.('button,a,[role="button"]');if(!el)return;const t=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(t.includes('save game')||t.includes('save your studio'))save('manual-save');},true);
  window.addEventListener('pagehide',()=>save('page-exit'));
  window.addEventListener('beforeunload',()=>save('page-exit'));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save('background-save')});
  /* Continuous local checkpoint: any game-state mutation is captured without
     requiring every individual game mechanic to remember to call save(). */
  setInterval(()=>detectAndSave('progress-autosave'),300);
 }
 window.BOLS2SaveV5={save,recover,localCommit,candidates,bestForStudio,openLoad,detectAndSave,slotFor};
 wire();
 setTimeout(()=>{recover();},1200);
})();