(()=>{
'use strict';
/* BOLS2 v576 startup scheduler. Core dependencies execute in order; secondary modules are prefetched in a small pool so phones do not wait on dozens of serial network requests. */
const queue=["/save-storage-v10.js?v=578","/industry-data.js?v=578","/prestige-overhaul-v1.js?v=578","/talent-expansion-v2.js?v=578","/market-catalog-expansion-v1.js?v=578","/market-rotation-v1.js?v=578","/industry-big-update.js?v=578","/main.js?v=578","/movie-engine-v1.js?v=578","/studio-report-v2.js?v=578","/weekly-engine-v3.js?v=578","/bols2-core-kernel-v1.js?v=578","/bols2-career-load-v7.js?v=578","/bols2-runtime-hardening-v1.js?v=578","/actress-fix.js?v=578","/character-system.js?v=578","/development-lab-ui.js?v=578","/development-lab-v2.js?v=578","/event-system-v2.js?v=578","/event-top-layout.js?v=578","/events-auto-effects.js?v=578","/events-state-bridge.js?v=578","/events-v2.js?v=578","/events-v3-bridge.js?v=578","/events-v3.js?v=578","/film-project-ui.js?v=578","/finance-upgrade.js?v=578","/industry-upgrade.js?v=578","/movie-hooks.js?v=578","/music.js?v=578","/next-week-loading.js?v=578","/poster-overhaul.js?v=578","/project-file-ui.js?v=578","/project-finance-polish.js?v=578","/settings.js?v=578","/streaming-auction-v3-loader.js?v=578","/streaming-auction-v3.js?v=578","/streaming-bidding-v4.js?v=578","/streaming-bidding.js?v=578","/streaming-economy-v5.js?v=578","/streaming-system-v2-loader.js?v=578","/streaming-system-v2.js?v=578","/streams-overhaul.js?v=578","/weekly-analysis-v2.js?v=578","/festivals-engine.js?v=578","/sequel-engine.js?v=578","/greenlight-announcement.js?v=578","/greenlight-announcement-v2.js?v=578","/rankings-engine.js?v=578","/yearly-wrapped.js?v=578","/yearly-wrapped-v2.js?v=578","/developer-console.js?v=578","/settings-bridge.js?v=578","/rival-profile-interactions.js?v=578","/coproduction-overhaul.js?v=578","/industry-invest-ip.js?v=578","/industry-economy-v2.js?v=578","/ip-marketplace-v341-bridge.js?v=578","/dashboard-repair-v369.js?v=578","/media-industry-strip-v371.js?v=578","/media-home-v374.js?v=578","/bols2-interface-overhaul-v385.js?v=578","/bols2-v387-polish.js?v=578","/media-engine-v391.js?v=578","/media-algorithm-v392.js?v=578","/media-channel-fix-v393.js?v=578","/media-youtube-v397.js?v=578","/bols-media-v398.js?v=578","/bols-media-integration-v1.js?v=578","/bols-media-integration-v2.js?v=578","/bols-media-world-v3.js?v=578","/rival-studio-ai-v1.js?v=578","/rival-studio-ai-v2.js?v=578","/talent-ai-v1.js?v=578","/industry-core-v1.js?v=578","/rival-production-ai-v1.js?v=578","/production-requirements-v1.js?v=578","/weekly-controller-v1.js?v=578","/deep-industry-profiles-v1.js?v=578","/real-filmography-v1.js?v=578","/realism-ui-v426.js?v=578","/talent-contract-overhaul-v2.js?v=578","/development-lab-extra.js?v=578","/development-player-friendly-v1.js?v=578","/poster-player-choice-v1.js?v=578","/marketing-media-v1.js?v=578","/save-system-v2.js?v=578","/save-system-v5.js?v=578","/bols2-career-load-v6.js?v=578","/bols2-career-resume-v7.js?v=578","/save-storage-v9.js?v=578","/release-overhaul-v1.js?v=578","/profile-system-v1.js?v=578"];
const criticalCount=13;
const constrained=((navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4));
if(constrained) document.documentElement.classList.add('bols-low-performance');
const load=(src)=>new Promise(resolve=>{const s=document.createElement('script');s.src=src;s.onload=()=>resolve(true);s.onerror=()=>{console.warn('[BOLS2 startup] module failed',src);resolve(false)};document.head.appendChild(s)});
const prefetch=async(urls)=>{
 const pool=4; let cursor=0;
 const worker=async()=>{while(cursor<urls.length){const i=cursor++;try{await fetch(urls[i],{cache:'force-cache'});}catch(e){/* script loader will report the real failure */}}};
 await Promise.all(Array.from({length:Math.min(pool,urls.length)},worker));
};
(async()=>{
 for(let i=0;i<criticalCount;i++){
   await load(queue[i]);
   if(i===criticalCount-1){
     window.__BOLS2_CORE_READY__=true;
     window.dispatchEvent(new CustomEvent('BOLS2_CORE_READY'));
     /* Warm secondary JS requests concurrently, but execute them below in the manifest order. */
     prefetch(queue.slice(criticalCount));
   }
 }
 for(let i=criticalCount;i<queue.length;i++) await load(queue[i]);
 window.__BOLS2_STARTUP_READY__=true;
 window.dispatchEvent(new CustomEvent('BOLS2_STARTUP_READY'));
})();
})();