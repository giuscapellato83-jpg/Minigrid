/* ══════════════════════════════════════════
   WORLD DECORATION ENGINE
   SVG mascots + animated environment per world
   ──────────────────────────────────────────
   Mascots react to correct/incorrect moves.
   Colors auto-adapt to game palette (SYMS.colors[sz]).
══════════════════════════════════════════ */

/* ── World decoration configs ── */
const WORLD_DECO = {
  garden: {
    mascot: 'ladybug',
    extras: ['flower','flower','bee','butterfly'],
  },
  clouds: {
    mascot: 'bird',
    extras: ['cloud','cloud','kite','cloud'],
  },
  stardust: {
    mascot: 'owl',
    extras: ['star','star','firefly','star','moon'],
  },
  forest: {
    mascot: 'monkey',
    extras: ['parrot','snake','leaf','leaf'],
  },
  crystal: {
    mascot: 'crab',
    extras: ['crystal','crystal','palm','crystal'],
  },
  ocean: {
    mascot: 'octopus',
    extras: ['fish','fish','bubble','bubble','bubble'],
  },
  galaxy: {
    mascot: 'alien',
    extras: ['planet','comet','star','planet'],
  },
  dragon: {
    mascot: 'dragon',
    extras: ['flame','flame','bat','flame'],
  },
};

