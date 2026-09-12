/* BOLS2 Save Storage v9 — IndexedDB backup/archive for large careers. */
(()=>{
  'use strict';
  const DB='BOLS2_SAVE_DB_V1',STORE='careers';
  const studioName=s=>String(s?.studioName||s?.studio?.name||s?.name||'').trim();
  const tick=s=>((Number(s?.year)||1)-1)*52+(Number(s?.week)||1);
  const clone=s=>{try{return structuredClone(s)}catch{try{return JSON.parse(JSON.stringify(s))}catch{return null}}};
  const open=()=>new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('IndexedDB open failed'))});
  const id=s=>studioName(s).toLowerCase()||'default';
  async function save(s){const c=clone(s);if(!c)return false;const db=await open();await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite'),st=tx.objectStore(STORE);st.put({id:id(c),studioName:studioName(c),year:Number(c.year)||1,week:Number(c.week)||1,updatedAt:c.updatedAt||new Date().toISOString(),state:c});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('IndexedDB write failed'))});db.close();return true}
  async function all(){const db=await open();const rows=await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly'),st=tx.objectStore(STORE),r=st.getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error||new Error('IndexedDB read failed'))});db.close();return rows}
  async function bestForStudio(s){const n=studioName(s).toLowerCase();const rows=await all();const same=rows.filter(x=>String(x.studioName||'').toLowerCase()===n);const pool=same.length?same:rows;pool.sort((a,b)=>tick(b.state)-tick(a.state)||String(b.updatedAt).localeCompare(String(a.updatedAt)));return pool[0]?.state||null}
  async function bootRecover(){try{const current=window.__BOL_STATE__||window.state;const best=await bestForStudio(current||{});if(!best)return false;if(!current||tick(best)>tick(current)||!studioName(current)){let live=current;if(!live||typeof live!=='object'){live=clone(best)}else{Object.keys(live).forEach(k=>{try{delete live[k]}catch{}});Object.assign(live,clone(best))}window.state=live;window.__BOL_STATE__=live;window.__BOL_CURRENT_STATE__=live;try{window.start?.(live)}catch{};return true}return false}catch(e){console.warn('[BOLS2 IndexedDB]',e);return false}}
  window.BOLS2IndexedSave={version:9,save,all,bestForStudio,bootRecover};
  setTimeout(()=>bootRecover(),1800);
})();