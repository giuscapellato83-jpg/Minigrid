/* ══════════════════════════════════════════
   SOUND — E06: more melodic, varied sounds
══════════════════════════════════════════ */
let AC=null;
function getAC(){if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();return AC;}
function tone(f,t,d,v=0.22){
  if(!soundOn)return;
  try{const ac=getAC(),o=ac.createOscillator(),g=ac.createGain();
    o.connect(g);g.connect(ac.destination);o.type=t;o.frequency.setValueAtTime(f,ac.currentTime);
    g.gain.setValueAtTime(v,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);
    o.start();o.stop(ac.currentTime+d);}catch(e){}}

// E06: chord helper — play 2-3 notes simultaneously for richer sound
function chord(freqs,type,dur,vol){freqs.forEach(f=>tone(f,type,dur,vol/(freqs.length*0.7)));}

function sfxOk(){
  // Rising major triad — warm, happy
  tone(523,'sine',.1,.18);
  setTimeout(()=>tone(659,'sine',.1,.16),80);
  setTimeout(()=>chord([784,1047],'sine',.18,.18),160);
}
function sfxErr(){
  // Dissonant minor second — clear "wrong" signal
  chord([220,233],'square',.16,.14);
}
function sfxHint(){
  // Gentle two-note chime
  tone(587,'triangle',.1,.15);
  setTimeout(()=>tone(880,'triangle',.16,.12),100);
}
function sfxWin(){
  // Victory fanfare — ascending scale + final chord
  const notes=[523,587,659,784,880,1047];
  notes.forEach((f,i)=>setTimeout(()=>tone(f,'sine',.14,.18),i*70));
  setTimeout(()=>chord([1047,1319,1568],'sine',.35,.2),notes.length*70);
}
function sfxClick(){tone(880,'sine',.04,.1);}
function sfxRep(){tone(440,'triangle',.06,.09);}
function sfxBadge(){
  // Special achievement sound — sparkle arpeggio
  [880,1047,1319,1568].forEach((f,i)=>setTimeout(()=>tone(f,'sine',.1,.15),i*60));
  setTimeout(()=>chord([1568,1976],'sine',.25,.16),240);
}
