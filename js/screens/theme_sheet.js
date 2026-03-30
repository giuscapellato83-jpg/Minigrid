/* ══════════════════════════════════════════
   THEME SWITCHER SHEET
══════════════════════════════════════════ */
let _pendingTheme=null;

function buildSheet(){
  const grid=document.getElementById('sheet-grid');
  grid.innerHTML='';
  _pendingTheme=P.symTheme;
  Object.entries(STYMS).forEach(([key,th])=>{
    const opt=document.createElement('div');
    opt.className='sheet-opt'+(key===P.symTheme?' active-theme':'');
    opt.dataset.key=key;
    const prev=document.createElement('div');prev.className='sheet-opt-preview';
    th.preview.forEach(s=>{const sp=document.createElement('span');sp.textContent=s;prev.appendChild(sp);});
    const nm=document.createElement('div');nm.className='sheet-opt-name';nm.textContent=th.emoji+' '+th.name;
    const tag=document.createElement('div');tag.className='sheet-opt-tag';
    tag.textContent=key===P.symTheme?'✓ Attivo':'';
    opt.append(prev,nm,tag);
    opt.onclick=()=>{
      sfxClick();
      _pendingTheme=key;
      document.querySelectorAll('.sheet-opt').forEach(o=>{
        const active=o.dataset.key===key;
        o.classList.toggle('active-theme',active);
        o.querySelector('.sheet-opt-tag').textContent=active?'✓ Selezionato':'';
      });
    };
    grid.appendChild(opt);
  });
}

function openSheet(){
  sfxClick();
  buildSheet();
  document.getElementById('sheet-mask').classList.add('show');
}

function closeSheet(){
  document.getElementById('sheet-mask').classList.remove('show');
}

document.getElementById('sheet-mask').addEventListener('click',function(e){
  if(e.target===this)closeSheet();
});

document.getElementById('sheet-confirm').onclick=()=>{
  if(_pendingTheme && _pendingTheme!==P.symTheme){
    P.symTheme=_pendingTheme;
    saveP();
    // update switch label
    updateThemeSwitchLabel();
    // re-render palette immediately (grid stays same — symbols change next puzzle)
    renderPalette();
    tone(523,'sine',.07);setTimeout(()=>tone(659,'sine',.12),70);
  }
  closeSheet();
};

function updateThemeSwitchLabel(){
  const th=STYMS[P.symTheme];
  document.getElementById('theme-switch-lbl').textContent=
    th.emoji+' '+th.name+' — cambia';
}

document.getElementById('btn-theme-switch').onclick=openSheet;