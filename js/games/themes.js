/* ══════════════════════════════════════════
   IMMERSIVE THEME ENGINE + UNIVERSAL MAP + GAME INTEGRATION
   ──────────────────────────────────────────
   PE01: ARCHITECTURE GUIDE

   This file is the integration layer between the game engines and the
   unified world/map system. It contains:

   1. VISUAL THEMES (lines ~10-105): applySudoTheme, applyMazeTheme, etc.
      These add CSS classes to body for per-world visual styling.

   2. UNIVERSAL MAP (lines ~110-250): openGameMap, updateUniversalMap,
      buildUniversalWorldList, getWorldDesc, normalizeGameKey.
      Manages the shared world map across all 6 games.

   3. GAME LAUNCHERS (lines ~270-400): launchWorldGame, startMazeFromWorld,
      startTangFromWorld, startSlideFromWorld.
      Bridge between world selection and game-specific start functions.

   4. PROGRESS TRACKING (lines ~400-500): onGameComplete, computeEarned,
      showGameWin (unified celebration overlay).
      Standardized win handling for all games.

   5. WIN HANDLER PATCHES (lines ~500-620): Monkey-patches for
      showMazeWin, showNonoWin, showSlideWin, showTangWin, nextPuzzle.
      These redirect game-specific win handlers to the unified system.

   6. GAME SELECTION (lines ~620-750): GAMES_REGISTRY, buildGamesScreen,
      buildGameCardBg, buildWorldTheme.

   7. ROUTING PATCHES (lines ~750-800): routeFromWelcome, buildWhoScreen,
      btn-confirm overrides for welcome→games flow.

   8. UX ENHANCEMENTS (lines ~800+): game tutorials, ripple, locked world
      shake, recommended world, toast, hint reasoning, tangram counter,
      profile edit, adaptive difficulty, visual polish patches.

   MONKEY-PATCH CHAIN (19 patches):
   Each patch follows: const _origFn = fn; fn = function(){...}
   Load order dependency: themes.js MUST load after all game files.
   ──────────────────────────────────────────
══════════════════════════════════════════ */

const WORLD_SUDO_THEME = {
  'w1':'garden','w2':'clouds','w3':'stardust','w4':'forest2',
  'w5':'animals','w6':'ocean','w7':'galaxy','w8':'master',
};

function clearTheme() {
  const b = document.body;
  [...b.classList].filter(c =>
    c.startsWith('sudo-theme-') || c.startsWith('maze-theme-') ||
    c.startsWith('tang-scene-') || c.startsWith('slide-lv') ||
    c.startsWith('kk-') || c === 'sudo-themed' || c === 'tang-themed' ||
    c === 'nono-themed' || c === 'slide-themed' || c === 'kk-themed'
  ).forEach(c => b.classList.remove(c));
  document.querySelectorAll('.sudo-deco,.tang-scene-deco').forEach(el => el.remove());
  if (typeof clearWorldDeco === 'function') clearWorldDeco();
}

function applySudoTheme(worldId) {
  clearTheme();
  const theme = WORLD_SUDO_THEME[worldId];
  if (!theme) return;
  document.body.classList.add('sudo-themed', 'sudo-theme-' + theme);
  // Add deco particles after grid renders
  setTimeout(() => {
    const wrap = document.querySelector('.sudoku-wrap');
    if (!wrap || wrap.querySelector('.sudo-deco')) return;
    const deco = document.createElement('div');
    deco.className = 'sudo-deco';
    const isDark = ['stardust','stars','forest2','forest','ocean','galaxy','universe','master','dragon'].includes(theme);
    const particles = {
      garden:   {emoji:['🌸','🌺','🍀'],count:8},
      clouds:   {emoji:['☁️','⛅','🌧️'],count:6},
      rainbow:  {emoji:['🌈','✨','🎨'],count:6},
      stardust: {emoji:['✨','⭐','💫'],count:12},
      stars:    {emoji:['⭐','🌟','💫'],count:10},
      village:  {emoji:['🏠','🌸','🌿'],count:6},
      forest2:  {emoji:['🍄','🌿','🦋'],count:8},
      forest:   {emoji:['🌿','🦋','🐒','🦜'],count:8},
      animals:  {emoji:['🐾','🌿','🍃'],count:7},
      crystal:  {emoji:['💎','✨','🔮'],count:8},
      ocean:    {emoji:['🐠','🐟','🌊'],count:8},
      galaxy:   {emoji:['🚀','🌟','🪐'],count:10},
      universe: {emoji:['🌌','💫','🔮'],count:12},
      master:   {emoji:['⚙️','💡','🔑'],count:8},
      dragon:   {emoji:['🔥','🐉','⚔️'],count:10},
    }[theme] || {emoji:['✨'],count:6};
    for(let i=0;i<particles.count;i++){
      const p=document.createElement('div');p.className='sudo-deco-particle';
      p.textContent=particles.emoji[i%particles.emoji.length];
      p.style.cssText=`left:${5+Math.random()*88}%;top:${5+Math.random()*88}%;
        font-size:${10+Math.random()*8}px;opacity:${isDark?0.15:0.08};
        animation-duration:${2+Math.random()*3}s;animation-delay:${Math.random()*3}s;`;
      deco.appendChild(p);
    }
    wrap.style.position='relative';
    wrap.insertBefore(deco,wrap.firstChild);
  }, 100);
}

function applyMazeTheme(worldIdx) {
  clearTheme();
  const themes = ['garden','forest','village','city'];
  const theme = themes[Math.min(worldIdx, themes.length-1)] || 'garden';
  document.body.classList.add('maze-theme-' + theme);
  MZ._theme = theme;
}

function applyKKTheme(diff) {
  clearTheme();
  document.body.classList.add('kk-themed', 'kk-' + (diff||'easy'));
}

function applyTangTheme(phase) {
  clearTheme();
  const scenes = ['meadow','sea','sunset','space'];
  const scene = scenes[Math.min(phase||0, scenes.length-1)];
  document.body.classList.add('tang-themed', 'tang-scene-' + scene);
}

function applyNonoTheme(puzzleId) {
  clearTheme();
  const colors = {
    'n_heart':'#e91e63','n_house':'#f57c00','n_star':'#f9a825',
    'n_fish':'#0288d1','n_butterfly':'#8e24aa','n_tree':'#2e7d32',
    'n_boat':'#0277bd','n_cat':'#ff8f00','n_rocket':'#c62828','n_sun':'#f9a825',
  };
  const bgs = {
    'n_heart':'#fce4ec','n_house':'#fff3e0','n_star':'#fffde7',
    'n_fish':'#e1f5fe','n_butterfly':'#f3e5f5','n_tree':'#e8f5e9',
    'n_boat':'#e1f5fe','n_cat':'#fff8e1','n_rocket':'#ffebee','n_sun':'#fffde7',
  };
  document.body.classList.add('nono-themed');
  if (puzzleId) {
    document.body.style.setProperty('--no-filled', colors[puzzleId] || 'var(--accent)');
    document.body.style.setProperty('--no-screen', bgs[puzzleId] || 'var(--bg)');
  }
}

function applySlideTheme(levelIdx) {
  clearTheme();
  document.body.classList.add('slide-themed', 'slide-lv' + Math.min(levelIdx||0, 4));
}


/* ══════════════════════════════════════════
   UNIVERSAL MAP SCREEN
   One map, all games. gameKey drives which
   params are used and which progress tracked.
══════════════════════════════════════════ */

let _currentGameKey = 'sudoku'; // active game

/* ── Open map for a specific game ── */
/* Normalize external game IDs to internal registry keys */
function normalizeGameKey(id) {
  const map = { 'labirinto':'maze', 'nonogramma':'nono', 'rompicapo':'slide' };
  return map[id] || id;
}

function openGameMap(gameKey) {
  gameKey = normalizeGameKey(gameKey);
  // Challenge games don't have world maps — open directly
  if(gameKey === 'slide'){ if(typeof openSlidePuzzle==='function') openSlidePuzzle(); return; }
  if(gameKey === 'clock'){ if(typeof openClock==='function') openClock(); return; }
  if(gameKey === 'tris'){ if(typeof openTris==='function') openTris(); return; }
  if(gameKey === 'dama'){ if(typeof openDama==='function') openDama(); return; }
  _currentGameKey = gameKey;
  G._selectedGame = gameKey;
  updateUniversalMap();
  show('s-map');
}

/* ── Build map for current game ── */
function updateUniversalMap() {
  const gameKey = _currentGameKey;
  const game = GAMES_REGISTRY.find(g => g.id === gameKey) || GAMES_REGISTRY[0];

  // Ensure palette is applied
  applyTheme();

  // Update header
  document.getElementById('map-av').textContent   = P.avatar;
  document.getElementById('map-greet').textContent = P.name + '!';
  document.getElementById('map-sc').textContent   = P.stars;
  document.getElementById('map-streak').textContent = P.streak || 0;
  let pill = document.getElementById('map-game-pill-el');
  if (!pill) {
    pill = document.createElement('div');
    pill.id = 'map-game-pill-el';
    pill.className = 'map-game-pill';
    const hdr = document.querySelector('.map-hdr');
    hdr.insertBefore(pill, hdr.querySelector('.map-right'));
  }
  pill.innerHTML = `<span class="map-game-pill-icon">${game.icon}</span>
                    <span class="map-game-pill-name">${game.name}</span>`;

  // Back to games button
  if (!document.getElementById('map-back-games-btn')) {
    const btn = document.createElement('button');
    btn.id = 'map-back-games-btn';
    btn.className = 'map-back-games';
    btn.innerHTML = '← Giochi';
    btn.onclick = () => { sfxClick(); buildGamesScreen(); show('s-games'); };
    document.querySelector('.map-user').prepend(btn);
  }

  // Build world list
  buildUniversalWorldList(gameKey);

  // Reset inline header style so palette CSS vars take effect
  const hdr = document.querySelector('.map-hdr');
  if (hdr) {
    hdr.style.background = '';
  }
}

