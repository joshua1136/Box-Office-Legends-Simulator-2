(()=>{
'use strict';
const E=()=>window.BOLSMediaEngine;
function openChannel(){
  const engine=E();
  if(!engine||typeof engine.open!=='function')return;
  engine.open();
  setTimeout(()=>{
    const modal=document.querySelector('.mediaRebuildModal');
    const btn=modal?.querySelector('.mrTabs button[data-t="channel"]');
    if(btn){btn.dispatchEvent(new MouseEvent('click',{bubbles:false,cancelable:true,view:window}));return;}
    const nav=modal?.querySelector('.mrTabs');
    if(nav)nav.querySelectorAll('button').forEach(b=>{if(b.dataset.t==='channel'){b.click()}});
  },0);
}
window.openMediaChannelEditor=openChannel;
// The dashboard's legacy CHANNEL entry should open the media channel, never navigate away.
document.addEventListener('click',e=>{
  const b=e.target?.closest?.('[data-section="CHANNEL"],[data-section="MEDIA_CHANNEL"],[data-action="channel"]');
  if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();openChannel();
},{capture:true});
// Keep clicks on MY CHANNEL inside the media modal from leaking to the underlying game UI.
document.addEventListener('click',e=>{
  const b=e.target?.closest?.('.mediaRebuildModal .mrTabs button[data-t="channel"]');
  if(!b)return;
  e.preventDefault();e.stopPropagation();
  const modal=b.closest('.mediaRebuildModal');
  if(!modal)return;
  modal.querySelectorAll('.mrTabs button').forEach(x=>x.classList.toggle('active',x===b));
  // The engine stores the tab handler directly on the button. Invoke it here
  // after stopping propagation so the underlying game dashboard cannot react.
  if(typeof b.onclick==='function')b.onclick();
},{capture:true});
window.__BOLS_CHANNEL_FIX_V393__=true;
})();