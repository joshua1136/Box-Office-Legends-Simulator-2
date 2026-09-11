/* BOLS2 Career Resume — local device only. */
(function(){
 'use strict';
 const AUTO='BOLS2_AUTOSAVE_V2',LEGACY='bol2_saves_v1';
 const tick=s=>((+s?.year||1)-1)*52+(+s?.week||1);
 const clone=s=>{try{return JSON.parse(JSON.stringify(s))}catch{return null}};
 const studioName=s=>String((s?.studio&&s.studio.name)||s?.studioName||s?.name||'Unnamed Studio');
 const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
 function locals(){const out=[],a=read(AUTO),l=read(LEGACY);if(a?.state)out.push({state:a.state,source:'AUTOSAVE',savedAt:a.savedAt||''});if(Array.isArray(l))l.forEach((s,i)=>s&&out.push({state:s,source:'LOCAL SLOT '+(i+1),savedAt:s.updatedAt||s.updatedAt||''}));return out}
 function bestLocal(base){const n=studioName(base);return locals().filter(x=>studioName(x.state)===n).sort((a,b)=>tick(b.state)-tick(a.state)||String(b.savedAt).localeCompare(String(a.savedAt)))[0]||null}
 function apply(s){const c=clone(s);if(!c)return false;const live=window.__BOL_STATE__||window.state;if(live&&typeof live==='object'){Object.keys(live).forEach(k=>{try{delete live[k]}catch{}});Object.assign(live,c);window.state=live;window.__BOL_STATE__=live;window.__BOL_CURRENT_STATE__=live;window.start?.(live)}else{window.state=c;window.__BOL_STATE__=c;window.__BOL_CURRENT_STATE__=c;window.start?.(c)}return true}
 function resolve(){const base=window.__BOL_STATE__||window.state;if(!base)return null;const best=bestLocal(base);if(best&&tick(best.state)>tick(base)){apply(best.state);try{window.toast?.('Career recovered — Week '+best.state.week+' · Year '+best.state.year)}catch{}}window.__BOLS2_CAREER_TICK__=tick(window.__BOL_STATE__||base);return window.__BOL_STATE__||base}
 function open(){return window.__BOLS2_OPEN_LOAD_V6__?.()||false}
 function boot(){if(window.__BOLS2_RESUME_V7_BOOTED__)return;window.__BOLS2_RESUME_V7_BOOTED__=true;document.addEventListener('click',e=>{const el=e.target?.closest?.('button,a,[role="button"]');if(!el)return;const text=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(text==='continue'||text.includes('continue your save')||text.includes('continue save')||text==='resume career'||text==='resume'){e.preventDefault();e.stopImmediatePropagation();const r=resolve();if(r)window.start?.(r);else window.toast?.('No saved studio yet.')}else if(text.includes('load your saves')||text.includes('load studio')||text.includes('load save')){e.preventDefault();e.stopImmediatePropagation();open()}},true);setTimeout(resolve,1000)}
 window.BOLS2CareerResumeV7={resolve,open,bestLocal,locals,tick};boot();
})();