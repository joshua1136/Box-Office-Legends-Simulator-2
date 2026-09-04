/* BOLS2 navigation — one tap, one destination. Legacy category launchers are intentionally disabled. */
(function(){
  'use strict';
  const VALID=new Set(['MOVIES','MEDIA','TRENDS','BOXOFFICE','STREAMS','TALENT','INDUSTRY','UPGRADE','FINANCE','NEWS','STUDIO','FESTIVALS','AWARDS','RANKINGS']);
  function direct(section,target){
    const state=window.__BOL_STATE__||window.state;
    if(!state)return;
    if(section==='MEDIA'){
      if(typeof window.openBOLSMedia==='function'){
        window.openBOLSMedia('home');
      } else {
        /* Let the game's native MEDIA handler run if the media bundle has not loaded yet. */
        if(target&&typeof target.click==='function')setTimeout(()=>target.click(),0);
      }
      return;
    }
    if(typeof window.openSection==='function'){
      window.openSection(state,section);
      return;
    }
    /* Main game script loads before this navigation layer in production, but keep a safe fallback. */
    if(target&&typeof target.click==='function')setTimeout(()=>target.click(),0);
  }
  function removeLegacyLauncher(root){
    if(!root?.matches?.('.bolsModuleLauncher'))return;
    root.remove();
  }
  function install(){
    if(document.__bols402DirectNavInstalled)return;
    document.__bols402DirectNavInstalled=true;
    /* Do NOT intercept dashboard section clicks in capture phase. The main game owns
       navigation. MEDIA gets a bubble-phase fallback because older builds can lose
       the dynamically assigned onclick during dashboard re-renders. */
    document.addEventListener('click',function(e){
      const b=e.target?.closest?.('button[data-section="MEDIA"]');
      if(!b || b.closest('.bm398,.bmModalLayer'))return;
      if(typeof window.openBOLSMedia==='function')window.openBOLSMedia('home');
    },false);
    /* Safety net for any historical script that tries to inject the old four-button deck. */
    new MutationObserver(mutations=>{
      mutations.forEach(m=>m.addedNodes.forEach(n=>{
        if(n.nodeType!==1)return;
        if(n.matches?.('.bolsModuleLauncher'))removeLegacyLauncher(n);
        n.querySelectorAll?.('.bolsModuleLauncher').forEach(removeLegacyLauncher);
      }));
    }).observe(document.body,{childList:true,subtree:true});
    document.querySelectorAll('.bolsModuleLauncher').forEach(removeLegacyLauncher);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  window.BOLS2_MODULES={directNavigation:true};
})();