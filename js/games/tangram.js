/* ══════════════════════════════════════════
   TANGRAM ENGINE  v3 — expanded levels + mobile fix
══════════════════════════════════════════ */
const SNAP_DIST_U = 1.8; // VD12: increased from 1.2 for easier snapping by young children

const TANG_LEVELS = [
  /* ── FASE 0 — 2 pezzi, no rotazione ── */
  { id:'t0a', name:'Quadrato', icon:'⬛', phase:0, desc:'2 pezzi', noRot:true,
    silPts:[[2,2],[4,2],[4,4],[2,4]],
    pieces:[
      { pid:'A', color:'#FF5252', ptsWorld:[[2,2],[4,2],[2,4]], anchor:[2,2] },
      { pid:'B', color:'#2196F3', ptsWorld:[[4,4],[2,4],[4,2]], anchor:[4,4] },
    ] },
  { id:'t0b', name:'Rettangolo', icon:'▬', phase:0, desc:'2 pezzi', noRot:true,
    silPts:[[2,3],[6,3],[6,5],[2,5]],
    pieces:[
      { pid:'A', color:'#FF5252', ptsWorld:[[2,3],[4,3],[2,5]], anchor:[2,3] },
      { pid:'B', color:'#4CAF50', ptsWorld:[[6,5],[4,5],[6,3]], anchor:[6,5] },
    ] },
  { id:'t0c', name:'Scalino', icon:'📐', phase:0, desc:'2 pezzi', noRot:true,
    silPts:[[2,2],[4,2],[4,4],[6,4],[6,6],[2,6]],
    pieces:[
      { pid:'A', color:'#E91E63', ptsWorld:[[2,2],[4,2],[4,6],[2,6]], anchor:[2,2] },
      { pid:'B', color:'#00BCD4', ptsWorld:[[4,4],[6,4],[6,6],[4,6]], anchor:[4,4] },
    ] },
  { id:'t0d', name:'Piramide', icon:'🔺', phase:0, desc:'2 pezzi', noRot:true,
    silPts:[[2,5],[4,2],[6,5]],
    pieces:[
      { pid:'A', color:'#FF9800', ptsWorld:[[2,5],[4,2],[4,5]], anchor:[2,5] },
      { pid:'B', color:'#9C27B0', ptsWorld:[[4,2],[6,5],[4,5]], anchor:[4,2] },
    ] },

  /* ── FASE 1 — 3-4 pezzi ── */
  { id:'t1a', name:'Grande triangolo', icon:'🔺', phase:1, desc:'3 pezzi', noRot:true,
    silPts:[[2,2],[6,2],[2,6]],
    pieces:[
      { pid:'A', color:'#FF5252', ptsWorld:[[2,2],[4,2],[2,4]], anchor:[2,2] },
      { pid:'B', color:'#FF9800', ptsWorld:[[4,2],[6,2],[4,4]], anchor:[4,2] },
      { pid:'C', color:'#9C27B0', ptsWorld:[[2,4],[4,4],[2,6]], anchor:[2,4] },
    ] },
  { id:'t1b', name:'Casa', icon:'🏠', phase:1, desc:'3 pezzi', noRot:true,
    silPts:[[2,4],[4,2],[6,4],[6,6],[2,6]],
    pieces:[
      { pid:'A', color:'#2196F3', ptsWorld:[[2,4],[4,2],[6,4]],       anchor:[2,4] },
      { pid:'B', color:'#FF5252', ptsWorld:[[2,4],[4,4],[4,6],[2,6]], anchor:[2,4] },
      { pid:'C', color:'#4CAF50', ptsWorld:[[4,4],[6,4],[6,6],[4,6]], anchor:[4,4] },
    ] },
  { id:'t1c', name:'Pesce', icon:'🐟', phase:1, desc:'3 pezzi', noRot:true,
    silPts:[[1,4],[3,2],[5,4],[7,4],[5,6],[3,6]],
    pieces:[
      { pid:'A', color:'#FF5252', ptsWorld:[[1,4],[3,2],[3,4]],       anchor:[1,4] },
      { pid:'B', color:'#2196F3', ptsWorld:[[3,2],[5,4],[5,6],[3,6]], anchor:[3,2] },
      { pid:'C', color:'#4CAF50', ptsWorld:[[5,4],[7,4],[5,6]],       anchor:[5,4] },
    ] },
  { id:'t1d', name:'Barca', icon:'⛵', phase:1, desc:'4 pezzi', noRot:true,
    silPts:[[3,1],[5,4],[7,4],[6,6],[2,6],[1,4],[3,4]],
    pieces:[
      { pid:'A', color:'#FF9800', ptsWorld:[[3,1],[5,4],[3,4]],       anchor:[3,1] },
      { pid:'B', color:'#2196F3', ptsWorld:[[1,4],[3,4],[2,6]],       anchor:[1,4] },
      { pid:'C', color:'#4CAF50', ptsWorld:[[3,4],[5,4],[4,6],[2,6]], anchor:[3,4] },
      { pid:'D', color:'#9C27B0', ptsWorld:[[5,4],[7,4],[6,6],[4,6]], anchor:[5,4] },
    ] },

  /* ── FASE 2 — rotazione ── */
  { id:'t2a', name:'Parallelogramma', icon:'◇', phase:2, desc:'2 pezzi · Ruota', noRot:false,
    silPts:[[2,2],[6,2],[5,5],[1,5]],
    pieces:[
      { pid:'A', color:'#FF5252', ptsWorld:[[2,2],[4,2],[3,5],[1,5]], anchor:[2,2] },
      { pid:'B', color:'#2196F3', ptsWorld:[[4,2],[6,2],[5,5],[3,5]], anchor:[4,2] },
    ] },
  { id:'t2b', name:'Freccia', icon:'➡️', phase:2, desc:'3 pezzi · Ruota', noRot:false,
    silPts:[[1,3],[4,1],[7,3],[5,3],[5,6],[3,6],[3,3]],
    pieces:[
      { pid:'A', color:'#FF5252', ptsWorld:[[1,3],[4,1],[4,3]],       anchor:[1,3] },
      { pid:'B', color:'#2196F3', ptsWorld:[[4,1],[7,3],[4,3]],       anchor:[4,1] },
      { pid:'C', color:'#4CAF50', ptsWorld:[[3,3],[5,3],[5,6],[3,6]], anchor:[3,3] },
    ] },
  { id:'t2c', name:'Diamante', icon:'💎', phase:2, desc:'4 pezzi · Ruota', noRot:false,
    silPts:[[4,1],[7,4],[4,7],[1,4]],
    pieces:[
      { pid:'A', color:'#FF5252', ptsWorld:[[4,1],[7,4],[4,4]], anchor:[4,1] },
      { pid:'B', color:'#2196F3', ptsWorld:[[4,1],[4,4],[1,4]], anchor:[4,1] },
      { pid:'C', color:'#4CAF50', ptsWorld:[[1,4],[4,4],[4,7]], anchor:[1,4] },
      { pid:'D', color:'#FF9800', ptsWorld:[[7,4],[4,7],[4,4]], anchor:[7,4] },
    ] },
  { id:'t2d', name:'Croce', icon:'➕', phase:2, desc:'5 pezzi · Ruota', noRot:false,
    silPts:[[3,1],[5,1],[5,3],[7,3],[7,5],[5,5],[5,7],[3,7],[3,5],[1,5],[1,3],[3,3]],
    pieces:[
      { pid:'A', color:'#FF5252', ptsWorld:[[3,1],[5,1],[5,3],[3,3]], anchor:[3,1] },
      { pid:'B', color:'#2196F3', ptsWorld:[[5,3],[7,3],[7,5],[5,5]], anchor:[5,3] },
      { pid:'C', color:'#4CAF50', ptsWorld:[[3,5],[5,5],[5,7],[3,7]], anchor:[3,5] },
      { pid:'D', color:'#FF9800', ptsWorld:[[1,3],[3,3],[3,5],[1,5]], anchor:[1,3] },
      { pid:'E', color:'#9C27B0', ptsWorld:[[3,3],[5,3],[5,5],[3,5]], anchor:[3,3] },
    ] },

  /* ── FASE 3 — complesso ── */
  { id:'t3a', name:'Gatto', icon:'🐱', phase:3, desc:'4 pezzi · Difficile', noRot:false,
    silPts:[[2,2],[3,1],[4,2],[6,2],[6,6],[2,6]],
    pieces:[
      { pid:'A', color:'#FF9800', ptsWorld:[[2,2],[3,1],[4,2]],       anchor:[2,2] },
      { pid:'B', color:'#FF5252', ptsWorld:[[2,2],[4,2],[4,4],[2,4]], anchor:[2,2] },
      { pid:'C', color:'#2196F3', ptsWorld:[[4,2],[6,2],[6,4],[4,4]], anchor:[4,2] },
      { pid:'D', color:'#4CAF50', ptsWorld:[[2,4],[6,4],[6,6],[2,6]], anchor:[2,4] },
    ] },
  { id:'t3b', name:'Albero', icon:'🌲', phase:3, desc:'4 pezzi · Difficile', noRot:false,
    silPts:[[4,1],[7,5],[5,5],[5,7],[3,7],[3,5],[1,5]],
    pieces:[
      { pid:'A', color:'#4CAF50', ptsWorld:[[4,1],[7,5],[4,3]],       anchor:[4,1] },
      { pid:'B', color:'#2E7D32', ptsWorld:[[4,1],[4,3],[1,5]],       anchor:[4,1] },
      { pid:'C', color:'#66BB6A', ptsWorld:[[1,5],[7,5],[4,5]],       anchor:[1,5] },
      { pid:'D', color:'#795548', ptsWorld:[[3,5],[5,5],[5,7],[3,7]], anchor:[3,5] },
    ] },
  { id:'t3c', name:'Cuore', icon:'❤️', phase:3, desc:'4 pezzi · Difficile', noRot:false,
    silPts:[[4,1],[7,1],[7,4],[4,7],[1,4],[1,1]],
    pieces:[
      { pid:'A', color:'#FF5252', ptsWorld:[[1,1],[4,1],[4,4],[1,4]], anchor:[1,1] },
      { pid:'B', color:'#E91E63', ptsWorld:[[4,1],[7,1],[7,4],[4,4]], anchor:[4,1] },
      { pid:'C', color:'#C62828', ptsWorld:[[1,4],[4,4],[4,7]],       anchor:[1,4] },
      { pid:'D', color:'#FF8A80', ptsWorld:[[7,4],[4,4],[4,7]],       anchor:[7,4] },
    ] },
  { id:'t3d', name:'Razzo', icon:'🚀', phase:3, desc:'5 pezzi · Difficile', noRot:false,
    silPts:[[3,1],[5,1],[6,3],[6,6],[5,7],[3,7],[2,6],[2,3]],
    pieces:[
      { pid:'A', color:'#FF5252', ptsWorld:[[3,1],[5,1],[6,3],[2,3]], anchor:[3,1] },
      { pid:'B', color:'#2196F3', ptsWorld:[[2,3],[4,3],[4,5],[2,5]], anchor:[2,3] },
      { pid:'C', color:'#4CAF50', ptsWorld:[[4,3],[6,3],[6,5],[4,5]], anchor:[4,3] },
      { pid:'D', color:'#FF9800', ptsWorld:[[2,5],[4,5],[3,7],[2,6]], anchor:[2,5] },
      { pid:'E', color:'#9C27B0', ptsWorld:[[4,5],[6,5],[6,6],[5,7],[3,7]], anchor:[4,5] },
    ] },
];

