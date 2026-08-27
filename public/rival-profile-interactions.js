/* Rival profile interaction bridge — v2 records use their own delegated controls. */
(function(){
  const bind=m=>{if(!m||m.dataset.profileBridge==='1')return;m.dataset.profileBridge='1';m.querySelectorAll('[data-pane]').forEach(p=>{p.classList.toggle('active-pane',p.classList.contains('active-pane'));});};
  const obs=new MutationObserver(ms=>ms.forEach(x=>x.addedNodes.forEach(n=>{if(!(n instanceof Element))return;if(n.matches('.industryProfileModal'))bind(n);n.querySelectorAll?.('.industryProfileModal').forEach(bind);})));obs.observe(document.body,{childList:true});
  document.querySelectorAll('.industryProfileModal').forEach(bind);
})();