/* BOLS2 Save System V5 — one authoritative career timeline.
   Local recovery is never allowed to move a career backward. Supabase is the cloud
   backup, but network/auth failures can never block gameplay progression.
*/
(()=>{'use strict';
const AUTO='BOLS2_AUTOSAVE_V2',LEGACY='bol2_saves_v1',SLOTS=5;
let writing=false,loading=false;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch{return null}};
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const tick=s=>((Math.max(1,num(s?.year)||1)-1)*52)+Math.max(1,Math.min(52,num(s?.week)||1));
const name=s=>String(s?.studioName||s?.studio?.name||s?.name||'').trim();
const key=s=>String(s?.studio?.id||s?.studioId||s?.studio?.name||s?.studioName||s?.name||'default');
const state=()=>window.__BOL_STATE__||window.state||null;
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
function candidates(){
 const out=[]; const a=read(AUTO);
 if(a?.state)out.push({state:a.state,slot:num(a.state.saveSlot)||num(a.state.slot)||1,source:'autosave',savedAt:num(a.savedAt)});
 const l=read(LEGACY);
 if(Array.isArray(l))l.forEach((x,i)=>{const s=x?.state||x;if(s)out.push({state:s,slot:i+1,source:'local',savedAt:Date.parse(x?.updatedAt||s?.updatedAt||0)||0})});
 else if(l?.slots){Object.values(l.slots).forEach((x,i)=>{const s=x?.state||x;if(s)out.push({state:s,slot:i+1,source:'local',savedAt:Date.parse(x?.updatedAt||s?.updatedAt||0)||0})})}
 else if(l?.state)out.push({state:l.state,slot:num(l.state.saveSlot)||1,source:'local',savedAt:Date.parse(l.updatedAt||0)||0});
 return out.filter(x=>x.state).map(x=>({...x,state:clone(x.state)}));
}
function bestForStudio(studio){const cs=candidates().filter(x=>!studio||!name(x.state)||name(x.state)===studio||key(x.state)===studio);return cs.sort((a,b)=>tick(b.state)-tick(a.state)||b.savedAt-a.savedAt)[0]||null;}
function slotFor(s){const explicit=num(s?.saveSlot||s?.slot);if(explicit>=1&&explicit<=SLOTS)return explicit;const same=read(LEGACY);if(Array.isArray(same)){const i=same.findIndex(x=>name(x?.state||x)===name(s));if(i>=0)return i+1;}return 1;}
function localCommit(s,reason='weekly-autosave'){
 if(!s||writing)return false; const c=clone(s);if(!c)return false;c.saveSlot=slotFor(c);c.updatedAt=new Date().toISOString();
 const current=bestForStudio(name(c));if(current&&tick(c)<tick(current.state))return false;
 const arr=Array.isArray(read(LEGACY))?read(LEGACY):[];arr[c.saveSlot-1]=c;write(LEGACY,arr.slice(0,SLOTS));
 write(AUTO,{version:2,savedAt:Date.now(),reason,week:c.week,year:c.year,studioKey:key(c),state:c});
 return true;
}
async function cloudSave(s,reason='weekly-autosave'){
 try{if(window.BOLS2Cloud?.saveSlot){const slot=Math.max(1,Math.min(SLOTS,slotFor(s)));return await Promise.race([window.BOLS2Cloud.saveSlot(slot,reason),new Promise(r=>setTimeout(()=>r({ok:false,skipped:true,reason:'timeout'}),2500))])}}catch(e){console.warn('[BOLS2 Save V5] cloud save failed',e)}
 return {ok:false,skipped:true};
}
async function save(reason='manual-save',s=state()){
 if(!s)return false;localCommit(s,reason);cloudSave(s,reason);return true;
}
async function recover(){
 if(loading)return false;loading=true;
 try{
  const cur=state(),studio=name(cur);const best=bestForStudio(studio);
  if(best&&cur&&tick(best.state)>tick(cur)){
   const next=clone(best.state);next.saveSlot=best.slot;window.state=next;window.__BOL_STATE__=next;window.__BOL_CURRENT_STATE__=next;
   if(typeof window.start==='function')await Promise.resolve(window.start(next));
   console.info('[BOLS2 Save V5] recovered local timeline',best.source,tick(next));
   return true;
  }
  if(cur)localCommit(cur,'boot-check');
 }finally{loading=false}
 return false;
}
function openLoad(){
 if(document.querySelector('.bolsV5Modal'))return;
 const e=document.createElement('div');e.className='modal bolsV5Modal';
 e.innerHTML='<div class="panel"><div class="panelHead"><button class="close" id="v5Close">×</button><div class="eyebrow">CAREER ARCHIVE · V5</div><h2>Load Studio</h2><p>Your highest verified week is always preferred. A save can never roll your career backward.</p></div><div id="v5Status">Reading local recovery…</div><div id="v5Slots"></div></div>';
 document.body.appendChild(e);e.querySelector('#v5Close').onclick=()=>e.remove();
 const render=()=>{const cur=state(),studio=name(cur),all=candidates().filter(x=>!studio||!name(x.state)||name(x.state)===studio);const slots=Array.from({length:SLOTS},(_,i)=>{const xs=all.filter(x=>x.slot===i+1).sort((a,b)=>tick(b.state)-tick(a.state));return xs[0]||null});e.querySelector('#v5Status').textContent='LOCAL RECOVERY READY · Newest week wins';e.querySelector('#v5Slots').innerHTML=slots.map((x,i)=>x?`<article class="bolsSaveSlot" style="margin:10px 0"><div><small>${x.source.toUpperCase()} · SLOT ${i+1}</small><h3>${name(x.state)||'Unnamed Studio'}</h3><p>Year ${num(x.state.year)||1} · Week ${num(x.state.week)||1} · $${num(x.state.money).toLocaleString()}</p></div><button class="mini gold" data-v5-load="${i+1}">LOAD</button></article>`:`<article class="bolsSaveSlot empty" style="margin:10px 0"><div><small>SLOT ${i+1}</small><h3>Empty</h3></div></article>`).join('');e.querySelectorAll('[data-v5-load]').forEach(b=>b.onclick=()=>{const x=slots[num(b.dataset.v5Load)-1];if(!x)return;const next=clone(x.state);next.saveSlot=x.slot;window.state=next;window.__BOL_STATE__=next;window.__BOL_CURRENT_STATE__=next;e.remove();window.start?.(next);save('load-sync',next)})};render();
}
function wire(){
 document.addEventListener('click',ev=>{const el=ev.target?.closest?.('button,a,[role="button"]');if(!el)return;const label=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
  if(label.includes('load studio')||label.includes('load your save')||label==='load save'){ev.preventDefault();ev.stopImmediatePropagation();openLoad();return}
  if(label.includes('save game')||label.includes('save your studio')){ev.preventDefault();ev.stopImmediatePropagation();save('manual-save');try{window.toast?.('✓ Studio saved.')}catch{}return}
  if(label.includes('main menu')||label.includes('return safely')){save('main-menu-exit');}
 },true);
 setInterval(()=>{const s=state();if(!s)return;const best=bestForStudio(name(s));if(best&&tick(best.state)>tick(s)){console.warn('[BOLS2 Save V5] newer local timeline detected; recovering');recover()}},1000);
}
window.BOLS2SaveV5={save,recover,openLoad,localCommit,candidates,bestForStudio};
setTimeout(async()=>{wire();await recover();try{await window.BOLS2Cloud?.init?.()}catch{}await recover()},500);
})();