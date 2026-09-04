/* BOLS MEDIA CORE v388
   Turns BOLS Media from a visual shell into a persistent gameplay system.
   It sits after the existing media modules so legacy UI can stay intact while
   this layer owns progression, creator coverage, audience sentiment and film impact. */
(()=>{
  const STORE='bol2_media_hub_v1';
  const read=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch{return{}}};
  const write=d=>{try{localStorage.setItem(STORE,JSON.stringify(d));return true}catch{return false}};
  const st=()=>window.__BOL_STATE__||{};
  const abs=s=>((Number(s.year||1)-1)*52)+Number(s.week||1);
  const films=s=>[...(s.films||[]),...(s.filmography||[])].filter((f,i,a)=>f&&f.title&&a.findIndex(x=>String(x.id)===String(f.id))===i);
  const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const fmt=n=>{n=Number(n||0);return n>=1e9?(n/1e9).toFixed(1)+'B':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(0)+'K':String(Math.round(n))};
  const genreEmoji=g=>({Action:'💥',Horror:'👻',Romance:'💗','Sci-Fi':'🚀',Comedy:'😂',Drama:'🎭',Fantasy:'🧙',Thriller:'🔪',Animation:'✨',Adventure:'🗺️'}[g]||'🎬');
  const get=()=>{const d=read();d.mediaCore=d.mediaCore||{version:1,followers:0,totalReach:0,weeklyReach:{},filmImpact:{},creatorCoverage:{},processedAbs:0};d.mediaCore.weeklyReach=d.mediaCore.weeklyReach||{};d.mediaCore.filmImpact=d.mediaCore.filmImpact||{};d.mediaCore.creatorCoverage=d.mediaCore.creatorCoverage||{};return d};
  const eligible=f=>f&&(['marketing','scheduled','released','completed'].includes(f.stage)||f.industry?.media?.released);
  const filmScore=f=>Math.max(5,Math.min(100,Number(f.quality||60)*.34+Number(f.audience||55)*.26+Number(f.hype||f.marketingHype||55)*.25+Number(f.prestige||50)*.15));
  function ensureChannel(d,s){d.channel=d.channel||{};d.channel.subscribers=Number(d.channel.subscribers||0);d.mediaVideos=d.mediaVideos||{};return d}
  function process(s,force=false){
    if(!s||!s.week)return;
    const now=abs(s),d=ensureChannel(get(),s),core=d.mediaCore;
    if(!force&&Number(core.processedAbs||0)>=now){write(d);return d}
    const previous=Number(core.processedAbs||now-1);
    for(let w=Math.max(1,previous+1);w<=now;w++){
      let reach=0;
      Object.values(d.mediaVideos).forEach(v=>{
        if(!v?.title||Number(v.createdAbs||0)>w)return;
        if(v.status==='SCHEDULED'&&Number(v.createdAbs||0)<=w)v.status='PUBLISHED';
        if(v.status!=='PUBLISHED'&&v.status!=='RELEASED')return;
        const age=Math.max(0,w-Number(v.createdAbs||w));
        const f=films(s).find(x=>String(x.id)===String(v.filmId));
        const quality=Number(f?.quality||60),audience=Number(f?.audience||55),hype=Number(f?.hype||f?.marketingHype||55);
        const type=String(v.type||'Video').toLowerCase();
        const mult=type.includes('short')?1.35:type.includes('trailer')?1.18:type.includes('live')?1.05:.9;
        const burst=age===0?2.15:age===1?1.55:age===2?1.22:Math.max(.22,Math.pow(.79,age-2));
        const base=Math.max(300,Number(v.views||0)||Math.round(audience*quality*2.1));
        const gain=Math.max(80,Math.round(base*.16*burst*mult*(.72+quality/260+hype/500)));
        v.weeklyHistory=v.weeklyHistory||{};v.weeklyHistory[String(w)]=gain;v.views=Number(v.views||0)+gain;
        v.likes=Number(v.likes||0)+Math.max(1,Math.round(gain*(.028+quality/4000)));
        v.comments=Number(v.comments||0)+Math.max(1,Math.round(gain*(.0011+audience/18000)));
        v.shares=Number(v.shares||0)+Math.max(1,Math.round(gain*(.003+audience/12000)));
        v.lastProcessedAbs=w;reach+=gain;
      });
      const own=films(s).filter(eligible);
      own.forEach(f=>{
        const id='film-'+f.id+'-trailer',v=d.mediaVideos[id];
        if(!v)return;
        const related=Object.values(d.mediaVideos).filter(x=>x?.filmId!=null&&String(x.filmId)===String(f.id));
        const total=related.reduce((n,x)=>n+Number(x.views||0),0);
        const likes=related.reduce((n,x)=>n+Number(x.likes||0),0), comments=related.reduce((n,x)=>n+Number(x.comments||0),0), shares=related.reduce((n,x)=>n+Number(x.shares||0),0);
        const creator=Number(core.creatorCoverage[f.id]?.views||0), sentiment=Number(core.creatorCoverage[f.id]?.sentiment||0);
        const engagement=(likes*1.4+comments*2.3+shares*3.2+creator*.18)/Math.max(1,total+creator*.3);
        const awareness=Math.min(100,(total/Math.max(1,Number(f.audience||55)*Number(f.quality||60)*2200))*100);
        const mediaScore=Math.max(0,Math.min(100,awareness*.56+engagement*100*.16+Number(f.hype||f.marketingHype||55)*.28+sentiment*7));
        core.filmImpact[f.id]={reach:total+creator,engagement:Number(engagement.toFixed(4)),sentiment:Number(sentiment.toFixed(3)),score:Number(mediaScore.toFixed(1)),updatedAbs:w};
        f.industry=f.industry||{};f.industry.media=f.industry.media||{};f.industry.media.mediaScore=Number(mediaScore.toFixed(1));f.industry.media.mediaReach=total+creator;f.industry.media.mediaSentiment=sentiment;
        if(w===now&&eligible(f)){
          const delta=Math.max(-1.05,Math.min(1.35,(mediaScore-55)/42));
          const current=Number(f.hype||f.marketingHype||55);f.hype=Math.max(0,Math.min(100,Number((current+delta).toFixed(2))));
        }
        if(total>15000&&Number(core.creatorCoverage[f.id]?.lastTrigger||0)<w){
          const coverage=core.creatorCoverage[f.id]||{};const seed=Math.sin((Number(f.id)||1)*17+w)*.5+.5;
          coverage.views=Number(coverage.views||0)+Math.round(total*(.012+.018*seed));
          coverage.count=Number(coverage.count||0)+1;
          coverage.sentiment=Math.max(-1,Math.min(1,Number(coverage.sentiment||0)+((filmScore(f)-58)/1000)*(seed>.5?1:-.6)));
          coverage.lastTrigger=w;core.creatorCoverage[f.id]=coverage;
        }
      });
      const live=(d.channel.liveEvents||[]).filter(x=>String(x.status)==='SCHEDULED'&&Number(x.week)===Number(s.week)&&Number(x.year||s.year)===Number(s.year));
      live.forEach(ev=>{const f=films(s).find(x=>String(x.id)===String(ev.filmId));const base=Math.max(1000,Math.round(Number(f?.audience||55)*Number(f?.quality||60)*.82));ev.status='COMPLETED';ev.viewers=Math.round(base*(1+Number(d.channel.subscribers||0)/180000)*(.85+Math.random()*.45));ev.engagement=Math.round(ev.viewers*(.06+.04*Math.random()));ev.hypeImpact=Number((Math.min(2.2,ev.engagement/9000)).toFixed(2));if(f){f.hype=Math.max(0,Math.min(100,Number(f.hype||55)+ev.hypeImpact));const ci=core.filmImpact[f.id]||{};ci.reach=Number(ci.reach||0)+ev.viewers;ci.score=Math.min(100,Number(ci.score||50)+ev.hypeImpact*3);core.filmImpact[f.id]=ci;}});
      const posts=d.channel.posts||[];posts.forEach(p=>{if(Number(p._lastMediaAbs||0)>=w)return;const age=Math.max(0,w-Number(p.week||w)),f=films(s).find(x=>String(x.id)===String(p.filmId));const seed=Math.max(8,Math.round((Number(s.reputation||s.prestige||50)+Number(f?.audience||55))*(age===0?1.7:.75)));p.likes=Number(p.likes||0)+seed;p.comments=Number(p.comments||0)+Math.max(1,Math.round(seed*.045));p.shares=Number(p.shares||0)+Math.max(1,Math.round(seed*.018));p._lastMediaAbs=w;if(f)f.hype=Math.max(0,Math.min(100,Number(f.hype||55)+Math.min(0.45,seed/6000)));});
      core.weeklyReach[String(w)]=reach;
      core.totalReach=Number(core.totalReach||0)+reach;
    }
    core.processedAbs=now;core.lastProcessedWeek=Number(s.week);core.lastProcessedYear=Number(s.year);write(d);
    try{window.saveCurrent?.(s,true)}catch{}
    return d;
  }
  function impact(f,s){const d=get(),i=d.mediaCore.filmImpact[f?.id]||{};const score=Number(i.score||50);return {score,reach:Number(i.reach||0),sentiment:Number(i.sentiment||0),hypeDelta:Number(((score-50)/30).toFixed(1)),conversion:Number(Math.max(0,Math.min(100,score*.72+Number(f?.quality||60)*.18)).toFixed(1))};}
  function toast(t){let n=document.querySelector('.notice');if(!n){n=document.createElement('div');n.className='notice';document.body.appendChild(n)}n.textContent=t;n.classList.add('show');clearTimeout(n._mediaT);n._mediaT=setTimeout(()=>n.classList.remove('show'),1800)}
  function renderCore(){
    const root=document.querySelector('.mediaHubModal');if(!root)return;const c=root.querySelector('#mediaContent');if(!c)return;
    let old=c.querySelector('.mediaCoreDashboard');if(old)old.remove();
    const s=st(),d=get(),own=films(s).filter(eligible),core=d.mediaCore;
    const total=Number(core.totalReach||0),followers=Number(d.channel?.subscribers||core.followers||0);
    const rows=own.slice().sort((a,b)=>Number((core.filmImpact[b.id]||{}).score||0)-Number((core.filmImpact[a.id]||{}).score||0)).slice(0,6);
    const trend=Object.entries(core.weeklyReach||{}).slice(-8).map(([w,v])=>({w,v:Number(v||0)}));
    const max=Math.max(1,...trend.map(x=>x.v));
    const dash=document.createElement('section');dash.className='mediaCoreDashboard';
    dash.innerHTML=`<div class="m388Top"><div><small>BOLS MEDIA · LIVE SIMULATION</small><h2>Your media now has consequences.</h2><p>Every upload builds reach. Creator reactions shape sentiment. Media momentum feeds directly into film hype.</p></div><div class="m388Live"><i></i> WEEK ${esc(s.week||1)} · YEAR ${esc(s.year||1)}</div></div>
      <div class="m388Kpis"><article><small>TOTAL REACH</small><b>${fmt(total)}</b><span>all formats</span></article><article><small>SUBSCRIBERS</small><b>${fmt(followers)}</b><span>channel audience</span></article><article><small>WEEKLY REACH</small><b>${fmt(trend.at(-1)?.v||0)}</b><span>latest processed week</span></article><article><small>FILMS IN CAMPAIGN</small><b>${own.length}</b><span>active projects</span></article></div>
      <div class="m388Grid"><section class="m388Panel"><div class="m388Head"><div><small>MEDIA → FILM ENGINE</small><h3>Campaign impact</h3></div><button data-m388-action="analytics">FULL ANALYTICS →</button></div>${rows.length?rows.map(f=>{const i=impact(f,s),sent=i.sentiment>0.12?'POSITIVE':i.sentiment<-0.12?'NEGATIVE':'MIXED';return `<div class="m388Film"><div class="m388FilmArt">${genreEmoji(f.genre)}</div><div class="m388FilmInfo"><b>${esc(f.title)}</b><span>${esc(f.genre||'Film')} · Hype ${Math.round(Number(f.hype||f.marketingHype||55))}/100</span><div class="m388Bar"><i style="width:${Math.min(100,i.score)}%"></i></div></div><div class="m388Impact"><strong>${i.score.toFixed(0)}</strong><small>MEDIA SCORE</small><em class="${sent.toLowerCase()}">${sent}</em></div></div>`}).join(''):`<div class="m388Empty"><b>No active campaigns yet.</b><span>As films enter marketing, BOLS Media will start tracking their audience.</span></div>`}</section>
      <section class="m388Panel"><div class="m388Head"><div><small>WEEKLY MOMENTUM</small><h3>Audience reach</h3></div><span>LAST 8 WEEKS</span></div><div class="m388Chart">${trend.map(x=>`<div><i style="height:${Math.max(6,Math.round(x.v/max*100))}%"></i><small>W${((Number(x.w)-1)%52)+1}</small></div>`).join('')||'<span class="m388ChartEmpty">Publish content to generate your first data point.</span>'}</div><div class="m388ChartLegend"><span>● Reach grows from publishing, shares & creator discovery</span></div></section></div>
      <div class="m388Actions"><button data-m388-action="video">＋ PUBLISH VIDEO</button><button data-m388-action="short">＋ PUBLISH SHORT</button><button data-m388-action="post">＋ COMMUNITY POST</button><button data-m388-action="live">＋ SCHEDULE LIVE</button></div>`;
    c.prepend(dash);
    dash.querySelectorAll('[data-m388-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.m388Action;if(a==='analytics'){window.openMediaAnalytics?.();return}if(a==='video'){window.openMediaCreator?.();return}if(a==='short'){window.openMediaCreator?.();setTimeout(()=>document.querySelector('[data-kind="short"]')?.click(),80);return}if(a==='post'){window.openMediaPostComposer?.();return}if(a==='live'){window.openMediaLiveCenter?.();return}});
  }
  const oldProcess=window.processBOLSMediaViews;
  window.processBOLSMediaViews=()=>{try{oldProcess?.()}catch(e){console.warn('BOLS Media legacy processor:',e)}return process(st())};
  const oldOpen=window.openBOLSMedia;
  if(oldOpen&&!window.__BOLSMediaCoreWrapped){window.__BOLSMediaCoreWrapped=true;window.openBOLSMedia=()=>{oldOpen();setTimeout(()=>{process(st());renderCore()},70)}}
  const mo=new MutationObserver(()=>{const root=document.querySelector('.mediaHubModal');if(root&&!root.dataset.m388){root.dataset.m388='1';setTimeout(()=>{process(st());renderCore()},40)}});mo.observe(document.body,{childList:true,subtree:true});
  window.BOLSMediaCore={process,impact,render:renderCore,getState:get};
  setTimeout(()=>{try{process(st())}catch{}},1000);
})();