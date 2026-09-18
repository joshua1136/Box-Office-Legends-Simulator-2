(()=>{
'use strict';
/* BOLS2 v559 startup scheduler. Core assets stay immediate; the rest hydrate in small batches. */
const jsQueue=[];
const critical=[];
const cssQueue=["/development-lab-v6.css?v=601","/development-lab-v7.css?v=701","/development-lab-extra.css?v=490","/development-lab-overhaul.css?v=487","/development-lab-v2.css?v=487","/development-lab-v5.css?v=501","/development-writer-picker.css?v=1","/bols2-typography-v2.css?v=602","/marketing-media-v1.css?v=1","/save-system-v3.css?v=3","/bols2-career-load-v6.css?v=6","/weekly-analysis-v2.css?v=489","/studio-report-v3.css?v=1","/weekly-flow-v4.css?v=489","/studio-report-streams.css?v=489","/studio-stream-report-v151.css?v=489","/movie.css?v=489","/film-details.css?v=489","/film-history.css?v=489","/film-project-ui.css?v=489","/project-file-ui.css?v=489","/project-finance-polish.css?v=489","/poster.css?v=489","/poster-overhaul.css?v=489","/finance.css?v=489","/talent.css?v=489","/talent-labels.css?v=489","/talent-contract.css?v=489","/talent-contract-overhaul-v2.css?v=469","/industry-profile-redesign.css?v=489","/rival-profile-interactions.css?v=489","/rival-studio-polish.css?v=489","/coproduction-overhaul.css?v=489","/industry-invest-ip.css?v=489","/release.css?v=489","/release-overhaul-v1.css?v=1","/sequel-engine.css?v=489","/greenlight-announcement.css?v=489","/greenlight-announcement-v2.css?v=489","/festivals.css?v=489","/rankings.css?v=489","/newsroom-v2.css?v=489","/media-home-v374.css?v=489","/media-v391.css?v=489","/media-v392.css?v=489","/media-youtube-v397.css?v=489","/bols-media-v398.css?v=489","/bols-media-v400.css?v=489","/bols-media-v401.css?v=489","/yearly-wrapped.css?v=489","/yearly-wrapped-v2.css?v=489","/developer-console.css?v=489","/jx-security.css?v=489","/settings-polish.css?v=547","/talent-ai-v1.css?v=489","/talent-market-v2.css?v=489","/production-requirements-v1.css?v=489","/industry-core-v1.css?v=489","/rival-production-ai-v1.css?v=489","/events-v3.css?v=489","/deep-industry-profiles-v1.css?v=489","/realism-ui-v426.css?v=489","/talent-pixel-v2.css?v=489","/talent-mobile-repair-v1.css?v=489","/talent-mobile-repair-v2.css?v=489","/contract-placement-v469.css?v=474","/deal-intelligence-v474.css?v=489","/talent-career-v3.css?v=482"];
const constrained=((navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4));
if(constrained) document.documentElement.classList.add('bols-low-performance');
const load=(src)=>new Promise(resolve=>{const s=document.createElement('script');s.src=src;s.onload=()=>resolve(true);s.onerror=()=>{console.warn('[BOLS2 startup] module failed',src);resolve(false)};document.head.appendChild(s)});
const loadCss=(href)=>new Promise(resolve=>{const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.onload=()=>resolve(true);l.onerror=()=>{console.warn('[BOLS2 startup] stylesheet failed',href);resolve(false)};document.head.appendChild(l)});
const idle=fn=>('requestIdleCallback' in window)?requestIdleCallback(fn,{timeout:1800}):setTimeout(fn,350);
(async()=>{
 for(const src of critical) await load(src);
 let ci=0;
 const pumpCss=()=>{const batch=cssQueue.slice(ci,ci+(constrained?2:4));ci+=batch.length;if(!batch.length)return;Promise.all(batch.map(loadCss)).then(()=>{if(ci<cssQueue.length)idle(pumpCss)})};
 idle(pumpCss);
 await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 const rest=jsQueue.filter(x=>!critical.includes(x)); let i=0;
 const pumpJs=()=>{const batch=rest.slice(i,i+(constrained?1:2));i+=batch.length;if(!batch.length)return;Promise.all(batch.map(load)).then(()=>{if(i<rest.length)idle(pumpJs)})};
 idle(pumpJs);
})();
})();