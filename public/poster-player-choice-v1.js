(()=>{
const css=document.createElement('style');css.textContent=`
.posterChoiceMode{margin:0 0 12px;padding:12px;border:1px solid #3a3022;border-radius:12px;background:#14110d}.posterChoiceMode small{display:block;color:#a88648;font-size:6px;letter-spacing:1.5px}.posterChoiceMode strong{display:block;color:#eee2cd;font:16px Georgia,serif;margin:4px 0 9px}.posterChoiceMode .pcmBtns{display:grid;grid-template-columns:1fr 1fr;gap:7px}.posterChoiceMode button{padding:10px 7px;border:1px solid #303137;border-radius:9px;background:#15161a;color:#bbb;font-size:7px;font-weight:900}.posterChoiceMode button.active{border-color:#c49a48;background:#241b0d;color:#e0bd6c}.posterChoiceMode input{display:block;width:100%;margin-top:8px;font-size:8px;color:#aaa}.posterChoiceMode .pcmHint{color:#6f6b64;font-size:6px;line-height:1.45;margin-top:7px}.posterUploadedPreview{width:100%;aspect-ratio:2/3;border-radius:12px;overflow:hidden;border:1px solid #4b3a20;background:#090a0d;display:grid;place-items:center}.posterUploadedPreview img{width:100%;height:100%;object-fit:cover}.posterUploadedPreview span{color:#666;font-size:8px}.posterPlayground.pcmUploaded .ppCanvas{display:none}.posterPlayground.pcmUploaded .posterUploadedPreview{display:grid}
@media(max-width:700px){.posterChoiceMode .pcmBtns{grid-template-columns:1fr}.posterChoiceMode{padding:11px}}
`;
document.head.appendChild(css);
let context=null;
const original=window.showPosterStudio;
if(original&&!original.__playerChoice){
 const wrapped=function(state,film){context={state,film};const result=original(state,film);setTimeout(()=>enhance(document.querySelector('.posterPlayground')),0);return result};
 wrapped.__playerChoice=true;window.showPosterStudio=wrapped;
}
function compactImage(file,done){
 const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const maxW=1400,maxH=2100,scale=Math.min(1,maxW/img.width,maxH/img.height),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));const x=c.getContext('2d');x.drawImage(img,0,0,c.width,c.height);done(c.toDataURL('image/jpeg',.84));};img.src=String(reader.result||'')};reader.readAsDataURL(file)}
function persist(){const c=context;if(!c?.film)return;const p=c.film.poster||{};const live=(c.state?.films||[]).find(f=>String(f.id)===String(c.film.id));if(live){live.poster={...live.poster,...p};if(typeof saveCurrent==='function')saveCurrent(c.state,true)}else if(typeof saveMovieDraft==='function'){const old=typeof movieDrafts==='function'?movieDrafts().find(x=>String(x.id)===String(c.film.id))||{}:{};saveMovieDraft({...old,id:c.film.id,title:c.film.title||old.title||'Untitled Film',genre:c.film.genre||old.genre||'Drama',tone:c.film.tone||old.tone||'Emotional',budget:Number(c.film.budget||old.budget||30000000),hook:c.film.storyHook||old.hook||'',characters:c.film.characters||old.characters||[],poster:{...(old.poster||{}),...p}})}}
function enhance(root){
 if(!root||root.dataset.playerChoice==='1')return;root.dataset.playerChoice='1';
 const tools=root.querySelector('.ppTools'),canvas=root.querySelector('.ppCanvas');if(!tools||!canvas)return;
 const p=context?.film?.poster||{};let uploaded=p.customPoster||'';let mode=uploaded?'uploaded':'design';
 const box=document.createElement('div');box.className='posterChoiceMode';box.innerHTML=`<small>YOUR POSTER · PLAYER CHOICE</small><strong>How do you want your final poster?</strong><div class="pcmBtns"><button type="button" data-pcm="design">🎨 DESIGN IT IN BOLS2</button><button type="button" data-pcm="uploaded">🖼️ USE MY OWN POSTER</button></div><input type="file" accept="image/*" data-pcm-file><div class="pcmHint">You can make the entire poster yourself in another app and upload the finished image. BOLS2 will use it as the poster artwork instead of the generated design.</div>`;
 tools.prepend(box);
 const preview=document.createElement('div');preview.className='posterUploadedPreview';preview.innerHTML=uploaded?`<img src="${uploaded}" alt="Your uploaded poster">`:'<span>Upload a finished poster to preview it here.</span>';const stage=root.querySelector('.ppStage');if(stage)stage.appendChild(preview);
 const apply=()=>{root.classList.toggle('pcmUploaded',mode==='uploaded');preview.style.display=mode==='uploaded'?'grid':'none';box.querySelectorAll('[data-pcm]').forEach(b=>b.classList.toggle('active',b.dataset.pcm===mode));box.querySelector('[data-pcm-file]').style.display=mode==='uploaded'?'block':'none'};
 box.querySelectorAll('[data-pcm]').forEach(b=>b.onclick=()=>{mode=b.dataset.pcm;if(mode==='uploaded'&&!uploaded){box.querySelector('[data-pcm-file]').click();}else apply()});
 box.querySelector('[data-pcm-file]').onchange=e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/'))return toast('Please choose an image file.');if(file.size>12*1024*1024)return toast('Please choose a poster image under 12 MB.');compactImage(file,data=>{uploaded=data;mode='uploaded';if(context?.film){context.film.poster={...(context.film.poster||{}),customPoster:uploaded,posterMode:'uploaded'}}preview.innerHTML=`<img src="${uploaded}" alt="Your uploaded poster">`;apply();toast('🖼️ Your finished poster is now the movie poster.');});};
 root.addEventListener('click',e=>{if(e.target.closest('#ppSave,#ppFinish'))setTimeout(()=>{if(context?.film){context.film.poster={...(context.film.poster||{}),customPoster:uploaded,posterMode:mode};persist()}},80)},true);
 apply();
}
new MutationObserver(()=>enhance(document.querySelector('.posterPlayground'))).observe(document.body,{subtree:true,childList:true});
})();