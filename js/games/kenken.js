/* ══════════════════════════════════════════
   KENKEN ENGINE
══════════════════════════════════════════ */

/* ── Cage colours (per cage index) ── */
const CAGE_COLORS = [
  '#FF5252','#2196F3','#4CAF50','#FF9800','#9C27B0',
  '#00BCD4','#E91E63','#795548','#607D8B','#CDDC39',
  '#FF7043','#26C6DA','#AB47BC','#66BB6A','#FFA726',
  '#42A5F5','#EC407A','#26A69A','#D4E157','#8D6E63',
];
function cageColor(idx){ return CAGE_COLORS[idx % CAGE_COLORS.length]; }

/* ── Generate a pure latin square (no box constraint) ── */
function genLatinSquare(sz) {
  const g = Array.from({length:sz}, () => Array(sz).fill(0));
  function ok(r,c,n) {
    for (let i=0;i<sz;i++) if (g[r][i]===n||g[i][c]===n) return false;
    return true;
  }
  function fill() {
    for (let r=0;r<sz;r++) for (let c=0;c<sz;c++) {
      if (g[r][c]) continue;
      const nums = shuffle([...Array(sz)].map((_,i)=>i+1));
      for (const n of nums) {
        if (ok(r,c,n)) { g[r][c]=n; if (fill()) return true; g[r][c]=0; }
      }
      return false;
    }
    return true;
  }
  fill();
  return g;
}

/* ── Generate KenKen puzzle ──
   Returns { solution, cages, board, given }
   cage: { id, cells:[pos,...], op:'+'/'-'/'×'/'÷'/'=', target:number }
   board: sz×sz array, 0=empty
   given: Set of positions that are pre-filled (single-cell cages)
*/
function generateKenKen(sz, diff) {
  // 1. Generate valid latin square (NO box constraint — pure KenKen)
  const solution = genLatinSquare(sz);

  // 2. Partition cells into cages
  const cages = partitionCages(solution, sz, diff);

  // 3. Compute cage label (op + target)
  cages.forEach(cage => computeCageLabel(cage, solution, sz, diff));

  // 4. Build board (empty except single-cell cages which are "given")
  const board = Array.from({length:sz}, () => Array(sz).fill(0));
  const given = new Set();
  cages.forEach(cage => {
    if(cage.cells.length === 1) {
      const r = Math.floor(cage.cells[0]/sz), c = cage.cells[0]%sz;
      board[r][c] = solution[r][c];
      given.add(cage.cells[0]);
    }
  });

  return { solution, cages, board, given };
}

function partitionCages(solution, sz, diff) {
  const total = sz * sz;
  const assigned = new Array(total).fill(false);
  const cages = [];

  // Max cage sizes by difficulty
  const maxSize = { easy: 2, easyminus: 2, medium: 3, hard: 4 }[diff] || 3;

  // Shuffle cell order for random cage shapes
  const order = shuffle([...Array(total)].map((_,i) => i));

  for (const start of order) {
    if (assigned[start]) continue;
    // Grow cage by BFS, randomly
    const cage = { id: cages.length, cells: [start] };
    assigned[start] = true;
    // Try to grow up to maxSize
    for (let attempt = 0; attempt < maxSize - 1; attempt++) {
      const neighbors = getUnassignedNeighbors(cage.cells, assigned, sz);
      if (neighbors.length === 0) break;
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      cage.cells.push(next);
      assigned[next] = true;
    }
    cages.push(cage);
  }
  return cages;
}

function getUnassignedNeighbors(cells, assigned, sz) {
  const set = new Set(cells);
  const neighbors = [];
  for (const pos of cells) {
    const r = Math.floor(pos/sz), c = pos%sz;
    for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = r+dr, nc = c+dc;
      if (nr<0||nr>=sz||nc<0||nc>=sz) continue;
      const npos = nr*sz+nc;
      if (!set.has(npos) && !assigned[npos]) neighbors.push(npos);
    }
  }
  return [...new Set(neighbors)];
}

