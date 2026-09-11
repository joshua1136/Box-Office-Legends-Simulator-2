/* BOLS2 Career Load v6 — single unified Load Studio / Continue Your Save surface. */
(function(){
 'use strict';
 const AUTO='BOLS2_AUTOSAVE_V2',LEGACY='bol2_saves_v1',SLOTS=5;
 const tick=s=>((+s?.year||1)-1)*52+(+s?.week||1);
 const clone=s=>{try{return JSON.parse(JSON.stringify(s))}catch{return null}};
 const studioName=s=>String((s?.studio&&s.studio.name)||s?.studioName||s?.name||'Unnamed Studio');
 const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
 function all(){
  const out=[]; const a=read(AUTO); if(a?.state)out.push({state:a.state,source:'AUTOSAVE',slot:+a.state.saveSlot||+a.state.slot||1,savedAt:a.savedAt||''});
  const l=read(LEGACY); if(Array.isArray(l))l.forEach((s,i)=>s&&out.push({state:s,source:'LOCAL SLOT '+(i+1),slot:i+1,savedAt:s.updatedAt||''}));
  return out.filter(x=>x.state&&typeof x.state==='object');
 }
 async function withCloud(items){
  try{await window.BOLS2Cloud?.init?.();const r=await window.BOLS2Cloud?.list?.();const rows=Array.isArray(r)?r:(r?.data||r?.rows||[]);rows.filter(x=>x?.game_state).forEach(x=>items.push({state:x.game_state,source:'SUPABASE CLOUD',slot:+x.slot||+x.game_state.saveSlot||+x.game_state.slot||1,savedAt:x.updated_at||x.created_at||''}));}catch(e){console.warn('[BOLS2 Load v6] cloud unavailable',e)}
  return items;
 }
 function pick(){
  const map=new Map();all().forEach(c=>{const key=c.slot||1;if(!map.has(key)||tick(c.state)>tick(map.get(key).state))map.set(key,c)});return [...map.values()].sort((a,b)=>tick(b.state)-tick(a.state));
 }
 function apply(c){
  const s=clone(c.state);if(!s)return false;s.saveSlot=c.slot||1;
  const live=window.__BOL_STATE__||window.state;
  if(live&&typeof live==='object'){Object.keys(live).forEach(k=>{try{delete live[k]}catch{}});Object.assign(live,s);window.state=live;window.__BOL_STATE__=live;window.__BOL_CURRENT_STATE__=live;window.start?.(live)}else{window.state=s;window.__BOL_STATE__=s;window.start?.(s)}
  try{localStorage.setItem(AUTO,JSON.stringify({version:6,reason:'explicit-load',savedAt:new Date().toISOString(),state:clone(s)}))}catch{}
  return true;
 }
 async function render(){
  document.querySelector('#bols2-career-load-v6')?.remove();
  const wrap=document.createElement('div');wrap.id='bols2-career-load-v6';wrap.innerHTML=`<div class="bcl6-backdrop"><section class="bcl6-sheet"><div class="bcl6-head"><div><div class="bcl6-kicker">CAREER ARCHIVE</div><h2>Load Your Saves</h2><p>Checking this device and Supabase Cloud for your newest career.</p></div><button data-bcl-close>×</button></div><div class="bcl6-list"><div class="bcl6-empty">☁️ Checking saved careers…</div></div></section></div>`;
  document.body.appendChild(wrap);
  const list=wrap.querySelector('.bcl6-list'); let items=await withCloud(all());
  const map=new Map();items.forEach(c=>{const k=c.slot||1;if(!map.has(k)||tick(c.state)>tick(map.get(k).state)||(tick(c.state)===tick(map.get(k).state)&&String(c.savedAt)>String(map.get(k).savedAt)))map.set(k,c)});items=[...map.values()].sort((a,b)=>tick(b.state)-tick(a.state));
  if(!items.length){list.innerHTML='<div class="bcl6-empty">No saved career found on this device or in Supabase Cloud.</div>'}else items.forEach(c=>{const s=c.state;const row=document.createElement('div');row.className='bcl6-row';row.innerHTML=`<div><div class="bcl6-slot">SLOT ${c.slot}</div><strong>${studioName(s)}</strong><div class="bcl6-meta">Year ${+s.year||1} · Week ${+s.week||1}</div><div class="bcl6-money">$${Number(s.money||0).toLocaleString()}</div><small>${c.source}</small></div><button data-bcl-load="${c.slot}">LOAD</button>`;list.appendChild(row)});
  wrap.addEventListener('click',e=>{if(e.target.matches('[data-bcl-close]')||e.target.classList.contains('bcl6-backdrop')){wrap.remove();return}const b=e.target.closest('[data-bcl-load]');if(!b)return;const c=items.find(x=>String(x.slot)===String(b.dataset.bclLoad));if(c&&apply(c)){wrap.remove()}});
 }
 window.__BOLS2_OPEN_LOAD_V6__=render;
 window.BOLS2CareerLoadV6={render,pick,apply};
})();