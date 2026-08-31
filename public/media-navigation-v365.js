/* BOLS MEDIA v375 — legacy navigation quarantine.
   The old v365 navigator incorrectly mounted itself into <main>, which could
   stretch the studio dashboard and produce the broken half-screen Media view.
   BOLS Media now owns its navigation inside the dedicated Media surface. */
(function(){
  const cleanup=()=>document.querySelectorAll('#bm-content-navigation').forEach(el=>el.remove());
  cleanup();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',cleanup,{once:true});
  const observer=new MutationObserver(()=>{if(document.getElementById('bm-content-navigation'))cleanup();});
  observer.observe(document.body,{childList:true,subtree:true});
})();