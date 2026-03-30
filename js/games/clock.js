/* ══════════════════════════════════════════
   CLOCK GAME ENGINE v2
   Big colorful clock, easy drag interaction
══════════════════════════════════════════ */

const CLK = {
  targetH: 0, targetM: 0,
  currentH: 12, currentM: 0,
  dragging: null,
  score: 0, total: 0,
  diff: 'hours', streak: 0,
};

const CLK_DIFFS = {
  hours:   { name:'Ore intere',    snap:60, choices:[0] },
  half:    { name:'Mezz\'ore',     snap:30, choices:[0,30] },
  quarter: { name:'Quarti d\'ora', snap:15, choices:[0,15,30,45] },
  fivemin: { name:'5 minuti',      snap:5,  choices:null },
};

function clkColors(){
  const p = (typeof PALS!=='undefined'&&typeof P!=='undefined'&&PALS[P.palette]) ? PALS[P.palette].colors : ['#FF5252','#2196F3','#FF9800','#9C27B0'];
  return { hour:p[0]||'#FF5252', minute:p[1]||'#2196F3', accent:p[2]||'#FF9800', ring:p[3]||'#9C27B0' };
}

/* ── New puzzle ── */
function clockNewPuzzle(){
  const cfg = CLK_DIFFS[CLK.diff];
  CLK.targetH = Math.floor(Math.random()*12);
  CLK.targetM = cfg.choices ? cfg.choices[Math.floor(Math.random()*cfg.choices.length)]
                            : Math.floor(Math.random()*12)*cfg.snap;
  CLK.currentH = 12; CLK.currentM = 0; CLK.total++;

  const h = CLK.targetH===0?12:CLK.targetH;
  document.getElementById('clock-prompt').textContent =
    String(h).padStart(2,'0')+':'+String(CLK.targetM).padStart(2,'0');
  document.getElementById('clock-score').textContent = CLK.score;
  document.getElementById('clock-total').textContent = CLK.total;
  const fb = document.getElementById('clock-feedback');
  fb.textContent = ''; fb.className = 'clock-feedback';
  document.getElementById('clock-check-btn').disabled = false;
  drawClock();
}

/* ── Canvas coords (CSS-scaled) ── */
function clkXY(e){
  const c = document.getElementById('clock-canvas');
  const r = c.getBoundingClientRect();
  const cx = e.touches ? e.touches[0].clientX : e.clientX;
  const cy = e.touches ? e.touches[0].clientY : e.clientY;
  return { x:(cx-r.left)*(c.width/r.width), y:(cy-r.top)*(c.height/r.height) };
}
function clkAngle(e){
  const {x,y}=clkXY(e);
  const c=document.getElementById('clock-canvas');
  return Math.atan2(y-c.height/2, x-c.width/2)+Math.PI/2;
}
function angToMin(a, snap){
  let d=((a*180/Math.PI)%360+360)%360, m=Math.round(d/360*60);
  if(m>=60)m=0; if(snap>1){m=Math.round(m/snap)*snap;if(m>=60)m=0;} return m;
}
function angToHour(a){
  let d=((a*180/Math.PI)%360+360)%360, h=Math.round(d/360*12);
  return h>=12?0:h;
}

