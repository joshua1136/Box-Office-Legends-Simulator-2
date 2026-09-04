(()=>{'use strict';
/* BOLS Media Integration v1 — shared world bridge. No fake display-only film records. */
const S=()=>window.__BOL_STATE__||window.state||{};
const abs=s=>((Number(s?.year||1)-1)*52)+Number(s?.week||1);
const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
const studios=()=>Array.isArray(window.INDUSTRY_STUDIOS)?window.INDUSTRY_STUDIOS:[];
const creators=[
 {name:'CinemaDaily',followers:4200000,influence:88,style:'mainstream'},
 {name:'FilmNerd88',followers:1800000,influence:92,style:'cinephile'},
 {name:'The Movie Room',followers:3100000,influence:76,style:'general'},
 {name:'FrameByFrame',followers:950000,influence:84,style:'craft'},
 {name:'ScreenTalk',followers:670000,influence:71,style:'pop culture'},
 {name:'The Reel Report',followers:2400000,influence:86,style:'industry'}
];
const genres=['Action','Adventure','Drama','Comedy','Thriller','Horror','Sci-Fi','Fantasy','Animation','Crime','Romance'];
const names=['The Last Horizon','Midnight Protocol','Kingdom of Ash','After the Silence','Neon Run','The Last Witness','City of Glass','Black Tide','Starfall','The Final Signal','Broken Summer','Echoes of Tomorrow','Night Shift','The Outsider','Empire of Dust','Wildfire','Paper Kingdom','The Long Way Home','Shadow Line','Parallel Worlds'];
const pick=(a,n)=>a[Math.abs(Number(n)||0)%a.length];
function allFilms(s){return [...(s.films||[]),...(s.filmography||[])].filter((f,i,a)=>f&&f.title&&a.findIndex(x=>String(x.id)===String(f.id))===i)}
function rivalFilmCount(s,studio){return allFilms(s).filter(f=>String(f.studio||f.productionStudio||f.industryStudio||'')===String(studio)).length}
/* RETIRED: this legacy media bridge used to manufacture rival films directly inside the player's filmography. Rival films now belong exclusively to the canonical industry/rival-production collection. */
function makeRivalFilms(s){return false}
function purgeLegacyRivalFilms(s){
 s.filmography=Array.isArray(s.filmography)?s.filmography:[];
 const rivalNames=new Set(studios().map(x=>String(x?.name||'').trim().toLowerCase()).filter(Boolean));
 const before=s.filmography.length;
 s.filmography=s.filmography.filter(f=>{
   const studio=String(f?.studio||f?.productionStudio||f?.industryStudio||'').trim().toLowerCase();
   const id=String(f?.id||'').toLowerCase();
   return !(f?.isRival===true||f?.rivalStudio===true||id.startsWith('rival-')||(studio&&rivalNames.has(studio)));
 });
 return s.filmography.length!==before;
}
function ensureMediaRecord(d,f,now){const existing=(d.content||[]).find(c=>String(c.filmId)===String(f.id)&&c.autoIndustryContent);if(existing)return false;d.content.unshift({id:`industry-content-${f.id}`,kind:'video',type:'Official Trailer',title:`${f.title} — Official Trailer`,description:`${f.studio} unveils the first look at ${f.title}.`,text:`${f.studio} unveils the first look at ${f.title}.`,studio:f.studio,filmId:f.id,filmTitle:f.title,genre:f.genre,createdAbs:Math.max(1,now-3),createdWeek:((Math.max(1,now-3)-1)%52)+1,createdYear:Math.floor((Math.max(1,now-4)-1)/52)+1,status:'PUBLISHED',views:0,likes:0,comments:0,shares:0,saves:0,weeklyHistory:{},sentiment:0,creatorCoverage:[],autoIndustryContent:true});return true}
function sync(){const s=S();if(!s||!s.studioName)return;const d=window.BOLSMediaEngine?.read?.();if(!d)return;d.content=Array.isArray(d.content)?d.content:[];d.game=d.game||{};d.game.integration=d.game.integration||{};const now=abs(s);let changed=purgeLegacyRivalFilms(s);const films=allFilms(s);films.filter(f=>f.isRival||f.rivalStudio).slice(-80).forEach(f=>{if(ensureMediaRecord(d,f,now))changed=true});
 /* Existing synthetic display records are converted into real-world references when a matching game film exists. */
 d.content.forEach(c=>{if(!c.filmId||c.autoIndustryContent)return;const f=films.find(x=>String(x.id)===String(c.filmId));if(f&&c.studio!==f.studio){c.studio=f.studio;c.filmTitle=f.title;c.genre=f.genre;changed=true}});
 if(changed){s.films=s.films||[];d.game.integration.lastSyncAbs=now;window.BOLSMediaEngine.commit(d);try{window.saveCurrent?.(s,true)}catch{}}
}
function applyMediaImpact(){const s=S();const E=window.BOLSMediaEngine;if(!s||!E)return;const d=E.read();const now=abs(s);if(Number(d.game.integration?.lastImpactAbs||0)>=now)return;let changed=false;allFilms(s).forEach(f=>{const m=f.industry?.media;if(!m)return;const weekly=Number(m.weeklyHistory?.[String(now)]||0);const total=Number(m.totalReach||0);const views=Math.max(0,weekly||Math.round(total*.06));if(!views)return;const audience=Math.min(100,Math.log10(views+10)*10);const sentiment=Number(m.mediaSentiment||0);const awareness=Math.min(15,Math.max(-10,(audience-45)*.18));const sentimentBoost=Math.max(-5,Math.min(5,sentiment*1.8));const hypeBefore=Number(f.hype??f.marketingHype??50);const hypeAfter=Math.max(0,Math.min(100,hypeBefore+awareness*.12+sentimentBoost*.08));if(Math.abs(hypeAfter-hypeBefore)>.01){f.hype=Number(hypeAfter.toFixed(2));f.marketingHype=f.hype;changed=true}f.industry.media.awarenessBonus=Number((awareness+sentimentBoost*.25).toFixed(2));f.industry.media.lastImpactAbs=now;});d.game.integration.lastImpactAbs=now;if(changed){E.commit(d);try{window.saveCurrent?.(s,true)}catch{}}}
function generateNews(){const s=S();if(!s)return;const now=abs(s);s.news=Array.isArray(s.news)?s.news:[];s.gameEvents=Array.isArray(s.gameEvents)?s.gameEvents:[];s._mediaIntegration=s._mediaIntegration||{};if(Number(s._mediaIntegration.newsAbs||0)>=now)return;const films=allFilms(s),d=window.BOLSMediaEngine?.read?.();if(!d)return;const recent=d.content.filter(c=>Number(c.createdAbs||0)<=now&&Number(c.createdAbs||0)>now-2&&c.autoIndustryContent);recent.slice(0,4).forEach(c=>{if(s.news.some(n=>n.mediaContentId===c.id))return;s.news.unshift({week:s.week,year:s.year,type:'media',mediaContentId:c.id,title:`📺 ${c.studio}: ${c.title}`,body:`${c.studio}'s latest film campaign is gaining attention across BOLS Media.`,filmId:c.filmId});});
 const hot=films.map(f=>({f,reach:Number(f.industry?.media?.weeklyHistory?.[String(now)]||0)})).filter(x=>x.reach>100000).sort((a,b)=>b.reach-a.reach).slice(0,3);hot.forEach(({f,reach})=>{const cr=pick(creators,now+String(f.id).length);const sentiment=Number(f.industry?.media?.mediaSentiment||0);if(s.news.some(n=>n.mediaReactionKey===`${f.id}-${now}`))return;s.news.unshift({week:s.week,year:s.year,type:'creator',mediaReactionKey:`${f.id}-${now}`,filmId:f.id,title:`🎥 ${cr.name} reacts to ${f.title}`,body:`${cr.name} is discussing ${f.title} with ${cr.followers.toLocaleString()} followers. The reaction is ${sentiment>=0?'favorable':'critical'}, adding to the film's media momentum.`});});
 if(s.news.length>250)s.news=s.news.slice(0,250);s._mediaIntegration.newsAbs=now;try{window.saveCurrent?.(s,true)}catch{}}
function tick(){try{sync();applyMediaImpact();generateNews()}catch(e){console.warn('BOLS Media integration:',e)}}
window.BOLSMediaIntegration={version:1,sync,tick,applyMediaImpact,generateNews,creators};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(tick,500));else setTimeout(tick,500);
setTimeout(tick,1800);
})();