/* ── SVG generators for mascots (idle state) ── */
const MASCOT_SVG = {
  ladybug: (c) => `<svg viewBox="0 0 72 62" width="72" height="62">
    <ellipse cx="36" cy="18" rx="14" ry="12" fill="#111"/>
    <circle cx="29" cy="14" r="5" fill="white"/><circle cx="43" cy="14" r="5" fill="white"/>
    <circle cx="30" cy="14" r="2.8" fill="#111" class="deco-pupil-l"/><circle cx="44" cy="14" r="2.8" fill="#111" class="deco-pupil-r"/>
    <line x1="26" y1="3" x2="22" y2="0" stroke="#111" stroke-width="2" stroke-linecap="round"/>
    <line x1="46" y1="3" x2="50" y2="0" stroke="#111" stroke-width="2" stroke-linecap="round"/>
    <circle cx="22" cy="0" r="2.5" fill="#111"/><circle cx="50" cy="0" r="2.5" fill="#111"/>
    <ellipse cx="36" cy="42" rx="22" ry="20" fill="${c[0]}"/>
    <line x1="36" y1="22" x2="36" y2="62" stroke="#222" stroke-width="1.5"/>
    <circle cx="27" cy="35" r="3.5" fill="#222" opacity=".5"/><circle cx="45" cy="35" r="3.5" fill="#222" opacity=".5"/>
    <circle cx="30" cy="48" r="3" fill="#222" opacity=".5"/><circle cx="42" cy="48" r="3" fill="#222" opacity=".5"/>
    <path d="M30,20 Q36,25 42,20" stroke="#222" stroke-width="1.8" fill="none" stroke-linecap="round" class="deco-mouth"/>
    <g class="deco-tear deco-tear-l" opacity="0"><circle cx="25" cy="20" r="2.5" fill="#4DC3FF"/></g>
    <g class="deco-tear deco-tear-r" opacity="0"><circle cx="47" cy="20" r="2.5" fill="#4DC3FF"/></g>
  </svg>`,

  bird: (c) => `<svg viewBox="0 0 64 56" width="64" height="56">
    <ellipse cx="32" cy="32" rx="20" ry="18" fill="${c[1]}"/>
    <ellipse cx="32" cy="48" rx="12" ry="8" fill="${c[1]}" opacity=".7"/>
    <circle cx="24" cy="26" r="5" fill="white"/><circle cx="40" cy="26" r="5" fill="white"/>
    <circle cx="25" cy="26" r="2.5" fill="#111" class="deco-pupil-l"/><circle cx="41" cy="26" r="2.5" fill="#111" class="deco-pupil-r"/>
    <path d="M30,34 L32,38 L34,34" fill="#FF9800" stroke="#E65100" stroke-width="1"/>
    <path d="M12,30 Q6,22 14,20" fill="${c[1]}" opacity=".6"/>
    <path d="M52,30 Q58,22 50,20" fill="${c[1]}" opacity=".6"/>
    <path d="M27,35 Q32,39 37,35" stroke="#222" stroke-width="1.5" fill="none" stroke-linecap="round" class="deco-mouth"/>
    <g class="deco-tear deco-tear-l" opacity="0"><circle cx="20" cy="30" r="2" fill="#4DC3FF"/></g>
    <g class="deco-tear deco-tear-r" opacity="0"><circle cx="44" cy="30" r="2" fill="#4DC3FF"/></g>
  </svg>`,

  owl: (c) => `<svg viewBox="0 0 68 64" width="68" height="64">
    <ellipse cx="34" cy="38" rx="22" ry="24" fill="${c[2]||c[0]}"/>
    <ellipse cx="34" cy="12" rx="18" ry="14" fill="${c[2]||c[0]}"/>
    <path d="M20,2 L24,10" stroke="${c[2]||c[0]}" stroke-width="3" stroke-linecap="round"/>
    <path d="M48,2 L44,10" stroke="${c[2]||c[0]}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="26" cy="14" r="8" fill="white"/><circle cx="42" cy="14" r="8" fill="white"/>
    <circle cx="27" cy="14" r="5" fill="#FF9800"/><circle cx="43" cy="14" r="5" fill="#FF9800"/>
    <circle cx="27" cy="14" r="2.5" fill="#111" class="deco-pupil-l"/><circle cx="43" cy="14" r="2.5" fill="#111" class="deco-pupil-r"/>
    <path d="M32,22 L34,26 L36,22" fill="#FF9800"/>
    <path d="M29,28 Q34,32 39,28" stroke="#222" stroke-width="1.5" fill="none" stroke-linecap="round" class="deco-mouth"/>
    <g class="deco-tear deco-tear-l" opacity="0"><circle cx="22" cy="20" r="2" fill="#4DC3FF"/></g>
    <g class="deco-tear deco-tear-r" opacity="0"><circle cx="46" cy="20" r="2" fill="#4DC3FF"/></g>
  </svg>`,

  monkey: (c) => `<svg viewBox="0 0 70 66" width="70" height="66">
    <circle cx="35" cy="30" r="22" fill="${c[3]||c[0]}"/>
    <circle cx="12" cy="24" r="9" fill="${c[3]||c[0]}"/><circle cx="12" cy="24" r="5" fill="#FFCCBC"/>
    <circle cx="58" cy="24" r="9" fill="${c[3]||c[0]}"/><circle cx="58" cy="24" r="5" fill="#FFCCBC"/>
    <ellipse cx="35" cy="34" rx="14" ry="12" fill="#FFCCBC"/>
    <circle cx="27" cy="24" r="4" fill="white"/><circle cx="43" cy="24" r="4" fill="white"/>
    <circle cx="28" cy="24" r="2.2" fill="#111" class="deco-pupil-l"/><circle cx="44" cy="24" r="2.2" fill="#111" class="deco-pupil-r"/>
    <ellipse cx="35" cy="36" rx="4" ry="3" fill="#A1887F"/>
    <path d="M30,40 Q35,45 40,40" stroke="#222" stroke-width="1.5" fill="none" stroke-linecap="round" class="deco-mouth"/>
    <g class="deco-tear deco-tear-l" opacity="0"><circle cx="23" cy="28" r="2" fill="#4DC3FF"/></g>
    <g class="deco-tear deco-tear-r" opacity="0"><circle cx="47" cy="28" r="2" fill="#4DC3FF"/></g>
  </svg>`,

  crab: (c) => `<svg viewBox="0 0 76 56" width="76" height="56">
    <ellipse cx="38" cy="34" rx="22" ry="16" fill="${c[0]}"/>
    <circle cx="28" cy="28" r="4" fill="white"/><circle cx="48" cy="28" r="4" fill="white"/>
    <circle cx="29" cy="28" r="2.2" fill="#111" class="deco-pupil-l"/><circle cx="49" cy="28" r="2.2" fill="#111" class="deco-pupil-r"/>
    <path d="M16,30 Q8,20 4,28" stroke="${c[0]}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="4" cy="28" r="4" fill="${c[0]}"/>
    <path d="M60,30 Q68,20 72,28" stroke="${c[0]}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="72" cy="28" r="4" fill="${c[0]}"/>
    <line x1="26" y1="18" x2="24" y2="10" stroke="${c[0]}" stroke-width="2"/><circle cx="24" cy="10" r="3" fill="${c[0]}"/>
    <line x1="50" y1="18" x2="52" y2="10" stroke="${c[0]}" stroke-width="2"/><circle cx="52" cy="10" r="3" fill="${c[0]}"/>
    <path d="M33,38 Q38,42 43,38" stroke="#222" stroke-width="1.5" fill="none" stroke-linecap="round" class="deco-mouth"/>
    <g class="deco-tear deco-tear-l" opacity="0"><circle cx="24" cy="32" r="2" fill="#4DC3FF"/></g>
    <g class="deco-tear deco-tear-r" opacity="0"><circle cx="52" cy="32" r="2" fill="#4DC3FF"/></g>
  </svg>`,

  octopus: (c) => `<svg viewBox="0 0 72 70" width="72" height="70">
    <ellipse cx="36" cy="26" rx="22" ry="20" fill="${c[1]}"/>
    <circle cx="28" cy="22" r="5" fill="white"/><circle cx="44" cy="22" r="5" fill="white"/>
    <circle cx="29" cy="22" r="2.8" fill="#111" class="deco-pupil-l"/><circle cx="45" cy="22" r="2.8" fill="#111" class="deco-pupil-r"/>
    <path d="M31,32 Q36,36 41,32" stroke="#222" stroke-width="1.5" fill="none" stroke-linecap="round" class="deco-mouth"/>
    <path d="M16,40 Q12,55 8,60" stroke="${c[1]}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M22,44 Q20,58 18,64" stroke="${c[1]}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M50,44 Q52,58 54,64" stroke="${c[1]}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M56,40 Q60,55 64,60" stroke="${c[1]}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <g class="deco-tear deco-tear-l" opacity="0"><circle cx="24" cy="28" r="2.5" fill="#4DC3FF"/></g>
    <g class="deco-tear deco-tear-r" opacity="0"><circle cx="48" cy="28" r="2.5" fill="#4DC3FF"/></g>
  </svg>`,

  alien: (c) => `<svg viewBox="0 0 68 62" width="68" height="62">
    <ellipse cx="34" cy="24" rx="24" ry="20" fill="${c[3]||c[1]}"/>
    <ellipse cx="34" cy="46" rx="14" ry="14" fill="${c[3]||c[1]}"/>
    <ellipse cx="22" cy="20" rx="8" ry="10" fill="#111"/><ellipse cx="22" cy="20" rx="6" ry="8" fill="${c[2]||'#4CAF50'}"/>
    <circle cx="23" cy="20" r="3" fill="white" class="deco-pupil-l"/>
    <ellipse cx="46" cy="20" rx="8" ry="10" fill="#111"/><ellipse cx="46" cy="20" rx="6" ry="8" fill="${c[2]||'#4CAF50'}"/>
    <circle cx="47" cy="20" r="3" fill="white" class="deco-pupil-r"/>
    <path d="M30,34 Q34,38 38,34" stroke="#222" stroke-width="1.5" fill="none" stroke-linecap="round" class="deco-mouth"/>
    <line x1="14" y1="8" x2="10" y2="0" stroke="${c[3]||c[1]}" stroke-width="2"/><circle cx="10" cy="0" r="3" fill="${c[2]||'#4CAF50'}"/>
    <line x1="54" y1="8" x2="58" y2="0" stroke="${c[3]||c[1]}" stroke-width="2"/><circle cx="58" cy="0" r="3" fill="${c[2]||'#4CAF50'}"/>
    <g class="deco-tear deco-tear-l" opacity="0"><circle cx="18" cy="28" r="2" fill="#4DC3FF"/></g>
    <g class="deco-tear deco-tear-r" opacity="0"><circle cx="50" cy="28" r="2" fill="#4DC3FF"/></g>
  </svg>`,

  dragon: (c) => `<svg viewBox="0 0 80 72" width="80" height="72">
    <ellipse cx="40" cy="36" rx="26" ry="24" fill="${c[0]}"/>
    <path d="M20,14 L26,24 L32,12 L36,22 L42,10 L44,22 L50,14 L52,24" fill="${c[3]||c[0]}" stroke="${c[0]}" stroke-width="1"/>
    <circle cx="30" cy="30" r="6" fill="white"/><circle cx="50" cy="30" r="6" fill="white"/>
    <circle cx="31" cy="30" r="3.5" fill="#111" class="deco-pupil-l"/><circle cx="51" cy="30" r="3.5" fill="#111" class="deco-pupil-r"/>
    <ellipse cx="36" cy="42" rx="3" ry="2" fill="#222"/><ellipse cx="44" cy="42" rx="3" ry="2" fill="#222"/>
    <path d="M34,48 Q40,54 46,48" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round" class="deco-mouth"/>
    <g class="deco-fire" opacity="0">
      <ellipse cx="40" cy="62" rx="6" ry="8" fill="#FF9800"/>
      <ellipse cx="40" cy="64" rx="3" ry="5" fill="#FFEB3B"/>
    </g>
    <g class="deco-tear deco-tear-l" opacity="0"><circle cx="24" cy="36" r="2.5" fill="#4DC3FF"/></g>
    <g class="deco-tear deco-tear-r" opacity="0"><circle cx="56" cy="36" r="2.5" fill="#4DC3FF"/></g>
  </svg>`,
};

