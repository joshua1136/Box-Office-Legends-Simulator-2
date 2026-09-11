/* BOLS2 Career Resume v6
   One authoritative boot-time career resolver.
   Priority: newest local career -> matching cloud career -> current state.
   Explicit Load Studio remains user-controlled and is never overwritten by background recovery.
*/
(function(){
  'use strict';
  const AUTO='BOLS2_AUTOSAVE_V2', LEGACY='bol2_saves_v1', SLOT_COUNT=5;
  let resolving=false, booted=false, explicitLoad=false;
  const tick=s=>((+s?.year||1)-1)*52+(+s?.week||1);
  const name=s=>String((s?.studio&&s.studio.name)||s?.studioName||s?.name||'Unnamed Studio');
  const studioKey=s=>String((s?.studio&& (s.studio.id||s.studio.studioId||s.studio.name))||s?.studioName||s?.name||'default');
  const clone=s=>{try{return JSON.parse(JSON.stringify(s))}catch{return null}};
  function current(){return window.__BOL_STATE__||window.state||window.__BOL_CURRENT_STATE__||null}
  function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}}
  function localCandidates(){
    const out=[];
    const a=readJson(AUTO); if(a?.state) out.push({state:a.state,source:'AUTOSAVE',savedAt:a.savedAt||'',slot:a.state.saveSlot||a.state.slot||1});
    const l=readJson(LEGACY);
    if(Array.isArray(l)) l.forEach((x,i)=>{ if(x) out.push({state:x,source:'LOCAL SLOT '+(i+1),savedAt:x.updatedAt||x.savedAt||'',slot:i+1}) });
    if(l&&typeof l==='object'&&!Array.isArray(l)) Object.entries(l).forEach(([k,x])=>{if(x&&typeof x==='object')out.push({state:x.state||x.game_state||x,source:'LOCAL',savedAt:x.savedAt||x.updatedAt||'',slot:+k||1})});
    return out.filter(x=>x.state&&typeof x.state==='object');
  }
  function bestLocal(studio){
    const key=studioKey(studio); let best=null;
    localCandidates().forEach(c=>{if(studioKey(c.state)!==key)return; if(!best||tick(c.state)>tick(best.state)||tick(c.state)===tick(best.state)&&String(c.savedAt)>String(best.savedAt))best=c});
    return best;
  }
  function apply(s,reason){
    const next=clone(s); if(!next)return false;
    const target=current();
    if(target&&typeof target==='object'){
      Object.keys(target).forEach(k=>{try{delete target[k]}catch{}});
      Object.assign(target,next);
      window.state=target; window.__BOL_STATE__=target; window.__BOL_CURRENT_STATE__=target;
      if(typeof window.start==='function') { try{window.start(target)}catch(e){console.warn('[BOLS2 Resume]',reason,e)} }
      return target;
    }
    window.state=next; window.__BOL_STATE__=next; window.__BOL_CURRENT_STATE__=next;
    if(typeof window.start==='function') {try{window.start(next)}catch(e){console.warn('[BOLS2 Resume]',reason,e)}}
    return next;
  }
  function writeCanonical(s){
    const c=clone(s); if(!c)return;
    try{localStorage.setItem(AUTO,JSON.stringify({version:6,reason:'resume-canonical',savedAt:new Date().toISOString(),state:c}))}catch{}
    try{
      const arr=Array.isArray(readJson(LEGACY))?readJson(LEGACY):[]; const slot=Math.max(1,Math.min(SLOT_COUNT,Number(c.saveSlot||c.slot)||1)); arr[slot-1]=c; localStorage.setItem(LEGACY,JSON.stringify(arr));
    }catch{}
  }
  async function cloudBest(studio){
    try{
      if(!window.BOLS2Cloud?.init || !window.BOLS2Cloud?.list)return null;
      await window.BOLS2Cloud.init();
      const r=await window.BOLS2Cloud.list();
      const rows=Array.isArray(r)?r:(r?.data||r?.rows||[]);
      const key=studioKey(studio);
      return rows.filter(x=>x?.game_state && (studioKey(x.game_state)===key || name(x.game_state)===name(studio)))
        .sort((a,b)=>tick(b.game_state)-tick(a.game_state) || (+b.game_revision||0)-(+a.game_revision||0))[0]||null;
    }catch(e){console.warn('[BOLS2 Resume] cloud read failed',e);return null}
  }
  async function resolve(startState){
    if(resolving||explicitLoad)return current()||startState;
    resolving=true;
    try{
      const base=startState||current();
      const local=base?bestLocal(base):null;
      const cloud=base?await cloudBest(base):null;
      const candidates=[];
      if(local?.state)candidates.push({state:local.state,source:local.source,stamp:local.savedAt});
      if(cloud?.game_state)candidates.push({state:cloud.game_state,source:'SUPABASE',stamp:cloud.updated_at||cloud.created_at});
      if(base)candidates.push({state:base,source:'RUNTIME',stamp:''});
      candidates.sort((a,b)=>tick(b.state)-tick(a.state)||String(b.stamp).localeCompare(String(a.stamp)));
      const winner=candidates[0];
      if(winner && base && tick(winner.state)>tick(base)){
        apply(winner.state,'newest-career');
        writeCanonical(winner.state);
        try{window.toast?.('☁️ Career recovered — Week '+winner.state.week+' · Year '+winner.state.year)}catch{}
      }else if(base){
        writeCanonical(base);
      }
      return current()||base;
    }finally{resolving=false}
  }
  function openLoad(){
    explicitLoad=true;
    try{window.BOLS2SaveV5?.openLoad?.();return}catch{}
    try{window.BOLS2Cloud?.load?.()}catch{}
  }
  function wire(){
    document.addEventListener('click',ev=>{
      const el=ev.target?.closest?.('button,a,[role="button"]'); if(!el)return;
      const t=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(t.includes('load studio')||t.includes('load your saves')||t==='load save'){ev.preventDefault();ev.stopImmediatePropagation();openLoad();}
    },true);
  }
  async function boot(){
    if(booted)return; booted=true; wire();
    setTimeout(async()=>{
      const s=current();
      if(!s)return;
      await resolve(s);
      // From this point, background resume must never replace an explicitly loaded slot.
      window.__BOLS2_CAREER_RESOLVED__=true;
      window.__BOLS2_CAREER_TICK__=tick(current());
      window.__BOLS2_CAREER_STUDIO__=studioKey(current());
    },1200);
  }
  window.BOLS2CareerResume={resolve,openLoad,bestLocal,localCandidates,tick};
  boot();
})();