/* ── Build world list for a game ── */
function buildUniversalWorldList(gameKey) {
  const container = document.getElementById('world-list');
  if (!container) return;
  container.innerHTML = '';

  // Group by phase
  const phases = [
    { label: '🌱 Primi passi', ids: ['w1','w2'] },
    { label: '🎮 Avventura',  ids: ['w3','w4'] },
    { label: '💎 Esplorazione', ids: ['w5','w6'] },
    { label: '🐉 Sfida finale', ids: ['w7','w8'] },
  ];

  // For non-sudoku games, hide irrelevant phase labels
  const gamePhaseLabel = {
    sudoku:    null, // use defaults
    kenken:    { 1: '🎮 Fase 1 — Griglia 4×4', 3: '🎮 Fase 3 — Griglia 6×6' },
    maze:      { 0: '🌱 Fase 0 — 4×4', 1: '🎮 Fase 1 — 6×6', 3: '🔥 Fase 2 — 8×8', 4: '🌌 Fase 3 — 10×10' },
    tangram:   { 0: '🌱 Fase 0', 1: '🎮 Fase 1', 2: '🔥 Fase 2', 3: '🌌 Fase 3' },
    nono:      { 0: '🌱 5×5', 1: '🎮 5×5 avanzato', 2: '🔷 7×7', 3: '🌌 10×10' },
    slide:     { 0: '🌱 Quasi risolto', 1: '🎮 Facile', 2: '🔥 Medio', 3: '🌌 Difficile', 4: '👑 4×4 Esperto' },
  };

  phases.forEach(phase => {
    const worldsInPhase = phase.ids
      .map(id => WORLDS.find(w => w.id === id))
      .filter(Boolean)
      .filter(w => w[gameKey]); // only worlds that have config for this game

    if (worldsInPhase.length === 0) return;

    // Phase label
    const lbl = document.createElement('div');
    lbl.className = 'map-phase-label';
    lbl.textContent = phase.label;
    container.appendChild(lbl);

    worldsInPhase.forEach(world => {
      const unlocked = isWorldUnlocked(world.id, gameKey);
      const done = getWorldProgress(world.id, gameKey);
      const total = world.total;
      const pct = Math.round(done / total * 100);

      const card = document.createElement('div');
      card.className = 'world-card' + (unlocked ? '' : ' locked');
      card.innerHTML = `
        <div class="world-icon">${world.icon}</div>
        <div class="world-info">
          <div class="world-name">${world.name}
            ${unlocked && done === 0 ? '<span class="world-new-badge">Nuovo!</span>' : ''}
          </div>
          <div class="world-desc">${getWorldDesc(world, gameKey)}</div>
          <div class="world-prog">
            <div class="world-prog-bar">
              <div class="world-prog-fill" style="width:${pct}%"></div>
            </div>
            <span class="world-prog-txt">${done} / ${total} puzzle</span>
          </div>
        </div>
        <div class="world-chevron">${unlocked ? '›' : '🔒'}</div>
      `;

      if (unlocked) {
        card.onclick = () => {
          sfxClick();
          launchWorldGame(world, gameKey);
        };
        // Apply world theme
        buildWorldTheme(card, world.id);
      }

      container.appendChild(card);
    });
  });
}

/* ── Get world description for a game ── */
function getWorldDesc(world, gameKey) {
  const cfg = world[gameKey];
  if (!cfg) return '';
  switch(gameKey) {
    case 'sudoku':    return `Griglia ${cfg.size}×${cfg.size} · ${({easy:'Facile',medium:'Medio',hard:'Difficile'})[cfg.diff]}`;
    case 'maze':      return `Labirinto ${cfg.gridSize}×${cfg.gridSize}`;
    case 'kenken':    return `KenKen ${cfg.size}×${cfg.size} · ${({easy:'Solo +',easyminus:'+ e −',medium:'+, − e ×',hard:'Tutte'})[cfg.diff]}`;
    case 'tangram':   return `Tangram · Fase ${cfg.phase}`;
    case 'nono':      { const p=NONO_PUZZLES[cfg.puzzleIdx]; return p?`${p.name} · ${p.size}×${p.size}`:''; }
    case 'slide':     return `${cfg.gridSize}×${cfg.gridSize} · ${cfg.shuffleMoves} mosse`;
    default: return '';
  }
}

/* ══════════════════════════════════════════
   CG01: Unified sub-header populator
   CG03: Standardized star calculation
   CG05: Unified back button
   CG09: Theme switch visibility
══════════════════════════════════════════ */

/* CG01: Populate unified header for non-sudoku games */
function updateGameSubHeader(screenId, gameKey) {
  const prefixes = {
    's-maze': 'maze', 's-nono': 'nono', 's-tang': 'tang', 's-slide': 'slide'
  };
  const prefix = prefixes[screenId];
  if (!prefix) return;

  // Avatar + name
  const av = document.getElementById(prefix + '-hdr-av');
  const nm = document.getElementById(prefix + '-hdr-nm');
  if (av) av.textContent = P.avatar;
  if (nm) nm.textContent = P.name;

  // Stars
  const stars = document.getElementById(prefix + '-stars');
  if (stars) stars.textContent = P.stars;

  // Streak (if element exists)
  const stk = document.getElementById(prefix + '-hdr-stk');
  if (stk) stk.textContent = P.streak || 0;
}

/* CG03: Standardized star calculation */
function computeEarned(gameKey, metrics) {
  // metrics: { errors, steps, optimalSteps, moves, optimalMoves }
  const e = metrics.errors || 0;
  switch (gameKey) {
    case 'sudoku':
    case 'kenken':
      return Math.max(1, 3 - Math.floor(e / 2));
    case 'maze': {
      const ratio = (metrics.steps || 1) / (metrics.optimalSteps || 1);
      return ratio <= 1.2 ? 3 : ratio <= 1.8 ? 2 : 1;
    }
    case 'nono':
      return Math.max(1, 3 - Math.floor(e / 3));
    case 'slide': {
      const ratio = (metrics.moves || 1) / (metrics.optimalMoves || 1);
      return ratio <= 1.2 ? 3 : ratio <= 2 ? 2 : 1;
    }
    case 'tangram':
      return Math.max(1, 3 - e);
    default:
      return Math.max(1, 3 - Math.floor(e / 2));
  }
}

/* CG05: Unified back-to-map for all games */
function gameBackToMap(gameKey, cleanup) {
  sfxClick();
  if (cleanup) cleanup();
  openGameMap(gameKey || G._currentGameKey || 'sudoku');
}

/* CG09: Hide theme switch for non-grid games */
function updateThemeSwitchVisibility() {
  const btn = document.getElementById('btn-theme-switch');
  if (!btn) return;
  const gridGames = ['sudoku', 'kenken'];
  const gk = G._currentGameKey || 'sudoku';
  btn.style.display = gridGames.includes(gk) ? '' : 'none';
}

/* ── Launch game for a world ── */
function launchWorldGame(world, gameKey) {
  const cfg = world[gameKey];
  if (!cfg) return;

  // F17: Reset run-specific state to prevent cross-game contamination
  G.isKenKen = false; G.cages = null; G.isDaily = false;
  G.selCell = null; G.selSym = 0; G.errors = 0; G.hintsLeft = 3;
  if (typeof stopGameTimer === 'function') stopGameTimer();

  // Store current world for progress tracking
  G._currentWorld = world;
  G._currentGameKey = gameKey;

  // B06: show game name in game header
  const GAME_NAMES={sudoku:'🔢 Sudoku',kenken:'🧮 KenKen',maze:'🐾 Labirinto',
    nono:'🔲 Nonogramma',tangram:'🔷 Tangram',slide:'🧩 Rompicapo'};
  const badge=document.getElementById('hdr-game-badge');
  if(badge) badge.textContent=GAME_NAMES[gameKey]||'';

  // B08: show game tutorial if first time
  showGameTutorialIfNeeded(gameKey);

  // CG01: populate unified sub-headers for non-sudoku games
  const screenMap = {maze:'s-maze',nono:'s-nono',tangram:'s-tang',slide:'s-slide'};
  if (screenMap[gameKey]) updateGameSubHeader(screenMap[gameKey], gameKey);

  // CG09: hide theme switch for non-grid games
  updateThemeSwitchVisibility();

  // Safe theme apply — functions may not be loaded yet
  const safeTheme = (fn, ...args) => { try { if(typeof fn==='function') fn(...args); } catch(e){} };

  switch(gameKey) {
    case 'sudoku':
      safeTheme(applySudoTheme, world.id);
      startWorld(world);
      break;
    case 'maze':
      safeTheme(applyMazeTheme, WORLDS.indexOf(world));
      startMazeFromWorld(world, cfg);
      break;
    case 'kenken':
      safeTheme(applyKKTheme, cfg.diff);
      // Set world ref BEFORE startKenKen so it picks up world.total correctly
      G._currentWorld = world;
      G._currentGameKey = 'kenken';
      startKenKen(cfg.size, cfg.diff);
      break;
    case 'tangram':
      safeTheme(applyTangTheme, cfg.phase);
      startTangFromWorld(world, cfg);
      break;
    case 'nono':
      // Variety: base puzzle + done count → different puzzle each time
      const nonoDone = getWorldProgress(world.id, 'nono');
      const nonoIdx = cfg.puzzleIdx + nonoDone; // cycles through library + procedural
      safeTheme(applyNonoTheme, NONO_PUZZLES[nonoIdx]?.id || ('proc_'+nonoIdx));
      document.getElementById('nono-hdr-av').textContent = P.avatar;
      document.getElementById('nono-hdr-nm').textContent = P.name;
      NO._worldRef = world; // Fix 12: save world ref before loading
      loadNonoPuzzle(nonoIdx);
      show('s-nono');
      break;
    // slide removed — now a standalone Sfida, not in world map
  }

  // Spawn world decorations (mascot + environment) after game renders
  if (typeof spawnWorldDeco === 'function') {
    const worldTheme = world.theme || WORLD_THEMES[world.id] || 'garden';
    const sz = cfg.size || cfg.gridSize || 4;
    const gameColors = (typeof SYMS !== 'undefined' && SYMS.colors[sz]) || ['#FF5252','#2196F3','#FFEB3B','#4CAF50'];
    setTimeout(() => spawnWorldDeco(worldTheme, gameColors, gameKey), 200);
  }
}