/* ── SVG generators for extras ── */
function decoExtraSVG(type, color, size) {
  const s = size || 30;
  const h = Math.round(s);
  switch(type) {
    case 'flower': return `<svg viewBox="-15 -15 30 30" width="${h}" height="${h}"><g style="animation:deco-spin ${18+Math.random()*15}s linear infinite;transform-origin:center;"><ellipse cx="0" cy="-7" rx="4" ry="7" fill="${color}" opacity=".8"/><ellipse cx="0" cy="-7" rx="4" ry="7" fill="${color}" opacity=".8" transform="rotate(72)"/><ellipse cx="0" cy="-7" rx="4" ry="7" fill="${color}" opacity=".8" transform="rotate(144)"/><ellipse cx="0" cy="-7" rx="4" ry="7" fill="${color}" opacity=".8" transform="rotate(216)"/><ellipse cx="0" cy="-7" rx="4" ry="7" fill="${color}" opacity=".8" transform="rotate(288)"/></g><circle cx="0" cy="0" r="3" fill="#FFD166"/></svg>`;
    case 'bee': return `<svg viewBox="0 0 26 20" width="26" height="20"><ellipse cx="13" cy="11" rx="7" ry="6" fill="#FFEB3B"/><line x1="9" y1="9" x2="17" y2="9" stroke="#333" stroke-width="1.2"/><line x1="8" y1="12" x2="18" y2="12" stroke="#333" stroke-width="1.2"/><ellipse cx="9" cy="5" rx="5" ry="4" fill="#fff" opacity=".6"/><ellipse cx="17" cy="5" rx="5" ry="4" fill="#fff" opacity=".6"/></svg>`;
    case 'butterfly': return `<svg viewBox="0 0 28 22" width="28" height="22"><g style="animation:deco-bfly .4s ease-in-out infinite;transform-origin:center;"><ellipse cx="7" cy="8" rx="6" ry="8" fill="${color}" opacity=".6"/><ellipse cx="21" cy="8" rx="6" ry="8" fill="${color}" opacity=".6"/></g><ellipse cx="14" cy="11" rx="1.5" ry="7" fill="#333"/></svg>`;
    case 'cloud': return `<svg viewBox="0 0 50 28" width="50" height="28"><ellipse cx="18" cy="18" rx="14" ry="10" fill="${color}" opacity=".25"/><ellipse cx="32" cy="16" rx="12" ry="10" fill="${color}" opacity=".2"/><ellipse cx="24" cy="12" rx="10" ry="8" fill="${color}" opacity=".3"/></svg>`;
    case 'kite': return `<svg viewBox="0 0 24 36" width="24" height="36"><polygon points="12,0 24,14 12,28 0,14" fill="${color}" opacity=".7"/><line x1="12" y1="28" x2="12" y2="36" stroke="#999" stroke-width="1"/></svg>`;
    case 'star': return `<svg viewBox="0 0 24 24" width="${h}" height="${h}"><polygon points="12,0 15,9 24,9 17,14 19,24 12,18 5,24 7,14 0,9 9,9" fill="${color}" opacity=".6" style="animation:deco-twinkle ${2+Math.random()*3}s ease-in-out infinite;transform-origin:center;"/></svg>`;
    case 'firefly': return `<svg viewBox="0 0 12 12" width="12" height="12"><circle cx="6" cy="6" r="4" fill="${color}" opacity=".5" style="animation:deco-twinkle 1.5s ease-in-out infinite;"/></svg>`;
    case 'moon': return `<svg viewBox="0 0 28 28" width="28" height="28"><circle cx="14" cy="14" r="12" fill="#FFD166" opacity=".3"/><circle cx="18" cy="10" r="10" fill="var(--bg,#fff0f9)" opacity=".8"/></svg>`;
    case 'parrot': return `<svg viewBox="0 0 30 34" width="30" height="34"><ellipse cx="15" cy="18" rx="10" ry="12" fill="${color}"/><circle cx="12" cy="14" r="2.5" fill="white"/><circle cx="12" cy="14" r="1.3" fill="#111"/><path d="M18,16 L22,14 L18,18Z" fill="#FF9800"/><path d="M8,28 Q4,34 8,36" stroke="${color}" stroke-width="2" fill="none"/></svg>`;
    case 'snake': return `<svg viewBox="0 0 50 20" width="50" height="20"><path d="M2,10 Q10,2 18,10 Q26,18 34,10 Q42,2 48,10" stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round" style="animation:deco-sway 3s ease-in-out infinite;"/><circle cx="48" cy="10" r="3" fill="${color}"/><circle cx="47" cy="9" r="1.2" fill="#111"/></svg>`;
    case 'leaf': return `<svg viewBox="0 0 18 24" width="18" height="24"><path d="M9,0 Q18,8 9,24 Q0,8 9,0Z" fill="${color}" opacity=".5"/><line x1="9" y1="4" x2="9" y2="20" stroke="#2E7D32" stroke-width=".8" opacity=".4"/></svg>`;
    case 'crystal': return `<svg viewBox="0 0 22 30" width="22" height="30"><polygon points="11,0 22,20 16,30 6,30 0,20" fill="${color}" opacity=".5" style="animation:deco-twinkle 4s ease-in-out infinite;"/></svg>`;
    case 'palm': return `<svg viewBox="0 0 30 40" width="30" height="40"><line x1="15" y1="20" x2="15" y2="40" stroke="#795548" stroke-width="3"/><path d="M15,20 Q5,10 2,0" stroke="#4CAF50" stroke-width="2" fill="none"/><path d="M15,20 Q25,10 28,0" stroke="#4CAF50" stroke-width="2" fill="none"/><path d="M15,18 Q8,8 15,2 Q22,8 15,18Z" fill="#4CAF50" opacity=".4"/></svg>`;
    case 'fish': return `<svg viewBox="0 0 32 18" width="32" height="18"><ellipse cx="16" cy="9" rx="12" ry="7" fill="${color}" opacity=".7"/><polygon points="28,9 32,3 32,15" fill="${color}" opacity=".6"/><circle cx="10" cy="8" r="2" fill="white"/><circle cx="10" cy="8" r="1" fill="#111"/></svg>`;
    case 'bubble': return `<svg viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="6" fill="none" stroke="${color}" stroke-width="1" opacity=".3"/><circle cx="6" cy="6" r="1.5" fill="white" opacity=".4"/></svg>`;
    case 'planet': return `<svg viewBox="0 0 30 30" width="30" height="30"><circle cx="15" cy="15" r="10" fill="${color}" opacity=".5"/><ellipse cx="15" cy="15" rx="16" ry="4" fill="none" stroke="${color}" stroke-width="1.2" opacity=".3" transform="rotate(-20 15 15)"/></svg>`;
    case 'comet': return `<svg viewBox="0 0 40 12" width="40" height="12"><ellipse cx="34" cy="6" rx="5" ry="4" fill="${color}" opacity=".7"/><path d="M30,6 Q15,4 0,6 Q15,8 30,6Z" fill="${color}" opacity=".2"/></svg>`;
    case 'flame': return `<svg viewBox="0 0 18 28" width="18" height="28"><path d="M9,0 Q16,10 12,20 Q9,28 6,20 Q2,10 9,0Z" fill="${color}" opacity=".5" style="animation:deco-sway 1.5s ease-in-out infinite;transform-origin:bottom center;"/><path d="M9,8 Q13,14 10,22 Q8,22 5,14Z" fill="#FFEB3B" opacity=".4"/></svg>`;
    case 'bat': return `<svg viewBox="0 0 36 20" width="36" height="20"><ellipse cx="18" cy="12" rx="5" ry="4" fill="#333"/><path d="M13,10 Q6,2 0,8 Q4,12 13,12Z" fill="#333" opacity=".7" style="animation:deco-bfly .5s ease-in-out infinite;transform-origin:13px 11px;"/><path d="M23,10 Q30,2 36,8 Q32,12 23,12Z" fill="#333" opacity=".7" style="animation:deco-bfly .5s ease-in-out infinite;transform-origin:23px 11px;"/><circle cx="16" cy="10" r="1" fill="#FF5252"/><circle cx="20" cy="10" r="1" fill="#FF5252"/></svg>`;
    default: return '';
  }
}

