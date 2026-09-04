/* BOLS2 weekly progression hardening v5: one authoritative, idempotent week advance path. */
(()=>{
 if(window.__BOL_WEEKLY_FLOW_V5)return; window.__BOL_WEEKLY_FLOW_V5=true;
 const advanceCore=(state)=>{
   if(!state)return false;
   const prev=Number(state.week||1);
   if(window.__BOL_WEEK_ADVANCING)return false;
   window.__BOL_WEEK_ADVANCING=true;
   try{
     if(prev>=52){state.week=1;state.year=Number(state.year||1)+1}
     else state.week=prev+1;
     try{if(typeof window.energyCapacity==='function')state.energy=window.energyCapacity(state);else state.energy=100}catch{state.energy=100}
     try{if(typeof window.processStudioUpgrades==='function')window.processStudioUpgrades(state)}catch(e){console.warn('upgrade processing skipped',e)}
     try{if(typeof window.saveCurrent==='function')window.saveCurrent(state,true)}catch(e){console.warn('save skipped',e)}
     try{if(typeof window.start==='function')window.start(state);else window.__BOL_RENDER_MENU__?.()}catch(e){console.error('render after week advance failed',e)}
     try{window.__weeklyEventActive=false;window.__eventV3Resolved=true}catch{}
     return true;
   }finally{setTimeout(()=>{window.__BOL_WEEK_ADVANCING=false},250)}
 };
 window.__BOL_ADVANCE_WEEK__=advanceCore;
 window.completeWeeklyEvent=()=>advanceCore(window.__BOL_STATE__||window.__BOL_CURRENT_STATE__||window.__BOL_WEEKLY_STATE__);
 const bind=()=>{
   const m=document.querySelector('.weeklyModal'); if(!m||m.dataset.v5)return;
   m.dataset.v5='1';
   const b=m.querySelector('#continueWeek'); if(!b)return;
   b.disabled=false; b.removeAttribute('disabled');
   b.onclick=(ev)=>{ev?.preventDefault?.();ev?.stopImmediatePropagation?.();
     const s=window.__BOL_STATE__||window.__BOL_CURRENT_STATE__;
     if(s&&window.__BOL_ADVANCE_WEEK__) {m.remove();window.__BOL_ADVANCE_WEEK__(s);}
   };
 };
 setInterval(bind,150);
})();