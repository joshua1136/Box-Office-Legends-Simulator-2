/* BOLS2 Save System v2 — crash-safe weekly autosave + recovery layer */
(function(){
  'use strict';
  const KEY='BOLS2_AUTOSAVE_V2';
  const VERSION=2;
  let lastFingerprint='';
  let restoring=false;

  function getState(){ return window.__BOL_STATE__ || window.state || null; }
  function studioKey(s){
    if(!s) return 'unknown';
    const st=s.studio||s.currentStudio||{};
    return String(st.id || st.studioId || st.name || s.studioName || s.name || 'default');
  }
  function safeClone(s){
    try { return JSON.parse(JSON.stringify(s)); } catch(e){
      console.warn('[BOLS2 Save] state could not be serialized',e);
      return null;
    }
  }
  function snapshot(reason){
    const s=getState();
    if(!s || restoring) return false;
    const copy=safeClone(s);
    if(!copy) return false;
    const payload={version:VERSION,savedAt:Date.now(),reason,week:+copy.week||1,year:+copy.year||1,studioKey:studioKey(copy),state:copy};
    try {
      const previous=read();
      if(previous && String(previous.studioKey||'')===String(payload.studioKey||'') ){
        const oldTick=(+previous.year||1)*52+(+previous.week||1);
        const newTick=(+payload.year||1)*52+(+payload.week||1);
        // Never let a legacy/main-menu transition overwrite a newer autosave.
        if(newTick<oldTick) return false;
      }
      localStorage.setItem(KEY,JSON.stringify(payload));
      lastFingerprint=`${payload.studioKey}|${payload.year}|${payload.week}`;
      return true;
    } catch(e){ console.warn('[BOLS2 Save] localStorage write failed',e); return false; }
  }
  function read(){
    try { const raw=localStorage.getItem(KEY); return raw?JSON.parse(raw):null; } catch(e){ return null; }
  }
  function restoreIfNewer(){
    const current=getState(), saved=read();
    if(!current || !saved || !saved.state) return false;
    const ck=studioKey(current), sk=String(saved.studioKey||'');
    if(sk!=='unknown' && ck!=='unknown' && sk!==ck) return false;
    const cw=(+current.year||1)*52+(+current.week||1);
    const sw=(+saved.year||1)*52+(+saved.week||1);
    if(sw<=cw) return false;
    restoring=true;
    try{
      Object.keys(current).forEach(k=>{ try{ delete current[k]; }catch(e){} });
      Object.assign(current,saved.state);
      window.state=current;
      window.__BOL_STATE__=current;
      if(typeof window.start==='function') setTimeout(()=>{ try{ window.start(current); }catch(e){ console.warn('[BOLS2 Save] dashboard refresh failed',e); } },0);
      lastFingerprint=`${saved.studioKey}|${saved.year}|${saved.week}`;
      console.info(`[BOLS2 Save] Recovered Week ${saved.week}, Year ${saved.year} from autosave.`);
      return true;
    } finally { restoring=false; }
  }
  function currentFingerprint(){ const s=getState(); if(!s) return ''; return `${studioKey(s)}|${+s.year||1}|${+s.week||1}`; }

  window.BOLS2Save={save:snapshot,recover:restoreIfNewer,read};

  // Wrap the app's normal save function when it is exposed, while preserving its behavior.
  function wrapSave(){
    if(typeof window.saveCurrent!=='function' || window.saveCurrent.__bolsWrapped) return;
    const original=window.saveCurrent;
    const wrapped=function(){
      let result;
      try{ result=original.apply(this,arguments); } finally { snapshot('manual-save'); }
      return result;
    };
    wrapped.__bolsWrapped=true;
    window.saveCurrent=wrapped;
  }

  // Capture every week transition and every important exit/navigation action.
  function wire(){
    wrapSave();
    restoreIfNewer();
    document.addEventListener('click',function(ev){
      const el=ev.target && ev.target.closest ? ev.target.closest('button,a,[role="button"]') : null;
      if(!el) return;
      const text=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(text.includes('save game') || text.includes('save your studio')) snapshot('save-button');
      if(text.includes('main menu') || text.includes('return safely')) snapshot('main-menu-exit');
      if(text.includes('load studio') || text.includes('load save')) setTimeout(()=>restoreIfNewer(),350);
    },true);
    window.addEventListener('pagehide',()=>snapshot('pagehide'));
    window.addEventListener('beforeunload',()=>snapshot('beforeunload'));
    document.addEventListener('visibilitychange',()=>{ if(document.hidden) snapshot('background'); });
  }

  // Start after the existing game scripts have initialized state.
  setTimeout(wire,100);
  setInterval(function(){
    wrapSave();
    const fp=currentFingerprint();
    if(fp && fp!==lastFingerprint) snapshot('weekly-state-change');
  },750);
})();