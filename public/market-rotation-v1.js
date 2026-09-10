(()=>{
'use strict';
const hash=s=>{let h=2166136261;for(const c of String(s||'')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const cycle=s=>Math.floor((Math.max(1,Number(s?.week||1))-1)/5);
const roleOf=p=>String(p?.role||'').trim();
const roles=['Actor','Actress','Director','Writer','Composer','Cinematographer','Editor','VFX Supervisor'];
const unique=xs=>{const m=new Map();for(const x of xs||[]){const k=String(x?.name||x?.[0]||'').toLowerCase()+'|'+roleOf(x);if(!m.has(k))m.set(k,x)}return [...m.values()]};
function rotatingPool(items,s,count){const arr=unique(items),c=cycle(s),seed=c*7919+Number(s?.year||1)*313;return arr.slice().sort((a,b)=>hash(`${seed}|${a?.name||a?.[0]}`)-hash(`${seed}|${b?.name||b?.[0]}`)).slice(0,Math.max(0,count||10));}
function talentMarket(s,targetRole){
 const all=unique(Object.values(window.INDUSTRY_PEOPLE||{}).flat().filter(Boolean));
 const contracted=new Set(Object.entries(s?.talentContracts||{}).filter(([,c])=>c&&c.status!=='expired').map(([n])=>String(n).toLowerCase()));
 const target=targetRole?String(targetRole):null;
 let source=all.filter(p=>{const r=roleOf(p),cat=(r==='Actor'||r==='Actress')?'performer':r;return !target||((target==='Actor'||target==='Actress')?r===target:r===target)});
 source=source.filter(p=>{const n=String(p?.name||'').toLowerCase();return contracted.has(n)||!s?.talentContracts?.[p?.name]});
 const base=rotatingPool(source,s,target?14:28);
 // Always keep the best fit for the role in the market, even if their rotation slot would otherwise miss them.
 if(target){const must=source.slice().sort((a,b)=>(Number(b?.talent||0)-Number(a?.talent||0))+(Number(b?.popularity||0)-Number(a?.popularity||0))).slice(0,2);for(const p of must)if(!base.some(x=>String(x.name||'')===String(p.name||'')))base.unshift(p);}
 return base.slice(0,Math.max(target?10:28,target?Math.min(18,base.length):28));
}
function visibleStudios(s){const all=Array.isArray(window.INDUSTRY_STUDIOS)?window.INDUSTRY_STUDIOS:[];const c=cycle(s),sorted=all.slice().sort((a,b)=>hash(`${c}|studio|${a.name}`)-hash(`${c}|studio|${b.name}`));return sorted.slice(0,Math.min(10,sorted.length));}
function visibleStreamers(s){const all=Array.isArray(window.INDUSTRY_STREAMERS)?window.INDUSTRY_STREAMERS:[];const c=cycle(s),sorted=all.slice().sort((a,b)=>hash(`${c}|streamer|${a.name}`)-hash(`${c}|streamer|${b.name}`));return sorted.slice(0,Math.min(7,sorted.length));}
function info(s){const c=cycle(s),start=c*5+1,end=c*5+5,next=(c+1)*5+1;return{cycle:c,start,end,next,week:s?.week||1,year:s?.year||1};}
window.BOLSMarketRotation={version:1,cycle,info,rotatingPool,talentMarket,visibleStudios,visibleStreamers};
})();