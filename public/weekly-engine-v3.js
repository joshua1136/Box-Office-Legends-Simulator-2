/* BOLS2 Weekly Engine — local-save finalization. */
(function(){
 'use strict';
 let busy=false,tx=null;
 const clone=s=>{try{return JSON.parse(JSON.stringify(s))}catch{return null}};
 const live=()=>window.__BOL_STATE__||window.state||null;
 const safe=(fn)=>{try{return fn()}catch(e){console.warn('[BOLS2 Weekly]',e);return null}};
 const calendar=s=>{let y=+s.year||1,w=+s.week||1;w++;if(w>52){w=1;y++}return{year:y,week:w}};
 const copyInto=(a,b)=>{Object.keys(a||{}).forEach(k=>{try{delete a[k]}catch{}});Object.assign(a,clone(b)||{});return a};
 function finish(t){const actual=t.sourceState,next=t.nextState;if(!actual||!next)return false;const c=calendar(t.from);copyInto(actual,next);actual.year=c.year;actual.week=c.week;actual.__weeklyTransitionId=t.id;actual.__weeklyPrevious={...t.from};safe(()=>{actual.energy=typeof energyCapacity==='function'?energyCapacity(actual):100});if(typeof isTestStudio==='function'&&isTestStudio(actual)&&typeof TEST_MONEY!=='undefined')actual.money=TEST_MONEY;window.__BOL_STATE__=actual;window.__BOL_CURRENT_STATE__=actual;document.querySelector('.studioReportModal,.sr2-backdrop,.weeklyModal')?.remove();safe(()=>window.saveCurrent?.(actual,true));safe(()=>window.BOLS2SaveV5?.save?.('weekly-autosave',actual));safe(()=>window.start?.(actual));busy=false;tx=null;return true}
 function simulate(s){if(busy)return false;const source=clone(s||live());if(!source)return false;busy=true;const id='weekly-'+Date.now()+'-'+Math.random().toString(36).slice(2);const from={year:+source.year||1,week:+source.week||1};let next=clone(source);safe(()=>{if(typeof simulateWeeklyReportLegacy==='function')simulateWeeklyReportLegacy(next)});const old=document.querySelector('.weeklyModal');old?.remove();const report=typeof renderStudioReportV2==='function'?renderStudioReportV2(next,from):null;tx={id,sourceState:s||live(),nextState:next,from,reportReady:!!report};busy=false;if(!report){tx=null;return false}return true}
 function commit(){const t=tx;if(!t||!t.reportReady)return false;return finish(t)}
 window.showWeeklyReport=s=>simulate(s||live());window.__BOLS2_WEEKLY_ENGINE__={simulate,commit,get busy(){return busy}};
 document.addEventListener('click',e=>{const b=e.target?.closest?.('#continueStudioReport');if(!b)return;e.preventDefault();e.stopImmediatePropagation();commit()},true);
})();