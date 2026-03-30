/* ══════════════════════════════════════════
   NONOGRAM ENGINE
══════════════════════════════════════════ */

/* ── Puzzle library ──
   Each puzzle: { id, name, icon, size, phase, solution }
   solution: 2D array of 0/1
   clues computed automatically at load time
*/
const NONO_PUZZLES = [
  // ── 5×5 Fase 0 ──
  { id:'n_heart',   name:'Cuore',     icon:'❤️',  phase:0, size:5,
    solution:[[0,1,0,1,0],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]] },
  { id:'n_house',   name:'Casa',      icon:'🏠',  phase:0, size:5,
    solution:[[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[1,1,0,1,1],[1,1,0,1,1]] },
  { id:'n_star',    name:'Stella',    icon:'⭐',  phase:0, size:5,
    solution:[[0,0,1,0,0],[1,1,1,1,1],[0,1,1,1,0],[1,0,1,0,1],[1,0,0,0,1]] },
  { id:'n_fish',    name:'Pesce',     icon:'🐟',  phase:0, size:5,
    solution:[[0,0,1,1,1],[0,1,1,1,1],[1,1,1,1,0],[0,1,1,1,1],[0,0,1,1,1]] },
  // ── 7×7 Fase 1 ──
  { id:'n_butterfly', name:'Farfalla', icon:'🦋', phase:1, size:7,
    solution:[
      [1,1,0,0,0,1,1],[1,1,1,0,1,1,1],[0,1,1,1,1,1,0],
      [0,0,1,1,1,0,0],[0,1,1,1,1,1,0],[1,1,1,0,1,1,1],[1,1,0,0,0,1,1]] },
  { id:'n_tree',    name:'Albero',    icon:'🌲', phase:1, size:7,
    solution:[
      [0,0,0,1,0,0,0],[0,0,1,1,1,0,0],[0,1,1,1,1,1,0],
      [1,1,1,1,1,1,1],[0,0,0,1,0,0,0],[0,0,0,1,0,0,0],[0,0,1,1,1,0,0]] },
  { id:'n_boat',    name:'Barca',     icon:'⛵', phase:1, size:7,
    solution:[
      [0,0,0,1,0,0,0],[0,0,1,1,0,0,0],[0,1,1,1,0,0,0],
      [1,1,1,1,1,1,1],[0,1,1,1,1,1,0],[0,0,1,1,1,0,0],[0,0,0,0,0,0,0]] },
  // ── 10×10 Fase 2 ──
  { id:'n_cat',     name:'Gatto',     icon:'🐱', phase:2, size:10,
    solution:[
      [0,1,0,0,0,0,0,0,1,0],[0,1,1,0,0,0,0,1,1,0],[0,1,1,1,1,1,1,1,1,0],
      [1,1,0,1,1,1,1,0,1,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],
      [0,1,1,0,1,1,0,1,1,0],[0,0,1,1,1,1,1,1,0,0],[0,0,0,1,1,1,1,0,0,0],
      [0,0,0,0,1,1,0,0,0,0]] },
  { id:'n_rocket',  name:'Razzo',     icon:'🚀', phase:2, size:10,
    solution:[
      [0,0,0,0,1,1,0,0,0,0],[0,0,0,1,1,1,1,0,0,0],[0,0,1,1,1,1,1,1,0,0],
      [0,0,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,0,0],[0,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,0],[1,1,0,0,1,1,0,0,1,1],[1,0,0,0,0,0,0,0,0,1],
      [0,0,0,0,0,0,0,0,0,0]] },
  // ── 10×10 Fase 3 ──
  { id:'n_sun',     name:'Sole',      icon:'☀️', phase:3, size:10,
    solution:[
      [0,0,1,0,0,0,0,1,0,0],[0,0,0,1,0,0,1,0,0,0],[1,0,0,1,1,1,1,0,0,1],
      [0,1,1,0,1,1,0,1,1,0],[0,0,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,0,0],
      [0,1,1,0,1,1,0,1,1,0],[1,0,0,1,1,1,1,0,0,1],[0,0,0,1,0,0,1,0,0,0],
      [0,0,1,0,0,0,0,1,0,0]] },
];

