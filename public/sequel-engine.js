(()=>{
const money=n=>n>=1e9?`$${(n/1e9).toFixed(2)}B`:n>=1e6?`$${(n/1e6).toFixed(1)}M`:`$${Math.round(Number(n)||0).toLocaleString()}`;
const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));

function allFilms(state){return [...(Array.isArray(state?.films)?state.films:[]),...(Array.isArray(state?.filmography)?state.filmography:[])];}
function seriesNumber(state,parent){
  const all=allFilms(state);
  const rootId=(()=>{let f=parent,guard=0;while(f?.sequelOf&&guard++<100){const next=all.find(x=>String(x.id)===String(f.sequelOf));if(!next)break;f=next;}return f?.id??parent.id;})();
  let max=1;
  all.forEach(f=>{let cur=f,depth=Number(f.sequelNumber)||1,guard=0;while(cur?.sequelOf&&guard++<100){const p=all.find(x=>String(x.id)===String(cur.sequelOf));if(!p)break;cur=p;depth=Math.max(depth,(Number(cur.sequelNumber)||1));}if(String(cur?.id)===String(rootId))max=Math.max(max,Number(f.sequelNumber)||depth);});
  return Math.max(max+1,(Number(parent.sequelNumber)||1)+1);
}
function potential(parent,state){
  const gross=Number(parent.finalBoxOffice||parent.boxOffice||0), q=Number(parent.quality||50), a=Number(parent.audience||50), s=Number(parent.story||50);
  const base=q*.30+a*.30+s*.15+Math.min(22,Math.log10(Math.max(1,gross/1e6))*4);
  const fatigue=Math.max(0,(Number(parent.sequelNumber||1)-1)*6);
  return Math.max(20,Math.min(96,Math.round(base-fatigue)));
}

