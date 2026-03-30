/* ══════════════════════════════════════════
   STATS SCREEN — A07: per-game breakdown
══════════════════════════════════════════ */
document.getElementById('btn-sb').onclick=()=>{sfxClick();show('s-map');};

function buildStats(){
  const scroll=document.getElementById('stats-scroll');scroll.innerHTML='';

  const totalPuzzles=Object.values(P.wp).reduce((s,w)=>s+(w.done||0),0);
  const totalErrors=P.history.reduce((s,h)=>s+(h.errors||0),0);
  const accuracy=totalPuzzles>0?Math.round(Math.max(0,100-totalErrors/totalPuzzles*20)):100;

  // Big stats
  const s0=document.createElement('div');s0.className='stat-section';
  s0.innerHTML=`<h2>📈 Il tuo percorso</h2>
    <div class="big-stats">
      <div class="bsc"><div class="bsc-num">${totalPuzzles}</div><div class="bsc-lbl">Puzzle<br>risolti</div></div>
      <div class="bsc"><div class="bsc-num">${P.stars}</div><div class="bsc-lbl">Stelle<br>⭐</div></div>
      <div class="bsc"><div class="bsc-num">${P.badges.length}</div><div class="bsc-lbl">Badge<br>🏅</div></div>
    </div>`;
  scroll.appendChild(s0);

  // Streak
  const s1=document.createElement('div');s1.className='stat-section';
  const days=['L','M','M','G','V','S','D'];
  const todayDow=new Date().getDay();
  const streak=P.streak||0;
  const dayHtml=days.map((d,i)=>{
    const active=i<=(todayDow===0?6:todayDow-1)&&i>=(todayDow===0?6:todayDow-1)-(streak-1);
    const isToday=i===(todayDow===0?6:todayDow-1);
    return`<div class="sday ${active?'on':''} ${isToday?'today':''}">${d}</div>`;
  }).join('');
  s1.innerHTML=`<h2>🔥 Serie di vittorie</h2>
    <div class="streak-row">
      <div class="streak-big">${streak}</div>
      <div class="streak-info">
        <div class="streak-label">Giorni di fila!</div>
        <div class="streak-sub">${streak>0?'Continua così, '+P.name+'!':'Inizia una serie oggi!'}</div>
        <div class="streak-days">${dayHtml}</div>
      </div>
    </div>`;
  scroll.appendChild(s1);

  // Accuracy
  const s2=document.createElement('div');s2.className='stat-section';
  s2.innerHTML=`<h2>🎯 Precisione</h2>
    <div class="acc-bar-wrap">
      <div class="acc-label"><span>Risposte esatte</span><span>${accuracy}%</span></div>
      <div class="acc-bar"><div class="acc-fill" style="width:0%" id="acc-fill"></div></div>
    </div>`;
  scroll.appendChild(s2);
  setTimeout(()=>{const f=document.getElementById('acc-fill');if(f)f.style.width=accuracy+'%';},100);

  // A07: Per-game progress
  const GAME_LABELS = {
    sudoku:{name:'Sudoku',icon:'🔢'}, kenken:{name:'KenKen',icon:'🧮'},
    maze:{name:'Labirinto',icon:'🐾'}, nono:{name:'Nonogramma',icon:'🔲'},
    tangram:{name:'Tangram',icon:'🔷'}, slide:{name:'Rompicapo',icon:'🧩'}
  };
  const gameKeys = Object.keys(GAME_LABELS);

  const s3=document.createElement('div');s3.className='stat-section';
  s3.innerHTML='<h2>🗺️ Progressione mondi</h2>';

  // Game tabs
  const tabRow=document.createElement('div');tabRow.className='stat-game-tabs';
  const tabAll=document.createElement('button');tabAll.className='stat-tab active';tabAll.textContent='Tutti';
  tabAll.onclick=()=>showGameStats(null);
  tabRow.appendChild(tabAll);
  gameKeys.forEach(gk=>{
    const gl=GAME_LABELS[gk];
    const tab=document.createElement('button');tab.className='stat-tab';
    tab.textContent=gl.icon;tab.title=gl.name;
    tab.onclick=()=>showGameStats(gk);
    tabRow.appendChild(tab);
  });
  s3.appendChild(tabRow);

  const worldContainer=document.createElement('div');worldContainer.id='stats-world-list';
  s3.appendChild(worldContainer);
  scroll.appendChild(s3);

  function showGameStats(filterGame){
    tabRow.querySelectorAll('.stat-tab').forEach((t,i)=>t.classList.toggle('active',filterGame===null?i===0:t.title===GAME_LABELS[filterGame]?.name));
    if(filterGame===null) tabRow.querySelector('.stat-tab').classList.add('active');
    const wc=document.getElementById('stats-world-list');wc.innerHTML='';
    WORLDS.forEach(w=>{
      let done,total=w.total;
      if(filterGame){
        if(!w[filterGame])return; // world doesn't have this game
        const key=w.id+'_'+filterGame;
        done=(P.wp[key]||{done:0}).done;
      } else {
        done=(P.wp[w.id]||{done:0}).done;
      }
      const pct=Math.round(done/total*100);
      const div=document.createElement('div');div.className='wsbar';
      div.innerHTML=`<div class="wsbar-lbl"><span>${w.icon} ${w.name}</span><span style="color:var(--accent)">${done}/${total}</span></div>
        <div class="wsbar-track"><div class="wsbar-fill" style="width:${pct}%"></div></div>`;
      wc.appendChild(div);
    });
  }
  showGameStats(null);

  // Badges
  const s4=document.createElement('div');s4.className='stat-section';
  s4.innerHTML='<h2>🏅 I tuoi badge</h2>';
  const bgrid=document.createElement('div');bgrid.className='badge-grid';
  BADGE_DEFS.forEach(bd=>{
    const earned=P.badges.includes(bd.id);
    const card=document.createElement('div');card.className='badge-card'+(earned?'':' locked-badge');
    card.innerHTML=`<span class="badge-em">${bd.em}</span><div class="badge-name">${bd.name}</div><div class="badge-desc">${bd.desc}</div>`;
    bgrid.appendChild(card);
  });
  s4.appendChild(bgrid);scroll.appendChild(s4);
}
