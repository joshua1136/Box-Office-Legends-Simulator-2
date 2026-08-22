/* BOLS2 settings reliability bridge: owns the tap at document-capture level so the Settings button cannot be blocked by another module. */
(function(){
  function open(){
    if(document.querySelector('.settingsPanel')) return;
    if(typeof window.openSettings==='function') window.openSettings();
    else {
      var msg=document.querySelector('.notice');
      if(msg){msg.textContent='Settings are unavailable. Please reload the game.';msg.classList.add('show');}
    }
  }
  document.addEventListener('click',function(ev){
    var target=ev.target && ev.target.closest ? ev.target.closest('#settings') : null;
    if(!target) return;
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    open();
  },true);
  window.__BOL_SETTINGS_BRIDGE__=true;
})();