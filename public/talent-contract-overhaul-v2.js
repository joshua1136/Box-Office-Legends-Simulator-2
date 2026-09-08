(()=>{
'use strict';
const money=n=>{n=Number(n||0);return n>=1e9?'$'+(n/1e9).toFixed(2)+'B':n>=1e6?'$'+(n/1e6).toFixed(1)+'M':'$'+Math.round(n).toLocaleString()};
const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const state=()=>window.__BOL_STATE__||window.__BOL_CURRENT_STATE__;
const filmById=(s,id)=>(s?.films||[]).find(f=>String(f.id)===String(id))||((s?.filmography||[]).find(f=>String(f.id)===String(id)));
const commitmentMultiplier=m=>m===3?3.35:m===2?2.15:1;
function talentText(name,filmCount,films){const upcoming=Array.isArray(films)?films.filter(Boolean):[];if(upcoming.length)return `Hey! ${name} here. I really appreciate the offer, but I just don't have the time right now. As you know, I have ${upcoming.length} film${upcoming.length===1?'':'s'} coming up${upcoming.length===1?` — ${upcoming[0].title||'an upcoming production'}`:''}. Let me know if you still need me on your next project.`;return `Hey! ${name} here. The contract looked good, but I don't have enough room in my schedule for a ${filmCount}-picture commitment right now. Let me know if you still need me on your next project.`}
function notifyDecline(name,reason,films,offer,ask){const e=document.createElement('div');e.className='talentDealMessage';e.innerHTML=`<div class="tdmCard"><small class="tdmKicker">📨 TALENT MESSAGE · CONTRACT RESPONSE</small><h3>${esc(name)} has declined the offer.</h3><p class="tdmQuote">“${esc(reason)}”</p><div class="tdmMeta"><div><small>YOUR OFFER</small><b>${money(offer)}</b></div><div><small>MARKET ASK</small><b>${money(ask)}</b></div><div><small>UPCOMING FILMS</small><b>${films.length}</b></div></div><button class="menuBtn primary" id="tdmClose">UNDERSTOOD</button></div>`;document.body.appendChild(e);e.querySelector('#tdmClose').onclick=()=>e.remove()}
function readContract(el){const s=state();const name=el.dataset.talentName||el.querySelector('.contractTalentCard b')?.textContent?.trim()||'Talent';const filmId=el.dataset.filmId||'';const film=filmById(s,filmId);const movies=Number(el.querySelector('.contractChoice.selected[data-movies]')?.dataset.movies||1);const payment=el.querySelector('.contractChoice.selected[data-payment]')?.dataset.payment||'UPFRONT';const offer=Math.max(100000,Number(el.querySelector('#contractOffer')?.value||0));const askText=el.querySelector('.contractOfferLabel small')?.textContent||'';const m=askText.match(/Market ask:\s*\$([0-9.]+)([MB])/i);const ask=m?Number(m[1])*(m[2].toUpperCase()==='B'?1e9:1e6):Math.max(100000,offer);return{name,film,filmId,movies,payment,offer,ask}}
function acceptance(c){let chance=52+(c.offer/Math.max(1,c.ask)-1)*58;const s=state();const rel=Number(s?.relationships?.[c.name]?.score||40);chance+=(rel-50)*.18;const tierText=document.querySelector('.talentContractModal .contractTalentCard small')?.textContent||'';if(tierText.includes('A-List'))chance-=9;else if(tierText.includes('Established'))chance-=3;else if(tierText.includes('Rising'))chance+=3;return Math.max(5,Math.min(96,Math.round(chance)))}
function upcomingFilms(s,name){const c=s?.talentContracts?.[name];if(!c)return[];const n=Math.max(1,Number(c.movies||1));return Array.from({length:n},(_,i)=>({title:i===0?c.title:`Future picture ${i+1} · ${name}`,filmId:c.filmId,endWeek:c.endWeek}))}
function attachEconomics(el){if(!el||el.dataset.tcoEconomics==='1')return;el.dataset.tcoEconomics='1';const label=el.querySelector('.contractOfferLabel');if(!label)return;const box=document.createElement('div');box.className='talentContractEconomics';box.innerHTML='<small>DEAL ECONOMICS · LIVE</small><div class="tceGrid"><div><small>TOTAL COMMITMENT</small><b id="tceTotal">—</b></div><div><small>PAYMENT TODAY</small><b id="tceToday">—</b></div><div><small>WEEKLY PAYROLL</small><b id="tceWeekly">—</b></div><div><small>ACCEPTANCE READ</small><b id="tceChance">—</b></div><div><small>FILM COMMITMENT</small><b id="tceFilms">—</b></div><div><small>STATUS</small><b id="tceStatus">NEGOTIABLE</b></div></div></div>';label.insertAdjacentElement('afterend',box);const refresh=()=>{const c=readContract(el);const total=c.offer*commitmentMultiplier(c.movies);const weekly=Math.max(0,Math.round(total/Math.max(4,(c.film?.totalWeeks||8)*c.movies)));const today=c.payment==='UPFRONT'?total:weekly;const chance=acceptance(c);el.querySelector('#tceTotal').textContent=money(total);el.querySelector('#tceToday').textContent=money(today);el.querySelector('#tceWeekly').textContent=c.payment==='WEEKLY'?money(weekly)+'/wk':'—';el.querySelector('#tceChance').textContent=chance+'%';el.querySelector('#tceFilms').textContent=c.movies+' '+(c.movies===1?'FILM':'FILMS');el.querySelector('#tceStatus').textContent=chance>=70?'FAVORABLE':chance>=45?'NEGOTIABLE':'RISKY'};el.querySelector('#contractOffer')?.addEventListener('input',refresh);el.querySelectorAll('[data-movies],[data-payment]').forEach(b=>b.addEventListener('click',()=>setTimeout(refresh,0)));refresh()}
function processWeekly(s,week){
 if(!s)return;
 s.talentContracts=s.talentContracts||{};
 s.transactions=s.transactions||[];
 s.news=s.news||[];
 const now=(Number(s.year||1)-1)*52+Number(week||s.week||1);
 for(const name of Object.keys(s.talentContracts)){
  const c=s.talentContracts[name];
  if(!c)continue;
  const end=(Number(c.endYear||s.year)-1)*52+Number(c.endWeek||999);
  if(c.payment==='WEEKLY'&&now>=Number(c.startAbsoluteWeek||now)&&now<=end&&Number(c.remainingBalance||0)>0){
   const pay=Math.min(Number(c.weeklyPayment||0),Number(c.remainingBalance||0));
   if(pay>0){
    const canPay=Number(s.money||0)>=pay||String(s.energyMode||'').toLowerCase()==='infinite';
    if(canPay){
     if(String(s.energyMode||'').toLowerCase()!=='infinite')s.money-=pay;
     c.remainingBalance=Math.max(0,Number(c.remainingBalance||0)-pay);
     c.paymentsMade=Number(c.paymentsMade||0)+1;
     s.transactions.push({week,year:s.year,type:'talent-payroll',amount:-pay,description:`Weekly ${name} talent payroll`});
     if(c.paymentsMade===1||c.paymentsMade%4===0)s.news.unshift({week,year:s.year,type:'talent-payroll',scope:'studio',section:'TALENT',title:`💼 ${name} receives weekly talent payroll`,body:`${name} was paid ${money(pay)} under the active ${c.movies||1}-picture agreement.`});
    }else{
     c.missedPayments=Number(c.missedPayments||0)+1;
     c.status='at-risk';
     s.news.unshift({week,year:s.year,type:'talent-payroll',scope:'studio',section:'TALENT',title:`⚠️ ${name}'s talent payment is overdue`,body:`The studio could not cover ${money(pay)} in weekly compensation. The relationship is under pressure.`});
     s.relationships=s.relationships||{};
     s.relationships[name]=s.relationships[name]||{score:40};
     s.relationships[name].score=Math.max(0,Number(s.relationships[name].score||40)-8);
    }
   }
  }
  if(now>=end){
   s.news.unshift({week,year:s.year,type:'talent-contract',scope:'studio',section:'TALENT',title:`📄 ${name}'s contract has expired`,body:`The ${c.movies||1}-picture agreement has reached its end date. ${name} is returning to the open talent market.`});
   delete s.talentContracts[name];
  }
 }
}
function renderContracts(s){const entries=Object.entries(s?.talentContracts||{}).filter(([,c])=>c);if(!entries.length)return '<section class="talentUnderContract"><div class="talentUnderContractHead"><b>📑 TALENT UNDER CONTRACT</b><span>No active agreements</span></div><div class="talentContractRoster"><div class="tcrEmpty">No talent is currently under contract. Signed agreements will appear here with real payment and availability data.</div></div></section>';return `<section class="talentUnderContract"><div class="talentUnderContractHead"><b>📑 TALENT UNDER CONTRACT</b><span>${entries.length} active agreement${entries.length===1?'':'s'}</span></div><div class="talentContractRoster">${entries.map(([name,c])=>{const remaining=Number(c.remainingBalance??c.totalFee??0);const status=c.status==='at-risk'?'AT RISK':c.payment==='WEEKLY'?'ACTIVE · WEEKLY':'ACTIVE · PAID';return `<article class="tcrCard"><div class="tcrAvatar">${esc(name[0]||'?')}</div><div><b>${esc(name)}</b><small>${esc(c.role||'Talent')} · ${esc(c.title||'Unassigned')} · ${c.movies||1} ${(c.movies||1)===1?'film':'films'}</small><div class="tcrPay">${c.payment==='WEEKLY'?`${money(c.weeklyPayment||0)}/week · ${money(remaining)} remaining`:`${money(c.totalFee||c.fee||0)} total · upfront`}</div></div><div class="tcrStatus"><strong>${status}</strong><span>Ends W${c.endWeek||'—'}</span></div></article>`}).join('')}</div></section>`}
function injectRoster(){const s=state();const modal=document.querySelector('.dashSectionModal');if(!s||!modal)return;if((modal.querySelector('.sectionHero h2')?.textContent||'').trim()!=='Talent')return;if(modal.querySelector('.talentUnderContract'))return;const target=modal.querySelector('.crewNeed');const host=document.createElement('div');host.innerHTML=renderContracts(s);(target||modal.querySelector('.sectionBody')?.firstElementChild)?.insertAdjacentElement('afterend',host.firstElementChild)}
function setup(){document.addEventListener('click',ev=>{const btn=ev.target?.closest?.('#executeContract');if(!btn)return;const el=btn.closest('.talentContractModal');if(!el)return;const c=readContract(el);if(!c.film)return;const chance=acceptance(c);if(Math.random()*100>chance){ev.preventDefault();ev.stopImmediatePropagation();const films=upcomingFilms(state(),c.name);const reason=c.offer<c.ask*.75?`Hey! ${c.name} here. I looked over the contract and I like the project, but the compensation is just too low for me right now. My current market ask is around ${money(c.ask)}, and I can't commit at this level. Let me know if you can come back with a stronger offer.`:talentText(c.name,c.movies,films);notifyDecline(c.name,reason,films,c.offer,c.ask)}},true);const mo=new MutationObserver(()=>{document.querySelectorAll('.talentContractModal').forEach(attachEconomics);injectRoster()});mo.observe(document.body,{childList:true,subtree:true});window.BOLTalentContractsV2={version:2,processWeekly,renderContracts,acceptance}}
setup();
})();