function computeCageLabel(cage, solution, sz, diff) {
  const vals = cage.cells.map(pos => solution[Math.floor(pos/sz)][pos%sz]);

  if (cage.cells.length === 1) {
    cage.op = '='; cage.target = vals[0]; return;
  }

  // Allowed ops by difficulty
  const allowedOps = {
    easy:      ['+'],
    easyminus: ['+', '-'],
    medium:    ['+', '-', '×'],
    hard:      ['+', '-', '×', '÷'],
  }[diff] || ['+'];

  // For 2-cell cages, try ops in preference order
  if (cage.cells.length === 2) {
    const [a, b] = vals;
    const ops2 = allowedOps.filter(op => {
      if (op === '-') return true; // always valid
      if (op === '÷') return (a % b === 0 || b % a === 0);
      if (op === '×') return true;
      if (op === '+') return true;
      return false;
    });
    // prefer - and ÷ for variety on hard, + for easy
    const op = ops2[Math.floor(Math.random() * ops2.length)];
    cage.op = op;
    if (op === '+') cage.target = a + b;
    else if (op === '-') cage.target = Math.abs(a - b);
    else if (op === '×') cage.target = a * b;
    else if (op === '÷') cage.target = a > b ? a/b : b/a;
    return;
  }

  // For 3+ cell cages: only + and × (F12: ÷ and - only for 2-cell)
  const multiOps = allowedOps.filter(op => op === '+' || op === '×');
  const useMultiply = multiOps.includes('×') && Math.random() > 0.5;
  if (useMultiply) {
    cage.op = '×';
    cage.target = vals.reduce((p, v) => p * v, 1);
  } else {
    cage.op = '+';
    cage.target = vals.reduce((s, v) => s + v, 0);
  }
}

/* ── KenKen cell rendering ── */
function renderKenKenGrid(cages, sz) {
  const grid = document.getElementById('sudoku-grid');
  grid.innerHTML = '';

  // Build cage-membership maps
  const cellToCage = new Map(); // pos → cage
  cages.forEach(cage => cage.cells.forEach(pos => cellToCage.set(pos, cage)));

  // Build per-cage border info: which sides of each cell are cage-internal?
  // A border is DRAWN on a side if the neighbour in that direction is NOT in the same cage
  for (let r = 0; r < sz; r++) {
    for (let c = 0; c < sz; c++) {
      const pos = r*sz+c;
      const cage = cellToCage.get(pos);
      const val = G.board[r][c];
      const isGiven = G.given.has(pos);
      const isSel = G.selCell === pos;

      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.pos = pos;
      cell.style.gridColumn = c+1;
      cell.style.gridRow = r+1;
      cell.style.position = 'relative';

      // Cage background tint
      const cc = cageColor(cage.id);
      if (isGiven) {
        cell.style.background = cc + 'ee';  // given: very vivid
      } else if (val) {
        cell.style.background = cc + 'aa';  // player-filled: medium vivid
      } else {
        cell.style.background = cc + '28';  // empty: very light tint
      }

      // Cage borders
      const sides = {
        top:    r===0    || cellToCage.get((r-1)*sz+c)!==cage,
        bottom: r===sz-1 || cellToCage.get((r+1)*sz+c)!==cage,
        left:   c===0    || cellToCage.get(r*sz+c-1)!==cage,
        right:  c===sz-1 || cellToCage.get(r*sz+c+1)!==cage,
      };
      if (sides.top)    cell.classList.add('cage-top');
      if (sides.bottom) cell.classList.add('cage-bottom');
      if (sides.left)   cell.classList.add('cage-left');
      if (sides.right)  cell.classList.add('cage-right');

      // Cell state classes
      if (val) {
        cell.classList.add(isGiven ? 'kk-given' : 'filled');
        const num = document.createElement('div');
        num.className = 'kk-cell-num';
        num.textContent = val;
        cell.appendChild(num);
      } else {
        cell.classList.add('empty');
        if (isSel) cell.classList.add('sel');
      }

      // Cage label — on first cell of each cage only
      if (pos === cage.cells[0]) {
        const lbl = document.createElement('div');
        lbl.className = 'cage-label';
        if (cage.op === '=') {
          lbl.textContent = ''; // single cell — no label needed, value is shown
        } else {
          lbl.textContent = cage.target + cage.op;
        }
        cell.appendChild(lbl);
      }

      // Selected state styling
      if (isSel && !isGiven) {
        cell.style.background = 'color-mix(in srgb,'+cc+' 40%,white)';
        cell.style.boxShadow = '0 0 0 3px '+cc+', 0 0 0 6px '+cc+'55';
        cell.style.transform = 'scale(1.08)';
        cell.style.zIndex = '3';
      }

      if (!isGiven) cell.addEventListener('click', () => handleCell(pos));
      grid.appendChild(cell);
    }
  }
}

