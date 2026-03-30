/* ══════════════════════════════════════════
   SLIDING PUZZLE ENGINE
══════════════════════════════════════════ */

/* ── Levels ──
   Each level defines: gridSize, shuffleMoves (difficulty), icon, name
*/
const SLIDE_LEVELS = [
  { id:'sl0', name:'Quasi risolto', icon:'🌱', phase:0, gridSize:3, shuffleMoves:6,  desc:'3×3 · Facilissimo' },
  { id:'sl1', name:'Livello 1',     icon:'🎮', phase:1, gridSize:3, shuffleMoves:15, desc:'3×3 · Facile'      },
  { id:'sl2', name:'Livello 2',     icon:'⭐', phase:2, gridSize:3, shuffleMoves:30, desc:'3×3 · Medio'       },
  { id:'sl3', name:'Livello 3',     icon:'🔥', phase:3, gridSize:3, shuffleMoves:60, desc:'3×3 · Difficile'   },
  { id:'sl4', name:'Sfida 4×4',     icon:'🏆', phase:4, gridSize:4, shuffleMoves:30, desc:'4×4 · Esperto'     },
];

/* ── Tile colour palette ── */
const SLIDE_COLORS = [
  null,       // 0 = empty (handled separately)
  '#FF5252','#2196F3','#FF9800',
  '#9C27B0','#4CAF50','#00BCD4',
  '#E91E63','#795548','#607D8B',
  '#CDDC39','#FF7043','#26C6DA',
  '#AB47BC','#66BB6A','#FFA726',
];

/* ── State ── */
const SL = {
  levelIdx:  0,
  gridSize:  3,
  tiles:     [],   // flat array: value at each position (0=empty)
  emptyPos:  0,    // index of empty cell
  moves:     0,
  solved:    false,
  animating: false,
  initialTiles: [], // for reset
  tileSizePx:   80,
  hintShown:    false,
};

/* ── Goal state ──
   For NxN: [1,2,...,N*N-1, 0]  (0 = empty at last position)
*/
function goalState(n){ return [...Array(n*n-1).keys()].map(i=>i+1).concat(0); }

/* ── Solvability check ──
   A puzzle is solvable iff:
   - Grid width is odd AND number of inversions is even
   - Grid width is even AND (inversions + row-of-empty-from-bottom) is even
*/
function countInversions(tiles){
  const arr = tiles.filter(v=>v!==0);
  let inv=0;
  for(let i=0;i<arr.length;i++)
    for(let j=i+1;j<arr.length;j++)
      if(arr[i]>arr[j]) inv++;
  return inv;
}
function isSolvable(tiles, n){
  const inv = countInversions(tiles);
  if(n%2===1) return inv%2===0;
  const emptyRow = Math.floor(tiles.indexOf(0)/n);
  const fromBottom = n - emptyRow;
  return (inv+fromBottom)%2===0;
}

/* ── Shuffle by making N random valid moves from solved state ──
   This GUARANTEES solvability — we never generate an unsolvable puzzle.
   Fix #12: Retry if result is too close to solved state.
*/
function shufflePuzzle(n, moves){
  const goal = goalState(n);
  for(let attempt=0; attempt<10; attempt++){
    const tiles = [...goal];
    let empty = n*n-1;
    let lastMove = -1;
    for(let i=0;i<moves;i++){
      const neighbors = getMovable(empty, n).filter(p=>p!==lastMove);
      const pick = neighbors[rnd(neighbors.length)];
      tiles[empty] = tiles[pick];
      tiles[pick] = 0;
      lastMove = empty;
      empty = pick;
    }
    // Check: at least 60% of tiles should be out of place
    const correctCount = tiles.filter((v,i)=>v!==0 && v===goal[i]).length;
    const totalTiles = n*n-1;
    if(correctCount <= totalTiles * 0.4) return { tiles, empty };
  }
  // Fallback: return last attempt regardless
  const tiles = [...goal];
  let empty = n*n-1, lastMove=-1;
  for(let i=0;i<moves*2;i++){
    const neighbors = getMovable(empty, n).filter(p=>p!==lastMove);
    const pick = neighbors[rnd(neighbors.length)];
    tiles[empty] = tiles[pick]; tiles[pick] = 0;
    lastMove = empty; empty = pick;
  }
  return { tiles, empty };
}

/* ── Get positions that can move into empty ── */
function getMovable(emptyIdx, n){
  const r = Math.floor(emptyIdx/n), c = emptyIdx%n;
  const moves=[];
  if(r>0) moves.push((r-1)*n+c);
  if(r<n-1) moves.push((r+1)*n+c);
  if(c>0) moves.push(r*n+c-1);
  if(c<n-1) moves.push(r*n+c+1);
  return moves;
}

