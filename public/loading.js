(()=>{
  function boot(){
    if(document.getElementById('bol-loading')) return;
    const o=document.createElement('div');
    o.id='bol-loading';
    o.innerHTML=`
      <div class="bol-stage bol-stage-jx" id="bolStageJX">
        <div class="jx-backdrop"></div><div class="jx-grain"></div><div class="jx-embers" id="jxEmbers"></div>
        <div class="jx-logo-wrap">
          <svg class="jx-logo" viewBox="0 0 640 380" xmlns="http://www.w3.org/2000/svg" aria-label="Joshua StudioX">
            <defs>
              <linearGradient id="jxInk" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFE082"/><stop offset="45%" stop-color="#F5B72E"/><stop offset="100%" stop-color="#C9860A"/></linearGradient>
              <filter id="jxGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="soft"/><feMerge><feMergeNode in="soft"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="jxSplash" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.2"/></filter>
            </defs>
            <g id="jxGlyphs">
              <path class="jx-glyph" data-order="0" d="M60,30 C58,90 56,150 55,205 C54,245 50,272 28,284 C10,294 -3,278 4,258"/>
              <path class="jx-glyph" data-order="1" d="M118,150 C95,150 80,168 80,192 C80,216 98,232 120,230 C144,228 158,208 156,184 C154,160 138,146 118,150 Z"/>
              <path class="jx-glyph" data-order="2" d="M232,132 C214,120 188,122 180,140 C172,158 196,164 214,170 C234,176 248,186 240,204 C230,224 198,222 186,206"/>
              <path class="jx-glyph" data-order="3" d="M270,40 C266,100 262,168 260,224 M262,168 C276,148 302,140 312,156 C320,170 316,196 314,220"/>
              <path class="jx-glyph" data-order="4" d="M348,138 C348,166 346,190 352,206 C360,224 386,222 398,204 C406,192 408,168 406,140"/>
              <path class="jx-glyph" data-order="5" d="M498,150 C476,142 452,150 446,172 C440,194 460,208 482,202 C500,196 508,178 506,158 C505,150 505,178 510,202"/>
              <path class="jx-glyph" data-order="6" d="M486,66 C528,158 570,250 606,338"/>
              <path class="jx-glyph" data-order="7" d="M610,64 C566,156 522,250 484,340"/>
              <path class="jx-glyph" data-order="8" d="M78,264 C58,252 32,254 24,272 C16,290 42,296 62,302 C84,308 100,318 90,338 C78,360 42,358 28,340"/>
              <path class="jx-glyph" data-order="9" d="M132,246 L118,322 M100,270 L150,262"/>
              <path class="jx-glyph" data-order="10" d="M172,270 C172,292 170,310 176,322 C184,336 204,334 214,320 C220,310 222,292 220,270"/>
              <path class="jx-glyph" data-order="11" d="M300,222 C296,258 292,296 290,326 M290,284 C280,270 258,268 248,282 C238,296 244,318 262,324 C278,330 292,318 292,300"/>
              <path class="jx-glyph" data-order="12" d="M336,278 L332,326"/>
              <circle class="jx-glyph" data-order="13" cx="335" cy="254" r="1.4"/>
              <path class="jx-glyph" data-order="14" d="M410,272 C390,270 376,286 378,306 C380,326 398,338 418,334 C438,330 448,312 444,292 C440,274 426,270 410,272 Z"/>
            </g>
            <circle class="jx-splash" id="jxSplashA" cx="606" cy="338" r="3" filter="url(#jxSplash)"/><circle class="jx-splash" id="jxSplashB" cx="484" cy="340" r="3" filter="url(#jxSplash)"/>
            <g class="jx-pen" id="jxPen"><circle class="jx-pen-halo" r="11"/><circle class="jx-pen-core" r="3.2"/></g>
          </svg>
        </div>
      </div>

      <div class="bol-stage bol-stage-game" id="bolStageGame" aria-hidden="true">
        <div class="bol-old-vignette"></div><div class="bol-old-grain"></div>
        <div class="bol-game-card">
          <div class="bol-film-mark"><span></span><span></span><span></span></div>
          <div class="bol-game-kicker">JOSHUAX STUDIOS PRESENTS</div>
          <div class="bol-game-logo">BOLS<span>2</span></div>
          <div class="bol-game-title">BOX OFFICE LEGENDS</div>
          <div class="bol-game-subtitle">2.0</div>
          <div class="bol-game-status" id="bolGameStatus">INITIALIZING GAME…</div>
          <div class="bol-game-progress"><div id="bolGameFill"></div></div>
          <div class="bol-game-percent" id="bolGamePct">0%</div>
        </div>
      </div>`;
    document.body.appendChild(o);

    const jx=document.getElementById('bolStageJX'), game=document.getElementById('bolStageGame');
    const glyphs=Array.from(o.querySelectorAll('.jx-glyph[data-order]')).sort((a,b)=>+a.dataset.order-+b.dataset.order);
    const lengths=glyphs.map(g=>{try{return g.getTotalLength()}catch(e){return 6}});
    const totalLen=lengths.reduce((a,b)=>a+b,0),spans=[];let cum=0;
    lengths.forEach(l=>{spans.push([cum,cum+l]);cum+=l});
    const pen=document.getElementById('jxPen'),sa=document.getElementById('jxSplashA'),sb=document.getElementById('jxSplashB');
    const emberHost=document.getElementById('jxEmbers'),embers=[];
    for(let i=0;i<16;i++){const el=document.createElement('i');const z=1.5+Math.random()*2.5;el.style.width=z+'px';el.style.height=z+'px';emberHost.appendChild(el);embers.push({el,x:Math.random()*100,y:40+Math.random()*60,s:3+Math.random()*6,p:Math.random()*6.28})}
    const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,clamp=x=>Math.max(0,Math.min(1,x));
    let start=performance.now(),last=performance.now(),done=false;
    function animateJX(now){
      if(done)return;
      const elapsed=now-start,t=Math.min(1,elapsed/7200),drawT=clamp((t-.03)/.69),drawn=drawT*totalLen;
      let px=null,py=null;
      glyphs.forEach((g,i)=>{const len=lengths[i]||1,s0=spans[i][0],local=clamp((drawn-s0)/len);g.style.strokeDasharray=len;g.style.strokeDashoffset=len*(1-local);g.style.opacity=local>0?1:0;g.style.fill='url(#jxInk)';g.style.fillOpacity=ease(clamp((t-(.03+(spans[i][1]/totalLen)*.69)-.1)/.1));if(drawn>=s0&&drawn<=s0+len){try{const p=g.getPointAtLength(local*len);px=p.x;py=p.y}catch(e){}}});
      if(px!==null&&t>.03&&t<.72){pen.style.opacity=1;pen.setAttribute('transform',`translate(${px},${py})`)}else pen.style.opacity=0;
      const splash=clamp((t-.72)/.08);[sa,sb].forEach(s=>{s.setAttribute('r',3+splash*42);s.style.opacity=splash<1?(1-splash)*.9:0});
      const glow=clamp((t-.8)/.1);jx.style.filter=`drop-shadow(0 0 ${18+glow*22}px rgba(245,183,46,${.15+glow*.28}))`;
      const dt=Math.min(50,now-last);last=now;embers.forEach(e=>{e.y-=e.s*dt/1000;e.x+=Math.sin(now/1000+e.p)*.02;if(e.y<-5){e.y=100+Math.random()*10;e.x=Math.random()*100}e.el.style.left=e.x+'%';e.el.style.top=e.y+'%';e.el.style.opacity=.18+glow*.5});
      if(elapsed<7200)requestAnimationFrame(animateJX);else transitionToGame();
    }
    function transitionToGame(){jx.classList.add('is-done');game.classList.add('is-active');game.setAttribute('aria-hidden','false');runGameStage();}
    function runGameStage(){const duration=4800,st=performance.now(),fill=document.getElementById('bolGameFill'),pct=document.getElementById('bolGamePct'),status=document.getElementById('bolGameStatus'),states=['INITIALIZING GAME…','LOADING STUDIO DATA…','PREPARING INDUSTRY…','LOADING FILMS & TALENT…','RESTORING GAME SYSTEMS…','READY'];let lastState='';function f(now){const p=clamp((now-st)/duration),n=Math.round(p*100);fill.style.width=n+'%';pct.textContent=n+'%';const idx=Math.min(states.length-1,Math.floor(p*states.length));if(states[idx]!==lastState){status.textContent=states[idx];lastState=states[idx]}if(p<1)requestAnimationFrame(f);else{status.textContent='READY';const finish=()=>{o.classList.add('bol-loading-finished');setTimeout(()=>o.remove(),650)};if(window.__BOLS2_STARTUP_READY__) setTimeout(finish,300);else window.addEventListener('BOLS2_STARTUP_READY',()=>setTimeout(finish,300),{once:true})}}requestAnimationFrame(f)}
    requestAnimationFrame(animateJX);
  }
  if(document.body)boot();else document.addEventListener('DOMContentLoaded',boot,{once:true});
})();