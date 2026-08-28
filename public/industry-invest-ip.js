// v341 IP marketplace interaction module
(function () {
  const IP_LIBRARY = [
    ['The Last Signal','Sci-Fi Thriller','Original Screenplay','A mysterious signal begins appearing in every city on Earth.',89,76,92,4500000,3],
    ['Black River','Horror','Novel Rights','A family returns to a town where the river remembers everyone who vanished.',78,68,73,7200000,2],
    ['Kingdom of Ashes','Fantasy','Novel Rights','A fallen kingdom searches for the heir hidden beyond the northern wall.',94,91,97,18000000,4],
    ['Neon Hearts','Romance','Original Concept','Two strangers build a life together in a city that never sleeps.',72,74,61,3800000,1],
    ['Orbit Nine','Sci-Fi Thriller','Graphic Novel','A salvage crew discovers a station erased from every map.',86,88,90,12500000,2],
    ['The Hollow House','Horror','Novel Rights','A house changes its rooms every midnight.',83,79,84,9800000,1],
    ['Paper Moons','Drama','Novel Rights','Three generations confront a secret buried in old letters.',67,63,70,3100000,0],
    ['Wildfire Protocol','Action','Original Screenplay','A disgraced emergency pilot is pulled into a global conspiracy.',81,77,82,8500000,2],
    ['Starfall Academy','Fantasy','Book Series','Students discover their school was built over an ancient gateway.',96,93,98,24000000,5],
    ['Little Giants','Family','Original Concept','Children secretly rebuild their struggling community.',75,82,69,4600000,1],
    ['Velvet Season','Romance','Novel Rights','A summer romance collides with old money and an old promise.',69,71,64,2900000,2],
    ['Dead Frequency','Horror','Podcast Rights','A late-night radio host receives calls from people who died years ago.',91,87,89,11000000,3],
    ['Titan Meridian','Action','Graphic Novel','A retired soldier races to stop a satellite weapon.',88,84,93,14500000,3],
    ['Glass Empire','Drama','Original Concept','A young executive inherits a company built on family betrayal.',73,76,79,5200000,1],
    ['The Clockmaker’s Door','Fantasy','Novel Rights','A clockmaker finds a door that opens into yesterday.',85,90,86,9000000,2],
    ['Afterlight','Sci-Fi Thriller','Original Screenplay','Earth receives its final sunrise warning from an unknown civilization.',93,95,94,21000000,4],
    ['Moonlit Garden','Family','Book Rights','A brother and sister discover a garden that restores lost memories.',62,73,58,2400000,0],
    ['Iron Saints','Action','Comic Rights','A forgotten team of heroes is forced back into the spotlight.',79,80,87,6700000,2],
    ['The Blue Room','Drama','Novel Rights','A journalist investigates a room that appears in photographs before it exists.',77,69,75,4100000,1],
    ['Crimson Crown','Fantasy','Game Rights','A young ruler must unite rival houses before an ancient war returns.',97,96,99,32000000,6],
    ['Static Summer','Romance','Original Concept','A summer friendship becomes something neither person expected.',58,66,52,1800000,0],
    ['The Deep End','Horror','Novel Rights','A diving team finds a structure beneath the ocean.',87,85,88,10200000,2],
    ['Zero Hour Unit','Action','Original Screenplay','An elite crisis team gets one hour to prevent catastrophe.',84,81,85,7800000,1],
    ['North of Tomorrow','Sci-Fi Thriller','Novel Rights','A scientist follows coordinates pointing to a future that has not happened.',90,91,92,16000000,3]
  ].map((x,i)=>({id:'ip-'+i,name:x[0],genre:x[1],source:x[2],logline:x[3],popularity:x[4],franchise:x[5],fanbase:x[6],ask:x[7],films:x[8],tier:x[6]>=90?'INSANE':x[6]>=70?'HIGH':x[6]>=45?'MEDIUM':'LOW'}));

  const storeKey='bols2_owned_ips';
  const owned=()=>JSON.parse(localStorage.getItem(storeKey)||'[]');
  const save=a=>localStorage.setItem(storeKey,JSON.stringify(a));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const cash=n=>'$'+Number(n).toLocaleString('en-US');

  function overlay(html){const o=document.createElement('div');o.className='ip-v341-overlay';o.innerHTML=html;document.body.appendChild(o);return o;}
  function close(o){o?.remove();}

  function openIP(ip){
    const already=owned().some(x=>x.id===ip.id);
    const o=overlay(`<div class="ip-v341-card"><button class="ip-v341-close">×</button><div class="ip-v341-hero"><div class="ip-v341-icon">🎬<small>${ip.tier}</small></div><div><div class="ip-v341-eyebrow">INTELLECTUAL PROPERTY · RIGHTS DOSSIER</div><h1>${esc(ip.name)}</h1><p>${esc(ip.source)} · ${esc(ip.genre)}</p><p class="ip-v341-logline">${esc(ip.logline)}</p></div></div><div class="ip-v341-stats"><div><small>POPULARITY</small><b>${ip.popularity}/100</b></div><div><small>FANBASE</small><b>${ip.tier}</b><span>${ip.fanbase}/100</span></div><div><small>FRANCHISE</small><b>${ip.franchise}/100</b></div><div><small>MARKET ASK</small><b>${cash(ip.ask)}</b></div></div><div class="ip-v341-section"><h3>📚 EXISTING FILMS</h3><p>${ip.films?`${ip.films} existing film${ip.films>1?'s':''} in the simulated IP history.`:'No existing feature-film adaptation. You could define the first cinematic version.'}</p></div><div class="ip-v341-section"><h3>👥 FANBASE INTELLIGENCE</h3><div class="ip-v341-bar"><i style="width:${ip.fanbase}%"></i></div><p><strong>${ip.tier}</strong> fanbase — ${ip.fanbase>=90?'rare, premium and extremely expensive.':ip.fanbase>=70?'strong audience with significant commercial upside.':'a developing audience with room to grow.'}</p></div><div class="ip-v341-section"><h3>⚔️ RIGHTS MARKET</h3><p>${ip.fanbase>=90?'Major studios are competing for this property. Expect a bidding war.':ip.fanbase>=70?'Several buyers are monitoring the rights.':'Competition is currently limited.'}</p></div><div class="ip-v341-actions"><button class="ip-v341-secondary">BACK TO MARKET</button>${already?'<button class="ip-v341-primary owned">OPEN IN IP LIBRARY →</button>':'<button class="ip-v341-primary negotiate">START RIGHTS NEGOTIATION →</button>'}</div></div>`);
    o.querySelector('.ip-v341-close').onclick=()=>close(o);o.querySelector('.ip-v341-secondary').onclick=()=>close(o);
    o.querySelector('.negotiate')?.addEventListener('click',()=>negotiate(ip,o));
    o.querySelector('.owned')?.addEventListener('click',()=>ownedDossier(ip,o));
  }

  function negotiate(ip,old){close(old);const rival=['Warner Bros. Pictures','Universal Pictures','Netflix Studios','Disney+','HBO Films'][(ip.popularity+ip.fanbase)%5];
    const o=overlay(`<div class="ip-v341-card ip-neg"><button class="ip-v341-close">×</button><div class="ip-v341-eyebrow">RIGHTS NEGOTIATION · COMPETITIVE SALE</div><h1>${esc(ip.name)}</h1><p>The rights holder is considering multiple buyers. <strong>${rival}</strong> is watching this deal.</p><div class="ip-v341-deal"><div><small>ASK</small><b>${cash(ip.ask)}</b></div><div><small>FANBASE</small><b>${ip.tier}</b></div><label><small>YOUR OFFER</small><input type="number" value="${Math.round(ip.ask*.82)}"></label></div><div class="ip-v341-warning">Your offer affects both acceptance odds and the final acquisition cost.</div><button class="ip-v341-primary submit">SUBMIT OFFER →</button></div>`);
    o.querySelector('.ip-v341-close').onclick=()=>close(o);o.querySelector('.submit').onclick=()=>{const offer=Number(o.querySelector('input').value||0);const floor=ip.ask*(ip.fanbase>=90?.96:ip.fanbase>=70?.88:.8);if(offer>=floor){const arr=owned();arr.push({...ip,acquiredFor:offer,acquiredWeek:window.BOLS2_GAME_STATE?.week||1});save(arr);o.innerHTML=`<div class="ip-v341-card"><div class="ip-v341-eyebrow">RIGHTS ACQUIRED</div><h1>${esc(ip.name)}</h1><p>Your studio now controls this IP.</p><div class="ip-v341-won">ACQUIRED FOR <b>${cash(offer)}</b></div><button class="ip-v341-primary library">ADD TO IP LIBRARY →</button></div>`;o.querySelector('.library').onclick=()=>ownedDossier(ip,o)}else{o.querySelector('.ip-v341-warning').textContent=`Offer rejected. ${rival} remains interested. Try ${cash(Math.ceil(floor))} or more.`;}};
  }

  function ownedDossier(ip,old){close(old);const o=overlay(`<div class="ip-v341-card"><button class="ip-v341-close">×</button><div class="ip-v341-eyebrow">YOUR IP LIBRARY · RIGHTS CONTROLLED</div><h1>${esc(ip.name)}</h1><p>${esc(ip.genre)} · ${ip.tier} fanbase · ${ip.popularity}/100 popularity</p><div class="ip-v341-section"><h3>🎬 DEVELOPMENT</h3><p>You own the rights. Develop a fresh movie, build the property into a franchise, or hold it for a better release window.</p></div><button class="ip-v341-primary fresh">MAKE A FRESH MOVIE OF “${esc(ip.name.toUpperCase())}” →</button></div>`);o.querySelector('.ip-v341-close').onclick=()=>close(o);o.querySelector('.fresh').onclick=()=>{window.dispatchEvent(new CustomEvent('bols2:start-ip-movie',{detail:ip}));close(o);};}

  // Public hooks used by the existing marketplace and IP library UI.
  window.BOLS2IP={catalogue:IP_LIBRARY,openIP,owned,refreshWeeks:6};
  window.dispatchEvent(new CustomEvent('bols2:ip-module-ready',{detail:IP_LIBRARY}));
})();