/* ── Move direction (for animation offset) ── */
function moveDir(fromIdx, toIdx, n){
  const dr = Math.floor(toIdx/n) - Math.floor(fromIdx/n);
  const dc = (toIdx%n) - (fromIdx%n);
  return {dr,dc};
}

/* ── Build / render grid DOM ── */
function buildSlideGrid(){
  const n = SL.gridSize;
  const wrap = document.getElementById('slide-grid-wrap');
  const body = document.querySelector('.slide-body');
  const bodyR = body.getBoundingClientRect();

  // Size: available height minus info+preview+controls+gaps ~200px
  const avH = Math.max(160, bodyR.height - 220);
  const avW = Math.min(bodyR.width - 24, avH, 500); // Fix #8: was 360
  const gap = 6;
  const tileSz = Math.max(44, Math.floor((avW - 20 - gap*(n-1)) / n));
  SL.tileSizePx = tileSz;

  const gridEl = document.getElementById('slide-grid');
  gridEl.className = `slide-grid slide-g${n}`;
  gridEl.style.gridTemplateColumns = `repeat(${n},${tileSz}px)`;
  gridEl.style.gridTemplateRows    = `repeat(${n},${tileSz}px)`;
  gridEl.style.gap = gap+'px';
  gridEl.innerHTML = '';

  const wrapSz = n*tileSz + (n-1)*gap + 20;
  wrap.style.width = wrap.style.height = wrapSz+'px';

  SL._tileEls = [];
  for(let i=0;i<n*n;i++){
    const el = document.createElement('div');
    el.className = 'slide-tile';
    el.style.width  = tileSz+'px';
    el.style.height = tileSz+'px';
    el.dataset.idx = i;
    el.addEventListener('click', ()=>onSlideTileTap(i));
    SL._tileEls.push(el);
    gridEl.appendChild(el);
  }

  // Build preview
  buildSlidePreview();
  renderSlide();
}

function buildSlidePreview(){
  const n = SL.gridSize;
  const preview = document.getElementById('slide-preview');
  const previewRow = document.getElementById('slide-preview-row');
  const tSz = Math.max(16, Math.floor(SL.tileSizePx * 0.36));
  const gap = 2;

  preview.className = `slide-preview-grid`;
  preview.style.gridTemplateColumns = `repeat(${n},${tSz}px)`;
  preview.style.gap = gap+'px';
  preview.innerHTML = '';

  const goal = goalState(n);
  goal.forEach((v,i)=>{
    const el = document.createElement('div');
    el.className = 'slide-preview-cell' + (v===0?' empty':'');
    el.style.width = tSz+'px'; el.style.height = tSz+'px';
    if(v>0){
      el.style.background = (SL._tileColors && SL._tileColors[v]) || SLIDE_COLORS[v % SLIDE_COLORS.length] || '#888';
      el.textContent = v;
    } else {
      el.style.background = 'var(--soft)';
    }
    preview.appendChild(el);
  });

  // Hide preview for easy levels (too obvious)
  previewRow.style.display = SL.levelIdx <= 0 ? 'none' : 'flex';
}

/* ── Render current state ── */
function renderSlide(animFromIdx, animToIdx){
  const n = SL.gridSize;
  const goal = goalState(n);

  SL.tiles.forEach((val, idx) => {
    const el = SL._tileEls[idx];
    if(!el) return;
    el.className = 'slide-tile';
    el.style.width  = SL.tileSizePx+'px';
    el.style.height = SL.tileSizePx+'px';

    if(val === 0){
      el.classList.add('empty');
      el.textContent = '';
      el.style.background = '';
      el.style.fontSize   = '';
      return;
    }

    const color = (SL._tileColors && SL._tileColors[val]) || SLIDE_COLORS[val % SLIDE_COLORS.length] || '#888';
    el.style.background = color;
    el.style.fontSize   = Math.max(16, SL.tileSizePx * 0.42) + 'px';
    el.textContent = val;

    // Highlight movable tiles
    const movable = getMovable(SL.emptyPos, n);
    if(movable.includes(idx)) el.classList.add('movable');

    // Correct-position glow
    if(val === goal[idx]) el.classList.add('correct');

    // Slide animation
    if(idx === animFromIdx){
      const {dr,dc} = moveDir(animToIdx, animFromIdx, n);
      const offX = dc * SL.tileSizePx, offY = dr * SL.tileSizePx;
      el.style.transform = `translate(${offX}px,${offY}px)`;
      el.classList.add('sliding');
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
          el.style.transform = 'translate(0,0)';
        });
      });
    } else {
      el.style.transform = '';
    }
  });
}

