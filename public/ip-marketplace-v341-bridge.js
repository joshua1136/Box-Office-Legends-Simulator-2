// Connects the new IP dossier/negotiation module to the existing Industry UI.
(function(){
  const key='bols2_ip_market_cycle';
  const owned=()=>JSON.parse(localStorage.getItem('bols2_owned_ips')||'[]');
  const catalogue=()=>window.BOLS2IP?.catalogue||[];
  const currentWeek=()=>Number(window.BOLS2_GAME_STATE?.week||window.gameState?.week||1);
  const cycle=()=>Math.floor((currentWeek()-1)/6);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function available(){
    const all=catalogue(); if(!all.length)return [];
    const taken=new Set(owned().map(x=>x.id));
    const free=all.filter(x=>!taken.has(x.id));
    if(!free.length)return [];
    const start=(cycle()*7)%free.length;
    const rotated=free.slice(start).concat(free.slice(0,start));
    return rotated.slice(0,Math.min(12,rotated.length));
  }

  function renderGrid(grid){
    const list=available();
    if(!list.length){grid.innerHTML='<div class="iipEmpty" style="grid-column:1/-1;padding:30px;text-align:center">All current properties have been acquired. New rights enter the market at the next 6-week refresh.</div>';return;}
    grid.innerHTML=list.map(ip=>`<button class="ipCard ip-v341-market-card" data-ip-id="${esc(ip.id)}"><div class="ipPoster"><span>🎬</span><em>${esc(ip.tier)}</em></div><div><small>${esc(ip.source)} · ${esc(ip.genre)}</small><h3>${esc(ip.name)}</h3><p>${esc(ip.logline)}</p><div class="ipMetrics"><span>POPULARITY<strong>${ip.popularity}</strong></span><span>FANBASE<strong>${ip.tier}</strong></span><span>FRANCHISE<strong>${ip.franchise}</strong></span></div><small class="ipCardAction">VIEW IP DOSSIER →</small></div></button>`).join('');
  }

  function rerenderGrids(){
    document.querySelectorAll('.ipGrid, .iipMarketGrid').forEach(g=>{
      if(g.dataset.v341Rendered==='1')return;
      // Only take over grids that contain IP/property cards.
      if(g.querySelector('.ipCard,.iipMarketCard')){g.dataset.v341Rendered='1';renderGrid(g);}
    });
  }

  document.addEventListener('click',function(e){
    const card=e.target.closest('.ip-v341-market-card, .ipCard, .iipMarketCard');
    if(card){
      const id=card.dataset.ipId || card.getAttribute('data-ip') || card.getAttribute('data-id');
      let ip=id?catalogue().find(x=>x.id===id):null;
      if(!ip){const title=card.querySelector('h3,b,strong')?.textContent?.trim();ip=catalogue().find(x=>x.name===title);}
      if(ip && window.BOLS2IP?.openIP){e.preventDefault();e.stopImmediatePropagation();window.BOLS2IP.openIP(ip);return;}
    }
  },true);

  // The game can advance the week without reloading the page. A 6-week market
  // cycle therefore gets a new rotating catalogue automatically.
  let last=cycle();
  setInterval(()=>{const now=cycle();if(now!==last){last=now;document.querySelectorAll('[data-v341-rendered="1"]').forEach(g=>renderGrid(g));}},1000);
  new MutationObserver(rerenderGrids).observe(document.body,{childList:true,subtree:true});
  setTimeout(rerenderGrids,250);
  setTimeout(rerenderGrids,1000);
  window.BOLS2IPMarket={available,refresh:rerenderGrids,cycleLengthWeeks:6};
})();