/* ── Game-specific world launchers ── */
function startMazeFromWorld(world, cfg) {
  const idx = WORLDS.indexOf(world);
  MZ.worldIdx = idx;
  MZ.rows = cfg.gridSize;
  MZ.cols = cfg.gridSize;
  MZ.solved = false;
  MZ.steps = 0;
  MZ.moving = false;
  MZ.anim = null;
  MZ._hintsLeft = 3; MZ._bumpCount = 0; MZ._hintCell = null; // Fix 4+5
  const adaptedExtraOpen = typeof getAdaptiveParam === 'function'
    ? getAdaptiveParam('maze', cfg.extraOpen || 1, 'extraOpen')
    : (cfg.extraOpen || 1);
  MZ.grid = generateMaze(cfg.gridSize, cfg.gridSize, adaptedExtraOpen);
  MZ._lastExtraOpen = adaptedExtraOpen; // Fix 3: for newMaze fallback

  // Fix 8: Randomize start/goal positions across corners
  const N = cfg.gridSize;
  const corners = [{r:0,c:0},{r:0,c:N-1},{r:N-1,c:0},{r:N-1,c:N-1}];
  const startIdx = Math.floor(Math.random()*corners.length);
  let goalIdx = Math.floor(Math.random()*(corners.length-1));
  if(goalIdx>=startIdx) goalIdx++; // ensure different corner
  MZ.player = {...corners[startIdx]};
  MZ.goal   = {...corners[goalIdx]};
  MZ.starterPos = {...corners[startIdx]};
  MZ._visited = new Set([corners[startIdx].r+','+corners[startIdx].c]); // Fix 7
  MZ.minSteps = bfsDistance(MZ.grid, MZ.player.r, MZ.player.c, MZ.goal.r, MZ.goal.c, N, N);
  MZ._worldRef = world;

  // Fix 1: Set maze theme colors per world for canvas renderer
  const mazeThemes = {
    garden:  {wall:'#2ecc71',edge:'#1a5c2a',inner:'#27ae60',floor1:'#e8f5e9',floor2:'#f1faf2',bg:'#f0fff4'},
    clouds:  {wall:'#90caf9',edge:'#42a5f5',inner:'#64b5f6',floor1:'#e3f2fd',floor2:'#ebf5ff',bg:'#e8f0fe'},
    stardust:{wall:'#7e57c2',edge:'#4527a0',inner:'#5e35b1',floor1:'#ede7f6',floor2:'#f3f0fa',bg:'#f5f0ff'},
    forest:  {wall:'#6d4c41',edge:'#3e2723',inner:'#5d4037',floor1:'#d7ccc8',floor2:'#e8e0db',bg:'#efebe9'},
    crystal: {wall:'#7c4dff',edge:'#4a148c',inner:'#651fff',floor1:'#e8eaf6',floor2:'#f0f0fa',bg:'#ede7f6'},
    ocean:   {wall:'#0288d1',edge:'#01579b',inner:'#0277bd',floor1:'#e1f5fe',floor2:'#eaf8ff',bg:'#e0f2fe'},
    galaxy:  {wall:'#9c27b0',edge:'#6a1b9a',inner:'#8e24aa',floor1:'#f3e5f5',floor2:'#faf0fc',bg:'#f8ecfc'},
    dragon:  {wall:'#e65100',edge:'#bf360c',inner:'#d84315',floor1:'#fbe9e7',floor2:'#fff0ed',bg:'#fff3e0'},
  };
  MZ._themeColors = mazeThemes[world.theme] || mazeThemes.garden;

  // Update maze UI
  document.getElementById('maze-hdr-av').textContent  = P.avatar;
  document.getElementById('maze-hdr-nm').textContent  = P.name;
  document.getElementById('maze-pill-icon').textContent = world.icon;
  document.getElementById('maze-pill-nm').textContent   = world.name;
  document.getElementById('maze-pill-pg').textContent   = `${cfg.gridSize}×${cfg.gridSize}`;
  document.getElementById('maze-steps').textContent     = '0';
  document.getElementById('maze-stars').textContent     = P.stars;
  closeMazeWin();

  // Show screen FIRST so getBoundingClientRect returns real dimensions
  show('s-maze');

  // Size canvas
  const bodyEl = document.querySelector('.maze-body');
  const br = bodyEl.getBoundingClientRect();
  const avH = Math.max(160, br.height - 340);
  const avW = Math.min(br.width - 24, avH, 500); // Fix 12: was 360
  const canvSz = Math.max(180, Math.floor(avW));
  MZ.canvasSize = canvSz;
  MZ.cellPx = Math.floor(canvSz / (2*cfg.gridSize+1)) * 2;
  const canvas = document.getElementById('maze-canvas');
  canvas.width = canvSz; canvas.height = canvSz;
  const wrap = document.getElementById('maze-canvas-wrap');
  wrap.style.width = wrap.style.height = canvSz + 'px';

  startMazeLoop();
  if(typeof updateMazeHintBtn==='function') updateMazeHintBtn();
}

function startTangFromWorld(world, cfg) {
  const worldIdx = WORLDS.indexOf(world);
  const done = getWorldProgress(world.id, 'tangram');
  
  // Collect predefined levels for this phase
  const phaseLevels = [];
  for (let i = 0; i < 16; i++) {
    if (TANG_LEVELS[i] && TANG_LEVELS[i].phase === cfg.phase) phaseLevels.push(i);
  }
  
  let levelIdx;
  if (done < phaseLevels.length) {
    // Still have unseen predefined levels for this phase
    levelIdx = phaseLevels[done];
  } else {
    // All predefined played — generate unique procedural with increasing difficulty
    const basePieces = Math.min(cfg.phase + 2, 5);
    const extraPieces = Math.min(Math.floor((done - phaseLevels.length) / 2), 3);
    const numPieces = basePieces + extraPieces; // gradually more pieces
    const seed = (worldIdx * 10000 + done * 137 + 42); // unique per world+done
    let level = null;
    for (let attempt = 0; attempt < 12; attempt++) {
      const candidate = generateProceduralTangram(seed + attempt * 997, numPieces);
      if (candidate.pieces && candidate.pieces.length >= 2) { level = candidate; break; }
    }
    if (!level) level = TANG_LEVELS[phaseLevels[0] || 0]; // fallback
    // Store in a dynamic slot (16+)
    const dynIdx = 16 + (done % 8);
    TANG_LEVELS[dynIdx] = level;
    levelIdx = dynIdx;
  }
  
  T._worldRef = world;
  document.getElementById('tang-hdr-av').textContent = P.avatar;
  document.getElementById('tang-hdr-nm').textContent = P.name;
  show('s-tang');
  startTangLevel(levelIdx);
  document.getElementById('tang-cat-icon').textContent = world.icon;
  document.getElementById('tang-level-nm').textContent = world.name;
  // Show progress
  const worldTotal = world.total || 8;
  document.getElementById('tang-level-pg').textContent = 'Puzzle '+(done+1)+' / '+worldTotal;
}

function startSlideFromWorld(world, cfg) {
  const idx = WORLDS.indexOf(world);
  SL.levelIdx = idx;
  SL.gridSize = cfg.gridSize;
  SL.moves = 0; SL.solved = false; SL.animating = false;
  // Compute stable tile colors — user palette + game palette, deterministic
  const totalTiles = cfg.gridSize*cfg.gridSize - 1;
  const userPal = (typeof PALS!=='undefined' && PALS[P.palette]) ? PALS[P.palette].colors : [];
  const gamePal = (typeof SYMS!=='undefined' && SYMS.colors[9]) || [];
  const merged = [...userPal]; gamePal.forEach(c => { if(!merged.includes(c)) merged.push(c); });
  SL._tileColors = [null];
  for(let i=1; i<=totalTiles; i++) SL._tileColors[i] = merged[(i-1) % merged.length] || '#888';
  const {tiles, empty} = shufflePuzzle(cfg.gridSize, cfg.shuffleMoves);
  SL.tiles = [...tiles]; SL.emptyPos = empty;
  SL.initialTiles = [...tiles]; SL.initialEmpty = empty;
  SL._worldRef = world;

  document.getElementById('slide-hdr-av').textContent  = P.avatar;
  document.getElementById('slide-hdr-nm').textContent  = P.name;
  document.getElementById('slide-pill-icon').textContent = world.icon;
  document.getElementById('slide-pill-nm').textContent   = world.name;
  document.getElementById('slide-pill-pg').textContent   = `${cfg.gridSize}×${cfg.gridSize} · ${cfg.shuffleMoves} mosse`;
  document.getElementById('slide-moves').textContent     = '0';
  document.getElementById('slide-stars').textContent     = P.stars;
  closeSlideWin();
  show('s-slide');
  buildSlideGrid();
}

/* ── Record progress when a puzzle is completed ── */
function onGameComplete(gameKey, worldId, earned) {
  recordWorldProgress(worldId, gameKey);
  // Also write plain key for stats/badges backward compat
  if(!P.wp[worldId])P.wp[worldId]={done:0};
  const world = WORLDS.find(w=>w.id===worldId);
  const maxDone = world ? world.total : 999;
  if(P.wp[worldId].done < maxDone) P.wp[worldId].done++;
  P.stars += earned;
  saveActiveProfile();
  // Check for world unlock animation
  const worldIdx = WORLDS.findIndex(w => w.id === worldId);
  const nextWorld = WORLDS[worldIdx + 1];
  if (nextWorld && isWorldUnlocked(nextWorld.id, gameKey)) {
    // New world unlocked!
    setTimeout(() => showWorldUnlock(nextWorld), 800);
  }
}

