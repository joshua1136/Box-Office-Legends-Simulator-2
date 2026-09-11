(()=>{
  const clamp=(n,min=0,max=99)=>Math.max(min,Math.min(max,Number(n)||0));
  const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:50;
  const people=()=>window.INDUSTRY_PEOPLE||{};
  const allTalent=()=>Object.values(people()).flat().filter(Boolean);
  const findTalent=name=>allTalent().find(t=>String(t.name||t[0])===String(name))||null;
  const talentScore=t=>clamp(Number(t?.talent??t?.[2]??50));
  const popularity=t=>clamp(Number(t?.popularity??t?.[5]??50));
  const tier=t=>String(t?.tier||t?.[4]||'Unknown');
  const genreDemand=(state,genre)=>{
    const trend=typeof window.trendMultiplier==='function'?window.trendMultiplier(state,genre):1;
    return clamp(50+(trend-0.72)*160 + (String(state?.industry?.trend||'')===String(genre)?8:0),20,99);
  };
  const conceptPotential=(film)=>{
    const c=film.concept||{};
    if(Number(c.originality||0)>0 || Number(c.appeal||0)>0)return {
      originality:clamp(c.originality||50), appeal:clamp(c.appeal||50),
      commercialPotential:clamp(c.commercialPotential||c.appeal||50),
      franchisePotential:clamp(c.franchisePotential||50)
    };
    const hook=String(film.storyHook||film.hook||'');
    const originality=clamp(45+Math.min(30,Math.floor(hook.length/5))+(film.genre==='Sci-Fi'||film.genre==='Fantasy'?8:0));
    const appeal=clamp(48+(hook?12:0)+(film.tone==='Funny'||film.tone==='Emotional'||film.tone==='Intense'?10:0));
    return {originality,appeal,commercialPotential:clamp(appeal*.7+(Number(film.budget)>=1e8?8:0)+(film.franchiseStrategy==='Franchise Starter'?8:0)),franchisePotential:clamp(originality*.45+appeal*.25+(film.franchiseStrategy==='Franchise Starter'?28:4))};
  };
  const roleTalent=(film,role)=>findTalent(film?.crew?.[role]);
  const castTalents=film=>(film.characters||[]).map(c=>findTalent(c.cast)).filter(Boolean);
  const craft=film=>{
    const writer=roleTalent(film,'writer'),director=roleTalent(film,'director'),cin=roleTalent(film,'cinematographer'),composer=roleTalent(film,'composer'),vfx=roleTalent(film,'vfx'),editor=roleTalent(film,'editor');
    const casts=castTalents(film);
    const acting=casts.length?avg(casts.map(talentScore)):avg([roleTalent(film,'leadActor'),roleTalent(film,'leadActress')].filter(Boolean).map(talentScore));
    return {
      story:writer?clamp(52+talentScore(writer)*.48):clamp(film.story||50),
      direction:director?clamp(52+talentScore(director)*.48):clamp(film.direction||50),
      acting:clamp(acting),
      visuals:cin?clamp(50+talentScore(cin)*.5):clamp(film.visuals||50),
      music:composer?clamp(50+talentScore(composer)*.5):clamp(film.music||50),
      vfx:vfx?clamp(50+talentScore(vfx)*.5):clamp(film.vfx||50),
      editing:editor?clamp(50+talentScore(editor)*.5):clamp(avg([film.story||50,film.direction||50]))
    };
  };
  const synergy=film=>{
    const roles=['writer','director','cinematographer','composer','vfx','editor'].map(r=>roleTalent(film,r)).filter(Boolean);
    const pair=[];
    const pairs=[['writer','director'],['director','cinematographer'],['director','composer'],['director','editor']];
    pairs.forEach(([a,b])=>{const x=roleTalent(film,a),y=roleTalent(film,b);if(x&&y)pair.push((talentScore(x)+talentScore(y))/2);});
    const casts=castTalents(film);
    if(casts.length>1){const chemistry=avg(casts.map(popularity));pair.push(chemistry);}
    if(!pair.length)return 50;
    return clamp(avg(pair)*.7+Math.min(99,roles.length*8)*.3);
  };
  const starPower=film=>{
    const casts=castTalents(film);
    const leads=casts.filter((t,i)=>String(film.characters?.[i]?.position||'').toLowerCase()==='lead');
    const source=leads.length?leads:casts;
    const talent=source.length?avg(source.map(talentScore)):avg([roleTalent(film,'leadActor'),roleTalent(film,'leadActress')].filter(Boolean).map(talentScore));
    const pop=source.length?avg(source.map(popularity)):50;
    return clamp(talent*.45+pop*.55);
  };
  const marketingScore=(film,marketing)=>{
    const poster=Number(film.poster?.quality||55);
    return clamp(poster*.55+Math.min(99,Number(marketing||film.marketingBudget||0)/30000000*45));
  };
  const outlook=(state,film,opts={})=>{
    const c=conceptPotential(film),cr=craft(film),syn=synergy(film),stars=starPower(film),demand=genreDemand(state,film.genre),marketing=marketingScore(film,opts.marketing||film.marketingBudget||0);
    const budget=Number(film.budget||3e7);
    const scale=clamp(58+Math.log10(Math.max(1,budget/1e7))*12,55,92);
    const quality=clamp(avg([cr.story,cr.direction,cr.acting,cr.visuals,cr.music,cr.vfx,cr.editing])*.68 + ((c.originality+c.appeal)/2)*.17 + syn*.15);
    const audience=clamp(c.appeal*.42+stars*.18+demand*.25+clamp(Number(film.audienceBonus||0)+Number(film.hype||0)*.45,0,30)*.5+scale*.05);
    const wordOfMouth=clamp(quality*.48+audience*.24+syn*.14+c.appeal*.14);
    const strategy=opts.strategy||film.releaseStrategy||'Wide Release';
    const strategyOpening={ 'Limited Release':-5,'Wide Release':4,'Major Campaign':10,'Global Event':15 }[strategy]||4;
    const strategyLegs={ 'Limited Release':9,'Wide Release':4,'Major Campaign':-1,'Global Event':-6 }[strategy]||4;
    const competition=Number(opts.competition||0);
    const timing=Number(opts.timing||0);
    const opening=clamp(stars*.34+marketing*.26+audience*.20+demand*.10+syn*.10+strategyOpening+timing-competition*.12);
    const legs=clamp(quality*.52+wordOfMouth*.30+audience*.18+strategyLegs);
    const overall=clamp(opening*.44+legs*.56);
    const market=(Number(state?.industry?.boxOfficeIndex||100)/100)*.7+(Number(state?.industry?.marketHealth||82)/100)*.3;
    const strategyFactor={'Limited Release':.84,'Wide Release':1,'Major Campaign':1.13,'Global Event':1.23}[strategy]||1;
    const commercial=clamp(c.commercialPotential*.42+audience*.22+stars*.20+demand*.16);
    const budgetMultiple=Math.max(1.05,1+quality*.012+commercial*.009+stars*.0035);
    const gross=Math.max(budget*1.15,Math.round(budget*budgetMultiple*market*strategyFactor*Math.max(.72,1-Math.min(.22,competition/420))));
    const spread=Math.max(.20,Math.min(.44,(100-overall)/260+.18));
    const low=Math.round(gross*(1-spread)),high=Math.round(gross*(1+spread*.9));
    const studioSharePct=Number(film.industry?.coProducer?.profitShare||55);
    const studioShare=gross*studioSharePct/100;
    const investment=budget+Number(opts.marketing||film.marketingBudget||0);
    const profit=studioShare-investment;
    const breakEven=investment/Math.max(.01,studioSharePct/100);
    const hitProbability=clamp(50+(overall-60)*1.45+(profit/investment)*35-competition*.12,5,95);
    const tier=quality>=95?'MASTERPIECE':quality>=90?'OUTSTANDING':quality>=83?'EXCELLENT':quality>=75?'STRONG':quality>=65?'DECENT':quality>=55?'BELOW AVERAGE':quality>=40?'POOR':'DISASTER';
    return {concept:c,craft:cr,synergy:syn,starPower:stars,genreDemand:demand,marketing,quality,audience,wordOfMouth,opening,legs,overall,commercial,low,high,mostLikely:gross,studioSharePct,studioShare,investment,profit,breakEven,hitProbability,tier};
  };
  const apply=(state,film,opts={})=>{
    if(!film)return null;
    const m=outlook(state,film,opts);
    film.concept={...(film.concept||{}),...m.concept};
    film.story=Math.round(m.craft.story);film.direction=Math.round(m.craft.direction);film.acting=Math.round(m.craft.acting);film.visuals=Math.round(m.craft.visuals);film.music=Math.round(m.craft.music);film.vfx=Math.round(m.craft.vfx);film.quality=Math.round(m.quality);film.audience=Math.round(m.audience);
    film.movieMetrics={quality:m.quality,audience:m.audience,starPower:m.starPower,genreDemand:m.genreDemand,synergy:m.synergy,wordOfMouth:m.wordOfMouth,commercial:m.commercial,opening:m.opening,legs:m.legs,overall:m.overall,tier:m.tier,hitProbability:m.hitProbability,studioSharePct:m.studioSharePct,breakEven:m.breakEven,updatedAt:Date.now()};
    return m;
  };
  const weeklyRetention=(film,weekNo)=>{
    const m=film?.movieMetrics||{};const wom=clamp(m.wordOfMouth||70);const base=wom>=92?.98:wom>=82?.94:wom>=70?.88:wom>=58?.80:.70;return Math.max(.08,Math.pow(base,Math.max(0,Number(weekNo||1)-1)));
  };
  const syncAll=state=>{(state?.films||[]).filter(f=>!['completed'].includes(f.stage)).forEach(f=>apply(state,f));return state;};
  const format=n=>n>=1e9?'$'+(n/1e9).toFixed(2)+'B':n>=1e6?'$'+(n/1e6).toFixed(1)+'M':'$'+Math.round(n).toLocaleString();
  const addCSS=()=>{if(document.getElementById('movieEngineCss'))return;const s=document.createElement('style');s.id='movieEngineCss';s.textContent=`
    .movieOutlookPanel{margin:18px 0;padding:18px;border:1px solid #4a3b22;border-radius:18px;background:linear-gradient(145deg,#17130d,#0d0d0f);box-shadow:0 14px 40px #0006}.movieOutlookHead{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.movieOutlookHead small,.movieOutlookMetric small{display:block;color:#8c806c;font-size:9px;letter-spacing:1.5px}.movieOutlookHead h3{margin:4px 0;font-size:19px}.movieOutlookVerdict{font-size:13px;font-weight:800}.movieOutlookGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}.movieOutlookMetric{padding:11px;border:1px solid #2e2921;border-radius:12px;background:#12110f}.movieOutlookMetric b{display:block;font-size:18px;margin-top:4px}.movieOutlookBar{height:5px;background:#28251f;border-radius:99px;overflow:hidden;margin-top:7px}.movieOutlookBar i{display:block;height:100%;background:#b68a3c;border-radius:99px}.movieOutlookRisk{margin-top:12px;color:#b9b0a1;font-size:11px;line-height:1.45}.movieOutlookRisk strong{color:#e5d5b5}.movieOutlookSignals{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.movieOutlookSignals span{padding:5px 8px;border-radius:99px;background:#211b12;color:#c7aa6d;font-size:9px;letter-spacing:.5px}.movieOutlookPanel .engineBreakEven{color:#d9c28e}.movieOutlookPanel .enginePositive{color:#7fd18f}.movieOutlookPanel .engineNegative{color:#e87878}@media(max-width:700px){.movieOutlookGrid{grid-template-columns:repeat(2,1fr)}}`;
    document.head.appendChild(s);
  };
  const renderOutlook=modal=>{
    const state=window.__BOL_STATE__,id=modal?.dataset?.filmId;if(!state||!id)return;const film=(state.films||[]).find(f=>String(f.id)===String(id));if(!film)return;
    const strategy=modal.querySelector('.releaseChoice.chosen')?.dataset?.strategy||film.releaseStrategy||'Wide Release';const marketing=Number(modal.querySelector('.releaseChoice.chosen')?.dataset?.cost||0);const week=Number(modal.querySelector('.weekChoice.chosen')?.dataset?.week||state.week+2);const rivals=typeof window.getCompetition==='function'?window.getCompetition(state,film,week):[];const competition=rivals.length?Math.min(99,Math.round(rivals[0].impact+(rivals.length-1)*6)):22;const timing=Math.max(0,10-Math.min(10,Math.abs(week-(state.week+2))*2));const m=apply(state,film,{strategy,marketing,competition,timing});let panel=modal.querySelector('.movieOutlookPanel');if(!panel){panel=document.createElement('section');panel.className='movieOutlookPanel';const anchor=modal.querySelector('.projectionBlock')||modal.querySelector('.releaseBlock');anchor?.parentNode?.insertBefore(panel,anchor);}if(!panel)return;const profitClass=m.profit>=0?'enginePositive':'engineNegative';const verdict=m.hitProbability>=75?'LIKELY HIT':m.hitProbability>=58?'PROMISING':m.hitProbability>=42?'RISKY':'HIGH RISK';panel.innerHTML=`<div class="movieOutlookHead"><div><small>NEW MOVIE ENGINE · COMMERCIAL OUTLOOK</small><h3>${m.tier} · ${Math.round(m.quality)}/99 CREATIVE QUALITY</h3><div class="movieOutlookVerdict">${verdict} · ${Math.round(m.hitProbability)}% hit probability</div></div><div><small>PROJECTED PROFIT</small><b class="${profitClass}">${m.profit>=0?'+':''}${format(m.profit)}</b></div></div><div class="movieOutlookGrid">${[['QUALITY',m.quality],['AUDIENCE',m.audience],['STAR POWER',m.starPower],['WORD OF MOUTH',m.wordOfMouth],['OPENING',m.opening],['LEGS',m.legs],['GENRE DEMAND',m.genreDemand],['SYNERGY',m.synergy]].map(x=>`<div class="movieOutlookMetric"><small>${x[0]}</small><b>${Math.round(x[1])}</b><div class="movieOutlookBar"><i style="width:${Math.max(3,Math.min(100,x[1]))}%"></i></div></div>`).join('')}</div><div class="movieOutlookSignals"><span>BREAK-EVEN ${format(m.breakEven)}</span><span>WORLDWIDE ${format(m.low)} — ${format(m.high)}</span><span>STUDIO SHARE ${m.studioSharePct}%</span></div><div class="movieOutlookRisk"><strong>WHY:</strong> Opening is driven by stars, marketing and demand. Long-term legs are driven by quality and word-of-mouth. A great film can still miss commercially, and a modest film can break out.</div>`;
  };
  const observe=()=>{
    addCSS();
    const scan=()=>{document.querySelectorAll('.releaseModal').forEach(m=>{if(!m.dataset.engineBound){m.dataset.engineBound='1';setTimeout(()=>renderOutlook(m),0);m.addEventListener('click',()=>setTimeout(()=>renderOutlook(m),20),true);}})};
    new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});scan();
  };
  window.BOLS2MovieEngine={clamp,conceptPotential,craft,synergy,starPower,outlook,apply,weeklyRetention,syncAll,format,renderOutlook};
  window.addEventListener('DOMContentLoaded',observe,{once:true});setTimeout(observe,0);
  // Weekly progression is owned exclusively by weekly-engine-v3.js.
  // Do not wrap or replace window.showWeeklyReport here; movie calculations remain
  // available to the weekly simulation backend without owning the calendar pipeline.
})();