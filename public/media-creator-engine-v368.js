(()=>{
  const STORE='bol2_media_creator_engine_v1';
  const read=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch{return{}}};
  const write=x=>{try{localStorage.setItem(STORE,JSON.stringify(x))}catch{}};
  const state=()=>window.__BOL_STATE__||{};
  const creators=[
    {id:'cinema-daily',name:'CinemaDaily',followers:8200000,influence:92,niche:'Reactions',tone:0.22},
    {id:'film-nerd-88',name:'FilmNerd88',followers:3400000,influence:78,niche:'First Impressions',tone:0.08},
    {id:'movie-room',name:'The Movie Room',followers:1900000,influence:71,niche:'Breakdowns',tone:0.02},
    {id:'frame-by-frame',name:'FrameByFrame',followers:1250000,influence:66,niche:'Cinematography',tone:0.12},
    {id:'screen-talk',name:'ScreenTalk',followers:680000,influence:58,niche:'Predictions',tone:-0.04},
    {id:'reel-report',name:'The Reel Report',followers:520000,influence:54,niche:'Marketing Analysis',tone:0.05},
    {id:'popcorn-daily',name:'Popcorn Daily',followers:14600000,influence:84,niche:'Entertainment News',tone:0.16},
    {id:'indie-frame',name:'IndieFrame',followers:310000,influence:42,niche:'Film Criticism',tone:-0.02}
  ];
  const formats=['REACTION','FIRST IMPRESSION','BREAKDOWN','PREDICTION','REVIEW','MARKETING ANALYSIS','TRAILER DEEP DIVE','BOX OFFICE PREDICTION'];
  const hash=(str)=>{let h=2166136261;for(let i=0;i<String(str).length;i++){h^=String(str).charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  const rand=(seed)=>((hash(seed)%10000)/10000);
  const absNow=s=>((Number(s.year||1)-1)*52+Number(s.week||1));
  const films=s=>[...(s.films||[]),...(s.filmography||[])].filter((f,i,a)=>f&&f.title&&a.findIndex(x=>String(x.id)===String(f.id))===i);
  const eligible=f=>f&&(['marketing','scheduled','released','completed'].includes(f.stage)||f.industry?.media?.released);
  const baseViews=(f,c)=>Math.max(3500,Math.round(Number(f?.audience||55)*Number(f?.quality||60)*c.influence*0.42));
  function process(){
    const s=state();if(!s||!s.week)return read();
    const d=read();d.coverage=d.coverage||{};d.creatorStats=d.creatorStats||{};
    const now=absNow(s);
    films(s).filter(eligible).forEach(f=>{
      const sourceId='film-'+f.id+'-trailer';
      creators.forEach((c,ci)=>{
        const key=sourceId+'::'+c.id;
        const seed=hash(key);
        const chance=0.28+(Number(f.audience||50)/100)*0.48+(Number(f.quality||50)/100)*0.20;
        const windowSeed=rand(key+'::window');
        const preferredDelay=windowSeed<.62?0:windowSeed<.9?1:2;
        const created=(Number(f.createdYear||s.year)-1)*52+Number(f.createdWeek||s.week||1)+preferredDelay;
        if(created>now || rand(key+'::chance')>chance)return;
        if(d.coverage[key])return;
        const quality=Number(f.quality||55),audience=Number(f.audience||55),hype=Number(f.hype||f.marketingHype||55);
        const sentiment=Math.max(-0.8,Math.min(0.9,c.tone+(quality-58)/180+(audience-55)/260+(rand(key+'::sentiment')-.5)*.45));
        const format=formats[(seed+ci)%formats.length];
        const initial=Math.max(900,Math.round(baseViews(f,c)*(0.72+rand(key+'::reach')*.62)));
        d.coverage[key]={id:'coverage-'+hash(key),sourceId,filmId:f.id,creatorId:c.id,creator:c.name,format,sentiment,createdAbs:created,views:initial,likes:Math.round(initial*(.045+Math.max(0,sentiment)*.02)),comments:Math.max(8,Math.round(initial*.0018)),shares:Math.max(4,Math.round(initial*.004)),weeklyHistory:{},lastProcessedAbs:created-1,followed:false,playerAction:null};
      });
    });
    Object.values(d.coverage).forEach(v=>{
      if(!v||Number(v.createdAbs)>now)return;
      let last=Number(v.lastProcessedAbs||Number(v.createdAbs)-1);
      for(let w=Math.max(Number(v.createdAbs),last+1);w<=now;w++){
        const age=Math.max(0,w-Number(v.createdAbs));
        const burst=age===0?2.4:age===1?1.65:age===2?1.25:Math.max(.13,Math.pow(.78,age-2));
        const sentimentBoost=1+Math.max(-.25,Math.min(.22,Number(v.sentiment||0)*.22));
        const creator=creators.find(c=>c.id===v.creatorId)||creators[0];
        const gain=Math.max(120,Math.round(Number(v.views||1000)*.19*burst*sentimentBoost*(.94+rand(v.id+'::'+w)*.12)));
        v.weeklyHistory[String(w)]=gain;v.views+=gain;v.likes+=Math.max(1,Math.round(gain*(.035+Math.max(0,Number(v.sentiment||0))*.018)));v.comments+=Math.max(1,Math.round(gain*.0015));v.shares+=Math.max(1,Math.round(gain*.0045));v.lastProcessedAbs=w;
        const growth=Math.max(1,Math.round(gain*.004));d.creatorStats[v.creatorId]=(d.creatorStats[v.creatorId]||{});d.creatorStats[v.creatorId].views=(d.creatorStats[v.creatorId].views||0)+gain;d.creatorStats[v.creatorId].followers=Math.max(creator.followers,Math.round(creator.followers+(d.creatorStats[v.creatorId].views||0)*.008));
      }
    });
    // Coverage affects the film's media buzz/hype. It is deliberately small so creator activity matters without replacing the core film systems.
    films(s).forEach(f=>{
      if(!f||!f.id)return;
      const rows=Object.values(d.coverage).filter(v=>String(v.filmId)===String(f.id));
      if(!rows.length)return;
      const total=rows.reduce((n,v)=>n+Number(v.views||0),0),positive=rows.reduce((n,v)=>n+Number(v.views||0)*Number(v.sentiment||0),0);
      f.industry=f.industry||{};f.industry.media=f.industry.media||{};f.industry.media.creatorCoverageViews=total;f.industry.media.creatorSentiment=total?positive/total:0;f.industry.media.creatorCoverageCount=rows.length;
      f.hype=Math.max(0,Math.min(100,Number(f.hype||f.marketingHype||55)+Math.max(-0.7,Math.min(0.7,(positive/Math.max(1,total))*.55))));
    });
    write(d);try{window.saveCurrent?.(s,true)}catch{}return d;
  }
  function getCoverageForFilm(filmId){const d=read();return Object.values(d.coverage||{}).filter(v=>String(v.filmId)===String(filmId)).sort((a,b)=>Number(b.views||0)-Number(a.views||0));}
  function getAll(){const s=state();process();return Object.values(read().coverage||{}).filter(v=>v&&Number(v.createdAbs)<=absNow(s)).sort((a,b)=>Number(b.views||0)-Number(a.views||0));}
  function getCreator(id){return creators.find(c=>c.id===id)||creators[0]}
  function act(id,action){const d=read();const v=d.coverage?.[id];if(!v)return null;v.playerAction=action;v.followed=action==='follow';if(action==='share')v.views+=Math.max(100,Math.round(v.views*.025));if(action==='respond')v.views+=Math.max(80,Math.round(v.views*.012));if(action==='feature')v.views+=Math.max(250,Math.round(v.views*.06));d.coverage[id]=v;write(d);return v}
  window.BOLSMediaCreators={process,getAll,getCoverageForFilm,getCreator,act,creators};
  const old=window.processBOLSMediaViews;
  window.processBOLSMediaViews=()=>{try{old?.()}catch{}process()};
  document.addEventListener('click',ev=>{
    const card=ev.target?.closest?.('[data-creator-video]');if(!card)return;
    // The hub's creator cards are placeholders; stop their synthetic handler and open the real coverage record.
    const id=card.dataset.creatorVideo;const rows=getAll();let idx=Number((String(id).match(/^creator-(\d+)-/)||[])[1]||0);const v=rows[idx%Math.max(1,rows.length)];if(!v)return;
    ev.preventDefault();ev.stopImmediatePropagation();
    const root=document.querySelector('.mediaHubModal');const content=root?.querySelector('#mediaContent');if(!content)return;
    const c=getCreator(v.creatorId),s=state(),film=films(s).find(f=>String(f.id)===String(v.filmId));
    const esc=x=>String(x??'').replace(/[&<>\"]/g,z=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[z]));
    const fmt=n=>{n=Number(n||0);return n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(Math.round(n))};
    const sentiment=v.sentiment>=.2?'POSITIVE':v.sentiment<=-.2?'NEGATIVE':'MIXED';
    content.innerHTML=`<section class="creatorCoverageWatch"><button class="mediaBackLink" id="coverageBack">‹ BACK TO CREATORS</button><div class="coveragePlayer"><div class="coverageVisual"><div class="coverageCreatorAvatar">${esc(c.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div class="coveragePlay">▶</div><small>${esc(v.format)}</small><b>${esc(c.name)}</b><span>Creator coverage · ${esc(film?.title||'Film')}</span></div><div class="coverageControls"><span>0:00</span><i></i><span>LIVE SIM</span><b>⚙</b><b>⛶</b></div></div><div class="coverageTitle"><small>${esc(v.format)} · CREATOR COVERAGE</small><h2>${esc(c.name)}: ${esc(film?.title||'Film')}</h2><p>Covering the <b>${esc(film?.title||'film')}</b> trailer from <b>${esc(film?.studio||s.studioName||'the studio')}</b>. This creator's audience can influence the film's awareness and momentum.</p><div class="coverageStats"><span>👁 ${fmt(v.views)} views</span><span>👍 ${fmt(v.likes)}</span><span>💬 ${fmt(v.comments)}</span><span>📣 ${fmt(v.shares)} shares</span></div></div><div class="coverageCreatorBar"><div class="coverageCreatorAvatar small">${esc(c.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div><b>${esc(c.name)}</b><small>${esc(c.niche)} · ${fmt(c.followers)} followers · Influence ${c.influence}/100</small></div><button class="menuBtn primary" data-cov-action="follow">${v.followed?'FOLLOWING ✓':'FOLLOW CREATOR'}</button></div><div class="coverageImpact"><div><small>CREATOR SENTIMENT</small><b class="${sentiment.toLowerCase()}">${sentiment}</b></div><div><small>FILM IMPACT</small><b>+${Math.max(1,Math.round(Math.abs(v.sentiment)*c.influence/9))} BUZZ</b></div><div><small>FORMAT</small><b>${esc(v.format)}</b></div></div><div class="coverageActions"><button data-cov-action="share">↗ SHARE TO MY CHANNEL</button><button data-cov-action="respond">💬 RESPOND</button><button data-cov-action="feature">⭐ FEATURE CREATOR</button></div><div class="coverageContext"><small>WHY THIS MATTERS</small><h3>Creator coverage is now part of the film campaign.</h3><p>Strong positive coverage can lift awareness and hype. Mixed or negative coverage can slow momentum, but responding strategically can turn the conversation around.</p></div></section>`;
    const rerender=()=>{const action=ev2=>{const a=ev2.currentTarget.dataset.covAction;act(v.id,a);if(a==='follow')ev2.currentTarget.textContent='FOLLOWING ✓';else ev2.currentTarget.textContent=a==='share'?'✓ SHARED TO MY CHANNEL':a==='respond'?'✓ RESPONSE POSTED':'★ CREATOR FEATURED'};content.querySelectorAll('[data-cov-action]').forEach(b=>b.onclick=action)};rerender();content.querySelector('#coverageBack').onclick=()=>{const tab=document.querySelector('[data-media-tab="creators"]');tab?.click()};
  },true);
  const boot=()=>{process();const root=document.querySelector('.mediaHubModal');if(root){const obs=new MutationObserver(()=>{const page=root.querySelector('.mediaCreatorsPage');if(page&&!page.dataset.engineEnhanced){page.dataset.engineEnhanced='1';const rows=getAll();const cards=page.querySelectorAll('.creatorReactionCard');cards.forEach((card,i)=>{const v=rows[i%Math.max(1,rows.length)];if(!v)return;const c=getCreator(v.creatorId);const h=card.querySelector('h3'),name=card.querySelector('.creatorReactionBody b'),small=card.querySelector('.creatorReactionBody small'),p=card.querySelector('p'),footer=card.querySelector('footer');if(name)name.textContent=c.name;if(small)small.textContent=`${v.format} · ${c.niche}`;if(h)h.textContent=`${v.format}: ${String((state().films||[]).find(f=>String(f.id)===String(v.filmId))?.title||'Film')}`;if(p)p.textContent=v.sentiment>.18?'Positive reaction — creator sees breakout potential.':v.sentiment<-.18?'Critical reaction — creator is questioning the campaign.':'Mixed reaction — creator wants to see more before committing.';if(footer)footer.innerHTML=`<span>👁 ${fmt(v.views)}</span><span>♡ ${fmt(v.likes)}</span><span>💬 ${fmt(v.comments)}</span>`;card.dataset.creatorVideo=`creator-${i}-${v.id}`});}});obs.observe(root,{childList:true,subtree:true});}}
  document.addEventListener('click',ev=>{if(ev.target?.closest?.('[data-section="MEDIA"]'))setTimeout(boot,60)},true);
  setTimeout(boot,1000);
})();