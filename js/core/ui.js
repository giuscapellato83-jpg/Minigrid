/* ══════════════════════════════════════════
   CELL RENDER
══════════════════════════════════════════ */
function makeCellContent(val,theme,sz){
  const el=document.createElement('div');el.className='csym';
  const syms=SYMS[theme][sz]||SYMS[theme][4];const sym=syms[val-1];
  if(theme==='colors'){el.classList.add('color');el.style.cssText=`width:100%;height:100%;background:${sym};`;}
  else if(theme==='numbers'){el.classList.add('number');el.style.background=PALS[P.palette].colors[(val-1)%4];el.textContent=sym;}
  else if(theme==='shapes'){el.classList.add('shape');el.style.color=PALS[P.palette].colors[(val-1)%4];el.textContent=sym;}
  else{el.classList.add('animal');el.textContent=sym;}
  return el;
}

/* ══════════════════════════════════════════
   SCREEN NAV
══════════════════════════════════════════ */
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');}

/* ══════════════════════════════════════════
   BADGES
══════════════════════════════════════════ */
function checkBadges(){
  const newBadges=[];
  BADGE_DEFS.forEach(bd=>{
    if(!P.badges.includes(bd.id)&&bd.check(P)){
      P.badges.push(bd.id);newBadges.push(bd);
    }
  });
  return newBadges;
}
function showBadgeUnlock(bd){
  sfxBadge();
  const el=document.createElement('div');el.className='badge-unlock';
  el.innerHTML=`<span class="bu-em">${bd.em}</span><div class="bu-txt"><div class="bu-title">Nuovo badge: ${bd.name}!</div><div class="bu-sub">${bd.desc}</div></div>`;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),3400);
}

/* ══════════════════════════════════════════
   CELEBRATION
══════════════════════════════════════════ */
const EMOJIS=['🎉','🌟','🏆','✨','🎊','🦄','🎈'];
const TITLES=['Fantastico!','Perfetto!','Bravo!','Super!','Incredibile!'];
const SUBS=['Hai risolto il puzzle!','Tutto giusto!','Sei un campione!','Che bravura!'];

