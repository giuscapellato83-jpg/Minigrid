/* ══════════════════════════════════════════
   MAZE ENGINE
══════════════════════════════════════════ */

/* ── World definitions ── */
const MAZE_WORLDS = [
  { id:'mw0', name:'Il Giardino',  icon:'🌿', phase:0, gridSize:4, extraOpen:4, desc:'4×4 · Facilissimo' },
  { id:'mw1', name:'Il Bosco',     icon:'🌲', phase:1, gridSize:6, extraOpen:3, desc:'6×6 · Facile'      },
  { id:'mw2', name:'Il Villaggio', icon:'🏘️', phase:2, gridSize:8, extraOpen:2, desc:'8×8 · Medio'       },
  { id:'mw3', name:'La Città',     icon:'🏙️', phase:3, gridSize:10,extraOpen:1, desc:'10×10 · Difficile' },
];

/* ── Maze state ── */
const MZ = {
  worldIdx:  0,
  grid:      null,   // 2D array: 0=open, 1=wall
  rows:      0,
  cols:      0,
  player:    {r:0,c:0},
  goal:      {r:0,c:0},
  steps:     0,
  minSteps:  0,       // BFS shortest path
  moving:    false,   // animation lock
  animFrame: null,
  anim:      null,    // { type:'walk'|'bump'|'win', progress:0, dir:{dr,dc} }
  cellPx:    0,
  canvasSize:0,
  solved:    false,
  starterPos:{r:0,c:0},
};

/* ── DFS Maze Generator ──
   Produces a "perfect" maze (exactly one path between any two cells).
   Grid is (2*rows+1) × (2*cols+1): odd indices are cells, even are walls.
*/
function generateMaze(rows, cols, extraOpen=0) {
  const h = 2*rows+1, w = 2*cols+1;
  const grid = Array.from({length:h},()=>Array(w).fill(1)); // all walls

  // Carve passages using iterative DFS
  function cellToGrid(r,c){ return [2*r+1, 2*c+1]; }
  const visited = Array.from({length:rows},()=>Array(cols).fill(false));
  const DIRS = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}];

  function shuffle(arr){ for(let i=arr.length-1;i>0;i--){const j=0|Math.random()*(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];}return arr; }

  // Open all cell positions
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const [gr,gc]=cellToGrid(r,c); grid[gr][gc]=0;
  }

  // DFS
  const stack=[[0,0]]; visited[0][0]=true;
  while(stack.length){
    const [r,c]=stack[stack.length-1];
    const nbrs=shuffle(DIRS).filter(({dr,dc})=>{
      const nr=r+dr,nc=c+dc;
      return nr>=0&&nr<rows&&nc>=0&&nc<cols&&!visited[nr][nc];
    });
    if(nbrs.length){
      const {dr,dc}=nbrs[0];
      // Remove wall between (r,c) and (r+dr,c+dc)
      const [gr,gc]=cellToGrid(r,c);
      grid[gr+dr][gc+dc]=0;
      visited[r+dr][c+dc]=true;
      stack.push([r+dr,c+dc]);
    } else stack.pop();
  }

  // Remove extra walls to create alternative paths (easier levels)
  if(extraOpen>0){
    const wallCandidates=[];
    for(let gr=1;gr<h-1;gr++) for(let gc=1;gc<w-1;gc++){
      if(grid[gr][gc]===1){
        // horizontal wall between two horizontal cells
        const isHWall=(gr%2===1&&gc%2===0);
        // vertical wall between two vertical cells
        const isVWall=(gr%2===0&&gc%2===1);
        if(isHWall||isVWall) wallCandidates.push([gr,gc]);
      }
    }
    shuffle(wallCandidates).slice(0,extraOpen).forEach(([gr,gc])=>{ grid[gr][gc]=0; });
  }

  return grid;
}

/* ── BFS shortest path ── */
function bfsDistance(grid, sr, sc, er, ec, rows, cols){
  function cellToGrid(r,c){ return [2*r+1,2*c+1]; }
  const visited=Array.from({length:rows},()=>Array(cols).fill(false));
  const queue=[[sr,sc,0]]; visited[sr][sc]=true;
  const DIRS=[{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}];
  while(queue.length){
    const [r,c,d]=queue.shift();
    if(r===er&&c===ec) return d;
    for(const {dr,dc} of DIRS){
      const nr=r+dr,nc=c+dc;
      if(nr<0||nr>=rows||nc<0||nc>=cols||visited[nr][nc]) continue;
      const [gr,gc]=cellToGrid(r,c);
      if(grid[gr+dr][gc+dc]===1) continue; // wall
      visited[nr][nc]=true;
      queue.push([nr,nc,d+1]);
    }
  }
  return 999;
}

