(()=>{
const esc=s=>{const d=document.createElement('div');d.textContent=s==null?'':s;return d.innerHTML};
const money=n=>n>=1e9?'$'+(n/1e9).toFixed(2)+'B':n>=1e6?'$'+(n/1e6).toFixed(1)+'M':'$'+Math.round(Number(n)||0).toLocaleString();
const stages=['idea','shape','pitch','script'];
const stageMeta={idea:['IDEA','Find the movie','Define what the film is before you build it.'],shape:['SHAPE','Build the story','Turn the premise into characters, conflict and a clear movie.'],pitch:['PITCH','Test the movie','See how the industry might respond before you commit.'],script:['SCRIPT','Write the screenplay','Turn the shaped movie into a production-ready script.']};
const getState=()=>window.__BOL_STATE__||window.state||null;
const save=(s)=>{try{if(typeof window.saveCurrent==='function')window.saveCurrent(s,true);else if(typeof window.saveState==='function')window.saveState()}catch(e){console.warn('Development Lab save failed',e)}};
const spend=(s,c,why)=>typeof window.spendEnergy==='function'?window.spendEnergy(s,c,why):true;
const energy=(key,fallback)=>window.ENERGY_ACTIONS?.[key]??fallback;

function enhance(){
 const lab=document.querySelector('.conceptLab');
 if(!lab||lab.dataset.developmentV4==='1')return;
 lab.dataset.developmentV4='1';
 const form=lab.querySelector('.movieForm');
 const scroll=lab.querySelector('.movieScroll');
 const steps=[...lab.querySelectorAll('.movieSteps span')].slice(0,4);
 if(!form||!scroll||steps.length<4)return;

 let stage=String(lab.dataset.devStage||'idea');
 const originalStageText=steps.map(x=>x.textContent.trim());
 const filmDraft={
  idea:{locked:!!lab.querySelector('#movieTitle')?.dataset.locked},
  shape:{audience:'General Audience',setting:'Contemporary',stakes:'Personal',ending:'Hopeful',conflict:'',relationship:'',theme:''},
  pitch:{target:'General Audience',position:'Balanced',hookStrength:0,logline:'',notes:'',score:0},
  script:{approach:'Character-driven',pages:110,scenes:0,revisions:0,progress:0,locked:false}
 };
 const seed=()=>{
  const d=window.__BOL_DEVLAB_DRAFT__||{};
  if(d.shape)Object.assign(filmDraft.shape,d.shape);
  if(d.pitch)Object.assign(filmDraft.pitch,d.pitch);
  if(d.script)Object.assign(filmDraft.script,d.script);
 };
 seed();

 const currentValues=()=>({
  title:lab.querySelector('#movieTitle')?.value.trim()||'Untitled Film',
  genre:lab.querySelector('#movieGenre')?.value||'Drama',
  tone:lab.querySelector('#movieTone')?.value||'Emotional',
  hook:lab.querySelector('#movieHook')?.value.trim()||'',
  budget:Number(lab.querySelector('.budgetCard.chosen')?.dataset.budget||30000000),
  franchise:lab.querySelector('.releaseChoice.chosen')?.dataset.franchise||'Original'
 });
 const computeScores=()=>{
  const v=currentValues();
  const chars=(window.__BOL_CONCEPT_CHARS__||[]).length;
  const hook=v.hook.length;
  const originality=Math.min(99,45+Math.min(30,Math.floor(hook/5))+(v.genre==='Sci-Fi'||v.genre==='Fantasy'?8:0)+Math.min(10,filmDraft.shape.theme.length));
  const audience=Math.min(99,48+(hook?12:0)+(v.tone==='Funny'||v.tone==='Emotional'||v.tone==='Intense'?10:0)+Math.min(8,chars*2));
  const commercial=Math.min(99,Math.round(audience*.7+(v.budget>=100000000?8:0)+(v.franchise==='Franchise Starter'?8:0)+(filmDraft.pitch.position==='Commercial'?7:0)));
  const franchise=Math.min(99,Math.round(originality*.45+audience*.25+(v.franchise==='Franchise Starter'?28:4)));
  const shapeBonus=Math.min(12,chars*2+Math.min(5,filmDraft.shape.conflict.length/12)+Math.min(5,filmDraft.shape.setting.length/12));
  const pitch=Math.min(99,Math.round(originality*.22+audience*.2+commercial*.2+franchise*.1+shapeBonus+filmDraft.pitch.hookStrength));
  return {originality,audience,commercial,franchise,pitch};
 };
 const persistDraft=()=>{
  const v=currentValues();
  window.__BOL_DEVLAB_DRAFT__={...filmDraft,base:v};
  const draftId=lab.dataset.draftId||Date.now();
  lab.dataset.draftId=String(draftId);
  try{if(typeof window.saveMovieDraft==='function')window.saveMovieDraft({id:draftId,title:v.title,genre:v.genre,tone:v.tone,budget:v.budget,hook:v.hook,franchise:v.franchise,shape:JSON.parse(JSON.stringify(filmDraft.shape)),pitch:JSON.parse(JSON.stringify(filmDraft.pitch)),script:JSON.parse(JSON.stringify(filmDraft.script)),characters:JSON.parse(JSON.stringify(window.__BOL_CONCEPT_CHARS__||[])),poster:null});}catch(e){console.warn(e)}
 };
 const stageAllowed=s=>{
  if(s==='idea')return true;
  const v=currentValues();
  if(!v.title||v.title==='Untitled Film')return false;
  if(s==='shape')return true;
  if(s==='pitch')return (window.__BOL_CONCEPT_CHARS__||[]).length>0 && v.hook.length>=20 && filmDraft.shape.conflict.trim().length>=12;
  if(s==='script')return computeScores().pitch>=60;
  return true;
 };
 const hintFor=s=>{
  if(s==='idea')return 'Define the premise first. Nothing is locked in yet.';
  if(s==='shape')return (window.__BOL_CONCEPT_CHARS__||[]).length?'The characters now influence the shape of the movie.':'Create at least one character to unlock the pitch.';
  if(s==='pitch')return computeScores().pitch>=60?'The concept is ready for a screenplay decision.':'Strengthen the concept before entering the writer’s room.';
  return filmDraft.script.locked?'Script locked. The movie is ready to leave Development Lab.':'Build enough screenplay progress to lock the script.';
 };
 const nav=()=>steps.forEach((b,i)=>{const s=stages[i];b.classList.toggle('active',s===stage);b.classList.toggle('complete',stages.indexOf(stage)>i||stage==='script'&&filmDraft.script.locked);b.dataset.stage=s;b.setAttribute('role','button');b.setAttribute('aria-current',s===stage?'step':'false')});
 const actionBar=()=>{
  let bar=lab.querySelector('.devStageBar');
  if(!bar){bar=document.createElement('div');bar.className='devStageBar';scroll.prepend(bar)}
  const idx=stages.indexOf(stage),prev=idx>0?stages[idx-1]:null,next=idx<stages.length-1?stages[idx+1]:null;
  bar.innerHTML=`<div><small>${stageMeta[stage][0]}</small><b>${stageMeta[stage][1]}</b><span>${esc(hintFor(stage))}</span></div><div class="devStageBarActions">${prev?`<button type="button" data-dev-prev>← ${stageMeta[prev][0]}</button>`:''}${next?`<button type="button" class="primary" data-dev-next>${stageMeta[next][0]} →</button>`:`<button type="button" class="primary" data-dev-save>${filmDraft.script.locked?'SAVE DEVELOPMENT':'LOCK SCRIPT & SAVE'}</button>`}</div>`;
  bar.querySelector('[data-dev-prev]')?.addEventListener('click',()=>setStage(prev));
  bar.querySelector('[data-dev-next]')?.addEventListener('click',()=>setStage(next));
  bar.querySelector('[data-dev-save]')?.addEventListener('click',()=>{if(!filmDraft.script.locked){if(filmDraft.script.progress<100)return toast('Finish the screenplay before locking it.');filmDraft.script.locked=true;}persistDraft();save(getState());toast('Development saved.');});
 };
 const ensureStageShell=()=>{
  let host=lab.querySelector('.devStageWork');
  if(!host){host=document.createElement('section');host.className='devStageWork';scroll.appendChild(host)}
  return host;
 };
 const renderSimpleShape=()=>{
  form.style.display='none';
  const host=ensureStageShell(),v=currentValues(),chars=window.__BOL_CONCEPT_CHARS__||[];
  const presets=[
   ['🎬 STORY-DRIVEN','Focus on the character','A personal problem changes everything.','Personal'],
   ['🔥 HIGH STAKES','Make it bigger','The characters have something important to lose.','Global'],
   ['❤️ EMOTIONAL','Make us care','A relationship is tested by a difficult choice.','Family']
  ];
  const names={Male:['Ethan Cole','Noah Bennett','Daniel Reyes','Marcus Hale','Adrian Brooks'],Female:['Maya Reyes','Sofia Bennett','Claire Morgan','Nina Carter','Elena Brooks'],'Non-binary':['Alex Morgan','Jordan Ellis','Riley Bennett','Taylor Brooks','Avery Cole']};
  const backgrounds={
   'Protagonist':['A young professional hiding a difficult past who gets one chance to change their life.','An ambitious newcomer trying to prove they belong in a world that keeps shutting them out.','Someone ordinary is forced to become extraordinary after one impossible event.'],
   'Antagonist':['A powerful rival who believes their choices are justified, even when everyone else disagrees.','A former ally who now wants the same goal for very different reasons.','A determined opponent protecting a secret that could destroy everything.'],
   'Love Interest':['A warm but guarded person who challenges the lead to stop running from their feelings.','Someone with their own dream who refuses to become just a side character in another person’s story.','A longtime friend whose loyalty is tested when the stakes become personal.'],
   'Mentor':['A veteran who has already made the mistake the protagonist is about to make.','A reluctant guide who knows exactly how dangerous the path ahead will be.','A former success who sees potential in the protagonist and refuses to give up on them.']
  };
  const randomCharacter=(type='Protagonist')=>{const gender=['Male','Female','Non-binary'][Math.floor(Math.random()*3)],pool=names[gender],name=pool[Math.floor(Math.random()*pool.length)],bgPool=backgrounds[type]||backgrounds.Protagonist,bg=bgPool[Math.floor(Math.random()*bgPool.length)];return {id:Date.now()+Math.random(),name,gender,position:type==='Protagonist'?'Lead':'Support',role:type,type,goal:bg,brief:bg,background:bg,arc:'Developing',screenTime:type==='Protagonist'?30:18,cast:null}};
  const renderChars=()=>{const list=host.querySelector('[data-simple-chars]');if(!list)return;list.innerHTML=chars.length?chars.map((c,i)=>`<article class="simpleChar"><div class="simpleCharAvatar">${esc((c.name||'?')[0])}</div><div><b>${esc(c.name)}</b><small>${esc(c.type||'Protagonist')} · ${esc(c.gender||'Unspecified')}</small><p>${esc(c.background||c.brief||'Character background not written yet.')}</p></div><button type="button" data-remove-simple="${i}">REMOVE</button></article>`).join(''):'<div class="devEmpty">No characters yet. Add a ready-made character and customize later.</div>';list.querySelectorAll('[data-remove-simple]').forEach(b=>b.onclick=()=>{chars.splice(+b.dataset.removeSimple,1);window.__BOL_CONCEPT_CHARS__=chars;renderChars();});};
  const addChar=type=>{const s=getState();if(!spend(s,energy('character',5),'developing a character'))return;chars.push(randomCharacter(type));window.__BOL_CONCEPT_CHARS__=chars;filmDraft.shape.conflict=filmDraft.shape.conflict||'The characters must overcome a problem that changes their lives.';persistDraft();save(s);renderChars();toast(`🎭 ${chars[chars.length-1].name} added.`)};
  host.innerHTML=`<div class="simpleShapeHeader"><div><small>02 · SHAPE</small><h3>Shape the story — without the homework.</h3><p>Pick the direction that feels right. BOLS2 handles the complicated parts.</p></div><span>${esc(v.genre)}</span></div><div class="simpleShapeChoices">${presets.map((p,i)=>`<button type="button" class="simpleShapeChoice" data-shape-preset="${i}"><b>${p[0]}</b><strong>${p[1]}</strong><small>${p[2]}</small></button>`).join('')}</div><div class="simpleCharBox"><div class="simpleCharHead"><div><small>CHARACTERS</small><h4>${chars.length} character${chars.length===1?'':'s'}</h4></div><span>READY-MADE · EDIT LATER</span></div><div data-simple-chars></div><div class="simpleCharButtons"><button type="button" data-add-simple="Protagonist">＋ MAIN CHARACTER</button><button type="button" data-add-simple="Antagonist">＋ ANTAGONIST</button><button type="button" data-add-simple="Love Interest">＋ LOVE INTEREST</button><button type="button" data-add-simple="Mentor">＋ MENTOR</button><button type="button" data-random-simple>🎲 RANDOM CHARACTER</button></div></div><div class="simpleShapeSummary"><b>WHAT YOU NEED TO DO</b><span>Choose one story direction and create at least one character. That's it. The pitch can handle the rest.</span></div>`;
  host.querySelectorAll('[data-shape-preset]').forEach(b=>b.onclick=()=>{const p=presets[+b.dataset.shapePreset];filmDraft.shape.stakes=p[3];filmDraft.shape.conflict=p[2];filmDraft.shape.theme=p[1];filmDraft.shape.audience=filmDraft.shape.audience||'General Audience';filmDraft.shape.setting=filmDraft.shape.setting||'Contemporary';filmDraft.shape.ending=filmDraft.shape.ending||'Hopeful';host.querySelectorAll('[data-shape-preset]').forEach(x=>x.classList.toggle('active',x===b));persistDraft();toast(`🎬 ${p[1]} direction selected.`)});
  host.querySelectorAll('[data-add-simple]').forEach(b=>b.onclick=()=>addChar(b.dataset.addSimple));host.querySelector('[data-random-simple]').onclick=()=>addChar(['Protagonist','Antagonist','Love Interest','Mentor'][Math.floor(Math.random()*4)]);renderChars();
 };
 const renderStage=()=>{
  const host=ensureStageShell();
  if(stage==='shape'){renderSimpleShape();syncIdeaPreview();return;}
  const v=currentValues(), scores=computeScores(), chars=window.__BOL_CONCEPT_CHARS__||[];
  const commonHeader=(eyebrow,title,copy)=>`<div class="devStageHeader"><div><small>${eyebrow}</small><h3>${title}</h3><p>${copy}</p></div><div class="devStageRead"><span>${esc(v.genre)}</span><span>${money(v.budget)}</span></div></div>`;
  if(stage==='idea'){
   form.style.display='';
   host.innerHTML=`<div class="devNativeNote"><b>IDEA IS THE FOUNDATION</b><span>Write it, test it, change it. Every field below belongs to this movie draft.</span></div>`;
  } else if(stage==='shape'){
   form.style.display='none';
   host.innerHTML=commonHeader('02 · SHAPE','Build the movie around the premise','These decisions change the movie’s identity and feed into the pitch and screenplay.')+
   `<div class="devChoiceGrid">
    <label class="devField"><span>TARGET AUDIENCE</span><select data-shape="audience"><option>General Audience</option><option>Teens & Young Adults</option><option>Adults</option><option>Families</option><option>Genre Fans</option><option>Prestige Audience</option></select></label>
    <label class="devField"><span>SETTING</span><select data-shape="setting"><option>Contemporary</option><option>Period</option><option>Near Future</option><option>Distant Future</option><option>Fantasy World</option><option>Small Town</option><option>Major City</option><option>Multiple Countries</option></select></label>
    <label class="devField"><span>STAKES</span><select data-shape="stakes"><option>Personal</option><option>Family</option><option>Community</option><option>National</option><option>Global</option><option>Existential</option></select></label>
    <label class="devField"><span>ENDING FEEL</span><select data-shape="ending"><option>Hopeful</option><option>Bittersweet</option><option>Tragic</option><option>Triumphant</option><option>Ambiguous</option></select></label>
   </div>
   <div class="devWideFields"><label class="devField"><span>CENTRAL CONFLICT</span><textarea data-shape="conflict" maxlength="180" placeholder="What problem forces the characters to act?"></textarea></label><label class="devField"><span>CORE RELATIONSHIP</span><textarea data-shape="relationship" maxlength="140" placeholder="What relationship drives the emotional story?"></textarea></label><label class="devField"><span>THEME</span><input data-shape="theme" maxlength="90" placeholder="What is this movie really about?"></label></div>
   <div class="devCharacterDeck"><div class="devDeckHead"><div><small>CHARACTER BOARD</small><h4>${chars.length} character${chars.length===1?'':'s'}</h4></div><button type="button" class="menuBtn" data-add-shape-character>＋ ADD CHARACTER</button></div>${chars.length?chars.slice(0,8).map((c,i)=>`<article><span>${i+1}</span><div><b>${esc(c.name||'Unnamed')}</b><small>${esc(c.position||c.role||'Supporting')} · ${esc(c.type||'Character')}</small><p>${esc(c.brief||c.goal||'No brief written yet.')}</p></div></article>`).join(''):'<div class="devEmpty">Your movie has no characters yet. Add the protagonist, antagonist, and other people who carry the story.</div>'}<div class="devShapeCharacterEditor" data-shape-editor hidden><div class="devEditorTitle">NEW CHARACTER</div><div class="devChoiceGrid"><label class="devField"><span>CHARACTER NAME</span><input data-new-char="name" maxlength="50" placeholder="e.g. Maya Reyes"></label><label class="devField"><span>POSITION</span><select data-new-char="position"><option>Lead</option><option>Support</option><option>Ensemble</option><option>Cameo</option></select></label><label class="devField"><span>TYPE</span><select data-new-char="type"><option>Protagonist</option><option>Antagonist</option><option>Deuteragonist</option><option>Mentor</option><option>Love Interest</option><option>Rival</option><option>Comic Relief</option><option>Other</option></select></label><label class="devField"><span>GENDER</span><select data-new-char="gender"><option>Male</option><option>Female</option><option>Non-binary</option></select></label></div><label class="devField"><span>CHARACTER BRIEF</span><textarea data-new-char="brief" maxlength="180" placeholder="Personality, motivation, conflict and arc..."></textarea></label><div class="devEditorActions"><button type="button" class="menuBtn" data-cancel-char>CANCEL</button><button type="button" class="menuBtn primary" data-save-shape-char>SAVE CHARACTER · 5 ⚡</button></div></div></div>`;
   ['audience','setting','stakes','ending'].forEach(k=>{const el=host.querySelector(`[data-shape="${k}"]`);el.value=filmDraft.shape[k];el.onchange=()=>{filmDraft.shape[k]=el.value;persistDraft();}});
   ['conflict','relationship','theme'].forEach(k=>{const el=host.querySelector(`[data-shape="${k}"]`);el.value=filmDraft.shape[k];el.oninput=()=>{filmDraft.shape[k]=el.value;persistDraft();}});
   const shapeEditor=host.querySelector('[data-shape-editor]');
   host.querySelector('[data-add-shape-character]').onclick=()=>{shapeEditor.hidden=false;shapeEditor.querySelector('[data-new-char="name"]')?.focus()};
   host.querySelector('[data-cancel-char]').onclick=()=>{shapeEditor.hidden=true};
   host.querySelector('[data-save-shape-char]').onclick=()=>{const s=getState();const name=shapeEditor.querySelector('[data-new-char="name"]').value.trim();if(!name)return toast('Give the character a name first.');if(!spend(s,energy('character',5),'developing a character'))return;const position=shapeEditor.querySelector('[data-new-char="position"]').value;const type=shapeEditor.querySelector('[data-new-char="type"]').value;const gender=shapeEditor.querySelector('[data-new-char="gender"]').value;const brief=shapeEditor.querySelector('[data-new-char="brief"]').value.trim();const next=window.__BOL_CONCEPT_CHARS__||[];next.push({name,gender,position,role:position,type,goal:brief,brief,arc:'Developing',screenTime:position==='Lead'?30:position==='Support'?18:position==='Ensemble'?10:4,cast:null});window.__BOL_CONCEPT_CHARS__=next;filmDraft.shape.conflict=filmDraft.shape.conflict||`${name} must overcome a personal obstacle.`;persistDraft();save(s);shapeEditor.hidden=true;renderStage();toast(`🎭 ${name} added to the character board.`)};
  } else if(stage==='pitch'){
   form.style.display='none';
   const gate=stageAllowed('pitch');
   host.innerHTML=commonHeader('03 · PITCH','Test the idea before production','A pitch is a decision point. Strengthen the movie, then decide whether it deserves a screenplay.')+
   `<div class="pitchHero ${gate?'ready':'locked'}"><div class="pitchScore"><small>PITCH READINESS</small><strong>${scores.pitch}</strong><span>/100</span></div><div><b>${gate?'READY FOR WRITER’S ROOM':'NOT READY'}</b><p>${esc(hintFor('pitch'))}</p></div></div>
   <div class="devChoiceGrid"><label class="devField"><span>TARGET MARKET</span><select data-pitch="target"><option>General Audience</option><option>Teens & Young Adults</option><option>Adults</option><option>Families</option><option>Genre Fans</option><option>Prestige Audience</option></select></label><label class="devField"><span>POSITIONING</span><select data-pitch="position"><option>Balanced</option><option>Commercial</option><option>Prestige</option><option>Star-driven</option><option>Event Movie</option><option>Festival Play</option></select></label></div>
   <label class="devField"><span>YOUR PITCH LINE</span><textarea data-pitch="logline" maxlength="220" placeholder="Pitch the movie in one clear, exciting sentence."></textarea></label>
   <div class="pitchChecks"><button type="button" data-pitch-action="hook">SHARPEN THE HOOK <small>+4–9 pitch · 8 ⚡</small></button><button type="button" data-pitch-action="audience">TEST AUDIENCE RESPONSE <small>+4–8 appeal · 6 ⚡</small></button><button type="button" data-pitch-action="notes">RUN EXECUTIVE NOTES <small>Generate risks & opportunities</small></button></div>
   <div class="pitchGrid"><div><small>ORIGINALITY</small><b>${scores.originality}/100</b></div><div><small>AUDIENCE APPEAL</small><b>${scores.audience}/100</b></div><div><small>COMMERCIAL POTENTIAL</small><b>${scores.commercial}/100</b></div><div><small>FRANCHISE POTENTIAL</small><b>${scores.franchise}/100</b></div></div>
   <div class="pitchNotes">${filmDraft.pitch.notes?`<b>EXECUTIVE NOTES</b><p>${esc(filmDraft.pitch.notes)}</p>`:'<b>EXECUTIVE NOTES</b><p>Run the executive notes test to identify what the movie still needs.</p>'}</div>
   <button type="button" class="menuBtn primary devMajorAction" data-pitch-approve ${gate?'':'disabled'}>${gate?'APPROVE PITCH → ENTER SCRIPT':'LOCKED · COMPLETE THE PITCH'}</button>`;
   host.querySelector('[data-pitch="target"]').value=filmDraft.pitch.target;host.querySelector('[data-pitch="target"]').onchange=e=>{filmDraft.pitch.target=e.target.value;persistDraft()};
   host.querySelector('[data-pitch="position"]').value=filmDraft.pitch.position;host.querySelector('[data-pitch="position"]').onchange=e=>{filmDraft.pitch.position=e.target.value;persistDraft();renderStage()};
   host.querySelector('[data-pitch="logline"]').value=filmDraft.pitch.logline;host.querySelector('[data-pitch="logline"]').oninput=e=>{filmDraft.pitch.logline=e.target.value;persistDraft()};
   host.querySelectorAll('[data-pitch-action]').forEach(b=>b.onclick=()=>{const s=getState();if(!s)return;if(b.dataset.pitchAction==='hook'){if(!spend(s,energy('writing',12),'sharpening the pitch hook'))return;filmDraft.pitch.hookStrength=Math.min(18,filmDraft.pitch.hookStrength+4+Math.floor(Math.random()*6));filmDraft.pitch.logline=filmDraft.pitch.logline||v.hook;addHistory('Pitch development','Hook sharpened. Pitch readiness improved.');}
    if(b.dataset.pitchAction==='audience'){if(!spend(s,energy('industry',8),'testing the audience response'))return;filmDraft.pitch.hookStrength=Math.min(18,filmDraft.pitch.hookStrength+4+Math.floor(Math.random()*5));filmDraft.shape.audience=filmDraft.shape.audience||'General Audience';addHistory('Audience test','Early audience response improved the pitch outlook.');}
    if(b.dataset.pitchAction==='notes'){filmDraft.pitch.notes=`Executives see ${scores.commercial>=70?'commercial potential':'some commercial risk'}; ${filmDraft.shape.conflict?'the central conflict is clear':'the central conflict still needs sharper definition'}; ${scores.originality>=72?'the concept feels distinctive':'the concept could use a stronger identity'}.`;addHistory('Executive notes','A pitch-room review identified strengths and risks.');}
    persistDraft();save(s);renderStage();toast('Pitch updated.');});
   host.querySelector('[data-pitch-approve]')?.addEventListener('click',()=>{if(!stageAllowed('script'))return;stage='script';nav();actionBar();renderStage();toast('Pitch approved. The writer’s room is open.');});
  } else {
   form.style.display='none';
   const pct=Math.min(100,filmDraft.script.progress), pages=Math.max(60,Math.min(180,Number(filmDraft.script.pages)||110));
   host.innerHTML=commonHeader('04 · SCRIPT','Writer’s Room','The screenplay is where the shaped idea becomes a complete film. Every pass has a cost and a consequence.')+
   `<div class="scriptStatus"><div><small>SCREENPLAY PROGRESS</small><strong>${pct}%</strong></div><div><small>EST. PAGES</small><strong>${pages}</strong></div><div><small>REWRITES</small><strong>${filmDraft.script.revisions}</strong></div><div><small>STATUS</small><strong>${filmDraft.script.locked?'LOCKED':'IN DEVELOPMENT'}</strong></div></div>
   <div class="devChoiceGrid"><label class="devField"><span>WRITING APPROACH</span><select data-script="approach"><option>Character-driven</option><option>High-concept</option><option>Commercial</option><option>Prestige</option><option>Franchise-minded</option></select></label><label class="devField"><span>ESTIMATED LENGTH</span><input type="range" min="75" max="160" step="5" value="${pages}" data-script="pages"><output data-script-output>${pages} pages</output></label></div>
   <div class="scriptTimeline"><div class="scriptTrack"><i style="width:${Math.min(100,pct)}%"></i></div><div><span class="${pct>=25?'done':''}">ACT I</span><span class="${pct>=50?'done':''}">ACT II</span><span class="${pct>=75?'done':''}">ACT III</span><span class="${pct>=100?'done':''}">POLISH</span></div></div>
   <div class="scriptActions"><button type="button" data-script-action="write"><b>✍ WRITE SCENES</b><small>+12–20% · 12 ⚡</small></button><button type="button" data-script-action="rewrite"><b>↻ REWRITE</b><small>+8–14% · 10 ⚡</small></button><button type="button" data-script-action="table"><b>🎬 TABLE READ</b><small>Reveal weak dialogue & chemistry</small></button><button type="button" data-script-action="notes"><b>📋 SCRIPT NOTES</b><small>Diagnose what is missing</small></button></div>
   <div class="scriptNotes"><b>WRITER’S ROOM NOTES</b><p>${esc(filmDraft.script.notes||'The screenplay has not been reviewed yet.')}</p></div>
   <button type="button" class="menuBtn primary devMajorAction" data-script-lock ${filmDraft.script.locked||pct<100?'disabled':''}>${filmDraft.script.locked?'✓ SCRIPT LOCKED':'LOCK FINAL SCREENPLAY'}</button>`;
   host.querySelector('[data-script="approach"]').value=filmDraft.script.approach;host.querySelector('[data-script="approach"]').onchange=e=>{filmDraft.script.approach=e.target.value;persistDraft()};
   host.querySelector('[data-script="pages"]').oninput=e=>{filmDraft.script.pages=Number(e.target.value);host.querySelector('[data-script-output]').textContent=e.target.value+' pages';persistDraft()};
   host.querySelectorAll('[data-script-action]').forEach(b=>b.onclick=()=>{const s=getState();if(!s)return;if(filmDraft.script.locked)return toast('The screenplay is already locked.');
    if(b.dataset.scriptAction==='write'){if(!spend(s,energy('writing',12),'writing screenplay scenes'))return;filmDraft.script.progress=Math.min(100,filmDraft.script.progress+12+Math.floor(Math.random()*9));filmDraft.script.scenes+=4+Math.floor(Math.random()*5);filmDraft.script.notes='New scenes were drafted. Check structure and character consistency before the next pass.';}
    if(b.dataset.scriptAction==='rewrite'){if(!spend(s,energy('writing',10),'rewriting the screenplay'))return;filmDraft.script.revisions++;filmDraft.script.progress=Math.min(100,filmDraft.script.progress+8+Math.floor(Math.random()*7));filmDraft.script.notes='Rewrite pass improved pacing and character motivation, but weak sections may still need a table read.';}
    if(b.dataset.scriptAction==='table'){filmDraft.script.notes=`Table read: ${chars.length?chars.length+' developed characters are available for the read.':'The cast of characters is still thin.'} ${filmDraft.shape.relationship?'The core relationship reads clearly.':'The emotional relationship needs more definition.'}`;}
    if(b.dataset.scriptAction==='notes'){filmDraft.script.notes=`Script notes: ${filmDraft.script.progress<60?'The screenplay needs substantially more scenes.':filmDraft.script.progress<100?'The structure is taking shape; add the final act and polish.':'The draft is complete. Focus on dialogue, continuity and character voice before locking.'}`;}
    persistDraft();save(s);renderStage();toast('Writer’s room updated.');
   });
   host.querySelector('[data-script-lock]')?.addEventListener('click',()=>{if(filmDraft.script.progress<100)return toast('The screenplay must reach 100% before it can be locked.');filmDraft.script.locked=true;persistDraft();save(getState());nav();actionBar();renderStage();toast('🎬 Final screenplay locked.');});
  }
  syncIdeaPreview();
 };
 const syncIdeaPreview=()=>{
  const v=currentValues(),scores=computeScores();
  const set=(sel,val)=>{const el=lab.querySelector(sel);if(el)el.textContent=val};
  set('#moviePreviewTitle',v.title);set('#moviePreviewMeta',`${v.genre} · ${v.tone} · ${v.franchise}`);set('#hookPreview',v.hook||'Give the audience a reason to care.');set('#originality',scores.originality+'/100');set('#appeal',scores.audience+'/100');set('#commercial',scores.commercial+'/100');set('#franchiseScore',scores.franchise+'/100');set('#pitchMeter',scores.pitch+'/100');
  const verdict=scores.pitch>=85?'🔥 HIGH POTENTIAL':scores.pitch>=70?'🟢 PROMISING':scores.pitch>=50?'🟡 RISKY':'🔴 UNPROVEN';set('#verdict',verdict);
 };
 const scrollToCharacterBox=()=>{const x=lab.querySelector('.characterConceptBox');x?.scrollIntoView({behavior:'smooth',block:'start'})};
 const addHistory=(event,detail)=>{const s=getState();const draftId=lab.dataset.draftId||Date.now();try{const d=window.__BOL_DEVLAB_HISTORY__||[];d.unshift({week:s?.week||1,year:s?.year||1,event,detail});window.__BOL_DEVLAB_HISTORY__=d.slice(0,20)}catch{}};
 const setStage=s=>{
  if(!stages.includes(s))return;
  if(!stageAllowed(s)){
   if(s==='pitch')toast('Pitch locked: add a character and write a stronger central conflict + hook first.');
   else if(s==='script')toast('Script locked: reach at least 60/100 pitch readiness first.');
   else toast('Finish the current foundation before moving ahead.');
   return;
  }
  persistDraft();stage=s;nav();actionBar();renderStage();updateFooter();scroll.scrollTo({top:0,behavior:'smooth'});
 };
 const originalStart=lab.querySelector('#startMovie')?.onclick;
 const footerStart=lab.querySelector('#startMovie');
 const updateFooter=()=>{
  if(!footerStart)return;
  if(stage==='idea'){footerStart.textContent='CONTINUE TO SHAPE →';footerStart.disabled=false;}
  else if(stage==='shape'){footerStart.textContent='CONTINUE TO PITCH →';footerStart.disabled=false;}
  else if(stage==='pitch'){footerStart.textContent=stageAllowed('script')?'CONTINUE TO SCRIPT →':'PITCH NEEDS WORK';footerStart.disabled=!stageAllowed('script');}
  else if(stage==='script'){footerStart.textContent=filmDraft.script.locked?'GREENLIGHT MOVIE · 25 ⚡ →':filmDraft.script.progress>=100?'LOCK SCRIPT & CONTINUE':'WRITE THE SCREENPLAY';footerStart.disabled=false;}
 };
 steps.forEach((b,i)=>{b.onclick=()=>setStage(stages[i]);b.style.cursor='pointer'});
 if(footerStart)footerStart.onclick=ev=>{
  ev.preventDefault();ev.stopPropagation();
  if(stage==='idea'){setStage('shape');return;}
  if(stage==='shape'){setStage('pitch');return;}
  if(stage==='pitch'){if(stageAllowed('script'))setStage('script');else toast('Complete the required pitch work first.');return;}
  if(stage==='script'&&!filmDraft.script.locked){if(filmDraft.script.progress>=100){filmDraft.script.locked=true;persistDraft();save(getState());updateFooter();renderStage();toast('🎬 Final screenplay locked.');}else toast('The screenplay must reach 100% before greenlighting the movie.');return;}
  if(stage==='script'&&filmDraft.script.locked&&typeof originalStart==='function')originalStart.call(footerStart,ev);
 };
 const heroCopy=lab.querySelector('.movieHero p');if(heroCopy)heroCopy.textContent='Develop the same movie through four real stages. Your choices are saved to the project and affect what can happen next.';
 lab.querySelector('#movieTitle')?.addEventListener('input',()=>{syncIdeaPreview();persistDraft()});
 lab.querySelector('#movieGenre')?.addEventListener('change',()=>{syncIdeaPreview();persistDraft()});
 lab.querySelector('#movieTone')?.addEventListener('change',()=>{syncIdeaPreview();persistDraft()});
 lab.querySelector('#movieHook')?.addEventListener('input',()=>{syncIdeaPreview();persistDraft()});
 lab.querySelectorAll('[data-budget]').forEach(b=>b.addEventListener('click',()=>{setTimeout(()=>{syncIdeaPreview();persistDraft()},0)}));
 lab.querySelectorAll('[data-franchise]').forEach(b=>b.addEventListener('click',()=>{setTimeout(()=>{syncIdeaPreview();persistDraft()},0)}));
 nav();actionBar();renderStage();syncIdeaPreview();updateFooter();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
new MutationObserver(()=>enhance()).observe(document.body,{subtree:true,childList:true});
window.BOLSDevelopmentLabV4={enhance};
})();