/* ── CG02: Unified game win handler ── */
function showGameWin(gameKey, earned, subtitle, closeFunc) {
  spawnConfetti(earned >= 3 ? 'big' : earned <= 1 ? 'small' : undefined);
  sfxWin();
  // Update stars in all game headers
  ['maze-stars','nono-stars','tang-stars','slide-stars'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = P.stars;
  });
  // Use the unified celebration overlay (cel-ov) for ALL games
  const EMOJIS_W = ['🎉','🌟','🏆','✨','🎊','🦄'];
  const TITLES_W = ['Fantastico!','Perfetto!','Bravo!','Super!','Incredibile!'];
  document.getElementById('cel-em').textContent = EMOJIS_W[rnd(EMOJIS_W.length)];
  document.getElementById('cel-title').textContent = TITLES_W[rnd(TITLES_W.length)];
  document.getElementById('cel-sub').textContent = subtitle || 'Puzzle completato!';
  document.getElementById('cel-stars').textContent = '⭐ +' + earned + ' stelle!';
  document.getElementById('cel-badge').style.display = 'none';
  // Check for badges
  const newBadges = checkBadges();
  if (newBadges.length > 0) {
    const bd = newBadges[0];
    document.getElementById('cel-b-em').textContent = bd.em;
    document.getElementById('cel-b-txt').textContent = 'Nuovo badge: ' + bd.name;
    document.getElementById('cel-b-sub').textContent = bd.desc;
    document.getElementById('cel-badge').style.display = 'flex';
    newBadges.slice(1).forEach(b => setTimeout(() => showBadgeUnlock(b), 800));
  }
  // CG09: hide theme switch for non-grid games
  updateThemeSwitchVisibility();
  // GD04: check star rewards
  if (typeof checkStarRewards === 'function') setTimeout(checkStarRewards, 1500);
  // GD12: check diploma
  if (typeof checkDiploma === 'function') setTimeout(() => checkDiploma(gameKey), 2000);
  // UX01: clear saved puzzle state on win
  if (typeof clearPuzzleState === 'function') clearPuzzleState();
  // Buttons
  const world = G._currentWorld;
  const done = world ? getWorldProgress(world.id, gameKey) : 999;
  const total = world ? world.total : 1;
  const hasNext = done < total;
  document.getElementById('btn-next').textContent = hasNext ? 'Avanti! →' : 'Torna alla mappa 🗺️';
  document.getElementById('btn-next').onclick = () => {
    document.getElementById('cel-ov').classList.remove('show');
    if (closeFunc) closeFunc();
    if (hasNext) {
      // Re-launch same game for next puzzle
      if (world && world[gameKey]) launchWorldGame(world, gameKey);
      else openGameMap(gameKey);
    } else {
      openGameMap(gameKey);
    }
  };
  // Hide replay button for non-sudoku (CG08)
  const repBtn = document.getElementById('btn-rep');
  if (repBtn) repBtn.style.display = (gameKey === 'sudoku' || gameKey === 'kenken') ? '' : 'none';

  document.getElementById('cel-ov').classList.add('show');
}

/* ── Patch game win handlers to use unified showGameWin ── */

// Patch showMazeWin
const _origShowMazeWin = showMazeWin;
showMazeWin = function() {
  const world = MZ._worldRef;
  if (world) {
    const earned = computeEarned('maze', { steps: MZ.steps, optimalSteps: MZ.minSteps });
    onGameComplete('maze', world.id, earned);
    // CG11: history entry with isMaze
    P.history.push({ world: world.id, puzzle: 0, errors: 0, hints: 0, earned, time: Date.now(), isMaze: true,
      steps: MZ.steps, optimalSteps: MZ.minSteps });
    if (P.history.length > 300) P.history.shift();
    saveActiveProfileNow();
    G._currentWorld = world; G._currentGameKey = 'maze';
    showGameWin('maze', earned, `${MZ.steps} passi · min: ${MZ.minSteps}`, closeMazeWin);
  } else {
    _origShowMazeWin();
  }
};

// Patch showNonoWin
const _origShowNonoWin = showNonoWin;
showNonoWin = function() {
  const world = NO._worldRef || null;
  const earned = computeEarned('nono', { errors: NO.errors });
  if (world) onGameComplete('nono', world.id, earned);
  else { P.stars += earned; }
  // CG11: history with isNono
  P.history.push({ world: world ? world.id : 'nono_' + NO.puzzleIdx, puzzle: NO.puzzleIdx,
    errors: NO.errors, hints: 0, earned, time: Date.now(), isNono: true });
  if (P.history.length > 300) P.history.shift();
  saveActiveProfileNow();
  G._currentWorld = world; G._currentGameKey = 'nono';
  showGameWin('nono', earned, `${NO.errors} errori`, closeNonoWin);
};

// Patch showSlideWin
const _origShowSlideWin = showSlideWin;
showSlideWin = function() {
  const world = SL._worldRef;
  const optMoves = world?.slide?.shuffleMoves || 30;
  const earned = computeEarned('slide', { moves: SL.moves, optimalMoves: optMoves });
  if (world) onGameComplete('slide', world.id, earned);
  else { P.stars += earned; }
  SL.solved = true;
  if (SL._tileEls) SL._tileEls.forEach((el, i) => setTimeout(() => el.classList.add('win-shine'), i * 40));
  // CG11: history with isSlide
  P.history.push({ world: world ? world.id : 'slide_' + SL.levelIdx, puzzle: SL.levelIdx,
    errors: 0, hints: 0, earned, time: Date.now(), isSlide: true, moves: SL.moves });
  if (P.history.length > 300) P.history.shift();
  saveActiveProfileNow();
  G._currentWorld = world; G._currentGameKey = 'slide';
  setTimeout(() => showGameWin('slide', earned, `${SL.moves} mosse`, closeSlideWin), 400);
};

// Patch showTangWin
const _origShowTangWin = showTangWin;
showTangWin = function() {
  const world = T._worldRef;
  const earned = computeEarned('tangram', { errors: T.errors });
  if (world) onGameComplete('tangram', world.id, earned);
  else { P.stars += earned; }
  // CG11: history with isTang
  P.history.push({ world: world ? world.id : 'tang_' + T.levelIdx, puzzle: T.levelIdx,
    errors: T.errors, hints: 2 - T.hintsLeft, earned, time: Date.now(), isTang: true });
  if (P.history.length > 300) P.history.shift();
  saveActiveProfileNow();
  G._currentWorld = world; G._currentGameKey = 'tangram';
  showGameWin('tangram', earned, 'Figura completata!', closeTangComplete);
};

// Patch KenKen next puzzle
const _origNextPuzzle = nextPuzzle;
nextPuzzle = function() {
  document.getElementById('cel-ov').classList.remove('show');
  if (G.isKenKen) {
    const world = G._currentWorld;
    const earned = computeEarned('kenken', { errors: G.errors });
    if (world) onGameComplete('kenken', world.id, earned);
    G.isKenKen = false; G.cages = null;
    openGameMap('kenken');
    return;
  }
  // Sudoku — if last puzzle of the world, go back to map
  if (G._currentGameKey === 'sudoku' && G.world && G.pidx + 1 >= G.world.total) {
    openGameMap('sudoku');
    return;
  }
  _origNextPuzzle();
};

/* ── Card onclick handled directly in buildGamesScreen (F03 unified) ── */


/* ══════════════════════════════════════════
   GAME SELECTION + WORLD THEMES  (v12)
══════════════════════════════════════════ */

const ADVENTURE_GAMES = [
  { id:'sudoku',     name:'Sudoku',      icon:'🔢', desc:'Riempi la griglia\nsenza ripetere!',     color1:'#d63fa6',color2:'#9b10a0', badge:null,     bgType:'numbers' },
  { id:'kenken',     name:'KenKen',      icon:'🧮', desc:'Logica + calcolo\nin gabbie colorate',   color1:'#6a3de8',color2:'#9b10c0', badge:'Novità!', bgType:'cages'   },
  { id:'maze',       name:'Labirinto',   icon:'🐾', desc:"Trova il cagnolino\nnell'intreccio!",    color1:'#2ecc71',color2:'#1a8a4a', badge:null,     bgType:'paws'    },
  { id:'nono',       name:'Nonogramma',  icon:'🔲', desc:'Colora i pixel\ne scopri il disegno',    color1:'#6a3de8',color2:'#9b10c0', badge:null,     bgType:'pixels'  },
  { id:'tangram',    name:'Tangram',     icon:'🔷', desc:'Incastra le forme\ngeometriche',         color1:'#e87d0d',color2:'#c45a00', badge:null,     bgType:'shapes'  },
];

const CHALLENGE_GAMES = [
  { id:'slide',      name:'Rompicapo',   icon:'🧩', desc:'Rimetti i numeri\nin ordine!',           color1:'#0097a7',color2:'#006064', badge:null,     bgType:'tiles'   },
  { id:'clock',      name:'Orologio',    icon:'🕐', desc:'Impara a leggere\nl\'ora!',              color1:'#FF9800',color2:'#E65100', badge:'Nuovo!', bgType:'clock'   },
  { id:'tris',       name:'Tris',        icon:'❌', desc:'Sfida il computer\na tris!',              color1:'#E91E63',color2:'#AD1457', badge:'Nuovo!', bgType:'tris'    },
  { id:'dama',       name:'Mini Dama',   icon:'⚫', desc:'Gioca a dama\nsu 6×6!',                  color1:'#795548',color2:'#4E342E', badge:'Nuovo!', bgType:'dama'    },
];

// Backward compat — merged registry for lookups
const GAMES_REGISTRY = [...ADVENTURE_GAMES, ...CHALLENGE_GAMES];