let T = { levelIdx:0, selected:null, hintsLeft:2, errors:0,
          arenaW:300, arenaH:300, U:36, pieceStates:{}, hintShown:false, stars:0 };
let _dragState = null;

function wu(v){ return v*T.U; }
function pxPts(ptsWorld,dx=0,dy=0){ return ptsWorld.map(([x,y])=>[wu(x)+dx,wu(y)+dy]); }
function ptsAttr(pts){ return pts.map(([x,y])=>x+','+y).join(' '); }
function pieceAnchorPx(pid){
  const s=T.pieceStates[pid]; if(!s)return[0,0];
  return[wu(s.ptsWorld[0][0])+(s.placed?0:(s.dx||0)),wu(s.ptsWorld[0][1])+(s.placed?0:(s.dy||0))];
}

function trySnap(pid){
  const level=TANG_LEVELS[T.levelIdx];
  const sol=level.pieces.find(p=>p.pid===pid); if(!sol)return false;
  const state=T.pieceStates[pid];

  // Compute centroid of current piece position (with drag offset)
  const curPts = state.ptsWorld.map(([x,y]) => [wu(x)+(state.dx||0), wu(y)+(state.dy||0)]);
  const cx = curPts.reduce((s,[x])=>s+x,0)/curPts.length;
  const cy = curPts.reduce((s,[,y])=>s+y,0)/curPts.length;

  // Compute centroid of solution
  const solPts = sol.ptsWorld.map(([x,y]) => [wu(x), wu(y)]);
  const sx = solPts.reduce((s,[x])=>s+x,0)/solPts.length;
  const sy = solPts.reduce((s,[,y])=>s+y,0)/solPts.length;

  // Also check rotation match for levels with rotation
  let rotMatch = true;
  if (!level.noRot && curPts.length === solPts.length) {
    // Check if first vertex is close to solution first vertex (shape orientation)
    const v0dist = Math.hypot(curPts[0][0]-solPts[0][0], curPts[0][1]-solPts[0][1]);
    rotMatch = v0dist < wu(SNAP_DIST_U * 1.5);
  }

  if (Math.hypot(cx-sx, cy-sy) < wu(SNAP_DIST_U) && rotMatch) {
    state.dx=0;state.dy=0;state.ptsWorld=sol.ptsWorld.map(p=>[...p]);state.placed=true;state._justPlaced=true;return true;
  }
  return false;
}

