/* BOLS2 Core Kernel v1 — single owner for career resume, persistence, and weekly handoff. */
(()=>{
  'use strict';
  const AUTO='BOLS2_AUTOSAVE_V2', LEGACY='bol2_saves_v1', SLOTS=5;
  const tick=s=>((Number(s?.year)||1)-1)*52+(Number(s?.week)||1);
  const clone=s=>{try{return JSON.parse(JSON.stringify(s))}catch{return null}};
  const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
  const name=s=>String(s?.studioName||s?.studio?.name||s?.name||'').trim();
  const valid=s=>!!s&&typeof s==='object'&&name(s)&&Number.isFinite(Number(s.week))&&Number.isFinite(Number(s.year));
  function candidates(){
    const out=[]; const a=read(AUTO); if(valid(a?.state))out.push({state:a.state,source:'AUTOSAVE',slot:Number(a.state.saveSlot||a.state.slot)||1,savedAt:String(a.savedAt||a.state.updatedAt||'')});
    const l=read(LEGACY); if(Array.isArray(l))l.forEach((s,i)=>{if(valid(s))out.push({state:s,source:'LOCAL SLOT '+(i+1),slot:i+1,savedAt:String(s.updatedAt||s.savedAt||'')})});
    return out;
  }
  function newest(){return candidates().sort((a,b)=>tick(b.state)-tick(a.state)||b.savedAt.localeCompare(a.savedAt))[0]||null;}
  function newestForStudio(studio){
    const n=name(studio); const all=candidates();
    /* Never trust the currently mounted state when selecting a save. A stale
       in-memory object (for example Week 13 after the player reached Week 15)
       must not make Continue/Load settle on the stale copy. Prefer the newest
       persisted snapshot by studio, then by timeline. */
    const same=n?all.filter(x=>name(x.state).toLowerCase()===n.toLowerCase()):[];
    const pool=same.length?same:all;
    return pool.sort((a,b)=>{
      const aw=tick(a.state),bw=tick(b.state);
      return bw-aw||String(b.savedAt).localeCompare(String(a.savedAt));
    })[0]||null;
  }
  function persist(s,reason='checkpoint'){
    const c=clone(s); if(!valid(c))return false;
    const current=newestForStudio(c);
    if(current&&tick(current.state)>tick(c))return false;
    c.saveSlot=Math.max(1,Math.min(SLOTS,Number(c.saveSlot||c.slot)||1));
    c.updatedAt=new Date().toISOString();
    try{
      const arr=read(LEGACY); const slots=Array.isArray(arr)?arr.slice(0,SLOTS):[];
      const idx=c.saveSlot-1; const existing=slots[idx];
      if(!existing||!name(existing)||name(existing).toLowerCase()===name(c).toLowerCase()||tick(c)>=tick(existing))slots[idx]=c;
      localStorage.setItem(LEGACY,JSON.stringify(slots));
      localStorage.setItem(AUTO,JSON.stringify({version:8,reason,savedAt:c.updatedAt,state:c}));
      return true;
    }catch(e){console.warn('[BOLS2 Core] save failed',e);return false;}
  }
  function install(s){const c=clone(s);if(!valid(c))return false;const live=window.__BOL_STATE__||window.state;if(live&&typeof live==='object'){Object.keys(live).forEach(k=>{try{delete live[k]}catch{}});Object.assign(live,c);window.state=live;window.__BOL_STATE__=live;window.__BOL_CURRENT_STATE__=live;try{window.start?.(live)}catch(e){console.error('[BOLS2 Core] start failed',e)}}else{window.state=c;window.__BOL_STATE__=c;window.__BOL_CURRENT_STATE__=c;try{window.start?.(c)}catch(e){console.error('[BOLS2 Core] start failed',e)}}return true;}
  function resume(){const current=window.__BOL_STATE__||window.state;const best=newestForStudio(current);if(!best)return false;/* Resume should always mount the persisted winner, not reuse a possibly stale in-memory object. */install(best.state);return true;}
  let lastSig='';
  const signature=s=>{const c=clone(s);if(!c)return '';delete c.updatedAt;return JSON.stringify(c)};
  function checkpoint(reason='progress'){const s=window.__BOL_STATE__||window.state;if(!valid(s))return false;const sig=signature(s);if(sig===lastSig)return true;const ok=persist(s,reason);if(ok)lastSig=sig;return ok;}
  function repairStaleSlot(){
    const a=read(AUTO); if(!valid(a?.state))return false;
    const slots=read(LEGACY); if(!Array.isArray(slots))return false;
    const as=a.state, idx=Math.max(0,Math.min(SLOTS-1,Number(as.saveSlot||as.slot)-1));
    const cur=slots[idx];
    if(!cur||tick(as)>tick(cur)||(tick(as)===tick(cur)&&String(a.savedAt||'')>String(cur.updatedAt||cur.savedAt||''))){
      as.saveSlot=idx+1;
      slots[idx]=as;
      try{localStorage.setItem(LEGACY,JSON.stringify(slots));return true}catch{}
    }
    return false;
  }
  function openLoad(){return window.__BOLS2_OPEN_LOAD_V6__?.()||false;}
  function bind(){
    document.addEventListener('click',ev=>{
      const el=ev.target?.closest?.('#continue');
      if(!el)return;
      ev.preventDefault();ev.stopImmediatePropagation();
      if(!resume())window.toast?.('No saved studio yet.');
    },true);
    document.addEventListener('click',ev=>{
      const el=ev.target?.closest?.('#load');
      if(!el)return;
      ev.preventDefault();ev.stopImmediatePropagation();openLoad();
    },true);
    document.addEventListener('click',ev=>{
      const el=ev.target?.closest?.('#save');
      if(!el)return;
      ev.preventDefault();ev.stopImmediatePropagation();const s=window.__BOL_STATE__||window.state;if(window.confirmSaveGame&&s){window.confirmSaveGame(s);return;}checkpoint('manual-save');window.toast?.('Studio saved on this device.');
    },true);
    document.addEventListener('click',ev=>{
      const el=ev.target?.closest?.('#next');
      if(!el)return;
      ev.preventDefault();ev.stopImmediatePropagation();
      const s=window.__BOL_STATE__||window.state;
      if(!s){window.toast?.('No active studio.');return;}
      if(window.__BOLS2_WEEKLY_ENGINE__?.simulate){window.__BOLS2_WEEKLY_ENGINE__.simulate(s);return;}
      if(typeof window.showWeeklyReport==='function'){window.showWeeklyReport(s);return;}
      window.toast?.('Weekly engine is still loading. Please try again.');
    },true);
    document.addEventListener('click',ev=>{
      const el=ev.target?.closest?.('#continueStudioReport');
      if(!el)return;
      ev.preventDefault();ev.stopImmediatePropagation();
      if(window.__BOLS2_WEEKLY_ENGINE__?.commit){if(!window.__BOLS2_WEEKLY_ENGINE__.commit())window.toast?.('This weekly report is no longer active.');return;}
      window.toast?.('Weekly engine is still loading.');
    },true);
    window.addEventListener('pagehide',()=>checkpoint('page-exit'));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')checkpoint('background-save')});
    setInterval(()=>checkpoint('progress-autosave'),750);
  }
  /* Compatibility facade: older gameplay modules may still call BOLS2SaveV5.
     They now resolve to this one local-only save owner instead of a second engine. */
  window.BOLS2SaveV5={
    version:8,
    save:(reason='autosave',s)=>{const target=s||window.__BOL_STATE__||window.state;return target?persist(target,reason):false;},
    localCommit:(s,reason='state-sync')=>persist(s,reason),
    recover:resume,
    candidates,
    bestForStudio:newestForStudio,
    openLoad,
    detectAndSave:checkpoint,
    slotFor:s=>Math.max(1,Math.min(SLOTS,Number(s?.saveSlot||s?.slot)||1))
  };
  window.BOLS2Core={version:2,tick,candidates,newest,newestForStudio,persist,install,resume,checkpoint,openLoad};
  window.__BOLS2_CORE_READY__=true;
  bind();
})();