/* BOLS2 Supabase Cloud Save v2
   Explicit-state cloud writes. Anonymous Auth session is persisted by Supabase.
*/
(function(){
 'use strict';
 const URL='https://zgzoubtueebbznzsspeg.supabase.co',KEY='sb_publishable_zQrTHbtHrIEf-CJpUmuiOw_KAL_20r5',SLOTS=5;
 let sb=null,userPromise=null,saveChain=Promise.resolve();
 const tick=s=>((+s?.year||1)-1)*52+(+s?.week||1);
 const clone=s=>{try{return JSON.parse(JSON.stringify(s))}catch{return null}};
 const client=()=>sb||(sb=window.supabase?.createClient?.(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}));
 async function user(){if(userPromise)return userPromise;userPromise=(async()=>{const c=client();if(!c)throw Error('Supabase JS missing');const g=await c.auth.getSession();if(g.data?.session?.user)return g.data.session.user;const a=await c.auth.signInAnonymously();if(a.error)throw a.error;return a.data?.user||a.data?.session?.user||null})().finally(()=>userPromise=null);return userPromise}
 async function list(){const u=await user(),c=client();if(!u||!c)return {data:[],error:Error('No Supabase user')};return c.from('bols2_saves').select('*').eq('user_id',u.id).order('slot',{ascending:true});}
 async function saveState(state,reason='weekly-autosave',slot=1){
  const payload=clone(state);if(!payload)return {ok:false,error:'serialize'};const target=Math.max(1,Math.min(SLOTS,Number(slot)||1));
  saveChain=saveChain.catch(()=>{}).then(async()=>{const u=await user(),c=client();if(!u||!c)throw Error('Supabase unavailable');const q=await c.from('bols2_saves').select('*').eq('user_id',u.id).eq('slot',target).maybeSingle();if(q.error)throw q.error;const old=q.data;const oldTick=old?tick(old.game_state):-1;const newTick=tick(payload);if(old&&newTick<oldTick)return {ok:false,skipped:true,reason:'cloud-newer'};const rev=Math.max(Number(payload.__bols2CloudRevision)||0,Number(old?.game_revision)||0,Date.now())+1;payload.__bols2CloudRevision=rev;const row={user_id:u.id,player_key:String((payload.studio&&payload.studio.id)||payload.studioName||payload.name||'default'),studio_name:String((payload.studio&&payload.studio.name)||payload.studioName||payload.name||'Unnamed Studio'),slot:target,game_state:payload,game_week:Number(payload.week)||1,game_year:Number(payload.year)||1,game_revision:rev,game_version:'2.0',schema_version:2,is_autosave:reason!=='manual-save',updated_at:new Date().toISOString()};const saved=old?await c.from('bols2_saves').update(row).eq('id',old.id).select('*').single():await c.from('bols2_saves').insert(row).select('*').single();if(saved.error)throw saved.error;await c.from('bols2_save_snapshots').insert({user_id:u.id,save_id:saved.data.id,player_key:row.player_key,studio_name:row.studio_name,game_state:payload,game_week:row.game_week,game_year:row.game_year,game_revision:rev});return {ok:true,data:saved.data};});return saveChain;
 }
 async function loadNewest(){const r=await list();if(r.error)return null;const rows=(r.data||[]).filter(x=>x?.game_state).sort((a,b)=>tick(b.game_state)-tick(a.game_state)||Number(b.game_revision||0)-Number(a.game_revision||0));return rows[0]||null}
 window.BOLS2Cloud={saveState,save:(reason,slot)=>saveState(window.__BOL_STATE__||window.state,reason,slot),saveSlot:(slot,reason)=>saveState(window.__BOL_STATE__||window.state,reason,slot),list,loadNewest,auth:user,init:async()=>{await user();return true}};
})();