function renderTang(){
  const level=TANG_LEVELS[T.levelIdx];
  const svg=document.getElementById('tang-svg'); svg.innerHTML='';

  // Background
  const bg=document.createElementNS('http://www.w3.org/2000/svg','rect');
  bg.setAttribute('width',T.arenaW);bg.setAttribute('height',T.arenaH);bg.setAttribute('fill','transparent');
  bg.addEventListener('pointerdown',()=>{if(!_dragState){T.selected=null;renderTang();}});
  svg.appendChild(bg);

  // Silhouette
  const sil=document.createElementNS('http://www.w3.org/2000/svg','polygon');
  sil.setAttribute('points',ptsAttr(pxPts(level.silPts)));
  sil.setAttribute('fill','color-mix(in srgb, var(--accent) 10%, var(--soft))');sil.setAttribute('stroke','none');
  svg.appendChild(sil);
  const silOut=document.createElementNS('http://www.w3.org/2000/svg','polygon');
  silOut.setAttribute('points',ptsAttr(pxPts(level.silPts)));
  silOut.setAttribute('fill','none');silOut.setAttribute('stroke','var(--accent)');
  silOut.setAttribute('stroke-width','2.5');silOut.setAttribute('stroke-dasharray','7 4');silOut.setAttribute('opacity','.55');
  svg.appendChild(silOut);

  // Hint ghost — show only the single hinted piece (Fix 6)
  if(T.hintShown && T._hintPid) {
    const sol = level.pieces.find(p=>p.pid===T._hintPid);
    if(sol){
      const ghost=document.createElementNS('http://www.w3.org/2000/svg','polygon');
      ghost.setAttribute('points',ptsAttr(pxPts(sol.ptsWorld)));
      ghost.setAttribute('fill',(sol._displayColor||sol.color));ghost.setAttribute('opacity','0.3');
      ghost.setAttribute('stroke',(sol._displayColor||sol.color));ghost.setAttribute('stroke-width','2');
      ghost.setAttribute('stroke-dasharray','5 3');
      ghost.style.animation='tang-near-glow 1s ease-in-out infinite alternate';
      svg.appendChild(ghost);
    }
  }

  // Pieces
  let nearSnap = false; // Fix 5: track if any piece is near its solution
  level.pieces.forEach(sol=>{
    const pid=sol.pid,state=T.pieceStates[pid]; if(!state||state.inTray)return;
    const isDrag=_dragState&&_dragState.pid===pid;
    const pts=pxPts(state.ptsWorld,state.placed?0:(state.dx||0),state.placed?0:(state.dy||0));
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.dataset.pid=pid;
    const poly=document.createElementNS('http://www.w3.org/2000/svg','polygon');
    poly.setAttribute('points',ptsAttr(pts));
    poly.setAttribute('fill',state.placed?(sol._displayColor||sol.color):(sol._displayColor||sol.color)+'cc');
    poly.setAttribute('stroke','#fff');poly.setAttribute('stroke-width','2.5');poly.setAttribute('stroke-linejoin','round');
    if(isDrag) poly.setAttribute('filter','drop-shadow(0 6px 12px rgba(0,0,0,.3))');
    else if(state.placed) poly.setAttribute('filter','drop-shadow(0 2px 4px rgba(0,0,0,.15))');
    if(isDrag) g.style.opacity='0.85';
    // Fix 11: Snap animation — pop effect on just-placed pieces
    if(state.placed && state._justPlaced){
      g.style.animation='tang-snap-pop 0.4s ease-out';
      state._justPlaced=false;
    }

    // Fix 5: Check proximity to solution → glow the target slot
    if (isDrag && !state.placed) {
      const curC = pts.reduce((s,[x])=>s+x,0)/pts.length;
      const curCy = pts.reduce((s,[,y])=>s+y,0)/pts.length;
      const solPts = pxPts(sol.ptsWorld);
      const solCx = solPts.reduce((s,[x])=>s+x,0)/solPts.length;
      const solCy = solPts.reduce((s,[,y])=>s+y,0)/solPts.length;
      if (Math.hypot(curC-solCx, curCy-solCy) < wu(SNAP_DIST_U * 2)) {
        nearSnap = true;
        const glow = document.createElementNS('http://www.w3.org/2000/svg','polygon');
        glow.setAttribute('points',ptsAttr(solPts));
        glow.setAttribute('fill',(sol._displayColor||sol.color));glow.setAttribute('opacity','0.2');
        glow.setAttribute('stroke',(sol._displayColor||sol.color));glow.setAttribute('stroke-width','3');
        glow.style.animation='tang-near-glow 0.8s ease-in-out infinite alternate';
        svg.appendChild(glow);
      }
    }

    g.appendChild(poly);

    // Selection
    if(pid===T.selected&&!state.placed){
      const hl=document.createElementNS('http://www.w3.org/2000/svg','polygon');
      hl.setAttribute('points',ptsAttr(pts));hl.setAttribute('fill','none');
      hl.setAttribute('stroke','#fff');hl.setAttribute('stroke-width','5');hl.setAttribute('opacity','.5');
      svg.appendChild(hl);
    }
    if(!state.placed){g.style.cursor='grab';g.addEventListener('pointerdown',e=>onArenaPointerDown(e,pid));}
    svg.appendChild(g);
  });
  renderTangTray();
}

