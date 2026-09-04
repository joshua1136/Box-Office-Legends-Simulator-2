/* BOLS2 INDUSTRY CORE v1
   Canonical industry layer: rival slates become real game film records, with persistent history,
   cross-system links and studio intelligence. This is a progressive layer over the existing game. */
(function(){
'use strict';
const A=window.INDUSTRY_STUDIOS||[];
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,Number(n)||0));
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
const state=()=>window.__BOL_STATE__||window.state||window.gameState||null;
const abs=(g)=>((num(g?.year,1)-1)*52)+num(g?.week,1);
const all=(g)=>{const xs=[...(g?.films||[]),...(g?.filmography||[]),...(g?.industryFilms||[]),...(g?.industryFilmography||[])];const seen=new Set();return xs.filter(f=>f&&f.id&&!seen.has(String(f.id))&&seen.add(String(f.id)))};
function ensure(g){
 g.industry=g.industry||{};
 g.industry.core=g.industry.core||{};
 const c=g.industry.core;
 c.version=1;c.lastSyncAbs=num(c.lastSyncAbs,0);
 c.filmLinks=c.filmLinks||{};c.studioMemory=c.studioMemory||{};c.events=Array.isArray(c.events)?c.events:[];
 A.forEach((s,i)=>{const x=c.studioMemory[s.name]||{};c.studioMemory[s.name]={
   reputation:num(x.reputation,s.reputation||70), strategy:x.strategy||(['blockbuster','franchise','family-event','commercial','prestige','volume','prestige','studio','streaming','genre'][i%10]),
   releases:num(x.releases,0), hits:num(x.hits,0), misses:num(x.misses,0), totalGross:num(x.totalGross,0), totalStreams:num(x.totalStreams,0), mediaReach:num(x.mediaReach,0), momentum:num(x.momentum,50), rivalry:num(x.rivalry,0), lastEvent:x.lastEvent||''
 };});
 return c;
}
function slate(g){
 const year=num(g.year,1);
 try{if(typeof window.ensureRivalSlateYear==='function'){const x=window.ensureRivalSlateYear(g,year)||[];if(x.length)return x;}}catch(e){}
 const existing=Array.isArray(g.industry?.rivalSlate?.[String(year)])?g.industry.rivalSlate[String(year)]:[];
 if(existing.length)return existing;
 // Fallback archive/slate: guarantees every major studio has a visible, persistent filmography
 // even when an older save was created before the rival-slate generator existed.
 g.industry=g.industry||{};g.industry.rivalSlate=g.industry.rivalSlate||{};
 const studios=A.length?A:[];
 const genres=['Action','Drama','Comedy','Thriller','Horror','Romance','Adventure','Fantasy','Family','Sci-Fi'];
 const titleA=['After the Storm','The Last Horizon','Midnight Run','Golden Hour','The Long Way Home','City of Ash','North Star','Second Chances','Empire of Dust','Paper Kingdom','The Outsiders','Silent Echo','Red Meridian','Summer Lights','Black River','Open Sky','Final Chapter','Wild Hearts','Deep Blue','The Crossing'];
 const titleB=['Legacy','Protocol','Hearts','Frontier','Signal','Kingdom','Promise','Velocity','Shadow','Fire','Dreams','Origins','Destiny','Awakening','Paradise','Reckoning','Gravity','Pursuit','Voyage','Fate'];
 const hash=s=>{let h=2166136261;for(let i=0;i<String(s).length;i++){h^=String(s).charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
 const generated=[];
 studios.forEach((studio,si)=>{for(let i=0;i<20;i++){const h=hash(`${studio.name}|${year}|${i}`),genre=genres[(h+si)%genres.length],week=1+(h%52),strength=Math.max(58,Math.min(92,Number(studio.reputation||70)+(h%17)-8)),scale=strength>=82?'major':strength>=70?'wide':'limited';generated.push({id:`rival-${studio.name.replace(/[^a-z0-9]/gi,'').toLowerCase()}-${year}-${String(i+1).padStart(2,'0')}`,title:`${titleA[(h+i)%titleA.length]}: ${titleB[(h>>3)%titleB.length]}`,studio:studio.name,studioId:studio.id||studio.name,studioType:studio.type||'Major Studio',genre,scale,strength,quality:Math.min(95,strength+(h%9)-4),audience:Math.min(95,strength+(h%13)-6),starPower:Math.min(95,strength+(h%15)-7),marketingScore:Math.min(95,strength+(h%11)-5),hype:35+(h%25),buzz:Math.min(95,strength+(h%17)-8),budget:Math.round((scale==='major'?120:scale==='wide'?65:25)*(0.85+(h%31)/100)*1e6),marketingBudget:Math.round((scale==='major'?35:scale==='wide'?18:7)*(0.85+(h%21)/100)*1e6),releaseWeek:week,releaseYear:year,status:week<=Number(g.week||1)?'released':'scheduled',source:'fallback-industry-archive'});}});
 g.industry.rivalSlate[String(year)]=generated;return generated;
}
function ensureCollections(g){
 if(!Array.isArray(g.industryFilms))g.industryFilms=[];
 g.industryFilmography=g.industryFilms;
 g.industry.rivalResults=g.industry.rivalResults||{};
 return g.industryFilms;
}
function canonicalize(g){
 const c=ensure(g),fs=ensureCollections(g),byId=new Map(fs.map(f=>[String(f.id),f])),s=slate(g),events=[];
 s.forEach(r=>{
   const id=String(r.id),result=g.industry.rivalResults[id]||{};
   let f=byId.get(id);
   if(!f){
     f={id,filmId:id,title:r.title,studio:r.studio,studioName:r.studio,studioId:r.studioId||r.studio,productionStudio:r.studio,industryStudio:r.studio,
       studioType:r.studioType,genre:r.genre,scale:r.scale,strength:num(r.strength,70),quality:clamp(r.quality,r.strength||70),audience:clamp(r.audience,r.strength||70),
       starPower:clamp(r.starPower,r.strength||70),marketingScore:clamp(r.marketingScore,r.strength||70),hype:clamp(r.hype,35),buzz:clamp(r.buzz,r.strength||70),
       budget:num(r.budget,Math.max(15000000,num(r.strength,70)*1500000)),marketingBudget:num(r.marketingBudget,0),releaseWeek:num(r.releaseWeek,1),releaseYear:num(r.releaseYear,g.year),
       status:r.status||'scheduled',stage:r.status==='released'?'released':'marketing',isRival:true,rivalStudio:r.studio,source:'canonical-industry',history:[],industry:{media:{awareness:0,sentiment:0,totalReach:0,weeklyHistory:{}}}
     };
     fs.push(f);byId.set(id,f);events.push({type:'film-created',filmId:id,studio:r.studio,title:r.title});
   }
   Object.assign(f,{title:r.title,studio:r.studio,studioName:r.studio,studioId:r.studioId||f.studioId,genre:r.genre,scale:r.scale,strength:num(r.strength,f.strength||70),releaseWeek:num(r.releaseWeek,f.releaseWeek||1),releaseYear:num(r.releaseYear,f.releaseYear||g.year),rivalStudio:r.studio,isRival:true});
   if(result&&Object.keys(result).length){
     ['budget','quality','audience','starPower','marketingScore','hype','boxOffice','finalBoxOffice','prestige','totalStreams','openingScore','legs','outcome'].forEach(k=>{if(result[k]!==undefined)f[k]=result[k]});
     if(Array.isArray(result.weeklyBoxOffice))f.weeklyBoxOffice=result.weeklyBoxOffice;
     if(result.released)f.status='released',f.stage='released';
     if(result.ended)f.status='completed',f.stage='completed',f.theatricalRunStatus='ended';
   }
   f.industry=f.industry||{};f.industry.media=f.industry.media||{};f.industry.business=f.industry.business||{};f.industry.business.canonical=true;f.industry.business.studio=r.studio;f.industry.business.source='rival-slate';
   f.history=Array.isArray(f.history)?f.history:[];
   const key=`${id}|${f.status}|${f.releaseWeek}`;
   if(!f._industryHistoryKeys)Object.defineProperty(f,'_industryHistoryKeys',{value:{},enumerable:false,writable:true});
   if(!f._industryHistoryKeys[key]){f._industryHistoryKeys[key]=1;f.history.push({week:g.week,year:g.year,event:`Industry record synchronized · ${f.status||'scheduled'}`,detail:`${f.studio} · ${f.genre} · Release Week ${f.releaseWeek}.`});}
   c.filmLinks[id]={filmId:id,studio:f.studio,title:f.title,releaseWeek:f.releaseWeek,releaseYear:f.releaseYear,canonical:true};
 });
 g.rivalFilms=fs.filter(f=>f.isRival);return {created:events,films:fs};
}
function refreshMetrics(g){
 const c=ensure(g),fs=ensureCollections(g),year=num(g.year,1),current=fs.filter(f=>num(f.releaseYear,year)===year);
 const media={};
 try{const md=window.BOLSMediaEngine?.read?.()||window.BOLSMediaEngine?.state?.();if(md?.content)md.content.forEach(x=>{const s=x.studio||x.rivalStudio;if(s)media[s]=(media[s]||0)+num(x.views,0)})}catch(e){}
 A.forEach(s=>{
   const mem=c.studioMemory[s.name],own=current.filter(f=>f.studio===s.name),released=own.filter(f=>num(f.boxOffice||f.finalBoxOffice)>0||f.status==='released'||f.stage==='released'||f.stage==='completed');
   const gross=released.reduce((n,f)=>n+num(f.finalBoxOffice||f.boxOffice),0),streams=released.reduce((n,f)=>n+num(f.totalStreams||f.streams||f.industry?.streaming?.views),0);
   const hits=released.filter(f=>num(f.finalBoxOffice||f.boxOffice)>=Math.max(1,num(f.budget)*2)).length;
   const misses=released.filter(f=>num(f.finalBoxOffice||f.boxOffice)>0&&num(f.finalBoxOffice||f.boxOffice)<Math.max(1,num(f.budget))).length;
   mem.releases=own.length;mem.hits=hits;mem.misses=misses;mem.totalGross=gross;mem.totalStreams=streams;mem.mediaReach=num(media[s.name],0);mem.momentum=clamp(50+(hits*8)-(misses*7)+Math.min(18,num(s.reputation,70)-70));
   mem.rivalry=clamp(mem.rivalry+(current.some(f=>f.industry?.media?.counterTarget)?1:0));
 });
 g.industry.marketPulse={week:g.week,year:g.year,updatedAbs:abs(g),studios:c.studioMemory};
}
function sync(force){const g=state();if(!g)return null;const c=ensure(g),a=canonicalize(g);refreshMetrics(g);c.lastSyncAbs=abs(g);g.industry.core.lastCanonicalFilmCount=a.films.length;
 try{window.saveCurrent?.(g,true)}catch(e){}
 try{window.dispatchEvent(new CustomEvent('bols:industry-core-synced',{detail:{created:a.created,filmCount:a.films.length}}))}catch(e){}
 return a;
}
function studioFilms(name,year){const g=state();if(!g)return[];canonicalize(g);return ensureCollections(g).filter(f=>f.isRival&&f.studio===name&&(!year||num(f.releaseYear)===num(year))).sort((a,b)=>num(a.releaseWeek)-num(b.releaseWeek));}
function dossier(name){const g=state();if(!g)return null;const c=ensure(g),mem=c.studioMemory[name]||{},films=studioFilms(name,g.year);return{name,memory:mem,films,upcoming:films.filter(f=>num(f.releaseWeek)>num(g.week)),released:films.filter(f=>num(f.releaseWeek)<=num(g.week))};}
function enhanceModal(modal){
 if(!modal||modal.dataset.industryCore==='1')return;const h=modal.querySelector('.rivalStudioHero');if(!h)return;const name=(h.querySelector('h2')?.textContent||'').trim();if(!name)return;const d=dossier(name);if(!d)return;modal.dataset.industryCore='1';
 const old=modal.querySelector('.industryCoreLedger');if(old)old.remove();
 const ledger=document.createElement('section');ledger.className='industryCoreLedger';
 const released=d.released.filter(f=>num(f.boxOffice||f.finalBoxOffice)>0),gross=released.reduce((n,f)=>n+num(f.finalBoxOffice||f.boxOffice),0),hits=released.filter(f=>num(f.finalBoxOffice||f.boxOffice)>=Math.max(1,num(f.budget)*2)).length;
 ledger.innerHTML=`<div class="industryCoreKicker">CANONICAL INDUSTRY RECORD · LIVE SAVE DATA</div><div class="industryCoreGrid"><div><small>SLATE</small><b>${d.films.length}</b><span>films in ${g.year}</span></div><div><small>RELEASED</small><b>${released.length}</b><span>performance tracked</span></div><div><small>BOX OFFICE</small><b>${fmt(gross)}</b><span>tracked gross</span></div><div><small>HITS</small><b>${hits}</b><span>2× budget or better</span></div></div><div class="industryCoreSub"><b>FILMOGRAPHY IS LIVE</b><span>Every title below is the same canonical rival film record used by BOLS Media, Rankings, Box Office and the industry's release calendar.</span></div>`;
 const metrics=modal.querySelector('.rivalStudioMetrics');if(metrics)metrics.after(ledger);else h.after(ledger);
 const list=modal.querySelector('.rivalFilmography');if(list){list.innerHTML=d.films.slice(-20).reverse().map(f=>{const gross=num(f.finalBoxOffice||f.boxOffice);const status=f.stage==='completed'||f.theatricalRunStatus==='ended'?'ARCHIVED':gross>0||f.stage==='released'?'IN THEATERS':num(f.releaseWeek)>num(g.week)?'UPCOMING':'RELEASED';return `<button type="button" class="rivalFilmRow industryCanonicalFilm" data-core-film="${esc(f.id)}"><div class="rivalFilmPoster">${esc((window.GENRE_EMOJIS||{})[f.genre]||'🎬')}</div><div><b>${esc(f.title)}</b><small>W${num(f.releaseWeek)} · ${esc(f.genre)} · ${esc(f.scale||'major').toUpperCase()} · ${gross?fmt(gross):'—'}</small></div><strong>${status}</strong></button>`}).join('')||'<div class="sectionEmpty"><b>No films on the current slate.</b><span>The rival will generate new projects as the industry advances.</span></div>';}
}
function fmt(n){n=num(n);return n>=1e9?'$'+(n/1e9).toFixed(2)+'B':n>=1e6?'$'+(n/1e6).toFixed(1)+'M':n?'$'+Math.round(n).toLocaleString():'$0';}
let booted=false;function boot(){if(booted)return;booted=true;sync(true);
 document.addEventListener('click',e=>{const btn=e.target.closest?.('[data-industry-studio]');if(!btn)return;setTimeout(()=>enhanceModal(document.querySelector('.industryStudioModal')),70)},true);
 const obs=new MutationObserver(()=>{const m=document.querySelector('.industryStudioModal');if(m)enhanceModal(m)});obs.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('bols:week-advanced',()=>setTimeout(()=>sync(false),120));
 window.addEventListener('bols:film-released',()=>setTimeout(()=>sync(true),100));
 window.addEventListener('bols:rival-intelligence',()=>setTimeout(()=>sync(true),80));
}
window.BOLSIndustryCore={version:1,sync,studioFilms,dossier,canonicalize,refreshMetrics};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,80);
})();