(()=>{'use strict';
const KEY='bols2_onboarding_v1';
const get=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
const set=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}};
let active=null;
const remove=()=>{active?.remove();active=null;document.querySelector('.bolsTutorialSpotlight')?.remove();document.body.classList.remove('bolsTutorialOpen')};
const cinematic=(studio,onDone)=>{
 const e=document.createElement('div');e.className='bolsOriginCinematic';e.innerHTML='<div class="originGrain"></div><div class="originVignette"></div><div class="originLogoMark">✦</div><div class="originLine" aria-live="polite"></div><button class="originSkip">SKIP INTRO</button>';document.body.appendChild(e);active=e;
 const lines=[
  ['THEY SAID YOU WOULDN’T MAKE IT.',2100],
  ['THEY SAID THE INDUSTRY HAD NO ROOM FOR YOU.',2200],
  ['THEY SAID YOUR STUDIO WOULD DISAPPEAR BEFORE ITS FIRST FILM.',2500],
  ['BUT YOU DIDN’T COME HERE TO LISTEN.',2200],
  ['YOU CAME HERE TO MAKE MOVIES.',2300],
  ['WELCOME TO THE INDUSTRY, '+String(studio||'YOUR STUDIO').toUpperCase()+'.',2600],
  ['YOUR STORY STARTS NOW.',1900]
 ];
 let i=0,dead=false;
 const finish=()=>{if(dead)return;dead=true;remove();onDone?.()};
 const show=()=>{if(i>=lines.length)return finish();const n=e.querySelector('.originLine');n.classList.remove('show');setTimeout(()=>{n.textContent=lines[i][0];n.classList.add('show');const wait=lines[i][1];i++;setTimeout(show,wait)},180)};
 e.querySelector('.originSkip').onclick=finish;show();
};
const coach=(state)=>{
 remove();document.body.classList.add('bolsTutorialOpen');
 const e=document.createElement('div');e.className='bolsTutorialCoach';e.innerHTML='<div class="tutorialTop"><div><small>BOX OFFICE LEGENDS · FIRST CAREER</small><b id="tutStep">01 / 07</b></div><button id="tutSkip">SKIP TUTORIAL</button></div><div class="tutorialCard"><div class="tutorialIcon" id="tutIcon">🎬</div><div><small id="tutKicker">YOUR FIRST WEEK</small><h2 id="tutTitle"></h2><p id="tutBody"></p></div></div><div class="tutorialFooter"><span id="tutHint">FOLLOW THE GUIDE</span><button id="tutAction">CONTINUE →</button></div>';document.body.appendChild(e);active=e;
 const spotlight=document.createElement('div');spotlight.className='bolsTutorialSpotlight';document.body.appendChild(spotlight);
 const steps=[
  {k:'WELCOME',i:'🎬',t:'Welcome to the industry.',b:'This is your studio. You will build films, manage money, hire talent, compete with rivals and shape your own career.',sel:'.dashHeader',action:'GOT IT →'},
  {k:'YOUR STUDIO',i:'💰',t:'Watch these numbers.',b:'Cash funds your decisions. Energy limits what you can do this week. Reputation reflects your standing. The week tells you when the industry moves.',sel:'.dashStats',action:'SHOW ME THE MOVIE'},
  {k:'DEVELOPMENT',i:'💡',t:'Every studio starts with a story.',b:'Your films begin in the Development Lab. Ideas become characters, pitches and scripts before they become productions.',sel:'.dashCard.projects .projectBtn',action:'OPEN DEVELOPMENT LAB',clickTarget:true},
  {k:'THE FILM PATH',i:'🎞️',t:'One project. Four stages.',b:'IDEA → SHAPE → PITCH → SCRIPT. The Lab guides you through each stage. Your choices change the same connected movie.',sel:'.udlStages',action:'I UNDERSTAND'},
  {k:'THE INDUSTRY MOVES',i:'📅',t:'BOLS2 runs week by week.',b:'After you make decisions, advance the week. Productions progress, money moves, rivals act and the industry can react.',sel:'#next',action:'SHOW ME NEXT WEEK',clickTarget:true},
  {k:'WEEKLY REPORT',i:'📊',t:'Read what happened.',b:'The Weekly Report turns the simulation into a clear story: cash, net result, production, streaming and industry activity. Review it before continuing.',sel:'.sr3-shell,.studioReportPanel,.sr2-backdrop',action:'CONTINUE →'},
  {k:'YOU’RE READY',i:'⭐',t:'Now the career is yours.',b:'You know the core loop: make decisions → advance the week → read the report → react to the industry. Advanced systems will teach themselves as you encounter them.',sel:'.dashGrid',action:'START MY CAREER'}
 ];
 let idx=0;
 const target=()=>{const sels=steps[idx].sel.split(',');for(const s of sels){const n=document.querySelector(s);if(n&&getComputedStyle(n).display!=='none')return n}return null};
 const place=()=>{const n=target();if(!n)return;const r=n.getBoundingClientRect();spotlight.style.setProperty('--x',r.left+'px');spotlight.style.setProperty('--y',r.top+'px');spotlight.style.setProperty('--w',r.width+'px');spotlight.style.setProperty('--h',r.height+'px')};
 const render=()=>{const s=steps[idx];e.querySelector('#tutStep').textContent=String(idx+1).padStart(2,'0')+' / '+steps.length;e.querySelector('#tutIcon').textContent=s.i;e.querySelector('#tutKicker').textContent=s.k;e.querySelector('#tutTitle').textContent=s.t;e.querySelector('#tutBody').textContent=s.b;e.querySelector('#tutAction').textContent=s.action;requestAnimationFrame(place)};
 const advance=()=>{if(idx===2){document.querySelector('.projectBtn')?.click();idx=3;setTimeout(render,450);return}if(idx===4){document.querySelector('#next')?.click();idx=5;setTimeout(render,900);return}if(idx===5&&!target()){idx=6;render();return}if(idx<steps.length-1){idx++;render();}else{set({version:1,completed:true,studio:state.studioName,completedAt:new Date().toISOString()});remove();state.onboarding={version:1,complete:true};try{window.saveCurrent?.(state,true)}catch{}window.start?.(state);}};
 e.querySelector('#tutAction').onclick=advance;
 e.querySelector('#tutSkip').onclick=()=>{set({version:1,completed:true,skipped:true,studio:state.studioName,completedAt:new Date().toISOString()});remove();state.onboarding={version:1,complete:true};try{window.saveCurrent?.(state,true)}catch{}window.start?.(state)};
 const observer=new MutationObserver(()=>{if(idx===3&&document.querySelector('.developmentLabModal'))place();if(idx===5&&document.querySelector('.sr3-shell,.studioReportPanel,.sr2-backdrop'))render()});observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('resize',place,{passive:true});
 render();
};
window.BOLS2Onboarding={start:(state)=>{if(!state||state.onboarding?.complete)return;if(get().completed)return;cinematic(state.studioName,()=>coach(state))},reset:()=>{localStorage.removeItem(KEY)}};
})();