function renderTangTray(){
  const level=TANG_LEVELS[T.levelIdx],tray=document.getElementById('tang-tray');tray.innerHTML='';
  level.pieces.forEach(sol=>{
    const state=T.pieceStates[sol.pid],sizePx=52;
    const isSelected = T.selected === sol.pid && state?.inTray && !state?.placed;
    const wrap=document.createElement('div');
    wrap.className='tang-tray-piece'+((!state?.inTray||state?.placed)?' used':'')+(isSelected?' selected':'');
    if(isSelected) wrap.style.cssText='box-shadow:0 0 0 3px var(--accent);transform:scale(1.1);';
    const pts=sol.ptsWorld,xs=pts.map(([x])=>x),ys=pts.map(([,y])=>y);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const pw=maxX-minX,ph=maxY-minY,sc=sizePx/Math.max(pw,ph,1)*0.8;
    const ox=(sizePx-pw*sc)/2,oy=(sizePx-ph*sc)/2;
    const svgEl=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svgEl.setAttribute('width',sizePx);svgEl.setAttribute('height',sizePx);
    const poly=document.createElementNS('http://www.w3.org/2000/svg','polygon');
    poly.setAttribute('points',pts.map(([x,y])=>[(x-minX)*sc+ox,(y-minY)*sc+oy]).map(([x,y])=>x+','+y).join(' '));
    poly.setAttribute('fill',(sol._displayColor||sol.color));poly.setAttribute('stroke','#fff');poly.setAttribute('stroke-width','2');poly.setAttribute('stroke-linejoin','round');
    svgEl.appendChild(poly);wrap.appendChild(svgEl);
    if(state?.inTray&&!state?.placed) wrap.addEventListener('pointerdown',e=>onTrayPointerDown(e,sol.pid));
    tray.appendChild(wrap);
  });
  updateTangRotateBtn();
}

/* ── VISIBLE ROTATE BUTTON ── */
function updateTangRotateBtn(){
  let btn=document.getElementById('tang-rotate-action');
  const level=TANG_LEVELS[T.levelIdx];
  const canRotate = !level.noRot;
  const hasSelection = T.selected && T.pieceStates[T.selected] && !T.pieceStates[T.selected].placed;
  if(!btn){
    btn=document.createElement('button');btn.id='tang-rotate-action';
    btn.className='tang-rotate-action-btn';btn.innerHTML='↻ Ruota';
    btn.onclick=()=>{if(T.selected)rotateTangPiece(T.selected);};
    const c=document.querySelector('.tang-controls');if(c)c.prepend(btn);
  }
  // Always visible on rotation levels, but disabled when no piece is selected
  btn.style.display = canRotate ? 'inline-flex' : 'none';
  btn.disabled = !hasSelection;
  btn.style.opacity = hasSelection ? '1' : '0.4';
  btn.title = hasSelection ? 'Ruota il pezzo selezionato' : 'Seleziona un pezzo per ruotarlo';
}

