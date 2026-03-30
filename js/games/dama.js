/* ══════════════════════════════════════════
   MINI DAMA ENGINE (6×6)
   Italian checkers on a small board
══════════════════════════════════════════ */

const DM = {
  board: null,     // 6×6 array: 0=empty, 1=player, 2=ai, 3=playerKing, 4=aiKing
  selected: null,  // {r,c} or null
  validMoves: [],  // [{r,c,captures:[{r,c},...]}]
  turn: 'player',  // 'player' | 'ai'
  diff: 'easy',    // 'easy' | 'medium' | 'hard'
  wins: 0, losses: 0, draws: 0,
  gameOver: false,
  playerCaptured: 0,
  aiCaptured: 0,
};

const SZ = 6;

function dmColors(){
  const p = (typeof PALS!=='undefined'&&typeof P!=='undefined'&&PALS[P.palette]) ? PALS[P.palette].colors : ['#FF5252','#2196F3','#FF9800','#9C27B0'];
  return { player:p[0]||'#FF5252', ai:p[1]||'#2196F3', board1:'#F5E6CA', board2:'#8B6914' };
}

/* ── Init board ── */
function dmInitBoard(){
  // 6×6: rows 0-1 = AI pieces (2), rows 4-5 = player pieces (1)
  // Only on dark squares (r+c is odd)
  const b = Array.from({length:SZ},()=>Array(SZ).fill(0));
  for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){
    if((r+c)%2===0) continue; // light square — no pieces
    if(r<2) b[r][c]=2;       // AI
    else if(r>=SZ-2) b[r][c]=1; // Player
  }
  return b;
}

function dmIsPlayer(v){ return v===1||v===3; }
function dmIsAI(v){ return v===2||v===4; }
function dmIsKing(v){ return v===3||v===4; }

/* ── Get all valid moves for a piece ── */
function dmGetMoves(board, r, c, mustCapture){
  const v = board[r][c];
  if(!v) return [];
  const isP = dmIsPlayer(v), isK = dmIsKing(v);
  const dirs = [];
  // Normal pieces: player moves up (dr=-1), AI moves down (dr=+1). Kings: both.
  if(isK||isP) dirs.push({dr:-1,dc:-1},{dr:-1,dc:1});
  if(isK||!isP) dirs.push({dr:1,dc:-1},{dr:1,dc:1});

  const moves = [];
  // Captures
  for(const {dr,dc} of dirs){
    const mr=r+dr, mc=c+dc, jr=r+2*dr, jc=c+2*dc;
    if(jr<0||jr>=SZ||jc<0||jc>=SZ) continue;
    const mid = board[mr][mc];
    if(mid===0) continue;
    if(isP && dmIsAI(mid) && board[jr][jc]===0){
      moves.push({r:jr,c:jc,captures:[{r:mr,c:mc}]});
    } else if(!isP && dmIsPlayer(mid) && board[jr][jc]===0){
      moves.push({r:jr,c:jc,captures:[{r:mr,c:mc}]});
    }
  }
  // Simple moves (only if no capture available)
  if(!mustCapture && moves.length===0){
    for(const {dr,dc} of dirs){
      const nr=r+dr, nc=c+dc;
      if(nr<0||nr>=SZ||nc<0||nc>=SZ) continue;
      if(board[nr][nc]===0) moves.push({r:nr,c:nc,captures:[]});
    }
  }
  return moves;
}

/* ── Check if any piece of a side has captures ── */
function dmHasCaptures(board, isPlayerSide){
  for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){
    const v=board[r][c];
    if(isPlayerSide ? dmIsPlayer(v) : dmIsAI(v)){
      const caps = dmGetMoves(board,r,c,true);
      if(caps.length>0) return true;
    }
  }
  return false;
}

