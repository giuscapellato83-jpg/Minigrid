/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */
const PALS={
  aurora:{name:'Aurora',emoji:'🌸',colors:['#FF6B9D','#C040F0','#FF9ECA','#9B10C0'],theme:'aurora'},
  oceano:{name:'Oceano',emoji:'🌊',colors:['#4DC3FF','#1A7FBF','#38E0C0','#0D3A6B'],theme:'oceano'},
  terra: {name:'Terra', emoji:'🍂',colors:['#FF8C42','#7BAE5C','#E8C547','#C0542A'],theme:'terra'},
  cosmo: {name:'Cosmo', emoji:'⭐',colors:['#5B5EA6','#FFD166','#A8DADC','#2D2D70'],theme:'cosmo'},
};
const STYMS={
  colors: {name:'Colori', emoji:'🎨',preview:['🔴','🔵','🟡','🟢']},
  shapes: {name:'Forme',  emoji:'🔷',preview:['●','■','▲','♦']},
  animals:{name:'Animali',emoji:'🐾',preview:['🐶','🐱','🐸','🐰']},
  numbers:{name:'Numeri', emoji:'🔢',preview:['1','2','3','4']},
};
const SYMS={
  colors: {
    2:['#FF5252','#2196F3'],
    3:['#FF5252','#2196F3','#FFEB3B'],
    4:['#FF5252','#2196F3','#FFEB3B','#4CAF50'],
    6:['#FF5252','#2196F3','#FFEB3B','#4CAF50','#FF9800','#9C27B0'],
    9:['#FF5252','#2196F3','#FFEB3B','#4CAF50','#FF9800','#9C27B0','#00BCD4','#E91E63','#795548'],
  },
  shapes: {
    2:['●','■'],
    3:['●','■','▲'],
    4:['●','■','▲','♦'],
    6:['●','■','▲','♦','★','⬟'],
    9:['●','■','▲','♦','★','⬟','✿','⬡','⊕'],
  },
  animals:{
    2:['🐶','🐱'],
    3:['🐶','🐱','🐸'],
    4:['🐶','🐱','🐸','🐰'],
    6:['🐶','🐱','🐸','🐰','🐻','🦊'],
    9:['🐶','🐱','🐸','🐰','🐻','🦊','🐧','🐯','🐺'],
  },
  numbers:{
    2:['1','2'],
    3:['1','2','3'],
    4:['1','2','3','4'],
    6:['1','2','3','4','5','6'],
    9:['1','2','3','4','5','6','7','8','9'],
  },
};
const AVATARS=['🦊','🐼','🦁','🐸','🦄','🐙','🐧','🦋'];
/* ══════════════════════════════════════════
   UNIFIED WORLD REGISTRY
   Shared across ALL games — same worlds,
   same progression, same unlock logic.
══════════════════════════════════════════ */

const WORLDS = [
  // ── MONDO 1 — Giardino Magico ──
  { id:'w1', name:'Giardino Magico', icon:'🌱', phase:0, total:4, theme:'garden',
    sudoku:  { size:2, diff:'easy' },
    maze:    { gridSize:4, extraOpen:5 },
    kenken:  { size:4, diff:'easy' },       // solo +
    tangram: { phase:0 },
    nono:    { puzzleIdx:0 },
  },
  // ── MONDO 2 — Nuvole Colorate ──
  { id:'w2', name:'Nuvole Colorate', icon:'☁️', phase:0, total:4, theme:'clouds',
    sudoku:  { size:3, diff:'easy' },
    maze:    { gridSize:4, extraOpen:3 },
    kenken:  { size:4, diff:'easyminus' },  // + e −
    tangram: { phase:0 },
    nono:    { puzzleIdx:1 },
  },
  // ── MONDO 3 — Polvere di Stelle ──
  { id:'w3', name:'Polvere di Stelle', icon:'✨', phase:1, total:6, theme:'stardust',
    sudoku:  { size:4, diff:'easy' },
    maze:    { gridSize:6, extraOpen:4 },
    kenken:  { size:4, diff:'medium' },     // +, − e ×
    tangram: { phase:1 },
    nono:    { puzzleIdx:2 },
  },
  // ── MONDO 4 — Foresta Incantata ──
  { id:'w4', name:'Foresta Incantata', icon:'🌿', phase:1, total:6, theme:'forest',
    sudoku:  { size:4, diff:'medium' },
    maze:    { gridSize:6, extraOpen:2 },
    kenken:  { size:4, diff:'hard' },       // tutte (+−×÷)
    tangram: { phase:1 },
    nono:    { puzzleIdx:4 },
  },
  // ── MONDO 5 — Isola dei Cristalli ──
  { id:'w5', name:'Isola dei Cristalli', icon:'💎', phase:2, total:8, theme:'crystal',
    sudoku:  { size:4, diff:'hard' },
    maze:    { gridSize:8, extraOpen:3 },
    kenken:  { size:6, diff:'easyminus' },  // 6×6, + e −
    tangram: { phase:2 },
    nono:    { puzzleIdx:6 },
  },
  // ── MONDO 6 — Oceano dei Misteri ──
  { id:'w6', name:'Oceano dei Misteri', icon:'🌊', phase:2, total:8, theme:'ocean',
    sudoku:  { size:6, diff:'easy' },
    maze:    { gridSize:8, extraOpen:1 },
    kenken:  { size:6, diff:'medium' },     // 6×6, +, − e ×
    tangram: { phase:2 },
    nono:    { puzzleIdx:7 },
  },
  // ── MONDO 7 — Galassia dei Numeri ──
  { id:'w7', name:'Galassia dei Numeri', icon:'🚀', phase:3, total:8, theme:'galaxy',
    sudoku:  { size:6, diff:'hard' },
    maze:    { gridSize:10, extraOpen:2 },
    kenken:  { size:6, diff:'hard' },       // 6×6, tutte
    tangram: { phase:3 },
    nono:    { puzzleIdx:8 },
  },
  // ── MONDO 8 — Corona del Drago ──
  { id:'w8', name:'Corona del Drago', icon:'🐉', phase:3, total:10, theme:'dragon',
    sudoku:  { size:9, diff:'hard' },
    maze:    { gridSize:10, extraOpen:0 },
    kenken:  { size:6, diff:'hard' },       // 6×6, tutte (boss)
    tangram: { phase:3 },
    nono:    { puzzleIdx:9 },
  },
];

