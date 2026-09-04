(()=>{
'use strict';
const E=()=>window.BOLSMediaEngine;
const S=()=>window.__BOL_STATE__||window.state||{};
const abs=s=>((Number(s?.year||1)-1)*52)+Number(s?.week||1);
const fmt=n=>{n=Number(n||0);if(n>=1e9)return(n/1e9).toFixed(1)+'B';if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(0)+'K';return Math.round(n)};
const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
const creators=[
{name:'CinemaDaily',followers:4200000,influence:88,style:'mainstream',bias:'blockbusters'},
{name:'FilmNerd88',followers:1800000,influence:92,style:'cinephile',bias:'prestige'},
{name:'The Movie Room',followers:3100000,influence:76,style:'general',bias:'crowd-pleasers'},
{name:'FrameByFrame',followers:950000,influence:84,style:'craft',bias:'filmmaking'},
{name:'ScreenTalk',followers:670000,influence:71,style:'pop culture',bias:'stars'},
{name:'The Reel Report',followers:2400000,influence:86,style:'industry',bias:'business'}
];
function ensure(c){
 c.strategy=c.strategy||'balanced'; c.hook=Number(c.hook||50); c.audienceFit=Number(c.audienceFit||50);
 c.momentum=Number(c.momentum||0); c.trending=!!c.trending; c.viral=!!c.viral; return c;
}
function score(c,f,w){
 ensure(c); const q=Number(f?.quality||60),a=Number(f?.audience||55),h=Number(f?.hype||f?.marketingHype||55);
 const strategy={balanced:[1,1],viral:[1.2,.72],informative:[.88,1.18],emotional:[1.08,1.08],controversial:[1.3,.52]}[c.strategy]||[1,1];
 const format=c.kind==='short'?1.55:c.kind==='live'?1.28:c.kind==='video'?1.08:.72;
 const hook=Math.max(.55,Math.min(1.55,Number(c.hook)/70));
 const fit=Math.max(.55,Math.min(1.5,Number(c.audienceFit)/65));
 const trend=f&&String(S().industry?.trend||'')===String(f.genre||'')?1.18:1;
 const age=Math.max(0,w-Number(c.createdAbs||w));
 const decay=age===0?2.35:age===1?1.55:age===2?1.18:Math.max(.12,Math.pow(.76,age-2));
 const quality=.55+q/145+a/210+h/240;
 const reach=Math.max(25,Math.round((q*a*1.65+Number(c.views||0)*.08+600)*format*hook*fit*strategy[0]*trend*decay*quality));
 const sentiment=Math.max(-1,Math.min(1,(q-58)/70+(a-55)/140+(c.strategy==='controversial'?.18:0)-(c.strategy==='viral'?.03:0)));
 const shareRate=Math.max(.001,Math.min(.08,(.008+q/5200)*hook*(c.strategy==='viral'?1.45:1)*(c.strategy==='controversial'?.75:1)));
 return {reach,sentiment,shareRate};
}
const oldPublish=E()?.publish;
if(oldPublish){
 E().publish=(input={})=>{
  const c=oldPublish.call(E(),input); ensure(c); c.strategy=input.strategy||c.strategy; c.hook=Number(input.hook||c.hook); c.audienceFit=Number(input.audienceFit||c.audienceFit); E().commit(E().read()); return c;
 };
}
function algorithmPass(d){
 const s=S(),w=abs(s); let weekly=0;
 d.content.forEach(c=>{
  ensure(c); if(c.status!=='PUBLISHED'||Number(c.createdAbs)>w)return;
  const f=(s.films||[]).find(x=>String(x.id)===String(c.filmId)); const z=score(c,f,w);
  const gain=z.reach; const old=Number(c.views||0);
  c.views=old+gain;
  c.likes+=Math.max(1,Math.round(gain*(.014+z.sentiment*.006)));
  c.comments+=Math.max(1,Math.round(gain*(.0007+Math.max(0,z.sentiment)*.001)));
  c.shares+=Math.max(1,Math.round(gain*z.shareRate));
  c.saves=Number(c.saves||0)+Math.max(0,Math.round(gain*.0015));
  c.weeklyHistory=c.weeklyHistory||{}; c.weeklyHistory[String(w)]=Number(c.weeklyHistory[String(w)]||0)+gain;
  const engagement=(c.likes+c.comments*2+c.shares*4+c.saves*3)/Math.max(1,c.views);
  c.momentum=Math.min(100,Math.round((gain/Math.max(1,gain+old))*1800+Number(c.momentum||0)*.65));
  c.trending=c.momentum>55;
  if(gain>12000&&engagement>.035&&!c.viral){
   c.viral=true;
   const cr=creators[(w+c.title.length)%creators.length];
   d.game.creatorReactions=d.game.creatorReactions||[];
   const r={id:'algo-'+c.id+'-'+w,week:w,filmId:f?.id||null,filmTitle:f?.title||c.filmTitle||'',creator:cr.name,followers:cr.followers,influence:cr.influence,sentiment:engagement>.06?.8:.35,views:Math.round(c.views*.018),type:'viral-reaction',contentId:c.id};
   d.game.creatorReactions.unshift(r); d.game.creatorReactions=d.game.creatorReactions.slice(0,100);
   d.game.events=d.game.events||[];
   d.game.events.unshift({week:w,year:s.year,type:'viral',contentId:c.id,filmId:f?.id||null,title:c.title+' is going viral',detail:cr.name+' picked it up after the algorithm spike.',reach:c.views});
   d.game.events=d.game.events.slice(0,60);
   if(f)f.hype=Math.min(100,Number(f.hype||55)+.9);
  }
  if(f){
   f.industry=f.industry||{}; f.industry.media=f.industry.media||{};
   f.industry.media.audienceAwareness=Math.min(100,Number(f.industry.media.audienceAwareness||0)+Math.min(2.5,gain/180000));
   f.industry.media.mediaSentiment=Number((Number(f.industry.media.mediaSentiment||0)+z.sentiment*.08).toFixed(2));
   const hype=Number(f.hype||f.marketingHype||55);
   f.hype=Math.max(0,Math.min(100,hype+(z.sentiment>0?Math.min(1.1,gain/70000):-Math.min(.8,Math.abs(z.sentiment)*gain/110000))));
  }
  weekly+=gain;
 });
 d.game.lastAlgorithmWeek=w; d.game.lastAlgorithmReach=weekly; return d;
}
const oldProcess=E()?.processWeek;
if(oldProcess){
 E().processWeek=(force=false)=>{
  const d=oldProcess.call(E(),force); if(!d?.game)return d;
  if(d.game.lastAlgorithmWeek!==abs(S())){algorithmPass(d);E().commit(d)}
  return d;
 };
}
function renderAlgorithm(modal){
 const d=E().processWeek(),s=S(),root=modal.querySelector('#mrContent'); if(!root)return;
 const mine=d.content.filter(x=>x.studio===(s.studioName||'Your Studio')).sort((a,b)=>Number(b.momentum||0)-Number(a.momentum||0));
 const reactions=d.game.creatorReactions||[]; const events=(d.game.events||[]).filter(x=>x.type==='viral').slice(0,8);
 root.innerHTML='<section class="mrPage"><div class="mrPageTop"><div><small>ALGORITHM CONTROL</small><h1>Make the feed work for you.</h1><p>Your strategy changes discovery. There is no guaranteed viral button.</p></div><button id="algoCreate">＋ CREATE CONTENT</button></div><div class="mrAnalytics"><article><small>ALGORITHM REACH</small><b>'+fmt(d.game.lastAlgorithmReach)+'</b><p>Latest simulated pass.</p></article><article><small>TRENDING</small><b>'+mine.filter(x=>x.trending).length+'</b><p>Content receiving extra distribution.</p></article><article><small>VIRAL</small><b>'+mine.filter(x=>x.viral).length+'</b><p>Breakout content.</p></article><article><small>CREATOR REACTIONS</small><b>'+reactions.length+'</b><p>Independent coverage.</p></article></div><div class="mrGrid"><section class="mrCard"><div class="mrHead"><div><small>CONTENT MOMENTUM</small><h2>Your strongest signals</h2></div></div><div class="mrHistory">'+(mine.slice(0,12).map(x=>'<div><b>'+esc(x.title)+'</b><span>'+(x.trending?'🔥 TRENDING · ':'')+(x.viral?'⚡ VIRAL · ':'')+fmt(x.views)+' views · '+Math.round(x.momentum||0)+' momentum</span><i><em style="width:'+Math.max(3,Math.min(100,Math.round(x.momentum||0)))+'%"></em></i></div>').join('')||'<div class="mrEmpty">Publish content to start building momentum.</div>')+'</div></section><section class="mrCard"><div class="mrHead"><div><small>CREATOR RADAR</small><h2>Who is watching?</h2></div></div><div class="mrFeed">'+creators.map(cr=>{const r=reactions.find(x=>x.creator===cr.name);return '<article class="mrPost"><div class="mrPostTop"><span>'+esc(cr.name.slice(0,2).toUpperCase())+'</span><div><b>'+esc(cr.name)+'</b><small>'+fmt(cr.followers)+' followers · '+esc(cr.style)+'</small></div></div><p>'+(r?(r.sentiment>0?'Positive':'Critical')+' coverage of <b>'+esc(r.filmTitle||'your film')+'</b>.':'Waiting for a story worth covering.')+'</p></article>'}).join('')+'</div></section></div><section class="mrCard"><div class="mrHead"><div><small>VIRAL EVENTS</small><h2>When the internet notices</h2></div></div>'+(events.map(v=>'<div class="mrEvent"><b>⚡ '+esc(v.title)+'</b><span>'+esc(v.detail)+'</span><strong>'+fmt(v.reach)+' reach</strong></div>').join('')||'<div class="mrEmpty">No viral moments yet. Experiment with different strategies.</div>')+'</section></section>';
 modal.querySelectorAll('.mrTabs button').forEach(x=>x.classList.toggle('active',x.dataset.t==='algorithm'));
 modal.querySelector('#algoCreate')?.addEventListener('click',()=>window.openMediaCreator?.());
}
const oldOpen=E()?.open;
if(oldOpen){
 E().open=()=>{
  oldOpen.call(E()); const modal=document.querySelector('.mediaRebuildModal'); if(!modal)return;
  const nav=modal.querySelector('.mrTabs'); if(nav&&!nav.querySelector('[data-t="algorithm"]')){
   const b=document.createElement('button');b.dataset.t='algorithm';b.textContent='ALGORITHM';nav.appendChild(b);b.onclick=()=>renderAlgorithm(modal);
  }
 };
 window.openBOLSMedia=E().open;
}
window.BOLSMediaAlgorithmV392={version:392,creators,score,algorithmPass};
})();