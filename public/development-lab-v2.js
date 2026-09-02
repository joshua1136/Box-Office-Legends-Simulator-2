(()=>{
  const money=n=>n>=1e9?'$'+(n/1e9).toFixed(2)+'B':n>=1e6?'$'+(n/1e6).toFixed(1)+'M':'$'+Math.round(n).toLocaleString();
  const clamp=n=>Math.max(0,Math.min(99,Math.round(Number(n)||0)));
  const addHistory=(film,state,event,detail)=>{film.history=film.history||[];film.history.push({week:state.week,year:state.year,event,detail});};
  const castScore=film=>{const a=(film.characters||[]).map(c=>Number(c.castTalent||0)).filter(v=>v>0);return a.length?clamp(a.reduce((x,y)=>x+y,0)/a.length):0;};
  const marketingScore=film=>clamp(Number(film.poster?.quality||0)*.55+(Number(film.marketingBudget||0)/30000000*45));

  window.showFilmDevelopmentLab=function(state,film){
    const e=document.createElement('div');e.className='modal developmentLabModal';
    const render=()=>{
      const engineMetrics=window.BOLS2MovieEngine?.outlook(state,film)||null;const quality=clamp(engineMetrics?.quality||((Number(film.story||50)+Number(film.direction||50)+Number(film.acting||50)+Number(film.visuals||50)+Number(film.music||50)+Number(film.vfx||50))/6));
      const casting=castScore(film),script=clamp(film.story||50),marketing=marketingScore(film),hype=clamp(film.hype||0),audience=clamp(Number(film.audience||50)+Number(film.audienceBonus||0));
      const history=(film.history||[]).slice(-5).reverse();
      e.innerHTML=`<div class="panel developmentLabPanel">
        <header class="developmentLabHero"><button class="close">×</button><div><small>STUDIO · DEVELOPMENT LAB</small><h2>Build, refine, and prepare your next film.</h2><p>Every action changes the real project. No separate Development Lab economy.</p></div><div class="devLabLive"><span><small>CASH</small><b>${money(state.money)}</b></span><span><small>ENERGY</small><b>${state.energy}/${energyCapacity(state)}</b></span></div></header>
        <section class="devLabFilmHead"><div>${posterThumb(film,'developmentLabPoster')}</div><div class="devLabFilmInfo"><small>YOUR NEXT FILM · ${esc(filmName(film.stage).toUpperCase())}</small><h3>${esc(film.title)}</h3><p>${esc(film.genre)} · ${esc(film.tone||'Original')} · Budget ${money(film.budget)}</p><div class="devLabFilmStats"><span><small>QUALITY</small><b>${quality}</b></span><span><small>HYPE</small><b>${hype}</b></span><span><small>AUDIENCE</small><b>${audience}</b></span><span><small>BUDGET LEFT</small><b>${money(Math.max(0,Number(film.budget||0)-Number(film.spent||0)))}</b></span></div></div></section>
        <div class="devLabWorkspace"><section class="devLabMain">
          <div class="devLabSectionTitle"><div><small>DEVELOPMENT</small><h3>Project readiness</h3></div><span>${esc(filmName(film.stage).toUpperCase())}</span></div>
          <div class="devLabProgressGrid"><div><label>STORY</label><i><em style="width:${script}%"></em></i><b>${script}%</b></div><div><label>CASTING</label><i><em style="width:${casting}%"></em></i><b>${casting}%</b></div><div><label>SCRIPT</label><i><em style="width:${script}%"></em></i><b>${script}%</b></div><div><label>MARKETING</label><i><em style="width:${marketing}%"></em></i><b>${marketing}%</b></div></div>
          <div class="devLabActions">
            <button data-dev-action="script"><strong>✍️ DEVELOP SCRIPT</strong><span>+3–7 Story · 12 ⚡</span></button>
            <button data-dev-action="cast"><strong>🎭 SCOUT CAST</strong><span>Real Talent market · 4 ⚡</span></button>
            <button data-dev-action="research"><strong>🔬 RESEARCH AUDIENCE</strong><span>+5–10 Audience forecast · 8 ⚡</span></button>
            <button data-dev-action="hype"><strong>📣 BUILD HYPE</strong><span>+5–12 Hype · $500K · 8 ⚡</span></button>
            <button data-dev-action="refine"><strong>🎨 REFINE CONCEPT</strong><span>+2–6 creative quality · 10 ⚡</span></button>
            <button data-dev-action="poster"><strong>🎞️ DESIGN POSTER</strong><span>Real Poster Studio · 5 ⚡ when approved</span></button>
          </div>
          <div class="devLabNote">⚠️ Refine Concept has a 15% chance of adding a one-week production delay. Development returns can diminish as a project gets stronger.</div>
        </section><aside class="devLabSide">
          <div class="devLabBudget"><small>PROJECT FINANCE</small><h3>${money(film.budget)}</h3><div><span>Spent so far</span><b>${money(film.spent||0)}</b></div><div><span>Marketing</span><b>${money(film.marketingBudget||0)}</b></div><div><span>Talent attached</span><b>${(film.characters||[]).filter(c=>c.cast).length}</b></div></div>
          <div class="devLabHistory"><div class="devLabSectionTitle"><div><small>PROJECT FILE</small><h3>Recent Actions</h3></div></div>${history.map(h=>`<article><span>W${h.week||state.week}</span><div><b>${esc(h.event||'Project update')}</b><small>${esc(h.detail||'')}</small></div></article>`).join('')||'<div class="devLabEmpty">No development actions recorded yet.</div>'}</div>
        </aside></div>
        <footer class="devLabFooter"><button class="menuBtn" id="devLabBack">BACK TO PROJECT</button><button class="menuBtn primary" id="devLabDone">SAVE & RETURN</button></footer>
      </div>`;
      e.querySelector('.close').onclick=()=>e.remove();e.querySelector('#devLabBack').onclick=()=>e.remove();e.querySelector('#devLabDone').onclick=()=>e.remove();
      e.querySelectorAll('[data-dev-action]').forEach(btn=>btn.onclick=()=>{
        const a=btn.dataset.devAction;
        if(a==='cast'){
          if(!spendEnergy(state,ENERGY_ACTIONS.scouting,'scouting talent for '+film.title))return;
          addHistory(film,state,'Talent scouting','Development Lab opened the real Talent market for this project.');saveCurrent(state,true);e.remove();openSection(state,'TALENT',film.id);return;
        }
        if(a==='poster'){e.remove();showPosterStudio(state,film);return;}
        if(a==='script'){
          if(!spendEnergy(state,ENERGY_ACTIONS.writing,'developing the script for '+film.title))return;
          const gain=Math.max(3,Math.min(7,4+Math.floor(Math.random()*4)-(Number(film.story||50)>78?2:0)));
          film.story=clamp(Number(film.story||50)+gain);addHistory(film,state,'Script development',`Story quality +${gain}. Script work now ${film.story}/99.`);
        }else if(a==='research'){
          if(!spendEnergy(state,ENERGY_ACTIONS.industry,'researching audience demand for '+film.title))return;
          const gain=5+Math.floor(Math.random()*6);film.audienceBonus=clamp(Number(film.audienceBonus||0)+gain);film.marketResearch={week:state.week,year:state.year,audienceLift:gain,marketHealth:Number(state.industry?.marketHealth||82),boxOfficeIndex:Number(state.industry?.boxOfficeIndex||100)};addHistory(film,state,'Audience research',`Audience forecast improved +${gain}. Current market conditions were recorded.`);
        }else if(a==='hype'){
          const cost=500000;if(Number(state.money)<cost)return toast('Not enough cash to build campaign hype.');if(!spendEnergy(state,ENERGY_ACTIONS.marketing,'building hype for '+film.title))return;
          state.money-=cost;state.transactions=state.transactions||[];state.transactions.push({week:state.week,year:state.year,type:'marketing',amount:-cost,description:`Early hype campaign for ${film.title}`});const gain=5+Math.floor(Math.random()*8);film.hype=clamp(Number(film.hype||0)+gain);film.audienceBonus=clamp(Number(film.audienceBonus||0)+2);film.spent=Number(film.spent||0)+cost;addHistory(film,state,'Hype campaign',`Spent ${money(cost)} · Hype +${gain} · Audience forecast +2.`);
        }else if(a==='refine'){
          if(!spendEnergy(state,ENERGY_ACTIONS.preproduction,'refining the concept for '+film.title))return;
          const gain=2+Math.floor(Math.random()*5),targets=['story','direction','visuals'],target=targets[Math.floor(Math.random()*targets.length)];film[target]=clamp(Number(film[target]||50)+gain);addHistory(film,state,'Concept refinement',`${target.charAt(0).toUpperCase()+target.slice(1)} +${gain}. 15% delay risk checked.`);
          if(Math.random()<.15){film.totalWeeks=Number(film.totalWeeks||4)+1;film.delayWeeks=Number(film.delayWeeks||0)+1;addHistory(film,state,'Development delay','Concept refinement introduced a one-week schedule delay.');state.news=state.news||[];state.news.unshift({week:state.week,year:state.year,type:'production',title:`⚠️ ${film.title} development delayed`,body:'A concept refinement introduced a one-week schedule delay.'});toast('⚠️ Refinement worked, but the project picked up a one-week delay.');}
        }
        film.quality=clamp((Number(film.story||50)+Number(film.direction||50)+Number(film.acting||50)+Number(film.visuals||50)+Number(film.music||50)+Number(film.vfx||50))/6);saveCurrent(state,true);render();toast('Development updated · '+film.title);
      });
    };render();document.body.appendChild(e);
  };
})();