/* ══════════════════════════════════════════
   DAILY CHALLENGE
══════════════════════════════════════════ */

/* Daily seed — deterministic from date so everyone gets same puzzle */
function dailySeed(){
  const d=new Date();
  return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
}
function dailyDateStr(){
  const d=new Date();
  return d.toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'});
}
function todayKey(){
  const d=new Date();
  const mm=String(d.getMonth()+1).padStart(2,'0');
  const dd=String(d.getDate()).padStart(2,'0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/* Seeded RNG (mulberry32) for reproducible daily puzzle */
function seededRng(seed){
  return function(){
    seed|=0;seed=seed+0x6D2B79F5|0;
    let t=Math.imul(seed^seed>>>15,1|seed);
    t=t+Math.imul(t^t>>>7,61|t)^t;
    return((t^t>>>14)>>>0)/4294967296;
  };
}
function seededShuffle(arr,rng){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function genDailyPuzzle(){
  const seed=dailySeed();
  const rng=seededRng(seed);
  // Daily is always 4x4 medium — accessible to all ages
  const sz=4;
  const {BR,BC}=boxDims(sz);
  const g=Array.from({length:sz},()=>Array(sz).fill(0));
  function ok(g,r,c,n){
    for(let i=0;i<sz;i++)if(g[r][i]===n||g[i][c]===n)return false;
    const br=Math.floor(r/BR)*BR,bc=Math.floor(c/BC)*BC;
    for(let i=0;i<BR;i++)for(let j=0;j<BC;j++)if(g[br+i][bc+j]===n)return false;
    return true;
  }
  function fill(g){
    for(let r=0;r<sz;r++)for(let c=0;c<sz;c++){
      if(g[r][c])continue;
      for(const n of seededShuffle([1,2,3,4],rng)){
        if(ok(g,r,c,n)){g[r][c]=n;if(fill(g))return true;g[r][c]=0;}
      }return false;
    }return true;
  }
  fill(g);
  // remove cells (target 10 given = medium, F06: max 12 attempts)
  const board=g.map(r=>[...r]);
  const given=new Set([...Array(16)].map((_,i)=>i));
  let attempts=0;
  for(const pos of seededShuffle([...Array(16)].map((_,i)=>i),rng)){
    if(16-given.size>=6||attempts>=12)break;
    attempts++;
    const r=Math.floor(pos/sz),c=pos%sz;
    const bk=board[r][c];board[r][c]=0;
    if(countSols(board,sz)===1)given.delete(pos);else board[r][c]=bk;
  }
  return{solution:g,board,given,seed};
}

function getDailyProgress(){
  try{
    const key='mg6_daily_'+P.id;
    const d=_storageGet(key);
    return d?JSON.parse(d):{};
  }catch(e){return{};}
}
function saveDailyProgress(data){
  try{_storageSet('mg6_daily_'+P.id,JSON.stringify(data));}catch(e){}
}

function updateDailyMapBtn(){
  const tk=todayKey();
  const dp=getDailyProgress();
  const doneToday=dp[tk]?.done;
  const el=document.getElementById('daily-map-status');
  if(el) el.textContent=doneToday?'✓ Completata!':'Nuova sfida!';
}

function buildDailyScreen(){
  const scroll=document.getElementById('daily-scroll');scroll.innerHTML='';
  const dp=getDailyProgress();
  const tk=todayKey();
  const doneToday=dp[tk]?.done;

  // daily streak
  let streak=0;
  const keys=Object.keys(dp).sort().reverse();
  for(const k of keys){
    if(dp[k]?.done)streak++;else break;
  }
  P.dailyStreak=streak;

  // A06: daily game rotation
  const DAILY_GAMES = [
    { key:'sudoku',  name:'Sudoku',     icon:'🔢' },
    { key:'kenken',  name:'KenKen',     icon:'🧮' },
    { key:'nono',    name:'Nonogramma', icon:'🔲' },
    { key:'maze',    name:'Labirinto',  icon:'🐾' },
    { key:'sudoku',  name:'Sudoku',     icon:'🔢' },
    { key:'slide',   name:'Rompicapo',  icon:'🧩' },
    { key:'tangram', name:'Tangram',    icon:'🔷' },
  ];
  const todayGame = DAILY_GAMES[new Date().getDay()];

  // hero
  const hero=document.createElement('div');hero.className='daily-hero';
  hero.innerHTML=`<div class="daily-date">${dailyDateStr().toUpperCase()}</div>
    <div class="daily-title">⭐ Sfida del Giorno</div>
    <div class="daily-sub">${todayGame.icon} Oggi: ${todayGame.name}</div>`;
  scroll.appendChild(hero);

  // stats
  const totalDailyDone=Object.values(dp).filter(d=>d?.done).length;
  const totalDailyStars=Object.values(dp).reduce((s,d)=>s+(d?.stars||0),0);
  const stats=document.createElement('div');stats.className='daily-stats';
  stats.innerHTML=`
    <div class="daily-stat"><div class="daily-stat-n">${streak}</div><div class="daily-stat-l">🔥 Serie</div></div>
    <div class="daily-stat"><div class="daily-stat-n">${totalDailyDone}</div><div class="daily-stat-l">📅 Giorni</div></div>
    <div class="daily-stat"><div class="daily-stat-n">${totalDailyStars}</div><div class="daily-stat-l">⭐ Stelle</div></div>`;
  scroll.appendChild(stats);

  // streak visual
  const streakRow=document.createElement('div');streakRow.className='daily-streak-row';
  streakRow.innerHTML=`<div class="daily-streak-num">${streak}</div>
    <div class="daily-streak-info">
      <div class="daily-streak-label">Giorni di fila! 🔥</div>
      <div class="daily-streak-sub">${streak>0?'Continua ogni giorno!':'Inizia oggi!'}</div>
    </div>`;
  scroll.appendChild(streakRow);

  if(doneToday){
    // already done
    const done=document.createElement('div');done.className='daily-done-today';
    done.innerHTML=`<div class="daily-done-em">🏅</div>
      <div class="daily-done-title">Sfida completata!</div>
      <div class="daily-done-sub">Torna domani per la prossima. +${dp[tk]?.stars||0} stelle guadagnate.</div>`;
    scroll.appendChild(done);
  } else {
    // play button
    const btn=document.createElement('button');btn.className='btn-daily-play';
    btn.textContent='🎯 Gioca la sfida di oggi!';
    btn.onclick=()=>startDailyGame();
    scroll.appendChild(btn);
  }

  // history
  if(Object.keys(dp).length>0){
    const hist=document.createElement('div');hist.className='daily-history';
    hist.innerHTML='<h3>📋 Storico</h3>';
    Object.entries(dp).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,7).forEach(([k,v])=>{
      const row=document.createElement('div');row.className='daily-hist-row';
      const [y,m,d]=k.split('-');
      const dateStr=new Date(y,m-1,d).toLocaleDateString('it-IT',{day:'numeric',month:'short'});
      row.innerHTML=`<div class="daily-hist-date">${dateStr}</div>
        <div class="daily-hist-res">${v?.done?'✅ +'+v.stars+'⭐':'❌'}</div>`;
      hist.appendChild(row);
    });
    scroll.appendChild(hist);
  }
}

function startDailyGame(){
  // UX09: launch the actual game of the day
  const DAILY_GAMES = [
    { key:'sudoku',  name:'Sudoku',     icon:'🔢' },
    { key:'kenken',  name:'KenKen',     icon:'🧮' },
    { key:'nono',    name:'Nonogramma', icon:'🔲' },
    { key:'maze',    name:'Labirinto',  icon:'🐾' },
    { key:'sudoku',  name:'Sudoku',     icon:'🔢' },
    { key:'slide',   name:'Rompicapo',  icon:'🧩' },
    { key:'tangram', name:'Tangram',    icon:'🔷' },
  ];
  const todayGame = DAILY_GAMES[new Date().getDay()];
  const gk = todayGame.key;

  G.isDaily = true;
  G._currentGameKey = gk;

  if (gk === 'sudoku' || gk === 'kenken') {
    // Grid-based: use daily puzzle generator for Sudoku, or KenKen generator
    if (gk === 'sudoku') {
      const daily=genDailyPuzzle();
      G.world={id:'daily',name:'Sfida del Giorno',icon:'⭐',size:4,diff:'medium',total:1};
      G.size=4;G.pidx=0;G.hintsLeft=3;G.errors=0;G.selCell=null;G.selSym=0;
      G.solution=daily.solution;G.board=daily.board;G.given=daily.given;
      G.isKenKen=false;G.cages=null;G.startTime=Date.now();
      document.getElementById('hdr-av').textContent=P.avatar;
      document.getElementById('hdr-nm').textContent=P.name;
      document.getElementById('hdr-sc').textContent=P.stars;
      document.getElementById('hdr-stk').textContent=P.streak||0;
      document.getElementById('pill-icon').textContent='⭐';
      document.getElementById('pill-nm').textContent='Sfida del Giorno';
      document.getElementById('pill-pg').textContent=dailyDateStr();
      const badge=document.getElementById('hdr-game-badge');
      if(badge) badge.textContent='🔢 Sudoku';
      document.getElementById('sudoku-grid').className='sudoku-grid g4';
      document.getElementById('btn-gb').onclick=()=>{sfxClick();G.isDaily=false;show('s-daily');buildDailyScreen();};
      G.adaptDiff='medium';
      show('s-game');updateHintBtn();renderGrid();renderPalette();
      updateThemeSwitchLabel();
    } else {
      // KenKen daily
      startKenKen(4, 'easy');
      G.isDaily = true;
    }
  } else if (gk === 'maze') {
    // Daily maze: medium difficulty
    const world = {id:'daily',name:'Sfida del Giorno',icon:'⭐',total:1,maze:{gridSize:6,extraOpen:2}};
    G._currentWorld = world; G.isDaily = true;
    startMazeFromWorld(world, world.maze);
  } else if (gk === 'nono') {
    // Daily nonogram: pick based on day seed
    const idx = dailySeed() % NONO_PUZZLES.length;
    G.isDaily = true;
    loadNonoPuzzle(idx);
    show('s-nono');
  } else if (gk === 'slide') {
    // Daily slide
    const world = {id:'daily',name:'Sfida del Giorno',icon:'⭐',total:1,slide:{gridSize:3,shuffleMoves:20}};
    G._currentWorld = world; G.isDaily = true;
    startSlideFromWorld(world, world.slide);
  } else if (gk === 'tangram') {
    // Daily tangram: pick level based on day seed
    const idx = dailySeed() % TANG_LEVELS.length;
    G.isDaily = true;
    T._worldRef = {id:'daily',name:'Sfida del Giorno',icon:'⭐',total:1};
    startTangLevel(idx);
    show('s-tang');
  }
}

document.getElementById('btn-daily-back').onclick=()=>{sfxClick();show('s-map');updateMap();};
document.getElementById('btn-daily-map').onclick=()=>{sfxClick();buildDailyScreen();show('s-daily');};