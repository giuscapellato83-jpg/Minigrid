/* ══════════════════════════════════════════
   GAME — D01: diff-based grid update
══════════════════════════════════════════ */
let _gridCells = []; // cached DOM references
let _gridSeps = [];  // cached separator elements
let _gridBuilt = 0;  // grid size last built for

function startWorld(world,startIdx=0){
  const suCfg = world.sudoku || world;
  G.world=world;G.size=suCfg.size||world.size||4;
  G.world._diff=suCfg.diff||world.diff||'medium';
  G.pidx=startIdx;G.hintsLeft=3;
  document.getElementById('hdr-av').textContent=P.avatar;
  document.getElementById('hdr-nm').textContent=P.name;
  document.getElementById('hdr-sc').textContent=P.stars;
  document.getElementById('hdr-stk').textContent=P.streak||0;
  document.getElementById('pill-icon').textContent=world.icon;
  document.getElementById('pill-nm').textContent=world.name;
  // Game badge
  const badge=document.getElementById('hdr-game-badge');
  if(badge) badge.textContent=G._currentGameKey==='kenken'?'🧮 KenKen':'🔢 Sudoku';
  // Game info bar - pill is now separate from progress
  document.getElementById('pill-pg').textContent='Puzzle '+(G.pidx+1)+' / '+(G.world.total||8);
  const gcls={2:'g2',3:'g3',4:'g4',6:'g6',9:'g9'}[G.size]||'g4';
  document.getElementById('sudoku-grid').className='sudoku-grid '+gcls;
  document.getElementById('btn-gb').onclick=()=>{sfxClick();show('s-map');updateMap();};
  document.getElementById('erase-btn').onclick=eraseCell;
  document.getElementById('hint-btn').onclick=useHint;
  document.getElementById('sound-btn').onclick=toggleSound;
  G.adaptDiff=computeAdaptDiff();
  _gridBuilt=0; // force rebuild
  show('s-game');updateThemeSwitchLabel();loadPuzzle();
}

function loadPuzzle(){
  G.isKenKen=false;G.cages=null;
  G.adaptDiff=computeAdaptDiff();
  const diff=G.adaptDiff||(G.world&&G.world._diff)||'medium';
  const{solution,board,given}=makePuzzle(G.size,diff);
  G.solution=solution;G.board=board;G.given=given;
  G.selCell=null;G.selSym=0;G.errors=0;G.hintsLeft=3;G.startTime=Date.now();
  const worldTotal=G.world.total||8;
  document.getElementById('pill-pg').textContent='Puzzle '+(G.pidx+1)+' / '+worldTotal;
  document.getElementById('hdr-sc').textContent=P.stars;
  document.getElementById('adapt-badge').style.display='none';
  updateHintBtn();buildGridDOM();updateGridCells();renderPalette();
  if(typeof startGameTimer==='function') startGameTimer(); // GD09
  if(G.pidx>0)showAdaptBadge(G.adaptDiff);
}

/* D01: Build grid DOM once, then update cells in-place */
function buildGridDOM(){
  const sz=G.size;
  if(_gridBuilt===sz) return; // already built for this size
  const grid=document.getElementById('sudoku-grid');grid.innerHTML='';
  _gridCells=[];_gridSeps=[];_gridBuilt=sz;
  const{BR,BC}=boxDims(sz);
  const cvar=sz<=4?'4':sz===6?'6':'9';
  // F05: no box separators for size <= 3 (no meaningful boxes)
  if(sz >= 4) {
  const numVSep=Math.floor(sz/BC)-1;
  const numHSep=Math.floor(sz/BR)-1;
  for(let i=1;i<=numVSep;i++){
    const cv=document.createElement('div');cv.className='bsep-v';
    cv.style.left=`calc(${i*BC}*(var(--c${cvar}) + var(--gap)) - var(--gap)/2 - 1.5px)`;
    grid.appendChild(cv);_gridSeps.push(cv);
  }
  for(let i=1;i<=numHSep;i++){
    const ch=document.createElement('div');ch.className='bsep-h';
    ch.style.top=`calc(${i*BR}*(var(--c${cvar}) + var(--gap)) - var(--gap)/2 - 1.5px)`;
    grid.appendChild(ch);_gridSeps.push(ch);
  }
  }
  // Cells
  for(let r=0;r<sz;r++)for(let c=0;c<sz;c++){
    const pos=r*sz+c;
    const cell=document.createElement('div');
    cell.className='cell';cell.dataset.pos=pos;
    cell.style.gridColumn=c+1;cell.style.gridRow=r+1;
    cell.addEventListener('click',()=>handleCell(pos));
    grid.appendChild(cell);
    _gridCells.push(cell);
  }
}

/* D01: Update only changed cells (no innerHTML='') */
function updateGridCells(){
  const sz=G.size;
  for(let r=0;r<sz;r++)for(let c=0;c<sz;c++){
    const pos=r*sz+c;
    const cell=_gridCells[pos];if(!cell)continue;
    const val=G.board[r][c];
    const isGiven=G.given.has(pos);
    const isSel=G.selCell===pos;

    // Reset classes
    cell.className='cell';
    cell.style.overflow='';

    // Highlight row/col
    if(G.selCell!==null&&!isSel){
      const sr=Math.floor(G.selCell/sz),sc=G.selCell%sz;
      if(r===sr||c===sc)cell.classList.add('highlight');
    }

    // Content
    cell.innerHTML='';
    if(val){
      cell.classList.add(isGiven?'given':'filled');
      cell.appendChild(makeCellContent(val,P.symTheme,sz));
      if(P.symTheme==='colors')cell.style.overflow='hidden';
    }else{
      cell.classList.add('empty');
      if(isSel)cell.classList.add('sel');
    }
  }
}