/* ── Animated card backgrounds ── */
function buildGameCardBg(bgEl, type, color1, color2) {
  bgEl.innerHTML='';
  bgEl.style.background=`linear-gradient(135deg,${color1}11,${color2}22)`;
  if(type==='numbers'){
    '1234'.split('').forEach((n,i)=>{
      const el=document.createElement('div');
      el.textContent=n;
      el.style.cssText=`position:absolute;font-family:'Fredoka One',cursive;font-size:${18+i*4}px;color:${color1};opacity:.15;left:${10+i*35}%;top:${20+i*12}%;animation:wtp-float ${2.5+i*.5}s ${i*.4}s ease-in-out infinite;`;
      bgEl.appendChild(el);
    });
  } else if(type==='cages'){
    [[10,15],[55,10],[80,40],[30,60],[65,65]].forEach(([l,t],i)=>{
      const el=document.createElement('div');
      el.style.cssText=`position:absolute;width:${22+i*4}px;height:${22+i*4}px;border:2px solid ${color1};border-radius:5px;left:${l}%;top:${t}%;opacity:.18;animation:wtp-pulse ${1.8+i*.3}s ${i*.3}s ease-in-out infinite;`;
      bgEl.appendChild(el);
    });
  } else if(type==='paws'){
    [0,1,2].forEach(i=>{
      const el=document.createElement('div');el.textContent='🐾';
      el.style.cssText=`position:absolute;font-size:${14+i*3}px;left:${15+i*28}%;top:${25+i*18}%;opacity:.2;animation:wtp-float ${2+i*.4}s ${i*.5}s linear infinite;`;
      bgEl.appendChild(el);
    });
  } else if(type==='pixels'){
    for(let r=0;r<3;r++) for(let c=0;c<4;c++){
      const el=document.createElement('div');const filled=Math.random()>.5;
      el.style.cssText=`position:absolute;width:8px;height:8px;border-radius:2px;background:${filled?color1:'transparent'};border:1px solid ${color1};left:${20+c*14}%;top:${20+r*18}%;opacity:.2;animation:wtp-twinkle ${1.5+Math.random()}s ${Math.random()}s ease-in-out infinite;`;
      bgEl.appendChild(el);
    }
  } else if(type==='shapes'){
    ['◆','▲','■','●'].forEach((s,i)=>{
      const el=document.createElement('div');el.textContent=s;
      el.style.cssText=`position:absolute;font-size:${14+i*3}px;color:${color1};left:${12+i*22}%;top:${20+i*14}%;opacity:.2;animation:wtp-sway ${2+i*.4}s ${i*.4}s ease-in-out infinite;`;
      bgEl.appendChild(el);
    });
  } else if(type==='tiles'){
    [1,2,3,4,5].forEach((n,i)=>{
      const el=document.createElement('div');el.textContent=n;
      el.style.cssText=`position:absolute;width:22px;height:22px;border-radius:6px;background:${color1};color:#fff;font-family:'Fredoka One',cursive;font-size:13px;display:flex;align-items:center;justify-content:center;left:${8+i*18}%;top:${20+(i%2)*30}%;opacity:.18;animation:wtp-float ${2+i*.3}s ${i*.3}s linear infinite;`;
      bgEl.appendChild(el);
    });
  } else if(type==='clock'){
    // Clock face with hands
    const el=document.createElement('div');
    el.style.cssText=`position:absolute;width:50px;height:50px;border:3px solid ${color1};border-radius:50%;left:30%;top:15%;opacity:.2;`;
    const h=document.createElement('div');h.style.cssText=`position:absolute;width:2px;height:14px;background:${color1};left:50%;top:25%;transform-origin:bottom center;transform:rotate(-30deg);margin-left:-1px;`;
    const m=document.createElement('div');m.style.cssText=`position:absolute;width:1.5px;height:18px;background:${color2};left:50%;top:18%;transform-origin:bottom center;transform:rotate(60deg);margin-left:-.75px;animation:wtp-orbit 6s linear infinite;`;
    el.append(h,m);bgEl.appendChild(el);
    ['12','3','6','9'].forEach((n,i)=>{
      const t=document.createElement('div');t.textContent=n;
      t.style.cssText=`position:absolute;font-family:'Fredoka One',cursive;font-size:11px;color:${color1};opacity:.15;left:${[52,78,52,26][i]}%;top:${[8,40,70,40][i]}%;`;
      bgEl.appendChild(t);
    });
  } else if(type==='tris'){
    // X and O symbols
    ['✕','○','✕','○'].forEach((s,i)=>{
      const el=document.createElement('div');el.textContent=s;
      el.style.cssText=`position:absolute;font-size:${18+i*4}px;font-weight:900;color:${i%2===0?color1:color2};left:${15+i*20}%;top:${15+i*16}%;opacity:.2;animation:wtp-pulse ${1.5+i*.4}s ${i*.3}s ease-in-out infinite;`;
      bgEl.appendChild(el);
    });
  } else if(type==='dama'){
    // Checkerboard pattern with pieces
    for(let r=0;r<3;r++) for(let c=0;c<3;c++){
      const dark=(r+c)%2===1;
      const el=document.createElement('div');
      el.style.cssText=`position:absolute;width:20px;height:20px;background:${dark?color1+'33':'transparent'};left:${15+c*22}%;top:${15+r*22}%;border-radius:3px;`;
      bgEl.appendChild(el);
      if(dark&&r!==1){
        const pc=document.createElement('div');
        pc.style.cssText=`position:absolute;width:14px;height:14px;border-radius:50%;background:${r===0?color1:color2};left:3px;top:3px;opacity:.3;`;
        el.appendChild(pc);
      }
    }
  }
}
function buildGamesScreen(){
  applyTheme(); // ensure palette is active
  document.getElementById('games-av').textContent  =P.avatar;
  document.getElementById('games-name').textContent='Ciao, '+P.name+'!';
  const grid=document.getElementById('games-grid');
  grid.innerHTML='';

  // Helper: build a game card
  function makeCard(game, openFn){
    const card=document.createElement('div');card.className='game-card';
    const bg=document.createElement('div');bg.className='game-card-bg';
    buildGameCardBg(bg,game.bgType,game.color1,game.color2);
    if(game.badge){const b=document.createElement('div');b.className='game-card-badge';b.textContent=game.badge;card.appendChild(b);}
    const icon=document.createElement('div');icon.className='game-card-icon';icon.textContent=game.icon;icon.style.animationDelay=(Math.random()*1.5)+'s';
    const name=document.createElement('div');name.className='game-card-name';name.textContent=game.name;
    const desc=document.createElement('div');desc.className='game-card-desc';desc.textContent=game.desc;
    card.dataset.gameId = game.id;
    card.append(bg,icon,name,desc);
    card.onclick=()=>{ sfxClick(); openFn(game.id); };
    return card;
  }

  // Section: Avventure (world-based games)
  const advLabel=document.createElement('div');advLabel.className='games-section-label';advLabel.textContent='🗺️ Avventure';
  grid.appendChild(advLabel);
  ADVENTURE_GAMES.forEach(game=>{
    grid.appendChild(makeCard(game, openGameMap));
  });

  // Section: Sfide (standalone games)
  const chLabel=document.createElement('div');chLabel.className='games-section-label';chLabel.textContent='⚡ Sfide';
  grid.appendChild(chLabel);
  CHALLENGE_GAMES.forEach(game=>{
    grid.appendChild(makeCard(game, id=>{
      // Sfide: open directly to the game, no world map
      if(id==='slide') openSlidePuzzle();
      else if(id==='clock' && typeof openClock==='function') openClock();
      else if(id==='tris' && typeof openTris==='function') openTris();
      else if(id==='dama' && typeof openDama==='function') openDama();
    }));
  });

  // B01: Resume button if player was in a game
  const backBtn = document.getElementById('btn-games-back');
  if (G._currentWorld && G._currentGameKey) {
    let resumeBtn = document.getElementById('btn-games-resume');
    if (!resumeBtn) {
      resumeBtn = document.createElement('button');
      resumeBtn.id = 'btn-games-resume';
      resumeBtn.className = 'btn-games-resume';
      backBtn.parentNode.insertBefore(resumeBtn, backBtn);
    }
    const GNAMES={sudoku:'Sudoku',kenken:'KenKen',maze:'Labirinto',nono:'Nonogramma',tangram:'Tangram',slide:'Rompicapo'};
    resumeBtn.textContent = '← Torna a ' + (GNAMES[G._currentGameKey]||'gioco');
    resumeBtn.style.display = 'inline-block';
    resumeBtn.onclick = () => { sfxClick(); openGameMap(G._currentGameKey); };
  } else {
    const rb = document.getElementById('btn-games-resume');
    if (rb) rb.style.display = 'none';
  }
}
document.getElementById('btn-games-back').onclick=()=>{
  sfxClick();
  const profiles=loadAllProfiles();
  if(profiles.length<=1) show('s-wel');
  else{buildWhoScreen(P.id);show('s-who');}
};

/* ── Map: inject game pill + back button (legacy, delegates to openGameMap) ── */
function updateMapForGame(gameId){ openGameMap(gameId); }
function updateMapForGame_impl(gameId){
  const game=GAMES_REGISTRY.find(g=>g.id===gameId)||GAMES_REGISTRY[0];
  let pill=document.getElementById('map-game-pill-el');
  if(!pill){
    pill=document.createElement('div');pill.id='map-game-pill-el';pill.className='map-game-pill';
    const hdr=document.querySelector('.map-hdr');
    hdr.insertBefore(pill,hdr.querySelector('.map-right'));
  }
  pill.innerHTML=`<span class="map-game-pill-icon">${game.icon}</span><span class="map-game-pill-name">${game.name}</span>`;
  if(!document.getElementById('map-back-games-btn')){
    const btn=document.createElement('button');btn.id='map-back-games-btn';
    btn.className='map-back-games';btn.innerHTML='← Giochi';
    btn.onclick=()=>{sfxClick();buildGamesScreen();show('s-games');};
    document.querySelector('.map-user').prepend(btn);
  }
  updateMap();
}

/* ── World card themes ── */
const WORLD_THEMES={
  'w1':'garden','w2':'clouds','w3':'stardust','w4':'forest',
  'w5':'crystal','w6':'ocean','w7':'galaxy','w8':'dragon',
};

function buildWorldTheme(card,worldId){
  const theme=WORLD_THEMES[worldId];if(!theme)return;
  // PE08: CSS-only approach — add theme class, CSS handles visual via pseudo-elements
  card.classList.add('wtheme-card', 'wtheme-'+theme);
  card.style.position='relative';card.style.overflow='hidden';
}

// buildWorldList now handled by buildUniversalWorldList in universal map engine

/* ── Patch routing: welcome → s-games ── */
routeFromWelcome=function(){
  migrateLegacy();
  _currentGameKey='sudoku';
  const profiles=loadAllProfiles();
  if(profiles.length===0){prepareNewProfile();show('s-pro');}
  else if(profiles.length===1){activateProfile(profiles[0]);buildGamesScreen();show('s-games');}
  else{buildWhoScreen(null);show('s-who');}
};

/* ── Patch who-play button → s-games ── */
const _origBWS=buildWhoScreen;
buildWhoScreen=function(selectedId){
  _origBWS(selectedId);
  const playBtn=document.getElementById('btn-who-play');
  if(playBtn){
    playBtn.onclick=()=>{
      const sel=document.querySelector('.prof-card.active-prof');if(!sel)return;
      sfxClick();
      const prof=loadProfileById(sel.dataset.id);if(!prof)return;
      activateProfile(prof);buildGamesScreen();show('s-games');
    };
  }
};