/* ── World unlock logic (shared) ──
   A world is unlocked if:
   - phase === 0, OR
   - the previous world in the same game has done >= 60% of total
*/
function isWorldUnlocked(worldId, gameKey) {
  const idx = WORLDS.findIndex(w => w.id === worldId);
  if (idx === 0) return true;
  const world = WORLDS[idx];
  // Phase 0 always unlocked
  if (world.phase === 0) return true;
  // Skill level shortcuts
  const level = P.skillLevel || 'beginner';
  if (level === 'expert') return true; // all worlds unlocked
  if (level === 'intermediate' && world.phase <= 1) return true; // phase 0+1 unlocked
  // Normal progression: previous world needs 60%+ completion
  const prev = WORLDS[idx - 1];
  const prevProgress = getWorldProgress(prev.id, gameKey);
  const prevTotal = prev.total;
  return prevProgress >= Math.ceil(prevTotal * 0.6);
}

function getWorldProgress(worldId, gameKey) {
  if (!P || !P.wp) return 0;
  const key = gameKey ? `${worldId}_${gameKey}` : worldId;
  return (P.wp[key] || { done: 0 }).done;
}

function recordWorldProgress(worldId, gameKey) {
  if (!P || !P.wp) return;
  const key = gameKey ? `${worldId}_${gameKey}` : worldId;
  if (!P.wp[key]) P.wp[key] = { done: 0, stars: 0 };
  const world = WORLDS.find(w=>w.id===worldId);
  const maxDone = world ? world.total : 999;
  if(P.wp[key].done < maxDone) P.wp[key].done++;
  saveActiveProfile();
}


