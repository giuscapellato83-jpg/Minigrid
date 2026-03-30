/* ══════════════════════════════════════════
   TRIS (TIC-TAC-TOE) ENGINE
   Gioca contro il computer!
══════════════════════════════════════════ */

const TRIS = {
  board: Array(9).fill(null),  // null, 'X', 'O'
  player: 'X',                 // human is always X
  ai: 'O',
  turn: 'X',                   // whose turn
  diff: 'easy',                // 'easy' | 'medium' | 'hard'
  wins: 0,
  draws: 0,
  losses: 0,
  gameOver: false,
};

const TRIS_LINES = [
  [0,1,2],[3,4,5],[6,7,8],  // rows
  [0,3,6],[1,4,7],[2,5,8],  // cols
  [0,4,8],[2,4,6],           // diags
];

/* ── Check winner ── */
function trisCheckWin(board){
  for(const [a,b,c] of TRIS_LINES){
    if(board[a] && board[a]===board[b] && board[b]===board[c]) return {winner:board[a], line:[a,b,c]};
  }
  if(board.every(c=>c!==null)) return {winner:'draw', line:null};
  return null;
}

/* ── AI: Minimax ── */
function trisMinimax(board, isMax, depth){
  const result = trisCheckWin(board);
  if(result){
    if(result.winner==='O') return 10-depth;
    if(result.winner==='X') return depth-10;
    return 0; // draw
  }
  if(isMax){
    let best=-Infinity;
    for(let i=0;i<9;i++){
      if(board[i]!==null) continue;
      board[i]='O';
      best=Math.max(best,trisMinimax(board,false,depth+1));
      board[i]=null;
    }
    return best;
  } else {
    let best=Infinity;
    for(let i=0;i<9;i++){
      if(board[i]!==null) continue;
      board[i]='X';
      best=Math.min(best,trisMinimax(board,true,depth+1));
      board[i]=null;
    }
    return best;
  }
}

function trisAIMove(){
  const board = TRIS.board;
  const empty = board.map((v,i)=>v===null?i:-1).filter(i=>i>=0);
  if(empty.length===0) return;

  let move;
  if(TRIS.diff==='easy'){
    // Random move (with 30% chance of blocking obvious wins)
    const winning = trisCheckImmediate(board, 'X');
    if(winning !== null && Math.random()<0.3) move = winning;
    else move = empty[Math.floor(Math.random()*empty.length)];
  } else if(TRIS.diff==='medium'){
    // Block player wins, take own wins, otherwise random
    const aiWin = trisCheckImmediate(board, 'O');
    const playerWin = trisCheckImmediate(board, 'X');
    if(aiWin !== null) move = aiWin;
    else if(playerWin !== null) move = playerWin;
    else if(board[4]===null) move = 4; // prefer center
    else move = empty[Math.floor(Math.random()*empty.length)];
  } else {
    // Perfect play: minimax
    let bestScore=-Infinity, bestMove=empty[0];
    for(const i of empty){
      board[i]='O';
      const score=trisMinimax(board,false,0);
      board[i]=null;
      if(score>bestScore){bestScore=score;bestMove=i;}
    }
    move=bestMove;
  }

  board[move]='O';
  TRIS.turn='X';
  trisRender();
  trisCheckEnd();
}

/* ── Check if a player can win in one move ── */
function trisCheckImmediate(board, player){
  for(const [a,b,c] of TRIS_LINES){
    const vals = [board[a],board[b],board[c]];
    const mine = vals.filter(v=>v===player).length;
    const empty = vals.filter(v=>v===null).length;
    if(mine===2 && empty===1){
      if(board[a]===null) return a;
      if(board[b]===null) return b;
      if(board[c]===null) return c;
    }
  }
  return null;
}

/* ── Player move ── */
function trisPlayerMove(idx){
  if(TRIS.gameOver || TRIS.turn!=='X' || TRIS.board[idx]!==null) return;
  sfxClick();
  TRIS.board[idx]='X';
  TRIS.turn='O';
  trisRender();

  const ended = trisCheckEnd();
  if(!ended){
    // AI thinks briefly
    document.getElementById('tris-status').textContent = 'Il computer pensa...';
    setTimeout(trisAIMove, 400+Math.random()*300);
  }
}

