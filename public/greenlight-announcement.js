(()=>{
 const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const money=v=>{const n=Number(v||0);return n>=1e9?`$${(n/1e9).toFixed(1)}B`:n>=1e6?`$${(n/1e6).toFixed(1)}M`:n>=1e3?`$${Math.round(n/1e3)}K`:`$${Math.round(n).toLocaleString()}`};
 const genreIcon={Drama:'🎭',Comedy:'🤡',Action:'💥',Horror:'👻',Romance:'💕',Thriller:'🔪','Sci-Fi':'🚀',Fantasy:'🧙',Animation:'🎨',Adventure:'🧭',Crime:'🕵️'};
 const banks={
  trade:[
   ['FilmScope','The greenlight is official. Early attention is building around the project.'],
   ['The Film Ledger','The studio has committed to the project and production planning now moves forward.'],
   ['ScreenWatch','Industry observers are watching this one closely after today’s announcement.']
  ],
  fans:[
   ['CinemaFan21','WAIT… THIS IS ACTUALLY HAPPENING 😭🎬'],
   ['MovieNight','Okay, I need a trailer immediately.'],
   ['FilmNerd','The studio just made its next big bet. I’m watching.'],
   ['PopcornClub','The poster looks promising. Now give us a release date.'],
   ['ReelTalk','This could either be amazing or completely insane. I’m in.'],
   ['CinemaDaily','The industry is officially talking about this one.'],
   ['FrameByFrame','Interesting choice. The creative team is what has me curious.'],
   ['MovieBuff88','PLEASE don’t rush this. Let them cook.']
  ]
 };
 function pick(arr,seed){return arr[Math.abs(seed)%arr.length]}
 function showGreenlightAnnouncement(state,film,kind='original'){
  const old=document.querySelector('.greenlightAnnouncement');if(old)old.remove();
  const title=film.title||'Untitled Film', genre=film.genre||'Film', icon=genreIcon[genre]||'🎬';
  const chars=Array.isArray(film.characters)?film.characters:[];
  const cast=chars.filter(c=>c.cast).map(c=>c.cast).filter(Boolean);
  const crew=film.crew||{};
  const director=crew.director||'the creative team';
  const buzz=Math.max(1,Math.min(100,Math.round(Number(film.audience||50)*.45+Number(film.quality||50)*.35+Number(state.reputation||35)*.2)));
  const verdict=buzz>=85?'HIGH ANTICIPATION':buzz>=70?'RISING BUZZ':buzz>=50?'EARLY INTEREST':'QUIET ANNOUNCEMENT';
  const seed=Number(film.id||Date.now());
  const trade=banks.trade.map((x,i)=>({source:x[0],text:x[1],time:i?'Moments ago':'Just now'}));
  if(cast.length) trade[1].text=`With ${cast.slice(0,2).join(' and ')} attached, the casting is already giving the project a recognizable face.`;
  else if(director!=='the creative team') trade[1].text=`The return of ${director} is one of the first details drawing industry attention.`;
  const fans=banks.fans.map((x,i)=>({source:x[0],text:x[1]}));
  const e=document.createElement('div');e.className='modal greenlightAnnouncement';
  e.innerHTML=`<div class="glShell">
   <header class="glHeader"><button class="glClose" aria-label="Close">×</button><div><small>STUDIO NEWS · OFFICIAL ANNOUNCEMENT</small><h2>GREENLIGHT</h2></div><span class="glLive">● JUST NOW</span></header>
   <main class="glScroll">
    <section class="glHero">
      <div class="glSignal">✦</div><small>PRODUCTION OFFICIALLY APPROVED</small>
      <h1>IT'S OFFICIAL.</h1>
      <p>${esc(state.studioName||'Your Studio')} has greenlit its next feature film.</p>
      <div class="glFilmCard"><div class="glPoster">${film.poster?.genreEmoji||icon}<b>${esc(title)}</b><span>${esc(film.poster?.tagline||film.storyHook||'A new story begins.')}</span></div><div class="glFilmMeta"><span>${esc(genre)} · ${kind==='sequel'?'SEQUEL':'ORIGINAL'}</span><strong>${esc(title)}</strong><small>${money(film.budget)} production budget</small><div class="glTags"><i>YEAR ${Number(state.year||1)}</i><i>WEEK ${Number(state.week||1)}</i></div></div></div>
    </section>
    <section class="glBuzz"><div><small>INDUSTRY BUZZ</small><strong>${buzz}/100</strong><span>${verdict}</span></div><div class="glBuzzBar"><i style="width:${buzz}%"></i></div><p>${buzz>=80?'The announcement is generating strong early attention.':buzz>=60?'The project is beginning to attract meaningful attention.':'The announcement is being noticed, but the studio still has work to do to build anticipation.'}</p></section>
    <section class="glSection"><div class="glSectionHead"><div><small>📰 TRADE PRESS</small><h3>Industry reaction</h3></div><span>LIVE COVERAGE</span></div>${trade.map((x,i)=>`<article class="glTrade"><div class="glAvatar">${i===0?'▦':'◈'}</div><div><div class="glSource"><b>${esc(x.source)}</b><small>${esc(x.time)}</small></div><p>${esc(x.text)}</p></div></article>`).join('')}</section>
    <section class="glSection"><div class="glSectionHead"><div><small>💬 AUDIENCE REACTION</small><h3>Fans are already talking</h3></div><span>${fans.length} POSTS</span></div><div class="glFanFeed">${fans.map((x,i)=>`<article class="glFan"><div class="glFanAvatar">${['🎬','🍿','🎞️','⭐'][i%4]}</div><div><b>@${esc(x.source)}</b><small>Just now</small><p>${esc(x.text)}</p><footer><span>💬 ${31+(seed+i*17)%190}</span><span>↻ ${72+(seed+i*43)%520}</span><span>♥ ${420+(seed+i*91)%3900}</span></footer></div></article>`).join('')}</div></section>
    <section class="glSection glWhatNext"><small>🎬 WHAT HAPPENS NEXT</small><h3>Production begins now.</h3><div class="glNextGrid"><div><b>01</b><span>Writer's Room</span><small>Develop the screenplay</small></div><div><b>02</b><span>Pre-Production</span><small>Build the production</small></div><div><b>03</b><span>Casting & Crew</span><small>Attach the talent</small></div></div></section>
   </main>
   <footer class="glFooter"><div><small>PROJECT STATUS</small><b>GREENLIT · DEVELOPMENT</b></div><button class="glContinue" id="glContinue">CONTINUE TO DEVELOPMENT →</button></footer>
  </div>`;
  document.body.appendChild(e);
  const close=()=>e.remove();e.querySelector('.glClose').onclick=close;
  e.querySelector('#glContinue').onclick=()=>{e.remove();if(typeof window.showFilmDevelopmentLab==='function')window.showFilmDevelopmentLab(state,film);else if(typeof window.openSection==='function')window.openSection(state,'MOVIES');};
  requestAnimationFrame(()=>e.classList.add('show'));
 }
 window.showGreenlightAnnouncement=showGreenlightAnnouncement;
})();