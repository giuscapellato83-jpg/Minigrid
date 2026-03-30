/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
const _firstAv = document.querySelector('.av-btn');
if (_firstAv) _firstAv.classList.add('sel');
P.avatar=AVATARS[0];
(function(){
  migrateLegacy();
  const profiles=loadAllProfiles();
  const lastId=_storageGet('mg5_last');
  const last=profiles.find(p=>p.id===lastId)||profiles[0];
  if(last) document.body.className=PALS[last.palette||'aurora'].theme;

  // B07: Remove splash screen
  const splash=document.getElementById('splash-screen');
  if(splash) setTimeout(()=>{splash.classList.add('hide');setTimeout(()=>splash.remove(),400);},200);

  // D07: Global error handler
  window.onerror=function(msg,src,line){
    console.error('MiniGrid error:',msg,src,line);
    let errOv=document.getElementById('mg-error-ov');
    if(!errOv){
      errOv=document.createElement('div');errOv.id='mg-error-ov';
      errOv.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#fff;border:2px solid #ff5252;border-radius:16px;padding:16px 24px;z-index:9999;font-family:Nunito,sans-serif;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.15);max-width:90%;';
      errOv.innerHTML='<div style="font-size:24px;margin-bottom:6px">😅</div><div style="font-weight:700">Ops! Qualcosa non va</div><div style="font-size:13px;color:#888;margin-top:4px">Ricarica la pagina per riprovare</div>';
      errOv.onclick=()=>location.reload();
      document.body.appendChild(errOv);
      setTimeout(()=>{if(errOv.parentNode)errOv.remove();},8000);
    }
  };
})();