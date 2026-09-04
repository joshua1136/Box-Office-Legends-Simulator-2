(()=>{
'use strict';
const VERIFIED='2026-09-04';
const F=(id,title,year,role,director,studio,worldwide,budget,imdb)=>({id,title,year,role,director,studio,worldwideBoxOffice:worldwide,budget,imdbRating:imdb,lastVerified:VERIFIED,source:'IMDb + The Numbers',revenueType:'estimated theatrical studio share',estimatedTheatricalRevenue:Math.round(worldwide*0.50)});
const catalog=[
F('leo_titanic','Titanic',1997,'Jack Dawson','James Cameron','20th Century Fox / Paramount',2223048786,200000000,8.0),
F('leo_catch_me','Catch Me If You Can',2002,'Frank Abagnale Jr.','Steven Spielberg','DreamWorks / 20th Century Fox',355612291,52000000,8.1),
F('leo_gangs','Gangs of New York',2002,'Amsterdam Vallon','Martin Scorsese','Miramax',183124621,97000000,7.5),
F('leo_aviator','The Aviator',2004,'Howard Hughes','Martin Scorsese','Miramax',208370892,110000000,7.5),
F('leo_departed','The Departed',2006,'Billy Costigan','Martin Scorsese','Warner Bros.',289660619,90000000,8.5),
F('leo_blood_diamond','Blood Diamond',2006,'Danny Archer','Edward Zwick','Warner Bros.',171377916,100000000,8.0),
F('leo_shutter','Shutter Island',2010,'Teddy Daniels','Martin Scorsese','Paramount',299461782,80000000,8.2),
F('leo_inception','Inception',2010,'Dom Cobb','Christopher Nolan','Warner Bros.',826873382,160000000,8.8),
F('leo_django','Django Unchained',2012,'Calvin J. Candie','Quentin Tarantino','The Weinstein Company',449841566,100000000,8.5),
F('leo_gatsby','The Great Gatsby',2013,'Jay Gatsby','Baz Luhrmann','Warner Bros.',353451361,190000000,7.2),
F('leo_wolf','The Wolf of Wall Street',2013,'Jordan Belfort','Martin Scorsese','Paramount',406878233,100000000,8.2),
F('leo_revenant','The Revenant',2015,'Hugh Glass','Alejandro G. Iñárritu','20th Century Fox',533357197,135000000,8.0),
F('leo_once','Once Upon a Time in Hollywood',2019,'Rick Dalton','Quentin Tarantino','Sony Pictures',377426903,90000000,7.6),
F('leo_dont_look_up','Don’t Look Up',2021,'Dr. Randall Mindy','Adam McKay','Netflix',79186308,75000000,7.1),
F('leo_killers','Killers of the Flower Moon',2023,'Ernest Burkhart','Martin Scorsese','Apple / Paramount',156000000,200000000,7.5),
F('leo_one_battle','One Battle After Another',2025,'Bob Ferguson','Paul Thomas Anderson','Warner Bros.',213118884,140000000,7.6),
F('margot_barbie','Barbie',2023,'Barbie','Greta Gerwig','Warner Bros.',1446480651,145000000,6.8),
F('margot_wolf','The Wolf of Wall Street',2013,'Naomi Lapaglia','Martin Scorsese','Paramount',406878233,100000000,8.2),
F('margot_suicide','Suicide Squad',2016,'Harley Quinn','David Ayer','Warner Bros.',746846894,175000000,5.9),
F('margot_birds','Birds of Prey',2020,'Harley Quinn','Cathy Yan','Warner Bros.',205372791,84500000,6.0),
F('margot_tonya','I, Tonya',2017,'Tonya Harding','Craig Gillespie','Neon',53877919,11000000,7.5),
F('tom_homecoming','Spider-Man: Homecoming',2017,'Peter Parker / Spider-Man','Jon Watts','Sony / Marvel',880166924,175000000,7.4),
F('tom_far_from_home','Spider-Man: Far From Home',2019,'Peter Parker / Spider-Man','Jon Watts','Sony / Marvel',1131927996,160000000,7.4),
F('tom_no_way_home','Spider-Man: No Way Home',2021,'Peter Parker / Spider-Man','Jon Watts','Sony / Marvel',1921760956,200000000,8.2),
F('tom_uncharted','Uncharted',2022,'Nathan Drake','Ruben Fleischer','Sony Pictures',407141258,120000000,6.3),
F('zendaya_greatest','The Greatest Showman',2017,'Anne Wheeler','Michael Gracey','20th Century Fox',459436232,84000000,7.5),
F('zendaya_homecoming','Spider-Man: Homecoming',2017,'Michelle Jones','Jon Watts','Sony / Marvel',880166924,175000000,7.4),
F('zendaya_no_way','Spider-Man: No Way Home',2021,'MJ','Jon Watts','Sony / Marvel',1921760956,200000000,8.2),
F('zendaya_dune','Dune',2021,'Chani','Denis Villeneuve','Warner Bros.',407573775,165000000,8.0),
F('zendaya_dune2','Dune: Part Two',2024,'Chani','Denis Villeneuve','Warner Bros.',714844358,190000000,8.5),
F('zendaya_challengers','Challengers',2024,'Tashi Duncan','Luca Guadagnino','Warner Bros.',94476359,55000000,7.0),
F('florence_little_women','Little Women',2019,'Amy March','Greta Gerwig','Sony Pictures',218000000,40000000,7.8),
F('florence_black_widow','Black Widow',2021,'Yelena Belova','Cate Shortland','Marvel / Disney',379751655,200000000,6.6),
F('florence_opp','Oppenheimer',2023,'Jean Tatlock','Christopher Nolan','Universal',976800000,100000000,8.6),
F('florence_dune2','Dune: Part Two',2024,'Princess Irulan','Denis Villeneuve','Warner Bros.',714844358,190000000,8.5),
F('ryan_barbie','Barbie',2023,'Ken','Greta Gerwig','Warner Bros.',1446480651,145000000,6.8),
F('ryan_lalaland','La La Land',2016,'Sebastian Wilder','Damien Chazelle','Lionsgate',472040000,30000000,8.0),
F('ryan_blade','Blade Runner 2049',2017,'K','Denis Villeneuve','Warner Bros.',267700000,150000000,8.0),
F('ryan_fall_guy','The Fall Guy',2024,'Colt Seavers','David Leitch','Universal',181258000,130000000,6.8),
F('meryl_devil','The Devil Wears Prada',2006,'Miranda Priestly','David Frankel','20th Century Fox',326706115,35000000,6.9),
F('meryl_mamma_mia','Mamma Mia!',2008,'Donna Sheridan','Phyllida Lloyd','Universal',611359307,52000000,6.5),
F('anne_dark_knight','The Dark Knight Rises',2012,'Selina Kyle / Catwoman','Christopher Nolan','Warner Bros.',1081169825,250000000,8.4),
F('anne_les_mis','Les Misérables',2012,'Fantine','Tom Hooper','Universal',441809770,61000000,7.5),
F('anne_interstellar','Interstellar',2014,'Dr. Amelia Brand','Christopher Nolan','Paramount / Warner Bros.',703379260,165000000,8.7),
F('saoirse_lady_bird','Lady Bird',2017,'Christine “Lady Bird” McPherson','Greta Gerwig','A24',79000000,10000000,7.7),
F('saoirse_brooklyn','Brooklyn',2015,'Eilis Lacey','John Crowley','Fox Searchlight',62000000,11000000,7.5),
F('saoirse_little_women','Little Women',2019,'Jo March','Greta Gerwig','Sony Pictures',218000000,40000000,7.8),
F('anya_split','Split',2016,'Casey Cooke','M. Night Shyamalan','Universal',278700000,9000000,7.3),
F('anya_super_mario','The Super Mario Bros. Movie',2023,'Peach','Aaron Horvath / Michael Jelenic','Universal / Nintendo',1361000000,100000000,6.3),
F('anya_furiosa','Furiosa: A Mad Max Saga',2024,'Furiosa','George Miller','Warner Bros.',173800000,168000000,7.5),
F('emma_easy_a','Easy A',2010,'Olive Penderghast','Will Gluck','Screen Gems',75026000,8000000,7.0),
F('emma_amazing','The Amazing Spider-Man',2012,'Gwen Stacy','Marc Webb','Sony Pictures',758700000,230000000,6.9),
F('emma_lalaland','La La Land',2016,'Mia Dolan','Damien Chazelle','Lionsgate',472040000,30000000,8.0),
F('emma_cruella','Cruella',2021,'Cruella de Vil','Craig Gillespie','Disney',233500000,200000000,7.3),
F('viola_fences','Fences',2016,'Rose Lee Maxson','Denzel Washington','Paramount',64000000,24000000,7.2),
F('viola_suicide','Suicide Squad',2016,'Amanda Waller','David Ayer','Warner Bros.',746846894,175000000,5.9),
F('viola_woman_king','The Woman King',2022,'NanIsca','Gina Prince-Bythewood','Sony Pictures',97600000,50000000,6.9),
F('nolan_inception','Inception',2010,'Director','Christopher Nolan','Warner Bros.',826873382,160000000,8.8),
F('nolan_dark_knight','The Dark Knight',2008,'Director','Christopher Nolan','Warner Bros.',1004558444,185000000,9.1),
F('nolan_interstellar','Interstellar',2014,'Director','Christopher Nolan','Paramount / Warner Bros.',703379260,165000000,8.7),
F('nolan_dunkirk','Dunkirk',2017,'Director','Christopher Nolan','Warner Bros.',527016307,100000000,7.8),
F('nolan_tenet','Tenet',2020,'Director','Christopher Nolan','Warner Bros.',365304105,205000000,7.3),
F('gerwig_lady_bird','Lady Bird',2017,'Director','Greta Gerwig','A24',79000000,10000000,7.7),
F('gerwig_little_women','Little Women',2019,'Director','Greta Gerwig','Sony Pictures',218000000,40000000,7.8),
F('gerwig_barbie','Barbie',2023,'Director','Greta Gerwig','Warner Bros.',1446480651,145000000,6.8),
F('villeneuve_arrival','Arrival',2016,'Director','Denis Villeneuve','Paramount',203388186,47000000,7.9),
F('villeneuve_blade','Blade Runner 2049',2017,'Director','Denis Villeneuve','Warner Bros.',267700000,150000000,8.0),
F('villeneuve_dune','Dune',2021,'Director','Denis Villeneuve','Warner Bros.',407573775,165000000,8.0),
F('villeneuve_dune2','Dune: Part Two',2024,'Director','Denis Villeneuve','Warner Bros.',714844358,190000000,8.5),
F('pee_sea_us','Us',2019,'Director','Jordan Peele','Universal',256000000,20000000,6.8),
F('pee_get_out','Get Out',2017,'Director','Jordan Peele','Universal',255407969,4500000,7.7),
F('spiel_jurassic_park','Jurassic Park',1993,'Director','Steven Spielberg','Universal',1046000000,63000000,8.2),
F('spiel_jaws','Jaws',1975,'Director','Steven Spielberg','Universal',476512065,9000000,8.1),
F('scorsese_goodfellas','Goodfellas',1990,'Director','Martin Scorsese','Warner Bros.',46924761,25000000,8.7),
F('scorsese_departed','The Departed',2006,'Director','Martin Scorsese','Warner Bros.',289660619,90000000,8.5),
F('scorsese_wolf','The Wolf of Wall Street',2013,'Director','Martin Scorsese','Paramount',406878233,100000000,8.2),
F('scorsese_killers','Killers of the Flower Moon',2023,'Director','Martin Scorsese','Apple / Paramount',156000000,200000000,7.5)
];
const byId=Object.fromEntries(catalog.map(f=>[f.id,f]));
const aliases={
 'Leonardo DiCaprio':['leo_titanic','leo_catch_me','leo_gangs','leo_aviator','leo_departed','leo_blood_diamond','leo_shutter','leo_inception','leo_django','leo_gatsby','leo_wolf','leo_revenant','leo_once','leo_dont_look_up','leo_killers','leo_one_battle'],
 'Margot Robbie':['margot_barbie','margot_wolf','margot_suicide','margot_birds','margot_tonya'],
 'Tom Holland':['tom_homecoming','tom_far_from_home','tom_no_way_home','tom_uncharted'],
 'Zendaya':['zendaya_greatest','zendaya_homecoming','zendaya_no_way','zendaya_dune','zendaya_dune2','zendaya_challengers'],
 'Florence Pugh':['florence_little_women','florence_black_widow','florence_opp','florence_dune2'],
 'Ryan Gosling':['ryan_barbie','ryan_lalaland','ryan_blade','ryan_fall_guy'],
 'Meryl Streep':['meryl_devil','meryl_mamma_mia'],
 'Anne Hathaway':['anne_dark_knight','anne_les_mis','anne_interstellar'],
 'Saoirse Ronan':['saoirse_lady_bird','saoirse_brooklyn','saoirse_little_women'],
 'Anya Taylor-Joy':['anya_split','anya_super_mario','anya_furiosa'],
 'Emma Stone':['emma_easy_a','emma_amazing','emma_lalaland','emma_cruella'],
 'Viola Davis':['viola_fences','viola_suicide','viola_woman_king'],
 'Christopher Nolan':['nolan_inception','nolan_dark_knight','nolan_interstellar','nolan_dunkirk','nolan_tenet'],
 'Greta Gerwig':['gerwig_lady_bird','gerwig_little_women','gerwig_barbie'],
 'Denis Villeneuve':['villeneuve_arrival','villeneuve_blade','villeneuve_dune','villeneuve_dune2'],
 'Jordan Peele':['pee_get_out','pee_sea_us'],
 'Steven Spielberg':['spiel_jurassic_park','spiel_jaws'],
 'Martin Scorsese':['scorsese_goodfellas','scorsese_departed','scorsese_wolf','scorsese_killers']
};
for(const [name,ids] of Object.entries(aliases)){
 const p=Object.values(window.INDUSTRY_PEOPLE||{}).flat().find(x=>x.name===name);
 if(p){p.realPersonId='person_'+name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');p.realFilmIds=ids;p.source='real-world-reference';}
}
function realFilmsFor(name){const ids=aliases[name]||[];return ids.map(id=>byId[id]).filter(Boolean)}
function matchPeopleCredits(f){const out=[];for(const [name,ids] of Object.entries(aliases))if(ids.includes(f.id))out.push(name);return out}
function renderRealFilmModal(f){
 const old=document.querySelector('.realFilmographyModal');if(old)old.remove();
 const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 const money=n=>n>=1e9?'$'+(n/1e9).toFixed(2)+'B':n>=1e6?'$'+(n/1e6).toFixed(1)+'M':'$'+Math.round(n).toLocaleString();
 const people=matchPeopleCredits(f), studioShare=Math.round(f.estimatedTheatricalRevenue), domesticApprox=Math.round(f.worldwideBoxOffice*.38), internationalApprox=f.worldwideBoxOffice-domesticApprox;
 const e=document.createElement('div');e.className='modal realFilmographyModal';e.innerHTML=`<div class="panel realFilmPanel"><button class="close">×</button><header class="realFilmHero"><div class="realFilmMark">🎬</div><div><small>REAL-WORLD FILM DATABASE · VERIFIED ${f.lastVerified}</small><h2>${esc(f.title)}</h2><p>${f.year} · ${esc(f.studio)} · ${esc(f.director||'—')}</p><div class="realFilmBig">${money(f.worldwideBoxOffice)}</div><span>Reported worldwide theatrical gross</span></div></header><div class="dipKpis"><div><small>WORLDWIDE</small><b>${money(f.worldwideBoxOffice)}</b><span>Lifetime theatrical gross</span></div><div><small>BUDGET</small><b>${money(f.budget)}</b><span>Reported production budget</span></div><div><small>IMDb</small><b>${f.imdbRating.toFixed(1)}/10</b><span>Current rating snapshot</span></div><div><small>EST. THEATRICAL REVENUE</small><b>${money(studioShare)}</b><span>50% reference share · not audited net revenue</span></div></div><section class="dipSection"><div class="dipTitle"><b>FINANCIAL RECORD</b><span>Real-world reference data</span></div><div class="realFilmFinance"><div><small>DOMESTIC · approx.</small><b>${money(domesticApprox)}</b></div><div><small>INTERNATIONAL · approx.</small><b>${money(internationalApprox)}</b></div><div><small>BOX OFFICE / BUDGET</small><b>${(f.worldwideBoxOffice/Math.max(1,f.budget)).toFixed(2)}×</b></div><div><small>DATA SOURCE</small><b>THE NUMBERS</b></div></div></section><section class="dipSection"><div class="dipTitle"><b>CONNECTED TALENT</b><span>Tap a person to return to their career profile</span></div><div class="dfpCast">${people.map(n=>`<button data-real-person="${esc(n)}"><span>${esc(n[0])}</span><div><b>${esc(n)}</b><small>${n==='Leonardo DiCaprio'?'Actor':n==='Christopher Nolan'||n==='Greta Gerwig'||n==='Denis Villeneuve'||n==='Jordan Peele'||n==='Steven Spielberg'||n==='Martin Scorsese'?'Director':'Talent'}</small></div><strong>VIEW →</strong></button>`).join('')}</div></section><section class="dipSection"><div class="dipTitle"><b>DATA NOTE</b><span>How this differs from the simulation</span></div><p class="realDataNote">This is a real-world reference record. Box office and IMDb ratings are kept separate from your save. The revenue figure is a consistent 50% theatrical-share estimate, not a claim of the studio's actual net profit; real film financial statements are generally not public.</p></section><footer class="dipFooter"><button class="menuBtn">CLOSE</button></footer></div>`;
 document.body.appendChild(e);e.querySelector('.close').onclick=()=>e.remove();e.querySelector('.menuBtn').onclick=()=>e.remove();e.querySelectorAll('[data-real-person]').forEach(b=>b.onclick=()=>{e.remove();const p=(window.INDUSTRY_PEOPLE&&Object.values(window.INDUSTRY_PEOPLE).flat().find(x=>x.name===b.dataset.realPerson));if(window.BOLSDeepProfiles?.openTalentProfile)window.BOLSDeepProfiles.openTalentProfile(window.__BOL_STATE__||window.state||window.gameState||{},p)});
}
function careerSnapshot(name,s={}){const real=realFilmsFor(name);const game=[...(s.films||[]),...(s.filmography||[])].filter(f=>f&&[...Object.values(f.crew||{}),(f.characters||[]).map(c=>c.cast)].flat().includes(name));return {real,game};}
function openRealAwareTalentProfile(s,p,contextFilmId=null){
 const name=p?.name||p?.[0]; if(!name)return;
 const real=realFilmsFor(name), game=careerSnapshot(name,s).game;
 const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');
 const money=n=>n>=1e9?'$'+(n/1e9).toFixed(2)+'B':n>=1e6?'$'+(n/1e6).toFixed(1)+'M':n?'$'+Math.round(n).toLocaleString():'$0';
 const talent=Number(p.talent??p[2]??50),pop=Number(p.popularity??p[5]??50),role=p.role||p[1]||'Talent',fee=Number(p.fee??((Number(p[3]||0))*1e6))||0;
 const totalReal=real.reduce((a,f)=>a+f.worldwideBoxOffice,0),avg=real.length?real.reduce((a,f)=>a+f.imdbRating,0)/real.length:0,best=real.slice().sort((a,b)=>b.worldwideBoxOffice-a.worldwideBoxOffice)[0];
 const gameGross=game.reduce((a,f)=>a+Number(f.finalBoxOffice||f.boxOffice||0),0);
 const e=document.createElement('div');e.className='modal deepIndustryModal realAwareTalentModal';
 e.innerHTML=`<div class="panel deepTalentPanel realAwareTalentPanel"><button class="close dipClose">×</button><header class="dipHero"><div class="dipAvatar">${esc(String(name)[0]||'?')}</div><div><small>${esc(role).toUpperCase()} · INDUSTRY TALENT DOSSIER</small><h2>${esc(name)}</h2><p>REAL-WORLD CAREER + YOUR BOLS2 RECORD · Talent ${talent}/100 · Popularity ${pop}/100</p></div></header><div class="dipKpis"><div><small>REAL FILMS</small><b>${real.length}</b><span>Reference filmography</span></div><div><small>REAL BOX OFFICE</small><b>${money(totalReal)}</b><span>Combined reported gross</span></div><div><small>REAL IMDb AVG.</small><b>${avg?avg.toFixed(1)+'/10':'—'}</b><span>Current rating snapshots</span></div><div><small>YOUR FILMS</small><b>${game.length}</b><span>${gameGross?money(gameGross)+' gross':''}</span></div></div><section class="dipSection"><div class="dipTitle"><b>REAL-WORLD CAREER</b><span>Canonical titles · tap any film</span></div><div class="dipFilmList realFilmList">${real.map(f=>`<button class="dipFilmRow realFilmRow" data-real-film="${esc(f.id)}"><span>🎬</span><div><b>${esc(f.title)}</b><small>${f.year} · ${esc(f.role)} · ${money(f.worldwideBoxOffice)} worldwide</small></div><strong>${f.imdbRating.toFixed(1)}</strong></button>`).join('')||'<div class="dipEmpty">No real-world reference titles are loaded for this talent yet.</div>'}</div></section><section class="dipSection"><div class="dipTitle"><b>BEST-KNOWN RECORD</b><span>Career reference</span></div><div class="realCareerHighlight"><div><small>HIGHEST GROSSING</small><b>${esc(best?.title||'—')}</b><span>${best?money(best.worldwideBoxOffice):'—'} worldwide</span></div><div><small>CURRENT MARKET FEE</small><b>${money(fee)}</b><span>Used only for the BOLS2 economy</span></div></div></section><section class="dipSection"><div class="dipTitle"><b>YOUR BOLS2 CAREER</b><span>Only films created in this save</span></div><div class="dipFilmList">${game.map(f=>`<button class="dipFilmRow" data-game-film="${esc(f.id)}"><span>🎬</span><div><b>${esc(f.title||'Untitled Film')}</b><small>${esc(f.genre||'Film')} · ${money(f.finalBoxOffice||f.boxOffice||0)} · ${f.releaseYear||f.year||'Current'}</small></div><strong>YOUR FILM</strong></button>`).join('')||'<div class="dipEmpty">This talent has not appeared in one of your productions yet.</div>'}</div></section><section class="dipSection"><div class="dipTitle"><b>DATA BOUNDARY</b><span>Real vs simulation</span></div><p class="realDataNote">Real-world films, reported box office and IMDb ratings are reference data and never change your save directly. The BOLS2 talent score, fee, availability, contracts and performance multipliers remain simulation systems.</p></section><footer class="dipFooter">${contextFilmId?'<button class="menuBtn primary" id="realHire">🎬 HIRE / VIEW CONTRACT →</button>':''}<button class="menuBtn" id="realClose">CLOSE</button></footer></div>`;
 document.body.appendChild(e);e.querySelector('.dipClose').onclick=()=>e.remove();e.querySelector('#realClose').onclick=()=>e.remove();e.querySelector('#realHire')?.addEventListener('click',()=>{e.remove();const t=[name,role,talent,fee/1e6,p.tier||p[4]||'Established',pop,p.potential||[talent,Math.min(99,talent+20)],p.genres||p[7]||[]];if(window.showTalent){window.__BOLS_REAL_PROFILE_BYPASS=true;try{window.showTalent(s,t,contextFilmId)}finally{window.__BOLS_REAL_PROFILE_BYPASS=false}}});e.querySelectorAll('[data-real-film]').forEach(b=>b.onclick=()=>{const f=byId[b.dataset.realFilm];if(f){e.remove();renderRealFilmModal(f)}});e.querySelectorAll('[data-game-film]').forEach(b=>b.onclick=()=>{const f=[...(s.films||[]),...(s.filmography||[])].find(x=>String(x.id)===String(b.dataset.gameFilm));if(f){e.remove();if(window.showFilmDetails)window.showFilmDetails(s,f)}});
}
window.BOLSRealFilmography={version:1,catalog,realFilmsFor,careerSnapshot,renderRealFilmModal,openRealAwareTalentProfile};
})();