function showCelebration(){
  const wid=G.world.id;
  const gameKey=G._currentGameKey||'sudoku';

  // Check world unlock BEFORE writing progress
  let _nextWorldToUnlock = null;
  if(!G.isDaily) {
    const widx=WORLDS.findIndex(w=>w.id===wid);
    if(widx>=0 && widx<WORLDS.length-1){
      const next=WORLDS[widx+1];
      if(!isWorldUnlocked(next.id, gameKey)){
        _nextWorldToUnlock = next; // mark for later check
      }
    }
  }

  // Write progress with composite key for universal map
  const compositeKey=wid+'_'+gameKey;
  if(!P.wp[compositeKey])P.wp[compositeKey]={done:0,stars:0};
  const newDone=G.pidx+1;if(newDone>P.wp[compositeKey].done)P.wp[compositeKey].done=newDone;
  // Also write plain key for backward compat (stats, badges)
  if(!P.wp[wid])P.wp[wid]={done:0};
  if(newDone>P.wp[wid].done)P.wp[wid].done=newDone;
  const earned=Math.max(1,3-Math.floor(G.errors/2));
  P.stars+=earned;
  P.history.push({world:wid,puzzle:G.pidx,errors:G.errors,hints:3-G.hintsLeft,earned,time:Date.now(),size:G.size,isKenKen:!!G.isKenKen});
  if(P.history.length>50)P.history.shift();
  updateStreak();
  const newBadges=checkBadges();
  saveActiveProfileNow(); // F08: critical — stars and badges must persist immediately
  document.getElementById('hdr-sc').textContent=P.stars;

  document.getElementById('cel-em').textContent=EMOJIS[rnd(EMOJIS.length)];
  document.getElementById('cel-title').textContent=TITLES[rnd(TITLES.length)];
  document.getElementById('cel-sub').textContent=SUBS[rnd(SUBS.length)];
  document.getElementById('cel-stars').textContent='⭐ +'+earned+' stelle guadagnate!';

  // show first new badge in card
  const celBadge=document.getElementById('cel-badge');
  if(newBadges.length>0){
    const bd=newBadges[0];
    document.getElementById('cel-b-em').textContent=bd.em;
    document.getElementById('cel-b-txt').textContent='Nuovo badge: '+bd.name;
    document.getElementById('cel-b-sub').textContent=bd.desc;
    celBadge.style.display='flex';
    newBadges.slice(1).forEach(b=>setTimeout(()=>showBadgeUnlock(b),1000));
  }else celBadge.style.display='none';

  const kkStandalone = G.isKenKen && !(G._currentWorld && G._currentGameKey === 'kenken');
  const kkWorldLast = G.isKenKen && !kkStandalone && G.pidx+1 >= (G.world.total||1);
  const isLast=G.pidx+1>=G.world.total||G.isDaily||kkStandalone||kkWorldLast;
  let nextLabel='Avanti! →';
  if(kkStandalone) nextLabel='Nuova sfida 🔢';
  else if(kkWorldLast) nextLabel='Torna alla mappa 🗺️';
  else if(G.isKenKen) nextLabel='Puzzle '+(G.pidx+2)+' / '+(G.world.total||1)+' →';
  else if(G.isDaily) nextLabel='Ho finito! 🏅';
  else if(isLast) nextLabel='Torna alla mappa 🗺️';
  document.getElementById('btn-next').textContent=nextLabel;
  document.getElementById('btn-next').onclick=isLast||G.isDaily
    ?()=>{document.getElementById('cel-ov').classList.remove('show');nextPuzzle();}
    :nextPuzzle;
  document.getElementById('btn-rep').onclick=()=>{document.getElementById('cel-ov').classList.remove('show');startReplay();};
  updateThemeSwitchLabel();
  if(typeof updateThemeSwitchVisibility==='function') updateThemeSwitchVisibility();
  document.getElementById('cel-ov').classList.add('show');
  spawnConfetti(earned>=3?'big':earned<=1?'small':undefined);
  if(newBadges.length>1)setTimeout(()=>newBadges.slice(1).forEach(b=>showBadgeUnlock(b)),600);
  // Check if the world we marked earlier is NOW unlocked
  if(_nextWorldToUnlock && isWorldUnlocked(_nextWorldToUnlock.id, gameKey)){
    setTimeout(()=>showWorldUnlock(_nextWorldToUnlock),2200);
  }
}
function nextPuzzle(){
  document.getElementById('cel-ov').classList.remove('show');
  if(G.isKenKen){
    const fromWorld = G._currentWorld && G._currentGameKey === 'kenken';
    const worldTotal = G.world.total || 1;
    const nextIdx = G.pidx + 1;

    if (fromWorld && nextIdx < worldTotal) {
      // More puzzles in this world — advance pidx and generate next KenKen
      const cfg = G._currentWorld.kenken || {};
      const sz = cfg.size || G.size;
      const diff = cfg.diff || (G.world.diff || 'easy');
      startKenKen(sz, diff, nextIdx);
      G._currentWorld = G._currentWorld; // preserve world ref (startKenKen may overwrite)
      G._currentGameKey = 'kenken';
    } else if (fromWorld) {
      // All puzzles done — go back to map
      G.isKenKen=false;G.cages=null;
      if(typeof openGameMap==='function') openGameMap('kenken');
      else { updateMap(); show('s-map'); }
    } else {
      // Standalone launch — start a new puzzle with same settings
      const sz = G.size;
      const diff = G.world && G.world.diff ? G.world.diff : 'easy';
      G.isKenKen=false;G.cages=null;
      startKenKen(sz, diff);
    }
    return;
  }
  if(G.isDaily){
    // Daily done — save result and go back to daily screen
    const tk=todayKey();
    const dp=getDailyProgress();
    const earned=Math.max(1,3-Math.floor(G.errors/2));
    dp[tk]={done:true,stars:earned,errors:G.errors,hints:3-G.hintsLeft};
    saveDailyProgress(dp);
    G.isDaily=false;
    buildDailyScreen();show('s-daily');
    return;
  }
  G.pidx++;loadPuzzle();
}

/* ══════════════════════════════════════════
   WORLD UNLOCK ANIMATION
══════════════════════════════════════════ */
function checkWorldUnlock(){
  // Check if completing this puzzle unlocked the NEXT world
  const wid=G.world.id;
  const widx=WORLDS.findIndex(w=>w.id===wid);
  if(widx<0||widx>=WORLDS.length-1)return;
  const next=WORLDS[widx+1];
  // Was it already unlocked before this puzzle?
  const wasLocked=!isWorldUnlocked(next.id, G._currentGameKey||'sudoku');
  // Is it unlocked now?
  const isNowUnlocked=isWorldUnlocked(next.id, G._currentGameKey||'sudoku');
  if(wasLocked&&isNowUnlocked){
    setTimeout(()=>showWorldUnlock(next),2200); // after celebration
  }
}
function showWorldUnlock(world){
  sfxBadge();
  setTimeout(()=>sfxWin(),400);
  document.getElementById('wuo-icon').textContent=world.icon;
  document.getElementById('wuo-name').textContent=world.name;
  document.getElementById('wuo-desc').textContent=typeof getWorldDesc==='function'?getWorldDesc(world,G._currentGameKey||'sudoku'):(world.name||'');
  const ov=document.getElementById('wuo');
  ov.classList.add('show');
  // confetti in world colors
  spawnConfetti();
  document.getElementById('btn-wuo').onclick=()=>{
    ov.classList.remove('show');
  };
}

