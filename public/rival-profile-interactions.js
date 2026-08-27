/* RIVAL PROFILE INTERACTIONS v1 — reliable delegated controls for the redesigned studio profile. */
(function(){
  function escLocal(v){const s=String(v??'');return s.replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));}
  function moneyLocal(n){n=Number(n||0);return n>=1e9?`$${(n/1e9).toFixed(2)}B`:n>=1e6?`$${(n/1e6).toFixed(1)}M`:`$${Math.round(n).toLocaleString()}`;}
  function ensureActivePane(modal, key){
    const tabs=[...modal.querySelectorAll('.profileTabs [data-tab]')];
    tabs.forEach(t=>t.classList.toggle('active',t.dataset.tab===key));
    modal.querySelectorAll('[data-pane]').forEach(p=>p.classList.toggle('active-pane',p.dataset.pane===key));
  }
  function attachFilmBehavior(modal){
    modal.querySelectorAll('.rivalFilmRow').forEach(row=>{
      if(row.dataset.interactiveBound==='1') return;
      row.dataset.interactiveBound='1';
      row.setAttribute('role','button');
      row.tabIndex=0;
      row.style.cursor='pointer';
      const activate=()=>{
        const title=row.querySelector('b')?.textContent?.trim()||'Untitled Film';
        const meta=row.querySelector('small')?.textContent?.trim()||'';
        const studio=modal.querySelector('.industryUniverseHero h2')?.textContent?.trim()||'Rival Studio';
        const type=modal.querySelector('.industryUniverseHero p')?.textContent?.trim()||'Rival / partner studio';
        const d=document.createElement('div');
        d.className='modal rivalQuickFilmModal';
        d.innerHTML=`<div class="panel rivalQuickFilmPanel"><button class="close">×</button><header class="rivalQuickFilmHero"><div class="rivalQuickFilmPoster">🎬</div><div><small>${escLocal(studio)} · FILM RECORD</small><h2>${escLocal(title)}</h2><p>${escLocal(meta)}</p></div></header><div class="rivalQuickFilmBody"><div class="rivalQuickStats"><div><small>STUDIO</small><b>${escLocal(studio)}</b></div><div><small>STATUS</small><b>SIMULATED RELEASE</b></div><div><small>SCALE</small><b>${escLocal((meta.match(/·\s*([^·]+)\s*·/)||[])[1]||'FEATURE')}</b></div></div><section class="rivalQuickBlock"><div class="sectionTitleRow"><b>FILM OVERVIEW</b><span>Rival studio production record</span></div><p>This film belongs to ${escLocal(studio)}. Its release timing, genre, scale and performance contribute to the studio's position in the simulated industry.</p></section><section class="rivalQuickBlock"><div class="sectionTitleRow"><b>WHAT YOU CAN TRACK</b></div><div class="rivalQuickList"><span>🎬 Release position & timing</span><span>📈 Box-office performance after release</span><span>🏆 Prestige and awards impact</span><span>📺 Streaming potential</span></div></section></div><footer class="rivalQuickFilmFooter"><button class="menuBtn" id="quickFilmBack">BACK TO STUDIO</button></footer></div>`;
        document.body.appendChild(d);
        d.querySelector('.close').onclick=()=>d.remove();
        d.querySelector('#quickFilmBack').onclick=()=>d.remove();
      };
      row.addEventListener('click',activate);
      row.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();activate();}});
    });
  }
  function bindModal(modal){
    if(modal.dataset.profileInteractions==='1') return;
    modal.dataset.profileInteractions='1';
    const defaultTab=modal.querySelector('.profileTabs .active')?.dataset.tab||modal.querySelector('.profileTabs [data-tab]')?.dataset.tab;
    if(defaultTab) ensureActivePane(modal,defaultTab);
    modal.querySelectorAll('.profileTabs [data-tab]').forEach(tab=>{
      tab.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();ensureActivePane(modal,tab.dataset.tab);});
    });
    attachFilmBehavior(modal);
  }
  const observer=new MutationObserver(muts=>{
    muts.forEach(m=>m.addedNodes.forEach(node=>{
      if(!(node instanceof Element)) return;
      if(node.matches?.('.industryProfileModal')) bindModal(node);
      node.querySelectorAll?.('.industryProfileModal').forEach(bindModal);
    }));
  });
  observer.observe(document.body,{childList:true});
  document.querySelectorAll('.industryProfileModal').forEach(bindModal);
})();