function rotateTangPiece(pid){
  const state=T.pieceStates[pid]; if(!state||state.placed)return; sfxClick();
  const pts=state.ptsWorld.map(([x,y])=>[x+(state.dx||0)/T.U,y+(state.dy||0)/T.U]);
  const cx=pts.reduce((s,[x])=>s+x,0)/pts.length,cy=pts.reduce((s,[,y])=>s+y,0)/pts.length;
  let newPts=pts.map(([x,y])=>[cx+(y-cy),cy-(x-cx)]);
  // F11: clamp to arena bounds (0-8 grid)
  const xs=newPts.map(([x])=>x),ys=newPts.map(([,y])=>y);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  let dx2=0,dy2=0;
  if(minX<0)dx2=-minX; else if(maxX>8)dx2=8-maxX;
  if(minY<0)dy2=-minY; else if(maxY>8)dy2=8-maxY;
  if(dx2||dy2) newPts=newPts.map(([x,y])=>[x+dx2,y+dy2]);
  state.ptsWorld=newPts;state.dx=0;state.dy=0;T.selected=pid;
  if(trySnap(pid)){state.placed=true;T.selected=null;sfxOk();if(typeof mascotReact==='function')mascotReact('happy');spawnFloatStarAt(wu(state.ptsWorld[0][0]),wu(state.ptsWorld[0][1]));checkTangWin();}
  renderTang();
}

function onTrayPointerDown(e,pid){
  e.preventDefault();sfxClick();
  const svg=document.getElementById('tang-svg'),{x,y}=getSVGCoords(e,svg);
  const sol=TANG_LEVELS[T.levelIdx].pieces.find(p=>p.pid===pid),pts=sol.ptsWorld;
  const cx2=pts.reduce((s,[px])=>s+px,0)/pts.length,cy2=pts.reduce((s,[,py])=>s+py,0)/pts.length;
  const dx=x-wu(cx2),dy=y-wu(cy2);
  T.pieceStates[pid]={ptsWorld:pts.map(p=>[...p]),inTray:false,placed:false,dx,dy};
  T.selected=pid;_dragState={pid,startX:x,startY:y,startDx:dx,startDy:dy,hasMoved:false};
  document.addEventListener('pointermove',onGlobalPointerMove,{passive:false});
  document.addEventListener('pointerup',onGlobalPointerUp);renderTang();
}

let _tangLastTapPid = null;
let _tangLastTapTime = 0;

function onArenaPointerDown(e,pid){
  e.preventDefault();const state=T.pieceStates[pid];if(state?.placed)return;
  sfxClick();T.selected=pid;
  
  // Double-tap detection for rotation
  const now = Date.now();
  const level = TANG_LEVELS[T.levelIdx];
  if(!level.noRot && _tangLastTapPid === pid && now - _tangLastTapTime < 400){
    // Double tap — rotate
    _tangLastTapPid = null; _tangLastTapTime = 0;
    rotateTangPiece(pid);
    return;
  }
  _tangLastTapPid = pid;
  _tangLastTapTime = now;
  
  const svg=document.getElementById('tang-svg'),{x,y}=getSVGCoords(e,svg);
  _dragState={pid,startX:x,startY:y,startDx:state.dx||0,startDy:state.dy||0,hasMoved:false};
  document.addEventListener('pointermove',onGlobalPointerMove,{passive:false});
  document.addEventListener('pointerup',onGlobalPointerUp);renderTang();
}

function onGlobalPointerMove(e){
  e.preventDefault();if(!_dragState)return;
  const svg=document.getElementById('tang-svg'),{x,y}=getSVGCoords(e,svg);
  const dx=x-_dragState.startX,dy=y-_dragState.startY;
  if(Math.abs(dx)>3||Math.abs(dy)>3)_dragState.hasMoved=true;
  const state=T.pieceStates[_dragState.pid];
  state.dx=_dragState.startDx+dx;
  state.dy=_dragState.startDy+dy;
  // D02: update only the dragged polygon instead of full SVG rebuild
  const g=svg.querySelector(`[data-pid="${_dragState.pid}"]`);
  if(g){
    const poly=g.querySelector('polygon');
    if(poly){
      const pts=pxPts(state.ptsWorld,state.dx,state.dy);
      poly.setAttribute('points',ptsAttr(pts));
    }
    // Also update selection highlight if present
    const hl=svg.querySelector(`polygon[data-hl="${_dragState.pid}"]`);
    if(hl){
      const pts=pxPts(state.ptsWorld,state.dx,state.dy);
      hl.setAttribute('points',ptsAttr(pts));
    }
  } else {
    renderTang(); // fallback: full rebuild if element not found
  }
}

function onGlobalPointerUp(){
  document.removeEventListener('pointermove',onGlobalPointerMove);
  document.removeEventListener('pointerup',onGlobalPointerUp);
  if(!_dragState)return;
  const pid=_dragState.pid;
  const hasMoved=_dragState.hasMoved;
  _dragState=null;
  if(trySnap(pid)){
    T.pieceStates[pid].placed=true;T.selected=null;sfxOk();
    if(typeof mascotReact==='function')mascotReact('happy');
    const[ax,ay]=pieceAnchorPx(pid);spawnFloatStarAt(ax,ay);checkTangWin();
  } else {
    T.selected=pid;
    // Fix 7: Count error if piece was dragged meaningfully and dropped inside the silhouette area
    if(hasMoved){
      const state=T.pieceStates[pid];
      const level=TANG_LEVELS[T.levelIdx];
      const curPts=state.ptsWorld.map(([x,y])=>[wu(x)+(state.dx||0),wu(y)+(state.dy||0)]);
      const cx=curPts.reduce((s,[x])=>s+x,0)/curPts.length;
      const cy=curPts.reduce((s,[,y])=>s+y,0)/curPts.length;
      const silPx=pxPts(level.silPts);
      if(pointInPolygon(cx,cy,silPx)){
        T.errors++;
        sfxErr();
        if(typeof mascotReact==='function')mascotReact('sad');
      }
    }
  }
  renderTang();
}

