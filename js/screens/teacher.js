/* ══════════════════════════════════════════
   TEACHER — A08/D04: moved from sliding.js
══════════════════════════════════════════ */
document.getElementById('btn-tea-back').onclick=()=>{sfxClick();show('s-wel');};
function buildTeacher(){
  const scroll=document.getElementById('tea-scroll');scroll.innerHTML='';
  const players=getAllPlayers();
  if(!players.length){
    scroll.innerHTML=`<div class="no-data"><div class="no-data-em">🏫</div><p>Nessun giocatore ancora.<br>I dati appariranno dopo la prima partita!</p></div>`;
    const btn=document.createElement('button');btn.className='btn-demo';btn.textContent='👀 Carica dati demo';
    btn.onclick=()=>{injectDemo();buildTeacher();};scroll.appendChild(btn);return;
  }
  const totalPuzz=players.reduce((s,p)=>s+Object.values(p.wp||{}).reduce((a,w)=>a+(w.done||0),0),0);
  const totalStars=players.reduce((s,p)=>s+(p.stars||0),0);
  const avgStreak=players.length>0?Math.round(players.reduce((s,p)=>s+(p.streak||0),0)/players.length):0;
  const s0=document.createElement('div');s0.className='tea-sec';
  s0.innerHTML=`<h2>📊 Riepilogo classe</h2>
    <div class="stats-row">
      <div class="sc"><div class="sc-n">${players.length}</div><div class="sc-l">Bambini</div></div>
      <div class="sc"><div class="sc-n">${totalPuzz}</div><div class="sc-l">Puzzle</div></div>
      <div class="sc"><div class="sc-n">${totalStars}</div><div class="sc-l">⭐ Stelle</div></div>
    </div>`;
  scroll.appendChild(s0);

  const s1=document.createElement('div');s1.className='tea-sec';s1.innerHTML='<h2>👦👧 I tuoi bambini</h2>';
  const tbl=document.createElement('table');tbl.className='ptable';
  tbl.innerHTML='<thead><tr><th>BAMBINO</th><th>⭐</th><th>🔥</th><th>PUZZLE</th><th>STATO</th></tr></thead>';
  const tbody=document.createElement('tbody');
  players.forEach(pl=>{
    const td=Object.values(pl.wp||{}).reduce((a,w)=>a+(w.done||0),0);
    const ph=(pl.history||[]).reduce((a,h)=>a+(h.hints||0),0);
    const pe=(pl.history||[]).reduce((a,h)=>a+(h.errors||0),0);
    let tag='tag-none',label='Non iniziato';
    if(td>0){
      const score=pe/Math.max(td,1)*0.6+ph/Math.max(td,1)*0.4;
      if(score<0.5){tag='tag-ok';label='Ottima forma';}
      else if(score<1.5){tag='tag-med';label='In progresso';}
      else{tag='tag-warn';label='Ha bisogno di aiuto';}
    }
    const tr=document.createElement('tr');tr.className='ptr';
    tr.innerHTML=`<td>${pl.avatar} <b>${pl.name}</b></td><td><b>${pl.stars}</b></td><td>${pl.streak||0}</td><td>${td}</td><td><span class="tag ${tag}">${label}</span></td>`;
    tbody.appendChild(tr);
  });
  tbl.appendChild(tbody);s1.appendChild(tbl);scroll.appendChild(s1);

  const s2=document.createElement('div');s2.className='tea-sec';s2.innerHTML='<h2>🗺️ Progressione per mondo</h2>';
  WORLDS.forEach(w=>{
    const ap=players.filter(p=>(p.wp||{})[w.id]);
    const avg=ap.length?Math.round(ap.reduce((s,p)=>s+(p.wp[w.id].done||0),0)/ap.length):0;
    const pct=Math.round(avg/w.total*100);
    const div=document.createElement('div');div.className='wsbar';
    div.innerHTML=`<div class="wsbar-lbl"><span>${w.icon} ${w.name}</span><span style="color:var(--accent)">${pct}% media</span></div><div class="wsbar-track"><div class="wsbar-fill" style="width:${pct}%"></div></div>`;
    s2.appendChild(div);
  });
  scroll.appendChild(s2);

  // CG13: Per-game breakdown
  const GAME_ICONS = {sudoku:'🔢',kenken:'🧮',maze:'🐾',nono:'🔲',tangram:'🔷',slide:'🧩'};
  const s2b=document.createElement('div');s2b.className='tea-sec';
  s2b.innerHTML='<h2>🎮 Attività per gioco</h2>';
  const gameKeys = ['sudoku','kenken','maze','nono','tangram','slide'];
  const gameGrid=document.createElement('div');gameGrid.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:8px;';
  gameKeys.forEach(gk=>{
    const count = players.reduce((s,p)=>{
      const h=(p.history||[]);
      if(gk==='sudoku') return s+h.filter(x=>!x.isKenKen&&!x.isMaze&&!x.isNono&&!x.isTang&&!x.isSlide).length;
      if(gk==='kenken') return s+h.filter(x=>x.isKenKen).length;
      if(gk==='maze') return s+h.filter(x=>x.isMaze).length;
      if(gk==='nono') return s+h.filter(x=>x.isNono).length;
      if(gk==='tangram') return s+h.filter(x=>x.isTang).length;
      if(gk==='slide') return s+h.filter(x=>x.isSlide).length;
      return s;
    },0);
    const card=document.createElement('div');
    card.style.cssText='background:var(--card);border-radius:14px;padding:12px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);';
    card.innerHTML=`<div style="font-size:24px">${GAME_ICONS[gk]}</div><div style="font-family:'Fredoka One',cursive;font-size:18px;color:var(--accent)">${count}</div><div style="font-size:11px;color:var(--muted);font-weight:700">partite</div>`;
    gameGrid.appendChild(card);
  });
  s2b.appendChild(gameGrid);
  scroll.appendChild(s2b);

  const s3=document.createElement('div');s3.className='tea-sec';s3.innerHTML='<h2>💡 Uso hint per bambino</h2>';
  const chart=document.createElement('div');chart.className='hchart';
  const maxH=Math.max(1,...players.map(p=>(p.history||[]).reduce((a,h)=>a+(h.hints||0),0)));
  players.slice(0,7).forEach(pl=>{
    const ph=(pl.history||[]).reduce((a,h)=>a+(h.hints||0),0);
    const pct=Math.round(ph/maxH*100);
    const wrap=document.createElement('div');wrap.className='hbw';
    wrap.innerHTML=`<div class="hbv">${ph}</div><div class="hb" style="height:${Math.max(4,pct)}%"></div><div class="hbl">${pl.avatar}</div>`;
    chart.appendChild(wrap);
  });
  s3.appendChild(chart);scroll.appendChild(s3);

  // Alerts
  const blocked=players.filter(p=>{
    const r=(p.history||[]).slice(-5);return r.length>=3&&r.reduce((s,h)=>s+(h.hints||0),0)>=r.length*2;
  });
  if(blocked.length){
    const s4=document.createElement('div');s4.className='tea-sec';s4.innerHTML='<h2>⚠️ Potrebbero aver bisogno di aiuto</h2>';
    blocked.forEach(p=>{
      const card=document.createElement('div');card.className='alert-card';
      card.innerHTML=`<span style="font-size:24px">${p.avatar}</span><div><b style="font-size:14px">${p.name}</b><div style="font-size:11px;color:#c06000;font-weight:700;margin-top:2px">Usa molti hint negli ultimi puzzle — considera un intervento individuale</div></div>`;
      s4.appendChild(card);
    });
    scroll.appendChild(s4);
  }
}
function injectDemo(){
  const demos=[
    {avatar:'🦊',name:'Giulia',stars:28,streak:4,wp:{w1:{done:8},w2:{done:6}},badges:['first','noerr','w1done'],
     history:[{world:'w1',errors:0,hints:0,earned:3},{world:'w1',errors:0,hints:1,earned:3},{world:'w2',errors:1,hints:0,earned:2}]},
    {avatar:'🐼',name:'Marco',stars:10,streak:1,wp:{w1:{done:4}},badges:['first'],
     history:[{world:'w1',errors:4,hints:5,earned:1},{world:'w1',errors:3,hints:4,earned:1}]},
    {avatar:'🦄',name:'Sofia',stars:22,streak:3,wp:{w1:{done:8},w2:{done:3}},badges:['first','speed'],
     history:[{world:'w1',errors:0,hints:0,earned:3},{world:'w2',errors:0,hints:0,earned:3}]},
    {avatar:'🐸',name:'Luca',stars:8,streak:2,wp:{w1:{done:5}},badges:['first'],
     history:[{world:'w1',errors:2,hints:3,earned:1}]},
    {avatar:'🐧',name:'Emma',stars:15,streak:2,wp:{w1:{done:7},w2:{done:1}},badges:['first','nohint'],
     history:[{world:'w1',errors:1,hints:0,earned:2}]},
  ];
  // inject into both mg5_profiles and mg4_all for teacher compat
  const existing=loadAllProfiles();
  const all=JSON.parse(localStorage.getItem('mg4_all')||'{}');
  demos.forEach(d=>{
    const id=uid();
    const full={...d,id,lastSeen:Date.now()};
    if(!existing.some(p=>p.name===d.name)) existing.push(full);
    all[d.name]=full;
  });
  saveAllProfiles(existing);
  localStorage.setItem('mg4_all',JSON.stringify(all));
}