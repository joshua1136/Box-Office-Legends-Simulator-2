/* BOLS2 Weekly Engine v1
   Canonical weekly transition. The UI may present reports, but this engine owns
   committing the next week. Core time advancement is atomic; optional systems
   cannot deadlock the career.
*/
(()=>{
  if(window.BOLS2WeeklyEngine)return;
  const safe=(label,fn)=>{try{return fn()}catch(err){console.warn(`[Weekly Engine] ${label} skipped`,err);return undefined}};
  let transitionLock=false;
  let transitionId=0;

  function nextCalendar(state){
    const week=Math.max(1,Number(state?.week)||1);
    const year=Math.max(1,Number(state?.year)||1);
    return week>=52?{week:1,year:year+1}:{week:week+1,year};
  }

  function commit(state,reportMeta={}){
    if(!state||transitionLock)return false;
    transitionLock=true;
    const id=`Y${Number(state.year||1)}-W${Number(state.week||1)}-${++transitionId}`;
    const modal=document.querySelector('.weeklyModal');
    const button=modal?.querySelector('#continueWeek');
    if(button){button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='ADVANCING…';}

    const fromWeek=Number(state.week||1),fromYear=Number(state.year||1);
    const next=nextCalendar(state);
    const net=Number(reportMeta.net||0);

    if(fromWeek>=52&&!reportMeta.fromWrapped&&typeof window.showYearlyIndustryWrapped==='function'){
      safe('prepare yearly wrapped',()=>modal?.remove());
      window.__BOL_WRAPPED_FINISH__=()=>commit({ ...state, week:52, year:fromYear }, { ...reportMeta, net, fromWrapped:true });
      const wrappedState={...state,week:52,year:fromYear};
      transitionLock=false;
      safe('open yearly wrapped',()=>window.showYearlyIndustryWrapped(wrappedState));
      return true;
    }
    const isTest=typeof window.isTestStudio==='function'&&window.isTestStudio(state);

    /* CORE COMMIT — do this before any optional side effects. */
    state.week=next.week;
    state.year=next.year;
    state.energy=safe('energy refresh',()=>typeof window.energyCapacity==='function'?window.energyCapacity(state):100) ?? 100;
    state.__weeklyTransitionId=id;
    state.__weeklyPrevious={week:fromWeek,year:fromYear};

    /* Secondary systems are deliberately isolated. A failure here must never
       undo or block the calendar transition. */
    safe('studio upgrades',()=>typeof window.processStudioUpgrades==='function'&&window.processStudioUpgrades(state));
    safe('weekly finance',()=>{state.money=isTest?Number(window.TEST_MONEY||state.money):Math.max(0,Number(state.money||0)+net)});
    safe('media refresh',()=>typeof window.processBOLSMediaViews==='function'&&window.processBOLSMediaViews());
    safe('save',()=>typeof window.saveCurrent==='function'&&window.saveCurrent(state,true));

    const finish=()=>{
      safe('close weekly report',()=>modal?.remove());
      safe('render dashboard',()=>typeof window.start==='function'&&window.start(state));
      safe('post-advance hooks',()=>{
        if(reportMeta.awardAnnouncement&&typeof window.showAwardsNominationAnnouncement==='function')
          setTimeout(()=>safe('award announcement',()=>window.showAwardsNominationAnnouncement(state,reportMeta.awardAnnouncement.show,reportMeta.awardAnnouncement.year,reportMeta.awardAnnouncement.nominations)),220);
        if(reportMeta.awardCeremony&&typeof window.showAwardsCeremony==='function')
          setTimeout(()=>safe('award ceremony',()=>window.showAwardsCeremony(state,reportMeta.awardCeremony)),520);
        if(Array.isArray(reportMeta.festivalCeremonies)&&typeof window.showFestivalCeremony==='function')
          reportMeta.festivalCeremonies.forEach((c,i)=>setTimeout(()=>safe('festival ceremony',()=>window.showFestivalCeremony(state,c)),reportMeta.awardCeremony?1100:520+i*850));
      });
      safe('toast',()=>typeof window.toast==='function'&&window.toast(`Week ${state.week} begins.`));
      transitionLock=false;
    };

    /* Never leave the player trapped in the report because an optional render
       hook threw. */
    try{finish()}catch(err){
      console.error('[Weekly Engine] finish recovery',err);
      try{modal?.remove()}catch{}
      try{window.start?.(state)}catch{}
      transitionLock=false;
    }
    return true;
  }

  function bindReport(modal,state,meta={}){
    if(!modal||!state)return;
    const button=modal.querySelector('#continueWeek');
    if(!button||button.dataset.weeklyEngineBound==='1')return;
    button.dataset.weeklyEngineBound='1';
    button.onclick=(ev)=>{
      ev?.preventDefault?.();
      ev?.stopPropagation?.();
      commit(state,meta);
    };
  }

  window.BOLS2WeeklyEngine={commit,bindReport,nextCalendar};

  /* Replace only the report's transition ownership. The simulation/report
     generation remains in main.js; the actual calendar commit belongs here. */
  const originalReport=window.showWeeklyReport;
  if(typeof originalReport==='function'&&!window.__BOLS2_WEEKLY_REPORT_ENGINE_BOUND){
    window.__BOLS2_WEEKLY_REPORT_ENGINE_BOUND=true;
    window.showWeeklyReport=(state)=>{
      const result=originalReport(state);
      setTimeout(()=>{
        const modal=document.querySelector('.weeklyModal');
        if(modal)bindReport(modal,state);
      },0);
      return result;
    };
  }
})();