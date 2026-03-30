/* ══════════════════════════════════════════
   SUDOKU ENGINE
══════════════════════════════════════════ */
/* Box dims helper — works for 2,3,4,6,9 */
function boxDims(sz){
  if(sz===2) return{BR:1,BC:2};
  if(sz===3) return{BR:1,BC:3};
  if(sz===4) return{BR:2,BC:2};
  if(sz===6) return{BR:2,BC:3};
  return{BR:3,BC:3}; // 9
}

function genGrid(sz){
  // PE10: For 9×9, use band-permutation for O(1) generation
  if(sz===9) return genGrid9Fast();
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
      for(const n of shuffle([...Array(sz)].map((_,i)=>i+1))){
        if(ok(g,r,c,n)){g[r][c]=n;if(fill(g))return true;g[r][c]=0;}
      }return false;
    }return true;
  }
  fill(g);return g;
}
function genGrid9Fast(){
  // Start from a valid base grid, then shuffle rows/cols within bands
  const base=[[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],
              [2,3,1,5,6,4,8,9,7],[5,6,4,8,9,7,2,3,1],[8,9,7,2,3,1,5,6,4],
              [3,1,2,6,4,5,9,7,8],[6,4,5,9,7,8,3,1,2],[9,7,8,3,1,2,6,4,5]];
  const g=base.map(r=>[...r]);
  // Shuffle numbers (relabel)
  const perm=shuffle([1,2,3,4,5,6,7,8,9]);
  for(let r=0;r<9;r++)for(let c=0;c<9;c++) g[r][c]=perm[g[r][c]-1];
  // Shuffle rows within each band of 3
  for(let band=0;band<3;band++){
    const rows=shuffle([0,1,2]);
    const tmp=[g[band*3+rows[0]],g[band*3+rows[1]],g[band*3+rows[2]]];
    g[band*3]=tmp[0];g[band*3+1]=tmp[1];g[band*3+2]=tmp[2];
  }
  // Shuffle cols within each stack of 3
  for(let stack=0;stack<3;stack++){
    const cols=shuffle([0,1,2]);
    for(let r=0;r<9;r++){
      const tmp=[g[r][stack*3+cols[0]],g[r][stack*3+cols[1]],g[r][stack*3+cols[2]]];
      g[r][stack*3]=tmp[0];g[r][stack*3+1]=tmp[1];g[r][stack*3+2]=tmp[2];
    }
  }
  // Shuffle bands
  const bands=shuffle([0,1,2]);
  const result=[];
  bands.forEach(b=>{for(let i=0;i<3;i++)result.push(g[b*3+i]);});
  return result;
}

function countSols(board,sz,lim=2){
  // For 9×9 use fast constraint propagation instead of full backtrack
  if(sz===9) return countSols9(board,lim);
  const {BR,BC}=boxDims(sz);
  function ok(b,r,c,n){
    for(let i=0;i<sz;i++)if(b[r][i]===n||b[i][c]===n)return false;
    const br=Math.floor(r/BR)*BR,bc=Math.floor(c/BC)*BC;
    for(let i=0;i<BR;i++)for(let j=0;j<BC;j++)if(b[br+i][bc+j]===n)return false;
    return true;
  }
  let cnt=0;
  function bt(b){
    if(cnt>=lim)return;
    for(let r=0;r<sz;r++)for(let c=0;c<sz;c++){
      if(b[r][c])continue;
      for(let n=1;n<=sz;n++){if(ok(b,r,c,n)){b[r][c]=n;bt(b);b[r][c]=0;if(cnt>=lim)return;}}
      return;
    }cnt++;
  }
  bt(board.map(r=>[...r]));return cnt;
}

/* Fast 9×9 solver using minimum-remaining-values heuristic */
function countSols9(board,lim=2){
  const b=board.map(r=>[...r]);
  let cnt=0;
  function possible(b,r,c){
    const used=new Set();
    for(let i=0;i<9;i++){used.add(b[r][i]);used.add(b[i][c]);}
    const br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)used.add(b[br+i][bc+j]);
    return[1,2,3,4,5,6,7,8,9].filter(n=>!used.has(n));
  }
  function bt(b){
    if(cnt>=lim)return;
    // find cell with fewest possibilities (MRV)
    let best=null,bestLen=10;
    for(let r=0;r<9;r++)for(let c=0;c<9;c++){
      if(b[r][c])continue;
      const p=possible(b,r,c);
      if(p.length===0)return; // dead end
      if(p.length<bestLen){bestLen=p.length;best={r,c,p};}
    }
    if(!best){cnt++;return;} // all filled
    const{r,c,p}=best;
    for(const n of p){b[r][c]=n;bt(b);b[r][c]=0;if(cnt>=lim)return;}
  }
  bt(b);return cnt;
}