/* ── KenKen number palette (always digits, regardless of symTheme) ── */
function renderKenKenPalette(sz) {
  const cont = document.getElementById('sym-palette');
  cont.innerHTML = '';
  cont.className = 'kk-palette';
  for (let n = 1; n <= sz; n++) {
    const btn = document.createElement('button');
    btn.className = 'kk-pick' + (n-1 === G.selSym ? ' active' : '');
    btn.style.background = cageColor(n-1);
    btn.textContent = n;
    btn.onclick = () => {
      G.selSym = n-1;
      sfxClick();
      renderKenKenPalette(sz);
      if (G.selCell !== null) placeKKSymbol(G.selCell, n);
    };
    cont.appendChild(btn);
  }
}

/* ── Place number in KenKen (value = 1-based) ── */
function placeKKSymbol(pos, val) {
  const sz = G.size;
  const r = Math.floor(pos/sz), c = pos%sz;
  if (G.given.has(pos)) return;
  const correct = G.solution[r][c] === val;
  G.board[r][c] = val;
  G.selCell = null;
  renderKenKenGrid(G.cages, sz);
  const cel = document.querySelector(`[data-pos="${pos}"]`);
  if (!correct) {
    G.errors++;
    sfxErr();
    if (typeof mascotReact==='function') mascotReact('sad');
    // Highlight conflicting cells in same row/column that have the same value
    for (let i = 0; i < sz; i++) {
      if (i !== c && G.board[r][i] === val) {
        const conf = document.querySelector(`[data-pos="${r*sz+i}"]`);
        if (conf) { conf.classList.add('kk-conflict'); setTimeout(() => conf.classList.remove('kk-conflict'), 900); }
      }
      if (i !== r && G.board[i][c] === val) {
        const conf = document.querySelector(`[data-pos="${i*sz+c}"]`);
        if (conf) { conf.classList.add('kk-conflict'); setTimeout(() => conf.classList.remove('kk-conflict'), 900); }
      }
    }
    if (cel) { cel.classList.add('shake'); setTimeout(() => { G.board[r][c]=0; renderKenKenGrid(G.cages,sz); }, 430); }
  } else {
    sfxOk();
    if (typeof mascotReact==='function') mascotReact('happy');
    if (cel) { cel.classList.add('pop'); setTimeout(() => cel.classList.remove('pop'), 380); }
    spawnFloatStar(cel);
    checkKenKenWin();
  }
}

function checkKenKenWin() {
  const sz = G.size;
  for (let r=0; r<sz; r++) for (let c=0; c<sz; c++)
    if (!G.board[r][c] || G.board[r][c] !== G.solution[r][c]) return;
  setTimeout(() => { sfxWin(); showCelebration(); }, 300);
}

