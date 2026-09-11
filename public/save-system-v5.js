/* BOLS2 Local Save System — one canonical local-device save layer. */
(function(){
 'use strict';
 const AUTO='BOLS2_AUTOSAVE_V2',LEGACY='bol2_saves_v1',SLOTS=5;
 const tick=s=>((+s?.year||1)-1)*52+(+s?.week||1);
 const clone=s=>{try{return JSON.parse(JSON.stringify(s))}catch{return null}};
 const state=()=>window.__BOL_STATE__||window.state||null;
 const name=s=>String((s?.studio&&s.studio.name)||s?.studioName||s?.name||'Unnamed Studio');
 const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
 const candidates=()=>{const out=[];const a=read(AUTO);if(a?.state)out.push({state:a.state,source:'AUTOSAVE',savedAt:a.savedAt||''});const l=read(LEGACY);if(Array.isArray(l))l.forEach((x,i)=>x&&out.push({state:x,source:'LOCAL SLOT '+(i+1),savedAt:x.updatedAt||x.savedAt||''}));return out};
 const bestForStudio=studio=>{let best=null;candidates().forEach(c=>{if(name(c.state)!==name(studio))return;if(!best||tick(c.state)>tick(best.state)||(tick(c.state)===tick(best.state)&&String(c.savedAt)>String(best.savedAt)))best=c});return best};
 const slotFor=s=>Math.max(1,Math.min(SLOTS,Number(s?.saveSlot||s?.slot)||1));
 function localCommit(s,reason='save'){
  const c=clone(s);if(!c)return false;const best=bestForStudio(c);if(best&&tick(best.state)>tick(c))return false;c.saveSlot=slotFor(c);c.updatedAt=new Date().toISOString();try{localStorage.setItem(AUTO,JSON.stringify({version:7,reason,savedAt:c.updatedAt,state:c}));const arr=read(LEGACY);const slots=Array.isArray(arr)?arr:[];slots[c.saveSlot-1]=c;localStorage.setItem(LEGACY,JSON.stringify(slots));return true}catch(e){console.warn('[BOLS2 Local Save]',e);return false}
 }
 function save(reason='manual-save',s=state()){if(!s)return false;return localCommit(s,reason)}
 function recover(){const s=state(),best=s?bestForStudio(s):null;if(!best||tick(best.state)<=tick(s))return false;const c=clone(best.state);if(!c)return false;if(s){Object.keys(s).forEach(k=>{try{delete s[k]}catch{}});Object.assign(s,c);window.__BOL_STATE__=s;window.state=s}else{window.state=c;window.__BOL_STATE__=c}try{window.start?.(window.__BOL_STATE__)}catch{}return true}
 function openLoad(){return window.__BOLS2_OPEN_LOAD_V6__?window.__BOLS2_OPEN_LOAD_V6__():false}
 function wire(){document.addEventListener('click',ev=>{const el=ev.target?.closest?.('button,a,[role="button"]');if(!el)return;const t=(el.textContent||'').toLowerCase();if(t.includes('save game')||t.includes('save your studio'))save('manual-save')},true)}
 window.BOLS2SaveV5={save,recover,openLoad,localCommit,candidates,bestForStudio,tick,slotFor};wire();
})();