/* ── Clue computation ── */
function computeClues(solution) {
  const rows = solution.length, cols = solution[0].length;
  const rowClues = solution.map(row => {
    const b=[]; let c=0;
    for(const v of row){ if(v) c++; else if(c){b.push(c);c=0;} }
    if(c) b.push(c);
    return b.length ? b : [0];
  });
  const colClues = Array.from({length:cols},(_,ci)=>{
    const b=[]; let c=0;
    for(let r=0;r<rows;r++){ if(solution[r][ci]) c++; else if(c){b.push(c);c=0;} }
    if(c) b.push(c);
    return b.length ? b : [0];
  });
  return { rowClues, colClues };
}

/* ── Nonogram state ── */
const NO = {
  puzzleIdx: 0,
  size: 5,
  solution: null,
  board: null,      // 2D: 0=empty, 1=filled, 2=marked(✕)
  rowClues: null,
  colClues: null,
  errors: 0,
  mode: 'fill',     // 'fill' | 'mark'
  solved: false,
  dragFill: null,   // value being painted in drag
};

/* ── Build grid DOM ── */
function buildNonoGrid() {
  // Use NO state (already populated by loadNonoPuzzle) instead of NONO_PUZZLES
  // This handles both predefined AND procedural puzzles
  const sz = NO.size;
  const solution = NO.solution;
  const { rowClues, colClues } = computeClues(solution);
  NO.rowClues = rowClues; NO.colClues = colClues;

  // Compute clue area dimensions
  const maxRowClue = Math.max(...rowClues.map(c=>c.length));
  const maxColClue = Math.max(...colClues.map(c=>c.length));

  // Cell size: fit to screen
  const wrap = document.getElementById('nono-grid-wrap');
  const body = document.querySelector('.nono-body');
  const bodyR = body.getBoundingClientRect();
  // Available: body height minus info(44) + mode(46) + controls(48) + gaps(40)
  const avH = Math.max(160, bodyR.height - 180);
  const avW = Math.min(bodyR.width - 20, avH, 380);
  // Total grid = (maxRowClue + sz) cols × (maxColClue + sz) rows
  const cellSz = Math.max(18, Math.floor(avW / (maxRowClue + sz)));
  const clueCW = cellSz;   // clue column width = cell width
  const clueRH = cellSz;   // clue row height = cell height

  const outer = document.getElementById('nono-grid-outer');
  outer.innerHTML = '';

  // CSS grid: maxRowClue clue-cols + sz cell-cols
  //           maxColClue clue-rows + sz cell-rows
  const totalCols = maxRowClue + sz;
  const totalRows = maxColClue + sz;
  outer.style.display = 'grid';
  outer.style.gridTemplateColumns = `repeat(${maxRowClue},${clueCW}px) repeat(${sz},${cellSz}px)`;
  outer.style.gridTemplateRows    = `repeat(${maxColClue},${clueRH}px) repeat(${sz},${cellSz}px)`;
  outer.style.gap = '0';
  outer.style.padding = '8px';

  // Store refs for update
  NO._cellEls = {};    // `${r},${c}` → element
  NO._rowClueEls = []; // row index → element
  NO._colClueEls = []; // col index → element
  NO._cellSz = cellSz;
  NO._maxRowClue = maxRowClue;
  NO._maxColClue = maxColClue;

  // Build grid with explicit grid-column/row placement
  outer.innerHTML = '';

  function makeEl(tag, cls, col, row, w=1, h=1) {
    const el = document.createElement(tag||'div');
    el.className = cls;
    el.style.gridColumn = `${col} / span ${w}`;
    el.style.gridRow    = `${row} / span ${h}`;
    el.style.width  = (w * cellSz) + 'px';
    el.style.height = (h * clueRH) + 'px';
    return el;
  }

  // ── Column clues (top) ──
  for(let ci=0; ci<sz; ci++) {
    const clue = colClues[ci];
    const el = makeEl('div', 'nono-clue col', maxRowClue+ci+1, 1, 1, maxColClue);
    el.style.height = (maxColClue * clueRH)+'px';
    el.style.width  = cellSz+'px';
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'flex-end';
    el.style.paddingBottom = '3px';
    el.style.boxSizing = 'border-box';
    // Pad top with empty slots
    const pad = maxColClue - clue.length;
    for(let i=0;i<pad;i++){
      const s=document.createElement('span');s.className='nono-clue-num';s.textContent='';
      s.style.height=clueRH+'px';s.style.lineHeight=clueRH+'px';
      el.appendChild(s);
    }
    clue.forEach(n=>{
      const s=document.createElement('span');s.className='nono-clue-num';
      s.textContent=n===0?'':n;
      s.style.height=clueRH+'px';s.style.lineHeight=clueRH+'px';
      s.style.fontFamily="'Fredoka One',cursive";
      s.style.fontSize=Math.max(9,cellSz*0.42)+'px';
      el.appendChild(s);
    });
    NO._colClueEls[ci] = el;
    outer.appendChild(el);
  }

  // ── Row clues + cells ──
  for(let ri=0; ri<sz; ri++) {
    // Row clue
    const clue = rowClues[ri];
    const rClueEl = makeEl('div','nono-clue row', 1, maxColClue+ri+1, maxRowClue, 1);
    rClueEl.style.width  = (maxRowClue * clueCW)+'px';
    rClueEl.style.height = cellSz+'px';
    rClueEl.style.display='flex'; rClueEl.style.flexDirection='row';
    rClueEl.style.alignItems='center'; rClueEl.style.justifyContent='flex-end';
    rClueEl.style.paddingRight='4px'; rClueEl.style.boxSizing='border-box';
    rClueEl.style.gap='3px';
    // Pad left
    const pad = maxRowClue - clue.length;
    for(let i=0;i<pad;i++){
      const s=document.createElement('span');s.className='nono-clue-num';s.textContent='';
      s.style.minWidth=clueCW+'px';s.style.textAlign='center';
      rClueEl.appendChild(s);
    }
    clue.forEach(n=>{
      const s=document.createElement('span');s.className='nono-clue-num';
      s.textContent=n===0?'':n;
      s.style.minWidth=clueCW*0.8+'px';s.style.textAlign='center';
      s.style.fontFamily="'Fredoka One',cursive";
      s.style.fontSize=Math.max(9,cellSz*0.42)+'px';
      rClueEl.appendChild(s);
    });
    NO._rowClueEls[ri] = rClueEl;
    outer.appendChild(rClueEl);

    // Cells
    for(let ci=0; ci<sz; ci++) {
      const cell = makeEl('div','nono-cell empty', maxRowClue+ci+1, maxColClue+ri+1);
      cell.style.width  = cellSz+'px';
      cell.style.height = cellSz+'px';
      cell.dataset.r = ri; cell.dataset.c = ci;
      // Thick borders every 5
      if((ci+1)%5===0 && ci<sz-1) cell.classList.add('thick-right');
      if((ri+1)%5===0 && ri<sz-1) cell.classList.add('thick-bottom');

      // Direct per-cell listeners (no delegation — avoids stacking on rebuild)
      cell.addEventListener('pointerdown', function(e) {
        onNonoCellDown(e, cell);
      });
      cell.addEventListener('pointerenter', function(e) {
        onNonoCellEnter(e, cell);
      });

      NO._cellEls[`${ri},${ci}`] = cell;
      outer.appendChild(cell);
    }
  }

  // Resize wrap
  const gridW = (maxRowClue * clueCW + sz * cellSz) + 16;
  const gridH = (maxColClue * clueRH + sz * cellSz) + 16;
  wrap.style.width  = gridW + 'px';
  wrap.style.height = gridH + 'px';
}

