/* BOLS2 Weekly Engine — single owner, deterministic commit path. */
(function(){
 'use strict';
 let busy=false,tx=null;
 const clone=s=>{try{return JSON.parse(JSON.stringify(s))}catch{return null}};
 const live=()=>window.__BOL_STATE__||window.state||null;
 const safe=fn=>{try{return fn()}catch(e){console.warn('[BOLS2 Weekly]',e);return null}};
 const calendar=s=>{let y=+s.year||1,w=+s.week||1;w++;if(w>52){w=1;y++}return{year:y,week:w}};
 const copyInto=(a,b)=>{Object.keys(a||{}).forEach(k=>{try{delete a[k]}catch{}});Object.assign(a,clone(b)||{});return a};
 function finish(t){if(!t?.sourceState||!t?.nextState)return false;const actual=t.sourceState,next=t.nextState,c=calendar(t.from),net=Number(next.__weeklyNet||0);copyInto(actual,next);actual.year=c.year;actual.week=c.week;actual.money=typeof isTestStudio==='function'&&isTestStudio(actual)&&typeof TEST_MONEY!=='undefined'?TEST_MONEY:Math.max(0,Number(actual.money||0)+net);actual.energy=typeof energyCapacity==='function'?energyCapacity(actual):100;delete actual.__weeklyNet;delete actual.__weeklyReportWeek;actual.__weeklyTransitionId=t.id;actual.__weeklyPrevious={...t.from};window.__BOL_STATE__=actual;window.__BOL_CURRENT_STATE__=actual;document.querySelectorAll('.studioReportModal,.sr2-backdrop,.weeklyModal,.nextWeekLoading').forEach(x=>x.remove());safe(()=>window.saveCurrent?.(actual,true));safe(()=>window.BOLS2Core?.checkpoint?.('weekly-autosave'));safe(()=>window.start?.(actual));busy=false;tx=null;return true}
 function simulate(s){if(busy)return false;const source=clone(s||live());if(!source)return false;busy=true;const id='weekly-'+Date.now()+'-'+Math.random().toString(36).slice(2);const from={year:+source.year||1,week:+source.week||1};let next=clone(source);safe(()=>{if(typeof simulateWeeklyReportLegacy==='function')simulateWeeklyReportLegacy(next)});document.querySelectorAll('.weeklyModal,.nextWeekLoading').forEach(x=>x.remove());const report=typeof window.BOLS2StudioReport?.render==='function'?window.BOLS2StudioReport.render(next,from.week,Number(next.__weeklyNet||0)):null;tx={id,sourceState:s||live(),nextState:next,from,reportReady:!!report};busy=false;if(!report){tx=null;safe(()=>window.toast?.('Weekly report could not be opened. Please try NEXT WEEK again.'));return false}return true}
 function commit(){const t=tx;if(!t||!t.reportReady)return false;return finish(t)}
 window.showWeeklyReport=s=>simulate(s||live());window.__BOLS2_WEEKLY_ENGINE__={simulate,commit,get busy(){return busy}};
 document.addEventListener('click',e=>{const b=e.target?.closest?.('#continueStudioReport');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(!commit())safe(()=>window.toast?.('This weekly report is already closed. Press NEXT WEEK again.'));},true);
})();