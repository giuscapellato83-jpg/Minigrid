/* ══════════════════════════════════════════
   TUTORIAL
══════════════════════════════════════════ */
function startTutorial(){
  // First time only
  if(!P._tutDone){tutIdx=0;buildTutProgress();showTutSlide(0);show('s-tut');}
  else{updateMap();show('s-map');}
}
function buildTutProgress(){
  const prog=document.getElementById('tut-progress');prog.innerHTML='';
  TUT_SLIDES.forEach((_,i)=>{const d=document.createElement('div');d.className='tut-dot'+(i<tutIdx+1?' done':'');prog.appendChild(d);});
}
function showTutSlide(idx){
  const wrap=document.getElementById('tut-slide-wrap');wrap.innerHTML='';
  const s=TUT_SLIDES[idx];
  const slide=document.createElement('div');slide.className='tut-slide';
  setTimeout(()=>slide.classList.add('show'),30);

  const em=document.createElement('div');em.className='tut-em';em.textContent=s.em;
  const title=document.createElement('div');title.className='tut-title';title.textContent=s.title;
  const desc=document.createElement('div');desc.className='tut-desc';desc.textContent=s.desc;
  slide.append(em,title,desc);

  // Demo visual
  if(s.demo==='grid'){
    const demo=document.createElement('div');demo.className='tut-demo';
    const tg=document.createElement('div');tg.className='tut-grid';
    const layout=[1,2,null,3,null,3,1,null,3,null,2,1,2,1,null,null];
    const colors=['#FF5252','#2196F3','#FFEB3B','#4CAF50'];
    layout.forEach(v=>{
      const c=document.createElement('div');c.className='tut-cell'+(v===null?' empty':'');
      if(v!==null)c.style.background=colors[v-1];tg.appendChild(c);
    });
    demo.appendChild(tg);slide.appendChild(demo);
  }else if(s.demo==='row'){
    const demo=document.createElement('div');demo.className='tut-demo';
    const row=document.createElement('div');row.style.cssText='display:flex;gap:6px;align-items:center;';
    ['#FF5252','#2196F3','#FFEB3B',null].forEach(c=>{
      const cell=document.createElement('div');
      cell.className='tut-cell'+(c===null?' empty pulse':'');
      if(c)cell.style.background=c;
      if(!c){cell.style.border='3px solid #4CAF50';cell.textContent='?';cell.style.fontSize='22px';cell.style.color='#4CAF50';cell.style.fontFamily="'Fredoka One',cursive";}
      row.appendChild(cell);
    });
    demo.appendChild(row);slide.appendChild(demo);
  }else if(s.demo==='tap'){
    const arr=document.createElement('div');arr.className='tut-arrow';arr.textContent='👆';slide.appendChild(arr);
  }else if(s.demo==='hint'){
    const hb=document.createElement('button');
    hb.style.cssText='background:#fff8e0;border:2.5px solid #ffd166;border-radius:20px;padding:12px 24px;font-family:Fredoka One,cursive;font-size:20px;color:#c98000;cursor:default;';
    hb.textContent='💡 Aiuto (3)';slide.appendChild(hb);
  }else if(s.demo==='stars'){
    const starRow=document.createElement('div');starRow.style.cssText='display:flex;gap:8px;font-size:42px;';
    ['⭐','⭐','⭐'].forEach(s=>{const sp=document.createElement('span');sp.textContent=s;sp.style.animation=`float ${1.5+Math.random()}s ease-in-out infinite`;starRow.appendChild(sp);});
    slide.appendChild(starRow);
  }

  wrap.appendChild(slide);

  // Dots
  document.querySelectorAll('.tut-dot').forEach((d,i)=>d.classList.toggle('done',i<=idx));
  const isLast=idx===TUT_SLIDES.length-1;
  document.getElementById('btn-tut-next').textContent=isLast?'Inizia a giocare! 🚀':'Avanti →';
}

document.getElementById('btn-tut-next').onclick=()=>{
  sfxClick();
  tutIdx++;
  if(tutIdx>=TUT_SLIDES.length){P._tutDone=true;saveActiveProfile();updateMap();show('s-map');}
  else{buildTutProgress();showTutSlide(tutIdx);}
};
document.getElementById('btn-tut-skip').onclick=()=>{sfxClick();P._tutDone=true;saveActiveProfile();updateMap();show('s-map');};