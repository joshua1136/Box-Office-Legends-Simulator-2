/* BOLS MEDIA — Creator Network v364 */
(function(){
  function mount(){
    if(document.getElementById('media-creators-root')) return;
    const host=document.querySelector('[data-media-creators]')||document.querySelector('#mediaHub')||document.body;
    const root=document.createElement('section'); root.id='media-creators-root'; root.hidden=true;
    root.innerHTML=`<div class="creator-screen">
      <div class="creator-top"><button class="creator-back" aria-label="Back">‹</button><div><div class="creator-title">Creator Network</div><div class="creator-sub">What the film world is talking about</div></div></div>
      <div class="creator-tabs"><button class="creator-tab active" data-ct="reactions">Reactions</button><button class="creator-tab" data-ct="trending">Trending</button><button class="creator-tab" data-ct="creators">Creators</button><button class="creator-tab" data-ct="predictions">Predictions</button></div>
      <div id="creator-content"></div>
    </div>`;
    host.appendChild(root);
    const content=root.querySelector('#creator-content');
    const creators=[['FilmScope','8.2M subscribers','🎬','Film reactions · Analysis','92'],['Mia Reviews','2.4M subscribers','🎞️','Reviews · First reactions','81'],['The Cinema Room','680K subscribers','🎥','Cinematography · Awards','95'],['Popcorn Daily','14.6M subscribers','🍿','Entertainment · News','76']];
    function render(type){
      if(type==='creators'){content.innerHTML='<div class="creator-hero"><div class="creator-hero-kicker">BOLS Creators</div><h2>People shaping the conversation</h2><p>Creators discover trailers, films and industry news, then decide what deserves their audience.</p></div><div class="creator-section"><div class="creator-section-head"><h3>Top Creators</h3><span>BY INFLUENCE</span></div>'+creators.map(c=>`<div class="creator-card"><div class="creator-avatar">${c[2]}</div><div class="creator-info"><div class="creator-name">${c[0]}</div><div class="creator-meta">${c[1]}</div><div class="creator-badge">Influence ${c[4]}/100 · ${c[3]}</div></div><button class="creator-action" data-follow="${c[0]}">FOLLOW</button></div>`).join('')+'</div>'}
      else if(type==='predictions'){content.innerHTML='<div class="creator-hero"><div class="creator-hero-kicker">Creator Predictions</div><h2>What do they think will happen?</h2><p>Creators can predict opening weekends, worldwide grosses and awards prospects. Accuracy builds their credibility.</p></div><div class="reaction-card"><div class="reaction-body"><div class="reaction-title">The Last Signal — Opening Weekend</div><div class="reaction-by">FilmScope · Prediction</div><div class="reaction-stats"><span>💰 $68M</span><span>🎯 87% confidence</span></div><div class="sentiment"><i style="width:87%"></i></div></div></div><div class="reaction-card"><div class="reaction-body"><div class="reaction-title">The Last Signal — Worldwide</div><div class="reaction-by">The Cinema Room · Prediction</div><div class="reaction-stats"><span>🌎 $420M</span><span>🎯 72% confidence</span></div><div class="sentiment"><i style="width:72%"></i></div></div></div>'}
      else {content.innerHTML='<div class="creator-hero"><div class="creator-hero-kicker">Creator Buzz</div><h2>The Last Signal</h2><p>Creators are reacting to the latest studio release. Their coverage can amplify awareness, shape sentiment and start industry conversations.</p></div><div class="creator-section"><div class="creator-section-head"><h3>Latest Reactions</h3><span>LIVE SIMULATION</span></div><div class="reaction-list"><div class="reaction-card"><div class="reaction-visual"><span class="reaction-film">🎬 THE LAST SIGNAL · OFFICIAL TRAILER</span></div><div class="reaction-body"><div class="reaction-title">“THIS LOOKS HUGE.”</div><div class="reaction-by">FilmScope · Trailer Reaction</div><div class="reaction-stats"><span>👁 2.1M</span><span>❤️ 188K</span><span>💬 14K</span></div><div class="sentiment"><i></i></div></div></div><div class="reaction-card"><div class="reaction-visual"><span class="reaction-film">🎞️ THE LAST SIGNAL · TRAILER</span></div><div class="reaction-body"><div class="reaction-title">Trailer Breakdown: What We Know</div><div class="reaction-by">The Cinema Room · Analysis</div><div class="reaction-stats"><span>👁 940K</span><span>❤️ 91K</span><span>💬 7K</span></div><div class="sentiment"><i style="width:91%"></i></div></div></div></div></div>'}
      content.querySelectorAll('[data-follow]').forEach(b=>b.onclick=()=>{b.textContent=b.textContent==='FOLLOW'?'FOLLOWING':'FOLLOW';});
    }
    render('reactions');
    root.querySelectorAll('[data-ct]').forEach(btn=>btn.onclick=()=>{root.querySelectorAll('[data-ct]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');render(btn.dataset.ct);});
    root.querySelector('.creator-back').onclick=()=>{root.hidden=true; if(window.showMediaHub) window.showMediaHub();};
    window.openCreatorNetwork=function(){root.hidden=false;render('reactions');root.scrollIntoView({behavior:'smooth',block:'start'});};
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
})();