/* ── Get all moves for a side ── */
function dmAllMoves(board, isPlayerSide){
  const hasCap = dmHasCaptures(board, isPlayerSide);
  const all = [];
  for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){
    const v=board[r][c];
    if(isPlayerSide ? dmIsPlayer(v) : dmIsAI(v)){
      const moves = dmGetMoves(board,r,c,hasCap);
      moves.forEach(m=>all.push({fr:r,fc:c,...m}));
    }
  }
  // If captures are mandatory, only return captures
  if(hasCap) return all.filter(m=>m.captures.length>0);
  return all;
}

/* ── Apply move (mutates board) ── */
function dmApply(board, fr, fc, tr, tc, captures){
  board[tr][tc]=board[fr][fc];
  board[fr][fc]=0;
  captures.forEach(({r,c})=>{ board[r][c]=0; });
  // Promotion
  if(dmIsPlayer(board[tr][tc]) && tr===0) board[tr][tc]=3;
  if(dmIsAI(board[tr][tc]) && tr===SZ-1) board[tr][tc]=4;
}

/* ── Check game end ── */
function dmCheckEnd(){
  const playerMoves = dmAllMoves(DM.board, true);
  const aiMoves = dmAllMoves(DM.board, false);
  const playerPieces = DM.board.flat().filter(v=>dmIsPlayer(v)).length;
  const aiPieces = DM.board.flat().filter(v=>dmIsAI(v)).length;

  if(playerPieces===0 || playerMoves.length===0){
    DM.gameOver=true; DM.losses++;
    document.getElementById('dama-status').textContent='😢 Hai perso!';
    sfxErr(); if(typeof mascotReact==='function') mascotReact('sad');
    return true;
  }
  if(aiPieces===0 || aiMoves.length===0){
    DM.gameOver=true; DM.wins++;
    document.getElementById('dama-status').textContent='🎉 Hai vinto!';
    P.stars+=3; saveActiveProfile();
    document.getElementById('dama-stars').textContent=P.stars;
    sfxWin(); spawnConfetti();
    if(typeof mascotReact==='function') mascotReact('happy');
    return true;
  }
  return false;
}

/* ── Render board ── */
function dmRender(){
  const board = DM.board;
  const el = document.getElementById('dama-board');
  const C = dmColors();
  el.innerHTML='';
  el.style.display='grid';
  el.style.gridTemplateColumns=`repeat(${SZ},1fr)`;
  el.style.gap='0';

  const hasCap = dmHasCaptures(board, true);

  for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){
    const cell = document.createElement('div');
    cell.className='dama-cell';
    const dark=(r+c)%2===1;
    cell.style.background=dark?C.board2:C.board1;

    // Highlight valid target cells
    const isTarget = DM.validMoves.some(m=>m.r===r&&m.c===c);
    if(isTarget) cell.classList.add('dama-target');

    // Highlight selected
    if(DM.selected && DM.selected.r===r && DM.selected.c===c) cell.classList.add('dama-selected');

    const v=board[r][c];
    if(v){
      const piece = document.createElement('div');
      piece.className='dama-piece';
      const isP=dmIsPlayer(v);
      piece.style.background=isP?C.player:C.ai;
      piece.style.boxShadow=`0 3px 8px ${isP?C.player:C.ai}66`;
      if(dmIsKing(v)){
        piece.classList.add('dama-king');
        piece.textContent='♛';
      }
      // Clickable player pieces on player turn
      if(isP && DM.turn==='player' && !DM.gameOver){
        const moves = dmGetMoves(board,r,c,hasCap);
        if(moves.length>0) piece.classList.add('dama-clickable');
      }
      cell.appendChild(piece);
    }

    cell.dataset.r=r; cell.dataset.c=c;
    cell.onclick=()=>dmCellClick(r,c);
    el.appendChild(cell);
  }

  // Update captured counts
  document.getElementById('dama-captured-player').textContent = DM.aiCaptured>0 ? '🏆 Catturate: '+DM.aiCaptured : '';
  document.getElementById('dama-captured-ai').textContent = DM.playerCaptured>0 ? '💀 Perse: '+DM.playerCaptured : '';
  document.getElementById('dama-turn-pill').textContent = DM.turn==='player' ? 'Il tuo turno' : 'Computer...';
  document.getElementById('dama-score-label').textContent = `V:${DM.wins} S:${DM.losses}`;
}