/* ── Draw clock ── */
function drawClock(){
  const canvas=document.getElementById('clock-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const sz=canvas.width, cx=sz/2, cy=sz/2, R=sz/2-18;
  const C=clkColors();
  ctx.clearRect(0,0,sz,sz);

  // Outer ring
  ctx.beginPath();ctx.arc(cx,cy,R+10,0,Math.PI*2);
  ctx.fillStyle=C.ring+'18';ctx.fill();
  ctx.strokeStyle=C.ring;ctx.lineWidth=4;ctx.stroke();

  // Face
  ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);
  ctx.fillStyle='#fff';ctx.fill();
  ctx.strokeStyle='#e0e0e0';ctx.lineWidth=2;ctx.stroke();

  // Minute dots
  for(let i=0;i<60;i++){
    if(i%5===0)continue;
    const a=i/60*Math.PI*2-Math.PI/2;
    ctx.beginPath();ctx.arc(cx+Math.cos(a)*(R-10),cy+Math.sin(a)*(R-10),1.5,0,Math.PI*2);
    ctx.fillStyle='#ccc';ctx.fill();
  }

  // Hour markers + numbers
  const fSz=Math.round(sz*0.07);
  ctx.font=`bold ${fSz}px 'Fredoka One',cursive`;
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(let i=1;i<=12;i++){
    const a=i/12*Math.PI*2-Math.PI/2;
    const q=i%3===0;
    // dot
    ctx.beginPath();ctx.arc(cx+Math.cos(a)*(R-10),cy+Math.sin(a)*(R-10),q?5:3,0,Math.PI*2);
    ctx.fillStyle=q?C.ring:'#aaa';ctx.fill();
    // number
    ctx.fillStyle='#333';
    ctx.fillText(i,cx+Math.cos(a)*(R-30),cy+Math.sin(a)*(R-30));
  }

  // ── Minute hand (longer, blue) ──
  const mA=(CLK.currentM/60)*Math.PI*2-Math.PI/2;
  const mL=R-24;
  const mDrag=CLK.dragging==='minute';
  // glow
  if(mDrag){ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(mA)*mL,cy+Math.sin(mA)*mL);
    ctx.strokeStyle=C.minute+'30';ctx.lineWidth=30;ctx.lineCap='round';ctx.stroke();}
  // body
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(mA)*mL,cy+Math.sin(mA)*mL);
  ctx.strokeStyle=mDrag?C.minute:C.minute+'cc';ctx.lineWidth=mDrag?8:6;ctx.lineCap='round';ctx.stroke();
  // grab handle
  ctx.beginPath();ctx.arc(cx+Math.cos(mA)*mL,cy+Math.sin(mA)*mL,mDrag?14:10,0,Math.PI*2);
  ctx.fillStyle=C.minute;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.stroke();

  // ── Hour hand (shorter, red, thicker) ──
  const hF=CLK.currentH+CLK.currentM/60;
  const hA=hF/12*Math.PI*2-Math.PI/2;
  const hL=R*0.48;
  const hDrag=CLK.dragging==='hour';
  if(hDrag){ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(hA)*hL,cy+Math.sin(hA)*hL);
    ctx.strokeStyle=C.hour+'30';ctx.lineWidth=34;ctx.lineCap='round';ctx.stroke();}
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(hA)*hL,cy+Math.sin(hA)*hL);
  ctx.strokeStyle=hDrag?C.hour:C.hour+'cc';ctx.lineWidth=hDrag?11:9;ctx.lineCap='round';ctx.stroke();
  ctx.beginPath();ctx.arc(cx+Math.cos(hA)*hL,cy+Math.sin(hA)*hL,hDrag?16:12,0,Math.PI*2);
  ctx.fillStyle=C.hour;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.stroke();

  // Center
  ctx.beginPath();ctx.arc(cx,cy,9,0,Math.PI*2);ctx.fillStyle='#333';ctx.fill();
  ctx.beginPath();ctx.arc(cx,cy,4,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();

  // Legend
  const ly=sz-8;
  ctx.font=`bold ${Math.round(sz*0.04)}px sans-serif`;ctx.textAlign='center';
  ctx.fillStyle=C.hour;ctx.fillText('● Ore',cx-44,ly);
  ctx.fillStyle=C.minute;ctx.fillText('● Minuti',cx+44,ly);
}