/* ── Hint for KenKen: reveal one correct number in most constrained cage ── */
function useKKHint() {
  if (G.hintsLeft <= 0) return;
  const sz = G.size;
  // Find the cage with fewest empty cells (most constrained)
  let bestCage = null, bestEmpty = Infinity;
  G.cages.forEach(cage => {
    const empty = cage.cells.filter(pos => !G.board[Math.floor(pos/sz)][pos%sz]).length;
    if (empty > 0 && empty < bestEmpty) { bestEmpty = empty; bestCage = cage; }
  });
  if (!bestCage) return;

  // Find first empty cell in that cage and reveal its solution
  const targetPos = bestCage.cells.find(pos => !G.board[Math.floor(pos/sz)][pos%sz]);
  if (targetPos === undefined) return;

  G.hintsLeft--;
  updateHintBtn();
  sfxHint();

  const r = Math.floor(targetPos/sz), c = targetPos%sz;
  G.board[r][c] = G.solution[r][c];
  G.given.add(targetPos); // mark as given so it can't be erased

  // Highlight the revealed cell and its cage
  renderKenKenGrid(G.cages, sz);
  bestCage.cells.forEach(pos => {
    const cel = document.querySelector(`[data-pos="${pos}"]`);
    if (cel) { cel.classList.add('hint-glow'); setTimeout(() => cel.classList.remove('hint-glow'), 3500); }
  });
  const revealedCel = document.querySelector(`[data-pos="${targetPos}"]`);
  if (revealedCel) { revealedCel.classList.add('pop'); setTimeout(() => revealedCel.classList.remove('pop'), 380); }
  spawnFloatStar(revealedCel);

  checkKenKenWin();
}

/* ── KenKen erase ── */
function eraseKKCell() {
  if (G.selCell === null) return;
  const r = Math.floor(G.selCell/G.size), c = G.selCell%G.size;
  if (!G.given.has(G.selCell)) {
    G.board[r][c] = 0;
    sfxClick();
    renderKenKenGrid(G.cages, G.size);
  }
}

/* ── Start KenKen game ── */
function startKenKen(sz, diff, continueIdx) {
  // F14: ensure intro overlay is always dismissed
  const intro = document.getElementById('kk-intro');
  if (intro) { intro.classList.remove('show'); intro.onclick = null; }

  const puzzle = generateKenKen(sz, diff);
  // F02/F16: preserve real world id if launched from world map
  const realWorld = G._currentWorld;
  if (realWorld && realWorld.kenken) {
    G.world = realWorld; // keep the WORLDS entry
  } else {
    G.world = { id:'kk_'+sz+'_'+diff, name:'KenKen '+sz+'×'+sz, icon:'🔢', size:sz, diff, total:1 };
  }
  G._currentGameKey = 'kenken'; // ensure history tracks as kenken
  G.size = sz;
  // If continueIdx is passed, use it (next puzzle in world sequence)
  // Otherwise start from 0
  G.pidx = (typeof continueIdx === 'number') ? continueIdx : 0;
  G.hintsLeft = 3;
  G.errors = 0;
  G.selCell = null;
  G.selSym = 0;
  G.solution = puzzle.solution;
  G.board = puzzle.board;
  G.given = puzzle.given;
  G.cages = puzzle.cages;
  G.isKenKen = true;
  G.startTime = Date.now();

  const gcls = {4:'g4',6:'g6',9:'g9'}[sz]||'g4';
  document.getElementById('sudoku-grid').className = 'sudoku-grid '+gcls;
  document.getElementById('hdr-av').textContent = P.avatar;
  document.getElementById('hdr-nm').textContent = P.name;
  document.getElementById('hdr-sc').textContent = P.stars;
  document.getElementById('hdr-stk').textContent = P.streak||0;
  document.getElementById('pill-icon').textContent = '🔢';
  document.getElementById('pill-nm').textContent = 'KenKen '+sz+'×'+sz;
  const worldTotal = G.world.total || 1;
  const DIFF_LABELS = {easy:'Solo +',easyminus:'+ e −',medium:'+, − e ×',hard:'Tutte (+−×÷)'};
  if (worldTotal > 1) {
    document.getElementById('pill-pg').textContent = 'Puzzle '+(G.pidx+1)+' / '+worldTotal+' · '+(DIFF_LABELS[diff]||'');
  } else {
    document.getElementById('pill-pg').textContent = DIFF_LABELS[diff] || '';
  }
  document.getElementById('adapt-badge').style.display = 'none';

  // Override controls
  document.getElementById('btn-gb').onclick = () => { 
    sfxClick(); G.isKenKen=false; G.cages=null;
    if(typeof gameBackToMap==='function') gameBackToMap('kenken');
    else { show('s-map'); updateMap(); }
  };
  document.getElementById('erase-btn').onclick = eraseKKCell;
  document.getElementById('hint-btn').onclick = useKKHint;
  document.getElementById('sound-btn').onclick = toggleSound;

  show('s-game');
  updateHintBtn();
  renderKenKenGrid(puzzle.cages, sz);
  renderKenKenPalette(sz);
  updateThemeSwitchLabel();
}