/* Backward compat: renderGrid calls updateGridCells */
function renderGrid(){
  if(_gridBuilt!==G.size) buildGridDOM();
  updateGridCells();
}

function handleCell(pos){
  const r=Math.floor(pos/G.size),c=pos%G.size;sfxClick();
  if(G.isKenKen){
    // Always just select the cell — placement happens from the palette
    if(G.given.has(pos)) return;
    G.selCell=pos;
    renderKenKenGrid(G.cages,G.size);
    return;
  }
  if(G.board[r][c]!==0&&!G.given.has(pos)){G.selCell=pos;updateGridCells();return;}
  G.selCell=pos;updateGridCells();
  if(G.selSym!==null)placeSymbol(pos,G.selSym);
}

function placeSymbol(pos,symIdx){
  const r=Math.floor(pos/G.size),c=pos%G.size;
  if(G.given.has(pos))return;
  const val=symIdx+1;const correct=G.solution[r][c]===val;
  G.board[r][c]=val;G.selCell=null;updateGridCells();
  const cel=_gridCells[pos];
  if(!correct){
    G.errors++;sfxErr();
    if(typeof mascotReact==='function') mascotReact('sad');
    if(cel){cel.classList.add('shake');setTimeout(()=>{G.board[r][c]=0;updateGridCells();},430);}
  }else{
    sfxOk();
    if(typeof mascotReact==='function') mascotReact('happy');
    if(cel){cel.classList.add('pop');setTimeout(()=>cel.classList.remove('pop'),380);}
    spawnFloatStar(cel);
    checkWin();
  }
}

function spawnFloatStar(cel){
  if(!cel)return;
  const rect=cel.getBoundingClientRect();
  const el=document.createElement('div');el.className='float-star';el.textContent='✨';
  el.style.left=(rect.left+rect.width/2-10)+'px';el.style.top=(rect.top)+'px';
  document.body.appendChild(el);setTimeout(()=>el.remove(),1300);
}

function eraseCell(){
  if(G.selCell===null)return;
  const r=Math.floor(G.selCell/G.size),c=G.selCell%G.size;
  if(!G.given.has(G.selCell)){G.board[r][c]=0;sfxClick();updateGridCells();}
}

function checkWin(){
  const sz=G.size;
  for(let r=0;r<sz;r++)for(let c=0;c<sz;c++)
    if(!G.board[r][c]||G.board[r][c]!==G.solution[r][c])return;
  setTimeout(()=>{sfxWin();if(typeof stopGameTimer==='function')stopGameTimer();showCelebration();},300);
}

/* PALETTE */
function renderPalette(){
  const cont=document.getElementById('sym-palette');cont.innerHTML='';
  const syms=SYMS[P.symTheme][G.size];
  syms.forEach((sym,i)=>{
    const btn=document.createElement('button');btn.className='sym-pick'+(i===G.selSym?' active':'');
    if(P.symTheme==='colors')btn.style.background=sym;
    else if(P.symTheme==='numbers'){btn.style.background=PALS[P.palette].colors[i%4];btn.style.color='#fff';btn.style.fontFamily="'Fredoka One',cursive";btn.style.fontSize='22px';btn.textContent=sym;}
    else if(P.symTheme==='shapes'){btn.style.background=PALS[P.palette].colors[i%4];btn.style.color='#fff';btn.style.fontSize='22px';btn.textContent=sym;}
    else{btn.textContent=sym;btn.style.background=PALS[P.palette].colors[i%4]+'44';}
    btn.onclick=()=>{G.selSym=i;sfxClick();renderPalette();if(G.selCell!==null)placeSymbol(G.selCell,i);};
    cont.appendChild(btn);
  });
}

/* HINT */
function useHint(){
  if(G.hintsLeft<=0)return;
  const sz=G.size;let best=null,bestScore=-1;
  for(let r=0;r<sz;r++)for(let c=0;c<sz;c++){
    if(G.board[r][c])continue;
    const rf=G.board[r].filter(v=>v).length;
    const cf=[...Array(sz)].map((_,rr)=>G.board[rr][c]).filter(v=>v).length;
    const s=rf+cf;if(s>bestScore){bestScore=s;best={r,c};}
  }
  if(!best)return;
  G.hintsLeft--;updateHintBtn();sfxHint();
  const pos=best.r*sz+best.c;G.selCell=pos;updateGridCells();
  const cel=_gridCells[pos];
  if(cel){cel.classList.add('hint-glow');setTimeout(()=>cel.classList.remove('hint-glow'),3500);}
}
function updateHintBtn(){
  document.getElementById('hint-lbl').textContent=G.hintsLeft>0?`Aiuto (${G.hintsLeft})`:'Nessun aiuto';
  document.getElementById('hint-btn').classList.toggle('off',G.hintsLeft<=0);
}

/* SOUND */
function toggleSound(){soundOn=!soundOn;document.getElementById('sound-btn').textContent=soundOn?'🔊':'🔇';if(soundOn)sfxClick();}
