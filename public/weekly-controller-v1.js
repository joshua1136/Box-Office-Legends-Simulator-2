/* BOLS2 Weekly Controller v1
   One UI orchestration layer: core report owns simulation + state mutation; this controller only sequences Report -> optional Event -> core Continue.
*/
(()=>{
  if(window.__BOL_WEEKLY_CONTROLLER_V1)return;
  window.__BOL_WEEKLY_CONTROLLER_V1=true;
  let boundModal=null;
  const waitForReport=(state,attempt=0)=>{
    const modal=document.querySelector('.weeklyModal');
    if(!modal){if(attempt<20)setTimeout(()=>waitForReport(state,attempt+1),50);return;}
    if(modal===boundModal||modal.dataset.weeklyController==='v1')return;
    const btn=modal.querySelector('#continueWeek');
    if(!btn)return;
    const coreContinue=btn.onclick;
    if(typeof coreContinue!=='function')return;
    boundModal=modal;
    modal.dataset.weeklyController='v1';
    modal.dataset.coreWeek=String(Number(state?.week||1));
    window.__BOL_WEEKLY_CORE_CONTINUE__=()=>{
      if(window.__BOL_WEEKLY_CORE_RUNNING)return;
      window.__BOL_WEEKLY_CORE_RUNNING=true;
      try{
        /* Call the authoritative handler directly. Do not synthesize a DOM click: Android WebViews can behave differently around synthetic MouseEvents. */
        coreContinue.call(btn);
      }catch(err){
        console.error('Weekly core continuation failed',err);
        window.__BOL_WEEKLY_CORE_RUNNING=false;
        try{modal.remove()}catch{}
        try{window.start?.(state)}catch{}
        return;
      }
      /* The core handler is synchronous; verify that it actually moved the game forward. */
      setTimeout(()=>{
        const live=window.__BOL_STATE__||state;
        const before=Number(state?.week||1), now=Number(live?.week||1);
        const expected=before>=52?1:before+1;
        if(now===expected || Number(live?.year||1)>Number(state?.year||1)){
          window.__BOL_WEEKLY_CORE_RUNNING=false;
          return;
        }
        console.error('Weekly progression did not advance after the authoritative Continue handler.',{before,now,expected});
        window.__BOL_WEEKLY_CORE_RUNNING=false;
        /* Recovery re-enters the same core handler once, never a second weekly controller. */
        try{coreContinue.call(btn);}catch(retryErr){console.error('Weekly progression recovery failed',retryErr);try{window.start?.(state)}catch{}}
      },80);
    };
    const openEvent=()=>{
      if(btn.dataset.busy==='1')return;
      btn.dataset.busy='1';
      btn.textContent='OPENING EVENTS…';
      modal.classList.add('flowReportExit');
      setTimeout(()=>{
        if(document.body.contains(modal))modal.remove();
        const run=window.startWeeklyEventV3||window.runEventsV3;
        if(typeof run==='function'){
          window.__weeklyEventActive=true;
          window.completeWeeklyEvent=()=>{
            window.__weeklyEventActive=false;
            window.__eventV3Resolved=true;
            window.__BOL_WEEKLY_CORE_CONTINUE__?.();
          };
          try{run();}catch(err){console.error('Weekly event presentation failed',err);window.completeWeeklyEvent?.();}
        }else{
          window.__BOL_WEEKLY_CORE_CONTINUE__?.();
        }
      },260);
    };
    btn.onclick=(ev)=>{
      ev?.preventDefault?.();
      ev?.stopImmediatePropagation?.();
      if(btn.disabled)return;
      openEvent();
    };
    window.__BOL_WEEKLY_CONTROLLER_BOUND=true;
  };
  const scan=()=>{
    const s=window.__BOL_STATE__||window.__BOL_CURRENT_STATE__;
    if(s)waitForReport(s);
  };
  const originalReport=window.showWeeklyReport;
  if(typeof originalReport==='function'&&!originalReport.__weeklyControllerV1){
    const wrapped=function(state){
      window.__BOL_STATE__=state;
      window.__BOL_CURRENT_STATE__=state;
      const result=originalReport(state);
      setTimeout(()=>waitForReport(state),80);
      return result;
    };
    wrapped.__weeklyControllerV1=true;
    wrapped.__weeklyControllerOriginal=originalReport;
    window.showWeeklyReport=wrapped;
  }
  scan();
  setTimeout(scan,250);
  setTimeout(scan,800);
  setTimeout(scan,1600);
})();