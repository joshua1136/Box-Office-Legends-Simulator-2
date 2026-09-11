/* BOLS2 Studio Report 1.0
   Presentation only. Never advances time, saves state, or runs simulation.
*/
(()=>{
  if(window.__BOLS2_STUDIO_REPORT_V1__)return;
  window.__BOLS2_STUDIO_REPORT_V1__=true;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>`$${Math.round(Number(n)||0).toLocaleString()}`;
  const pct=n=>Math.max(0,Math.min(100,Math.round(Number(n)||0)));
  const signMoney=n=>{const v=Math.round(Number(n)||0);return `${v>=0?'+':'−'}${money(Math.abs(v))}`};
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const filmStageLabel=s=>({development:'Development',preproduction:'Pre-Production',production:'Production',postproduction:'Post-Production',marketing:'Marketing',scheduled:'Scheduled',released:'In Theaters',ready:'Ready'}[s]||String(s||'In Production'));
  const poster=f=>f?.poster?.dataUrl||f?.poster?.url||f?.poster?.image||f?.poster||f?.image||'';
  const safeImg=src=>/^https?:\/\//i.test(String(src||''))||String(src||'').startsWith('data:image/')?String(src):'';

  function summarize(state,prev,net){
    const films=Array.isArray(state?.films)?state.films:[];
    const active=films.filter(f=>!['released','completed'].includes(f.stage));
    const released=films.filter(f=>f.stage==='released');
    const moved=active.filter(f=>num(f.stageWeek)<=2);
    const media=Array.isArray(state?.mediaPosts)?state.mediaPosts:[];
    const recentNews=(state?.news||[]).filter(n=>num(n.week)===num(prev)).slice(0,8);
    const tx=(state?.transactions||[]).filter(t=>num(t.week)===num(prev)&&num(t.year)===num(state.year));
    const revenue=tx.filter(t=>num(t.amount)>0).reduce((a,t)=>a+num(t.amount),0);
    const expenses=Math.abs(tx.filter(t=>num(t.amount)<0).reduce((a,t)=>a+num(t.amount),0));
    const events=recentNews.filter(n=>!['boxoffice','production'].includes(String(n.type||'').toLowerCase()));
    const primaryFilm=active.slice().sort((a,b)=>num(b.audience)+num(b.quality)-num(a.audience)-num(a.quality))[0]||released[0];
    let headline='A quiet week at the studio.';
    let headlineSub='The lights stayed on, the industry kept moving, and your studio is ready for what comes next.';
    if(primaryFilm){
      headline=`${primaryFilm.title} keeps moving forward.`;
      headlineSub=`${filmStageLabel(primaryFilm.stage)} is now the studio's main focus.`;
    }else if(events[0]){
      headline=String(events[0].title||'The industry made some noise.').replace(/^[^A-Za-z0-9]+/,'');
      headlineSub=String(events[0].body||'The industry kept moving this week.');
    }
    const reputation=num(state?.reputation);
    const energy=num(state?.energy);
    const capacity=typeof energyCapacity==='function'?num(energyCapacity(state)):100;
    return {films,active,released,moved,media,recentNews,events,primaryFilm,headline,headlineSub,reputation,energy,capacity,net:num(net),revenue,expenses};
  }

  function render(state,prev,net){
    document.querySelector('.studioReportModal')?.remove();
    const s=summarize(state,prev,net);
    const nextWeek=num(prev)>=52?1:num(prev)+1;
    const nextYear=num(prev)>=52?num(state.year)+1:num(state.year);
    const reputationBefore=num(state.__weeklyPreviousReputation ?? state.reputation);
    const repDelta=num(s.reputation)-reputationBefore;
    const main=s.primaryFilm;
    const image=safeImg(poster(main));
    const projects=s.active.slice(0,4);
    const industry=s.recentNews.filter(n=>String(n.type||'').toLowerCase().includes('industry')).slice(0,3);
    const mediaCount=s.media.filter(p=>num(p.week)===num(prev)).length;
    const events=s.events.slice(0,3);
    const e=document.createElement('div');
    e.className='studioReportModal';
    e.innerHTML=`<div class="studioReportBackdrop"></div><div class="studioReportShell" role="dialog" aria-modal="true" aria-label="Studio Report">
      <header class="studioReportHero">
        <div class="studioReportTop"><span>BOX OFFICE LEGENDS</span><b>YEAR ${num(state.year)} · WEEK ${String(prev).padStart(2,'0')}</b></div>
        <div class="studioReportHeroIcon">✦</div>
        <small>END OF WEEK REPORT</small>
        <h1>Studio Report</h1>
        <p>${esc(state.studioName||'Your Studio')} · The week is complete.</p>
      </header>
      <main class="studioReportBody">
        <section class="studioReportHeadline">
          <div class="srLabel">THE BIG MOMENT</div>
          <h2>${esc(s.headline)}</h2>
          <p>${esc(s.headlineSub)}</p>
        </section>

        <section class="srFinance srCard">
          <div class="srSectionHead"><div><small>STUDIO HEALTH</small><h3>This Week</h3></div><span class="srNet ${s.net>=0?'up':'down'}">${signMoney(s.net)}</span></div>
          <div class="srMetricGrid">
            <div><small>CASH AFTER WEEK</small><strong>${money(num(state.money)+s.net)}</strong><span>Next balance</span></div>
            <div><small>REVENUE</small><strong class="upText">+${money(s.revenue)}</strong><span>Recorded this week</span></div>
            <div><small>EXPENSES</small><strong class="downText">−${money(s.expenses)}</strong><span>Recorded this week</span></div>
          </div>
        </section>

        <section class="srStats srCard">
          <div class="srSectionHead"><div><small>EXECUTIVE SNAPSHOT</small><h3>Your Studio</h3></div></div>
          <div class="srPills">
            <div><span>⚡</span><b>${s.energy}/${s.capacity}</b><small>ENERGY</small></div>
            <div><span>★</span><b>${s.reputation}/100</b><small>REPUTATION</small></div>
            <div><span>🎬</span><b>${s.active.length}</b><small>PROJECTS</small></div>
          </div>
        </section>

        ${main?`<section class="srFeature srCard">
          <div class="srSectionHead"><div><small>YOUR MAIN STORY</small><h3>Project Spotlight</h3></div><span>${esc(filmStageLabel(main.stage))}</span></div>
          <div class="srFeatureFilm">${image?`<img src="${esc(image)}" alt="">`:`<div class="srPosterFallback">🎬</div>`}<div><h4>${esc(main.title||'Untitled Film')}</h4><p>${esc(main.genre||'Feature Film')} · ${esc(main.tone||'Studio Production')}</p><div class="srProgress"><i style="width:${pct((Math.max(0,num(main.stageWeek)-1)/Math.max(1,num(main.totalWeeks)||4))*100)}%"></i></div><small>Week ${Math.max(1,num(main.stageWeek))}/${Math.max(1,num(main.totalWeeks)||4)} · ${esc(filmStageLabel(main.stage))}</small></div></div>
        </section>`:''}

        <section class="srProjects srCard">
          <div class="srSectionHead"><div><small>PRODUCTION FLOOR</small><h3>What Moved</h3></div></div>
          ${projects.length?projects.map((f,i)=>`<div class="srProjectRow"><span class="srProjectNum">0${i+1}</span><div><b>${esc(f.title||'Untitled Film')}</b><small>${esc(f.genre||'Film')} · ${esc(filmStageLabel(f.stage))}</small></div><strong>${Math.round(num(f.quality)||50)}/100</strong></div>`).join(''):`<div class="srEmpty">No active productions this week. The next great movie can start here.</div>`}
        </section>

        <section class="srWorld srCard">
          <div class="srSectionHead"><div><small>THE INDUSTRY</small><h3>What Happened Around You</h3></div></div>
          ${industry.length?industry.map(n=>`<div class="srNewsRow"><span>◆</span><div><b>${esc(n.title||'Industry update')}</b><small>${esc(n.body||'The industry kept moving.')}</small></div></div>`).join(''):`<div class="srNewsRow quiet"><span>•</span><div><b>A quiet industry week.</b><small>No major release or market shock demanded your attention.</small></div></div>`}
        </section>

        <section class="srMedia srCard">
          <div class="srSectionHead"><div><small>BOLS MEDIA</small><h3>Audience Pulse</h3></div><span>MEDIA ACTIVE</span></div>
          <div class="srMediaHero"><strong>${mediaCount||0}</strong><div><b>media activit${mediaCount===1?'y':'ies'} this week</b><small>Your trailers, posts and coverage help shape audience momentum.</small></div></div>
        </section>

        ${events.length?`<section class="srEvents srCard"><div class="srSectionHead"><div><small>STUDIO LIFE</small><h3>Worth Knowing</h3></div></div>${events.map(n=>`<div class="srEventRow"><span>✦</span><div><b>${esc(n.title||'Weekly event')}</b><small>${esc(n.body||'Something happened in the industry.')}</small></div></div>`).join('')}</section>`:''}
      </main>
      <footer class="studioReportFooter"><div><small>NEXT</small><b>YEAR ${nextYear} · WEEK ${String(nextWeek).padStart(2,'0')}</b></div><button id="continueStudioReport" type="button">CONTINUE <span>→</span></button></footer>
    </div>`;
    document.body.appendChild(e);
    const btn=e.querySelector('#continueStudioReport');
    if(btn&&typeof onContinue==='function')onContinue(btn,e);
    return e;
  }

  let onContinue=null;
  window.BOLS2StudioReport={version:'1.0',render,bindContinue(fn){onContinue=fn}};
})();