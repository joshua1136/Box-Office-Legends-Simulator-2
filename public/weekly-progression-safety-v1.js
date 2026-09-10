/* BOLS2 Weekly Progression Safety v1
   Never allow a weekly report to deadlock the career. Theater decisions are optional,
   and an event with no affordable choice gets a free continuation action.
*/
(()=>{
  const releaseReport=()=>{
    const modal=document.querySelector('.weeklyModal');
    if(!modal)return;
    const btn=modal.querySelector('#continueWeek');
    if(!btn)return;
    if(btn.disabled){
      btn.disabled=false;
      btn.textContent='CONTINUE →';
      btn.title='Theatrical decisions can be resolved later from the film.';
    }
  };
  const releaseEvent=()=>{
    const overlay=document.querySelector('.ev3');
    if(!overlay)return;
    const choices=[...overlay.querySelectorAll('.ev3-choice')];
    if(!choices.length)return;
    if(choices.some(b=>!b.disabled))return;
    if(overlay.querySelector('[data-free-event-continue]'))return;
    const wrap=overlay.querySelector('.ev3-body,.ev3-result')||overlay;
    const b=document.createElement('button');
    b.className='ev3-action';
    b.dataset.freeEventContinue='1';
    b.textContent='CONTINUE WITHOUT ACTION →';
    b.onclick=()=>{overlay.remove();window.__weeklyEventActive=false;window.__eventV3Resolved=true;window.completeWeeklyEvent?.();};
    wrap.appendChild(b);
  };
  const scan=()=>{releaseReport();releaseEvent();};
  new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
  [0,80,250,600,1200,2500,5000].forEach(t=>setTimeout(scan,t));
})();