(()=>{
  const esc=v=>String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const money=n=>{n=Number(n)||0;return n>=1e9?'$'+(n/1e9).toFixed(2)+'B':n>=1e6?'$'+(n/1e6).toFixed(1)+'M':'$'+Math.round(n).toLocaleString()};
  const state=()=>window.__BOL_STATE__||window.state||null;
  function enhance(modal){
    if(!modal||modal.dataset.releaseOverhaul==='1')return;
    modal.dataset.releaseOverhaul='1';
    const s=state(),id=modal.dataset.filmId,film=(s?.films||[]).find(f=>String(f.id)===String(id));
    if(!film)return;
    const hero=modal.querySelector('.releaseHero');
    if(hero){
      const poster=film.poster?.url||film.poster?.src||film.poster?.image||'';
      const tag=document.createElement('div');tag.className='releaseIntel';
      const quality=Math.round(Number(film.quality||50)),aud=Math.round(Number(film.audience||50)),budget=Number(film.budget||0);
      tag.innerHTML=`<div class="releaseIntelCard hot"><small>FILM READINESS</small><b>${quality>=80?'🔥 RELEASE HOT':'🎬 READY TO LAUNCH'}</b><span>Creative quality ${quality}/100 · Audience appeal ${aud}/100</span></div><div class="releaseIntelCard"><small>PRODUCTION INVESTMENT</small><b>${money(budget)}</b><span>${film.spent?money(film.spent)+' already spent':'Production complete'}</span></div><div class="releaseIntelCard"><small>CAMPAIGN SIGNAL</small><b>${film.poster?.quality?Math.round(film.poster.quality)+'/100':'ARTWORK UNRATED'}</b><span>${film.poster?'Poster artwork connected to the release':'Designing the campaign can improve awareness'}</span></div>`;
      hero.insertAdjacentElement('afterend',tag);
    }
    const weeks=modal.querySelector('.releaseWeeks');
    if(weeks){
      const legend=document.createElement('div');legend.className='releaseCalendarLegend';legend.innerHTML='<span>● OPEN WINDOW</span><span>● RIVAL PRESSURE</span><span>● HIGH COMPETITION</span>';weeks.parentElement?.insertBefore(legend,weeks.nextSibling);
      weeks.querySelectorAll('.weekChoice').forEach(btn=>{
        const rival=btn.classList.contains('hasRival');
        if(rival)btn.setAttribute('title','Rival release pressure detected');
      });
    }
    const body=modal.querySelector('.releaseBody');
    const first=body?.querySelector('.releaseBlock');
    if(body&&first){
      const note=document.createElement('section');note.className='releaseBlock releaseDecisionGuide';note.innerHTML='<div class="releaseTitle">EXECUTIVE READ</div><p class="releaseExplain">Every choice here feeds the same BOLS2 movie engine. Strategy changes opening strength and long-term legs; the calendar changes competition and timing; campaign spend changes awareness. The projection updates as you experiment.</p>';
      body.insertBefore(note,first.nextElementSibling);
    }
    const refreshLabels=()=>{
      const chosen=modal.querySelector('.releaseChoice.chosen');
      const week=modal.querySelector('.weekChoice.chosen');
      if(!chosen||!week)return;
      const rival=week.classList.contains('hasRival');
      const title=modal.querySelector('.releaseDecisionGuide .releaseExplain');
      if(title)title.innerHTML=`<strong style="color:#ddd5c5">${esc(chosen.dataset.strategy||'Release plan')}</strong> selected for <strong style="color:#d5ad58">${esc(week.textContent.replace(/\s+/g,' ').trim())}</strong>. ${rival?'This window has rival pressure — expect a tougher opening fight.':'This window has no detected direct rival pressure.'} The live projection below recalculates from the movie engine.`;
    };
    modal.addEventListener('click',()=>setTimeout(refreshLabels,30),true);
    refreshLabels();
  }
  const scan=()=>document.querySelectorAll('.releaseModal').forEach(enhance);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true})},{once:true});else{scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});}
  window.BOLS2ReleaseOverhaul={enhance};
})();