/* ── Cell interaction ── */
let _nonoPointerDown = false;

function onNonoCellDown(e, cell) {
  e.preventDefault();
  _nonoPointerDown = true;
  const r = +cell.dataset.r;
  const c = +cell.dataset.c;
  tapNonoCell(r, c);
  NO.dragFill = NO.board[r][c];
  document.addEventListener('pointerup', ()=>{ _nonoPointerDown=false; NO.dragFill=null; }, {once:true});
}

function onNonoCellEnter(e, cell) {
  if(!_nonoPointerDown || NO.dragFill===null || NO.solved) return;
  const r = +cell.dataset.r;
  const c = +cell.dataset.c;
  if(NO.board[r][c] === NO.dragFill) return; // already this value

  // Fix 3: If drag-filling (value=1) a cell that should be empty → error
  if(NO.dragFill === 1 && NO.solution[r][c] === 0){
    NO.errors++;
    document.getElementById('nono-errors').textContent = NO.errors;
    sfxErr();
    if(typeof mascotReact==='function') mascotReact('sad');
    const cel = NO._cellEls[`${r},${c}`];
    if(cel){ cel.classList.add('filled','error-flash'); setTimeout(()=>{cel.classList.remove('filled','error-flash');},420); }
    return;
  }
  // Fix 4: Push undo before changing
  if(NO._undoStack) NO._undoStack.push({r,c,prev:NO.board[r][c]});

  NO.board[r][c] = NO.dragFill;
  updateNonoCell(r, c, true);
  if(NO.dragFill === 1 && typeof mascotReact==='function') mascotReact('happy');
}