function showSequelLab(state,parent){
  if(!parent||!(parent.stage==='completed'||parent.theatricalRunStatus==='ended'))return toast('A sequel can only be started after the original film has completed its theatrical run.');
  const all=allFilms(state);
  if(all.some(f=>String(f.sequelOf||'')===String(parent.id)))return toast('This film already has a sequel in your studio library.');

  const number=seriesNumber(state,parent), pot=potential(parent,state);
  const returning=(Array.isArray(parent.characters)?parent.characters:[]).map((c,i)=>({...c,_sourceIndex:i}));
  const data={step:0,title:`${parent.title}: A New Chapter`,reason:'Commercial',type:'Direct Sequel',direction:'Balanced',budget:Math.max(10000000,Math.round(Number(parent.budget||30000000)*1.15)),returning:new Set(returning.map((_,i)=>i)),newChars:[]};
  const steps=[['DECISION','Why continue it?'],['STORY','Shape the continuation'],['CHARACTERS','Build the cast'],['SCALE','Set the ambition'],['REVIEW','Greenlight decision']];

  const root=document.createElement('div');
  root.className='modal sequelV2';
  root.innerHTML=`<div class="sequelV2Panel" role="dialog" aria-modal="true" aria-label="Sequel Development Center">
    <header class="sqTop">
      <button type="button" class="sqClose" aria-label="Close">×</button>
      <div class="sqEyebrow">FILM DEVELOPMENT · SERIES & LEGACY</div>
      <div class="sqTopGrid"><div class="sqPoster">🎬</div><div><h2>Sequel Development Center</h2><p><b>${esc(parent.title)}</b> is ready for its next chapter.</p><span>Original · ${esc(parent.genre||'Drama')} · ${Number(parent.quality||50)}/100 quality · ${money(parent.finalBoxOffice||parent.boxOffice)} worldwide</span></div></div>
      <div class="sqProgress"><div class="sqProgressLine"><i id="sqProgressFill"></i></div><div id="sqStepLabels"></div></div>
    </header>
    <main class="sqBody" id="sqBody"></main>
    <footer class="sqFooter"><div class="sqFooterMeta"><small id="sqStatusLabel">STEP 1 OF 5</small><b id="sqStatusTitle">Make the decision</b><span id="sqStatusText">Choose the reason this studio is returning.</span></div><div class="sqFooterActions"><button type="button" class="sqSecondary" id="sqBack">BACK</button><button type="button" class="sqPrimary" id="sqNext">CONTINUE →</button></div></footer>
  </div>`;
  document.body.appendChild(root);
  const panel=root.querySelector('.sequelV2Panel');
  const body=root.querySelector('#sqBody');

  function setStatus(label,title,text){root.querySelector('#sqStatusLabel').textContent=label;root.querySelector('#sqStatusTitle').textContent=title;root.querySelector('#sqStatusText').textContent=text;}
  function renderProgress(){
    root.querySelector('#sqProgressFill').style.width=`${((data.step+1)/steps.length)*100}%`;
    root.querySelector('#sqStepLabels').innerHTML=steps.map((s,i)=>`<span class="${i===data.step?'active':''} ${i<data.step?'done':''}"><b>${i+1}</b>${s[0]}</span>`).join('');
  }
  function render(){
    renderProgress();
    const s=data.step;
    if(s===0)renderDecision(); else if(s===1)renderStory(); else if(s===2)renderCharacters(); else if(s===3)renderScale(); else renderReview();
    root.querySelector('#sqBack').style.visibility=s===0?'hidden':'visible';
    root.querySelector('#sqNext').textContent=s===steps.length-1?'GREENLIGHT FILM #'+number+' · 25 ⚡':'CONTINUE →';
  }
  function choiceCards(items,key){return `<div class="sqChoiceGrid">${items.map(x=>`<button type="button" class="sqChoice ${data[key]===x[0]?'selected':''}" data-choice-key="${key}" data-choice="${esc(x[0])}"><span class="sqChoiceIcon">${x[3]}</span><b>${esc(x[0])}</b><small>${esc(x[1])}</small><em>${esc(x[2])}</em></button>`).join('')}</div>`;}
  function bindChoices(){root.querySelectorAll('[data-choice-key]').forEach(b=>b.addEventListener('click',()=>{data[b.dataset.choiceKey]=b.dataset.choice;render();}));}

  function renderDecision(){
    body.innerHTML=`<section class="sqIntro"><span class="sqSectionNo">01</span><div><small>THE DECISION</small><h3>Why should the studio return?</h3><p>A sequel is more than making Film #2. Its purpose shapes audience expectations, risk and the project's identity.</p></div></section>
      <div class="sqInsight"><div><small>SEQUEL POTENTIAL</small><strong>${pot}/100</strong></div><div class="sqMeter"><i style="width:${pot}%"></i></div><span>${pot>=80?'STRONG FRANCHISE OPPORTUNITY':pot>=60?'PROMISING CONTINUATION':'HIGH-RISK CONTINUATION'}</span></div>
      ${choiceCards([
        ['Commercial','The audience wants more.','Prioritize demand, opening power and revenue.','💰'],
        ['Prestige','There is more to say.','Protect the story and build critical credibility.','🏆'],
        ['Fan Demand','They are not ready to let go.','Lean into beloved characters and audience attachment.','❤️']
      ],'reason')}
      <div class="sqNote">This decision does not guarantee success. The finished sequel will be judged by quality, audience appeal, competition, trends and release timing.</div>`;
    bindChoices();setStatus('STEP 1 OF 5','Make the decision','Choose the reason this studio is returning.');
  }
  function renderStory(){
    body.innerHTML=`<section class="sqIntro"><span class="sqSectionNo">02</span><div><small>THE STORY</small><h3>How should the story continue?</h3><p>Give the sequel its own identity. The original remains part of the simulation, but Film #${number} does not have to repeat it.</p></div></section>
      ${choiceCards([
        ['Direct Sequel','Continue immediately from the original.','Strong continuity and familiar stakes.','↗'],
        ['Legacy Sequel','Return years later with old and new faces.','Nostalgia mixed with a fresh generation.','⌛'],
        ['New Chapter','Keep the world, refresh the story.','More freedom with less continuity pressure.','✦'],
        ['Final Chapter','Build toward a definitive ending.','Higher stakes and a clear franchise destination.','◆']
      ],'type')}
      <div class="sqSubsection"><small>CREATIVE DIRECTION</small>${choiceCards([
        ['Safe','Preserve the original formula.','Higher familiarity.','🛡️'],
        ['Balanced','Keep the identity while adding new ideas.','Balanced risk.','⚖️'],
        ['Bold','Change tone, structure or genre significantly.','Higher creative risk.','🔥']
      ],'direction')}</div>`;
    bindChoices();setStatus('STEP 2 OF 5','Shape the continuation',`${data.type} · ${data.direction} approach.`);
  }
  function renderCharacters(){
    const selected=returning.filter((_,i)=>data.returning.has(i));
    body.innerHTML=`<section class="sqIntro"><span class="sqSectionNo">03</span><div><small>CHARACTER BOARD</small><h3>Who comes back?</h3><p>Bring back as many original characters as you want and create a completely new ensemble.</p></div></section>
      <div class="sqCharacterSection"><div class="sqSectionHead"><b>RETURNING CHARACTERS</b><span>${selected.length}/${returning.length} selected</span></div><div class="sqCharacterGrid">${returning.length?returning.map((c,i)=>`<button type="button" class="sqCharacter ${data.returning.has(i)?'selected':''}" data-return="${i}"><span>🎭</span><div><b>${esc(c.name||`Character ${i+1}`)}</b><small>${esc(c.position||c.role||'Supporting')}${c.cast?' · '+esc(c.cast):''}</small></div><strong>${data.returning.has(i)?'RETURNING':'EXCLUDED'}</strong></button>`).join(''):'<div class="sqEmpty">No recorded characters. Build the sequel around a new ensemble.</div>'}</div></div>
      <div class="sqCharacterSection"><div class="sqSectionHead"><b>NEW CHARACTERS</b><span>${data.newChars.length} created</span></div><div id="sqNewList" class="sqNewList">${data.newChars.map((c,i)=>`<div class="sqNewCard"><span>＋</span><div><b>${esc(c.name)}</b><small>${esc(c.role)} · ${esc(c.arc)}</small></div><button type="button" data-remove="${i}">REMOVE</button></div>`).join('')}</div><button type="button" class="sqAddCharacter" id="sqAddCharacter">＋ CREATE NEW CHARACTER</button></div>`;
    root.querySelectorAll('[data-return]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.return);data.returning.has(i)?data.returning.delete(i):data.returning.add(i);renderCharacters();}));
    root.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{data.newChars.splice(Number(b.dataset.remove),1);renderCharacters();}));
    root.querySelector('#sqAddCharacter').addEventListener('click',openCharacterForm);
    setStatus('STEP 3 OF 5','Build the cast',`${selected.length+data.newChars.length} character${selected.length+data.newChars.length===1?'':'s'} currently planned.`);
  }
  function openCharacterForm(){
    const box=document.createElement('div');box.className='sqCharacterOverlay';box.innerHTML=`<div class="sqCharacterForm"><button type="button" class="sqFormClose">×</button><small>NEW CHARACTER</small><h3>Create a character</h3><label>NAME<input id="ncName" maxlength="40" placeholder="e.g. Maya Reyes"></label><label>ROLE<select id="ncRole"><option>Protagonist</option><option>Antagonist</option><option>Supporting</option><option>Love Interest</option><option>Rival</option><option>Mentor</option><option>Comic Relief</option><option>Cameo</option></select></label><label>ARC<select id="ncArc"><option>Beginning a new journey</option><option>Secretive newcomer</option><option>Seeking redemption</option><option>Rising rival</option><option>Protector</option><option>Unpredictable wildcard</option></select></label><button type="button" class="sqPrimary sqAddConfirm">ADD CHARACTER</button></div>`;
    root.appendChild(box);box.querySelector('.sqFormClose').onclick=()=>box.remove();box.querySelector('.sqAddConfirm').onclick=()=>{const name=box.querySelector('#ncName').value.trim();if(!name)return toast('Give the new character a name first.');data.newChars.push({id:`new-${Date.now()}`,name,role:box.querySelector('#ncRole').value,position:box.querySelector('#ncRole').value,arc:box.querySelector('#ncArc').value,newCharacter:true});box.remove();renderCharacters();};box.querySelector('#ncName').focus();
  }
  function renderScale(){
    body.innerHTML=`<section class="sqIntro"><span class="sqSectionNo">04</span><div><small>PRODUCTION SCALE</small><h3>How big should Film #${number} be?</h3><p>A larger budget can increase spectacle and audience expectations. A leaner production reduces financial exposure.</p></div></section>
      <div class="sqBudgetCard"><div class="sqBudgetTop"><div><small>PROPOSED BUDGET</small><strong id="sqBudgetValue">${money(data.budget)}</strong></div><span>Original: ${money(parent.budget||0)}</span></div><input id="sqBudgetRange" type="range" min="10000000" max="300000000" step="5000000" value="${data.budget}"><div class="sqBudgetTicks"><span>$10M</span><span>$100M</span><span>$200M</span><span>$300M</span></div></div>
      <div class="sqScaleGrid"><div><small>EXPECTATIONS</small><b>${data.budget>Number(parent.budget||0)*1.4?'HIGH':'MANAGEABLE'}</b><span>Audience pressure</span></div><div><small>FINANCIAL RISK</small><b>${data.budget>Number(parent.budget||0)*1.6?'HIGH':data.budget>Number(parent.budget||0)?'MEDIUM':'LOW'}</b><span>Investment exposure</span></div><div><small>PROJECT SIZE</small><b>${data.budget>=150000000?'EVENT':data.budget>=80000000?'MAJOR':'CONTROLLED'}</b><span>Production ambition</span></div></div>`;
    root.querySelector('#sqBudgetRange').oninput=ev=>{data.budget=Number(ev.target.value);root.querySelector('#sqBudgetValue').textContent=money(data.budget);};
    setStatus('STEP 4 OF 5','Set the ambition',`Proposed production budget: ${money(data.budget)}.`);
  }
  function readScore(){
    const chars=data.returning.size+data.newChars.length;
    let score=pot+Math.min(10,chars*2)+(data.reason==='Fan Demand'?5:data.reason==='Prestige'?3:1)+(data.direction==='Balanced'?4:data.direction==='Safe'?2:-3)+(data.type==='Direct Sequel'?3:data.type==='Final Chapter'?2:0);
    if(data.budget>Number(parent.budget||0)*1.7)score-=5; if(data.budget<Number(parent.budget||0)*.8)score-=3;
    return Math.max(1,Math.min(99,Math.round(score)));
  }
  function renderReview(){
    const score=readScore(), ret=data.returning.size, total=ret+data.newChars.length;
    body.innerHTML=`<section class="sqIntro"><span class="sqSectionNo">05</span><div><small>GREENLIGHT REVIEW</small><h3>Does this sequel deserve the greenlight?</h3><p>Review the project before committing 25 Energy and sending Film #${number} into development.</p></div></section>
      <div class="sqReviewHero"><div><small>PROJECTED SEQUEL READ</small><strong>${score}/100</strong><span>${score>=82?'HIGH EXPECTATION PROJECT':score>=65?'PROMISING CONTINUATION':'CREATIVE GAMBLE'}</span></div><div class="sqBigMeter"><i style="width:${score}%"></i></div></div>
      <div class="sqReviewGrid"><div><small>TITLE</small><b>${esc(data.title||'Untitled')}</b></div><div><small>SERIES POSITION</small><b>FILM #${number}</b></div><div><small>STORY</small><b>${esc(data.type)}</b></div><div><small>DIRECTION</small><b>${esc(data.direction)}</b></div><div><small>CHARACTERS</small><b>${total}</b><span>${ret} returning · ${data.newChars.length} new</span></div><div><small>BUDGET</small><b>${money(data.budget)}</b></div></div>
      <div class="sqGreenlightNotice"><span>⚡</span><div><b>25 ENERGY</b><small>Greenlighting creates the project, records the decision in Film History and Studio News, and commits the production budget.</small></div></div>`;
    setStatus('STEP 5 OF 5','Ready for greenlight',`${score}/100 project read · 25 Energy to enter development.`);
  }

  function validate(){
    data.title=String(data.title||'').trim();
    if(!data.title){toast('Give the sequel a title first.');return false;}
    if(!Number.isFinite(data.budget)||data.budget<10000000){toast('Choose a valid production budget.');return false;}
    const live=window.__BOL_STATE__||state, energy=Number(live.energy);
    if(!Number.isFinite(energy)){toast('Studio Energy is unavailable. Reopen the sequel screen.');return false;}
    if(energy<25){toast(`Not enough Energy. You need 25 ⚡ and have ${energy} ⚡.`);return false;}
    return true;
  }
  function greenlight(){
    if(root.dataset.processing==='1')return;
    if(!validate())return;
    root.dataset.processing='1';
    const btn=root.querySelector('#sqNext');btn.disabled=true;btn.textContent='GREENLIGHTING…';setStatus('PROCESSING','Creating Film #'+number,'Saving the new project and recording the decision…');
    const live=window.__BOL_STATE__||state;
    try{
      if(typeof spendEnergy==='function'){const ok=spendEnergy(live,25,'greenlighting a sequel');if(ok===false)throw new Error('Energy could not be spent.');}else live.energy=Number(live.energy)-25;
      const ret=returning.filter((_,i)=>data.returning.has(i)).map(c=>({...c,_sourceIndex:undefined}));
      const chars=[...ret,...data.newChars.map(c=>({...c}))];
      const id=Date.now(), score=readScore();
      const sequel={id,title:data.title,genre:parent.genre,genreEmoji:parent.genreEmoji,tone:parent.tone||'Emotional',storyHook:`The next chapter of ${parent.title}.`,franchiseStrategy:'Sequel',sequelOf:parent.id,sequelNumber:number,sequelType:data.type,storyDirection:data.direction,sequelReason:data.reason,originalFilmId:parent.id,originalFilmTitle:parent.title,originalFilmQuality:Number(parent.quality||50),originalAudience:Number(parent.audience||50),budget:data.budget,stage:'development',stageWeek:1,totalWeeks:4,quality:Math.max(45,Math.min(80,Math.round(Number(parent.quality||50)*.72+12))),audience:Math.max(45,Math.min(88,Math.round(Number(parent.audience||50)*.78+12))),story:Math.max(45,Math.min(82,Math.round(Number(parent.story||50)*.72+12))),direction:50,acting:50,visuals:50,music:50,vfx:50,crew:{},characters:chars,poster:null,concept:{originality:Math.max(35,Number(parent.concept?.originality||55)-8),appeal:Math.min(99,Number(parent.concept?.appeal||65)+5),commercialPotential:Math.min(99,Number(parent.concept?.commercialPotential||65)+8),franchisePotential:Math.min(99,Number(parent.concept?.franchisePotential||70)+10)},createdWeek:live.week,createdYear:live.year,spent:0,marketingBudget:0,revenue:0,boxOffice:0,streamingRevenue:0,releasedWeek:null,releaseDate:null,projectedSequelRead:score,history:[{week:live.week,year:live.year,event:`Film #${number} greenlit`,detail:`${data.title} · ${data.type} · ${data.direction} direction · ${chars.length} characters (${ret.length} returning, ${data.newChars.length} new).`}]};
      live.films=Array.isArray(live.films)?live.films:[];live.films.push(sequel);
      parent.history=Array.isArray(parent.history)?parent.history:[];parent.history.push({week:live.week,year:live.year,event:`Film #${number} greenlit`,detail:`${data.title} · sequel approved with ${score}/100 projected read.`});
      live.news=Array.isArray(live.news)?live.news:[];live.news.unshift({week:live.week,year:live.year,scope:'studio',type:'sequel',filmId:id,film:data.title,title:`🎬 ${live.studioName||'Your studio'} greenlights ${data.title}`,body:`The studio is returning to ${parent.title} with Film #${number}. ${ret.length} returning characters and ${data.newChars.length} new characters are planned.`,category:'production',storyKey:`sequel-greenlit:${id}`});
      if(typeof saveCurrent==='function'){const saved=saveCurrent(live,true);if(saved===false)throw new Error('Studio save failed.');}
      setStatus('GREENLIGHT COMPLETE','Film #'+number+' is in development',`${data.title} has entered the development pipeline.`);
      setTimeout(()=>{root.remove();if(typeof start==='function')start(live);else window.location.reload();toast(`${data.title} entered development as Film #${number}. −25 Energy`);},500);
    }catch(err){console.error('Sequel 2.0 greenlight failed',err);root.dataset.processing='';btn.disabled=false;btn.textContent='GREENLIGHT FILM #'+number+' · 25 ⚡';setStatus('ACTION FAILED','Nothing was lost',err?.message||'The sequel could not be created.');}
  }

  root.querySelector('.sqClose').addEventListener('click',()=>root.remove());
  root.querySelector('#sqBack').addEventListener('click',()=>{if(data.step>0){data.step--;render();}});
  root.querySelector('#sqNext').addEventListener('click',()=>{if(data.step<steps.length-1){if(data.step===0&&!data.reason)return toast('Choose why the studio is returning.');if(data.step===1&&!data.type)return toast('Choose how the story continues.');data.step++;render();}else greenlight();});
  root.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!root.dataset.processing)root.remove();});
  render();
}
window.showSequelLab=showSequelLab;
})();