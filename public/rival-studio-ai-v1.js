/* BOLS2 Rival Studio AI v1 — competitive industry behavior layer */
(function(){
  'use strict';
  const KEY='rivalAI';
  const PROFILES={
    'Universal Pictures':{id:'UP',strategy:'blockbuster',genres:['Action','Adventure','Comedy'],aggression:0.86,media:0.88},
    'Warner Bros. Pictures':{id:'WB',strategy:'franchise',genres:['Action','Drama','Fantasy','Thriller'],aggression:0.82,media:0.86},
    'Disney':{id:'DS',strategy:'family-event',genres:['Family','Fantasy','Animation','Adventure'],aggression:0.76,media:0.91},
    'Netflix':{id:'NF',strategy:'volume-streaming',genres:['Drama','Comedy','Thriller','Romance'],aggression:0.74,media:0.95},
    'Paramount Pictures':{id:'PP',strategy:'commercial',genres:['Action','Comedy','Drama','Horror'],aggression:0.72,media:0.78},
    'A24':{id:'A2',strategy:'prestige',genres:['Drama','Horror','Thriller','Indie'],aggression:0.61,media:0.83}
  };
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)/4294967296};
  function state(){return window.__BOL_STATE__||window.state||window.gameState||window.BOLS?.state||null}
  function absWeek(g){return num(g?.year,1)*52+num(g?.week,1)}
  function films(g){return (g.industryFilms||g.industryFilmography||[]).filter(Boolean)}
  function playerFilms(g){return (g.films||g.filmography||[]).filter(f=>!f.isRival&&String(f.studio||f.studioName||'').toLowerCase().includes(String(g.studioName||g.studio||'').toLowerCase())||(!f.isRival&&f.owner==='player'))}
  function trendGenre(g){
    const t=g.trends||g.genreTrends||{}; let best='',score=-1;
    Object.keys(t).forEach(k=>{const v=num(t[k]?.score??t[k]?.popularity??t[k]);if(v>score){score=v;best=k}});
    if(best)return best;
    return g.popularGenre||g.currentTrend||'Action';
  }
  function findUpcomingPlayer(g,w){return playerFilms(g).filter(f=>num(f.releaseWeek)===w&&num(f.releaseYear,g.year||1)===num(g.year||1)).sort((a,b)=>num(b.hype)-num(a.hype))[0]}
  function ensure(g){
    g.rivalAI=g.rivalAI||{lastProcessedAbs:0,moves:[],studios:{}};
    Object.keys(PROFILES).forEach(name=>{g.rivalAI.studios[name]=g.rivalAI.studios[name]||{confidence:50,focus:PROFILES[name].strategy,heat:0,lastMove:''}});
    return g.rivalAI;
  }
  function rivalFilms(g,name){return films(g).filter(f=>f.isRival&&(f.rivalStudio===name||f.studio===name||f.studioName===name))}
  function chooseMove(g,name,p){
    const wk=num(g.week,1), yr=num(g.year,1), key=String(name)+'|'+yr+'|'+wk;
    const r=hash(key), genre=trendGenre(g), pf=findUpcomingPlayer(g,wk);
    const own=rivalFilms(g,name), upcoming=own.filter(f=>num(f.releaseWeek)===wk&&num(f.releaseYear,yr)===yr)[0];
    const playerStrength=pf?clamp((num(pf.hype)+num(pf.marketingScore)+num(pf.starPower))/3,0,100):0;
    if(pf&&playerStrength>70&&r<0.72) return {type:'counter-program',genre:pf.genre||genre,target:pf.title,film:upcoming};
    if(upcoming&&r<0.86) return {type:'media-push',film:upcoming,genre:upcoming.genre};
    if(r<0.32) return {type:'trend-bet',genre,film:upcoming};
    if(r<0.52) return {type:'accelerate',film:upcoming,genre:upcoming?.genre||genre};
    return {type:'hold',genre,film:upcoming};
  }
  function applyMove(g,name,p,m){
    const ai=ensure(g), list=ai.moves, wk=num(g.week,1),yr=num(g.year,1),abs=absWeek(g);
    const f=m.film;
    let headline='', detail='';
    if(f){
      f.marketingScore=clamp(num(f.marketingScore,45),0,100);
      f.hype=clamp(num(f.hype,30),0,100);
      f.mediaAwareness=clamp(num(f.mediaAwareness,30),0,100);
      f.industry=f.industry||{};
    }
    if(m.type==='media-push'&&f){f.marketingScore=clamp(f.marketingScore+4*p.aggression,0,100);f.hype=clamp(f.hype+5*p.media,0,100);f.mediaAwareness=clamp(f.mediaAwareness+8*p.media,0,100);f.industry.media=f.industry.media||{};f.industry.media.rivalAIPush=abs;headline=`${name} doubles down on ${f.title}`;detail='A heavier campaign is flooding the industry with new attention.'}
    else if(m.type==='counter-program'&&f){f.marketingScore=clamp(f.marketingScore+5*p.aggression,0,100);f.hype=clamp(f.hype+4,0,100);f.industry.media=f.industry.media||{};f.industry.media.counterProgramming=true;headline=`${name} counters your release`;detail=`The studio is positioning ${f.title} against a competing player release.`}
    else if(m.type==='trend-bet'&&f){f.marketingScore=clamp(f.marketingScore+3,0,100);f.hype=clamp(f.hype+3,0,100);f.genre=m.genre||f.genre;headline=`${name} chases the ${m.genre} trend`;detail='Its upcoming slate is being tuned toward the strongest audience trend.'}
    else if(m.type==='accelerate'&&f){f.hype=clamp(f.hype+2,0,100);f.marketingScore=clamp(f.marketingScore+2,0,100);headline=`${name} accelerates ${f.title}`;detail='Production and marketing momentum are being pushed forward.'}
    else {headline=`${name} holds its strategy`;detail='The studio is watching the market before committing more resources.'}
    const move={id:`rival-move-${name.replace(/\W/g,'')}-${yr}-${wk}`,week:wk,year:yr,absWeek:abs,studio:name,studioId:p.id,type:m.type,genre:m.genre||f?.genre||trendGenre(g),targetFilmId:f?.id||f?.filmId||null,targetFilm:f?.title||m.target||null,headline,detail};
    list.unshift(move);ai.moves=list.slice(0,80);ai.studios[name].lastMove=move.id;ai.studios[name].heat=clamp(num(ai.studios[name].heat)+ (m.type==='hold'?-2:5),0,100);
    g.news=Array.isArray(g.news)?g.news:[];
    g.news.unshift({id:move.id,type:'industry',category:'media',title:headline,headline,body:detail,week:wk,year:yr,studio:name,filmId:move.targetFilmId,source:'rival-ai'});
    g.news=g.news.slice(0,300);
    try{window.dispatchEvent(new CustomEvent('bols:rival-move',{detail:move}))}catch(e){}
    return move;
  }
  function run(force){
    const g=state(); if(!g)return [];
    const abs=absWeek(g), ai=ensure(g); if(!force&&ai.lastProcessedAbs===abs)return [];
    const out=[];
    Object.entries(PROFILES).forEach(([name,p])=>out.push(applyMove(g,name,p,chooseMove(g,name,p))));
    ai.lastProcessedAbs=abs;
    try{window.saveCurrent?.(g,true)}catch(e){}
    return out;
  }
  function recent(limit=12){const g=state();return (g?.rivalAI?.moves||[]).slice(0,limit)}
  window.BOLSRivalAI={run,recent,profiles:PROFILES};
  window.addEventListener('bols:week-advanced',()=>setTimeout(()=>run(false),120));
  window.addEventListener('bols:film-released',()=>setTimeout(()=>run(true),80));
  setTimeout(()=>run(false),500);
})();