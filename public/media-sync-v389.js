/* BOLS MEDIA v389 — single-source bridge
   Legacy media modules still share bol2_media_hub_v1. This bridge makes every write
   observable in the same tab, refreshes the active feed, and mirrors the canonical
   media payload into __BOL_STATE__.media for save compatibility. */
(()=>{
  const STORE='bol2_media_hub_v1';
  const read=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch{return{}}};
  const sync=()=>{const d=read();const s=window.__BOL_STATE__;if(!s)return; s.media=s.media||{}; s.media.channel=d.channel||{}; s.media.videos=d.mediaVideos||{}; s.media.core=d.mediaCore||{}; s.media.bmc=d.bmc||{}; try{window.saveCurrent?.(s,true)}catch{}};
  const refresh=()=>{sync();const root=document.querySelector('.mediaHubModal');if(!root)return;const community=root.querySelector('.bmc378');if(community&&window.openBOLSCommunityV378){window.openBOLSCommunityV378();return} if(window.BOLSMediaCore?.render)window.BOLSMediaCore.render()};
  if(!window.__BOLSMediaSync389){
    window.__BOLSMediaSync389=true;
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value){const result=original.call(this,key,value);if(this===localStorage&&key===STORE){window.dispatchEvent(new CustomEvent('bols-media-data-changed'));}return result};
    window.addEventListener('bols-media-data-changed',()=>setTimeout(refresh,30));
    window.addEventListener('bols-media-refresh',()=>setTimeout(refresh,10));
  }
  window.BOLSMediaSync={refresh,sync,read};
  setTimeout(sync,1200);
})();