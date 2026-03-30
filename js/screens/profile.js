/* ══════════════════════════════════════════
   PROFILE
══════════════════════════════════════════ */
(function(){
  const row=document.getElementById('av-row');
  AVATARS.forEach((av,i)=>{
    const b=document.createElement('button');b.className='av-btn'+(i===0?' sel':'');
    b.textContent=av;if(i===0)P.avatar=av;
    b.onclick=()=>{document.querySelectorAll('.av-btn').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');P.avatar=av;sfxClick();checkP();};
    row.appendChild(b);
  });
  const pg=document.getElementById('pal-grid');
  Object.entries(PALS).forEach(([key,pal])=>{
    const card=document.createElement('div');card.className='pal-card';
    const dots=document.createElement('div');dots.className='pal-dots';
    pal.colors.forEach(c=>{const d=document.createElement('div');d.className='pal-dot';d.style.background=c;dots.appendChild(d);});
    const nm=document.createElement('div');nm.className='pal-name';nm.textContent=pal.emoji+' '+pal.name;
    card.append(dots,nm);
    card.onclick=()=>{document.querySelectorAll('.pal-card').forEach(x=>x.classList.remove('sel'));card.classList.add('sel');P.palette=key;document.body.className=pal.theme;sfxClick();checkP();};
    pg.appendChild(card);
  });
  const sg=document.getElementById('sym-grid');
  Object.entries(STYMS).forEach(([key,th],i)=>{
    const card=document.createElement('div');card.className='sym-card'+(i===0?' sel':'');if(i===0)P.symTheme=key;
    const prev=document.createElement('div');prev.className='sym-preview';
    th.preview.forEach(s=>{const sp=document.createElement('span');sp.textContent=s;prev.appendChild(sp);});
    const nm=document.createElement('div');nm.className='sym-name';nm.textContent=th.emoji+' '+th.name;
    card.append(prev,nm);
    card.onclick=()=>{document.querySelectorAll('.sym-card').forEach(x=>x.classList.remove('sel'));card.classList.add('sel');P.symTheme=key;sfxClick();checkP();};
    sg.appendChild(card);
  });
  // Skill level selector
  const SKILL_LEVELS = [
    { key:'beginner',     em:'🌱', name:'Principiante', desc:'5-6 anni · Parto da zero' },
    { key:'intermediate', em:'⭐', name:'Intermedio',    desc:'7-8 anni · So già giocare' },
    { key:'expert',       em:'🚀', name:'Esperto',       desc:'9+ anni · Voglio la sfida!' },
  ];
  const lg = document.getElementById('level-grid');
  if (lg) {
    P.skillLevel = P.skillLevel || 'beginner';
    SKILL_LEVELS.forEach((lv, i) => {
      const card = document.createElement('div');
      card.className = 'level-card' + (i === 0 ? ' sel' : '');
      card.innerHTML = `<div class="level-em">${lv.em}</div><div class="level-name">${lv.name}</div><div class="level-desc">${lv.desc}</div>`;
      card.onclick = () => {
        document.querySelectorAll('.level-card').forEach(x => x.classList.remove('sel'));
        card.classList.add('sel');
        P.skillLevel = lv.key;
        sfxClick(); checkP();
      };
      lg.appendChild(card);
    });
  }
})();
document.getElementById('name-inp').oninput=function(){P.name=this.value.trim();checkP();};
function checkP(){document.getElementById('btn-confirm').disabled=!(P.avatar&&P.name.length>=2&&P.palette&&P.symTheme);}
/* btn-confirm onclick is set by themes.js (routes new profiles through tutorial → s-games) */
function applyTheme(){document.body.className=PALS[P.palette||'aurora'].theme;}

document.getElementById('btn-pro-back').onclick=()=>{
  sfxClick();
  const profiles=loadAllProfiles();
  if(profiles.length===0) show('s-wel');
  else if(profiles.length===1){ activateProfile(profiles[0]); updateMap(); show('s-map'); }
  else { buildWhoScreen(P.id||null); show('s-who'); }
};