function tapNonoCell(r, c) {
  if(NO.solved) return;
  sfxClick();
  const cur = NO.board[r][c];
  let next;
  if(NO.mode === 'fill') {
    next = cur === 1 ? 0 : 1;  // toggle fill
  } else {
    next = cur === 2 ? 0 : 2;  // toggle mark
  }
  // If trying to fill a cell that should be empty → error
  if(next === 1 && NO.solution[r][c] === 0){
    NO.errors++;
    document.getElementById('nono-errors').textContent = NO.errors;
    sfxErr();
    if(typeof mascotReact==='function') mascotReact('sad');
    const cel = NO._cellEls[`${r},${c}`];
    if(cel){ cel.classList.add('filled','error-flash'); setTimeout(()=>{cel.classList.remove('filled','error-flash');},420); }
    return;
  }
  // Fix 4: Push undo before changing
  if(NO._undoStack) NO._undoStack.push({r,c,prev:cur});
  NO.board[r][c] = next;
  NO.dragFill = next;
  updateNonoCell(r, c, true);
  if(next === 1 && typeof mascotReact==='function') mascotReact('happy');
  checkNonoWin();
}

function updateNonoCell(r, c, checkLines) {
  const cel = NO._cellEls[`${r},${c}`];
  if(!cel) return;
  cel.className = 'nono-cell ' + (['empty','filled','marked'][NO.board[r][c]]);
  // Restore thick borders
  if((c+1)%5===0 && c<NO.size-1) cel.classList.add('thick-right');
  if((r+1)%5===0 && r<NO.size-1) cel.classList.add('thick-bottom');
  if(checkLines){
    checkNonoRow(r);
    checkNonoCol(c);
    // Fix 11: Update completion progress for visual reveal
    updateNonoProgress();
  }
}

/* Fix 11: Progressive reveal — filled cells get brighter as figure emerges */
function updateNonoProgress(){
  const totalTarget = NO.solution.flat().filter(v=>v===1).length;
  const filled = NO.board.flat().filter(v=>v===1).length;
  const pct = totalTarget > 0 ? filled / totalTarget : 0;
  // Apply progress-based brightness to all filled cells via CSS variable
  const wrap = document.getElementById('nono-grid-wrap');
  if(wrap){
    // Lightness boost: starts at 0 (base color), reaches 15% at completion
    wrap.style.setProperty('--no-progress', (pct * 15) + '%');
    // Show a subtle emoji preview when >70% complete
    if(pct > 0.7 && !NO._previewShown){
      NO._previewShown = true;
      const puzzle = NONO_PUZZLES[NO.puzzleIdx];
      if(puzzle && puzzle.icon){
        const preview = document.createElement('div');
        preview.className = 'nono-figure-preview';
        preview.textContent = puzzle.icon;
        wrap.appendChild(preview);
        setTimeout(()=>preview.classList.add('show'), 50);
      }
    }
  }
}