/* Fix 7: Point-in-polygon test (ray casting) */
function pointInPolygon(px,py,poly){
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const[xi,yi]=poly[i],[xj,yj]=poly[j];
    if(((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi))inside=!inside;
  }
  return inside;
}

function getSVGCoords(e,svg){
  const rect=svg.getBoundingClientRect();
  const cx=e.touches?e.touches[0].clientX:e.clientX,cy=e.touches?e.touches[0].clientY:e.clientY;
  return{x:cx-rect.left,y:cy-rect.top};
}

function checkTangWin(){
  const level=TANG_LEVELS[T.levelIdx];
  if(!level.pieces.every(p=>T.pieceStates[p.pid]?.placed))return;
  setTimeout(showTangWin,350);
}
function showTangWin(){
  // Base implementation — monkey-patched by themes.js for world integration
  // Keep as stub: the patch replaces this entirely
  sfxWin();spawnConfetti();
  const earned=Math.max(1,3-T.errors);
  document.getElementById('tang-stars').textContent=P.stars;
  const em=['🎉','🌟','✨','🎊'],ti=['Perfetto!','Bravo!','Fantastico!','Super!'];
  document.getElementById('tang-cel-em').textContent=em[rnd(em.length)];
  document.getElementById('tang-cel-title').textContent=ti[rnd(ti.length)];
  document.getElementById('tang-cel-stars').textContent='⭐ +'+earned+' stelle!';
  const isLast=T.levelIdx>=TANG_LEVELS.length-1;
  const btn=document.getElementById('tang-next-btn');
  btn.textContent=isLast?'Torna alla mappa 🗺️':'Avanti! →';
  btn.onclick=isLast?()=>{closeTangComplete();updateMap();show('s-map');}:()=>{closeTangComplete();startTangLevel(T.levelIdx+1);};
  document.getElementById('tang-complete').classList.add('show');
}
function closeTangComplete(){document.getElementById('tang-complete').classList.remove('show');}

function useTangHint(){
  if(T.hintsLeft<=0)return;
  const level=TANG_LEVELS[T.levelIdx];
  // Find unplaced pieces, pick the one with fewest vertices (simplest shape)
  const unplaced = level.pieces.filter(p => {
    const st = T.pieceStates[p.pid];
    return st && !st.placed;
  });
  if(unplaced.length===0) return;
  // Sort by number of vertices (fewer = simpler = easier to place)
  unplaced.sort((a,b) => a.ptsWorld.length - b.ptsWorld.length);
  T._hintPid = unplaced[0].pid;
  T.hintsLeft--;updateTangHintBtn();sfxHint();
  T.hintShown=true;renderTang();
  setTimeout(()=>{T.hintShown=false;T._hintPid=null;renderTang();},4000);
}
function updateTangHintBtn(){
  document.getElementById('tang-hint-lbl').textContent=T.hintsLeft>0?'Aiuto ('+T.hintsLeft+')':'Nessun aiuto';
  document.getElementById('tang-hint-btn').classList.toggle('off',T.hintsLeft<=0);
}
function spawnFloatStarAt(px,py){
  const svgR=document.getElementById('tang-svg').getBoundingClientRect();
  const el=document.createElement('div');el.className='float-star';el.textContent='✨';
  el.style.left=(svgR.left+px-10)+'px';el.style.top=(svgR.top+py-10)+'px';
  document.body.appendChild(el);setTimeout(()=>el.remove(),1300);
}
function resetTangLevel(){sfxClick();startTangLevel(T.levelIdx);}

function startTangLevel(idx){
  if(idx>=TANG_LEVELS.length)idx=TANG_LEVELS.length-1;
  const level=TANG_LEVELS[idx];T.levelIdx=idx;T.selected=null;T.hintsLeft=2;T.errors=0;T.hintShown=false;T._hintPid=null;T.pieceStates={};_dragState=null;

  // Fix 1: Apply game palette colors to pieces
  const nPieces = level.pieces.length;
  const paletteSizes = [2,3,4,6,9];
  const bestSize = paletteSizes.find(s => s >= nPieces) || 9;
  const gameColors = (typeof SYMS !== 'undefined' && SYMS.colors[bestSize]) || TANG_PROC_COLORS;
  level.pieces.forEach((sol, i) => { sol._displayColor = gameColors[i % gameColors.length]; });

  const bodyEl=document.getElementById('s-tang'),br=bodyEl.getBoundingClientRect();
  // Determine grid unit size from level — procedural levels may use grids up to 10
  const gridUnits = level._gridUnits || 8; // default 8 for predefined levels
  const maxArena = Math.min(br.width-24, br.height-190, 400);
  const sz = Math.max(160, Math.floor(maxArena));
  T.arenaW=T.arenaH=sz; T.U=sz/gridUnits;
  const arena=document.getElementById('tang-arena');arena.style.width=arena.style.height=sz+'px';
  arena.style.touchAction='none';
  const svgEl=document.getElementById('tang-svg');svgEl.setAttribute('width',sz);svgEl.setAttribute('height',sz);
  svgEl.setAttribute('viewBox','0 0 '+sz+' '+sz);svgEl.style.touchAction='none';
  level.pieces.forEach(sol=>{T.pieceStates[sol.pid]={ptsWorld:sol.ptsWorld.map(p=>[...p]),inTray:true,placed:false,dx:0,dy:0};});
  document.getElementById('tang-cat-icon').textContent=level.icon;
  document.getElementById('tang-level-nm').textContent=level.name;
  document.getElementById('tang-level-pg').textContent=level.desc || ('Livello '+(idx+1));
  document.getElementById('tang-stars').textContent=P.stars;
  const hintDiv=document.querySelector('.tang-controls div:last-child');
  if(hintDiv){hintDiv.style.display=level.noRot?'none':'block';if(!level.noRot)hintDiv.textContent='💡 Seleziona un pezzo e premi Ruota';}
  updateTangHintBtn();closeTangComplete();renderTang();
}

