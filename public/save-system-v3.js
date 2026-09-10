/* BOLS2 Save System v3
   Single source of truth for local save slots + cloud-aware Load Studio.
   Fixes the Week 13 rollback by never trusting the legacy slot when a newer
   weekly autosave exists. Five slots represent five separate studio careers.
*/
(function(){
  'use strict';
  const LOCAL_KEY='bol2_saves_v1';
  const AUTO_KEY='BOLS2_AUTOSAVE_V2';
  const SLOT_COUNT=5;
  let loadBusy=false;

  const clone=x=>{try{return JSON.parse(JSON.stringify(x));}catch{return null;}};
  const tick=s=>((Number(s?.year||1)-1)*52)+Number(s?.week||1);
  const studioKey=s=>{const st=s?.studio||s?.currentStudio||{};return String(st.id||st.studioId||st.name||s?.studioName||s?.name||'default');};
  const studioName=s=>String(s?.studioName||s?.studio?.name||s?.name||'Unnamed Studio');
  const readLocal=()=>{try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||'[]')}catch{return[]}};
  const writeLocal=x=>{try{localStorage.setItem(LOCAL_KEY,JSON.stringify(x));return true}catch{return false}};
  const readAuto=()=>{try{const x=JSON.parse(localStorage.getItem(AUTO_KEY)||'null');return x?.state?x:null}catch{return null}};
  const toast=msg=>{try{if(typeof window.toast==='function')return window.toast(msg)}catch{};console.info('[BOLS2 Save v3]',msg)};

  function slotForState(s,arr=readLocal()){
    const explicit=Number(s?.saveSlot||s?.slot);
    if(explicit>=1&&explicit<=SLOT_COUNT)return explicit;
    const found=arr.findIndex(x=>x&&studioKey(x)===studioKey(s));
    if(found>=0)return found+1;
    const empty=arr.findIndex(x=>!x);
    return empty>=0?empty+1:1;
  }

  function migrateAutosave(){
    const auto=readAuto();
    if(!auto?.state)return;
    const arr=readLocal();
    const s=auto.state;
    const slot=slotForState(s,arr);
    s.saveSlot=slot;
    const current=arr[slot-1];
    if(!current || tick(s)>tick(current) || (tick(s)===tick(current)&&new Date(auto.savedAt||0)>new Date(current.updatedAt||0))){
      arr[slot-1]=s;
      writeLocal(arr.slice(0,SLOT_COUNT));
    }
  }

  function normalizeCandidate(state,source,slot,meta={}){
    if(!state)return null;
    const s=clone(state); if(!s)return null;
    s.saveSlot=slot;
    return {state:s,source,slot,tick:tick(s),revision:Number(meta.revision||s.__bols2CloudRevision||0),updatedAt:Number(meta.updatedAt||Date.parse(s.updatedAt||0)||0),cloud:meta.cloud||null};
  }

  async function collect(){
    migrateAutosave();
    const local=readLocal();
    const auto=readAuto();
    const bySlot=Array.from({length:SLOT_COUNT},(_,i)=>{
      const s=local[i];
      return s?normalizeCandidate(s,'local',i+1,{revision:s.__bols2CloudRevision}):null;
    });
    if(auto?.state){
      const slot=slotForState(auto.state,local);
      const c=normalizeCandidate(auto.state,'autosave',slot,{revision:auto.state.__bols2CloudRevision,updatedAt:auto.savedAt});
      if(c && (!bySlot[slot-1] || c.tick>bySlot[slot-1].tick || (c.tick===bySlot[slot-1].tick&&c.revision>=bySlot[slot-1].revision)))bySlot[slot-1]=c;
    }
    let cloudStatus='offline';
    try{
      if(window.BOLS2Cloud?.init)await window.BOLS2Cloud.init();
      if(window.BOLS2Cloud?.status?.ready && window.BOLS2Cloud.list){
        const result=await window.BOLS2Cloud.list();
        if(!result.error){
          cloudStatus='online';
          (result.data||[]).forEach(row=>{
            const slot=Math.max(1,Math.min(SLOT_COUNT,Number(row.slot)||1));
            const c=normalizeCandidate(row.game_state,'cloud',slot,{revision:row.game_revision,updatedAt:Date.parse(row.updated_at||row.created_at||0),cloud:row});
            if(c && (!bySlot[slot-1] || c.tick>bySlot[slot-1].tick || (c.tick===bySlot[slot-1].tick&&c.revision>bySlot[slot-1].revision)))bySlot[slot-1]=c;
          });
        }
      }
    }catch(err){console.warn('[BOLS2 Save v3] cloud list failed',err)}
    return {slots:bySlot,cloudStatus};
  }

  function applyState(candidate){
    const next=clone(candidate?.state); if(!next)return false;
    next.saveSlot=candidate.slot;
    window.state=next; window.__BOL_STATE__=next;
    try{
      const arr=readLocal(); arr[candidate.slot-1]=next; writeLocal(arr.slice(0,SLOT_COUNT));
      if(candidate.source==='autosave')localStorage.setItem(AUTO_KEY,JSON.stringify({version:2,savedAt:Date.now(),reason:'load',week:next.week,year:next.year,studioKey:studioKey(next),state:next}));
    }catch{}
    try{window.BOLS2Save?.save('load-sync')}catch{}
    if(typeof window.start==='function')window.start(next);
    return true;
  }

  function openLoadModal(){
    if(loadBusy)return;
    loadBusy=true;
    const e=document.createElement('div'); e.className='modal bolsSaveManagerModal';
    e.innerHTML=`<div class="panel bolsSaveManagerPanel"><div class="panelHead"><button class="close" id="bolsSaveClose">×</button><div class="eyebrow">CLOUD + LOCAL CAREER ARCHIVE</div><h2>Load Studio</h2><p>Five slots = five studio careers. Weekly snapshots protect your current career from rollbacks.</p></div><div class="bolsSaveStatus" id="bolsSaveStatus">Checking your saves…</div><div class="bolsSaveSlots" id="bolsSaveSlots"></div><div class="bolsSaveFooter"><span>☁️ Cloud when available · 📱 Local recovery always active</span><button class="menuBtn" id="bolsRefreshSaves">REFRESH</button></div></div>`;
    document.body.appendChild(e);
    const close=()=>{e.remove();loadBusy=false};
    e.querySelector('#bolsSaveClose').onclick=close;
    e.addEventListener('click',ev=>{if(ev.target===e)close()});
    const status=e.querySelector('#bolsSaveStatus'), list=e.querySelector('#bolsSaveSlots');

    const render=async()=>{
      status.textContent='Checking local autosaves and cloud careers…';
      const data=await collect();
      status.innerHTML=data.cloudStatus==='online'?'<b>☁️ CLOUD SYNC ONLINE</b> · Latest version is selected automatically.':'<b>📱 LOCAL RECOVERY ACTIVE</b> · Cloud sync will appear after Supabase Anonymous Sign-In is enabled.';
      list.innerHTML=data.slots.map((c,i)=>{
        if(!c)return `<article class="bolsSaveSlot empty"><div class="bolsSaveSlotNo">0${i+1}</div><div class="bolsSaveSlotInfo"><small>SAVE SLOT</small><h3>Slot ${i+1}</h3><p>Empty · Create another studio career.</p></div><span class="bolsSaveEmpty">EMPTY</span></article>`;
        const s=c.state, source=c.source==='cloud'?'☁️ CLOUD':c.source==='autosave'?'⚡ AUTOSAVE':'📱 LOCAL';
        return `<article class="bolsSaveSlot ${c.source==='cloud'?'cloud':''}" data-slot="${i+1}"><div class="bolsSaveSlotNo">0${i+1}</div><div class="bolsSaveSlotInfo"><small>${source} · SLOT ${i+1}</small><h3>${escapeHtml(studioName(s))}</h3><p>Year ${Number(s.year||1)} · Week ${Number(s.week||1)} · $${Number(s.money||0).toLocaleString()}</p><span>Last known revision ${Number(c.revision||0).toLocaleString()}</span></div><div class="bolsSaveSlotActions"><button class="mini gold" data-load-slot="${i+1}">LOAD</button><button class="mini" data-delete-slot="${i+1}">DELETE</button></div></article>`;
      }).join('');
      list.querySelectorAll('[data-load-slot]').forEach(btn=>btn.onclick=()=>{
        const candidate=data.slots[Number(btn.dataset.loadSlot)-1];
        if(!candidate)return;
        close();
        applyState(candidate);
        toast(`🎬 ${studioName(candidate.state)} loaded · Year ${candidate.state.year} · Week ${candidate.state.week}`);
      });
      list.querySelectorAll('[data-delete-slot]').forEach(btn=>btn.onclick=async()=>{
        const slot=Number(btn.dataset.deleteSlot),candidate=data.slots[slot-1];
        if(!candidate)return;
        if(!confirm(`Delete Slot ${slot} · ${studioName(candidate.state)}?\n\nThis removes the local career. Cloud copy will also be removed when cloud sync is available.`))return;
        const arr=readLocal();arr[slot-1]=null;writeLocal(arr);
        const auto=readAuto();if(auto?.state&&slotForState(auto.state,arr)===slot){try{localStorage.removeItem(AUTO_KEY)}catch{}}
        try{await window.BOLS2Cloud?.deleteSlot?.(slot)}catch(err){console.warn('[BOLS2 Save v3] cloud delete failed',err)}
        await render();
      });
    };
    e.querySelector('#bolsRefreshSaves').onclick=render;
    render();
  }

  function escapeHtml(v){return String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

  function wire(){
    migrateAutosave();
    document.addEventListener('click',ev=>{
      const b=ev.target?.closest?.('#load');
      if(!b)return;
      ev.preventDefault();ev.stopImmediatePropagation();openLoadModal();
    },true);
    document.addEventListener('click',ev=>{
      const b=ev.target?.closest?.('[data-load-studio]');
      if(!b)return;
      ev.preventDefault();ev.stopImmediatePropagation();openLoadModal();
    },true);
    // Stamp every career with a persistent slot before the legacy save function writes it.
    const wrap=()=>{
      if(typeof window.saveCurrent!=='function'||window.saveCurrent.__bolsV3Wrapped)return;
      const original=window.saveCurrent;
      const wrapped=function(s,...args){
        const state=s||window.__BOL_STATE__||window.state;
        if(state){const arr=readLocal();state.saveSlot=slotForState(state,arr);}
        return original.call(this,s,...args);
      };
      wrapped.__bolsV3Wrapped=true;
      window.saveCurrent=wrapped;
    };
    setTimeout(wrap,0);
    setInterval(()=>{wrap();migrateAutosave();},1000);
  }
  window.BOLS2SaveManager={openLoadModal,collect,slotForState,migrateAutosave};
  setTimeout(wire,150);
})();