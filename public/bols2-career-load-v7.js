/* BOLS2 Career Archive v7 — unified local save/load UI. IndexedDB first, legacy mirror fallback. */
(()=>{
 'use strict';
 const SLOTS=5;
 const tick=s=>((+s?.year||1)-1)*52+(+s?.week||1);
 const name=s=>String((s?.studio&&s.studio.name)||s?.studioName||s?.name||'Unnamed Studio');
 const clone=s=>{try{return structuredClone(s)}catch{try{return JSON.parse(JSON.stringify(s))}catch{return null}}};
 const legacy=()=>{try{const a=JSON.parse(localStorage.getItem('bol2_saves_v1')||'[]');return Array.isArray(a)?a.slice(0,SLOTS):[]}catch{return[]}};
 async function records(){
   if(window.BOLS2IndexedSave?.slots){try{return await window.BOLS2IndexedSave.slots()}catch{}}
   return legacy().map((s,i)=>s?{slot:i+1,state:s,studioName:name(s),year:+s.year||1,week:+s.week||1,updatedAt:s.updatedAt||'',source:'LOCAL MIRROR'}:null).filter(Boolean);
 }
 async function applyState(s,slot){
   const c=clone(s);if(!c)return false;c.saveSlot=slot;c.slot=slot;
   const live=window.__BOL_STATE__||window.state;
   if(live&&typeof live==='object'){Object.keys(live).forEach(k=>{try{delete live[k]}catch{}});Object.assign(live,c);window.state=live;window.__BOL_STATE__=live;window.__BOL_CURRENT_STATE__=live;try{window.start?.(live)}catch(e){console.error('[BOLS2] load start failed',e)}}else{window.state=c;window.__BOL_STATE__=c;window.__BOL_CURRENT_STATE__=c;try{window.start?.(c)}catch(e){console.error('[BOLS2] load start failed',e)}}
   if(window.BOLS2IndexedSave?.save){try{await window.BOLS2IndexedSave.save(c,{slot,reason:'explicit-load',autosave:true})}catch{}}
   return true;
 }
 async function render(){
   document.querySelector('#bols2-career-load-v7')?.remove();
   const wrap=document.createElement('div');wrap.id='bols2-career-load-v7';
   wrap.innerHTML='<div class="bcl6-backdrop"><section class="bcl6-sheet"><div class="bcl6-head"><div><div class="bcl6-kicker">CAREER ARCHIVE · LOCAL DEVICE</div><h2>Load Your Saves</h2><p>Your careers are stored on this device. The newest valid checkpoint is shown.</p></div><button data-bcl-close aria-label="Close">×</button></div><div class="bcl6-list"><div class="bcl6-loading">READING CAREER ARCHIVE…</div></div></section></div>';
   document.body.appendChild(wrap);
   const list=wrap.querySelector('.bcl6-list');
   let items=await records();
   const bySlot=new Map();items.forEach(c=>{const n=Number(c.slot)||1;const old=bySlot.get(n);if(!old||tick(c.state)>tick(old.state)||(tick(c.state)===tick(old.state)&&String(c.updatedAt||'')>String(old.updatedAt||'')))bySlot.set(n,c)});
   list.innerHTML='';
   for(let slot=1;slot<=SLOTS;slot++){
     const c=bySlot.get(slot),row=document.createElement('div');row.className='bcl6-row'+(c?'':' empty');
     if(c){const s=c.state;const money=Number(s.money??s.cash??0).toLocaleString();row.innerHTML=`<div><div class="bcl6-slot">SLOT ${slot}</div><strong>${name(s)}</strong><div class="bcl6-meta">Year ${+s.year||1} · Week ${+s.week||1}</div><div class="bcl6-money">$${money}</div><small>${c.source||'LOCAL DEVICE'} · ${c.updatedAt?new Date(c.updatedAt).toLocaleString():''}</small></div><button data-bcl-load="${slot}">LOAD</button>`}
     else row.innerHTML=`<div><div class="bcl6-slot">SLOT ${slot}</div><strong>EMPTY</strong><div class="bcl6-meta">Available for a new studio career.</div></div><span class="bcl6-emptyAction">NEW CAREER →</span>`;
     list.appendChild(row);
   }
   wrap.addEventListener('click',async e=>{
     if(e.target.matches('[data-bcl-close]')||e.target.classList.contains('bcl6-backdrop')){wrap.remove();return}
     const b=e.target.closest('[data-bcl-load]');if(!b)return;const slot=Number(b.dataset.bclLoad),c=bySlot.get(slot);if(!c)return;
     b.disabled=true;b.textContent='LOADING…';
     try{if(await applyState(c.state,slot)){wrap.remove();window.toast?.(`Loaded ${name(c.state)} · Year ${c.state.year||1} · Week ${c.state.week||1}.`)}}catch(err){console.error(err);b.disabled=false;b.textContent='LOAD';window.toast?.('Could not load this career.');}
   });
 }
 window.__BOLS2_OPEN_LOAD_V7__=render;window.__BOLS2_OPEN_LOAD_V6__=render;window.BOLS2CareerLoadV7={render,records,applyState,tick};
})();