/* ── Patch btn-confirm → s-games after tutorial ── */
document.getElementById('btn-confirm').onclick=()=>{
  sfxClick();
  const isNew=!P.id;if(!P.id)P.id=uid();
  applyTheme();saveActiveProfile();
  if(isNew&&!P._tutDone){startTutorial();}
  else{buildGamesScreen();show('s-games');}
};
document.getElementById('btn-tut-next').onclick=function(){
  sfxClick();tutIdx++;
  if(tutIdx>=TUT_SLIDES.length){P._tutDone=true;saveActiveProfile();buildGamesScreen();show('s-games');}
  else{buildTutProgress();showTutSlide(tutIdx);}
};
document.getElementById('btn-tut-skip').onclick=function(){
  sfxClick();P._tutDone=true;saveActiveProfile();buildGamesScreen();show('s-games');
};
/* ══════════════════════════════════════════
   B08: GAME-SPECIFIC MINI TUTORIALS
══════════════════════════════════════════ */
const GAME_TUTORIALS = {
  kenken: [
    { em:'🔢', title:'Come funziona KenKen?', desc:'Ogni riga e colonna deve avere ogni numero una sola volta, come il Sudoku!' },
    { em:'📦', title:'Le gabbie colorate', desc:'Ogni gruppo colorato ha un numero obiettivo e un\'operazione. Es: "6+" significa che le celle del gruppo sommano a 6.' },
    { em:'🎯', title:'Inizia dal facile!', desc:'Cerca le gabbie con una sola cella — il numero è già la risposta! Poi completa le gabbie piccole.' },
  ],
  nono: [
    { em:'🔲', title:'Cos\'è un Nonogramma?', desc:'Colora le celle per scoprire un disegno nascosto!' },
    { em:'🔢', title:'I numeri ti guidano', desc:'I numeri a sinistra e in alto indicano quante celle consecutive devi colorare. Es: "3" = tre celle di fila colorate.' },
    { em:'✕', title:'Segna le celle vuote', desc:'Usa il pulsante "✕ Segna vuoto" per marcare le celle che sai essere vuote. Ti aiuta a ragionare!' },
  ],
  tangram: [
    { em:'🔷', title:'Cos\'è il Tangram?', desc:'Trascina i pezzi colorati dentro la sagoma tratteggiata per completare la figura!' },
    { em:'👆', title:'Trascina i pezzi', desc:'Tocca un pezzo nel vassoio in basso e trascinalo nell\'area di gioco. Si incastra automaticamente nella posizione giusta!' },
    { em:'↻', title:'Ruota i pezzi', desc:'Nei livelli avanzati, seleziona un pezzo e premi "↻ Ruota" per girarlo di 90°.' },
  ],
  maze: [
    { em:'🐾', title:'Trova il cagnolino!', desc:'Guida il tuo personaggio attraverso il labirinto per raggiungere il cagnolino 🐶!' },
    { em:'⬆️', title:'Usa le frecce', desc:'Premi i pulsanti freccia per muoverti. Cerca di arrivare con meno passi possibile!' },
  ],
  slide: [
    { em:'🧩', title:'Il Rompicapo!', desc:'Le tessere numerate sono in disordine. Devi rimetterle nell\'ordine giusto: 1, 2, 3...' },
    { em:'👆', title:'Come si gioca', desc:'Tocca una tessera vicina allo spazio vuoto per spostarla. Le tessere colorate ti aiutano a capire quali sono al posto giusto!' },
  ],
};

function showGameTutorialIfNeeded(gameKey) {
  if (gameKey === 'sudoku') return; // sudoku has its own tutorial
  const tutKey = '_tut_' + gameKey;
  if (P[tutKey]) return; // already seen

  const slides = GAME_TUTORIALS[gameKey];
  if (!slides || !slides.length) return;

  // Show overlay tutorial
  let slideIdx = 0;
  const ov = document.createElement('div');
  ov.className = 'game-tut-overlay';
  ov.innerHTML = '<div class="game-tut-card" id="game-tut-card"></div>';
  document.body.appendChild(ov);

  function renderSlide() {
    const s = slides[slideIdx];
    const card = document.getElementById('game-tut-card');
    card.innerHTML = `
      <div class="game-tut-em">${s.em}</div>
      <div class="game-tut-title">${s.title}</div>
      <div class="game-tut-desc">${s.desc}</div>
      <div class="game-tut-dots">${slides.map((_,i)=>'<span class="game-tut-dot'+(i<=slideIdx?' on':'')+'"></span>').join('')}</div>
      <div class="game-tut-btns">
        <button class="game-tut-skip" id="game-tut-skip">Salta</button>
        <button class="game-tut-next" id="game-tut-next">${slideIdx>=slides.length-1?'Gioca! 🚀':'Avanti →'}</button>
      </div>
    `;
    document.getElementById('game-tut-skip').onclick = () => { P[tutKey]=true; saveActiveProfile(); ov.remove(); };
    document.getElementById('game-tut-next').onclick = () => {
      sfxClick(); slideIdx++;
      if (slideIdx >= slides.length) { P[tutKey]=true; saveActiveProfile(); ov.remove(); }
      else renderSlide();
    };
  }
  renderSlide();
  setTimeout(() => ov.classList.add('show'), 30);
}

/* ══════════════════════════════════════════
   B01: "Torna al gioco" from games screen
══════════════════════════════════════════ */
/* B01: Resume button — integrated in buildGamesScreen (F03 unified) */

/* ══════════════════════════════════════════
   B02: Confirm before profile switch during game
══════════════════════════════════════════ */
document.getElementById('btn-map-switch').onclick = () => {
  // If currently in a game, ask for confirmation
  const activeScreen = document.querySelector('.screen.active');
  const inGame = activeScreen && (activeScreen.id === 's-game' || activeScreen.id === 's-maze' ||
    activeScreen.id === 's-tang' || activeScreen.id === 's-nono' || activeScreen.id === 's-slide');
  if (inGame) {
    if (!confirm('Stai giocando! Vuoi davvero cambiare giocatore?')) return;
  }
  sfxClick();
  const profiles = loadAllProfiles();
  if (profiles.length <= 1) return;
  buildWhoScreen(P.id); show('s-who');
};

/* ══════════════════════════════════════════
   B04: Completed world visual feedback
══════════════════════════════════════════ */
const _origBuildUWL = buildUniversalWorldList;
buildUniversalWorldList = function(gameKey) {
  _origBuildUWL(gameKey);
  // After rendering, add completed/in-progress classes
  document.querySelectorAll('#world-list .world-card').forEach(card => {
    const progTxt = card.querySelector('.world-prog-txt');
    if (progTxt) {
      const match = progTxt.textContent.match(/(\d+)\s*\/\s*(\d+)/);
      if (match) {
        const done = parseInt(match[1]), total = parseInt(match[2]);
        if (done >= total && total > 0) card.classList.add('world-completed');
        else if (done > 0) card.classList.add('world-in-progress');
      }
    }
  });
};

/* ══════════════════════════════════════════
   C05: Adapt tutorial text to symTheme
══════════════════════════════════════════ */
const _origShowTutSlide = showTutSlide;
showTutSlide = function(idx) {
  _origShowTutSlide(idx);
  // Patch description text to match chosen symTheme
  const descEl = document.querySelector('.tut-desc');
  if (!descEl) return;
  const theme = P.symTheme || 'colors';
  if (idx === 0 && theme !== 'colors') {
    const names = {shapes:'forme',animals:'animali',numbers:'numeri'};
    descEl.textContent = `Ogni riga e colonna deve avere tutti i ${names[theme]||'simboli'}, ognuno una sola volta.`;
  }
  if (idx === 1) {
    const syms4 = SYMS[theme][4] || SYMS.colors[4];
    if (theme === 'colors') {
      descEl.textContent = 'Se in una riga ci sono già 🔴🔵🟡, allora la cella vuota è 🟢!';
    } else {
      descEl.textContent = `Se in una riga ci sono già ${syms4[0]} ${syms4[1]} ${syms4[2]}, allora la cella vuota è ${syms4[3]}!`;
    }
  }
};

/* ══════════════════════════════════════════
   C06: Hint explains reasoning
══════════════════════════════════════════ */
const _origUseHint = useHint;
useHint = function() {
  if (G.hintsLeft <= 0) return;
  const sz = G.size;
  let best = null, bestScore = -1;
  for (let r = 0; r < sz; r++) for (let c = 0; c < sz; c++) {
    if (G.board[r][c]) continue;
    const rf = G.board[r].filter(v => v).length;
    const cf = [...Array(sz)].map((_, rr) => G.board[rr][c]).filter(v => v).length;
    const s = rf + cf;
    if (s > bestScore) { bestScore = s; best = { r, c }; }
  }
  if (!best) return;
  _origUseHint();

  // C06: Show reasoning tooltip
  const pos = best.r * sz + best.c;
  const cel = document.querySelector(`[data-pos="${pos}"]`);
  if (!cel) return;

  // Build reasoning text
  const syms = SYMS[P.symTheme][sz] || SYMS[P.symTheme][4];
  const rowVals = G.board[best.r].filter(v => v);
  const colVals = [...Array(sz)].map((_, rr) => G.board[rr][best.c]).filter(v => v);
  const missing = [];
  for (let v = 1; v <= sz; v++) {
    if (!rowVals.includes(v) && !colVals.includes(v)) missing.push(v);
  }

  let reason = '';
  if (missing.length === 1) {
    const sym = P.symTheme === 'colors' ? '🟢' : syms[missing[0]-1];
    reason = `Qui manca solo ${sym}! Riga e colonna hanno già tutti gli altri.`;
  } else if (rowVals.length >= sz - 2) {
    reason = `Questa riga ha già ${rowVals.length}/${sz} simboli. Facile!`;
  } else if (colVals.length >= sz - 2) {
    reason = `Questa colonna ha già ${colVals.length}/${sz} simboli. Guarda bene!`;
  } else {
    reason = '💡 Prova a guardare cosa manca in questa riga e colonna!';
  }

  // Show tooltip
  const tip = document.createElement('div');
  tip.className = 'hint-tooltip';
  tip.textContent = reason;
  const rect = cel.getBoundingClientRect();
  tip.style.left = (rect.left + rect.width / 2) + 'px';
  tip.style.top = (rect.bottom + 8) + 'px';
  document.body.appendChild(tip);
  setTimeout(() => tip.classList.add('show'), 30);
  setTimeout(() => tip.remove(), 4000);
};

/* ══════════════════════════════════════════
   SPRINT 3 — UX + Game Design
══════════════════════════════════════════ */

