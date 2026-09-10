/* BOLS2 SAVE SYSTEM V4 — canonical Continue/Save UX */
(function(){
  'use strict';
  const AUTO='BOLS2_AUTOSAVE_V2';
  const LEGACY='bol2_saves_v1';
  let busy=false;

  function getState(){ return window.state || window.__BOL_STATE__ || null; }
  function score(s){
    if(!s) return [-1,-1,-1];
    return [Number(s.year||s.game_year||0),Number(s.week||s.game_week||0),Number(s.revision||s.game_revision||0)];
  }
  function newer(a,b){
    const x=score(a),y=score(b);
    for(let i=0;i<3;i++){ if(x[i]!==y[i]) return x[i]>y[i]; }
    return false;
  }
  function readJSON(key){ try{return JSON.parse(localStorage.getItem(key)||'null');}catch(e){return null;} }
  function unwrap(v){
    if(!v)return null;
    if(v.game_state)return v.game_state;
    if(v.state)return v.state;
    if(v.snapshot)return v.snapshot;
    return v;
  }
  function currentStudio(s){ return String(s?.studioName||s?.studio?.name||s?.name||s?.studio_name||'').trim(); }

  function bestLocal(){
    const candidates=[];
    const a=readJSON(AUTO); if(a) candidates.push(unwrap(a));
    const l=readJSON(LEGACY);
    if(Array.isArray(l)) l.forEach(x=>candidates.push(unwrap(x?.state||x)));
    else if(l){
      if(Array.isArray(l.slots)) l.slots.forEach(x=>candidates.push(unwrap(x?.state||x)));
      else if(l.slots && typeof l.slots==='object') Object.values(l.slots).forEach(x=>candidates.push(unwrap(x?.state||x)));
      else candidates.push(unwrap(l));
    }
    candidates.filter(Boolean).sort((a,b)=>newer(a,b)?-1:1);
    return candidates[0]||null;
  }

  async function loadLatest(){
    if(busy)return;
    busy=true;
    try{
      const cur=getState();
      const studio=currentStudio(cur);
      let candidate=null;
      // Cloud is authoritative when it has a save for this career.
      try{
        if(window.BOLS2Cloud?.list){
          const list=await window.BOLS2Cloud.list();
          const rows=Array.isArray(list)?list:(list?.rows||list?.data||[]);
          rows.filter(Boolean).forEach(r=>{
            const s=unwrap(r);
            if(!s)return;
            if(!studio || !currentStudio(s) || currentStudio(s)===studio){
              if(!candidate || newer(s,candidate)) candidate=s;
            }
          });
        }
      }catch(e){ console.warn('Cloud load unavailable',e); }
      const local=bestLocal();
      if(local && (!candidate || newer(local,candidate))) candidate=local;
      if(!candidate){
        alert('No saved studio was found yet. Save your studio first.');
        return;
      }
      // Never replace a newer current session with an older save.
      if(cur && currentStudio(cur)===currentStudio(candidate) && !newer(candidate,cur) && !newer(cur,candidate)){
        // equal is fine; continue
      }
      window.state=candidate;
      window.__BOL_STATE__=candidate;
      try{ localStorage.setItem(AUTO,JSON.stringify({version:2,savedAt:new Date().toISOString(),reason:'continue-load',week:candidate.week,year:candidate.year,studioKey:currentStudio(candidate),state:candidate})); }catch(e){}
      if(typeof window.start==='function') window.start(candidate);
      else if(typeof window.render==='function') window.render();
    }finally{ setTimeout(()=>{busy=false;},300); }
  }

  function saveConfirmed(){
    if(busy)return;
    busy=true;
    try{
      const s=getState();
      if(!s){alert('There is no active studio to save.');return;}
      const week=s.week||1,year=s.year||1;
      const money=Number(s.cash ?? s.money ?? 0).toLocaleString('en-US');
      const ok=confirm(`SAVE STUDIO?\n\nSave your current studio progress?\n\nYear ${year} · Week ${week}\n$${money}\n\nChoose OK to save, or Cancel to go back.`);
      if(!ok)return;
      if(typeof window.saveCurrent==='function') window.saveCurrent('manual-save');
      else {
        const payload={version:2,savedAt:new Date().toISOString(),reason:'manual-save',week:week,year:year,studioKey:currentStudio(s),state:s};
        localStorage.setItem(AUTO,JSON.stringify(payload));
      }
      setTimeout(()=>alert('✓ STUDIO SAVED\n\nYour progress has been saved successfully.'),80);
    }finally{setTimeout(()=>{busy=false;},500);}
  }

  function buttonLabel(el){return (el?.innerText||el?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();}
  document.addEventListener('click',function(ev){
    const el=ev.target?.closest?.('button,[role="button"],a'); if(!el)return;
    const label=buttonLabel(el);
    if(/load your save|continue|load save/.test(label)){
      ev.preventDefault();ev.stopImmediatePropagation();
      loadLatest();
      return;
    }
    if(/save studio|save game/.test(label) && !/load/.test(label)){
      ev.preventDefault();ev.stopImmediatePropagation();
      saveConfirmed();
    }
  },true);

  window.BOLS2SaveV4={loadLatest,saveConfirmed};
})();