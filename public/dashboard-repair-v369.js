(()=>{
  const money=n=>{n=Number(n||0);return n>=1e9?'$'+(n/1e9).toFixed(1)+'B':n>=1e6?'$'+(n/1e6).toFixed(1)+'M':n>=1e3?'$'+Math.round(n/1e3)+'K':'$'+Math.round(n)};
  const removeLegacyStreams=()=>{document.querySelectorAll('#bols-stream-v2,.bsv2').forEach(x=>x.remove());};
  const refreshSnapshot=()=>{
    const dash=document.querySelector('.studioDash');const s=window.__BOL_STATE__;if(!dash||!s)return;
    const films=[...(s.films||[]),...(s.filmography||[])];
    const revenue=(s.transactions||[]).filter(x=>Number(x.amount)>0).reduce((a,x)=>a+Number(x.amount),0);
    const markets=new Set(films.flatMap(f=>f.releaseTerritories||f.territories||[]).filter(Boolean)).size;
    const employees=Object.keys(s.talentContracts||{}).length;
    const cards=dash.querySelectorAll('.snapshot .metricGrid>div');
    if(cards.length>=6){
      const vals=[films.length,s.awards?.length||0,revenue,employees,markets,s.year||1];
      vals.forEach((v,i)=>{const b=cards[i]?.querySelector('b');if(b)b.textContent=i===2?money(v):String(v)});
    }
  };
  const repair=()=>{removeLegacyStreams();refreshSnapshot();};
  new MutationObserver(repair).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',()=>setTimeout(repair,30),true);
  setTimeout(repair,200);
})();