/* BOLS2 runtime hardening: prevent stale Week 13 resume state from winning boot. */
(function(){
 'use strict';
 const current=()=>window.__BOL_STATE__||window.state||null;
 const tick=s=>((+s?.year||1)-1)*52+(+s?.week||1);
 const originalStart=window.start;
 if(typeof originalStart==='function'&&!window.start.__bols2Hardening){
  const wrapped=function(s){
   const live=current();
   // Never let a lower-timeline startup call silently replace an already newer career.
   if(live&&s&&typeof s==='object'&&tick(live)>tick(s)&&String((live.studioName||live.name||''))===String((s.studioName||s.name||''))) return originalStart.call(this,live);
   return originalStart.apply(this,arguments);
  };
  wrapped.__bols2Hardening=true; window.start=wrapped;
 }
 window.__BOLS2_RUNTIME_HARDENED__=true;
})();