/* ── Check row / col completion ── */
function checkNonoRow(r) {
  const clue = NO.rowClues[r];
  const el = NO._rowClueEls[r];
  if(clue[0]===0){
    const done = NO.board[r].every(v=>v!==1);
    if(el){ el.classList.toggle('done', done); el.classList.remove('overcrowded'); }
    return done;
  }
  // Build actual blocks
  const actual=[]; let cnt=0;
  for(let c=0;c<NO.size;c++){
    if(NO.board[r][c]===1) cnt++;
    else if(cnt){actual.push(cnt);cnt=0;}
  }
  if(cnt) actual.push(cnt);
  const done = JSON.stringify(actual)===JSON.stringify(clue);
  // Fix 6: Check if too many filled cells or too many blocks
  const totalFilled = NO.board[r].filter(v=>v===1).length;
  const clueTotal = clue.reduce((s,v)=>s+v,0);
  const tooMany = totalFilled > clueTotal || actual.length > clue.length;
  if(el){
    el.classList.toggle('done', done);
    el.classList.toggle('overcrowded', tooMany && !done);
  }
  if(done) flashRowCells(r);
  return done;
}
function checkNonoCol(c) {
  const clue = NO.colClues[c];
  const el = NO._colClueEls[c];
  if(clue[0]===0){
    const colData = Array.from({length:NO.size},(_,r)=>NO.board[r][c]);
    const done = colData.every(v=>v!==1);
    if(el){ el.classList.toggle('done', done); el.classList.remove('overcrowded'); }
    return done;
  }
  const actual=[]; let cnt=0;
  for(let r=0;r<NO.size;r++){
    if(NO.board[r][c]===1) cnt++;
    else if(cnt){actual.push(cnt);cnt=0;}
  }
  if(cnt) actual.push(cnt);
  const done = JSON.stringify(actual)===JSON.stringify(clue);
  // Fix 6: Check overcrowded
  const totalFilled = Array.from({length:NO.size},(_,r)=>NO.board[r][c]).filter(v=>v===1).length;
  const clueTotal = clue.reduce((s,v)=>s+v,0);
  const tooMany = totalFilled > clueTotal || actual.length > clue.length;
  if(el){
    el.classList.toggle('done', done);
    el.classList.toggle('overcrowded', tooMany && !done);
  }
  if(done) flashColCells(c);
  return done;
}

function flashRowCells(r){
  for(let c=0;c<NO.size;c++){
    const el=NO._cellEls[`${r},${c}`];
    if(el&&NO.board[r][c]===1){el.classList.add('row-done');setTimeout(()=>el.classList.remove('row-done'),600);}
  }
  tone(660,'sine',.08,.18); setTimeout(()=>tone(784,'sine',.1,.18),80);
}
function flashColCells(c){
  for(let r=0;r<NO.size;r++){
    const el=NO._cellEls[`${r},${c}`];
    if(el&&NO.board[r][c]===1){el.classList.add('col-done');setTimeout(()=>el.classList.remove('col-done'),600);}
  }
}

/* ── Win check ── */
function checkNonoWin() {
  for(let r=0;r<NO.size;r++) for(let c=0;c<NO.size;c++){
    if(NO.solution[r][c]===1 && NO.board[r][c]!==1) return;
  }
  NO.solved = true;
  setTimeout(showNonoWin, 400);
}

function showNonoWin() {
  // Base implementation — monkey-patched by themes.js for world integration
  sfxWin(); spawnConfetti();
  const earned = Math.max(1, 3 - Math.floor(NO.errors/3));
  document.getElementById('nono-stars').textContent = P.stars;
  const emojis=['🎉','🌟','✨','🎊'];
  const titles=['Fantastico!','Bravissimo!','Perfetto!','Super!'];
  document.getElementById('nono-win-em').textContent    = emojis[rnd(emojis.length)];
  document.getElementById('nono-win-title').textContent = titles[rnd(titles.length)];
  document.getElementById('nono-win-stars').textContent = `⭐ +${earned} stelle!`;
  const btn = document.getElementById('nono-win-next');
  btn.textContent = 'Avanti! →';
  btn.onclick = ()=>{ closeNonoWin(); loadNonoPuzzle(NO.puzzleIdx+1); };
  document.getElementById('nono-win').classList.add('show');
}
function closeNonoWin(){ document.getElementById('nono-win').classList.remove('show'); }