/* ── Pointer events — tip proximity detection ── */
function clockOnDown(e){
  e.preventDefault();
  const {x,y}=clkXY(e);
  const c=document.getElementById('clock-canvas');
  const sz=c.width,cx=sz/2,cy=sz/2,R=sz/2-18;

  // Minute tip
  const mA=(CLK.currentM/60)*Math.PI*2-Math.PI/2, mL=R-24;
  const mTx=cx+Math.cos(mA)*mL,mTy=cy+Math.sin(mA)*mL;
  const mD=Math.hypot(x-mTx,y-mTy);

  // Hour tip
  const hF=CLK.currentH+CLK.currentM/60;
  const hA=hF/12*Math.PI*2-Math.PI/2, hL=R*0.48;
  const hTx=cx+Math.cos(hA)*hL,hTy=cy+Math.sin(hA)*hL;
  const hD=Math.hypot(x-hTx,y-hTy);

  const hitZone=44; // generous touch target
  if(mD<hD && mD<hitZone) CLK.dragging='minute';
  else if(hD<hitZone) CLK.dragging='hour';
  else {
    // Fallback: distance from center — outer=minute, inner=hour
    const dist=Math.hypot(x-cx,y-cy);
    CLK.dragging = dist>R*0.38 ? 'minute' : 'hour';
  }
  clockOnMove(e);
}
function clockOnMove(e){
  if(!CLK.dragging)return;
  e.preventDefault();
  const a=clkAngle(e), snap=CLK_DIFFS[CLK.diff].snap;
  if(CLK.dragging==='minute') CLK.currentM=angToMin(a,snap);
  else CLK.currentH=angToHour(a);
  drawClock();
}
function clockOnUp(){ CLK.dragging=null; drawClock(); }

/* ── Check ── */
function clockCheck(){
  const hOk=CLK.currentH===CLK.targetH, mOk=CLK.currentM===CLK.targetM;
  const fb=document.getElementById('clock-feedback');
  if(hOk&&mOk){
    CLK.score++;CLK.streak++;
    const earned=CLK.streak>=5?3:CLK.streak>=3?2:1;
    P.stars+=earned;saveActiveProfile();
    document.getElementById('clock-stars').textContent=P.stars;
    fb.textContent='✅ Perfetto! +'+earned+'⭐';fb.className='clock-feedback correct';
    sfxOk();if(typeof mascotReact==='function')mascotReact('happy');
    document.getElementById('clock-check-btn').disabled=true;
    setTimeout(clockNewPuzzle,1500);
  } else {
    CLK.streak=0;fb.className='clock-feedback wrong';
    fb.textContent=!hOk&&!mOk?'❌ Ore e minuti sbagliati':!hOk?'❌ Le ore non sono giuste':'❌ I minuti non sono giusti';
    sfxErr();if(typeof mascotReact==='function')mascotReact('sad');
  }
  document.getElementById('clock-score').textContent=CLK.score;
}

/* ── Difficulty cycle ── */
function clockCycleDiff(){
  const ds=['hours','half','quarter','fivemin'];
  CLK.diff=ds[(ds.indexOf(CLK.diff)+1)%ds.length];
  document.getElementById('clock-diff-label').textContent=CLK_DIFFS[CLK.diff].name;
  sfxClick();clockNewPuzzle();
}

/* ── Open ── */
function openClock(){
  sfxClick();
  document.getElementById('clock-hdr-av').textContent=P.avatar;
  document.getElementById('clock-hdr-nm').textContent=P.name;
  document.getElementById('clock-stars').textContent=P.stars;
  document.getElementById('clock-diff-label').textContent=CLK_DIFFS[CLK.diff].name;
  CLK.score=0;CLK.total=0;CLK.streak=0;
  show('s-clock');
  setTimeout(()=>{
    const body=document.querySelector('.clock-body');
    const br=body.getBoundingClientRect();
    const sz=Math.max(240,Math.min(br.width-32, br.height-260, 400));
    const canvas=document.getElementById('clock-canvas');
    canvas.width=canvas.height=sz;
    const wrap=document.getElementById('clock-canvas-wrap');
    wrap.style.width=wrap.style.height=(sz+24)+'px';
    clockNewPuzzle();
  },80);
}

/* ── Wire ── */
document.getElementById('btn-clock-back').onclick=()=>{sfxClick();buildGamesScreen();show('s-games');};
document.getElementById('clock-check-btn').onclick=clockCheck;
document.getElementById('clock-new-btn').onclick=()=>{sfxClick();clockNewPuzzle();};
document.getElementById('clock-diff-btn').onclick=clockCycleDiff;

const _clkC=document.getElementById('clock-canvas');
if(_clkC){
  _clkC.addEventListener('pointerdown',clockOnDown);
  _clkC.addEventListener('pointermove',clockOnMove);
  _clkC.addEventListener('pointerup',clockOnUp);
  _clkC.addEventListener('pointerleave',clockOnUp);
  _clkC.style.touchAction='none';
}
