/* BOLS2 Supabase Cloud Save v1
   Browser-side publishable key is intentionally used here; Supabase RLS protects rows.
   Anonymous Auth must be enabled in the Supabase dashboard.
*/
(function(){
  'use strict';

  const SUPABASE_URL='https://zgzoubtueebbznzsspeg.supabase.co';
  const SUPABASE_KEY='sb_publishable_zQrTHbtHrIEf-CJpUmuiOw_KAL_20r5';
  const SLOT_COUNT=5;
  const REV_KEY='BOLS2_CLOUD_REVISION_V1';
  let client=null;
  let user=null;
  let authPromise=null;
  let lastFingerprint='';
  let saving=false;
  let ready=false;
  let booted=false;

  function state(){ return window.__BOL_STATE__ || window.state || null; }
  function studioKey(s){
    if(!s) return 'unknown';
    const st=s.studio||s.currentStudio||{};
    return String(st.id || st.studioId || st.name || s.studioName || s.name || 'default');
  }
  function clone(s){
    try{return JSON.parse(JSON.stringify(s));}catch(e){return null;}
  }
  function tick(s){ return ((+s.year||1)*52)+(+s.week||1); }
  function fingerprint(s){ return s ? `${studioKey(s)}|${+s.year||1}|${+s.week||1}` : ''; }
  function localRevision(){
    try{return +(localStorage.getItem(REV_KEY)||0)||0;}catch(e){return 0;}
  }
  function nextRevision(){
    const r=Math.max(Date.now(),localRevision()+1);
    try{localStorage.setItem(REV_KEY,String(r));}catch(e){}
    return r;
  }
  function toast(msg){
    try{
      if(typeof window.showToast==='function') return window.showToast(msg);
      if(typeof window.toast==='function') return window.toast(msg);
    }catch(e){}
    console.info('[BOLS2 Cloud]',msg);
  }

  function getClient(){
    if(client) return client;
    if(!window.supabase || typeof window.supabase.createClient!=='function'){
      console.warn('[BOLS2 Cloud] Supabase JS client is not loaded.');
      return null;
    }
    client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}
    });
    return client;
  }

  async function ensureAuth(){
    if(user) return user;
    if(authPromise) return authPromise;
    authPromise=(async()=>{
      const sb=getClient();
      if(!sb) throw new Error('Supabase client unavailable');
      const existing=await sb.auth.getSession();
      if(existing.data && existing.data.session && existing.data.session.user){
        user=existing.data.session.user;
        ready=true;
        return user;
      }
      const signed=await sb.auth.signInAnonymously();
      if(signed.error) throw signed.error;
      user=signed.data && signed.data.user;
      if(!user && signed.data && signed.data.session) user=signed.data.session.user;
      if(!user) throw new Error('Anonymous Supabase session was not returned');
      ready=true;
      return user;
    })().catch(err=>{
      ready=false;
      console.warn('[BOLS2 Cloud] Authentication unavailable:',err && err.message || err);
      return null;
    }).finally(()=>{authPromise=null;});
    return authPromise;
  }

  function slotForState(s){
    const explicit=Number(s?.saveSlot||s?.slot);
    if(explicit>=1&&explicit<=SLOT_COUNT)return explicit;
    try{
      const arr=JSON.parse(localStorage.getItem('bol2_saves_v1')||'[]');
      const idx=arr.findIndex(x=>x&&String(x.studioName||'')===String(s?.studioName||''));
      if(idx>=0&&idx<SLOT_COUNT)return idx+1;
    }catch(e){}
    return 1;
  }

  async function getCloudSave(slot=1){
    const u=await ensureAuth();
    const sb=getClient();
    if(!u||!sb) return {data:null,error:new Error('Cloud authentication unavailable')};
    const result=await sb.from('bols2_saves')
      .select('*')
      .eq('user_id',u.id)
      .eq('slot',Math.max(1,Math.min(SLOT_COUNT,Number(slot)||1)))
      .maybeSingle();
    return result;
  }

  async function listCloudSaves(){
    const u=await ensureAuth();
    const sb=getClient();
    if(!u||!sb)return {data:[],error:new Error('Cloud authentication unavailable')};
    return await sb.from('bols2_saves').select('*').eq('user_id',u.id).order('slot',{ascending:true});
  }

  async function deleteCloudSlot(slot){
    const u=await ensureAuth();
    const sb=getClient();
    if(!u||!sb)return {error:new Error('Cloud authentication unavailable')};
    const target=Math.max(1,Math.min(SLOT_COUNT,Number(slot)||1));
    const current=await sb.from('bols2_saves').select('id').eq('user_id',u.id).eq('slot',target).maybeSingle();
    if(current.error)return current;
    if(!current.data)return {data:null,error:null};
    return await sb.from('bols2_saves').delete().eq('id',current.data.id);
  }

  let saveQueue=Promise.resolve();
  function queueCloudSave(reason,slot,sourceState=null){
    const run=saveQueue.then(()=>saveCloudNow(reason,slot,sourceState));
    saveQueue=run.catch(()=>{});
    return run;
  }

  async function saveCloudNow(reason,slot=null,sourceState=null){
    const s=sourceState || state();
    if(!s) return {ok:false,skipped:true};
    const targetSlot=Math.max(1,Math.min(SLOT_COUNT,Number(slot||slotForState(s))||1));
    s.saveSlot=targetSlot;
    const copy=clone(s);
    if(!copy) return {ok:false,error:'State could not be serialized'};
    const u=await ensureAuth();
    const sb=getClient();
    if(!u||!sb) return {ok:false,error:'Supabase authentication is not enabled'};

    saving=true;
    try{
      const existing=await getCloudSave(targetSlot);
      if(existing.error) throw existing.error;
      const old=existing.data;
      const oldTick=old ? ((+old.game_year||1)*52)+(+old.game_week||1) : -1;
      const newTick=tick(copy);
      const oldRevision=old ? (+old.game_revision||0) : 0;
      const stateRevision=Math.max(+copy.__bols2CloudRevision||0,localRevision(),oldRevision)+1;
      copy.__bols2CloudRevision=stateRevision;

      // A stale local/main-menu state must never roll the cloud save backward.
      if(old && (newTick<oldTick || (newTick===oldTick && stateRevision<=oldRevision))){
        return {ok:false,skipped:true,reason:'cloud-newer'};
      }

      const row={
        user_id:u.id,
        player_key:studioKey(copy),
        studio_name:String((copy.studio&&copy.studio.name)||copy.studioName||copy.name||'Unnamed Studio'),
        slot:targetSlot,
        game_state:copy,
        game_week:+copy.week||1,
        game_year:+copy.year||1,
        game_revision:stateRevision,
        game_version:'2.0',
        schema_version:2,
        is_autosave:reason!=='manual-save' && reason!=='save-button',
        updated_at:new Date().toISOString()
      };

      let saved;
      if(old){
        saved=await sb.from('bols2_saves').update(row).eq('id',old.id).select('*').single();
      }else{
        saved=await sb.from('bols2_saves').insert(row).select('*').single();
      }
      if(saved.error) throw saved.error;

      const saveRow=saved.data;
      const snap=await sb.from('bols2_save_snapshots').insert({
        user_id:u.id,
        save_id:saveRow.id,
        player_key:row.player_key,
        studio_name:row.studio_name,
        game_state:copy,
        game_week:row.game_week,
        game_year:row.game_year,
        game_revision:stateRevision
      });
      if(snap.error) console.warn('[BOLS2 Cloud] Snapshot write failed:',snap.error.message);

      try{ localStorage.setItem(REV_KEY,String(stateRevision)); }catch(e){}
      lastFingerprint=fingerprint(copy);
      return {ok:true,data:saveRow};
    }catch(err){
      console.warn('[BOLS2 Cloud] Save failed:',err && err.message || err);
      return {ok:false,error:err && err.message || String(err)};
    }finally{saving=false;}
  }

  async function restoreCloudIfNewer(force,slot=null){
    const current=state();
    const targetSlot=Math.max(1,Math.min(SLOT_COUNT,Number(slot||slotForState(current))||1));
    const result=await getCloudSave(targetSlot);
    if(result.error || !result.data || !result.data.game_state) return false;
    const cloud=result.data;
    const cloudState=cloud.game_state;
    if(!current){
      window.state=cloudState;
      window.__BOL_STATE__=cloudState;
      if(typeof window.start==='function') setTimeout(()=>window.start(cloudState),0);
      return true;
    }
    const sameStudio=studioKey(current)==='unknown' || studioKey(cloudState)==='unknown' || studioKey(current)===studioKey(cloudState);
    if(!sameStudio && !force) return false;
    const newer=(+cloud.game_revision||0)>(+current.__bols2CloudRevision||localRevision()||0) || tick(cloudState)>tick(current);
    if(!force && !newer) return false;

    try{
      Object.keys(current).forEach(k=>{try{delete current[k];}catch(e){}});
      Object.assign(current,clone(cloudState));
      window.state=current;
      window.__BOL_STATE__=current;
      try{localStorage.setItem(REV_KEY,String(cloud.game_revision||0));}catch(e){}
      lastFingerprint=fingerprint(current);
      if(typeof window.start==='function') setTimeout(()=>{try{window.start(current);}catch(e){}},0);
      toast(`☁️ Cloud save recovered — Week ${cloud.game_week}, Year ${cloud.game_year}`);
      return true;
    }catch(e){
      console.warn('[BOLS2 Cloud] Restore failed:',e);
      return false;
    }
  }

  function wrapSave(){
    if(typeof window.saveCurrent!=='function' || window.saveCurrent.__bolsCloudWrapped) return;
    const original=window.saveCurrent;
    const wrapped=function(){
      let result;
      try{result=original.apply(this,arguments);}finally{queueCloudSave('manual-save',slotForState(state()));}
      return result;
    };
    wrapped.__bolsCloudWrapped=true;
    window.saveCurrent=wrapped;
  }

  function wire(){
    wrapSave();
    document.addEventListener('click',function(ev){
      const el=ev.target&&ev.target.closest?ev.target.closest('button,a,[role="button"]'):null;
      if(!el)return;
      const text=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(text.includes('save game')||text.includes('save your studio')) queueCloudSave('save-button',slotForState(state()));
      if(text.includes('main menu')||text.includes('return safely')) queueCloudSave('main-menu-exit',slotForState(state()));
      if(text.includes('load studio')||text.includes('load save')) setTimeout(()=>restoreCloudIfNewer(true),700);
    },true);
    window.addEventListener('pagehide',()=>queueCloudSave('pagehide',slotForState(state())));
    document.addEventListener('visibilitychange',()=>{if(document.hidden)queueCloudSave('background',slotForState(state()));});
  }

  async function boot(){
    if(booted)return;
    booted=true;
    getClient();
    const u=await ensureAuth();
    if(!u){
      console.warn('[BOLS2 Cloud] Cloud saves are offline until Supabase Anonymous Sign-Ins are enabled. Local autosave remains active.');
      return;
    }
    // Cloud recovery is conservative: only restore a newer cloud timeline for the current studio.
    await restoreCloudIfNewer(false);
    wrapSave();
  }

  window.BOLS2Cloud={
    init:boot,
    auth:ensureAuth,
    save:(reason,slot)=>queueCloudSave(reason,slot),
    saveSlot:(slot,reason='manual-save')=>queueCloudSave(reason,slot),
    saveState:(sourceState,slot=1,reason='weekly-autosave')=>queueCloudSave(reason,slot,sourceState),
    deleteSlot:(slot)=>deleteCloudSlot(slot),
    load:()=>restoreCloudIfNewer(true),
    loadSlot:(slot)=>restoreCloudIfNewer(true,slot),
    recover:()=>restoreCloudIfNewer(false),
    recoverSlot:(slot)=>restoreCloudIfNewer(false,slot),
    get:getCloudSave,
    getSlot:(slot)=>getCloudSave(slot),
    list:listCloudSaves,
    get status(){return {ready,userId:user&&user.id||null};}
  };

  setTimeout(()=>{wire();boot();},300);
  setInterval(()=>{
    wrapSave();
    const s=state();
    const fp=fingerprint(s);
    if(ready && fp && fp!==lastFingerprint){
      lastFingerprint=fp;
      queueCloudSave('weekly-state-change',slotForState(s));
    }
  },1200);
})();