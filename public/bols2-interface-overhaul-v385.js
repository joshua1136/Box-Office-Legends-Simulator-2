/* BOLS2 v402 — direct section navigation. */
(function(){
'use strict';
const M={
MOVIES:['🎬','Movies'],
MEDIA:['▶️','BOLS Media'],
TRENDS:['📈','Market Trends'],
BOXOFFICE:['🍿','Box Office'],
STREAMS:['📺','Streaming'],
TALENT:['👥','Talent'],
INDUSTRY:['🏭','Industry'],
UPGRADE:['🏗️','Studio Development'],
FINANCE:['📊','Finance'],
NEWS:['📰','Newsroom'],
STUDIO:['🏢','Your Studio'],
FESTIVALS:['🎞️','Film Festivals'],
AWARDS:['🏆','Awards'],
RANKINGS:['🏅','Rankings']
};
let forwarding=false;
function openDeck(section,target){
  const state=window.__BOL_STATE__||window.state||{};
  if(section==='MEDIA'&&typeof window.openBOLSMedia==='function')return window.openBOLSMedia('home');
  if(typeof window.openSection==='function')return window.openSection(state,section);
  if(target&&typeof target.click==='function'){
    forwarding=true;
    try{target.click();}finally{setTimeout(()=>{forwarding=false;},0);}
  }
}
function install(){
  if(document.__bols402Installed)return;
  document.__bols402Installed=true;
  document.addEventListener('click',function(e){
    if(forwarding)return;
    const b=e.target.closest&&e.target.closest('[data-section]');
    if(!b)return;
    const s=String(b.dataset.section||'').toUpperCase();
    if(!M[s])return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openDeck(s,b);
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
window.BOLS2_MODULES=M;
})();