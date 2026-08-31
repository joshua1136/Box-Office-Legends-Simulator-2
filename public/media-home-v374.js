/* BOLS MEDIA v374 — restores a populated discovery home with real destinations. */
(()=>{
 const studios=[['Universal Pictures','Universal','🎞️','Action · Adventure'],['Warner Bros. Pictures','WB','Crime · Action'],['Disney','DISNEY','🏰','Animation · Fantasy'],['Netflix','N','Drama · Thriller'],['HBO','HBO','Prestige · Crime'],['Sony Pictures','SONY','Action · Comedy'],['Paramount Pictures','P','Action · Drama'],['Lionsgate','LIONSGATE','Thriller · Horror'],['A24','A24','A24','Drama · Indie']];
 const creators=[['CinemaDaily','CD','REACTIONS'],['FilmNerd88','FN','FIRST IMPRESSIONS'],['The Movie Room','MR','REVIEWS'],['FrameByFrame','FB','BREAKDOWNS'],['ScreenTalk','ST','PREDICTIONS'],['The Reel Report','RR','MARKETING ANALYSIS']];
 const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const fmt=n=>{n=Number(n||0);return n>=1e9?(n/1e9).toFixed(1)+'B':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(0)+'K':String(Math.round(n))};
 const state=()=>window.__BOL_STATE__||{};
 function getVideos(){
   const s=state(), out=[]; try{(s.films||[]).forEach((f,i)=>{if(!f?.title)return;out.push({id:'film-'+(f.id??i)+'-trailer',title:f.title,type:'Official Trailer',genre:f.genre||'Drama',views:Number(f.industry?.media?.views||0),studio:s.studioName||'Your Studio'})})}catch{}
   try{const slate=s.industry?.rivalSlate||{};Object.values(slate).forEach(arr=>Array.isArray(arr)&&arr.forEach(r=>{if(r?.title)out.push({id:'rival-'+r.id+'-trailer',title:r.title,type:'Official Trailer',genre:r.genre||'Drama',views:Number(s.mediaVideos?.['rival-'+r.id+'-trailer']?.views||0),studio:r.studio||'Industry Studio'})}))}catch{}
   return out;
 }
 function go(tab){const root=document.querySelector('.mediaHubModal');const b=root?.querySelector(`[data-media-tab="${tab}"]`);if(b)b.click()}
 function render(){
   const root=document.querySelector('.mediaHubModal'); if(!root)return;
   const content=root.querySelector('#mediaContent'); if(!content)return;
   const old=content.querySelector('.mediaHomeDiscoveryV374'); if(old)old.remove();
   const active=root.querySelector('.mediaTabs .active')?.dataset.mediaTab; if(active!=='home')return;
   const vs=getVideos();
   const studioCards=studios.map((x,i)=>`<button type="button" class="v374StudioCard" data-v374-tab="channels"><div class="v374StudioArt"><span class="v374Brand">${esc(x[1])}</span></div><div class="v374StudioBody"><small>OFFICIAL STUDIO · VERIFIED ✓</small><b>${esc(x[0])}</b><span>${esc(x[3])}</span><div class="v374StudioStats"><span>CHANNEL</span><span>FILMS</span></div></div></button>`).join('');
   const creatorCards=creators.map((x,i)=>`<button type="button" class="v374CreatorCard" data-v374-tab="creators"><div class="v374CreatorArt"><span class="v374CreatorAvatar">${esc(x[1])}</span><span class="v374CreatorPlay">▶</span></div><div class="v374CreatorBody"><small>CREATOR · ${esc(x[2])}</small><b>${esc(x[0])}</b><span>Reactions, reviews & film talk</span></div></button>`).join('');
   const videoCards=(vs.length?vs.slice().sort((a,b)=>b.views-a.views):[{id:'demo',title:'The Industry Is Moving',type:'Industry Spotlight',genre:'Film',views:0,studio:'BOLS Media'}]).slice(0,10).map(v=>`<button type="button" class="v374VideoCard" data-v374-video="${esc(v.id)}"><div class="v374VideoThumb"><span class="v374Emoji">${v.genre==='Action'?'💥':v.genre==='Horror'?'👻':v.genre==='Romance'?'💕':v.genre==='Sci-Fi'?'🚀':'🎬'}</span><i>▶</i></div><div class="v374VideoBody"><small>${esc(v.type)}</small><b>${esc(v.title)}</b><span>${esc(v.studio)} · ${fmt(v.views)} views</span></div></button>`).join('');
   const wrap=document.createElement('section');wrap.className='mediaHomeDiscoveryV374';wrap.innerHTML=`<section><div class="v374SectionHead"><div><small>INDUSTRY NETWORK</small><h3>Studios</h3></div><button class="v374SeeAll" data-v374-tab="channels">SEE ALL →</button></div><div class="v374StudioRail">${studioCards}</div></section><section><div class="v374SectionHead"><div><small>CREATOR NETWORK</small><h3>Creators & reactions</h3></div><button class="v374SeeAll" data-v374-tab="creators">SEE ALL →</button></div><div class="v374CreatorRail">${creatorCards}</div></section><section><div class="v374SectionHead"><div><small>WATCH NOW</small><h3>Latest from the industry</h3></div><button class="v374SeeAll" data-v374-tab="videos">SEE ALL →</button></div><div class="v374VideoRail">${videoCards}</div></section>`;
   content.appendChild(wrap);
   wrap.querySelectorAll('[data-v374-tab]').forEach(b=>b.onclick=()=>go(b.dataset.v374Tab));
   wrap.querySelectorAll('[data-v374-video]').forEach(b=>{b.onclick=()=>{const target=root.querySelector(`[data-video="${CSS.escape(b.dataset.v374Video)}"]`);if(target)target.click();else go('videos')}});
 }
 const mo=new MutationObserver(()=>{const root=document.querySelector('.mediaHubModal');if(root&&!root.__v374){root.__v374=true;setTimeout(render,30);root.querySelector('.mediaTabs')?.addEventListener('click',()=>setTimeout(render,40));}});mo.observe(document.body,{childList:true,subtree:true});setInterval(()=>{const root=document.querySelector('.mediaHubModal');if(root&&!root.querySelector('.mediaHomeDiscoveryV374')&&root.querySelector('.mediaTabs .active')?.dataset.mediaTab==='home')render()},800);
})();