/* ── Tap handler ── */
function onSlideTileTap(idx){
  if(SL.solved || SL.animating) return;
  const movable = getMovable(SL.emptyPos, SL.gridSize);
  if(!movable.includes(idx)) return;  // not adjacent to empty

  sfxClick();
  SL.animating = true;
  const fromIdx = idx;
  const toIdx   = SL.emptyPos;

  // Swap tile with empty
  SL.tiles[toIdx] = SL.tiles[fromIdx];
  SL.tiles[fromIdx] = 0;
  SL.emptyPos = fromIdx;
  SL.moves++;
  document.getElementById('slide-moves').textContent = SL.moves;

  renderSlide(toIdx, fromIdx); // animate the tile that moved (now at toIdx)

  // Clear animation lock after transition
  setTimeout(()=>{
    SL.animating = false;
    renderSlide(); // re-render without anim to fix movable highlights
    // Fix #9: Check if the moved tile is now in its correct position
    const goal = goalState(SL.gridSize);
    if(SL.tiles[toIdx] === goal[toIdx]){
      sfxOk();
      if(typeof mascotReact==='function') mascotReact('happy');
    }
    if(checkSlideWin()) showSlideWin();
  }, 200);
}

/* ── Swipe support on grid ── */
(function(){
  let _sx=0,_sy=0;
  document.getElementById('slide-grid-wrap')?.addEventListener('touchstart',e=>{
    _sx=e.touches[0].clientX; _sy=e.touches[0].clientY;
  },{passive:true});
  document.getElementById('slide-grid-wrap')?.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-_sx, dy=e.changedTouches[0].clientY-_sy;
    if(Math.max(Math.abs(dx),Math.abs(dy))<20) return;
    // Find which tile should move: the one in the opposite direction of swipe
    // relative to the empty cell
    const n=SL.gridSize;
    const er=Math.floor(SL.emptyPos/n), ec=SL.emptyPos%n;
    let tr,tc;
    if(Math.abs(dx)>Math.abs(dy)){
      // horizontal swipe
      tc=ec+(dx>0?-1:1); tr=er;
    } else {
      tr=er+(dy>0?-1:1); tc=ec;
    }
    if(tr<0||tr>=n||tc<0||tc>=n) return;
    onSlideTileTap(tr*n+tc);
  },{passive:true});
})();

/* ── Keyboard support ── */
document.addEventListener('keydown',e=>{
  if(!document.getElementById('s-slide').classList.contains('active')) return;
  const n=SL.gridSize;
  const er=Math.floor(SL.emptyPos/n), ec=SL.emptyPos%n;
  // Arrow key moves the tile INTO the empty space
  // ArrowUp = tile above empty moves down into empty
  const map={'ArrowUp':[er-1,ec],'ArrowDown':[er+1,ec],
             'ArrowLeft':[er,ec-1],'ArrowRight':[er,ec+1]};
  const dir=map[e.key]; if(!dir) return;
  e.preventDefault();
  const [tr,tc]=dir;
  if(tr<0||tr>=n||tc<0||tc>=n) return;
  onSlideTileTap(tr*n+tc);
});

/* ── Win check ── */
function checkSlideWin(){
  const goal = goalState(SL.gridSize);
  return SL.tiles.every((v,i)=>v===goal[i]);
}

/* ── Hint: suggest the most useful tile to move ── */
function showSlideHint(){
  if(SL.solved) return;
  sfxHint();
  SL.hintShown=true;
  const n=SL.gridSize;
  const goal=goalState(n);
  const movable=getMovable(SL.emptyPos,n);

  // For each movable tile, check if moving it puts ANY tile into correct position
  let bestIdx = -1, bestScore = -1;
  movable.forEach(idx=>{
    // Simulate the move
    const testTiles=[...SL.tiles];
    testTiles[SL.emptyPos]=testTiles[idx]; testTiles[idx]=0;
    // Count how many tiles are in correct position after this move
    let score=0;
    testTiles.forEach((v,i)=>{ if(v!==0 && v===goal[i]) score++; });
    if(score>bestScore){ bestScore=score; bestIdx=idx; }
  });

  // Highlight only the best tile to move
  if(bestIdx>=0){
    const el=SL._tileEls[bestIdx];
    if(el){ el.classList.add('hint-glow'); setTimeout(()=>el.classList.remove('hint-glow'),2500); }
  } else {
    // Fallback: highlight all movable
    movable.forEach(idx=>{
      const el=SL._tileEls[idx];
      if(el){ el.classList.add('hint-glow'); setTimeout(()=>el.classList.remove('hint-glow'),2500); }
    });
  }
}