/* ── Position slots orbiting tightly around the game content ── */
const DECO_SLOTS = [
  {x:'0%',   y:'8%'},   {x:'92%',  y:'5%'},    // flanking top of grid
  {x:'-2%',  y:'35%'},  {x:'95%',  y:'32%'},   // flanking mid grid
  {x:'0%',   y:'58%'},  {x:'93%',  y:'55%'},   // flanking lower grid
  {x:'15%',  y:'0%'},   {x:'75%',  y:'0%'},    // above grid
  {x:'12%',  y:'90%'},  {x:'78%',  y:'92%'},   // below controls
];

/* ── Spawn decorations into game area ── */
let _decoCleanup = null;

function spawnWorldDeco(worldTheme, gameColors, gameKey) {
  clearWorldDeco();
  const config = WORLD_DECO[worldTheme];
  if (!config) return;

  // Map gameKey to the tight wrapper around the actual game grid/canvas
  const wrapMap = {
    sudoku: '.sudoku-wrap',
    kenken: '.sudoku-wrap',
    maze:   '.maze-canvas-wrap',
    nono:   '.nono-grid-wrap',
    tangram:'.tang-arena',
    slide:  '.slide-grid-wrap',
  };
  const selector = wrapMap[gameKey] || '.sudoku-wrap';
  const wrap = document.querySelector(selector);
  if (!wrap) return;
  wrap.style.position = 'relative';
  wrap.style.overflow = 'visible';

  const container = document.createElement('div');
  container.className = 'world-deco-container';
  container.style.cssText = 'position:absolute;top:-30px;left:-40px;right:-40px;bottom:-20px;pointer-events:none;z-index:1;overflow:visible;';

  const c = gameColors || ['#FF5252','#2196F3','#FFEB3B','#4CAF50'];

  // Mascot
  const mascotEl = document.createElement('div');
  mascotEl.className = 'world-deco-mascot';
  mascotEl.style.cssText = 'position:absolute;bottom:5%;left:0%;z-index:4;animation:deco-float 4s ease-in-out infinite;';
  mascotEl.innerHTML = MASCOT_SVG[config.mascot] ? MASCOT_SVG[config.mascot](c) : '';
  container.appendChild(mascotEl);

  // Extras
  config.extras.forEach((type, i) => {
    const slot = DECO_SLOTS[i % DECO_SLOTS.length];
    const el = document.createElement('div');
    const color = c[i % c.length];
    const size = 20 + Math.random() * 16;
    el.className = 'world-deco-extra';
    const dur = 4 + Math.random() * 5;
    const delay = Math.random() * 3;
    el.style.cssText = `position:absolute;left:${slot.x};top:${slot.y};z-index:2;animation:deco-float ${dur}s ease-in-out ${delay}s infinite;opacity:.7;`;
    el.innerHTML = decoExtraSVG(type, color, size);
    container.appendChild(el);
  });

  wrap.insertBefore(container, wrap.firstChild);
  _decoCleanup = () => container.remove();
}

