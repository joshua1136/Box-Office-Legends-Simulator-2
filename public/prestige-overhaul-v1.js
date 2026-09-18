/* BOLS2 PRESTIGE OVERHAUL v1 — slower studio prestige progression, connected to career history. */
(()=>{
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  function normalize(s){
    if(!s)return s;
    const films=[...(s.filmography||[]),...(s.films||[])].filter((f,i,a)=>f&&a.findIndex(x=>String(x.id||x.title)===String(f.id||f.title))===i);
    const released=films.filter(f=>f.filmographyStatus==='Released'||f.stage==='completed'||f.stage==='released'||f.theatricalRunStatus==='ended');
    const hits=released.filter(f=>Number(f.finalBoxOffice||f.boxOffice||0)>=Math.max(1,Number(f.budget||30000000)*2));
    const awards=(s.awards||[]).filter(a=>a.result==='WIN').length;
    const avgQuality=released.length?released.reduce((n,f)=>n+Number(f.quality||50),0)/released.length:0;
    const careerAge=Math.max(0,Number(s.year||1)-1)*52+Math.max(0,Number(s.week||1)-1);
    // Early careers should not reach the ceiling just from cash, hiring or ordinary releases.
    // The ceiling rises with time, released films, genuine hits, awards and sustained quality.
    const ceiling=clamp(30+careerAge*.8+released.length*2+hits.length*2+awards*1.25+(avgQuality>=80?6:avgQuality>=70?3:0),35,100);
    const current=Number(s.reputation||35);
    if(!Number.isFinite(current))s.reputation=35;
    else if(current>ceiling)s.reputation=Math.round(ceiling);
    s.prestige=Math.round(clamp(Number(s.reputation||35),0,100));
    s.prestigeSystem={version:1,ceiling:Math.round(ceiling),lastWeek:Number(s.week||1),lastYear:Number(s.year||1)};
    return s;
  }
  window.BOLS2Prestige={version:1,normalize};
  window.addEventListener('bols:week-advanced',()=>{try{normalize(window.__BOL_STATE__||window.state);window.__BOL_COMMIT_STATE__?.(window.__BOL_STATE__||window.state)}catch(e){}});
})();