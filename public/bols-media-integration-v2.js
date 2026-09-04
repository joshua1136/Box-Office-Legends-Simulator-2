(()=>{
'use strict';
const TAG='BOLS_MEDIA_WORLD_V2';
const CREATOR_PROFILES=[
 {id:'creator-cinemadaily',name:'CinemaDaily',followers:4200000,influence:88,focus:['Action','Adventure','Comedy','Drama'],tone:'mainstream'},
 {id:'creator-filmnerd88',name:'FilmNerd88',followers:1800000,influence:92,focus:['Drama','Thriller','Indie','Prestige'],tone:'cinephile'},
 {id:'creator-movieroom',name:'The Movie Room',followers:3100000,influence:76,focus:['Comedy','Fantasy','Action','Family'],tone:'general'},
 {id:'creator-framebyframe',name:'FrameByFrame',followers:950000,influence:84,focus:['Drama','Indie','Filmmaking'],tone:'craft'},
 {id:'creator-screentalk',name:'ScreenTalk',followers:670000,influence:71,focus:['Action','Comedy','Superhero','Pop Culture'],tone:'pop'},
 {id:'creator-reelreport',name:'The Reel Report',followers:2400000,influence:86,focus:['Drama','Thriller','Industry','Business'],tone:'industry'}
];
const STUDIO_PROFILES=[
 {id:'rival-universal',name:'Universal Pictures',abbr:'UP',genres:['Action','Adventure','Comedy'],media:1.08},
 {id:'rival-warner',name:'Warner Bros. Pictures',abbr:'WB',genres:['Superhero','Drama','Crime'],media:1.05},
 {id:'rival-disney',name:'Disney',abbr:'DS',genres:['Animation','Fantasy','Family'],media:1.02},
 {id:'rival-netflix',name:'Netflix',abbr:'NF',genres:['Drama','Thriller','Comedy'],media:1.16},
 {id:'rival-paramount',name:'Paramount Pictures',abbr:'PP',genres:['Action','Comedy','Drama'],media:1.04},
 {id:'rival-a24',name:'A24',abbr:'A2',genres:['Drama','Horror','Indie'],media:1.12}
];
function root(){
 const c=[window.BOLS2,window.BOLS,window.BOLSGame,window.gameState,window.__BOLS_STATE,window.GAME_STATE,window.state];
 for(const x of c)if(x&&typeof x==='object')return x;
 for(const k of Object.keys(localStorage||{})){
  if(!/bols|boxoffice|game|save/i.test(k))continue;
  try{const x=JSON.parse(localStorage.getItem(k));if(x&&typeof x==='object'&&(x.game||x.films||x.studios))return x}catch(e){}
 }
 return null;
}
function game(r){return r?.game||r?.state?.game||r?.data?.game||r;}
function arr(g,keys){for(const k of keys){if(Array.isArray(g?.[k]))return g[k];}return null;}
function idOf(x){return String(x?.id||x?.filmId||x?.uuid||'');}
function titleOf(x){return x?.title||x?.name||'Untitled Film';}
function weekYear(g){return {week:Number(g?.week||g?.currentWeek||g?.calendar?.week||1),year:Number(g?.year||g?.currentYear||g?.calendar?.year||2026)};}
function abs(g){const w=weekYear(g);return w.year*52+w.week;}
function studios(g){return arr(g,['studios','industryStudios','studioList','rivalStudios'])||[];}
function films(g){return arr(g,['films','movies','filmography','industryFilms','moviesList'])||[];}
function mediaState(){try{return window.BOLSMediaEngine?.state?.()||window.BOLSMediaEngine?.getState?.()||null}catch(e){return null}}
function mediaContent(){const m=mediaState();return m?.content||m?.media?.content||window.state?.media?.content||[]}
function commit(r,g){
 try{if(typeof window.saveGame==='function')window.saveGame();}catch(e){}
 try{if(typeof window.commitState==='function')window.commitState(r);}catch(e){}
 try{if(typeof window.BOLSMediaEngine?.commit==='function')window.BOLSMediaEngine.commit();}catch(e){}
 try{window.dispatchEvent(new CustomEvent('bols:world-sync',{detail:{state:r}}));}catch(e){}
}
function makeFilm(studio,profile,i,g){
 const genres=profile.genres; const genre=genres[i%genres.length];
 const names=['Midnight Protocol','Eclipse Run','The Last Signal','Kingdoms Beyond','After the Fall','Neon Horizon','The Silent House','Final Frontier','Broken Crown','Project Atlas','Shadow District','Wildfire','The Long Game','Starlight','Black Meridian','Second Chances'];
 const title=names[(abs(g)+i*3)%names.length];
 const fid=`${profile.id}-${g.year}-${g.week}-${i}-${title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;
 const budget=(45+((abs(g)+i*17)%14)*10)*1000000;
 return {id:fid,filmId:fid,title,studio:profile.name,studioId:profile.id,genre,budget,quality:55+((abs(g)*7+i*11)%36),audience:55+((abs(g)*5+i*13)%38),starPower:50+((abs(g)*3+i*17)%45),marketingScore:48+((abs(g)*9+i*7)%45),hype:20+((abs(g)*11+i*9)%45),mediaAwareness:0,mediaSentiment:0,boxOffice:0,releaseWeek:((g.week+i*7+13)%52)+1,releaseYear:g.year,status:'upcoming',source:'rival-simulation'};
}
function ensureRivalFilms(g){
 let fs=Array.isArray(g.industryFilms)?g.industryFilms:(Array.isArray(g.industryFilmography)?g.industryFilmography:null);
 if(!fs){fs=[];g.industryFilms=fs;}
 const out=[];
 const existing=new Set(fs.map(idOf).filter(Boolean));
 for(const p of STUDIO_PROFILES){
  const studioMatches=fs.filter(f=>String(f.studioId||'')===p.id||String(f.studio||'').toLowerCase()===p.name.toLowerCase());
  if(studioMatches.length<4){
   for(let i=studioMatches.length;i<4;i++){const f=makeFilm(null,p,i,g);if(existing.has(f.id))continue;fs.push(f);existing.add(f.id);out.push(f);}
  }
  const so=studios(g).find(s=>String(s.id||s.studioId||'')===p.id||String(s.name||s.title||'').toLowerCase()===p.name.toLowerCase());
  if(so){so.films=fs.filter(f=>String(f.studioId||'')===p.id||String(f.studio||'').toLowerCase()===p.name.toLowerCase());so.filmography=so.films;}
 }
 // Expose one canonical industry filmography; BOLS Media references these same objects.
 g.industryFilmography=fs;
 g.rivalFilms=fs.filter(f=>String(f.source||'').startsWith('rival'));
 return out;
}
function canonicalFilm(g,id){const a=Array.isArray(g.industryFilms)?g.industryFilms:[];const b=films(g);return [...a,...b].find(f=>idOf(f)===String(id))||null;}
function attachFilm(c,g){if(!c)return null;const id=c.filmId||c.attachedFilmId; if(!id)return null; const f=canonicalFilm(g,id); if(f){c.filmId=idOf(f);c.filmTitle=titleOf(f);c.studio=f.studio;c.genre=f.genre;} return f;}
function event(g,type,payload){
 g.mediaWorldEvents=Array.isArray(g.mediaWorldEvents)?g.mediaWorldEvents:[];
 const key=type+'|'+String(payload.filmId||payload.contentId||payload.creatorId||'')+'|'+abs(g);
 if(g.mediaWorldEvents.some(e=>e.key===key))return null;
 const e={id:'mwe-'+abs(g)+'-'+g.mediaWorldEvents.length,key,type,week:g.week,year:g.year,abs:abs(g),...payload};
 g.mediaWorldEvents.unshift(e);g.mediaWorldEvents=g.mediaWorldEvents.slice(0,250);return e;
}
function impact(g,c){const f=attachFilm(c,g);if(!f)return;
 const views=Number(c.views||0), likes=Number(c.likes||0), comments=Number(c.comments||0), shares=Number(c.shares||0);
 const engagement=views?Math.min(1,(likes+comments*2+shares*3)/views):0;
 const quality=Math.max(0,Math.min(100,Number(f.quality||60)));
 const base=Math.min(1,views/2500000);
 const sentiment=c.sentiment==='negative'?-1:c.sentiment==='positive'?1:((engagement>.045?1:engagement<.018?-1:0));
 const delta=Math.max(-4,Math.min(6,(base*4)+(quality-60)/35))*sentiment;
 f.mediaAwareness=Math.max(0,Math.min(100,Number(f.mediaAwareness||0)+Math.min(5,base*4)));
 f.mediaSentiment=Math.max(-100,Math.min(100,Number(f.mediaSentiment||0)+delta));
 f.hype=Math.max(0,Math.min(100,Number(f.hype||0)+delta*0.45));
 f.mediaInfluence={awareness:Number(f.mediaAwareness.toFixed(2)),sentiment:Number(f.mediaSentiment.toFixed(2)),lastWeek:g.week,lastYear:g.year};
 if(Math.abs(delta)>=1.5)event(g,'media-impact',{filmId:idOf(f),filmTitle:titleOf(f),delta:Number(delta.toFixed(2))});
}
function creatorReact(g,c){const f=attachFilm(c,g); if(!f)return;
 const m=Number(c.views||0); if(m<350000)return;
 g.creatorReactions=Array.isArray(g.creatorReactions)?g.creatorReactions:[];
 for(const p of CREATOR_PROFILES){
  if(Math.random()>0.13+Math.min(.22,m/10000000))continue;
  if(p.focus.length&&!p.focus.includes(f.genre)&&Math.random()>.25)continue;
  const key=`${p.id}|${idOf(f)}|${abs(g)}`;
  if(g.creatorReactions.some(x=>x.key===key))continue;
  const positive=Number(f.quality||60)>=70&&Number(f.audience||60)>=65;
  const sentiment=positive?'positive':Number(f.quality||60)<55?'negative':'mixed';
  const hook=sentiment==='positive'?`is getting people talking`:(sentiment==='negative'?`is dividing viewers`:`has viewers curious`);
  g.creatorReactions.unshift({key,id:'cr-'+abs(g)+'-'+g.creatorReactions.length,creatorId:p.id,creator:p.name,followers:p.followers,influence:p.influence,sentiment,filmId:idOf(f),filmTitle:titleOf(f),text:`${titleOf(f)} ${hook}.`,views:Math.round(m*(.008+p.influence/10000)),week:g.week,year:g.year});
  event(g,'creator-reaction',{creatorId:p.id,creator:p.name,filmId:idOf(f),filmTitle:titleOf(f),sentiment});
 }
 g.creatorReactions=g.creatorReactions.slice(0,200);
}
function news(g){
 g.mediaNews=Array.isArray(g.mediaNews)?g.mediaNews:[];
 const ev=(g.mediaWorldEvents||[]).filter(e=>e.abs===abs(g));
 for(const e of ev){
  let headline='';let body='';
  if(e.type==='creator-reaction') {headline=`${e.creator} reacts to ${e.filmTitle}`;body=`${e.filmTitle} is drawing attention on BOLS Media.`;}
  if(e.type==='media-impact'&&Math.abs(Number(e.delta))>=2){headline=e.delta>0?`${e.filmTitle} gains momentum across BOLS Media`:`${e.filmTitle} faces a tougher media week`;body=`Audience response is changing the film's media awareness and hype.`;}
  if(!headline)continue;
  const key=headline+'|'+abs(g); if(g.mediaNews.some(n=>n.key===key))continue;
  g.mediaNews.unshift({id:'mn-'+abs(g)+'-'+g.mediaNews.length,key,headline,body,week:g.week,year:g.year,source:'BOLS Media'});
 }
 g.mediaNews=g.mediaNews.slice(0,150);
}
function sync(){const r=root();if(!r)return;const g=game(r);if(!g)return;const wy=weekYear(g);g.bolsMediaWorldVersion=2;g.creatorProfiles=CREATOR_PROFILES;g.rivalStudioProfiles=STUDIO_PROFILES;
 const added=ensureRivalFilms(g); const cs=mediaContent(); if(Array.isArray(cs))cs.forEach(c=>{const f=attachFilm(c,g);if(f){c.industryLinked=true;c.industryFilmId=idOf(f);}});
 if(added.length)added.forEach(f=>event(g,'rival-film-created',{filmId:f.id,filmTitle:f.title,studio:f.studio,genre:f.genre}));
 for(const c of (Array.isArray(cs)?cs:[])){if(Number(c.views||0)>0)impact(g,c);creatorReact(g,c)}
 news(g);g.mediaWorldLastSync={week:wy.week,year:wy.year,timestamp:Date.now()};commit(r,g);
}
window.BOLSMediaWorldSync=sync;
window.BOLSMediaCreators=CREATOR_PROFILES;
window.BOLSMediaRivalStudios=STUDIO_PROFILES;
let last=0;
function safeSync(){const now=Date.now();if(now-last<900)return;last=now;try{sync()}catch(e){console.warn(TAG,e)}}
window.addEventListener('bols:week-advanced',safeSync);
window.addEventListener('bols:media-published',safeSync);
window.addEventListener('bols:film-released',safeSync);
const oldProcess=window.BOLSMediaEngine?.processWeek;
if(oldProcess&&!oldProcess.__worldV2){
 const wrapped=function(...a){const result=oldProcess.apply(this,a);setTimeout(safeSync,0);return result};wrapped.__worldV2=true;window.BOLSMediaEngine.processWeek=wrapped;
}
setTimeout(safeSync,900);
setInterval(()=>{const r=root();const g=game(r);const wy=weekYear(g||{});if(g&&g.mediaWorldLastSync&&(g.mediaWorldLastSync.week!==wy.week||g.mediaWorldLastSync.year!==wy.year))safeSync()},2500);
})();