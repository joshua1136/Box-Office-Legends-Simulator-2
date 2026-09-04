/* BOLS2 v387 — simulation coherence + studio pulse + living community polish.
   Deliberately sits above the accumulated legacy patches so the existing game remains intact. */
(()=>{
  const GAME='bol2_settings_v1', MEDIA='bol2_media_hub_v1';
  const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const readSettings=()=>{try{return {...{difficulty:'Standard',autosave:true,animations:true,music:60,sfx:70},...JSON.parse(localStorage.getItem(GAME)||'{}')}}catch{return {difficulty:'Standard',autosave:true,animations:true,music:60,sfx:70}}};
  const readMedia=()=>{try{return JSON.parse(localStorage.getItem(MEDIA)||'{}')}catch{return{}}};
  const writeMedia=x=>{try{localStorage.setItem(MEDIA,JSON.stringify(x));return true}catch{return false}};
  const st=()=>window.__BOL_STATE__;
  const money=n=>{n=Number(n||0);return n>=1e9?'$'+(n/1e9).toFixed(2)+'B':n>=1e6?'$'+(n/1e6).toFixed(1)+'M':n>=1e3?'$'+Math.round(n/1e3)+'K':'$'+Math.round(n)};

  /* Make the three founding choices and Settings difficulty actually influence the commercial engine. */
  const engine=window.BOLS2MovieEngine;
  if(engine?.outlook&&!engine.__v387Wrapped){
    const original=engine.outlook;
    engine.outlook=(state,film,opts={})=>{
      const m=original(state,film,opts); const studio=state?.studio||{}, specialty=String(studio.specialty||''), philosophy=String(studio.philosophy||''), difficulty=String(readSettings().difficulty||'Standard');
      let q=0,a=0,stars=0,commercial=0,demand=0,wom=0;
      if(specialty==='Blockbuster Entertainment'){stars+=3;commercial+=3}
      if(specialty==='Prestige Cinema'){q+=3;wom+=2;a-=1}
      if(specialty==='Commercial Entertainment'){commercial+=4;a+=2}
      if(specialty==='Genre Films'){demand+=4;q+=1}
      if(specialty==='Animation'&&film.genre==='Animation'){q+=5;a+=4}
      if(specialty==='Independent Cinema'){q+=2;commercial-=1}
      if(specialty==='Television & Streaming'){a+=2;wom+=2}
      if(specialty==='Global Cinema'){a+=3;demand+=2}
      if(philosophy==='Make Money')commercial+=4;
      if(philosophy==='Creative First'){q+=3;wom+=2}
      if(philosophy==='Star Power')stars+=5;
      if(philosophy==='Global Cinema'){a+=3;demand+=2}
      if(philosophy==='Prestige'){q+=4;wom+=3}
      if(difficulty==='Casual'){a+=3;wom+=2}
      if(difficulty==='Industry'){a-=3;commercial-=2;demand-=2}
      m.quality=Math.max(1,Math.min(99,Math.round(m.quality+q)));
      m.audience=Math.max(1,Math.min(99,Math.round(m.audience+a)));
      m.starPower=Math.max(1,Math.min(99,Math.round(m.starPower+stars)));
      m.commercial=Math.max(1,Math.min(99,Math.round(m.commercial+commercial)));
      m.genreDemand=Math.max(1,Math.min(99,Math.round(m.genreDemand+demand)));
      m.wordOfMouth=Math.max(1,Math.min(99,Math.round(m.wordOfMouth+wom)));
      m.overall=Math.max(1,Math.min(99,Math.round((m.opening*.44+m.legs*.56)+q*.15+a*.08+wom*.08)));
      m.hitProbability=Math.max(5,Math.min(95,Math.round(m.hitProbability+q*.55+a*.3+stars*.18+commercial*.2+demand*.2)));
      m.tier=m.quality>=95?'MASTERPIECE':m.quality>=90?'OUTSTANDING':m.quality>=83?'EXCELLENT':m.quality>=75?'STRONG':m.quality>=65?'DECENT':m.quality>=55?'BELOW AVERAGE':m.quality>=40?'POOR':'DISASTER';
      /* Recompute the presentation-only commercial projection from the adjusted score; actual weekly play still uses the core engine inputs. */
      const budget=Number(film?.budget||30000000), market=(Number(state?.industry?.boxOfficeIndex||100)/100)*.7+(Number(state?.industry?.marketHealth||82)/100)*.3;
      const factor=1+(m.quality-60)*.007+(m.commercial-60)*.006+(m.starPower-60)*.0025;
      m.mostLikely=Math.max(Math.round(budget*1.15),Math.round(budget*Math.max(.72,factor)*market));
      m.studioShare=m.mostLikely*(Number(m.studioSharePct||55)/100);
      m.investment=budget+Number(opts.marketing||film.marketingBudget||0);m.profit=m.studioShare-m.investment;m.breakEven=m.investment/Math.max(.01,Number(m.studioSharePct||55)/100);
      return m;
    };
    engine.__v387Wrapped=true;
  }

  function communityPulse(){
    const s=st(); if(!s)return;
    const d=readMedia(), posts=Array.isArray(d.channel?.posts)?d.channel.posts:[]; if(!posts.length)return;
    const abs=(Number(s.year||1)-1)*52+Number(s.week||1); let changed=false;
    d.bmc=d.bmc||{};d.bmc.comments=d.bmc.comments||{};
    posts.forEach(p=>{
      const created=(Number(p.year||s.year)-1)*52+Number(p.week||s.week), age=abs-created;
      if(age<0||Number(p.lastPulseAbs||created)>=abs)return;
      const base=Math.max(1,Number(p.likes||0)), reach=Math.max(1,Math.round(base*(.16+Math.min(1.1,Math.max(0,Number(s.reputation||35)/100))*.12)));
      const film=(s.films||[]).concat(s.filmography||[]).find(f=>String(f.id)===String(p.filmId));
      const quality=Number(film?.quality||60),aud=Number(film?.audience||55);
      const momentum=(quality+aud)/200, weeklyLikes=Math.max(1,Math.round(reach*(.65+momentum*.7)));
      const decay=age>8?.45:age>4?.72:1;
      p.likes=base+Math.max(1,Math.round(weeklyLikes*decay));
      p.comments=Math.max(Number(p.comments||0),Math.round(p.likes*.025));p.shares=Math.max(Number(p.shares||0),Math.round(p.likes*.009));
      p.lastPulseAbs=abs;changed=true;
      /* Once a post has aged, creators can organically join the conversation. */
      if(age>=1&&age%2===1&&Math.random()<.7){
        const bank=['CinemaDaily','FilmNerd88','The Movie Room','FrameByFrame','ScreenTalk','The Reel Report','Cinephile Central','Behind The Lens'];
        const author=bank[(abs+String(p.id).length)%bank.length], arr=d.bmc.comments[p.id]||[];
        if(!arr.some(c=>c.name===author)){
          const subject=p.filmTitle||'the update';
          const lines=[`This is actually getting interesting. 👀`,`Okay, ${subject} has my attention now.`,`The campaign strategy here is smart.`,`I need to see how this develops. 🎬`,`This deserves way more discussion.`];
          arr.unshift({name:author,text:lines[(abs+author.length)%lines.length]});d.bmc.comments[p.id]=arr.slice(0,8);changed=true;
        }
      }
    });
    if(changed)writeMedia(d);
  }

  function dashboardPulse(){
    const root=document.querySelector('.studioDash'); if(!root||root.dataset.v387)return;
    root.dataset.v387='1'; const s=st(); if(!s)return;
    const films=[...(s.films||[]),...(s.filmography||[])];
    const active=(s.films||[]).filter(f=>!['completed'].includes(f.stage));
    const released=films.filter(f=>Number(f.finalBoxOffice||f.boxOffice||0)>0);
    const gross=released.reduce((n,f)=>n+Number(f.finalBoxOffice||f.boxOffice||0),0);
    const revenue=(s.transactions||[]).filter(t=>Number(t.amount||0)>0&&['boxoffice','streaming','revenue'].includes(String(t.type||'').toLowerCase())).reduce((n,t)=>n+Number(t.amount||0),0);
    const weeklyBurn=650000+active.reduce((n,f)=>n+Number(f.stage==='released'?0:(f.budget||0)*.004),0);
    const cash=Number(s.money||0), runway=weeklyBurn>0?Math.floor(cash/weeklyBurn):99;
    const top=active.slice().sort((a,b)=>Number(b.quality||50)-Number(a.quality||50))[0];
    const nextRival=typeof window.getIndustryReleases==='function'?window.getIndustryReleases(s,s.week,s.week+4).find(r=>r):null;
    const panel=document.createElement('section');panel.className='v387PulseCard';panel.innerHTML=`<div class="v387PulseHead"><div><small>STUDIO PULSE · LIVE SIMULATION</small><h3>Know your position before you press NEXT WEEK.</h3></div><span class="v387Live"><i></i> LIVE</span></div><div class="v387PulseGrid"><div><small>FILM SLATE</small><b>${active.length}</b><span>${active.length?'Active project'+(active.length===1?'':'s'):'No active projects'}</span></div><div><small>LIFETIME BOX OFFICE</small><b>${money(gross)}</b><span>${released.length} released title${released.length===1?'':'s'}</span></div><div><small>REPORTED REVENUE</small><b>${money(revenue)}</b><span>Tracked studio income</span></div><div><small>CASH RUNWAY</small><b>${runway>=99?'99+':runway} WEEKS</b><span>At current operating burn</span></div></div><div class="v387PulseBottom"><div><small>RECOMMENDED FOCUS</small><b>${top?esc(top.title):'Start your first production'}</b><span>${top?`${esc(top.stage==='development'?'Develop the script':top.stage==='preproduction'?'Finish casting':top.stage==='production'?'Protect the schedule':top.stage==='postproduction'?'Polish the final cut':top.stage==='marketing'?'Build awareness':'Prepare the release')}`:'Build a movie and establish your slate.'}</span></div><div><small>MARKET WATCH</small><b>${nextRival?`${esc(nextRival.studio)} · W${nextRival.releaseWeek}`:'Market is quiet'}</b><span>${nextRival?`${esc(nextRival.title)} · ${esc(nextRival.genre)} competition`:'Use Trends to plan your next release window.'}</span></div></div>`;
    const anchor=root.querySelector('.dashGrid'); if(anchor)anchor.appendChild(panel);
    const stats=root.querySelectorAll('.dashCard.snapshot .metricGrid>div');
    if(stats[0]){stats[0].querySelector('b').textContent=String(films.length);stats[0].querySelector('span').textContent='Films';}
    if(stats[2]){stats[2].querySelector('b').textContent=money(revenue);stats[2].querySelector('span').textContent='Revenue tracked';}
    if(stats[3]){stats[3].querySelector('b').textContent=String(Object.keys(s.talentContracts||{}).length);stats[3].querySelector('span').textContent='Active contracts';}
    if(stats[4]){stats[4].querySelector('b').textContent=String(Math.max(0,new Set(released.map(f=>f.releaseYear||s.year)).size));stats[4].querySelector('span').textContent='Release markets';}
  }

  function observe(){
    communityPulse(); dashboardPulse();
    const mo=new MutationObserver(()=>{communityPulse();dashboardPulse()}); mo.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
  const oldProcess=window.processBOLSMediaViews;
  if(oldProcess&&!window.__BOLSMEDIA_V387__){window.__BOLSMEDIA_V387__=true;window.processBOLSMediaViews=()=>{try{oldProcess()}catch(err){console.warn('v387 media base processor:',err)}try{communityPulse()}catch(err){console.warn('v387 community pulse:',err)}}}
})();