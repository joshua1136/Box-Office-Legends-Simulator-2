/* BOLS2 Rival Studio Decision Intelligence v2 — persistent memory, learning and strategic adaptation */
(function(){
'use strict';
const PROFILES={
'Universal Pictures':{id:'UP',strategy:'blockbuster',genres:['Action','Adventure','Comedy'],aggression:.86,media:.88},
'Warner Bros. Pictures':{id:'WB',strategy:'franchise',genres:['Action','Drama','Fantasy','Thriller'],aggression:.82,media:.86},
'Disney':{id:'DS',strategy:'family-event',genres:['Family','Fantasy','Animation','Adventure'],aggression:.76,media:.91},
'Netflix':{id:'NF',strategy:'volume-streaming',genres:['Drama','Comedy','Thriller','Romance'],aggression:.74,media:.95},
'Paramount Pictures':{id:'PP',strategy:'commercial',genres:['Action','Comedy','Drama','Horror'],aggression:.72,media:.78},
'A24':{id:'A2',strategy:'prestige',genres:['Drama','Horror','Thriller','Indie'],aggression:.61,media:.83}
};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const hash=s=>{let h=2166136261;for(let i=0;i<String(s).length;i++){h^=String(s).charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const roll=(s)=>hash(s)/4294967296;
function state(){return window.__BOL_STATE__||window.state||window.gameState||window.BOLS?.state||null}
function absWeek(g){return (num(g?.year,1)-1)*52+num(g?.week,1)}
function allFilms(g){return [...(g.films||[]),...(g.filmography||[]),...(g.industryFilms||[]),...(g.industryFilmography||[])].filter((f,i,a)=>f&&a.findIndex(x=>String(x.id)===String(f.id))===i)}
function playerFilms(g){const studio=String(g.studioName||g.studio||'').toLowerCase();return [...(g.films||[]),...(g.filmography||[])].filter(f=>!f.isRival&&(!studio||String(f.studio||f.studioName||'').toLowerCase()===studio||f.owner==='player'))}
function rivals(g,name){return allFilms(g).filter(f=>f.isRival&&(f.rivalStudio===name||f.studio===name||f.studioName===name))}
function trend(g){const t=g.trends||g.genreTrends||{};let best=g.popularGenre||g.currentTrend||g.industry?.trend||'Drama',score=-1;Object.keys(t).forEach(k=>{const v=num(t[k]?.score??t[k]?.popularity??t[k]);if(v>score){score=v;best=k}});return best}
function ensure(g){g.rivalAI=g.rivalAI||{};const a=g.rivalAI;a.v=2;a.lastProcessedAbs=num(a.lastProcessedAbs,0);a.moves=Array.isArray(a.moves)?a.moves:[];a.memory=Array.isArray(a.memory)?a.memory:[];a.studios=a.studios||{};a.playerProfile=a.playerProfile||{genres:{},releaseWeeks:{},recentHits:0,recentMisses:0,lastObservedAbs:0};Object.keys(PROFILES).forEach(n=>{a.studios[n]=a.studios[n]||{confidence:50,heat:0,focus:PROFILES[n].strategy,losses:0,wins:0,adaptations:0,lastMove:'',preferredGenre:PROFILES[n].genres[0],rivalry:0}});return a}
function learnPlayer(g){const a=ensure(g),p=a.playerProfile,fs=playerFilms(g),recent=fs.filter(f=>{const aw=(num(f.releaseYear||f.createdYear,g.year)-1)*52+num(f.releasedWeek||f.releaseWeek,f.createdWeek||0);return aw>absWeek(g)-12});recent.forEach(f=>{const id=String(f.id),gross=num(f.finalBoxOffice||f.boxOffice),budget=num(f.budget)+num(f.marketingBudget),hit=gross>Math.max(budget*2,budget+1e6),genre=f.genre||'Drama';if(p._seen?.[id])return;p._seen=p._seen||{};p._seen[id]=1;p.genres[genre]=num(p.genres[genre])+1;if(hit)p.recentHits++;else if(gross>0)p.recentMisses++;});p._seen=p._seen||{};const ranked=Object.entries(p.genres).sort((a,b)=>b[1]-a[1]);p.favoriteGenre=ranked[0]?.[0]||trend(g);p.lastObservedAbs=absWeek(g);return p}
function playerStrength(g,f){if(!f)return 0;return clamp((num(f.hype,50)+num(f.marketingScore,50)+num(f.starPower,50)+num(f.quality,50))/4,0,100)}
function choose(g,name,p){const a=ensure(g),mem=a.studios[name],wk=num(g.week,1),yr=num(g.year,1),r=roll(name+'|'+yr+'|'+wk+'|'+mem.adaptations),genre=trend(g),pf=playerFilms(g).filter(f=>num(f.releaseWeek)===wk&&num(f.releaseYear,yr)===yr).sort((x,y)=>playerStrength(g,y)-playerStrength(g,x))[0];const own=rivals(g,name),upcoming=own.filter(f=>num(f.releaseWeek)===wk&&num(f.releaseYear,yr)===yr)[0];const favorite=a.playerProfile.favoriteGenre||genre;const learned=mem.preferredGenre||p.genres[0];const playerPower=playerStrength(g,pf);
let type='hold',target=upcoming,why='';
if(pf&&playerPower>72&&r<.78){type='counter-program';why='A strong player release was detected.';}
else if(upcoming&&r<.9){type='media-push';why='The studio wants to protect its release window.';}
else if(r<.42){type='trend-bet';target=upcoming||own.filter(f=>f.releaseWeek>wk).sort((x,y)=>((x.releaseWeek-wk+52)%52)-((y.releaseWeek-wk+52)%52))[0];why='The market trend is pulling the slate toward a stronger audience segment.';}
else if(r<.62){type='accelerate';why='Recent results give the studio confidence to push its next title.';}
if(a.playerProfile.recentHits>=2&&r<.65){type=pf?'counter-program':'media-push';why='The player has built a recent winning streak, so the rival is responding more aggressively.';mem.rivalry=clamp(mem.rivalry+4,0,100);}
if(a.playerProfile.recentMisses>=2&&r<.35){type='hold';why='The player has cooled off, so the rival avoids overspending.';mem.rivalry=clamp(mem.rivalry-2,0,100);}
if(type==='trend-bet'&&favorite&&roll(name+'|favorite|'+wk)<.7){genre=favorite;}
if(type==='trend-bet'&&target)target.genre=genre;
return {type,film:target,genre,playerTarget:pf?.title||null,why};}
function apply(g,name,p,m){const a=ensure(g),mem=a.studios[name],wk=num(g.week,1),yr=num(g.year,1),abs=absWeek(g),f=m.film;let headline,detail,delta=0;
if(f){f.marketingScore=clamp(num(f.marketingScore,50),0,100);f.hype=clamp(num(f.hype,30),0,100);f.mediaAwareness=clamp(num(f.mediaAwareness,30),0,100);f.industry=f.industry||{};f.industry.media=f.industry.media||{};}
if(m.type==='media-push'&&f){const boost=3+p.aggression*3;f.marketingScore=clamp(f.marketingScore+boost,0,100);f.hype=clamp(f.hype+3+p.media*3,0,100);f.mediaAwareness=clamp(f.mediaAwareness+5+p.media*4,0,100);f.industry.media.rivalAIPush=abs;headline=`${name} increases pressure around ${f.title}`;detail=`${m.why} Its campaign is taking a larger share of the industry's attention.`;delta=5;}
else if(m.type==='counter-program'&&f){f.marketingScore=clamp(f.marketingScore+5*p.aggression,0,100);f.hype=clamp(f.hype+4,0,100);f.industry.media.counterProgramming=true;f.industry.media.counterTarget=m.playerTarget||null;headline=`${name} counters ${m.playerTarget||'the player release'}`;detail=`The studio is deliberately positioning ${f.title} against the player's strongest release.`;delta=7;}
else if(m.type==='trend-bet'&&f){f.marketingScore=clamp(f.marketingScore+3,0,100);f.hype=clamp(f.hype+3,0,100);f.industry.media.trendBet=m.genre;headline=`${name} bets on the ${m.genre} audience`;detail=`${m.why} The rival is reshaping its campaign around ${m.genre}.`;delta=4;}
else if(m.type==='accelerate'&&f){f.hype=clamp(f.hype+2,0,100);f.marketingScore=clamp(f.marketingScore+2,0,100);headline=`${name} accelerates ${f.title}`;detail=`${m.why} Production and marketing momentum are being pulled forward.`;delta=3;}
else {headline=`${name} stays patient`;detail=`${m.why||'The studio is watching the market before committing more resources.'}`;delta=-1;}
mem.heat=clamp(mem.heat+delta,0,100);mem.lastMove=headline;if(m.type!=='hold')mem.adaptations++;
const move={id:`rai2-${name.replace(/\W/g,'')}-${yr}-${wk}`,week:wk,year:yr,absWeek:abs,studio:name,studioId:p.id,type:m.type,genre:m.genre||f?.genre||trend(g),targetFilmId:f?.id||f?.filmId||null,targetFilm:f?.title||null,playerTarget:m.playerTarget||null,headline,detail,confidence:Math.round(mem.confidence),adaptation:mem.adaptations};
a.moves.unshift(move);a.moves=a.moves.slice(0,120);a.memory.unshift({absWeek:abs,studio:name,event:m.type,playerTarget:m.playerTarget||null,genre:move.genre});a.memory=a.memory.slice(0,160);g.news=Array.isArray(g.news)?g.news:[];g.news.unshift({id:move.id,type:'industry',category:'media',scope:'world',title:headline,headline,body:detail,week:wk,year:yr,studio:name,filmId:move.targetFilmId,source:'rival-decision-intelligence'});return move;}
function learnOutcome(g){const a=ensure(g),yr=num(g.year,1),pf=playerFilms(g);pf.forEach(f=>{const gross=num(f.finalBoxOffice||f.boxOffice),budget=num(f.budget)+num(f.marketingBudget);if(!gross||!budget)return;const hit=gross>=budget*2.2;Object.values(a.studios).forEach(mem=>{if(hit)mem.confidence=clamp(mem.confidence+0.15,1,99);});});const rfilms=allFilms(g).filter(f=>f.isRival&&f.rivalStudio);rfilms.forEach(f=>{const gross=num(f.finalBoxOffice||f.boxOffice),budget=num(f.budget);if(!gross||!budget)return;const name=f.rivalStudio||f.studio,mem=a.studios[name];if(!mem)return;const hit=gross>=budget*2;if(hit)mem.wins++;else mem.losses++;});a.memory=a.memory.slice(0,160);}
function run(force){const g=state();if(!g)return [];const a=ensure(g),abs=absWeek(g);if(!force&&a.lastProcessedAbs===abs)return[];learnPlayer(g);learnOutcome(g);const out=[];Object.entries(PROFILES).forEach(([name,p])=>{const m=choose(g,name,p);out.push(apply(g,name,p,m));const mem=a.studios[name];const targetGenre=m.genre||trend(g);mem.preferredGenre=targetGenre;mem.focus=m.type==='trend-bet'?`trend:${targetGenre}`:p.strategy;});a.lastProcessedAbs=abs;try{window.saveCurrent?.(g,true)}catch(e){}try{window.dispatchEvent(new CustomEvent('bols:rival-intelligence',{detail:{moves:out,absWeek:abs}}))}catch(e){}return out;}
function recent(limit=12){const g=state();return(g?.rivalAI?.moves||[]).slice(0,limit)}
function dossier(name){const g=state(),a=ensure(g);return{name,profile:PROFILES[name],memory:a.studios[name],moves:(a.moves||[]).filter(x=>x.studio===name).slice(0,12),playerProfile:a.playerProfile}}
window.BOLSRivalAI={...(window.BOLSRivalAI||{}),run,recent,profiles:PROFILES,dossier,version:2};
window.addEventListener('bols:week-advanced',()=>setTimeout(()=>run(false),140));
window.addEventListener('bols:film-released',()=>setTimeout(()=>run(true),100));
setTimeout(()=>run(false),650);
})();