function openTangram(){sfxClick();show('s-tang');setTimeout(()=>startTangLevel(T.levelIdx||0),80);}

document.getElementById('btn-tang-map').onclick=openTangram;
document.getElementById('btn-tang-back').onclick=()=>{
  // PE09: cleanup any dangling drag listeners
  document.removeEventListener('pointermove',onGlobalPointerMove);
  document.removeEventListener('pointerup',onGlobalPointerUp);
  _dragState=null;
  gameBackToMap('tangram');
};
document.getElementById('tang-hint-btn').onclick=useTangHint;
document.getElementById('tang-reset-btn').onclick=resetTangLevel;
const _tangSoundBtn = document.getElementById('tang-sound-btn');
if (_tangSoundBtn) _tangSoundBtn.onclick = toggleSound;

/* ══════════════════════════════════════════
   PROCEDURAL TANGRAM GENERATOR
   Generates random tangram puzzles with N pieces on an 8×8 grid
   using polyomino-based piece placement
══════════════════════════════════════════ */

const TANG_PIECE_TEMPLATES = [
  // Dominoes (2 cells)
  { cells:[[0,0],[1,0]], name:'domino-h' },
  { cells:[[0,0],[0,1]], name:'domino-v' },
  // Triominoes (3 cells) 
  { cells:[[0,0],[1,0],[2,0]], name:'tri-h' },
  { cells:[[0,0],[0,1],[0,2]], name:'tri-v' },
  { cells:[[0,0],[1,0],[0,1]], name:'tri-L' },
  { cells:[[0,0],[1,0],[1,1]], name:'tri-r' },
  // Tetrominoes (4 cells)
  { cells:[[0,0],[1,0],[2,0],[3,0]], name:'tet-I' },
  { cells:[[0,0],[1,0],[0,1],[1,1]], name:'tet-O' },
  { cells:[[0,0],[1,0],[1,1],[2,1]], name:'tet-S' },
  { cells:[[0,0],[1,0],[2,0],[0,1]], name:'tet-L' },
  { cells:[[0,0],[1,0],[2,0],[1,1]], name:'tet-T' },
  // Pentominoes (5 cells) — adds variety for harder levels
  { cells:[[0,0],[1,0],[2,0],[3,0],[4,0]], name:'pent-I' },
  { cells:[[0,0],[1,0],[2,0],[2,1],[3,1]], name:'pent-N' },
  { cells:[[0,0],[1,0],[1,1],[2,1],[2,2]], name:'pent-Z' },
  { cells:[[0,0],[1,0],[2,0],[0,1],[0,2]], name:'pent-V' },
];

const TANG_PROC_COLORS = ['#FF5252','#2196F3','#4CAF50','#FF9800','#9C27B0','#00BCD4','#E91E63','#CDDC39'];
const TANG_PROC_NAMES = ['Mistero','Creazione','Invenzione','Fantasia','Magia','Scoperta','Avventura','Sorpresa',
  'Arcobaleno','Stella','Fulmine','Fiore','Cristallo','Cometa','Tesoro','Diamante'];
const TANG_PROC_ICONS = ['🎲','🎯','🌈','⭐','🎨','🔮','💎','🌟','✨','🎪'];