/* ── Player click ── */
function dmCellClick(r,c){
  if(DM.turn!=='player' || DM.gameOver) return;
  const board=DM.board;

  // If clicking a target (valid move destination)
  if(DM.selected && DM.validMoves.some(m=>m.r===r&&m.c===c)){
    const move = DM.validMoves.find(m=>m.r===r&&m.c===c);
    sfxClick();
    dmApply(board, DM.selected.r, DM.selected.c, r, c, move.captures);
    DM.aiCaptured += move.captures.length;

    // Check for chain capture
    if(move.captures.length>0){
      const chainCaps = dmGetMoves(board,r,c,true);
      if(chainCaps.length>0){
        DM.selected={r,c};
        DM.validMoves=chainCaps;
        dmRender();
        document.getElementById('dama-status').textContent='Puoi mangiare ancora!';
        return;
      }
    }

    DM.selected=null; DM.validMoves=[];
    dmRender();
    if(!dmCheckEnd()){
      DM.turn='ai';
      dmRender();
      document.getElementById('dama-status').textContent='Il computer pensa...';
      setTimeout(dmAITurn, 500+Math.random()*400);
    } else dmRender();
    return;
  }

  // Select a player piece
  const v=board[r][c];
  if(!dmIsPlayer(v)) { DM.selected=null; DM.validMoves=[]; dmRender(); return; }
  const hasCap = dmHasCaptures(board, true);
  const moves = dmGetMoves(board,r,c,hasCap);
  if(moves.length===0){ sfxErr(); return; }
  sfxClick();
  DM.selected={r,c};
  DM.validMoves=moves;
  dmRender();
  document.getElementById('dama-status').textContent='Scegli dove muovere';
}

/* ── AI turn ── */
function dmAITurn(){
  if(DM.gameOver) return;
  const moves = dmAllMoves(DM.board, false);
  if(moves.length===0){ dmCheckEnd(); dmRender(); return; }

  let chosen;
  if(DM.diff==='easy'){
    // Random, slight preference for captures
    const caps=moves.filter(m=>m.captures.length>0);
    chosen = caps.length>0 && Math.random()<0.7 ? caps[Math.floor(Math.random()*caps.length)]
             : moves[Math.floor(Math.random()*moves.length)];
  } else if(DM.diff==='medium'){
    // Prefer captures, then center control, then random
    const caps=moves.filter(m=>m.captures.length>0);
    if(caps.length>0){
      caps.sort((a,b)=>b.captures.length-a.captures.length);
      chosen=caps[0];
    } else {
      // Prefer advancing and center
      moves.sort((a,b)=>{
        const aScore = a.r + (a.c>=1&&a.c<=4?1:0);
        const bScore = b.r + (b.c>=1&&b.c<=4?1:0);
        return bScore-aScore;
      });
      chosen=moves[0];
    }
  } else {
    // Hard: minimax
    chosen = dmMinimaxRoot(DM.board, 4);
  }

  if(!chosen) chosen=moves[0];
  dmApply(DM.board, chosen.fr, chosen.fc, chosen.r, chosen.c, chosen.captures);
  DM.playerCaptured += chosen.captures.length;

  // Chain capture for AI
  if(chosen.captures.length>0){
    const chainCaps = dmGetMoves(DM.board, chosen.r, chosen.c, true);
    if(chainCaps.length>0){
      dmRender();
      setTimeout(()=>{
        const chain = DM.diff==='easy' ? chainCaps[Math.floor(Math.random()*chainCaps.length)] : chainCaps[0];
        dmApply(DM.board, chosen.r, chosen.c, chain.r, chain.c, chain.captures);
        DM.playerCaptured += chain.captures.length;
        dmFinishAI();
      }, 400);
      return;
    }
  }
  dmFinishAI();
}

