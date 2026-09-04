/* BOLS2 v385 — category-first interaction layer. */
(function(){
'use strict';
const M={
MOVIES:['🎬','Movies','Build, manage and archive your film slate',[['🎬','Film Slate','Active projects, drafts and movie history.'],['✍️','Development','Create concepts, stories and characters.'],['👥','Casting','Connect characters with talent.'],['📅','Release','Choose strategy, timing and campaign.']]],
MEDIA:['▶️','BOLS Media','Open the complete BOLS Media platform.',[]],
TRENDS:['📈','Market Trends','Read demand before committing money and time',[['🔥','Genre Demand','See which genres are rising or falling.'],['📅','Calendar','Holidays and seasonal opportunities.'],['🌎','Market Health','Understand the wider theatrical market.'],['🎯','Strategy','Use trends to time your releases.']]],
BOXOFFICE:['🍿','Box Office','Track theatrical performance and lifetime results',[['📊','Performance','Weekly grosses and momentum.'],['🌎','Worldwide','Domestic and international results.'],['🏆','Rankings','Compare films by gross.'],['📋','Film Records','Open the complete performance ledger.']]],
STREAMS:['📺','Streaming','Manage the second life of your films',[['📚','Catalog','Films eligible for streaming.'],['🤝','Deals','Platform rights and agreements.'],['⚔️','Bidding','Let platforms compete for your films.'],['📊','Performance','Weekly streams and revenue.']]],
TALENT:['👥','Talent','Build the creative team behind every production',[['🎭','Actors','Stars, rising talent and character casting.'],['🎬','Directors','Creative leadership and style.'],['✍️','Writers','Screenplay and story talent.'],['🎥','Crew','Cinematographers, editors, composers and VFX.']]],
INDUSTRY:['🏭','Industry','Interact with the wider film business',[['🏢','Studios','Study rival studios and their slates.'],['🤝','Deals','Co-production and distribution.'],['💿','IP Market','Acquire fictional properties.'],['💰','Investments','Explore industry investment opportunities.']]],
UPGRADE:['🏗️','Studio Development','Turn cash and management capacity into permanent capabilities',[['🏢','Facilities','Build the physical studio.'],['⚡','Capacity','Increase management Energy.'],['🎥','Departments','Unlock production capabilities.'],['📈','Long Game','Invest now for future efficiency.']]],
FINANCE:['📊','Finance','Control cash, spending, investments and profitability',[['💵','Cash Flow','See what is coming in and going out.'],['🎬','Film Budgets','Track production and marketing spend.'],['🤝','Investments','Manage capital placed in the industry.'],['📈','Performance','Measure profitability and financial health.']]],
NEWS:['📰','Newsroom','Follow the stories shaping your studio and the world',[['🏢','Your Studio','Announcements and studio developments.'],['🎬','Your Films','Stories directly tied to your projects.'],['🌎','World','Industry events and rival activity.'],['🔥','Breaking','Major developments happening now.']]],
STUDIO:['🏢','Your Studio','Shape the company behind your films',[['🎯','Identity','Specialty, reputation and studio profile.'],['🏗️','Development','Facilities and permanent upgrades.'],['🎬','Filmography','Your permanent release history.'],['📜','Legacy','Milestones, relationships and achievements.']]],
FESTIVALS:['🎞️','Film Festivals','Build prestige through the global festival circuit',[['🎞️','Festival Circuit','See upcoming festivals and deadlines.'],['📨','Submissions','Submit eligible films.'],['⭐','Prestige','Track festival reputation gains.'],['🏆','Results','See selections, awards and reactions.']]],
AWARDS:['🏆','Awards','Manage awards season and your studio prestige race',[['📅','Awards Season','Track the current campaign.'],['🎬','Contenders','See your films in the race.'],['🏆','Ceremonies','Nominations and winners.'],['🗄️','Trophy Cabinet','Permanent awards history.']]],
RANKINGS:['🏅','Rankings','See where your studio stands against the industry',[['🏢','Studios','Industry power and prestige.'],['🎬','Films','Top films by performance.'],['💰','Revenue','Commercial leaders.'],['⭐','Prestige','The studios and films everyone is watching.']]]
};
let overlay=null,forwarding=false;
function openDeck(section,target){
const m=M[section];if(!m)return;
if(overlay)overlay.remove();
overlay=document.createElement('div');overlay.className='bolsModuleLauncher';
const cards=m[3].map((x,i)=>'<button class="bolsCategoryCard" data-choice="'+i+'"><span class="bolsCategoryIcon">'+x[0]+'</span><div><b>'+x[1]+'</b><small>'+x[2]+'</small></div><span class="bolsCategoryArrow">›</span></button>').join('');
overlay.innerHTML='<div class="bolsLauncherPanel" role="dialog" aria-modal="true"><header class="bolsLauncherHead"><div class="bolsLauncherIcon">'+m[0]+'</div><div><div class="bolsLauncherKicker">BOLS2 COMMAND DECK · '+section+'</div><h2>'+m[1]+'</h2><p>'+m[2]+'</p></div><button class="bolsLauncherClose" aria-label="Close">×</button></header><div class="bolsLauncherBody"><div class="bolsLauncherHint"><b>What do you want to manage?</b><span>Choose a department to continue</span></div><div class="bolsCategoryGrid">'+cards+'</div></div><footer class="bolsLauncherFooter"><button class="bolsLauncherCloseText">BACK</button></footer></div>';
document.body.appendChild(overlay);
const close=function(){if(overlay){overlay.remove();overlay=null;}};
overlay.querySelector('.bolsLauncherClose').onclick=close;overlay.querySelector('.bolsLauncherCloseText').onclick=close;overlay.addEventListener('click',function(e){if(e.target===overlay)close();});
overlay.querySelectorAll('[data-choice]').forEach(function(btn){btn.onclick=function(ev){ev.preventDefault();ev.stopPropagation();if(window.__BOLS_MEDIA_CATEGORY_HANDLED__){window.__BOLS_MEDIA_CATEGORY_HANDLED__=false;return;}const choice=Number(btn.dataset.choice);if(section==='MEDIA'){const tabs=['channel','videos','community','analytics'];const openMedia=window.openBOLSMedia||window.openMediaCreator;if(typeof openMedia==='function'){openMedia();setTimeout(function(){const modal=document.querySelector('.mediaRebuildModal');const tab=modal&&modal.querySelector('.mrTabs button[data-t="'+tabs[choice]+'"]');if(tab&&typeof tab.onclick==='function')tab.onclick();else if(tab)tab.click();},0);}close();return;}close();forwarding=true;try{target.click();}finally{setTimeout(function(){forwarding=false;},0);}};});
}
function install(){
if(document.__bols385Installed)return;document.__bols385Installed=true;
document.addEventListener('click',function(e){if(forwarding)return;const b=e.target.closest&&e.target.closest('[data-section]');if(!b)return;const s=String(b.dataset.section||'').toUpperCase();if(!M[s])return;e.preventDefault();e.stopImmediatePropagation();const state=window.__BOL_STATE__||window.state||{};if(s==='MEDIA'){const openMedia=window.openBOLSMedia;if(typeof openMedia==='function'){openMedia('home');}return;}if(typeof window.openSection==='function'){window.openSection(state,s);}else{openDeck(s,b);}},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
window.BOLS2_MODULES=M;
})();