/* ── Load puzzle ── */
function loadNonoPuzzle(idx) {
  let puzzle;
  if (idx < NONO_PUZZLES.length) {
    puzzle = NONO_PUZZLES[idx];
  } else {
    // A04: procedural generation for worlds beyond the 10 predefined puzzles
    puzzle = generateProceduralNono(idx);
  }
  NO.puzzleIdx = idx;
  NO.size = puzzle.size;
  NO.solution = puzzle.solution;
  NO.board = Array.from({length:puzzle.size},()=>Array(puzzle.size).fill(0));
  NO.errors = 0;
  NO.solved = false;
  NO.mode = 'fill';
  NO.dragFill = null;
  NO._undoStack = []; // Fix 4: undo support
  NO.hintsLeft = 3;   // Fix 9: hint support
  NO._previewShown = false; // Fix 11: reset figure preview

  // Fix 1: Set filled cell color from game palette (first color of the size palette)
  const palColors = (typeof SYMS !== 'undefined' && SYMS.colors[4]) || ['#FF5252'];
  const worldTheme = NO._worldRef?.theme || '';
  const themeColors = {
    garden:'#4CAF50', clouds:'#64B5F6', stardust:'#FFD166', forest:'#2E7D32',
    crystal:'#7C4DFF', ocean:'#0288D1', galaxy:'#9C27B0', dragon:'#FF6D00',
  };
  NO._fillColor = themeColors[worldTheme] || palColors[0];
  const gridWrap = document.getElementById('nono-grid-wrap');
  if (gridWrap) gridWrap.style.setProperty('--no-filled', NO._fillColor);

  document.getElementById('nono-pill-icon').textContent = puzzle.icon;
  document.getElementById('nono-pill-nm').textContent   = puzzle.name;
  document.getElementById('nono-pill-pg').textContent   = `${puzzle.size}×${puzzle.size} · Livello ${idx+1}`;
  document.getElementById('nono-errors').textContent    = '0';
  document.getElementById('nono-stars').textContent     = P.stars;
  document.getElementById('nono-mode-fill').classList.add('active');
  document.getElementById('nono-mode-mark').classList.remove('active');

  // Fix 8: Hide mark mode button for easy phases (5×5)
  const markBtn = document.getElementById('nono-mode-mark');
  if (markBtn) markBtn.style.display = puzzle.size <= 5 ? 'none' : '';

  closeNonoWin();
  // Fix 11: Remove old figure preview
  document.querySelectorAll('.nono-figure-preview').forEach(el=>el.remove());
  buildNonoGrid();
  updateNonoHintBtn(); // Fix 9
}

/* F10+GD08: procedural nonogram with template-based symmetric patterns */
function generateProceduralNono(idx) {
  // Fix 7: Add 8×8 intermediate size
  const size = idx < 12 ? 5 : idx < 14 ? 7 : idx < 18 ? 8 : 10;
  const icons = ['🎲','🎯','🌈','⭐','🎨','🔮','🎪','🎭','🎵','🎮'];
  // Fix 2: Honest generic names — don't claim a shape that doesn't exist
  const names = ['Mosaico','Simmetria','Riflesso','Motivo','Disegno','Pattern',
    'Geometria','Pixel Art','Creazione','Invenzione','Scoperta','Fantasia'];

  // Seeded random
  let seed = (idx * 2654435761 + 1013904223) >>> 0;
  const rng = () => { seed = (seed * 1103515245 + 12345) >>> 0; return (seed >>> 16) / 65536; };

  // Template-based: start from a basic shape and add symmetric detail
  const solution = Array.from({length:size}, () => Array(size).fill(0));
  const half = Math.ceil(size / 2);

  // Fill left half with structured pattern, mirror to right
  for (let r = 0; r < size; r++) {
    // Create a "density curve" — more filled in the middle rows
    const rowDensity = 1 - Math.abs(r - size/2) / (size/2) * 0.4;
    for (let c = 0; c < half; c++) {
      const colDensity = 1 - Math.abs(c - half/2) / (half/2) * 0.3;
      const threshold = 0.35 + rowDensity * 0.15 + colDensity * 0.1;
      solution[r][c] = rng() < threshold ? 1 : 0;
    }
    // Mirror horizontally
    for (let c = 0; c < half; c++) {
      solution[r][size - 1 - c] = solution[r][c];
    }
  }
  // Ensure middle column filled for odd sizes
  if (size % 2 === 1) {
    for (let r = 0; r < size; r++) {
      if (rng() < 0.6) solution[r][Math.floor(size/2)] = 1;
    }
  }
  // Ensure at least 30% filled
  const filled = solution.flat().reduce((s,v) => s+v, 0);
  if (filled < size*size*0.3) {
    for (let r = 1; r < size-1; r++) {
      for (let c = 1; c < size-1; c++) {
        if (!solution[r][c] && rng() < 0.4) {
          solution[r][c] = 1;
          solution[r][size-1-c] = 1;
        }
      }
    }
  }

  return {
    id: 'n_proc_' + idx,
    name: names[idx % names.length],
    icon: icons[idx % icons.length],
    phase: size <= 5 ? 0 : size <= 7 ? 1 : size <= 8 ? 2 : 3,
    size,
    solution,
  };
}

