(()=>{
const money=n=>n>=1e9?`$${(n/1e9).toFixed(2)}B`:n>=1e6?`$${(n/1e6).toFixed(1)}M`:`$${Math.round(n).toLocaleString()}`;
const escS=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));

function sequelNumber(state,parent){
  const parentNo=Number(parent?.sequelNumber||1);
  return parentNo+1;
}
function sequelPotential(parent,state){
  const gross=Number(parent.finalBoxOffice||parent.boxOffice||0);
  const quality=Number(parent.quality||50),aud=Number(parent.audience||50),story=Number(parent.story||50);
  const years=Math.max(0,(Number(state.year||1)-Number(parent.releaseYear||parent.createdYear||1)));
  const fatigue=Math.min(28,Math.max(0,(Number(parent.sequelNumber||1)-1)*7));
  const score=quality*.25+aud*.28+story*.12+Math.min(100,Math.log10(Math.max(1,gross/1e6))*14)+Math.min(12,years*2)-fatigue;
  return Math.max(18,Math.min(97,Math.round(score)));
}

function showSequelLab(state,parent){
  if(!parent||!(parent.stage==='completed'||parent.theatricalRunStatus==='ended'))return toast('A sequel can only be started after the original film has completed its theatrical run.');
  const all=[...(state.films||[]),...(state.filmography||[])];
  const existing=all.some(f=>String(f.sequelOf||'')===String(parent.id));
  if(existing)return toast('This film already has a sequel in your studio library.');

  const potential=sequelPotential(parent,state);
  const number=sequelNumber(state,parent);
  const originalChars=Array.isArray(parent.characters)?parent.characters:[];
  const inherited=originalChars.map((c,i)=>({...c,_sourceIndex:i,_new:false}));
  const newChars=[];
  let sequelType='Direct Sequel',direction='Balanced';
  let budget=Math.round(Math.max(10000000,Number(parent.budget||30000000)*(1.15+(potential>=80?.18:0))));
  // Start with an editable suggestion so Greenlight is never blocked by an empty title.
  let title=`${parent.title} ${number}`;

  const e=document.createElement('div');
  e.className='modal sequelModal';
  const types=[
    ['Direct Sequel','Continue the story immediately.','Best when major character arcs remain open.'],
    ['Legacy Sequel','Return years later with old and new characters.','Builds nostalgia and a new generation.'],
    ['New Chapter','Continue the world with a refreshed story.','Lower continuity pressure, more creative freedom.'],
    ['Final Chapter','Design the sequel as the conclusion.','Higher stakes, but closes major story paths.']
  ];
  const dirs=[
    ['Safe','Preserve the original formula.','Higher fan familiarity'],
    ['Balanced','Keep the identity while introducing new ideas.','Balanced risk'],
    ['Bold','Change tone, structure or genre significantly.','Higher creative risk']
  ];

  e.innerHTML=`<div class="panel sequelPanel">
    <header class="sequelHero">
      <button class="close">×</button>
      <div class="sequelKicker">FILM DEVELOPMENT · SEQUEL ENGINE</div>
      <div class="sequelTitleRow">
        <div class="sequelPoster">🎬</div>
        <div><h2>Create a Sequel</h2><p>Build <b>Film #${number}</b> in the story's series.</p><span>Original · ${escS(parent.title)} · ${escS(parent.genre||'Drama')} · ${parent.quality||50}/100 quality · ${money(Number(parent.finalBoxOffice||parent.boxOffice||0))} worldwide</span></div>
      </div>
    </header>
    <div class="sequelBody">
      <section class="sequelPotential">
        <div><small>SEQUEL POTENTIAL</small><b>${potential}/100</b><span>${potential>=85?'🔥 EXCEPTIONAL':potential>=72?'🟢 STRONG':potential>=55?'🟡 POSSIBLE':potential>=40?'🟠 RISKY':'🔴 POOR'}</span></div>
        <i><em style="width:${potential}%"></em></i>
        <p>${potential>=80?'The audience has a strong reason to return. This sequel could become a major studio opportunity.':potential>=60?'There is enough audience and story value to justify a continuation, but the creative direction matters.':'The original has limited sequel momentum. Continuing it would be a significant creative and commercial gamble.'}</p>
      </section>

      <section class="sequelBlock">
        <div class="sequelSectionHead"><small>01 · SERIES IDENTITY</small><span>This is Film #${number} in the series.</span></div>
        <div class="sequelIdentity">
          <div><small>ORIGINAL</small><b>${escS(parent.title)}</b><span>Film #${Number(parent.sequelNumber||1)}</span></div>
          <div class="identityArrow">→</div>
          <div class="currentFilm"><small>NEW FILM</small><b>Film #${number}</b><span>${escS(sequelType)}</span></div>
        </div>
      </section>

      <section class="sequelBlock">
        <div class="sequelSectionHead"><small>02 · SEQUEL TITLE</small><span>The player decides the name.</span></div>
        <label class="sequelField">FILM TITLE<input id="sequelTitle" maxlength="60" value="${escS(title)}" placeholder="Give your sequel its own title..."></label>
        <div class="titleSuggestions">
          <button type="button" data-title="numbered">${escS(parent.title)} ${number}</button>
          <button type="button" data-title="subtitle">${escS(parent.title)}: A New Chapter</button>
          <button type="button" data-title="legacy">${escS(parent.title)}: The Return</button>
          <span>Or write a completely original title.</span>
        </div>
      </section>

      <section class="sequelBlock">
        <div class="sequelSectionHead"><small>03 · SEQUEL TYPE</small><span>Choose how the story continues.</span></div>
        <div class="sequelChoices">${types.map(x=>`<button class="sequelChoice ${x[0]===sequelType?'chosen':''}" data-sequel-type="${escS(x[0])}"><b>${escS(x[0])}</b><small>${escS(x[1])}</small><em>${escS(x[2])}</em></button>`).join('')}</div>
      </section>

      <section class="sequelBlock">
        <div class="sequelSectionHead"><small>04 · STORY DIRECTION</small><span>How much should the sequel change?</span></div>
        <div class="sequelChoices sequelDirectionChoices">${dirs.map(x=>`<button class="sequelChoice ${x[0]===direction?'chosen':''}" data-direction="${x[0]}"><b>${x[0]}</b><small>${x[1]}</small><em>${x[2]}</em></button>`).join('')}</div>
      </section>

      <section class="sequelBlock">
        <div class="sequelSectionHead"><small>05 · CHARACTERS</small><span>Return familiar faces or build an entirely new cast of characters.</span></div>
        <div class="characterSubhead"><b>RETURNING CHARACTERS</b><span>${inherited.length} available</span></div>
        <div class="sequelCharacters" id="returningCharacters">${inherited.length?inherited.map((c,i)=>`<label class="sequelCharacter"><input type="checkbox" data-return-char="${i}" checked><span>🎭</span><div><b>${escS(c.name||`Character ${i+1}`)}</b><small>${escS(c.position||c.role||'Supporting')} · ${c.cast?escS(c.cast):'Original character'}</small></div><strong>RETURN</strong></label>`).join(''):'<div class="sequelEmpty">No characters were recorded in the original. Start fresh with new characters.</div>'}</div>
        <div class="characterSubhead newHead"><b>NEW CHARACTERS</b><span id="newCharacterCount">0 created</span></div>
        <div class="newCharacterList" id="newCharacterList"></div>
        <button type="button" class="createCharacterBtn" id="createNewCharacter">＋ CREATE NEW CHARACTER</button>
        <p class="characterHint">There is no hard character limit. Build a small continuation or introduce an entirely new ensemble.</p>
      </section>

      <section class="sequelBlock">
        <div class="sequelSectionHead"><small>06 · PRODUCTION SCALE</small><span>Budget affects expectations and commercial pressure.</span></div>
        <div class="sequelBudget"><div><small>PROPOSED BUDGET</small><b id="sequelBudgetValue">${money(budget)}</b></div><input id="sequelBudget" type="range" min="10000000" max="300000000" step="5000000" value="${budget}"><span>Original budget: ${money(Number(parent.budget||0))} · Higher budgets raise expectations.</span></div>
      </section>

      <section class="sequelRead">
        <div><small>SEQUEL READ</small><b id="sequelReadTitle">${potential>=80?'HIGH EXPECTATION PROJECT':potential>=60?'PROMISING CONTINUATION':'CREATIVE GAMBLE'}</b><span id="sequelReadText">Fans will compare Film #${number} directly with the original.</span></div>
        <div><small>SERIES POSITION</small><b>FILM #${number}</b><span>${escS(parent.title)} → ${title||'Untitled sequel'}</span></div>
      </section>
    </div>
    <footer class="sequelFooter"><div><small>NEXT</small><b>Development & Writing</b><span>New screenplay · returning characters · new production</span><em id="sequelActionStatus" aria-live="polite">Ready to greenlight Film #${number}.</em></div><button type="button" class="menuBtn primary sequelAction" id="greenlightSequel">GREENLIGHT SEQUEL · 25 ⚡ →</button></footer>
  </div>`;

  document.body.appendChild(e);
  e.querySelector('.close').onclick=()=>e.remove();

  const refresh=()=>{
    budget=Math.max(10000000,Number(e.querySelector('#sequelBudget')?.value||budget));
    title=e.querySelector('#sequelTitle')?.value.trim()||'';
    e.querySelector('#sequelBudgetValue').textContent=money(budget);
    e.querySelector('#newCharacterCount').textContent=`${newChars.length} created`;
    const ret=e.querySelectorAll('[data-return-char]:checked').length;
    const total=ret+newChars.length;
    const read=Math.max(1,Math.min(99,potential+Math.min(12,total*2)+(direction==='Balanced'?4:direction==='Bold'?-3:2)+(budget>Number(parent.budget||0)*1.7?-4:0)));
    e.querySelector('#sequelReadTitle').textContent=read>=82?'HIGH EXPECTATION PROJECT':read>=65?'PROMISING CONTINUATION':'CREATIVE GAMBLE';
    e.querySelector('#sequelReadText').textContent=`${total} character${total===1?'':'s'} planned · ${ret} returning · ${newChars.length} new · ${direction} approach · ${read}/100 project read.`;
    const pos=e.querySelector('.sequelRead>div:last-child span'); if(pos)pos.textContent=title?`${escS(parent.title)} → ${escS(title)}`:`${escS(parent.title)} → Untitled sequel`;
  };

  const renderNewCharacters=()=>{
    const list=e.querySelector('#newCharacterList');
    list.innerHTML=newChars.map((c,i)=>`<div class="newCharacterCard" data-new-index="${i}">
      <div class="newCharacterIcon">＋</div>
      <div class="newCharacterInfo"><b>${escS(c.name)}</b><span>${escS(c.role)} · ${escS(c.arc)}</span></div>
      <button type="button" class="removeNewCharacter" data-remove-character="${i}">REMOVE</button>
    </div>`).join('');
    list.querySelectorAll('[data-remove-character]').forEach(btn=>btn.onclick=()=>{newChars.splice(Number(btn.dataset.removeCharacter),1);renderNewCharacters();refresh()});
    refresh();
  };

  const createCharacter=()=>{
    const form=document.createElement('div');form.className='newCharacterForm';
    form.innerHTML=`<div class="newCharacterFormHead"><b>CREATE NEW CHARACTER</b><button type="button" class="cancelCharacter">×</button></div>
      <label>CHARACTER NAME<input class="ncName" maxlength="40" placeholder="e.g. Maya Reyes"></label>
      <label>ROLE<select class="ncRole"><option>Protagonist</option><option>Antagonist</option><option>Supporting</option><option>Love Interest</option><option>Rival</option><option>Mentor</option><option>Comic Relief</option><option>Cameo</option></select></label>
      <label>CHARACTER ARC<select class="ncArc"><option>Beginning a new journey</option><option>Secretive newcomer</option><option>Seeking redemption</option><option>Rising rival</option><option>Protector</option><option>Unpredictable wildcard</option></select></label>
      <div class="newCharacterFormActions"><button type="button" class="cancelCharacter secondary">CANCEL</button><button type="button" class="saveNewCharacter primary">ADD CHARACTER</button></div>`;
    e.querySelector('#newCharacterList').appendChild(form);
    form.querySelectorAll('.cancelCharacter').forEach(b=>b.onclick=()=>form.remove());
    form.querySelector('.saveNewCharacter').onclick=()=>{
      const name=form.querySelector('.ncName').value.trim();
      if(!name)return toast('Give the new character a name first.');
      newChars.push({id:`new-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name,position:form.querySelector('.ncRole').value,role:form.querySelector('.ncRole').value,arc:form.querySelector('.ncArc').value,cast:null,newCharacter:true});
      form.remove();renderNewCharacters();
    };
    form.querySelector('.ncName').focus();
  };

  e.querySelectorAll('[data-title]').forEach(b=>b.onclick=()=>{
    const v=b.dataset.title==='numbered'?`${parent.title} ${number}`:b.dataset.title==='subtitle'?`${parent.title}: A New Chapter`:`${parent.title}: The Return`;
    e.querySelector('#sequelTitle').value=v;refresh();
  });
  e.querySelectorAll('[data-sequel-type]').forEach(b=>b.onclick=()=>{sequelType=b.dataset.sequelType;e.querySelectorAll('[data-sequel-type]').forEach(x=>x.classList.toggle('chosen',x===b));refresh()});
  e.querySelectorAll('[data-direction]').forEach(b=>b.onclick=()=>{direction=b.dataset.direction;e.querySelectorAll('[data-direction]').forEach(x=>x.classList.toggle('chosen',x===b));refresh()});
  e.querySelector('#sequelTitle').oninput=refresh;
  e.querySelector('#sequelBudget').oninput=refresh;
  e.querySelectorAll('[data-return-char]').forEach(b=>b.onchange=refresh);
  e.querySelector('#createNewCharacter').onclick=createCharacter;
  refresh();

  const greenlightButton=e.querySelector('#greenlightSequel');
  const greenlightSequel=()=>{
    if(!greenlightButton||greenlightButton.dataset.processing==='1')return;
    const liveState=window.__BOL_STATE__||state;
    try{
      title=String(e.querySelector('#sequelTitle')?.value||'').trim();
      if(!title){const status=e.querySelector('#sequelActionStatus');if(status)status.textContent='TITLE REQUIRED · Give the sequel a title.';e.querySelector('#sequelTitle')?.focus();return;}
      const energy=Number(liveState.energy);
      if(!Number.isFinite(energy)||energy<25){const status=e.querySelector('#sequelActionStatus');if(status)status.textContent=`NOT ENOUGH ENERGY · Need 25 ⚡ to greenlight this sequel.`;return;}
      greenlightButton.dataset.processing='1';
      greenlightButton.disabled=true;
      greenlightButton.textContent='GREENLIGHTING…';
      const actionStatus=e.querySelector('#sequelActionStatus');if(actionStatus)actionStatus.textContent='Creating the new film project…';
      liveState.energy=energy-25;
      const returning=[...e.querySelectorAll('[data-return-char]:checked')].map(x=>inherited[Number(x.dataset.returnChar)]).filter(Boolean).map(c=>({...c}));
      const characters=[...returning,...newChars.map(c=>({...c}))];
      const sequelId=Date.now();
      const sequel={id:sequelId,title,genre:parent.genre,genreEmoji:parent.genreEmoji,tone:parent.tone||'Emotional',storyHook:`The next chapter of ${parent.title}.`,franchiseStrategy:'Sequel',sequelOf:parent.id,sequelNumber:number,sequelType,storyDirection:direction,originalFilmId:parent.id,originalFilmTitle:parent.title,originalFilmQuality:Number(parent.quality||50),originalAudience:Number(parent.audience||50),budget,stage:'development',stageWeek:1,totalWeeks:4,quality:Math.max(45,Math.min(80,Math.round(Number(parent.quality||50)*.72+12))),audience:Math.max(45,Math.min(88,Math.round(Number(parent.audience||50)*.78+12))),story:Math.max(45,Math.min(80,Math.round(Number(parent.story||50)*.72+12))),direction:50,acting:50,visuals:50,music:50,vfx:50,crew:{},characters,poster:null,concept:{originality:Math.max(35,Number(parent.concept?.originality||55)-8),appeal:Math.min(99,Number(parent.concept?.appeal||65)+5),commercialPotential:Math.min(99,Number(parent.concept?.commercialPotential||65)+8),franchisePotential:Math.min(99,Number(parent.concept?.franchisePotential||70)+10)},createdWeek:liveState.week,createdYear:liveState.year,spent:0,marketingBudget:0,revenue:0,boxOffice:0,streamingRevenue:0,releasedWeek:null,releaseDate:null,history:[{week:liveState.week,year:liveState.year,event:`Film #${number} greenlit`,detail:`${title} · ${sequelType} · ${direction} direction · ${characters.length} character${characters.length===1?'':'s'} (${returning.length} returning, ${newChars.length} new).`}]};
      liveState.films=Array.isArray(liveState.films)?liveState.films:[];liveState.films.push(sequel);
      parent.history=Array.isArray(parent.history)?parent.history:[];parent.history.push({week:liveState.week,year:liveState.year,event:`Film #${number} greenlit`,detail:`${title} · ${sequelType} · ${direction} direction.`});
      liveState.news=Array.isArray(liveState.news)?liveState.news:[];liveState.news.unshift({week:liveState.week,year:liveState.year,scope:'studio',type:'sequel',filmId:sequelId,film:sequel.title,title:`🎞️ ${liveState.studioName||'Your studio'} greenlights ${sequel.title}`,body:`The studio is returning to ${parent.title}. Film #${number} brings ${returning.length} returning character${returning.length===1?'':'s'} back and introduces ${newChars.length} new character${newChars.length===1?'':'s'}.`,category:'production',storyKey:`sequel-greenlit:${sequelId}`});
      if(typeof saveCurrent==='function'){const saved=saveCurrent(liveState,true);if(saved===false)throw new Error('The studio save could not be completed.');}
      e.remove();
      if(typeof start==='function')start(liveState);else window.location.reload();
      setTimeout(()=>toast(`${title} entered development as Film #${number}. −25 Energy`),60);
    }catch(err){
      console.error('Sequel greenlight failed',err);
      if(greenlightButton){greenlightButton.dataset.processing='';greenlightButton.disabled=false;greenlightButton.textContent='GREENLIGHT SEQUEL · 25 ⚡ →';}
      toast(`Could not greenlight the sequel: ${err?.message||'unknown error'}`);
    }
  };
  if(greenlightButton){greenlightButton.type='button';greenlightButton.addEventListener('click',greenlightSequel,{capture:true});}
}
window.showSequelLab=showSequelLab;
})();