function makePuzzle(sz,diff){
  const solution=genGrid(sz);
  const tgt={
    easy:  sz===2?3  :sz===3?7  :sz===4?13:sz===6?30:sz===9?51:13,
    medium:sz===2?2  :sz===3?6  :sz===4?10:sz===6?26:sz===9?36:10,
    hard:  sz===2?2  :sz===3?5  :sz===4?8 :sz===6?22:sz===9?28:8,
  }[diff]||Math.floor(sz*sz*0.55);
  const total=sz*sz;
  const board=solution.map(r=>[...r]);
  const given=new Set([...Array(total)].map((_,i)=>i));
  // For 9×9 use a smarter removal order (symmetric pairs for aesthetics)
  const order = sz===9 ? symmetricOrder9() : shuffle([...Array(total)].map((_,i)=>i));
  for(const pos of order){
    if(total-given.size>=total-tgt)break;
    const r=Math.floor(pos/sz),c=pos%sz;
    const bk=board[r][c];board[r][c]=0;
    // mirror removal for 9×9 (keeps grid balanced)
    const mirrorPos=sz===9?(sz*sz-1-pos):-1;
    // F01: skip mirror if it's the same cell (center of 9×9)
    const hasMirror = mirrorPos>=0 && mirrorPos!==pos && given.has(mirrorPos);
    const mirBk=hasMirror?board[Math.floor(mirrorPos/sz)][mirrorPos%sz]:null;
    if(hasMirror)board[Math.floor(mirrorPos/sz)][mirrorPos%sz]=0;
    if(countSols(board,sz)===1){
      given.delete(pos);
      if(hasMirror)given.delete(mirrorPos);
    }else{
      board[r][c]=bk;
      if(hasMirror)board[Math.floor(mirrorPos/sz)][mirrorPos%sz]=mirBk;
    }
  }
  return{solution,board,given};
}

function symmetricOrder9(){
  // Returns positions from center outward for aesthetic symmetric removal
  const all=[...Array(81)].map((_,i)=>i);
  const center=40;
  return shuffle(all).sort((a,b)=>{
    const da=Math.abs(Math.floor(a/9)-4)+Math.abs(a%9-4);
    const db=Math.abs(Math.floor(b/9)-4)+Math.abs(b%9-4);
    return da-db;
  });
}
function buildRepSteps(solution,givenSet,sz){
  const{BR,BC}=boxDims(sz);
  const board=Array.from({length:sz},()=>Array(sz).fill(0));
  givenSet.forEach(pos=>{const r=Math.floor(pos/sz),c=pos%sz;board[r][c]=solution[r][c];});
  const steps=[];const placed=new Set([...givenSet]);
  let changed=true;
  while(placed.size<sz*sz&&changed){
    changed=false;
    for(let r=0;r<sz;r++)for(let c=0;c<sz;c++){
      const pos=r*sz+c;if(placed.has(pos))continue;
      const used=new Set();
      for(let i=0;i<sz;i++){used.add(board[r][i]);used.add(board[i][c]);}
      const br=Math.floor(r/BR)*BR,bc=Math.floor(c/BC)*BC;
      for(let i=0;i<BR;i++)for(let j=0;j<BC;j++)used.add(board[br+i][bc+j]);
      const poss=[...Array(sz)].map((_,i)=>i+1).filter(n=>!used.has(n));
      if(poss.length===1){board[r][c]=solution[r][c];placed.add(pos);
        const symNames={colors:['🔴','🔵','🟡','🟢','🟠','🟣'],shapes:['●','■','▲','♦','★','⬟'],animals:['🐶','🐱','🐸','🐰','🐻','🦊'],numbers:['1','2','3','4','5','6']};
        const syms=(symNames[P?.symTheme]||symNames.colors);
        const symName=syms[solution[r][c]-1]||solution[r][c];
        const filledInRow=board[r].filter(v=>v).length;
        const filledInCol=[...Array(sz)].map((_,rr)=>board[rr][c]).filter(v=>v).length;
        let reason;
        if(filledInRow>=sz) reason=`Riga ${r+1}: tutti i posti sono pieni! L'ultimo è ${symName}`;
        else if(filledInCol>=sz) reason=`Colonna ${c+1}: completa! Qui va ${symName}`;
        else if(filledInRow===sz-1) reason=`Riga ${r+1}: manca solo ${symName}! Gli altri ci sono già`;
        else if(filledInCol===sz-1) reason=`Colonna ${c+1}: manca solo ${symName}!`;
        else reason=`Riga ${r+1} + Colonna ${c+1}: l'unico possibile è ${symName}`;
        steps.push({pos,val:solution[r][c],r,c,reason});changed=true;}
    }
  }
  for(let r=0;r<sz;r++)for(let c=0;c<sz;c++){const pos=r*sz+c;if(!placed.has(pos))steps.push({pos,val:solution[r][c],r,c,reason:'Completato!'});}
  return steps;
}