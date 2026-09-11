/* BOLS2 Weekly Controller v3 — hard click path
   The Weekly Report's Continue button is a terminal UI action. This controller
   invokes the report's own authoritative handler in capture phase, preventing
   legacy listeners from swallowing the tap. A watchdog recovers only if the
   handler throws or fails to change the week.
*/
(()=>{
  if(window.__BOLS_WEEKLY_CONTROLLER_V3)return;
  window.__BOLS_WEEKLY_CONTROLLER_V3=true;
  const fallback=(state,prev,modal)=>{
    if(Number(state?.week||0)!==Number(prev||0)){
      modal?.remove();
      try{window.start?.(state)}catch(e){console.error('Weekly UI recovery failed',e)}
      return;
    }
    const netText=modal?.querySelector('.reportGrid div:nth-child(4) b');
    const raw=(netText?.textContent||'').replace(/[^\d.-]/g,'');
    const sign=(netText?.textContent||'').includes('−')?-1:1;
    const net=raw?sign*Number(raw):0;
    const w=Number(state.week||1),y=Number(state.year||1),next=w>=52?1:w+1;
    state.week=next;if(w>=52)state.year=y+1;
    try{if(typeof energyCapacity==='function')state.energy=energyCapacity(state)}catch{}
    try{if(typeof processStudioUpgrades==='function')processStudioUpgrades(state)}catch(e){console.warn('Upgrade processing skipped during recovery',e)}
    if(!state.developer&&!String(state.studioName||'').toLowerCase().startsWith('joshuax'))state.money=Math.max(0,Number(state.money||0)+net);
    try{window.saveCurrent?.(state,true)}catch(e){console.warn('Recovery save skipped',e)}
    modal?.remove();
    try{window.start?.(state)}catch(e){console.error('Weekly recovery start failed',e)}
  };
  const bind=btn=>{
    if(!btn||btn.dataset.weeklyHardBound==='1')return;
    btn.dataset.weeklyHardBound='1';
    document.addEventListener('click',ev=>{
      const target=ev.target?.closest?.('#continueWeek');
      if(target!==btn)return;
      const modal=btn.closest('.weeklyModal');
      const state=window.__BOL_STATE__||window.__BOL_CURRENT_STATE__;
      if(!modal||!state)return;
      const prev=Number(state.week||1);
      const handler=btn.onclick;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if(typeof handler==='function'){
        try{handler.call(btn,ev)}catch(err){
          console.error('Weekly Continue handler failed; recovering',err);
          fallback(state,prev,modal);
          return;
        }
        setTimeout(()=>{
          if(!document.body.contains(modal))return;
          if(Number(state.week||0)!==prev){modal.remove();try{window.start?.(state)}catch(e){console.error(e)}return;}
          fallback(state,prev,modal);
        },700);
      }else fallback(state,prev,modal);
    },true);
  };
  const scan=()=>bind(document.querySelector('#continueWeek'));
  new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
  scan();
})();