/* ── KenKen intro screen ── */
function openKKIntro() {
  sfxClick();
  // Build example grid (3×3 fixed, always same for explanation)
  const eg = document.getElementById('kk-example-grid');
  eg.innerHTML = '';
  // Hardcoded 3x3 example: solution [[1,2,3],[3,1,2],[2,3,1]]
  // Cage 0: [0,1] target=3, op=+
  // Cage 1: [2] target=3, op==
  // Cage 2: [3,6] target=3, op=+  (no wait, let's use a clear 3x3)
  // Simple: cage A=[0,3] 4+ / cage B=[1,4] 3+ / cage C=[2,5] 5+ / cage D=[6,7,8] 6+
  const sol3=[[1,2,3],[3,1,2],[2,3,1]];
  // cages: [0,3]=1+3=4+, [1,4]=2+1=3+, [2,5]=3+2=5+, [6,7]=2+3=5+, [8]=1
  const ex=[
    {cells:[0,3],op:'+',target:4,col:'#FF5252'},
    {cells:[1,4],op:'+',target:3,col:'#2196F3'},
    {cells:[2,5],op:'+',target:5,col:'#4CAF50'},
    {cells:[6,7],op:'+',target:5,col:'#FF9800'},
    {cells:[8],  op:'=',target:1,col:'#9C27B0'},
  ];
  const cellCage=new Map();
  ex.forEach(c=>c.cells.forEach(p=>cellCage.set(p,c)));
  for(let r=0;r<3;r++) for(let c=0;c<3;c++){
    const pos=r*3+c;
    const cage=cellCage.get(pos);
    const div=document.createElement('div');
    div.className='kk-ex-cell';
    div.style.background=cage.col+'44';
    // borders
    if(r===0||cellCage.get((r-1)*3+c)!==cage) div.classList.add('cage-top');
    if(r===2||cellCage.get((r+1)*3+c)!==cage) div.classList.add('cage-bottom');
    if(c===0||cellCage.get(r*3+c-1)!==cage) div.classList.add('cage-left');
    if(c===2||cellCage.get(r*3+c+1)!==cage) div.classList.add('cage-right');
    div.textContent=sol3[r][c];
    if(pos===cage.cells[0]&&cage.op!=='='){
      const lbl=document.createElement('div');lbl.className='kk-ex-lbl';
      lbl.textContent=cage.target+cage.op;div.appendChild(lbl);
    }
    eg.appendChild(div);
  }

  // Difficulty selection
  let kkDiff='easy', kkSz=4;
  document.querySelectorAll('.kk-diff-btn[data-diff]').forEach(b=>{
    b.onclick=()=>{
      sfxClick(); kkDiff=b.dataset.diff;
      document.querySelectorAll('.kk-diff-btn[data-diff]').forEach(x=>x.classList.remove('sel'));
      b.classList.add('sel');
    };
  });
  document.querySelectorAll('.kk-diff-btn[data-size]').forEach(b=>{
    b.onclick=()=>{
      sfxClick(); kkSz=parseInt(b.dataset.size);
      document.querySelectorAll('.kk-diff-btn[data-size]').forEach(x=>x.classList.remove('sel'));
      b.classList.add('sel');
    };
  });
  document.getElementById('btn-kk-start').onclick=()=>startKenKen(kkSz, kkDiff);

  document.getElementById('kk-intro').classList.add('show');
  document.getElementById('kk-intro').onclick=function(e){if(e.target===this)this.classList.remove('show');};
}

document.getElementById('btn-kk-map').onclick = openKKIntro;