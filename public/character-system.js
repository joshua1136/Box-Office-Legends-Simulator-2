// Character Development UI helper. Loaded by main.js when available.
window.initConceptCharacters = function(state, film, render) {
  const open = document.getElementById('addConceptCharacter');
  const editor = document.getElementById('characterEditor');
  const save = document.getElementById('saveConceptCharacter');
  if (!open || !editor || !save) return;
  film.characters = film.characters || [];
  let position = 'Lead';
  open.onclick = () => { editor.hidden = false; document.getElementById('characterNameInput')?.focus(); };
  document.querySelectorAll('[data-char-position]').forEach(b => b.onclick = () => {
    position = b.dataset.charPosition;
    document.querySelectorAll('[data-char-position]').forEach(x => x.classList.toggle('chosen', x===b));
  });
  save.onclick = () => {
    const name = document.getElementById('characterNameInput')?.value.trim();
    if (!name) return;
    film.characters.push({id:Date.now(),name,position,gender:document.getElementById('characterGenderInput')?.value||'Male',type:document.getElementById('characterTypeInput')?.value||'Protagonist',brief:document.getElementById('characterBriefInput')?.value.trim()||'',arcStrength:70+Math.floor(Math.random()*26)});
    editor.hidden = true;
    render();
  };
};