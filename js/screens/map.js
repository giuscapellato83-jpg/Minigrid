/* ══════════════════════════════════════════
   MAP
══════════════════════════════════════════ */
function updateMap(){
  if(typeof updateUniversalMap === 'function') {
    updateUniversalMap();
    updateDailyMapBtn();
    return;
  }
  document.getElementById('map-av').textContent=P.avatar;
  document.getElementById('map-greet').textContent=P.name+'!';
  document.getElementById('map-sc').textContent=P.stars;
  updateStreak();buildWorldList();updateDailyMapBtn();
}
function buildWorldList(){
  // Delegate to universal world list builder
  if(typeof buildUniversalWorldList === 'function') {
    buildUniversalWorldList(_currentGameKey || 'sudoku');
    return;
  }
  const c=document.getElementById('world-list');c.innerHTML='';

  // group by phase
  const phases=[
    {label:'🌱 Primi passi',ids:['w1','w2']},
    {label:'🎮 Avventura',ids:['w3','w4']},
    {label:'💎 Esplorazione',ids:['w5','w6']},
    {label:'🐉 Sfida finale',ids:['w7','w8']},
  ];

  phases.forEach(ph=>{
    const phWorlds=WORLDS.filter(w=>ph.ids.includes(w.id));
    // section header
    const hdr=document.createElement('div');
    hdr.style.cssText='font-size:12px;font-weight:900;color:var(--muted);letter-spacing:.5px;margin:14px 0 8px;';
    hdr.textContent=ph.label;
    c.appendChild(hdr);

    phWorlds.forEach(w=>{
      const widx=WORLDS.indexOf(w);
      const prog=P.wp[w.id]||{done:0};
      const unlocked=isWorldUnlocked(w.id,_currentGameKey||'sudoku');
      const done=prog.done>=w.total;

      const card=document.createElement('div');
      card.className='world-card'+(unlocked?' unlocked active-w':' locked');
      const icon=document.createElement('div');icon.className='world-icon';icon.textContent=w.icon;
      const info=document.createElement('div');info.className='world-info';

      // name + phase pill
      const nmrow=document.createElement('div');nmrow.style.cssText='display:flex;align-items:center;';
      const nm=document.createElement('div');nm.className='world-name';nm.textContent=w.name;
      nmrow.appendChild(nm);
      if(w.phase===0){const pill=document.createElement('span');pill.className='phase-pill phase-0';pill.textContent='5+ anni';nmrow.appendChild(pill);}
      if(w.phase===4){const pill=document.createElement('span');pill.className='phase-pill phase-4';pill.textContent='9×9';nmrow.appendChild(pill);}

      const desc=document.createElement('div');desc.className='world-desc';desc.textContent=typeof getWorldDesc==='function'?getWorldDesc(w,_currentGameKey||'sudoku'):(w.desc||'');
      const bar=document.createElement('div');bar.className='world-pbar';
      const fill=document.createElement('div');fill.className='world-pfill';
      fill.style.width=Math.round(prog.done/w.total*100)+'%';
      bar.appendChild(fill);
      const ptxt=document.createElement('div');ptxt.className='world-ptxt';
      ptxt.textContent=prog.done+' / '+w.total+' puzzle';
      info.append(nmrow,desc,bar,ptxt);card.append(icon,info);

      if(done){const b=document.createElement('div');b.className='world-done';b.textContent='✓ Finito!';card.appendChild(b);}
      if(!unlocked){const lk=document.createElement('div');lk.className='world-lock';lk.textContent='🔒';card.appendChild(lk);}
      if(unlocked)card.onclick=()=>{sfxClick();launchWorldGame(w,_currentGameKey||'sudoku');};
      c.appendChild(card);
    });
  });
}

/* isWorldUnlocked is now defined in state.js with signature (worldId, gameKey) */
document.getElementById('btn-add-prof').onclick=()=>{
  sfxClick();
  if(loadAllProfiles().length>=6){
    showToast('Puoi avere al massimo 6 profili! 🙈', 3000); return;
  }
  prepareNewProfile(); show('s-pro');
};
document.getElementById('btn-ms').onclick=()=>{sfxClick();buildStats();show('s-stats');};
document.getElementById('btn-mt').onclick=()=>{sfxClick();show('s-tea');buildTeacher();};
document.getElementById('btn-map-switch').onclick=()=>{
  sfxClick();
  const profiles=loadAllProfiles();
  if(profiles.length<=1){ sfxClick(); return; } // solo 1, no switch
  buildWhoScreen(P.id); show('s-who');
};