function dmFinishAI(){
  DM.turn='player';
  dmRender();
  if(!dmCheckEnd()){
    const playerMoves=dmAllMoves(DM.board,true);
    document.getElementById('dama-status').textContent = playerMoves.length>0 ? 'Seleziona una pedina' : 'Non puoi muovere!';
  }
  dmRender();
}

/* ── Minimax for hard AI ── */
function dmEval(board){
  let score=0;
  for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){
    const v=board[r][c];
    if(v===1) score-=10;
    else if(v===3) score-=18;
    else if(v===2) score+=10;
    else if(v===4) score+=18;
    // Bonus for advancement
    if(v===2) score+=r; // AI wants to go down
    if(v===1) score-=(SZ-1-r); // player wants to go up
  }
  return score;
}

function dmMinimax(board, depth, isMax, alpha, beta){
  const pMoves=dmAllMoves(board,true), aMoves=dmAllMoves(board,false);
  const pPieces=board.flat().filter(v=>dmIsPlayer(v)).length;
  const aPieces=board.flat().filter(v=>dmIsAI(v)).length;
  if(pPieces===0||pMoves.length===0) return 1000-depth;
  if(aPieces===0||aMoves.length===0) return -1000+depth;
  if(depth===0) return dmEval(board);

  const moves = isMax ? aMoves : pMoves;
  if(isMax){
    let best=-Infinity;
    for(const m of moves){
      const b=board.map(r=>[...r]);
      dmApply(b,m.fr,m.fc,m.r,m.c,m.captures);
      best=Math.max(best,dmMinimax(b,depth-1,false,alpha,beta));
      alpha=Math.max(alpha,best);
      if(beta<=alpha) break;
    }
    return best;
  } else {
    let best=Infinity;
    for(const m of moves){
      const b=board.map(r=>[...r]);
      dmApply(b,m.fr,m.fc,m.r,m.c,m.captures);
      best=Math.min(best,dmMinimax(b,depth-1,true,alpha,beta));
      beta=Math.min(beta,best);
      if(beta<=alpha) break;
    }
    return best;
  }
}

function dmMinimaxRoot(board, depth){
  const moves=dmAllMoves(board,false);
  let best=-Infinity, bestMove=moves[0];
  for(const m of moves){
    const b=board.map(r=>[...r]);
    dmApply(b,m.fr,m.fc,m.r,m.c,m.captures);
    const score=dmMinimax(b,depth-1,false,-Infinity,Infinity);
    if(score>best){best=score;bestMove=m;}
  }
  return bestMove;
}

/* ── New game ── */
function dmNewGame(){
  sfxClick();
  DM.board=dmInitBoard();
  DM.selected=null; DM.validMoves=[];
  DM.turn='player'; DM.gameOver=false;
  DM.playerCaptured=0; DM.aiCaptured=0;
  document.getElementById('dama-status').textContent='Seleziona una pedina';
  dmRender();
}

/* ── Difficulty ── */
function dmCycleDiff(){
  const ds=['easy','medium','hard'];
  const names={easy:'Facile',medium:'Medio',hard:'Difficile'};
  DM.diff=ds[(ds.indexOf(DM.diff)+1)%ds.length];
  document.getElementById('dama-diff-label').textContent=names[DM.diff];
  sfxClick(); dmNewGame();
}

/* ── Open ── */
function openDama(){
  sfxClick();
  document.getElementById('dama-hdr-av').textContent=P.avatar;
  document.getElementById('dama-hdr-nm').textContent=P.name;
  document.getElementById('dama-stars').textContent=P.stars;
  document.getElementById('dama-diff-label').textContent={easy:'Facile',medium:'Medio',hard:'Difficile'}[DM.diff];
  DM.wins=0;DM.losses=0;DM.draws=0;
  show('s-dama');
  dmNewGame();
}

/* ── Wire ── */
document.getElementById('btn-dama-back').onclick=()=>{sfxClick();buildGamesScreen();show('s-games');};
document.getElementById('dama-new-btn').onclick=dmNewGame;
document.getElementById('dama-diff-toggle').onclick=dmCycleDiff;