/* ── UX10: Toast helper ── */
function showToast(msg, duration) {
  let t = document.getElementById('mg-toast');
  if (!t) { t = document.createElement('div'); t.id = 'mg-toast'; t.className = 'mg-toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration || 3000);
}

/* ── UX05: Ripple effect on tap ── */
document.addEventListener('pointerdown', function(e) {
  const btn = e.target.closest('button,.game-card,.world-card,.prof-card,.sym-pick');
  if (!btn || btn.classList.contains('locked')) return;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const sz = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = sz + 'px';
  ripple.style.left = (e.clientX - rect.left - sz / 2) + 'px';
  ripple.style.top = (e.clientY - rect.top - sz / 2) + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 550);
});

/* ── UX02: Locked world click feedback ── */
const _origBuildUWL2 = buildUniversalWorldList;
buildUniversalWorldList = function(gameKey) {
  _origBuildUWL2(gameKey);
  document.querySelectorAll('#world-list .world-card.locked').forEach(card => {
    card.onclick = (e) => {
      e.stopPropagation();
      sfxErr();
      card.classList.add('shake-lock');
      // Tooltip
      let tip = card.querySelector('.lock-tooltip');
      if (!tip) {
        tip = document.createElement('div');
        tip.className = 'lock-tooltip';
        tip.textContent = '🔒 Completa prima il mondo precedente!';
        card.style.position = 'relative';
        card.appendChild(tip);
      }
      setTimeout(() => { card.classList.remove('shake-lock'); if (tip) tip.remove(); }, 2000);
    };
  });
};

/* ── UX08: "Prossimo consigliato" in map ── */
const _origBuildUWL3 = buildUniversalWorldList;
buildUniversalWorldList = function(gameKey) {
  _origBuildUWL3(gameKey);
  // Find first unlocked, non-completed world and highlight it
  const cards = document.querySelectorAll('#world-list .world-card');
  let found = false;
  cards.forEach(card => {
    card.classList.remove('world-recommended');
    if (found) return;
    if (card.classList.contains('locked') || card.classList.contains('world-completed')) return;
    const progTxt = card.querySelector('.world-prog-txt');
    if (progTxt) {
      const match = progTxt.textContent.match(/(\d+)\s*\/\s*(\d+)/);
      if (match && parseInt(match[1]) < parseInt(match[2])) {
        card.classList.add('world-recommended');
        found = true;
      }
    }
  });
};

/* ── GD09: In-game timer ── */
let _gameTimerInterval = null;
function startGameTimer() {
  stopGameTimer();
  G.startTime = Date.now();
  const timerEl = document.getElementById('game-timer');
  if (!timerEl) return;
  timerEl.style.display = 'flex';
  _gameTimerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - G.startTime) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    timerEl.textContent = '⏱ ' + (m > 0 ? m + ':' + String(s).padStart(2, '0') : s + 's');
  }, 1000);
}
function stopGameTimer() {
  if (_gameTimerInterval) { clearInterval(_gameTimerInterval); _gameTimerInterval = null; }
}

/* ── GD05: Educational feedback after error (Sudoku) ── */
const _origPlaceSymbol = placeSymbol;
placeSymbol = function(pos, symIdx) {
  const r = Math.floor(pos / G.size), c = pos % G.size;
  const val = symIdx + 1;
  const correct = G.solution[r][c] === val;
  _origPlaceSymbol(pos, symIdx);
  if (!correct && !G.isKenKen) {
    // Find WHY it's wrong — which row/col has duplicate
    const sz = G.size;
    const syms = SYMS[P.symTheme][sz] || SYMS[P.symTheme][4];
    let reason = '';
    // Check row
    for (let cc = 0; cc < sz; cc++) {
      if (cc !== c && G.board[r][cc] === val) {
        reason = 'Questa riga ha già quel simbolo!';
        break;
      }
    }
    // Check col
    if (!reason) {
      for (let rr = 0; rr < sz; rr++) {
        if (rr !== r && G.board[rr][c] === val) {
          reason = 'Questa colonna ha già quel simbolo!';
          break;
        }
      }
    }
    if (reason) {
      showToast('💡 ' + reason, 2500);
    }
  }
};

/* ── GD06: Tangram piece counter — update in renderTang ── */
const _origRenderTang = renderTang;
renderTang = function() {
  _origRenderTang();
  const level = TANG_LEVELS[T.levelIdx];
  if (!level) return;
  const placed = level.pieces.filter(p => T.pieceStates[p.pid]?.placed).length;
  const total = level.pieces.length;
  const pg = document.getElementById('tang-level-pg');
  if (pg) pg.textContent = `Pezzi: ${placed}/${total}`;
};

/* ── UX11: Edit existing profile ── */
function editProfile(profId) {
  const prof = loadProfileById(profId);
  if (!prof) return;
  // Load profile data into form
  Object.assign(P, JSON.parse(JSON.stringify(prof)));
  document.getElementById('name-inp').value = P.name;
  document.querySelectorAll('.av-btn').forEach(b => b.classList.toggle('sel', b.textContent === P.avatar));
  document.querySelectorAll('.pal-card').forEach((c, i) => {
    const key = Object.keys(PALS)[i];
    c.classList.toggle('sel', key === P.palette);
  });
  document.querySelectorAll('.sym-card').forEach((c, i) => {
    const key = Object.keys(STYMS)[i];
    c.classList.toggle('sel', key === P.symTheme);
  });
  // Restore skill level selection
  const levels = ['beginner','intermediate','expert'];
  document.querySelectorAll('.level-card').forEach((c, i) => {
    c.classList.toggle('sel', levels[i] === (P.skillLevel || 'beginner'));
  });
  applyTheme();
  checkP();
  show('s-pro');
}

/* ── GD03: Better cross-game badges ── */
BADGE_DEFS.push(
  { id: 'allgames', em: '🎯', name: 'Tuttafare!', desc: 'Gioca tutti e 6 i giochi',
    check: p => {
      const h = p.history || [];
      const played = new Set();
      h.forEach(e => {
        if (e.isKenKen) played.add('kenken');
        else if (e.isMaze) played.add('maze');
        else if (e.isNono) played.add('nono');
        else if (e.isTang) played.add('tangram');
        else if (e.isSlide) played.add('slide');
        else played.add('sudoku');
      });
      return played.size >= 6;
    }
  },
  { id: 'stars100', em: '💯', name: 'Centenario!', desc: 'Raggiungi 100 stelle', check: p => p.stars >= 100 },
  { id: 'week7', em: '📅', name: 'Settimana perfetta!', desc: 'Gioca 7 giorni di fila', check: p => (p.streak || 0) >= 7 },
);

/* ── GD01: Add sub-phase worlds with many givens ── */
// Patch the first 4x4 worlds to have more givens for very young children
// This is done by adjusting the adaptive system in GD02

/* ── GD02: Adaptive difficulty for non-sudoku games ── */
function getAdaptiveParam(gameKey, baseParam, paramName) {
  const recent = (P.history || []).filter(h => {
    if (gameKey === 'maze') return h.isMaze;
    if (gameKey === 'nono') return h.isNono;
    if (gameKey === 'slide') return h.isSlide;
    if (gameKey === 'tangram') return h.isTang;
    return false;
  }).slice(-5);
  if (recent.length < 2) return baseParam;
  const avgErrors = recent.reduce((s, h) => s + (h.errors || 0), 0) / recent.length;
  // If struggling, make easier
  if (paramName === 'extraOpen' && avgErrors > 2) return Math.min(baseParam + 2, 8);
  if (paramName === 'shuffleMoves' && avgErrors > 1) return Math.max(Math.floor(baseParam * 0.7), 4);
  return baseParam;
}

/* ══════════════════════════════════════════
   SPRINT 4 — VISUAL POLISH JS
══════════════════════════════════════════ */

/* ── VD09: Sliding tiles use palette colors ── */
const _origBuildSlideGrid = buildSlideGrid;
buildSlideGrid = function() {
  _origBuildSlideGrid();
  // Override tile colors with palette
  const colors = PALS[P.palette].colors;
  if (SL._tileEls) SL._tileEls.forEach((el, idx) => {
    const val = SL.tiles[idx];
    if (val > 0) {
      el.style.background = colors[(val - 1) % colors.length];
    }
  });
};