/* ── Mode toggle ── */
document.getElementById('nono-mode-fill').onclick = () => {
  NO.mode = 'fill';
  document.getElementById('nono-mode-fill').classList.add('active');
  document.getElementById('nono-mode-mark').classList.remove('active');
  sfxClick();
};
document.getElementById('nono-mode-mark').onclick = () => {
  NO.mode = 'mark';
  document.getElementById('nono-mode-mark').classList.add('active');
  document.getElementById('nono-mode-fill').classList.remove('active');
  sfxClick();
};

/* ── Open from map ── */
function openNonogram() {
  sfxClick(); show('s-nono');
  setTimeout(()=>loadNonoPuzzle(NO.puzzleIdx||0), 80);
}

/* ── Wire ── */
document.getElementById('btn-nono-map').onclick        = openNonogram;
document.getElementById('btn-nono-back').onclick       = ()=>{ gameBackToMap('nono'); };
document.getElementById('nono-reset-btn').onclick      = ()=>{ sfxClick(); loadNonoPuzzle(NO.puzzleIdx); };
// Fix 10: "Prossimo" button removed — progression only via completing the puzzle

/* Fix 4: Undo last move(s) */
function undoNonoMove(){
  if(!NO._undoStack || NO._undoStack.length===0 || NO.solved) return;
  sfxClick();
  const last = NO._undoStack.pop();
  NO.board[last.r][last.c] = last.prev;
  updateNonoCell(last.r, last.c, true);
}
const _nonoUndoBtn = document.getElementById('nono-undo-btn');
if (_nonoUndoBtn) _nonoUndoBtn.onclick = undoNonoMove;

/* Fix 9: Hint — reveal one correct unfilled cell */
function useNonoHint(){
  if(NO.hintsLeft <= 0 || NO.solved) return;
  // Find all cells that should be filled but aren't
  const candidates = [];
  for(let r=0;r<NO.size;r++) for(let c=0;c<NO.size;c++){
    if(NO.solution[r][c]===1 && NO.board[r][c]!==1) candidates.push({r,c});
  }
  if(candidates.length===0) return;

  // Pick a cell in the row/column with the most progress (most helpful)
  candidates.sort((a,b) => {
    const aRowFilled = NO.board[a.r].filter(v=>v===1).length;
    const bRowFilled = NO.board[b.r].filter(v=>v===1).length;
    return bRowFilled - aRowFilled; // prefer rows with more progress
  });
  const {r,c} = candidates[0];

  NO.hintsLeft--;
  updateNonoHintBtn();
  sfxHint();

  NO.board[r][c] = 1;
  updateNonoCell(r, c, true);
  if(typeof mascotReact==='function') mascotReact('happy');

  // Highlight the revealed cell
  const cel = NO._cellEls[`${r},${c}`];
  if(cel){
    cel.classList.add('hint-glow');
    setTimeout(()=>cel.classList.remove('hint-glow'), 2500);
  }
  checkNonoWin();
}

function updateNonoHintBtn(){
  const lbl = document.getElementById('nono-hint-lbl');
  if(lbl) lbl.textContent = NO.hintsLeft > 0 ? 'Aiuto ('+NO.hintsLeft+')' : 'Nessun aiuto';
  const btn = document.getElementById('nono-hint-btn');
  if(btn) btn.classList.toggle('off', NO.hintsLeft <= 0);
}

const _nonoHintBtn = document.getElementById('nono-hint-btn');
if (_nonoHintBtn) _nonoHintBtn.onclick = useNonoHint;
const _nonoSoundBtn = document.getElementById('nono-sound-btn');
if (_nonoSoundBtn) _nonoSoundBtn.onclick = toggleSound;