/* ── Win screen ── */
function showSlideWin(){
  // Base implementation — monkey-patched by themes.js
  SL.solved=true;
  sfxWin();
  if(typeof mascotReact==='function') mascotReact('happy');
  SL._tileEls.forEach((el,i)=>{
    setTimeout(()=>{ el.classList.add('win-shine'); },i*40);
  });
  spawnConfetti();

  const goal=goalState(SL.gridSize);
  const optMoves=SL._worldRef?.slide?.shuffleMoves || SLIDE_LEVELS[SL.levelIdx]?.shuffleMoves || 30;
  const ratio=SL.moves/optMoves;
  const earned=ratio<=1.2?3:ratio<=2?2:1;
  // Stars and history handled by monkey-patch in themes.js
  document.getElementById('slide-stars').textContent=P.stars;
  document.getElementById('slide-win-title').textContent=
    ['Risolto!','Fantastico!','Bravissimo!','Perfetto!'][rnd(4)];
  document.getElementById('slide-win-moves').textContent=`${SL.moves} mosse`;
  document.getElementById('slide-win-stars').textContent=`⭐ +${earned} stelle!`;

  const btn=document.getElementById('slide-win-next');
  btn.textContent='Nuova sfida! 🔀';
  btn.onclick=()=>{ closeSlideWin(); newSlide(); };

  setTimeout(()=>document.getElementById('slide-win').classList.add('show'),400);
}
function closeSlideWin(){ document.getElementById('slide-win').classList.remove('show'); }

/* ── Load level ── */
function loadSlideLevel(idx){
  const level=SLIDE_LEVELS[idx];
  SL.levelIdx=idx;
  SL.gridSize=level.gridSize;
  SL.moves=0;
  SL.solved=false;
  SL.animating=false;
  SL.hintShown=false;

  // Compute stable tile colors from user palette — deterministic, never changes
  const n = level.gridSize;
  const totalTiles = n*n - 1;
  // Use user's palette colors as the base, supplemented by SYMS.colors[9] for variety
  const userPal = (typeof PALS!=='undefined' && typeof P!=='undefined' && PALS[P.palette]) ? PALS[P.palette].colors : [];
  const gamePal = (typeof SYMS!=='undefined' && SYMS.colors[9]) || [];
  // Merge: user palette first (4 colors), then game palette for remaining
  const merged = [...userPal];
  gamePal.forEach(c => { if(!merged.includes(c)) merged.push(c); });
  if(merged.length===0) merged.push(...SLIDE_COLORS.slice(1));
  SL._tileColors = [null]; // index 0 = empty
  for(let i=1; i<=totalTiles; i++){
    SL._tileColors[i] = merged[(i-1) % merged.length];
  }

  const {tiles,empty}=shufflePuzzle(level.gridSize,level.shuffleMoves);
  SL.tiles=[...tiles];
  SL.emptyPos=empty;
  SL.initialTiles=[...tiles];
  SL.initialEmpty=empty;

  document.getElementById('slide-pill-icon').textContent=level.icon;
  document.getElementById('slide-pill-nm').textContent=level.name;
  document.getElementById('slide-pill-pg').textContent=level.desc;
  document.getElementById('slide-moves').textContent='0';
  document.getElementById('slide-stars').textContent=P.stars;
  // Fix #6: Show target moves for 3 stars
  const targetEl = document.getElementById('slide-bottom-counter');
  if(targetEl){
    const target3 = Math.floor(level.shuffleMoves * 1.2);
    targetEl.textContent = `🎯 ≤ ${target3} mosse per 3⭐`;
    targetEl.style.display = '';
  }
  closeSlideWin();

  // Rebuild grid DOM (handles size change 3↔4)
  const gridEl=document.getElementById('slide-grid');
  gridEl.className=`slide-grid slide-g${n}`;

  buildSlideGrid();
}

/* ── Reset to initial scramble ── */
function resetSlide(){
  sfxClick();
  SL.tiles=[...SL.initialTiles];
  SL.emptyPos=SL.initialEmpty;
  SL.moves=0; SL.solved=false; SL.animating=false;
  document.getElementById('slide-moves').textContent='0';
  closeSlideWin();
  renderSlide();
}

/* ── New scramble same level ── */
function newSlide(){
  sfxClick();
  loadSlideLevel(SL.levelIdx);
}

/* ── Open from map ── */
function openSlidePuzzle(){
  sfxClick(); show('s-slide');
  setTimeout(()=>loadSlideLevel(SL.levelIdx||0),80);
}

/* ── Wire ── */
document.getElementById('btn-slide-map').onclick    = openSlidePuzzle;
document.getElementById('btn-slide-back').onclick   = ()=>{ gameBackToMap('slide'); };
document.getElementById('slide-reset-btn').onclick  = resetSlide;
document.getElementById('slide-new-btn').onclick    = newSlide;
document.getElementById('slide-hint-btn').onclick   = showSlideHint;
const _slideSoundBtn = document.getElementById('slide-sound-btn');
if (_slideSoundBtn) _slideSoundBtn.onclick = toggleSound;

