/* ══════════════════════════════════════════
   WELCOME
══════════════════════════════════════════ */
(function(){
  const g=document.getElementById('preview-grid');
  const colors=['#FF6B9D','#4DC3FF','#FFEB3B','#4CAF50'];
  [0,1,null,2,null,2,0,null,2,null,1,0,1,0,null,null].forEach(v=>{
    const el=document.createElement('div');el.className='pc'+(v===null?' blank':'');
    if(v!==null)el.style.background=colors[v];
    g.appendChild(el);
  });
})();

document.getElementById('btn-ws').onclick=()=>{
  sfxClick(); routeFromWelcome();
};
document.getElementById('btn-wt').onclick=()=>{sfxClick();show('s-tea');buildTeacher();};