function generateProceduralTangram(seed, numPieces) {
  // Seeded RNG
  let s = (seed * 2654435761 + 1013904223) >>> 0;
  const rng = () => { s = (s * 1103515245 + 12345) >>> 0; return (s >>> 16) / 65536; };
  const rndInt = (n) => Math.floor(rng() * n);
  const shuffleArr = (arr) => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=rndInt(i+1);[a[i],a[j]]=[a[j],a[i]];} return a; };

  // Grid size and piece count scale with numPieces
  // Phase 0: 4×4 grid, 2-3 pieces | Phase 1: 6×6, 4-6 | Phase 2: 8×8, 6-10 | Phase 3: 10×10, 8-15
  let gridSize, maxPieces;
  if (numPieces <= 3)       { gridSize = 4;  maxPieces = numPieces; }
  else if (numPieces <= 6)  { gridSize = 6;  maxPieces = numPieces; }
  else if (numPieces <= 10) { gridSize = 8;  maxPieces = numPieces; }
  else                      { gridSize = 10; maxPieces = Math.min(numPieces, 15); }

  const occupied = Array.from({length:gridSize}, () => Array(gridSize).fill(false));
  const pieces = [];

  // Place pieces one by one
  for (let p = 0; p < maxPieces && p < 15; p++) {
    const templates = shuffleArr(TANG_PIECE_TEMPLATES);
    let placed = false;
    
    for (const tmpl of templates) {
      const positions = [];
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          positions.push([r, c]);
        }
      }
      const shuffledPos = shuffleArr(positions);
      
      for (const [startR, startC] of shuffledPos) {
        const cells = tmpl.cells.map(([dr, dc]) => [startR + dr, startC + dc]);
        const valid = cells.every(([r, c]) => 
          r >= 0 && r < gridSize && c >= 0 && c < gridSize && !occupied[r][c]
        );
        if (!valid) continue;
        
        // Adjacency check (except first piece)
        if (pieces.length > 0) {
          const adjacent = cells.some(([r, c]) => {
            return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].some(([nr,nc]) => 
              nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && occupied[nr][nc]
            );
          });
          if (!adjacent) continue;
        }
        
        cells.forEach(([r, c]) => occupied[r][c] = true);
        
        // Convert to world coords — center in 8×8 arena
        const offset = Math.max(0, Math.floor((8 - gridSize) / 2));
        const worldCells = cells.map(([r, c]) => [c + offset, r + offset]);
        const polygon = cellsToPolygon(worldCells);
        
        pieces.push({
          pid: String.fromCharCode(65 + p),
          color: TANG_PROC_COLORS[p % TANG_PROC_COLORS.length],
          ptsWorld: polygon,
          anchor: polygon[0],
          _cells: worldCells,
        });
        placed = true;
        break;
      }
      if (placed) break;
    }
  }
  
  if (pieces.length < 2) {
    return TANG_LEVELS[rndInt(4)]; // fallback to predefined
  }
  
  // Fix 12: Validate — reject if any two pieces have identical shape (same template+size)
  const shapeKeys = pieces.map(p => {
    const poly = p.ptsWorld;
    const xs = poly.map(([x])=>x), ys = poly.map(([,y])=>y);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    return poly.map(([x,y])=>[(x-minX),(y-minY)]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]).join('|');
  });
  const uniqueShapes = new Set(shapeKeys);
  if (uniqueShapes.size < Math.ceil(pieces.length * 0.6)) {
    // Too many identical pieces — reject
    return TANG_LEVELS[rndInt(4)];
  }

  const allCells = pieces.flatMap(p => p._cells);
  // Fix 12: Reject if silhouette is too small or too linear
  if (allCells.length < pieces.length * 2) {
    return TANG_LEVELS[rndInt(4)];
  }
  
  const silhouette = cellsToPolygon(allCells);
  pieces.forEach(p => delete p._cells);
  
  const nameIdx = seed % TANG_PROC_NAMES.length;
  const iconIdx = seed % TANG_PROC_ICONS.length;
  
  return {
    id: 'tproc_' + seed,
    name: TANG_PROC_NAMES[nameIdx],
    icon: TANG_PROC_ICONS[iconIdx],
    phase: numPieces <= 3 ? 0 : numPieces <= 6 ? 1 : numPieces <= 10 ? 2 : 3,
    desc: pieces.length + ' pezzi',
    noRot: numPieces <= 3,
    silPts: silhouette,
    pieces: pieces,
    _gridUnits: Math.max(8, gridSize), // arena units — at least 8 for predefined, larger for big procedural
  };
}

/* Convert a set of unit cells [[x,y],...] into an outer boundary polygon */
function cellsToPolygon(cells) {
  // Simple approach: collect all boundary edges, then chain them
  // Each cell [x,y] occupies the unit square from (x,y) to (x+1,y+1)
  const cellSet = new Set(cells.map(([x,y]) => x+','+y));
  const edges = [];
  
  cells.forEach(([x, y]) => {
    // Top edge: if no cell above
    if (!cellSet.has(x+','+(y-1))) edges.push([x,y,x+1,y]);
    // Bottom edge: if no cell below
    if (!cellSet.has(x+','+(y+1))) edges.push([x+1,y+1,x,y+1]);
    // Left edge: if no cell left
    if (!cellSet.has((x-1)+','+y)) edges.push([x,y+1,x,y]);
    // Right edge: if no cell right
    if (!cellSet.has((x+1)+','+y)) edges.push([x+1,y,x+1,y+1]);
  });
  
  if (edges.length === 0) return [[0,0],[8,0],[8,8],[0,8]];
  
  // Build adjacency: from each endpoint, find outgoing edges
  const adj = {};
  edges.forEach(([x1,y1,x2,y2]) => {
    const key = x1+','+y1;
    if (!adj[key]) adj[key] = [];
    adj[key].push([x2,y2]);
  });
  
  // Walk the boundary starting from the top-left-most edge
  const pts = [];
  let [cx, cy] = [edges[0][0], edges[0][1]];
  const startKey = cx+','+cy;
  const visited = new Set();
  
  for (let safety = 0; safety < edges.length + 2; safety++) {
    pts.push([cx, cy]);
    const key = cx+','+cy;
    const nexts = adj[key];
    if (!nexts || nexts.length === 0) break;
    
    // Pick first unvisited neighbor
    let found = false;
    for (let i = 0; i < nexts.length; i++) {
      const edgeId = key + '->' + nexts[i][0] + ',' + nexts[i][1];
      if (!visited.has(edgeId)) {
        visited.add(edgeId);
        [cx, cy] = nexts[i];
        found = true;
        break;
      }
    }
    if (!found) break;
    if (cx === pts[0][0] && cy === pts[0][1]) break; // closed loop
  }
  
  // Simplify collinear points
  const simplified = [];
  for (let i = 0; i < pts.length; i++) {
    const prev = pts[(i - 1 + pts.length) % pts.length];
    const curr = pts[i];
    const next = pts[(i + 1) % pts.length];
    const dx1 = curr[0] - prev[0], dy1 = curr[1] - prev[1];
    const dx2 = next[0] - curr[0], dy2 = next[1] - curr[1];
    if (dx1 * dy2 !== dx2 * dy1) simplified.push(curr); // not collinear
  }
  
  return simplified.length >= 3 ? simplified : pts.length >= 3 ? pts : [[0,0],[8,0],[8,8],[0,8]];
}