/* BADGES definition */
const BADGE_DEFS=[
  {id:'first',   em:'🌟',name:'Prima stella!',   desc:'Completa il primo puzzle',     check:p=>p.history.length>=1},
  {id:'streak3', em:'🔥',name:'Tre di fila!',    desc:'3 puzzle senza errori',        check:p=>getStreak(p)>=3},
  {id:'noerr',   em:'💎',name:'Diamante',         desc:'Puzzle completato senza errori',check:p=>p.history.some(h=>h.errors===0)},
  {id:'nohint',  em:'🧠',name:'Cervellone!',      desc:'Puzzle senza usare aiuti',     check:p=>p.history.some(h=>h.hints===0&&h.errors<=1)},
  {id:'w1done',  em:'🌱',name:'Giardiniere!',     desc:'Completa il Giardino Magico',  check:p=>(p.wp.w1||{done:0}).done>=4},
  {id:'w3done',  em:'✨',name:'Polvere di Stelle!',desc:'Completa Polvere di Stelle',   check:p=>(p.wp.w3||{done:0}).done>=6},
  {id:'w4done',  em:'🌿',name:'Foresta Incantata!',desc:'Completa la Foresta Incantata',check:p=>(p.wp.w4||{done:0}).done>=6},
  {id:'w8done',  em:'🐉',name:'Domatore di Draghi!',desc:'Completa la Corona del Drago',check:p=>(p.wp.w8||{done:0}).done>=10},
  {id:'stars20', em:'🏆',name:'Campione!',        desc:'Raccogli 20 stelle',           check:p=>p.stars>=20},
  {id:'stars50', em:'👑',name:'Re/Regina!',       desc:'Raccogli 50 stelle',           check:p=>p.stars>=50},
  {id:'speed',   em:'⚡',name:'Fulmine!',          desc:'Risolvi senza errori e hint',  check:p=>p.history.some(h=>h.errors===0&&h.hints===0)},
  {id:'phase0',  em:'🌱',name:'Piccolo genio!',   desc:'Completa il Giardino Magico',  check:p=>(p.wp.w1||{done:0}).done>=4},
  {id:'grid9',   em:'🌌',name:'Astronauta!',      desc:'Completa un puzzle 9×9',       check:p=>p.history.some(h=>h.size===9)},
  {id:'daily3',  em:'📅',name:'Abitudine!',       desc:'Gioca la sfida del giorno 3 volte', check:p=>(p.dailyStreak||0)>=3},
  {id:'allworlds',em:'🗺️',name:'Esploratore!',   desc:'Sblocca tutti i mondi',        check:p=>Object.keys(p.wp).length>=8},
  {id:'kenken',   em:'🔢',name:'Calcolatore!',    desc:'Completa un puzzle KenKen',    check:p=>p.history.some(h=>h.isKenKen)},
  {id:'tangram',  em:'🔷',name:'Artista!',        desc:'Completa un puzzle Tangram',   check:p=>p.history.some(h=>h.isTang)},
  {id:'maze',     em:'🐾',name:'Esploratore!',    desc:'Trova il cagnolino nel labirinto', check:p=>p.history.some(h=>h.isMaze)},
  {id:'nonogram', em:'🔲',name:'Artista Pixel!',  desc:'Completa il primo nonogramma',   check:p=>p.history.some(h=>h.isNono)},
  {id:'slide',    em:'🔢',name:'Puzzle Master!',  desc:'Risolvi il rompicapo degli 8',    check:p=>p.history.some(h=>h.isSlide)},
];

/* ADAPTIVE config: track last N performance */
const ADAPT_WINDOW=5;

/* TUTORIAL slides */
const TUT_SLIDES=[
  {
    em:'👀',title:'Guarda la griglia!',
    desc:'Ogni riga e colonna deve avere tutti i simboli, ognuno una sola volta.',
    demo:'grid'
  },
  {
    em:'🔍',title:'Trova quello che manca!',
    desc:'Se in una riga ci sono già 🔴🔵🟡, allora la cella vuota è 🟢!',
    demo:'row'
  },
  {
    em:'👆',title:'Tocca e inserisci!',
    desc:'Tocca una cella vuota, poi scegli il simbolo giusto qui sotto.',
    demo:'tap'
  },
  {
    em:'💡',title:'Hai bisogno di aiuto?',
    desc:'Premi "Aiuto" e ti mostriamo dove guardare. Puoi farlo 3 volte per puzzle!',
    demo:'hint'
  },
  {
    em:'🎉',title:'Sei pronto!',
    desc:'Riempi tutta la griglia senza errori e guadagna stelle ⭐ per sbloccare nuovi mondi!',
    demo:'stars'
  },
];

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
let P={id:null,avatar:'🦊',name:'',palette:'aurora',symTheme:'colors',stars:0,
       wp:{},history:[],badges:[],streak:0,lastDay:null};
let G={world:null,pidx:0,size:4,solution:[],board:[],given:new Set(),
       selCell:null,selSym:0,hintsLeft:3,errors:0,startTime:0,
       adaptDiff:'medium',isKenKen:false,cages:null,isDaily:false};
let soundOn=true;
let repSteps=[],repTimer=null;
let tutIdx=0;
let _editMode=false;

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
const rnd=n=>Math.floor(Math.random()*n);
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=rnd(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;}
function today(){return new Date().toDateString();}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function getStreak(p){
  if(!p.history||!p.history.length)return 0;
  let s=0;
  for(let i=p.history.length-1;i>=0;i--){
    if(p.history[i].errors===0)s++;else break;
  }
  return s;
}

/* ══════════════════════════════════════════
   MULTI-PROFILE PERSISTENCE
   F08: localStorage with availability check
══════════════════════════════════════════ */
let _storageAvailable = true;
try { const _t='__mg_test'; localStorage.setItem(_t,'1'); localStorage.removeItem(_t); }
catch(e) { _storageAvailable = false; }
let _memoryFallback = {}; // in-memory fallback when localStorage unavailable

function _storageGet(key) {
  if (!_storageAvailable) return _memoryFallback[key] || null;
  try { return localStorage.getItem(key); } catch(e) { return _memoryFallback[key] || null; }
}
function _storageSet(key, val) {
  _memoryFallback[key] = val;
  if (!_storageAvailable) return;
  try { localStorage.setItem(key, val); } catch(e) { /* QuotaExceeded — data stays in memory */ }
}
function _storageRemove(key) {
  delete _memoryFallback[key];
  if (!_storageAvailable) return;
  try { localStorage.removeItem(key); } catch(e) {}
}