/* ── Check end of game ── */
function trisCheckEnd(){
  const result = trisCheckWin(TRIS.board);
  if(!result) {
    document.getElementById('tris-status').textContent = TRIS.turn==='X' ? 'Il tuo turno!' : 'Il computer pensa...';
    return false;
  }
  TRIS.gameOver = true;

  if(result.winner==='X'){
    TRIS.wins++;
    document.getElementById('tris-status').textContent = '🎉 Hai vinto!';
    P.stars += 2; saveActiveProfile();
    sfxWin(); spawnConfetti();
    if(typeof mascotReact==='function') mascotReact('happy');
  } else if(result.winner==='O'){
    TRIS.losses++;
    document.getElementById('tris-status').textContent = '😢 Ha vinto il computer';
    sfxErr();
    if(typeof mascotReact==='function') mascotReact('sad');
  } else {
    TRIS.draws++;
    document.getElementById('tris-status').textContent = '🤝 Pareggio!';
    sfxOk();
  }

  // Highlight winning line
  if(result.line){
    result.line.forEach(i=>{
      const cell = document.querySelector(`[data-tris="${i}"]`);
      if(cell) cell.classList.add('tris-win-cell');
    });
  }

  document.getElementById('tris-wins').textContent = TRIS.wins;
  document.getElementById('tris-draws').textContent = TRIS.draws;
  document.getElementById('tris-losses').textContent = TRIS.losses;
  document.getElementById('tris-stars').textContent = P.stars;
  document.getElementById('tris-score-label').textContent = 'Vittorie: '+TRIS.wins;
  return true;
}

/* ── Render grid ── */
function trisRender(){
  const grid = document.getElementById('tris-grid');
  grid.innerHTML = '';
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(3,1fr)';
  grid.style.gap = '6px';

  const palColors = (typeof PALS!=='undefined' && PALS[P.palette]) ? PALS[P.palette].colors : ['#FF5252','#2196F3'];

  for(let i=0;i<9;i++){
    const cell = document.createElement('div');
    cell.className = 'tris-cell';
    cell.dataset.tris = i;
    if(TRIS.board[i]==='X'){
      cell.textContent = '✕';
      cell.classList.add('tris-x');
      cell.style.color = palColors[0] || '#FF5252';
    } else if(TRIS.board[i]==='O'){
      cell.textContent = '○';
      cell.classList.add('tris-o');
      cell.style.color = palColors[1] || '#2196F3';
    } else {
      cell.classList.add('tris-empty');
      cell.onclick = ()=>trisPlayerMove(i);
    }
    grid.appendChild(cell);
  }
}

/* ── New game ── */
function trisNewGame(){
  sfxClick();
  TRIS.board = Array(9).fill(null);
  TRIS.turn = 'X';
  TRIS.gameOver = false;
  document.getElementById('tris-status').textContent = 'Il tuo turno!';
  trisRender();
}

/* ── Difficulty cycle ── */
function trisCycleDiff(){
  const diffs = ['easy','medium','hard'];
  const names = {easy:'Facile',medium:'Medio',hard:'Impossibile'};
  const idx = diffs.indexOf(TRIS.diff);
  TRIS.diff = diffs[(idx+1)%diffs.length];
  document.getElementById('tris-diff-label').textContent = names[TRIS.diff];
  sfxClick();
  trisNewGame();
}

/* ── Open ── */
function openTris(){
  sfxClick();
  document.getElementById('tris-hdr-av').textContent = P.avatar;
  document.getElementById('tris-hdr-nm').textContent = P.name;
  document.getElementById('tris-stars').textContent = P.stars;
  document.getElementById('tris-diff-label').textContent = {easy:'Facile',medium:'Medio',hard:'Impossibile'}[TRIS.diff];
  TRIS.wins=0; TRIS.draws=0; TRIS.losses=0;
  show('s-tris');
  trisNewGame();
}

/* ── Wire ── */
document.getElementById('btn-tris-back').onclick = ()=>{ sfxClick(); buildGamesScreen(); show('s-games'); };
document.getElementById('tris-new-btn').onclick = trisNewGame;
document.getElementById('tris-diff-toggle').onclick = trisCycleDiff;
