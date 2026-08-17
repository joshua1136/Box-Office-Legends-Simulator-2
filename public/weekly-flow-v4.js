(()=>{
const KEY='__BOL_WEEKLY_FLOW_V4';
if(window[KEY])return;
window[KEY]=true;
function install(){
  const report=window.showWeeklyReport;
  if(typeof report!=='function'||report.__v4)return;
  function wrapped(state){
    report(state);
    setTimeout(()=>{
      const modal=document.querySelector('.weeklyModal');
      const btn=modal?.querySelector('#continueWeek');
      if(!modal||!btn)return;
      const advance=btn.onclick;
      btn.disabled=false;
      btn.dataset.v4='1';
      btn.textContent='CONTINUE TO EVENTS →';
      window.completeWeeklyEvent=()=>{
        window.__weeklyEventActive=false;
        try{
          if(typeof advance==='function')advance.call(btn,new MouseEvent('click',{bubbles:true,cancelable:true}));
          else{modal.remove();window.start?.(state)}
        }catch{modal.remove();window.start?.(state)}
      };
      btn.onclick=(ev)=>{
        ev.preventDefault();ev.stopPropagation();
        if(btn.dataset.busy)return;
        btn.dataset.busy='1';btn.textContent='OPENING EVENTS…';
        modal.classList.add('flowReportExit');
        setTimeout(()=>{
          modal.remove();
          window.__weeklyEventActive=true;
          const run=window.startWeeklyEventV3||window.runEventsV3;
          if(typeof run==='function')run(state);
          else window.completeWeeklyEvent?.();
        },360);
      };
    },100);
  }
  wrapped.__v4=true;
  window.showWeeklyReport=wrapped;
}
install();setTimeout(install,250);setTimeout(install,800);setTimeout(install,1600);
})();