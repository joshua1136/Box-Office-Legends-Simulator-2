/* BOLS MEDIA v369 — industry channel restoration. Loaded after the existing hub so it can safely decorate its Channels view without replacing the working video engine. */
(()=>{
  const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const state=()=>window.__BOL_STATE__||{};
  const money=n=>{n=Number(n||0);return n>=1e9?'$'+(n/1e9).toFixed(1)+'B':n>=1e6?'$'+(n/1e6).toFixed(1)+'M':n>=1e3?'$'+Math.round(n/1e3)+'K':'$'+Math.round(n)};
  const brands=[
    ['Universal Pictures','Universal','🎞️','Major Studio','Action · Adventure · Horror'],
    ['Warner Bros. Pictures','Warner Bros.','WB','Major Studio','Crime · Action · Drama'],
    ['Disney','Disney','🏰','Major Studio','Animation · Family · Fantasy'],
    ['Netflix','Netflix','N','Streaming Studio','Drama · Thriller · Comedy'],
    ['HBO','HBO','HBO','Premium Network','Drama · Crime · Prestige'],
    ['Sony Pictures','Sony','SONY','Major Studio','Action · Comedy · Thriller'],
    ['Paramount Pictures','Paramount','⛰️','Major Studio','Action · Comedy · Drama'],
    ['Lionsgate','Lionsgate','🦁','Major Studio','Thriller · Action · Horror'],
    ['A24','A24','A24','Independent Studio','Drama · Horror · Indie']
  ];
  const genreEmoji={Drama:'🎭',Comedy:'😂',Action:'💥',Horror:'👻',Romance:'💕',Thriller:'🔪','Sci-Fi':'🚀',Fantasy:'🧙',Animation:'🎨',Adventure:'🧭',Crime:'🕵️'};
  const fallbackVideos=(brand)=>{
    const s=state(),week=Number(s.week||1),year=Number(s.year||1),seed=brand[0].length*97+week*13;
    const genre=(brand[4].split(' · ')[seed%brand[4].split(' · ').length])||'Drama';
    const titles={
      'Universal Pictures':['The Last Frontier','Shadow Protocol','Nightfall'],
      'Warner Bros. Pictures':['Underworld','The Last Witness','City of Shadows'],
      'Disney':['Kingdom of Stars','The Little Star','Beyond the Blue Sky'],
      'Netflix':['The Final Signal','The Other Side','One More Tomorrow'],
      'HBO':['The Long Night','Cold Evidence','The Last Informant'],
      'Sony Pictures':['Black Horizon','The Great Escape','Zero Hour'],
      'Paramount Pictures':['Final Strike','One Last Favor','The Hidden Room'],
      'Lionsgate':['The Silent Witness','Dead Reckoning','The Last Heist'],
      'A24':['What Remains','The Hollow','A Place We Left Behind']
    };
    const title=(titles[brand[0]]||['Untitled Film','The Next Story','A New Beginning'])[seed%3];
    const views=Math.round(380000+(seed%17)*91000+(week*17000));
    return [{id:`industry-${brand[0]}-${year}-${week}-0`,title:`${title} — Official Trailer`,type:'Official Trailer',genre,views,likes:Math.round(views*.047),comments:Math.round(views*.0017),age:`Week ${week}`,status:'RELEASED',studio:brand[0],description:`Industry release from ${brand[0]}. ${genre} · major studio channel.`},{id:`industry-${brand[0]}-${year}-${week}-1`,title:`${title} — Behind the Scenes`,type:'Behind the Scenes',genre,views:Math.round(views*.31),likes:Math.round(views*.018),comments:Math.round(views*.0009),age:`Week ${Math.max(1,week-1)}`,status:'PUBLISHED',studio:brand[0],description:`A production look at ${title} from ${brand[0]}.`}];
  };
  const patch=()=>{
    const root=document.querySelector('.mediaHubModal');if(!root)return;
    const nav=[...root.querySelectorAll('[data-media-tab]')];const channels=nav.find(b=>b.dataset.mediaTab==='channels');if(!channels||channels.dataset.v369)return;channels.dataset.v369='1';
    channels.addEventListener('click',ev=>{setTimeout(()=>renderChannels(root),0)});
  };
  const renderChannels=(root)=>{
    const content=root.querySelector('#mediaContent');if(!content)return;
    const s=state();
    const own=s.studioName||'Your Studio';
    const currentVideos=()=>{try{return window.BOLSMediaCreators?.getAll?.()||[]}catch{return[]}};
    const rows=brands.map((b,i)=>{
      const real=(()=>{try{const all=(window.__BOL_MEDIA_VIDEOS__||[]);return all.filter(v=>v.studio===b[0])}catch{return[]}})();
      const videos=real.length?real:fallbackVideos(b);
      const total=videos.reduce((a,v)=>a+Number(v.views||0),0);
      return {b,videos,total,i};
    });
    const ownRows=(()=>{
      const mine=currentVideos().filter(v=>v.studio===own);return mine.length?mine:[];
    })();
    content.innerHTML=`<section class="mediaChannelsV369"><div class="mediaBackLink" data-v369-back="1">‹ BACK TO MEDIA</div><div class="mediaPageHero v369Hero"><div><small>BOLS MEDIA · INDUSTRY CHANNELS</small><h2>The studios shaping the screen</h2><p>Official industry channels, rival releases and studio coverage — all in one place.</p></div><div class="v369ChannelCount"><b>${brands.length+1}</b><span>ACTIVE CHANNELS</span></div></div><section class="v369YourChannel"><div><span class="v369Logo">${esc((own[0]||'S').toUpperCase())}</span><div><small>YOUR STUDIO</small><b>${esc(own)}</b><span>${ownRows.length} creator-linked videos</span></div></div><button class="menuBtn primary" data-media-tab="channel">OPEN MY CHANNEL →</button></section><div class="v369ChannelGrid">${rows.map(({b,videos,total,i})=>`<button type="button" class="v369ChannelCard" data-v369-channel="${i}"><div class="v369ChannelBanner"><span class="v369BrandMark">${esc(b[2])}</span><span class="v369Verified">✓</span></div><div class="v369ChannelBody"><div><small>${esc(b[3])}</small><h3>${esc(b[0])}</h3><p>${esc(b[4])}</p></div><div class="v369ChannelStats"><span><b>${videos.length}</b> VIDEOS</span><span><b>${total>=1e6?(total/1e6).toFixed(1)+'M':Math.round(total/1000)+'K'}</b> VIEWS</span></div><strong>VIEW CHANNEL →</strong></div></button>`).join('')}</div></section>`;
    content.querySelector('[data-v369-back]').onclick=()=>root.querySelector('[data-media-tab="home"]')?.click();
    content.querySelector('[data-media-tab="channel"]')?.addEventListener('click',()=>root.querySelector('[data-media-tab="channel"]')?.click());
    content.querySelectorAll('[data-v369-channel]').forEach(btn=>btn.onclick=()=>showIndustryChannel(root,rows[Number(btn.dataset.v369Channel)]));
  };
  const showIndustryChannel=(root,row)=>{
    const [brand,videos]=[row.b,row.videos];
    const fmt=n=>n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(0)+'K':String(Math.round(n));
    const content=root.querySelector('#mediaContent');
    content.innerHTML=`<section class="mediaIndustryChannelV369"><button class="mediaBackLink" data-v369-channel-back="1">‹ ALL CHANNELS</button><div class="v369StudioHero"><div class="v369BigLogo">${esc(brand[2])}</div><div><small>OFFICIAL CHANNEL · VERIFIED ✓</small><h2>${esc(brand[0])}</h2><p>${esc(brand[3])} · ${esc(brand[4])}</p><div class="v369Stats"><span>${videos.length} videos</span><span>${fmt(videos.reduce((a,v)=>a+Number(v.views||0),0))} total views</span><span>Industry channel</span></div></div><button class="menuBtn primary">SUBSCRIBE</button></div><div class="v369FeaturedVideo"><div class="v369VideoArt"><span>${genreEmoji[videos[0]?.genre]||'🎬'}</span><b>▶</b></div><div><small>FEATURED · ${esc(videos[0]?.type||'VIDEO')}</small><h3>${esc(videos[0]?.title||'Latest Industry Video')}</h3><p>${esc(videos[0]?.description||'Official industry content.')}</p><div class="v369VideoStats">👁 ${fmt(videos[0]?.views)} · 👍 ${fmt(videos[0]?.likes)} · 💬 ${fmt(videos[0]?.comments)}</div></div></div><div class="mediaSectionHead"><div><small>CHANNEL LIBRARY</small><h3>Videos from ${esc(brand[0])}</h3></div><span>${videos.length}</span></div><div class="mediaGrid v369VideoGrid">${videos.map(v=>`<button type="button" class="mediaVideoCard v369VideoCard"><div class="mediaThumb"><div class="mediaArtwork"><span class="mediaThumbEmoji">${genreEmoji[v.genre]||'🎬'}</span></div><span class="mediaPlayBadge">▶</span></div><div class="mediaVideoMeta"><b>${esc(v.title)}</b><small>${esc(v.type)} · ${fmt(v.views)} views · ${esc(v.age)}</small><span>${esc(v.genre)} · ${esc(v.status)}</span></div></button>`).join('')}</div></section>`;
    content.querySelector('[data-v369-channel-back]').onclick=()=>renderChannels(root);
  };
  const observer=new MutationObserver(()=>patch());observer.observe(document.body,{childList:true,subtree:true});setTimeout(patch,600);
  window.BOLSMediaIndustryV369={renderChannels,showIndustryChannel};
})();