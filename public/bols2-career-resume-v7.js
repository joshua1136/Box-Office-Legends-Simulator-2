/* BOLS2 Career Resume — local device only, robust Continue handler. */
(function(){
 'use strict';
 const AUTO='BOLS2_AUTOSAVE_V2',LEGACY='bol2_saves_v1',SLOTS=5;
 const tick=s=>((+s?.year||1)-1)*52+(+s?.week||1);
 const clone=s=>{try{return JSON.parse(JSON.stringify(s))}catch{return null}};
 const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
 const studioName=s=>String((s?.studio&&s.studio.name)||s?.studioName||s?.name||'').trim();
 function locals(){const out=[],a=read(AUTO),l=read(LEGACY);if(a?.state&&typeof a.state==='object')out.push({state:a.state,source:'AUTOSAVE',savedAt:a.savedAt||'',slot:+a.state.saveSlot||+a.state.slot||1});if(Array.isArray(l))l.forEach((s,i)=>s&&out.push({state:s,source:'LOCAL SLOT '+(i+1),savedAt:s.updatedAt||s.savedAt||'',slot:i+1}));return out}
 function bestOverall(){return locals().sort((a,b)=>tick(b.state)-tick(a.state)||String(b.savedAt).localeCompare(String(a.savedAt)))[0]||null}
 function bestForStudio(base){const n=studioName(base);if(!n||/^unnamed studio$/i.test(n))return bestOverall();return locals().filter(x=>studioName(x.state)===n).sort((a,b)=>tick(b.state)-tick(a.state)||String(b.savedAt).localeCompare(String(a.savedAt)))[0]||bestOverall()}
 function apply(s){const c=clone(s);if(!c)return false;const live=window.__BOL_STATE__||window.state;if(live&&typeof live==='object'){Object.keys(live).forEach(k=>{try{delete live[k]}catch{}});Object.assign(live,c);window.state=live;window.__BOL_STATE__=live;window.__BOL_CURRENT_STATE__=live;}else{window.state=c;window.__BOL_STATE__=c;window.__BOL_CURRENT_STATE__=c}try{window.start?.(c)}catch{}return true}
 function resolve(){const base=window.__BOL_STATE__||window.state;const best=bestForStudio(base);if(!best)return null;if(!base||tick(best.state)>tick(base)||!studioName(base)||/^unnamed studio$/i.test(studioName(base))){apply(best.state);try{window.toast?.('Career resumed — Year '+best.state.year+' · Week '+best.state.week)}catch{}}return window.__BOL_STATE__||best.state}
 function open(){return window.__BOLS2_OPEN_LOAD_V6__?.()||false}
 function boot(){if(window.__BOLS2_RESUME_V7_BOOTED__)return;window.__BOLS2_RESUME_V7_BOOTED__=true;document.addEventListener('click',e=>{const el=e.target?.closest?.('#continue,button,a,[role="button"]');if(!el)return;const id=el.id||'';const text=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(id==='continue'||text.includes('continue your save')||text.includes('continue save')||text==='resume career'||text==='resume'||text.includes('continue to the game')){e.preventDefault();e.stopImmediatePropagation();const r=resolve();if(!r)window.toast?.('No saved studio yet.');return}if(text.includes('load your saves')||text.includes('load studio')||text.includes('load save')){e.preventDefault();e.stopImmediatePropagation();open()}},true);setTimeout(resolve,1000)}
 window.BOLS2CareerResumeV7={resolve,open,bestForStudio,bestOverall,locals,tick};boot();
})();