/* BOLS MEDIA v371 — restore industry studios directly on Home */
(()=>{
 const studios=[
  ['Universal Pictures','Universal','🎞️','Action · Adventure'],['Warner Bros. Pictures','Warner Bros.','WB','Crime · Drama'],['Disney','Disney','🏰','Family · Fantasy'],['Netflix','Netflix','N','Drama · Thriller'],['HBO','HBO','HBO','Drama · Crime'],['Sony Pictures','Sony','SONY','Action · Comedy'],['Paramount Pictures','Paramount','⛰️','Action · Drama'],['Lionsgate','Lionsgate','🦁','Thriller · Horror'],['A24','A24','A24','Drama · Indie']
 ];
 function add(){
  const root=document.querySelector('.mediaHubModal'); if(!root||root.querySelector('.bm371-studios'))return;
  const content=root.querySelector('#mediaContent'); if(!content)return;
  const section=document.createElement('section'); section.className='bm371-studios';
  section.innerHTML='<div class="bm371-studios-head"><b>Industry Studios</b><span>OFFICIAL CHANNELS</span></div><div class="bm371-studio-row">'+studios.map((s,i)=>`<button type="button" class="bm371-studio" data-bm371="${i}"><div class="bm371-logo">${s[2]}</div><strong>${s[1]}</strong><small>${s[3]}</small></button>`).join('')+'</div>';
  const anchor=content.querySelector('.mediaSection'); content.insertBefore(section,anchor||content.firstChild);
  section.querySelectorAll('[data-bm371]').forEach(btn=>btn.onclick=()=>{
   const i=Number(btn.dataset.bm371);
   if(window.BOLSMediaIndustryV369?.showIndustryChannel){
    const b=studios[i];
    const genres=b[3].split(' · ');
    const seed=120+i*31, week=Number(window.__BOL_STATE__?.week||1);
    const title=['The Last Frontier','Underworld','Kingdom of Stars','The Final Signal','The Long Night','Black Horizon','Final Strike','The Silent Witness','What Remains'][i];
    const views=380000+(seed%17)*91000+week*17000;
    window.BOLSMediaIndustryV369.showIndustryChannel(root,{b:[b[0],b[1],b[2],i===3?'Streaming Studio':'Major Studio',b[3]],videos:[{title:title+' — Official Trailer',type:'Official Trailer',genre:genres[0],views,likes:Math.round(views*.047),comments:Math.round(views*.0017),age:'Current Week',status:'RELEASED',studio:b[0],description:`Official channel release from ${b[0]}.`},{title:title+' — Behind the Scenes',type:'Behind the Scenes',genre:genres[1]||genres[0],views:Math.round(views*.31),likes:Math.round(views*.018),comments:Math.round(views*.0009),age:'Previous Week',status:'PUBLISHED',studio:b[0],description:`Behind the scenes from ${b[0]}.`}]});
   }
  });
 }
 new MutationObserver(add).observe(document.body,{childList:true,subtree:true}); setTimeout(add,700);
})();