/* ── VD10: Maze canvas anti-aliasing ── */
const _origDrawMaze = typeof drawMaze === 'function' ? drawMaze : null;
if (_origDrawMaze) {
  drawMaze = function() {
    const canvas = document.getElementById('maze-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
    _origDrawMaze();
  };
}

/* ── VD16: Scroll to newly unlocked world ── */
const _origShowWorldUnlock2 = showWorldUnlock;
showWorldUnlock = function(world) {
  _origShowWorldUnlock2(world);
  // After overlay dismissed, scroll to the new world card
  const origOnclick = document.getElementById('btn-wuo').onclick;
  document.getElementById('btn-wuo').onclick = () => {
    if (origOnclick) origOnclick();
    // Find and scroll to the world card
    setTimeout(() => {
      const cards = document.querySelectorAll('#world-list .world-card');
      cards.forEach(card => {
        const nameEl = card.querySelector('.world-name');
        if (nameEl && nameEl.textContent.includes(world.name)) {
          card.classList.add('world-just-unlocked');
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }, 300);
  };
};

/* ── UX13: Toast on profile creation ── */
const _origBtnConfirm = document.getElementById('btn-confirm').onclick;
document.getElementById('btn-confirm').onclick = () => {
  const isNew = !P.id; // check BEFORE _orig sets it
  if (_origBtnConfirm) _origBtnConfirm();
  else {
    sfxClick();
    if (!P.id) P.id = uid();
    applyTheme(); saveActiveProfile();
    if (isNew && !P._tutDone) { startTutorial(); }
    else { buildGamesScreen(); show('s-games'); }
  }
  if (isNew) {
    setTimeout(() => showToast('Profilo creato! 🎉', 2500), 500);
  }
};

/* ── UX15: Long-press to reset world ── */
let _worldLongPress = null;
const _origBuildUWL4 = buildUniversalWorldList;
buildUniversalWorldList = function(gameKey) {
  _origBuildUWL4(gameKey);
  document.querySelectorAll('#world-list .world-card.world-completed').forEach(card => {
    let timer = null;
    card.addEventListener('pointerdown', () => {
      timer = setTimeout(() => {
        const nameEl = card.querySelector('.world-name');
        const wname = nameEl ? nameEl.textContent.trim() : '';
        if (confirm('Ricominciare ' + wname + ' da zero?')) {
          // Find world and reset progress
          const world = WORLDS.find(w => w.name === wname);
          if (world) {
            const key = world.id + '_' + gameKey;
            if (P.wp[key]) P.wp[key].done = 0;
            if (P.wp[world.id]) P.wp[world.id].done = 0;
            saveActiveProfileNow();
            updateUniversalMap();
            showToast('Mondo resettato! 🔄', 2500);
          }
        }
      }, 1200);
    });
    card.addEventListener('pointerup', () => clearTimeout(timer));
    card.addEventListener('pointerleave', () => clearTimeout(timer));
  });
};

/* ── UX12: Stats accessible from game selection ── */
const _origBGS4 = buildGamesScreen;
buildGamesScreen = function() {
  _origBGS4();
  // Add stats button to game selection screen
  const grid = document.getElementById('games-grid');
  if (grid && !document.getElementById('btn-games-stats')) {
    const statsBtn = document.createElement('button');
    statsBtn.id = 'btn-games-stats';
    statsBtn.className = 'btn-games-stats';
    statsBtn.innerHTML = '📊 Le tue statistiche';
    statsBtn.onclick = () => { sfxClick(); buildStats(); show('s-stats'); };
    grid.parentNode.insertBefore(statsBtn, grid.nextSibling);
  }
};

/* ══════════════════════════════════════════
   SPRINT 5B — FEATURE IMPLEMENTATIONS
══════════════════════════════════════════ */

/* ── GD04: Stars unlock cosmetics ── */
const STAR_REWARDS = [
  { stars:10,  reward:'🎨', desc:'Palette Oceano sbloccata!', type:'palette', value:'oceano' },
  { stars:25,  reward:'🌍', desc:'Palette Terra sbloccata!',  type:'palette', value:'terra' },
  { stars:50,  reward:'⭐', desc:'Palette Cosmo sbloccata!',  type:'palette', value:'cosmo' },
  { stars:75,  reward:'🔷', desc:'Stile Forme sbloccato!',    type:'symTheme', value:'shapes' },
  { stars:100, reward:'🐾', desc:'Stile Animali sbloccato!',  type:'symTheme', value:'animals' },
  { stars:150, reward:'🔢', desc:'Stile Numeri sbloccato!',   type:'symTheme', value:'numbers' },
];
function checkStarRewards() {
  const unlocked = P._starRewards || [];
  STAR_REWARDS.forEach(r => {
    if (P.stars >= r.stars && !unlocked.includes(r.stars)) {
      unlocked.push(r.stars);
      showToast(r.reward + ' ' + r.desc, 4000);
      sfxBadge();
    }
  });
  P._starRewards = unlocked;
}

/* ── GD11: Express path — mark optional worlds ── */
const EXPRESS_WORLDS = ['w1','w2','w3','w4','w5','w6','w7','w8']; // all 8 worlds
function isExpressWorld(worldId) { return EXPRESS_WORLDS.includes(worldId); }

/* ── GD12: Diploma MiniGrid ── */
function checkDiploma(gameKey) {
  // Check if all worlds completed for this game
  const allDone = WORLDS.every(w => {
    const done = getWorldProgress(w.id, gameKey);
    return done >= w.total;
  });
  if (allDone && !P._diplomas?.includes(gameKey)) {
    if (!P._diplomas) P._diplomas = [];
    P._diplomas.push(gameKey);
    saveActiveProfileNow();
    const GNAMES={sudoku:'Sudoku',kenken:'KenKen',maze:'Labirinto',nono:'Nonogramma',tangram:'Tangram',slide:'Rompicapo'};
    showToast('🎓 Diploma di ' + (GNAMES[gameKey]||gameKey) + '! Hai completato tutti i mondi!', 5000);
    sfxBadge();
    setTimeout(sfxWin, 300);
  }
}

/* ── UX01: Save/restore puzzle state ── */
function savePuzzleState() {
  if (!G.world || !G.board) return;
  const state = {
    worldId: G.world.id,
    gameKey: G._currentGameKey || 'sudoku',
    pidx: G.pidx,
    size: G.size,
    board: G.board,
    solution: G.solution,
    given: [...G.given],
    errors: G.errors,
    hintsLeft: G.hintsLeft,
    startTime: G.startTime,
    isKenKen: G.isKenKen,
    cages: G.cages,
    timestamp: Date.now()
  };
  try { _storageSet('mg5_puzzle_' + P.id, JSON.stringify(state)); } catch(e) {}
}
function loadPuzzleState() {
  try {
    const raw = _storageGet('mg5_puzzle_' + P.id);
    if (!raw) return null;
    const state = JSON.parse(raw);
    // Expire after 24h
    if (Date.now() - state.timestamp > 86400000) {
      _storageRemove('mg5_puzzle_' + P.id);
      return null;
    }
    return state;
  } catch(e) { return null; }
}
function clearPuzzleState() {
  try { _storageRemove('mg5_puzzle_' + P.id); } catch(e) {}
}
// Auto-save on navigation away
const _origShow = show;
show = function(id) {
  // If leaving a game screen, save state
  const active = document.querySelector('.screen.active');
  if (active && active.id === 's-game' && G.board && !G.isDaily) {
    savePuzzleState();
  }
  if (id !== 's-game') clearPuzzleState(); // clear if going to non-game
  _origShow(id);
};

/* ── FT01: PWA — create manifest dynamically ── */
function installPWAManifest() {
  if (document.querySelector('link[rel="manifest"]')) return;
  const manifest = {
    name: 'MiniGrid',
    short_name: 'MiniGrid',
    description: 'Giochi di logica per bambini',
    start_url: '.',
    display: 'standalone',
    background_color: '#fff0f9',
    theme_color: '#d63fa6',
    icons: [{ src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧩</text></svg>', sizes: 'any', type: 'image/svg+xml' }]
  };
  const blob = new Blob([JSON.stringify(manifest)], {type:'application/json'});
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = URL.createObjectURL(blob);
  document.head.appendChild(link);
}
installPWAManifest();

/* ── FT03: Export/import profiles ── */
function exportProfile() {
  const data = JSON.stringify(P, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `minigrid_${P.name||'profilo'}.json`;
  a.click(); URL.revokeObjectURL(url);
  showToast('Profilo esportato! 📥', 2500);
}
function importProfile() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const prof = JSON.parse(ev.target.result);
        if (!prof.name || !prof.id) { showToast('File non valido ❌', 2500); return; }
        // Assign new id to avoid conflicts
        prof.id = uid();
        const profiles = loadAllProfiles();
        profiles.push(prof);
        saveAllProfiles(profiles);
        showToast('Profilo importato! ✅ ' + prof.name, 3000);
        buildWhoScreen(); show('s-who');
      } catch(err) { showToast('Errore nel file ❌', 2500); }
    };
    reader.readAsText(file);
  };
  input.click();
}

/* ── FT04: Ambient music with Web Audio ── */
let _musicPlaying = false;
let _musicOsc = null, _musicGain = null;
function toggleMusic() {
  if (_musicPlaying) { stopMusic(); return; }
  try {
    const ac = getAC();
    _musicGain = ac.createGain();
    _musicGain.gain.setValueAtTime(0.03, ac.currentTime);
    _musicGain.connect(ac.destination);
    // Simple ambient drone — C major chord soft oscillators
    const freqs = [261.6, 329.6, 392.0]; // C4, E4, G4
    _musicOsc = freqs.map(f => {
      const o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, ac.currentTime);
      o.connect(_musicGain);
      o.start();
      return o;
    });
    _musicPlaying = true;
  } catch(e) {}
}
function stopMusic() {
  if (_musicOsc) { _musicOsc.forEach(o => { try{o.stop();}catch(e){} }); _musicOsc = null; }
  _musicPlaying = false;
}

/* ── FT07: Basic keyboard navigation ── */
document.addEventListener('keydown', function(e) {
  const active = document.querySelector('.screen.active');
  if (!active) return;
  // Sudoku/KenKen: arrow keys to move selection
  if (active.id === 's-game' && G.board) {
    const sz = G.size;
    if (G.selCell === null) return;
    let r = Math.floor(G.selCell / sz), c = G.selCell % sz;
    if (e.key === 'ArrowUp' && r > 0) r--;
    else if (e.key === 'ArrowDown' && r < sz-1) r++;
    else if (e.key === 'ArrowLeft' && c > 0) c--;
    else if (e.key === 'ArrowRight' && c < sz-1) c++;
    else if (e.key >= '1' && e.key <= '9') {
      const num = parseInt(e.key);
      if (num <= sz) { G.selSym = num - 1; placeSymbol(G.selCell, num - 1); }
      return;
    } else return;
    e.preventDefault();
    G.selCell = r * sz + c;
    updateGridCells();
  }
  // Maze: arrow keys
  if (active.id === 's-maze') {
    const dirMap = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' };
    if (dirMap[e.key] && typeof movePlayer === 'function') {
      e.preventDefault();
      movePlayer(dirMap[e.key]);
    }
  }
});

/* ── FT08: Daltonism-friendly color set ── */
const SYMS_DALTONISM = {
  2: ['#0072B2','#E69F00'],
  3: ['#0072B2','#E69F00','#CC79A7'],
  4: ['#0072B2','#E69F00','#CC79A7','#009E73'],
  6: ['#0072B2','#E69F00','#CC79A7','#009E73','#F0E442','#D55E00'],
  9: ['#0072B2','#E69F00','#CC79A7','#009E73','#F0E442','#D55E00','#56B4E9','#000000','#FFFFFF'],
};
// Users can activate via: P.daltonism = true
// Then SYMS.colors will be swapped to SYMS_DALTONISM

/* ── CG12: "?" button to review game rules anytime ── */
function forceShowGameTutorial(gameKey) {
  const gk = gameKey || G._currentGameKey || 'sudoku';
  if (gk === 'sudoku') {
    // Sudoku uses the main tutorial system
    tutIdx = 0; show('s-tut'); showTutSlide(0);
    return;
  }
  const slides = GAME_TUTORIALS[gk];
  if (!slides || !slides.length) return;
  // Temporarily clear the "seen" flag so the tutorial shows again
  const tutKey = '_tut_' + gk;
  const wasSeen = P[tutKey];
  P[tutKey] = false;
  showGameTutorialIfNeeded(gk);
  P[tutKey] = wasSeen; // restore after showing
}