/* ── Single render loop — one rAF, no duplicate loops ── */
let _mazeLoopId = null;
let _mazeAnimStart = 0;
const ANIM_DURATION = 200; // Fix 9: 200ms per move (was 120 — too fast for children)

function startMazeLoop(){
  if(_mazeLoopId) cancelAnimationFrame(_mazeLoopId);
  function tick(ts){
    if(!document.getElementById('s-maze').classList.contains('active')){ _mazeLoopId=null; return; }
    // Advance animation
    if(MZ.anim){
      const elapsed = ts - _mazeAnimStart;
      MZ.anim.progress = Math.min(1, elapsed / ANIM_DURATION);
      if(MZ.anim.progress >= 1){
        const type = MZ.anim.type;
        MZ.anim = null;
        if(type !== 'win') MZ.moving = false;
      }
    }
    drawMaze();
    _mazeLoopId = requestAnimationFrame(tick);
  }
  _mazeLoopId = requestAnimationFrame(tick);
}

function startAnim(type, dir){
  _mazeAnimStart = performance.now();
  MZ.anim = { type, dir: dir||{dr:0,dc:0}, progress: 0 };
  MZ.moving = true;
}

/* ── Canvas renderer ── */
function drawMaze(){
  const canvas = document.getElementById('maze-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const {grid, rows, cols, player, goal} = MZ;
  if(!grid) return;
  const anim = MZ.anim; // read once — safe reference

  const W=canvas.width, H=canvas.height;

  // Fix 1: Read theme colors from CSS vars (set by maze-theme-* classes)
  const cs = getComputedStyle(document.body);
  const wallColor   = MZ._themeColors?.wall   || cs.getPropertyValue('--mz-wall').trim()   || '#2ecc71';
  const wallEdge    = MZ._themeColors?.edge   || cs.getPropertyValue('--mz-wall2').trim()  || '#1a5c2a';
  const wallInner   = MZ._themeColors?.inner  || cs.getPropertyValue('--mz-border').trim() || '#27ae60';
  const floorColor1 = MZ._themeColors?.floor1 || cs.getPropertyValue('--mz-floor').trim()  || '#e8f5e9';
  const floorColor2 = MZ._themeColors?.floor2 || cs.getPropertyValue('--mz-floor2').trim() || '#f1faf2';
  const bgColor     = MZ._themeColors?.bg     || cs.getPropertyValue('--mz-bg').trim()     || '#f0fff4';

  ctx.clearRect(0,0,W,H);

  // Background
  ctx.fillStyle=bgColor;
  ctx.fillRect(0,0,W,H);

  // Helper: convert cell (r,c) to top-left canvas pixel
  const h=grid.length, w=grid[0].length;

  // Draw using wall-grid approach
  const wallW=3; // wall thickness px (kept for reference)

  function gx(gc){ return gc*Math.floor((totalW)/(2*cols+1)); }
  function gy(gr){ return gr*Math.floor((totalH)/(2*rows+1)); }

  // Pre-compute pixel coords for each grid cell
  const cellW=Math.floor(canvas.width/(2*cols+1));
  const cellH=Math.floor(canvas.height/(2*rows+1));

  // Walls
  for(let gr=0;gr<h;gr++){
    for(let gc=0;gc<w;gc++){
      if(grid[gr][gc]===0) continue;
      const x=gc*cellW, y=gr*cellH;
      const isEdge=(gr===0||gr===h-1||gc===0||gc===w-1);
      ctx.fillStyle=isEdge?wallEdge:wallColor;
      ctx.fillRect(x,y,cellW,cellH);
      if(!isEdge){
        ctx.fillStyle='rgba(0,0,0,.08)';
        ctx.fillRect(x,y,cellW,cellH);
        ctx.fillStyle=wallInner;
        ctx.fillRect(x+2,y+2,cellW-4,cellH-4);
      }
    }
  }

  // Floor (path cells) with subtle checker
  for(let gr=0;gr<h;gr++){
    for(let gc=0;gc<w;gc++){
      if(grid[gr][gc]!==0) continue;
      const x=gc*cellW, y=gr*cellH;
      const r=Math.floor(gr/2), c=Math.floor(gc/2);
      const isCell=(gr%2===1&&gc%2===1);
      ctx.fillStyle=(isCell&&(r+c)%2===0)?floorColor1:floorColor2;
      ctx.fillRect(x,y,cellW,cellH);
    }
  }

  // Fix 7: Breadcrumb — subtle dots on visited cells
  if(MZ._visited && MZ._visited.size > 0){
    ctx.fillStyle='rgba(100,100,100,.12)';
    MZ._visited.forEach(key=>{
      const [vr,vc]=key.split(',').map(Number);
      // Don't draw on current player position
      if(vr===player.r && vc===player.c) return;
      const vgr=2*vr+1, vgc=2*vc+1;
      const vx=vgc*cellW+cellW/2, vy=vgr*cellH+cellH/2;
      ctx.beginPath();
      ctx.arc(vx,vy,Math.max(2,cellW*0.12),0,Math.PI*2);
      ctx.fill();
    });
  }

  // Goal (cagnolino) cell highlight
  {
    const gr=2*goal.r+1, gc=2*goal.c+1;
    const x=gc*cellW+2, y=gr*cellH+2;
    ctx.fillStyle='rgba(255,193,7,.3)';
    ctx.beginPath();
    ctx.roundRect(x,y,cellW-4,cellH-4,4);
    ctx.fill();
  }

  // Animation offset for player
  let offX=0, offY=0, scaleP=1, angle=0;
  if(anim){
    const t=anim.progress; // 0→1
    if(anim.type==='walk'){
      offX=anim.dir.dc*cellW*(t-1);
      offY=anim.dir.dr*cellH*(t-1);
      // bounce
      const bounce=Math.sin(t*Math.PI)*3;
      offY-=bounce;
    } else if(anim.type==='bump'){
      const shake=Math.sin(t*Math.PI*4)*4*(1-t);
      offX=anim.dir.dc*shake; offY=anim.dir.dr*shake;
    } else if(anim.type==='win'){
      scaleP=1+Math.sin(t*Math.PI*2)*0.3;
      angle=Math.sin(t*Math.PI*4)*15;
    }
  }

  // Goal emoji (cagnolino)
  {
    const gr=2*goal.r+1, gc=2*goal.c+1;
    const cx=gc*cellW+cellW/2, cy=gr*cellH+cellH/2;
    const fs=Math.max(14,cellW*0.65);
    ctx.font=`${fs}px serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    // small pulse
    const pulse=1+Math.sin(Date.now()/400)*0.06;
    ctx.save();
    ctx.translate(cx,cy);
    ctx.scale(pulse,pulse);
    ctx.fillText('🐶',0,0);
    ctx.restore();
  }

  // Fix 5: Hint flash — pulsing highlight on the next cell
  if(MZ._hintCell && Date.now() < MZ._hintCell.until){
    const hr=MZ._hintCell.r, hc=MZ._hintCell.c;
    const hgr=2*hr+1, hgc=2*hc+1;
    const hx=hgc*cellW, hy=hgr*cellH;
    const pulse=0.3+Math.sin(Date.now()/150)*0.2;
    ctx.fillStyle=`rgba(255,215,0,${pulse})`;
    ctx.beginPath();
    ctx.roundRect(hx+1,hy+1,cellW-2,cellH-2,3);
    ctx.fill();
    // Arrow indicator
    const acx=hgc*cellW+cellW/2, acy=hgr*cellH+cellH/2;
    ctx.font=`${Math.max(10,cellW*0.4)}px serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='rgba(0,0,0,0.5)';
    ctx.fillText('👣',acx,acy);
  } else if(MZ._hintCell) {
    MZ._hintCell = null; // expired
  }

  // Player emoji (omino) 
  {
    const gr=2*player.r+1, gc=2*player.c+1;
    const cx=gc*cellW+cellW/2+offX;
    const cy=gr*cellH+cellH/2+offY;
    const fs=Math.max(14,cellW*0.65);
    ctx.save();
    ctx.translate(cx,cy);
    ctx.scale(scaleP,scaleP);
    ctx.rotate(angle*Math.PI/180);
    ctx.font=`${fs}px serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🧒',0,0);
    ctx.restore();
  }

}

/* ── Move player ── */
function mazeMove(dr, dc){
  if(MZ.moving || MZ.solved) return;
  const nr=MZ.player.r+dr, nc=MZ.player.c+dc;
  const {grid,rows,cols}=MZ;

  // Check bounds
  if(nr<0||nr>=rows||nc<0||nc>=cols){ bumped(dr,dc); return; }

  // Check wall between current and next cell
  const gr=2*MZ.player.r+1, gc=2*MZ.player.c+1;
  const wallGr=gr+dr, wallGc=gc+dc;
  if(grid[wallGr][wallGc]===1){ bumped(dr,dc); return; }

  // Valid move
  MZ.player.r=nr; MZ.player.c=nc;
  MZ.steps++;
  MZ._bumpCount = 0; // Fix 4: reset consecutive bump counter
  // Fix 7: Track visited cells for breadcrumb
  if(!MZ._visited) MZ._visited = new Set();
  MZ._visited.add(nr+','+nc);
  document.getElementById('maze-steps').textContent=MZ.steps;

  // Check win
  if(nr===MZ.goal.r && nc===MZ.goal.c){
    MZ.solved=true;
    startAnim('walk',{dr,dc});
    sfxWin();
    if(typeof mascotReact==='function') mascotReact('happy');
    setTimeout(()=>{ startAnim('win',{dr:0,dc:0}); setTimeout(showMazeWin, ANIM_DURATION+80); }, ANIM_DURATION+40);
    return;
  }

  startAnim('walk',{dr,dc});
  sfxClick();
}

function bumped(dr,dc){
  startAnim('bump',{dr,dc});
  sfxErr();
  // Fix 4+11: Count bumps — mascot reacts sad only after 3+ consecutive
  MZ._bumpCount = (MZ._bumpCount || 0) + 1;
  if(MZ._bumpCount >= 3 && typeof mascotReact==='function') mascotReact('sad');
}

/* ── Win screen ── */
function showMazeWin(){
  // Base implementation — monkey-patched by themes.js for world integration
  spawnConfetti();
  const steps=MZ.steps, best=MZ.minSteps;
  const ratio=steps/best;
  const earned=ratio<=1.2?3:ratio<=1.8?2:1;
  document.getElementById('maze-stars').textContent=P.stars;

  const titles=['Ce l\'hai fatta!','Bravissimo!','Fantastico!','Trovato!'];
  document.getElementById('maze-win-title').textContent=titles[rnd(titles.length)];
  document.getElementById('maze-win-steps').textContent=
    `${steps} passi · percorso minimo: ${best}`;
  document.getElementById('maze-win-stars').textContent=`⭐ +${earned} stelle!`;

  const btn=document.getElementById('maze-win-next');
  btn.textContent='Avanti! →';
  btn.onclick=()=>{ closeMazeWin(); newMaze(); };

  document.getElementById('maze-win').classList.add('show');
}
function closeMazeWin(){ document.getElementById('maze-win').classList.remove('show'); }

/* ── Start a maze world ── */
function startMazeWorld(idx){
  const world=MAZE_WORLDS[idx];
  MZ.worldIdx=idx;
  MZ.solved=false;
  MZ.steps=0;
  MZ.moving=false;
  MZ.anim=null;
  MZ._hintsLeft=3; MZ._bumpCount=0; MZ._hintCell=null; // Fix 4+5
  MZ._lastExtraOpen=world.extraOpen; // Fix 3
  MZ._visited=new Set(['0,0']); // Fix 7: breadcrumb
  cancelAnimationFrame(MZ.animFrame);

  const N=world.gridSize;
  MZ.rows=N; MZ.cols=N;
  MZ.grid=generateMaze(N,N,world.extraOpen);

  // Player starts top-left, dog at bottom-right
  MZ.player={r:0,c:0};
  MZ.goal={r:N-1,c:N-1};
  MZ.starterPos={r:0,c:0};

  // BFS min steps
  MZ.minSteps=bfsDistance(MZ.grid,0,0,N-1,N-1,N,N);

  // Size canvas — Fix 12: responsive, no hard 360px cap
  const wrap=document.getElementById('maze-canvas-wrap');
  const bodyEl=document.querySelector('.maze-body');
  const bodyR=bodyEl.getBoundingClientRect();
  const avH=Math.max(160, bodyR.height-340);
  const avW=Math.min(bodyR.width-24, avH, 500); // was 360, now 500 for desktop
  const canvSz=Math.floor(avW);

  // cellPx: each cell + 1px wall (wall cells are 0.5× cell size)
  // grid is (2N+1)×(2N+1). Total pixels = (2N+1)*unit where unit=canvSz/(2N+1)
  MZ.canvasSize=canvSz;
  MZ.cellPx=Math.floor(canvSz/(2*N+1))*2; // approx cell size in px

  const canvas=document.getElementById('maze-canvas');
  canvas.width=canvSz; canvas.height=canvSz;
  wrap.style.width=wrap.style.height=canvSz+'px';

  // Update UI
  document.getElementById('maze-pill-icon').textContent=world.icon;
  document.getElementById('maze-pill-nm').textContent=world.name;
  document.getElementById('maze-pill-pg').textContent=`Livello ${idx+1} · ${world.desc}`;
  document.getElementById('maze-steps').textContent='0';
  document.getElementById('maze-stars').textContent=P.stars;
  closeMazeWin();

  startMazeLoop();
  if(typeof updateMazeHintBtn==='function') updateMazeHintBtn();
}

/* ── New random maze (same world) ── */
function newMaze(){
  sfxClick();
  // Fix 3: Use _worldRef for extraOpen, fallback to current grid params
  const worldCfg = MZ._worldRef?.maze || null;
  const extraOpen = worldCfg ? (worldCfg.extraOpen || 1) : MZ._lastExtraOpen || 1;
  MZ.solved=false; MZ.steps=0; MZ.moving=false; MZ.anim=null; _mazeAnimStart=0;
  MZ._hintsLeft=3; MZ._bumpCount=0; MZ._hintCell=null;
  MZ._visited=new Set(['0,0']); // Fix 7
  MZ.grid=generateMaze(MZ.rows,MZ.cols,extraOpen);
  MZ.player={...MZ.starterPos};
  MZ.minSteps=bfsDistance(MZ.grid,0,0,MZ.rows-1,MZ.cols-1,MZ.rows,MZ.cols);
  document.getElementById('maze-steps').textContent='0';
  closeMazeWin();
  if(typeof updateMazeHintBtn==='function') updateMazeHintBtn();
}
function resetMaze(){
  sfxClick();
  MZ.solved=false; MZ.steps=0; MZ.moving=false; MZ.anim=null;
  MZ._bumpCount=0; MZ._hintCell=null;
  MZ._visited=new Set(['0,0']); // Fix 7
  MZ.player={...MZ.starterPos};
  document.getElementById('maze-steps').textContent='0';
  closeMazeWin();
}

/* ── D-pad ── */
let _dpadRepeatTimer = null;

function bindDpad(){
  const map={
    'mz-up':   {dr:-1,dc:0},
    'mz-down': {dr:1, dc:0},
    'mz-left': {dr:0, dc:-1},
    'mz-right':{dr:0, dc:1},
  };
  function stopRepeat(btn){ clearInterval(_dpadRepeatTimer); _dpadRepeatTimer=null; if(btn)btn.classList.remove('pressed'); }

  Object.entries(map).forEach(([id,dir])=>{
    const btn=document.getElementById(id);
    btn.addEventListener('pointerdown',e=>{
      e.preventDefault(); btn.classList.add('pressed');
      mazeMove(dir.dr,dir.dc);
      // Fix 10: Start repeat timer after initial delay
      stopRepeat();
      _dpadRepeatTimer = setInterval(()=>{
        if(!MZ.moving && !MZ.solved) mazeMove(dir.dr,dir.dc);
      }, 220);
    });
    btn.addEventListener('pointerup',  ()=>stopRepeat(btn));
    btn.addEventListener('pointerleave',()=>stopRepeat(btn));
    btn.addEventListener('pointercancel',()=>stopRepeat(btn));
  });

  // Keyboard support with hold repeat
  const _keysDown = {};
  document.addEventListener('keydown',e=>{
    if(!document.getElementById('s-maze').classList.contains('active')) return;
    const km={'ArrowUp':{dr:-1,dc:0},'ArrowDown':{dr:1,dc:0},
              'ArrowLeft':{dr:0,dc:-1},'ArrowRight':{dr:0,dc:1}};
    if(km[e.key] && !_keysDown[e.key]){
      e.preventDefault();
      _keysDown[e.key]=true;
      mazeMove(km[e.key].dr,km[e.key].dc);
    }
  });
  document.addEventListener('keyup',e=>{
    delete _keysDown[e.key];
  });
}

/* ── Swipe support ── */
(function(){
  let tx=0,ty=0;
  document.getElementById('maze-canvas-wrap')?.addEventListener('touchstart',e=>{
    tx=e.touches[0].clientX; ty=e.touches[0].clientY;
  },{passive:true});
  document.getElementById('maze-canvas-wrap')?.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-tx;
    const dy=e.changedTouches[0].clientY-ty;
    if(Math.abs(dx)>Math.abs(dy)){
      if(Math.abs(dx)>20) mazeMove(0,dx>0?1:-1);
    } else {
      if(Math.abs(dy)>20) mazeMove(dy>0?1:-1,0);
    }
  },{passive:true});
})();

/* ── Open from map ── */
function openMaze(){
  sfxClick();
  if(_mazeLoopId){cancelAnimationFrame(_mazeLoopId);_mazeLoopId=null;}
  show('s-maze');
  setTimeout(()=>startMazeWorld(MZ.worldIdx||0),80);
}

/* ── Wire ── */
document.getElementById('btn-maze-map').onclick    = openMaze;
document.getElementById('btn-maze-back').onclick   = ()=>{ gameBackToMap('maze', ()=>{if(_mazeLoopId){cancelAnimationFrame(_mazeLoopId);_mazeLoopId=null;}}); };
document.getElementById('maze-reset-btn').onclick  = resetMaze;
document.getElementById('maze-new-btn').onclick    = newMaze;
const _mazeSoundBtn = document.getElementById('maze-sound-btn');
if (_mazeSoundBtn) _mazeSoundBtn.onclick = toggleSound;

/* Fix 5: Hint — flash the next cell on the shortest path */
function useMazeHint(){
  if(MZ._hintsLeft <= 0 || MZ.solved) return;
  const {grid,rows,cols,player,goal} = MZ;

  // BFS from player to goal, record parent pointers
  function cellToGrid(r,c){ return [2*r+1,2*c+1]; }
  const visited=Array.from({length:rows},()=>Array(cols).fill(false));
  const parent=Array.from({length:rows},()=>Array(cols).fill(null));
  const queue=[[player.r,player.c]]; visited[player.r][player.c]=true;
  const DIRS=[{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}];
  let found=false;
  while(queue.length && !found){
    const [r,c]=queue.shift();
    for(const {dr,dc} of DIRS){
      const nr=r+dr,nc=c+dc;
      if(nr<0||nr>=rows||nc<0||nc>=cols||visited[nr][nc]) continue;
      const [gr,gc]=cellToGrid(r,c);
      if(grid[gr+dr][gc+dc]===1) continue;
      visited[nr][nc]=true;
      parent[nr][nc]={r,c};
      queue.push([nr,nc]);
      if(nr===goal.r && nc===goal.c){ found=true; break; }
    }
  }
  if(!found) return;

  // Trace back to find the first step
  let cur={r:goal.r,c:goal.c};
  while(parent[cur.r][cur.c] && !(parent[cur.r][cur.c].r===player.r && parent[cur.r][cur.c].c===player.c)){
    cur=parent[cur.r][cur.c];
  }
  // cur is now the next cell the player should move to

  MZ._hintsLeft--;
  updateMazeHintBtn();
  sfxHint();

  // Flash the hint cell on the canvas
  MZ._hintCell = {r:cur.r, c:cur.c, until: Date.now()+2000};
  // The drawMaze loop will render the flash
}

function updateMazeHintBtn(){
  const lbl = document.getElementById('maze-hint-lbl');
  if(lbl) lbl.textContent = MZ._hintsLeft > 0 ? 'Aiuto ('+MZ._hintsLeft+')' : 'Nessun aiuto';
  const btn = document.getElementById('maze-hint-btn');
  if(btn) btn.classList.toggle('off', MZ._hintsLeft <= 0);
}

const _mazeHintBtn = document.getElementById('maze-hint-btn');
if (_mazeHintBtn) _mazeHintBtn.onclick = useMazeHint;

bindDpad();