(()=>{
  'use strict';
  const boot=()=>{
    document.addEventListener('click',e=>{
      const b=e.target.closest?.('#greenlightSequel');
      if(!b)return;
      e.preventDefault(); e.stopPropagation();
      const status=document.querySelector('#sequelActionStatus');
      if(status){status.textContent='TAP RECEIVED — Greenlight button is connected.';status.hidden=false;status.style.display='block';}
      b.dataset.tapReceived='true';
      b.textContent='TAP RECEIVED ✓';
    },true);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();