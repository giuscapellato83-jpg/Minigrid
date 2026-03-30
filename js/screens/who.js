/* ══════════════════════════════════════════
   WHO'S PLAYING SCREEN
══════════════════════════════════════════ */
function routeFromWelcome(){
  migrateLegacy();
  const profiles=loadAllProfiles();
  if(profiles.length===0){ prepareNewProfile(); show('s-pro'); }
  else if(profiles.length===1){ activateProfile(profiles[0]); updateMap(); show('s-map'); }
  else { buildWhoScreen(null); show('s-who'); }
}

function buildWhoScreen(selectedId){
  _editMode=false;
  const profiles=loadAllProfiles();
  const grid=document.getElementById('profile-grid');
  grid.innerHTML='';
  let chosen=selectedId;

  profiles.forEach(prof=>{
    const card=document.createElement('div');
    card.className='prof-card'+(prof.id===chosen?' active-prof':'');
    card.dataset.id=prof.id;

    // delete btn (shown in edit mode)
    const del=document.createElement('button');del.className='prof-del';del.textContent='✕';
    del.onclick=(e)=>{
      e.stopPropagation();
      if(!confirm('Eliminare il profilo di '+prof.name+'?'))return;
      sfxClick();deleteProfile(prof.id);buildWhoScreen(chosen===prof.id?null:chosen);
    };

    const av=document.createElement('div');av.className='prof-av';av.textContent=prof.avatar;
    const nm=document.createElement('div');nm.className='prof-name';nm.textContent=prof.name;
    const st=document.createElement('div');st.className='prof-stars';
    st.innerHTML='⭐ '+prof.stars;

    if(prof.streak>1){
      const sk=document.createElement('div');sk.className='prof-streak';
      sk.textContent='🔥'+prof.streak;card.appendChild(sk);
    }
    // edit btn (shown in edit mode)
    const edit=document.createElement('button');edit.className='prof-edit';edit.textContent='✏️';
    edit.onclick=(e)=>{
      e.stopPropagation();
      sfxClick();
      if(typeof editProfile==='function') editProfile(prof.id);
    };

    card.append(del,edit,av,nm,st);

    card.onclick=()=>{
      if(_editMode) return;
      sfxClick();chosen=prof.id;
      document.querySelectorAll('.prof-card').forEach(c=>c.classList.remove('active-prof'));
      card.classList.add('active-prof');
      document.getElementById('btn-who-play').disabled=false;
    };
    grid.appendChild(card);
  });

  // add-profile card
  if(profiles.length<6){
    const add=document.createElement('div');add.className='prof-add';
    add.innerHTML='<div class="prof-add-icon">＋</div><div class="prof-add-lbl">Nuovo</div>';
    add.onclick=()=>{sfxClick();prepareNewProfile();show('s-pro');};
    grid.appendChild(add);
  }

  document.getElementById('btn-who-play').disabled=!chosen;
  document.getElementById('btn-who-play').onclick=()=>{
    if(!chosen)return; sfxClick();
    const prof=loadProfileById(chosen);
    if(!prof)return;
    activateProfile(prof);updateMap();show('s-map');
  };
  document.getElementById('btn-who-edit').textContent=_editMode?'✓ Fine':'✏️ Gestisci profili';
  document.getElementById('btn-who-edit').onclick=()=>{
    sfxClick();_editMode=!_editMode;
    document.querySelectorAll('.prof-del').forEach(d=>d.style.display=_editMode?'flex':'none');
    document.querySelectorAll('.prof-edit').forEach(d=>d.style.display=_editMode?'flex':'none');
    document.getElementById('btn-who-edit').textContent=_editMode?'✓ Fine':'✏️ Gestisci profili';
  };

  // who-label
  document.getElementById('who-label').textContent=
    profiles.length>0?'Chi gioca oggi? 👇':'Crea il tuo primo profilo!';
  // back to welcome from who screen
  const whoBack=document.getElementById('btn-who-back');
  if(whoBack) whoBack.onclick=()=>{sfxClick();show('s-wel');};

  // FT03: Export/import buttons (only in edit mode area)
  let ioRow = document.getElementById('who-io-row');
  if(!ioRow) {
    ioRow = document.createElement('div');
    ioRow.id = 'who-io-row';
    ioRow.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-top:8px;';
    const expBtn = document.createElement('button');
    expBtn.className = 'btn-io';expBtn.textContent = '📥 Esporta';
    expBtn.style.cssText = 'padding:6px 14px;border-radius:12px;border:2px solid var(--accent);background:var(--soft);font-family:Nunito,sans-serif;font-size:12px;font-weight:700;color:var(--accent);cursor:pointer;';
    expBtn.onclick = () => { if(typeof exportProfile==='function' && P.id) exportProfile(); else showToast('Seleziona un profilo prima',2000); };
    const impBtn = document.createElement('button');
    impBtn.className = 'btn-io';impBtn.textContent = '📤 Importa';
    impBtn.style.cssText = expBtn.style.cssText;
    impBtn.onclick = () => { if(typeof importProfile==='function') importProfile(); };
    ioRow.append(expBtn, impBtn);
    const editBtn = document.getElementById('btn-who-edit');
    if(editBtn && editBtn.parentNode) editBtn.parentNode.insertBefore(ioRow, editBtn.nextSibling);
  }

  // apply theme of last used profile if any
  const last=_storageGet('mg5_last');
  const lastProf=profiles.find(p=>p.id===last)||profiles[0];
  if(lastProf){document.body.className=PALS[lastProf.palette||'aurora'].theme;}
}

function loadProfileById(id){
  return loadAllProfiles().find(p=>p.id===id)||null;
}

function prepareNewProfile(){
  // reset P to blank for new profile form
  Object.assign(P,{id:null,avatar:AVATARS[0],name:'',palette:'aurora',
    symTheme:'colors',stars:0,wp:{},history:[],badges:[],streak:0,lastDay:null,_tutDone:false});
  document.getElementById('name-inp').value='';
  document.querySelectorAll('.av-btn').forEach((b,i)=>b.classList.toggle('sel',i===0));
  document.querySelectorAll('.pal-card').forEach(c=>c.classList.remove('sel'));
  document.querySelectorAll('.sym-card').forEach((c,i)=>c.classList.toggle('sel',i===0));
  P.symTheme='colors';
  checkP();
}