/* BOLS2 Weekly Progression v2
   Single source of truth: the Weekly Report owns the week transition.
   No secondary controller replaces #continueWeek, so Android/iOS clicks cannot be swallowed.
*/
(()=>{
  window.__BOL_WEEKLY_CONTROLLER_V2=true;
  window.__BOL_WEEKLY_CONTROLLER_BOUND=false;
  window.__BOL_WEEKLY_CORE_CONTINUE__=null;
})();