/* ══════════════════════════════════════════
   REPLAY
══════════════════════════════════════════ */
function startReplay(){
  const sz=G.size;repSteps=buildRepSteps(G.solution,G.given,sz);
  const ov=document.getElementById('rep-ov');
  const rg=document.getElementById('rep-grid');
  const rgcls={2:'rg4',3:'rg4',4:'rg4',6:'rg6',9:'g9'}[sz]||'rg4';
  rg.className='rep-grid '+rgcls;
  ov.classList.add('show');
  renderRepGrid(new Set([...G.given]),sz,null);
  let idx=0;document.getElementById('rep-step').textContent='';
  function doStep(){
    if(idx>=repSteps.length){
      document.getElementById('rep-step').textContent='✅ Puzzle completato!';
      document.getElementById('rep-skip').textContent='Avanti! →';
      document.getElementById('rep-skip').onclick=()=>{ov.classList.remove('show');show('s-map');updateMap();};
      return;
    }
    const step=repSteps[idx++];sfxRep();
    const placed=new Set([...G.given,...repSteps.slice(0,idx).map(s=>s.pos)]);
    renderRepGrid(placed,sz,step.pos);
    document.getElementById('rep-step').textContent=step.reason||'';
    repTimer=setTimeout(doStep,900);
  }
  document.getElementById('rep-skip').textContent='Salta →';
  document.getElementById('rep-skip').onclick=()=>{clearTimeout(repTimer);ov.classList.remove('show');show('s-map');updateMap();};
  setTimeout(doStep,500);
}
function renderRepGrid(placed,sz,hlPos){
  const rg=document.getElementById('rep-grid');rg.innerHTML='';
  for(let r=0;r<sz;r++)for(let c=0;c<sz;c++){
    const pos=r*sz+c;const cell=document.createElement('div');cell.className='cell';
    cell.style.gridColumn=c+1;cell.style.gridRow=r+1;
    if(placed.has(pos)){
      cell.classList.add(G.given.has(pos)?'given':'filled');
      cell.appendChild(makeCellContent(G.solution[r][c],P.symTheme,sz));
      if(P.symTheme==='colors')cell.style.overflow='hidden';
      if(pos===hlPos){cell.classList.add('replay-reveal');cell.style.outline='3px solid var(--accent)';cell.style.zIndex='3';}
    }else cell.classList.add('empty');
    rg.appendChild(cell);
  }
}

/* ══════════════════════════════════════════
   CONFETTI
══════════════════════════════════════════ */
function spawnConfetti(intensity){
  const colors=PALS[P.palette].colors;
  const count=intensity==='big'?75:intensity==='small'?30:55;
  const gameEmojis=['⭐','✨','🌟','💫','🎉','🎊'];
  for(let i=0;i<count;i++)setTimeout(()=>{
    const el=document.createElement('div');el.className='cfp';
    el.style.left=Math.random()*100+'vw';el.style.top='-22px';
    // E04: varied shapes — circles, rectangles, stars, emoji
    const shapeRoll=Math.random();
    if(shapeRoll<0.15){
      // Emoji particle with rotation
      el.textContent=gameEmojis[rnd(gameEmojis.length)];
      el.style.fontSize=(12+rnd(10))+'px';
      el.style.background='none';
      el.style.width='auto';el.style.height='auto';
      el.style.animation=`cfp-fall ${1.5+Math.random()*1.2}s linear forwards, cfp-spin ${0.5+Math.random()*1}s linear infinite`;
    } else {
      const w=6+rnd(12),h=6+rnd(12);
      el.style.width=w+'px';el.style.height=h+'px';
      el.style.background=colors[rnd(colors.length)];
      if(shapeRoll<0.5) el.style.borderRadius='50%';
      else if(shapeRoll<0.7) el.style.borderRadius='2px';
      else el.style.borderRadius='50% 0 50% 0'; // leaf/diamond
    }
    el.style.animationDuration=(1.5+Math.random()*1.2)+'s';
    document.body.appendChild(el);setTimeout(()=>el.remove(),3200);
  },i*(intensity==='big'?30:44));
}