function clearWorldDeco() {
  if (_decoCleanup) { _decoCleanup(); _decoCleanup = null; }
  document.querySelectorAll('.world-deco-container').forEach(el => el.remove());
}

/* ── Mascot reactions ── */
let _mascotTimer = null;

function mascotReact(mood) {
  const mascot = document.querySelector('.world-deco-mascot');
  if (!mascot) return;
  if (_mascotTimer) { clearTimeout(_mascotTimer); _mascotTimer = null; }

  const mouth = mascot.querySelector('.deco-mouth');
  const tearL = mascot.querySelector('.deco-tear-l');
  const tearR = mascot.querySelector('.deco-tear-r');
  const fire = mascot.querySelector('.deco-fire');

  // Store original mouth path on first call
  if (mouth && !mouth.dataset.orig) mouth.dataset.orig = mouth.getAttribute('d');

  if (mood === 'happy') {
    mascot.style.animation = 'deco-bounce .8s ease-in-out';
    if (mouth && mouth.dataset.orig) {
      // Widen smile: shift Q control point Y down by 6
      mouth.setAttribute('d', mouth.dataset.orig.replace(
        /(Q\s*[\d.]+,)([\d.]+)/,
        (_, pre, y) => pre + (parseFloat(y) + 6)
      ));
    }
    if (fire) fire.style.opacity = '1';
  } else if (mood === 'sad') {
    mascot.style.animation = 'deco-shake .5s ease-in-out';
    if (mouth && mouth.dataset.orig) {
      // Frown: shift Q control point Y up by 6
      mouth.setAttribute('d', mouth.dataset.orig.replace(
        /(Q\s*[\d.]+,)([\d.]+)/,
        (_, pre, y) => pre + (parseFloat(y) - 6)
      ));
    }
    if (tearL) { tearL.style.opacity = '1'; tearL.style.animation = 'deco-tear .9s ease-in forwards'; }
    if (tearR) { tearR.style.opacity = '1'; tearR.style.animation = 'deco-tear .9s ease-in forwards'; }
    if (fire) fire.style.opacity = '0';
  }

  _mascotTimer = setTimeout(() => {
    mascot.style.animation = 'deco-float 4s ease-in-out infinite';
    if (mouth && mouth.dataset.orig) mouth.setAttribute('d', mouth.dataset.orig);
    if (tearL) { tearL.style.opacity = '0'; tearL.style.animation = ''; }
    if (tearR) { tearR.style.opacity = '0'; tearR.style.animation = ''; }
    if (fire) fire.style.opacity = '0';
    _mascotTimer = null;
  }, 1500);
}
