/* BOLS2 Local Career Storage v10 — IndexedDB is authoritative; localStorage is a compatibility mirror. */
(()=>{
  'use strict';
  const DB='BOLS2_LOCAL_CAREER_V10',STORE='records',SLOTS=5,INDEX='BOLS2_SAVE_INDEX_V1',LEGACY='bol2_saves_v1',AUTO='BOLS2_AUTOSAVE_V2';
  const studioName=s=>String(s?.studioName||s?.studio?.name||s?.name||'').trim();
  const keyName=s=>studioName(s).toLowerCase()||'default';
  const tick=s=>((Number(s?.year)||1)-1)*52+(Number(s?.week)||1);
  const clone=s=>{try{return structuredClone(s)}catch{try{return JSON.parse(JSON.stringify(s))}catch{return null}}};
  const open=()=>new Promise((resolve,reject)=>{if(!window.indexedDB){reject(new Error('IndexedDB unavailable'));return}const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE)){const st=db.createObjectStore(STORE,{keyPath:'id'});st.createIndex('type','type');st.createIndex('studio','studio');}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('IndexedDB open failed'))});
  const txReq=(db,mode,fn)=>new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode);const st=tx.objectStore(STORE);let req;try{req=fn(st)}catch(e){try{tx.abort()}catch{}reject(e);return}let out; if(req&&'onsuccess'in req){req.onsuccess=()=>{out=req.result};req.onerror=()=>reject(req.error||new Error('IndexedDB request failed'));}tx.oncomplete=()=>resolve(out);tx.onerror=()=>reject(tx.error||new Error('IndexedDB transaction failed'));tx.onabort=()=>reject(tx.error||new Error('IndexedDB transaction aborted'))});
  function mirrorMeta(records){try{const meta=records.map(r=>({slot:r.slot,studioName:r.studioName,year:r.year,week:r.week,updatedAt:r.updatedAt,source:'LOCAL DEVICE'}));localStorage.setItem(INDEX,JSON.stringify({version:1,savedAt:new Date().toISOString(),slots:meta}));}catch{}}
  function legacyRead(){try{const a=JSON.parse(localStorage.getItem(LEGACY)||'[]');return Array.isArray(a)?a.slice(0,SLOTS):[]}catch{return[]}}
  async function writeRecord(record){const db=await open();await txReq(db,'readwrite',st=>st.put(record));db.close();return true}
  async function getRecord(id){const db=await open();const out=await txReq(db,'readonly',st=>st.get(id));db.close();return out||null}
  async function allRecords(){const db=await open();const out=await txReq(db,'readonly',st=>st.getAll());db.close();return Array.isArray(out)?out:[]}
  async function saveNow(state,{slot,reason='manual-save',autosave=true}={}){
    const c=clone(state);if(!c||!studioName(c))return false;
    const n=Math.max(1,Math.min(SLOTS,Number(slot||c.saveSlot||c.slot)||1));c.saveSlot=n;c.slot=n;c.updatedAt=new Date().toISOString();
    try{const existing=await getRecord(`slot:${n}`);if(existing?.state){const et=tick(existing.state),ct=tick(c);if(et>ct||(et===ct&&String(existing.updatedAt||'')>String(c.updatedAt||'')))return true;}}catch{}
    const rec={id:`slot:${n}`,type:'slot',slot:n,studio:keyName(c),studioName:studioName(c),year:Number(c.year)||1,week:Number(c.week)||1,updatedAt:c.updatedAt,reason,state:c};
    await writeRecord(rec);
    if(autosave){await writeRecord({id:`auto:${keyName(c)}`,type:'autosave',slot:n,studio:keyName(c),studioName:studioName(c),year:Number(c.year)||1,week:Number(c.week)||1,updatedAt:c.updatedAt,reason:'autosave',state:c});}
    try{localStorage.setItem(AUTO,JSON.stringify({version:10,reason,savedAt:c.updatedAt,state:c}));}catch{}
    try{const a=legacyRead();a[n-1]=c;localStorage.setItem(LEGACY,JSON.stringify(a));}catch{}
    try{const rows=await allRecords();mirrorMeta(rows.filter(x=>x.type==='slot'));}catch{}
    return true;
  }
  let writeChain=Promise.resolve();
  async function save(state,opts={}){const task=writeChain.then(()=>saveNow(state,opts));writeChain=task.catch(()=>{});return task;}
  async function saveAutosave(state,reason='weekly-autosave'){return save(state,{slot:state?.saveSlot||state?.slot,reason,autosave:true})}
  async function slots(){
    try{const rows=(await allRecords()).filter(r=>r.type==='slot');const by=new Map(rows.map(r=>[Number(r.slot),r]));const out=[];for(let i=1;i<=SLOTS;i++){const r=by.get(i);if(r?.state)out.push({...r,slot:i});}if(out.length){mirrorMeta(rows);return out;}}
    catch{}
    return legacyRead().map((s,i)=>s?{id:`slot:${i+1}`,type:'slot',slot:i+1,studio:keyName(s),studioName:studioName(s),year:Number(s.year)||1,week:Number(s.week)||1,updatedAt:s.updatedAt||'',state:s}:null).filter(Boolean);
  }
  async function all(){return slots()}
  async function bestForStudio(s){
    const n=keyName(s);const recs=await allRecords().catch(()=>[]);const same=recs.filter(r=>r.state&&r.studio===n&&(r.type==='slot'||r.type==='autosave'));const pool=same.length?same:recs.filter(r=>r.state&&(r.type==='slot'||r.type==='autosave'));pool.sort((a,b)=>tick(b.state)-tick(a.state)||String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));return pool[0]?.state||null;
  }
  async function loadSlot(slot){const n=Math.max(1,Math.min(SLOTS,Number(slot)||1));try{const r=await getRecord(`slot:${n}`);if(r?.state)return clone(r.state)}catch{}const l=legacyRead()[n-1];return clone(l||null)}
  async function migrate(){
    try{const marker=localStorage.getItem('BOLS2_IDB_MIGRATED_V10');if(marker)return;const legacy=legacyRead();for(let i=0;i<legacy.length;i++){if(legacy[i]&&studioName(legacy[i]))await writeRecord({id:`slot:${i+1}`,type:'slot',slot:i+1,studio:keyName(legacy[i]),studioName:studioName(legacy[i]),year:Number(legacy[i].year)||1,week:Number(legacy[i].week)||1,updatedAt:legacy[i].updatedAt||new Date().toISOString(),reason:'migration',state:clone(legacy[i])});}const a=(()=>{try{return JSON.parse(localStorage.getItem(AUTO)||'null')}catch{return null}})();if(a?.state&&studioName(a.state))await writeRecord({id:`auto:${keyName(a.state)}`,type:'autosave',slot:Number(a.state.saveSlot||a.state.slot)||1,studio:keyName(a.state),studioName:studioName(a.state),year:Number(a.state.year)||1,week:Number(a.state.week)||1,updatedAt:a.savedAt||new Date().toISOString(),reason:'migration',state:clone(a.state)});localStorage.setItem('BOLS2_IDB_MIGRATED_V10','1');}catch(e){console.warn('[BOLS2] save migration',e)}
  }
  async function clearSlot(slot){const n=Math.max(1,Math.min(SLOTS,Number(slot)||1));try{const db=await open();await new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readwrite');t.objectStore(STORE).delete(`slot:${n}`);t.oncomplete=resolve;t.onerror=()=>reject(t.error)});db.close();}catch{}try{const a=legacyRead();a[n-1]=null;localStorage.setItem(LEGACY,JSON.stringify(a));}catch{}return true}
  async function clearAll(){try{const db=await open();await new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readwrite');t.objectStore(STORE).clear();t.oncomplete=resolve;t.onerror=()=>reject(t.error)});db.close();}catch{}try{localStorage.removeItem(AUTO);localStorage.removeItem(LEGACY);localStorage.removeItem(INDEX);localStorage.removeItem('BOLS2_IDB_MIGRATED_V10')}catch{}return true}
  window.BOLS2IndexedSave={version:10,save,saveAutosave,all,slots,bestForStudio,loadSlot,clearSlot,clearAll,migrate};
  window.BOLS2LocalStorage=window.BOLS2IndexedSave;
  migrate();
})();