function loadAllProfiles(){
  try{const d=_storageGet('mg5_profiles');return d?JSON.parse(d):[];}catch(e){return[];}
}
function saveAllProfiles(profiles){
  try{_storageSet('mg5_profiles',JSON.stringify(profiles));}catch(e){}
}
let _savePending=false,_saveTimer=null;
function saveActiveProfile(){
  if(!P.id) return;
  _savePending=true;
  if(!_saveTimer){
    _saveTimer=setTimeout(_flushSave,800);
  }
}
function _flushSave(){
  _saveTimer=null;
  if(!_savePending||!P.id)return;
  _savePending=false;
  const profiles=loadAllProfiles();
  const idx=profiles.findIndex(p=>p.id===P.id);
  if(idx>=0) profiles[idx]={...P};
  else profiles.push({...P});
  saveAllProfiles(profiles);
  try{_storageSet('mg5_last',P.id);}catch(e){}
  syncTeacherStore();
}
function saveActiveProfileNow(){
  // Force immediate save (used before navigation/exit)
  if(_saveTimer){clearTimeout(_saveTimer);_saveTimer=null;}
  _savePending=true;_flushSave();
}
function saveP(){saveActiveProfile();}   // alias used throughout
// Flush on page unload
window.addEventListener('beforeunload',()=>{if(_savePending)_flushSave();});
function deleteProfile(id){
  const profiles=loadAllProfiles().filter(p=>p.id!==id);
  saveAllProfiles(profiles);
  try{if(_storageGet('mg5_last')===id)_storageRemove('mg5_last');}catch(e){}
  // F07: reset P if the deleted profile was active
  if(P.id===id){
    Object.assign(P,{id:null,avatar:'🦊',name:'',palette:'aurora',symTheme:'colors',stars:0,
      wp:{},history:[],badges:[],streak:0,lastDay:null});
  }
}
function activateProfile(profile){
  Object.assign(P,JSON.parse(JSON.stringify(profile)));
  applyTheme();
}
function syncTeacherStore(){
  try{
    const all=JSON.parse(_storageGet('mg4_all')||'{}');
    loadAllProfiles().forEach(p=>{all[p.name]={...p,lastSeen:p.lastSeen||Date.now()};});
    _storageSet('mg4_all',JSON.stringify(all));
  }catch(e){}
}
function getAllPlayers(){
  const mg5=loadAllProfiles();
  if(mg5.length)return mg5;
  try{return Object.values(JSON.parse(_storageGet('mg4_all')||'{}'));}catch(e){return[];}
}
function migrateLegacy(){
  try{
    const d=_storageGet('mg4');if(!d)return;
    const old=JSON.parse(d);if(!old||!old.name)return;
    const profiles=loadAllProfiles();
    if(profiles.some(p=>p.name===old.name))return;
    profiles.push({...old,id:uid()});
    saveAllProfiles(profiles);
  }catch(e){}
}

/* ══════════════════════════════════════════
   STREAK & ADAPTIVE
   CG12: P.streak = consecutive DAYS played (dayStreak)
         getStreak(p) = consecutive puzzles with 0 errors (perfectStreak)
══════════════════════════════════════════ */
function updateStreak(){
  const td=today();
  if(P.lastDay!==td){
    if(P.lastDay===new Date(Date.now()-86400000).toDateString()){
      P.streak=(P.streak||0)+1;
    } else {
      P.streak=1;
    }
    P.lastDay=td;
  }
  const mapStreak=document.getElementById('map-streak');
  if(mapStreak) mapStreak.textContent=P.streak||0;
  const hdrStk=document.getElementById('hdr-stk');
  if(hdrStk) hdrStk.textContent=P.streak||0;
}

function computeAdaptDiff(){
  const recent=P.history.slice(-ADAPT_WINDOW);
  if(recent.length<2) return (G.world&&G.world._diff)?G.world._diff:'medium';
  const avgErrors=recent.reduce((s,h)=>s+(h.errors||0),0)/recent.length;
  const avgHints= recent.reduce((s,h)=>s+(h.hints||0),0)/recent.length;
  const score=avgErrors*0.6+avgHints*0.3;
  if(score<=0.3) return 'hard';
  if(score<=1.2) return 'medium';
  return 'easy';
}

function showAdaptBadge(diff){
  const badge=document.getElementById('adapt-badge');
  badge.className='adapt-badge adapt-'+diff;
  badge.textContent={easy:'🟢 Più facile',medium:'🟡 Bilanciato',hard:'🔴 Sfida!'}[diff];
  badge.style.display='inline-flex';
  setTimeout(()=>badge.style.display='none',3500);
}