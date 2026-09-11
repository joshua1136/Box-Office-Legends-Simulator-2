/* BOLS2 Weekly Engine 2.0
   Canonical weekly lifecycle.
   - Simulation runs on a detached state copy.
   - Weekly Report is presentation only.
   - Only commit() changes the live calendar.
   - Optional subsystem failures never trap progression.
   - One transaction ID prevents duplicate week advances.
*/
(()=>{
  if(window.__BOLS2_WEEKLY_ENGINE_V2__)return;
  window.__BOLS2_WEEKLY_ENGINE_V2__=true;

  const cloneState=(value)=>{
    try{return structuredClone(value)}catch{return JSON.parse(JSON.stringify(value))}
  };
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const parseMoneyText=text=>{
    const raw=String(text||'').replace(/[^0-9.-]/g,'');
    const value=Number(raw||0);
    return String(text||'').includes('−')?-Math.abs(value):value;
  };
  const calendar=(state)=>{
    const y=Math.max(1,Math.floor(num(state?.year)||1));
    const w=Math.max(1,Math.min(52,Math.floor(num(state?.week)||1)));
    return w>=52?{year:y+1,week:1}:{year:y,week:w+1};
  };
  const safe=(label,fn)=>{try{return fn?.()}catch(err){console.warn(`[BOLS2 Weekly] ${label} skipped`,err);return undefined}};
  const liveState=()=>window.__BOL_STATE__||window.__BOL_CURRENT_STATE__||window.state||null;
  let transaction=null;
  let serial=0;
  let busy=false;

  function copyInto(target,source){
    Object.keys(target||{}).forEach(k=>{try{delete target[k]}catch{}});
    Object.assign(target,source);
    return target;
  }

  function restoreGlobals(original){
    window.__BOL_STATE__=original;
    window.__BOL_CURRENT_STATE__=original;
  }

  function simulate(state){
    const source=cloneState(state||{});
    const fromWeek=Math.max(1,Math.min(52,Math.floor(num(source.week)||1)));
    const fromYear=Math.max(1,Math.floor(num(source.year)||1));
    const id=`Y${fromYear}-W${fromWeek}-T${Date.now()}-${++serial}`;
    const previousGlobals={state:window.__BOL_STATE__,current:window.__BOL_CURRENT_STATE__,save:window.saveCurrent};
    const oldModal=document.querySelector('.weeklyModal');
    oldModal?.remove();
    transaction={id,from:{year:fromYear,week:fromWeek},sourceState:state,nextState:null,reportReady:false,status:'simulating'};

    // The legacy simulator is retained as the simulation implementation only.
    // It receives a detached state, so it cannot partially advance the live career.
    const simulator=window.__BOLS2_LEGACY_WEEKLY_SIMULATOR__;
    if(typeof simulator!=='function')throw new Error('Weekly simulation backend is unavailable.');
    window.__BOL_STATE__=source;
    window.__BOL_CURRENT_STATE__=source;
    window.saveCurrent=()=>{};
    try{
      simulator(source);
    }catch(err){
      document.querySelector('.weeklyModal')?.remove();
    document.querySelector('.studioReportModal')?.remove();
      restoreGlobals(previousGlobals.state||state);
      window.__BOL_CURRENT_STATE__=previousGlobals.current||state;
      window.saveCurrent=previousGlobals.save;
      transaction=null;
      throw err;
    }
    window.saveCurrent=previousGlobals.save;
    restoreGlobals(previousGlobals.state||state);
    window.__BOL_CURRENT_STATE__=previousGlobals.current||state;

    const legacyModal=document.querySelector('.weeklyModal');
    if(!legacyModal)throw new Error('Weekly simulation backend completed without producing simulation output.');
    const netNode=legacyModal.querySelector('.reportGrid div:nth-child(4) b');
    const net=parseMoneyText(netNode?.textContent||'0');
    // The legacy renderer is no longer the player-facing report. We only borrow
    // its already-computed weekly result, then throw its UI away completely.
    legacyModal.remove();
    transaction.nextState=source;
    transaction.net=Number.isFinite(net)?net:0;
    transaction.reportReady=true;
    transaction.status='reporting';
    const report=window.BOLS2StudioReport;
    if(!report||typeof report.render!=='function')throw new Error('New Studio Report renderer is unavailable.');
    const modal=report.render(source,fromWeek,transaction.net);
    if(!modal)throw new Error('Studio Report renderer returned no report.');
    transaction.modal=modal;
    bindReport(modal,transaction);
    return transaction;
  }

  function finishCommit(tx){
    const actual=tx.sourceState;
    const next=tx.nextState;
    if(!actual||!next)return false;
    const fromWeek=Number(tx.from.week||1),fromYear=Number(tx.from.year||1);
    const nextCal=calendar({year:fromYear,week:fromWeek});

    // The simulated state contains all results of the completed week.
    copyInto(actual,next);
    actual.week=nextCal.week;
    actual.year=nextCal.year;
    actual.__weeklyTransitionId=tx.id;
    actual.__weeklyPrevious={year:fromYear,week:fromWeek};
    try{actual.energy=typeof energyCapacity==='function'?energyCapacity(actual):100}catch{actual.energy=100}
    if(typeof isTestStudio==='function'&&isTestStudio(actual)&&typeof TEST_MONEY!=='undefined')actual.money=TEST_MONEY;
    else actual.money=Math.max(0,num(next.money)+num(tx.net));

    // These are commit-time operations, never prerequisites for progression.
    safe('studio upgrades',()=>typeof processStudioUpgrades==='function'&&processStudioUpgrades(actual));
    safe('media refresh',()=>typeof window.processBOLSMediaViews==='function'&&window.processBOLSMediaViews());
    safe('save',()=>typeof window.saveCurrent==='function'&&window.saveCurrent(actual,true));

    window.__BOL_STATE__=actual;
    window.__BOL_CURRENT_STATE__=actual;
    document.querySelector('.weeklyModal')?.remove();
    document.querySelector('.studioReportModal')?.remove();
    busy=false;
    transaction=null;
    safe('dashboard render',()=>typeof window.start==='function'&&window.start(actual));
    safe('weekly toast',()=>typeof window.toast==='function'&&window.toast(`Week ${actual.week} begins. ${typeof energyLoad==='function'&&energyLoad(actual)>0?`Construction is consuming ${energyLoad(actual)} ⚡ this week.`:'Your management Energy is fully available.'}`));
    return true;
  }

  function commit(){
    if(busy||!transaction||!transaction.reportReady)return false;
    const tx=transaction;
    busy=true;
    tx.status='committing';
    const button=tx.modal?.querySelector('#continueStudioReport');
    if(button){button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='ADVANCING…'}

    const live=tx.sourceState;
    const prev=tx.from;
    const finish=()=>{
      try{
        // Yearly Wrapped is presentation only. It calls this callback when the
        // player finishes the final slide, then the same atomic commit occurs.
        const commitAfterWrap=()=>{
          window.__BOL_WRAPPED_FINISH__=null;
          return finishCommit(tx);
        };
        if(prev.week>=52&&typeof window.showYearlyIndustryWrapped==='function'){
          tx.status='yearly-wrapped';
          window.__BOL_WRAPPED_FINISH__=commitAfterWrap;
          tx.modal?.remove();
          // Wrapped reads the simulated state and never changes the calendar itself.
          window.__BOL_STATE__=tx.nextState;
          window.__BOL_CURRENT_STATE__=tx.nextState;
          window.showYearlyIndustryWrapped(tx.nextState);
          busy=false;
          return true;
        }
        return finishCommit(tx);
      }catch(err){
        console.error('[BOLS2 Weekly] commit failed',err);
        // Emergency recovery still uses the transaction state; it never runs a
        // second simulation and never advances twice.
        try{
          const nextCal=calendar(prev);
          copyInto(live,tx.nextState||live);
          live.week=nextCal.week;live.year=nextCal.year;
          if(typeof isTestStudio==='function'&&isTestStudio(live)&&typeof TEST_MONEY!=='undefined')live.money=TEST_MONEY;
          else live.money=Math.max(0,num(live.money)+num(tx.net));
          window.__BOL_STATE__=live;window.__BOL_CURRENT_STATE__=live;
          safe('recovery save',()=>window.saveCurrent?.(live,true));
          document.querySelector('.weeklyModal')?.remove();
          document.querySelector('.studioReportModal')?.remove();
          busy=false;transaction=null;
          safe('recovery dashboard',()=>window.start?.(live));
          return true;
        }catch(recovery){console.error('[BOLS2 Weekly] recovery failed',recovery);busy=false;return false}
      }
    };
    return finish();
  }

  function bindReport(modal,tx){
    if(!modal||!tx)return;
    const button=modal.querySelector('#continueStudioReport');
    if(!button)return;
    button.dataset.weeklyEngineV2='1';
    button.onclick=(ev)=>{ev?.preventDefault?.();ev?.stopPropagation?.();commit()};
    // Report enhancements must not replace ownership of Continue.
    setTimeout(()=>{
      const current=tx.modal?.querySelector('#continueStudioReport');
      if(current&&current.dataset.weeklyEngineV2!=='1'){
        current.dataset.weeklyEngineV2='1';
        current.onclick=(ev)=>{ev?.preventDefault?.();ev?.stopPropagation?.();commit()};
      }
    },0);
  }

  function begin(state){
    if(busy)return transaction;
    try{return simulate(state)}catch(err){
      console.error('[BOLS2 Weekly] simulation failed',err);
      transaction=null;busy=false;
      document.querySelector('.weeklyModal')?.remove();
      document.querySelector('.studioReportModal')?.remove();
      safe('simulation error toast',()=>window.toast?.('⚠️ Weekly simulation failed. Your current week is safe. Try again.'));
      return null;
    }
  }

  window.BOLS2WeeklyEngine={
    version:'2.0',
    begin,
    simulate:begin,
    commit,
    nextCalendar:calendar,
    get transaction(){return transaction},
    get busy(){return busy},
    get status(){return transaction?.status||'idle'}
  };

  // Public weekly entry point. next-week-loading calls this after its cinematic
  // transition; the report itself is now generated from a detached simulation.
  window.showWeeklyReport=(state)=>begin(state||liveState());
  window.__BOL_WEEKLY_ENGINE_READY__=true;
})();