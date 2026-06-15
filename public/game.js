// ============================================================
// WildBound - Complete Game Logic
// ============================================================

// ============================================================
// GAME STATE
// ============================================================

var GameState = {
  player: {
    id: null,
    name: '',
    level: 1,
    xp: 0,
    xpToNext: 100,
    lat: 40.7128,
    lng: -74.0060,
    creatures: [],
    balls: 30,
    coins: 500
  },
  activeCreatures: [],
  nearbyPlayers: [],
  currentEncounter: null,
  currentBattle: null,
  isOnline: false,
  map: null,
  playerMarker: null,
  creatureMarkers: new Map(),
  nearbyPlayerMarkers: new Map(),
  socket: null,
  encounterSpawn: null,
  stats: {
    caught: 0,
    battlesWon: 0,
    battlesPlayed: 0
  }
};

var BattleState = {
  battleId: null,
  opponentId: null,
  myTeam: [],
  opponentTeam: [],
  myActiveIndex: 0,
  opponentActiveIndex: 0,
  isMyTurn: true,
  phase: 'select',
  isOnline: false,
  isAI: false
};

// ============================================================
// XP THRESHOLDS
// ============================================================

var XP_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 4000, 5000, 6200, 7600, 9200, 11000, 13000, 15200, 17600];

// ============================================================
// INIT GAME
// ============================================================

function initGame() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function(e) {
      console.warn('[WildBound] SW registration failed:', e);
    });
  }

  // Load saved state
  var saved = loadGameState();
  if (saved) {
    GameState.player = Object.assign(GameState.player, saved);
  }

  var savedStats = localStorage.getItem('wildbound_stats');
  if (savedStats) {
    try { GameState.stats = JSON.parse(savedStats); } catch(e) {}
  }

  // Listen for online/offline
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Show loading screen briefly
  showScreen('loading');

  setTimeout(function() {
    if (!GameState.player.name || GameState.player.name === '') {
      setupIntroScreen();
      showScreen('intro');
    } else {
      startGame();
    }
  }, 2000);
}

// ============================================================
// INTRO SCREEN
// ============================================================

function setupIntroScreen() {
  var form = document.getElementById('intro-form');
  var input = document.getElementById('intro-name-input');
  if (!form) return;

  // Show a random creature as preview
  if (window.CREATURES && window.CREATURES.length > 0) {
    var previewCreature = window.CREATURES[Math.floor(Math.random() * 4)];
    var previewEl = document.getElementById('intro-creature-preview');
    if (previewEl) {
      previewEl.innerHTML = previewCreature.getSvg();
    }
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var name = (input ? input.value : '').trim();
    if (!name || name.length < 2) {
      showToast('Please enter a trainer name (at least 2 characters)', 'error');
      return;
    }
    if (name.length > 20) {
      showToast('Name must be 20 characters or less', 'error');
      return;
    }
    GameState.player.name = name;
    saveGameState();
    startGame();
  });
}

// ============================================================
// START GAME
// ============================================================

function startGame() {
  showScreen('map');
  updateStatusBar();
  setupBottomNav();
  initMap();
  startGeolocation();

  // Try to connect socket
  if (navigator.onLine) {
    connectSocket();
  } else {
    handleOffline();
  }

  // Generate offline spawns immediately
  generateOfflineSpawns(GameState.player.lat, GameState.player.lng);

  // Show tutorial on first play
  var tutorialShown = localStorage.getItem('wildbound_tutorial');
  if (!tutorialShown) {
    setTimeout(function() {
      showToast('Welcome! Explore the map to find and catch creatures!', 'info');
      localStorage.setItem('wildbound_tutorial', '1');
    }, 1000);
  }
}

// ============================================================
// MAP INITIALIZATION
// ============================================================

function initMap() {
  if (GameState.map) {
    GameState.map.remove();
    GameState.map = null;
  }

  var mapEl = document.getElementById('map');
  if (!mapEl) return;

  GameState.map = L.map('map', {
    center: [GameState.player.lat, GameState.player.lng],
    zoom: 16,
    zoomControl: true,
    attributionControl: true
  });

  // Dark tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(GameState.map);

  // Player marker
  var playerIcon = L.divIcon({
    html: '<div class="player-marker"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: ''
  });

  GameState.playerMarker = L.marker([GameState.player.lat, GameState.player.lng], {
    icon: playerIcon,
    zIndexOffset: 1000
  }).addTo(GameState.map);

  GameState.playerMarker.bindPopup('<b>' + escapeHtml(GameState.player.name) + '</b><br>Level ' + GameState.player.level);

  // Setup locate button
  var locateBtn = document.getElementById('btn-locate');
  if (locateBtn) {
    locateBtn.addEventListener('click', function() {
      if (GameState.map && GameState.player.lat) {
        GameState.map.setView([GameState.player.lat, GameState.player.lng], 16);
        showToast('Centered on your location', 'info');
      }
    });
  }
}

// ============================================================
// GEOLOCATION
// ============================================================

function startGeolocation() {
  if (!navigator.geolocation) {
    showToast('Geolocation not supported. Using default location.', 'info');
    return;
  }

  var options = {
    enableHighAccuracy: true,
    maximumAge: 5000,
    timeout: 10000
  };

  navigator.geolocation.getCurrentPosition(
    function(pos) {
      onLocationUpdate(pos);
    },
    function(err) {
      console.warn('[WildBound] Geolocation error:', err.message);
      showToast('Using default location (New York). Enable GPS for real tracking!', 'info');
      // Use New York as default
      onLocationUpdate({
        coords: { latitude: 40.7128, longitude: -74.0060 }
      });
    },
    options
  );

  navigator.geolocation.watchPosition(
    function(pos) { onLocationUpdate(pos); },
    function(err) { console.warn('[WildBound] Watch error:', err.message); },
    options
  );
}

function onLocationUpdate(pos) {
  var lat = pos.coords.latitude;
  var lng = pos.coords.longitude;

  var prevLat = GameState.player.lat;
  var prevLng = GameState.player.lng;

  GameState.player.lat = lat;
  GameState.player.lng = lng;

  // Update marker
  if (GameState.playerMarker && GameState.map) {
    GameState.playerMarker.setLatLng([lat, lng]);
  }

  // Center map on first real location
  if (prevLat === 40.7128 && prevLng === -74.0060 && (Math.abs(lat - 40.7128) > 0.001 || Math.abs(lng + 74.0060) > 0.001)) {
    if (GameState.map) {
      GameState.map.setView([lat, lng], 16);
    }
    generateOfflineSpawns(lat, lng);
  }

  // Check nearby creatures for encounter prompt
  checkNearbyCreatures(lat, lng);

  // Send to server if online
  if (GameState.isOnline && GameState.socket) {
    GameState.socket.emit('player:location', { lat: lat, lng: lng });
  }
}

// ============================================================
// GENERATE OFFLINE SPAWNS
// ============================================================

function generateOfflineSpawns(lat, lng) {
  if (!GameState.map) return;
  if (!window.CREATURES) return;

  var count = 8;
  var rarityWeights = {
    Common: 0.55,
    Uncommon: 0.30,
    Rare: 0.12,
    Legendary: 0.03
  };

  for (var i = 0; i < count; i++) {
    var angle = Math.random() * 2 * Math.PI;
    var dist = (0.0015 + Math.random() * 0.0015); // ~200-300m in degrees
    var spawnLat = lat + dist * Math.cos(angle);
    var spawnLng = lng + dist * Math.sin(angle);

    // Pick creature with rarity weighting
    var roll = Math.random();
    var creature;
    if (roll < rarityWeights.Legendary) {
      creature = getCreaturesByRarity('Legendary');
    } else if (roll < rarityWeights.Legendary + rarityWeights.Rare) {
      creature = getCreaturesByRarity('Rare');
    } else if (roll < rarityWeights.Legendary + rarityWeights.Rare + rarityWeights.Uncommon) {
      creature = getCreaturesByRarity('Uncommon');
    } else {
      creature = getCreaturesByRarity('Common');
    }

    if (!creature) {
      creature = window.CREATURES[Math.floor(Math.random() * window.CREATURES.length)];
    }

    var spawn = {
      id: 'offline_' + Date.now() + '_' + i,
      creatureId: creature.id,
      lat: spawnLat,
      lng: spawnLng,
      spawnedAt: Date.now(),
      expires: Date.now() + 15 * 60 * 1000
    };

    GameState.activeCreatures.push(spawn);
    addCreatureMarker(spawn);
  }

  updateCreatureCounter();
}

function getCreaturesByRarity(rarity) {
  if (!window.CREATURES) return null;
  var filtered = window.CREATURES.filter(function(c) { return c.rarity === rarity; });
  if (filtered.length === 0) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// ============================================================
// ADD CREATURE MARKER
// ============================================================

function addCreatureMarker(spawn) {
  if (!GameState.map) return;
  if (GameState.creatureMarkers.has(spawn.id)) return;

  var creature = window.CREATURES.find(function(c) { return c.id === spawn.creatureId; });
  if (!creature) return;

  var svgContent = creature.getSvg();
  var markerHtml = '<div class="creature-marker" title="' + creature.name + '">' +
    '<div style="width:36px;height:36px;overflow:hidden;">' + svgContent + '</div>' +
    '</div>' +
    '<div class="creature-marker-label">' + creature.name + '</div>';

  var creatureIcon = L.divIcon({
    html: markerHtml,
    iconSize: [44, 62],
    iconAnchor: [22, 30],
    className: '',
    popupAnchor: [0, -35]
  });

  var marker = L.marker([spawn.lat, spawn.lng], { icon: creatureIcon });

  marker.on('click', function() {
    var dist = getDistance(GameState.player.lat, GameState.player.lng, spawn.lat, spawn.lng);
    if (dist <= 100) {
      startEncounter(spawn);
    } else {
      var distStr = dist < 1000 ? Math.round(dist) + 'm' : (dist / 1000).toFixed(1) + 'km';
      showToast('Get closer! (' + distStr + ' away)', 'info');
      showEncounterPrompt(spawn);
    }
  });

  marker.addTo(GameState.map);
  GameState.creatureMarkers.set(spawn.id, marker);
}

// ============================================================
// CHECK NEARBY CREATURES
// ============================================================

function checkNearbyCreatures(lat, lng) {
  var nearest = null;
  var nearestDist = Infinity;

  GameState.activeCreatures.forEach(function(spawn) {
    var dist = getDistance(lat, lng, spawn.lat, spawn.lng);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = spawn;
    }
  });

  if (nearest && nearestDist <= 80) {
    showEncounterPrompt(nearest);
  } else {
    hideEncounterPrompt();
  }
}

function showEncounterPrompt(spawn) {
  var creature = window.CREATURES.find(function(c) { return c.id === spawn.creatureId; });
  if (!creature) return;

  var prompt = document.getElementById('encounter-prompt');
  if (!prompt) return;

  var dist = getDistance(GameState.player.lat, GameState.player.lng, spawn.lat, spawn.lng);

  var svgEl = prompt.querySelector('.encounter-prompt-creature');
  if (svgEl) svgEl.innerHTML = creature.getSvg();

  var nameEl = prompt.querySelector('.encounter-prompt-name');
  if (nameEl) nameEl.textContent = creature.name;

  var hintEl = prompt.querySelector('.encounter-prompt-hint');
  if (hintEl) {
    if (dist <= 80) {
      hintEl.textContent = 'Tap to encounter!';
    } else {
      hintEl.textContent = Math.round(dist) + 'm away';
    }
  }

  prompt.classList.add('visible');
  prompt.style.display = 'flex';

  // Make the button work
  var btn = prompt.querySelector('.encounter-prompt-btn');
  if (btn) {
    btn.onclick = function() {
      var dist2 = getDistance(GameState.player.lat, GameState.player.lng, spawn.lat, spawn.lng);
      if (dist2 <= 100) {
        startEncounter(spawn);
      } else {
        showToast('Move closer to catch ' + creature.name + '!', 'info');
      }
    };
  }
}

function hideEncounterPrompt() {
  var prompt = document.getElementById('encounter-prompt');
  if (prompt) {
    prompt.classList.remove('visible');
    prompt.style.display = 'none';
  }
}

// ============================================================
// ENCOUNTER SCREEN
// ============================================================

function startEncounter(spawn) {
  var creature = window.CREATURES.find(function(c) { return c.id === spawn.creatureId; });
  if (!creature) return;

  GameState.currentEncounter = creature;
  GameState.encounterSpawn = spawn;

  // Populate encounter screen
  var displayEl = document.getElementById('encounter-creature-svg');
  if (displayEl) {
    displayEl.innerHTML = creature.getSvg();
  }

  var nameEl = document.getElementById('encounter-creature-name');
  if (nameEl) nameEl.textContent = creature.name;

  var typeEl = document.getElementById('encounter-type-badge');
  if (typeEl) {
    typeEl.textContent = creature.type;
    typeEl.className = 'type-badge ' + creature.type.toLowerCase();
  }

  var rarityEl = document.getElementById('encounter-rarity');
  if (rarityEl) {
    rarityEl.textContent = creature.rarity;
    rarityEl.className = 'encounter-rarity rarity-' + creature.rarity.toLowerCase();
  }

  var descEl = document.getElementById('encounter-description');
  if (descEl) descEl.textContent = creature.description;

  var ballsEl = document.getElementById('balls-remaining');
  if (ballsEl) ballsEl.innerHTML = '&#x26BD; ' + GameState.player.balls + ' LockOrbs';

  var resultEl = document.getElementById('catch-result');
  if (resultEl) {
    resultEl.style.display = 'none';
    resultEl.className = '';
  }

  // Set encounter background color based on type
  var bg = document.querySelector('.encounter-bg');
  if (bg) {
    var typeColors = {
      Flame:  'linear-gradient(160deg, #2a0a00, #1a0500)',
      Wave:   'linear-gradient(160deg, #001a1a, #001520)',
      Leaf:   'linear-gradient(160deg, #001a08, #001510)',
      Storm:  'linear-gradient(160deg, #1a002a, #100020)',
      Frost:  'linear-gradient(160deg, #001a2a, #001018)',
      Shadow: 'linear-gradient(160deg, #0a0014, #05000a)',
      Light:  'linear-gradient(160deg, #1a1400, #100e00)',
      Stone:  'linear-gradient(160deg, #1a0e00, #100800)',
      Wind:   'linear-gradient(160deg, #001520, #000e18)',
      Cosmic: 'linear-gradient(160deg, #0a0020, #05001a)'
    };
    bg.style.background = typeColors[creature.type] || 'linear-gradient(160deg, #1a0a2e, #0a1535)';
  }

  hideEncounterPrompt();
  showScreen('encounter');
  setupCatchMechanic();
}

// ============================================================
// CATCH MECHANIC (Canvas-based)
// ============================================================

function setupCatchMechanic() {
  var canvas = document.getElementById('catch-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 320;
  canvas.height = canvas.offsetHeight || 200;

  var W = canvas.width;
  var H = canvas.height;

  // Orb state
  var orb = {
    x: W / 2,
    y: H - 35,
    radius: 20,
    startX: W / 2,
    startY: H - 35
  };

  // Target zone (creature area, upper center)
  var target = {
    x: W / 2,
    y: 50,
    radius: 35
  };

  // Throw animation state
  var throwState = {
    active: false,
    vx: 0,
    vy: 0,
    gravity: 0.5,
    thrown: false,
    hit: false,
    missed: false,
    catchRingRadius: 50,
    catchRingPulse: 0
  };

  // Touch/mouse tracking
  var dragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  };

  function resetOrb() {
    orb.x = orb.startX;
    orb.y = orb.startY;
    throwState.active = false;
    throwState.thrown = false;
    throwState.hit = false;
    throwState.missed = false;
    throwState.vx = 0;
    throwState.vy = 0;
    dragState.isDragging = false;

    var resultEl = document.getElementById('catch-result');
    if (resultEl) {
      resultEl.style.display = 'none';
      resultEl.className = '';
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    // Draw background hint arc
    ctx.strokeStyle = 'rgba(108,99,255,0.15)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 8]);
    ctx.beginPath();
    ctx.arc(W/2, H - 35, 25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw target zone (creature ring)
    throwState.catchRingPulse = (throwState.catchRingPulse + 0.05) % (Math.PI * 2);
    var ringAlpha = 0.3 + 0.2 * Math.sin(throwState.catchRingPulse);
    ctx.strokeStyle = 'rgba(108,99,255,' + ringAlpha + ')';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw orb
    if (!throwState.thrown || throwState.active) {
      drawOrb(orb.x, orb.y, orb.radius);
    }

    // Physics update
    if (throwState.active && throwState.thrown) {
      orb.x += throwState.vx;
      orb.y += throwState.vy;
      throwState.vy += throwState.gravity;

      // Check hit
      var dx = orb.x - target.x;
      var dy = orb.y - target.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < target.radius + orb.radius) {
        if (!throwState.hit) {
          throwState.hit = true;
          throwState.active = false;
          attemptCatch(GameState.currentEncounter);
        }
        return;
      }

      // Check miss (went off screen)
      if (orb.y < -50 || orb.x < -50 || orb.x > W + 50 || orb.y > H + 50) {
        if (!throwState.missed) {
          throwState.missed = true;
          throwState.active = false;
          showToast('Missed! Try again!', 'info');
          setTimeout(resetOrb, 800);
        }
        return;
      }

      // Draw throw trail
      ctx.strokeStyle = 'rgba(108,99,255,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(orb.startX, orb.startY);
      ctx.quadraticCurveTo(
        (orb.startX + orb.x) / 2 + 30,
        (orb.startY + orb.y) / 2 - 20,
        orb.x, orb.y
      );
      ctx.stroke();

      drawOrb(orb.x, orb.y, orb.radius);
    }

    // Draw drag preview line
    if (dragState.isDragging && !throwState.thrown) {
      var dx2 = dragState.startX - dragState.currentX;
      var dy2 = dragState.startY - dragState.currentY;
      var len = Math.sqrt(dx2*dx2 + dy2*dy2);
      if (len > 10) {
        ctx.strokeStyle = 'rgba(108,99,255,0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(orb.startX, orb.startY);
        var norm = Math.min(len, 100) / len;
        ctx.lineTo(orb.startX + dx2 * norm * 0.8, orb.startY + dy2 * norm * 0.8);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    requestAnimationFrame(drawFrame);
  }

  function drawOrb(x, y, r) {
    // Outer glow
    var grd = ctx.createRadialGradient(x, y, 0, x, y, r * 1.8);
    grd.addColorStop(0, 'rgba(108,99,255,0.3)');
    grd.addColorStop(1, 'rgba(108,99,255,0)');
    ctx.beginPath();
    ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Main orb
    var ballGrd = ctx.createRadialGradient(x - r*0.3, y - r*0.3, 0, x, y, r);
    ballGrd.addColorStop(0, '#A09AFF');
    ballGrd.addColorStop(0.6, '#6C63FF');
    ballGrd.addColorStop(1, '#2A1A80');
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = ballGrd;
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.arc(x - r*0.3, y - r*0.3, r*0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();

    // Center line (pokeball style)
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.lineTo(x + r, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fill();
  }

  // Touch events
  function getPos(e, canvas) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function onDragStart(e) {
    if (throwState.thrown || throwState.active) return;
    e.preventDefault();
    var pos = getPos(e, canvas);
    var dx = pos.x - orb.startX;
    var dy = pos.y - orb.startY;
    if (Math.sqrt(dx*dx + dy*dy) < 50) {
      dragState.isDragging = true;
      dragState.startX = pos.x;
      dragState.startY = pos.y;
      dragState.currentX = pos.x;
      dragState.currentY = pos.y;
    }
  }

  function onDragMove(e) {
    if (!dragState.isDragging) return;
    e.preventDefault();
    var pos = getPos(e, canvas);
    dragState.currentX = pos.x;
    dragState.currentY = pos.y;
  }

  function onDragEnd(e) {
    if (!dragState.isDragging) return;
    e.preventDefault();
    dragState.isDragging = false;

    var dx = dragState.startX - dragState.currentX;
    var dy = dragState.startY - dragState.currentY;
    var speed = Math.sqrt(dx*dx + dy*dy);

    if (speed > 20 && dy < -20) {
      // Throw the orb
      var power = Math.min(speed, 120) / 120;
      throwState.vx = (dx / speed) * power * 12;
      throwState.vy = (dy / speed) * power * 14;
      throwState.active = true;
      throwState.thrown = true;
      orb.startX = orb.x;
      orb.startY = orb.y;
    }
  }

  canvas.addEventListener('touchstart', onDragStart, { passive: false });
  canvas.addEventListener('touchmove', onDragMove, { passive: false });
  canvas.addEventListener('touchend', onDragEnd, { passive: false });
  canvas.addEventListener('mousedown', onDragStart);
  canvas.addEventListener('mousemove', onDragMove);
  canvas.addEventListener('mouseup', onDragEnd);

  // Start animation
  requestAnimationFrame(drawFrame);

  // Store reset function globally for reuse
  canvas._resetOrb = resetOrb;
}

// ============================================================
// ATTEMPT CATCH
// ============================================================

function attemptCatch(creature) {
  if (!creature) return;
  if (GameState.player.balls <= 0) {
    showToast('No LockOrbs left! Return to town.', 'error');
    setTimeout(function() { showScreen('map'); }, 1500);
    return;
  }

  GameState.player.balls--;
  var ballsEl = document.getElementById('balls-remaining');
  if (ballsEl) ballsEl.innerHTML = '&#x26BD; ' + GameState.player.balls + ' LockOrbs';

  var roll = Math.random();
  var success = roll < creature.catchRate;

  var displayEl = document.getElementById('encounter-creature-svg');
  if (displayEl) displayEl.classList.add('shake');
  setTimeout(function() {
    if (displayEl) displayEl.classList.remove('shake');
  }, 600);

  setTimeout(function() {
    var resultEl = document.getElementById('catch-result');

    if (success) {
      if (resultEl) {
        resultEl.textContent = creature.name + ' caught!';
        resultEl.className = 'success';
        resultEl.style.display = 'block';
      }
      if (displayEl) displayEl.classList.add('caught');
      addToCollection(creature);
      grantXP(creature.rarity === 'Legendary' ? 200 : creature.rarity === 'Rare' ? 100 : creature.rarity === 'Uncommon' ? 50 : 25);

      // Remove spawn from map
      if (GameState.encounterSpawn) {
        removeSpawn(GameState.encounterSpawn.id);
      }

      setTimeout(function() {
        showScreen('map');
        showToast(creature.name + ' added to your pack!', 'success');
        updateCreatureCounter();
      }, 2000);
    } else {
      if (resultEl) {
        resultEl.textContent = creature.name + ' broke free!';
        resultEl.className = 'fail';
        resultEl.style.display = 'block';
      }
      setTimeout(function() {
        if (resultEl) {
          resultEl.style.display = 'none';
          resultEl.className = '';
        }
        if (displayEl) displayEl.classList.remove('caught');
        // Reset canvas orb
        var canvas = document.getElementById('catch-canvas');
        if (canvas && canvas._resetOrb) canvas._resetOrb();

        if (GameState.player.balls <= 0) {
          showToast('Out of LockOrbs!', 'error');
          setTimeout(function() { showScreen('map'); }, 1500);
        }
      }, 1200);
    }
  }, 800);
}

// ============================================================
// COLLECTION MANAGEMENT
// ============================================================

function addToCollection(creature) {
  var entry = {
    id: creature.id,
    name: creature.name,
    type: creature.type,
    rarity: creature.rarity,
    level: 1,
    currentHp: creature.maxHp,
    maxHp: creature.maxHp,
    attack: creature.attack,
    defense: creature.defense,
    speed: creature.speed,
    catchRate: creature.catchRate,
    color: creature.color,
    glowColor: creature.glowColor,
    description: creature.description,
    caughtAt: Date.now()
  };

  GameState.player.creatures.push(entry);
  GameState.stats.caught++;
  saveGameState();
  saveStats();

  // Update collection count badge
  var countEl = document.querySelector('.collection-count');
  if (countEl) countEl.textContent = GameState.player.creatures.length + ' Creatures';
}

function removeSpawn(spawnId) {
  // Remove from active creatures
  GameState.activeCreatures = GameState.activeCreatures.filter(function(s) { return s.id !== spawnId; });

  // Remove marker
  if (GameState.creatureMarkers.has(spawnId)) {
    var marker = GameState.creatureMarkers.get(spawnId);
    if (GameState.map) GameState.map.removeLayer(marker);
    GameState.creatureMarkers.delete(spawnId);
  }
}

function updateCreatureCounter() {
  var countEl = document.getElementById('creature-count-num');
  if (countEl) countEl.textContent = GameState.activeCreatures.length;
}

// ============================================================
// COLLECTION SCREEN
// ============================================================

function renderCollection() {
  var grid = document.getElementById('collection-grid');
  if (!grid) return;

  var activeFilter = document.querySelector('.filter-btn.active');
  var filterType = activeFilter ? activeFilter.dataset.type : 'All';

  var creatures = GameState.player.creatures;
  if (filterType !== 'All') {
    creatures = creatures.filter(function(c) { return c.type === filterType; });
  }

  if (creatures.length === 0) {
    grid.innerHTML = '<div class="empty-collection"><div class="empty-icon">🎒</div><h3>Your pack is empty!</h3><p>Explore the map and catch creatures to fill your collection.</p></div>';
    return;
  }

  grid.innerHTML = '';
  creatures.forEach(function(creature) {
    var fullCreature = window.CREATURES.find(function(c) { return c.id === creature.id; });
    if (!fullCreature) return;

    var hpPercent = Math.round((creature.currentHp / creature.maxHp) * 100);
    var hpClass = hpPercent > 50 ? '' : hpPercent > 25 ? 'medium' : 'low';

    var card = document.createElement('div');
    card.className = 'creature-card';
    card.style.setProperty('--creature-color', creature.color + '20');
    card.innerHTML =
      '<div class="creature-card-svg">' + fullCreature.getSvg() + '</div>' +
      '<div class="creature-card-name">' + creature.name + '</div>' +
      '<span class="type-badge ' + creature.type.toLowerCase() + '">' + creature.type + '</span>' +
      '<div class="creature-card-level">Lv. ' + creature.level + ' &bull; <span class="rarity-' + creature.rarity.toLowerCase() + '">' + creature.rarity + '</span></div>' +
      '<div class="creature-card-hp">' +
        '<div class="hp-label"><span>HP</span><span>' + creature.currentHp + '/' + creature.maxHp + '</span></div>' +
        '<div class="hp-bar"><div class="hp-fill ' + hpClass + '" style="width:' + hpPercent + '%"></div></div>' +
      '</div>';

    grid.appendChild(card);
  });

  var countEl = document.querySelector('.collection-count');
  if (countEl) countEl.textContent = GameState.player.creatures.length + ' Creatures';
}

function setupCollectionFilters() {
  var filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderCollection();
    });
  });
}

// ============================================================
// SCREEN MANAGEMENT
// ============================================================

function showScreen(screenName) {
  var screens = document.querySelectorAll('.screen');
  screens.forEach(function(s) {
    s.classList.remove('active');
    s.style.display = 'none';
  });

  var target = document.getElementById('screen-' + screenName);
  if (target) {
    target.classList.add('active');
    target.style.display = 'flex';
  }

  // Screen-specific init
  if (screenName === 'collection') {
    renderCollection();
    setupCollectionFilters();
  } else if (screenName === 'profile') {
    renderProfile();
  } else if (screenName === 'battle') {
    setupBattleScreen();
  } else if (screenName === 'map') {
    updateStatusBar();
    updateCreatureCounter();
    if (GameState.map) {
      setTimeout(function() { GameState.map.invalidateSize(); }, 100);
    }
  }

  // Update bottom nav
  var navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(function(btn) {
    btn.classList.remove('active');
    if (btn.dataset.screen === screenName) {
      btn.classList.add('active');
    }
  });
}

// ============================================================
// BOTTOM NAV
// ============================================================

function setupBottomNav() {
  var navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var screen = btn.dataset.screen;
      if (screen) showScreen(screen);
    });
  });
}

// ============================================================
// STATUS BAR
// ============================================================

function updateStatusBar() {
  var nameEl = document.getElementById('player-name-display');
  if (nameEl) nameEl.textContent = GameState.player.name || 'Trainer';

  var levelEl = document.getElementById('level-display');
  if (levelEl) levelEl.textContent = 'Level ' + GameState.player.level;

  var mapAvatarEl = document.querySelector('.map-avatar');
  if (mapAvatarEl) mapAvatarEl.textContent = (GameState.player.name || 'T').charAt(0).toUpperCase();

  updateOnlineStatus();
}

function updateOnlineStatus() {
  var statusEl = document.getElementById('online-status');
  var indicatorEl = document.querySelector('.online-indicator');

  GameState.isOnline = navigator.onLine && GameState.socket && GameState.socket.connected;

  if (statusEl) statusEl.textContent = GameState.isOnline ? 'Online' : 'Offline';
  if (indicatorEl) {
    if (GameState.isOnline) {
      indicatorEl.classList.remove('offline');
    } else {
      indicatorEl.classList.add('offline');
    }
  }

  var banner = document.getElementById('offline-banner');
  if (banner) {
    if (!navigator.onLine) {
      banner.classList.add('visible');
    } else {
      banner.classList.remove('visible');
    }
  }
}

// ============================================================
// ONLINE/OFFLINE HANDLERS
// ============================================================

function handleOffline() {
  GameState.isOnline = false;
  updateOnlineStatus();
  showToast('You are offline. Local mode active.', 'info');
}

function handleOnline() {
  updateOnlineStatus();
  showToast('Back online!', 'success');
  if (!GameState.socket || !GameState.socket.connected) {
    connectSocket();
  }
}

// ============================================================
// SOCKET.IO
// ============================================================

function connectSocket() {
  if (typeof io === 'undefined') {
    console.warn('[WildBound] Socket.io not loaded');
    return;
  }

  try {
    GameState.socket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    GameState.socket.on('connect', function() {
      GameState.isOnline = true;
      updateOnlineStatus();
      console.log('[WildBound] Connected to server');

      // Join with player data
      GameState.socket.emit('player:join', {
        name: GameState.player.name,
        lat: GameState.player.lat,
        lng: GameState.player.lng,
        level: GameState.player.level,
        creatures: GameState.player.creatures.length
      });
    });

    GameState.socket.on('disconnect', function() {
      GameState.isOnline = false;
      updateOnlineStatus();
      console.log('[WildBound] Disconnected from server');
    });

    setupSocketEvents(GameState.socket);

  } catch(e) {
    console.error('[WildBound] Socket connection failed:', e);
  }
}

function setupSocketEvents(socket) {
  socket.on('player:joined', function(data) {
    GameState.player.id = data.playerId;
    console.log('[WildBound] Joined with ID:', data.playerId);
  });

  socket.on('spawns:update', function(data) {
    if (data.spawns && Array.isArray(data.spawns)) {
      data.spawns.forEach(function(spawn) {
        if (!GameState.activeCreatures.find(function(s) { return s.id === spawn.id; })) {
          GameState.activeCreatures.push(spawn);
          addCreatureMarker(spawn);
        }
      });
      updateCreatureCounter();
    }
  });

  socket.on('spawns:add', function(data) {
    if (data.spawns && Array.isArray(data.spawns)) {
      data.spawns.forEach(function(spawn) {
        if (!GameState.activeCreatures.find(function(s) { return s.id === spawn.id; })) {
          GameState.activeCreatures.push(spawn);
          addCreatureMarker(spawn);
        }
      });
      updateCreatureCounter();
    }
  });

  socket.on('player:nearby', function(data) {
    GameState.nearbyPlayers.push(data);
    addNearbyPlayerMarker(data);
  });

  socket.on('player:move', function(data) {
    updateNearbyPlayerMarker(data);
    var player = GameState.nearbyPlayers.find(function(p) { return p.id === data.id; });
    if (player) {
      player.lat = data.lat;
      player.lng = data.lng;
    }
  });

  socket.on('player:left', function(data) {
    GameState.nearbyPlayers = GameState.nearbyPlayers.filter(function(p) { return p.id !== data.id; });
    removeNearbyPlayerMarker(data.id);
  });

  socket.on('battle:challenged', function(data) {
    showToast(data.challengerName + ' (Lv.' + data.challengerLevel + ') challenged you to a battle!', 'info');
    // Auto-accept for simplicity (could show dialog)
  });

  socket.on('battle:start', function(data) {
    startBattle(data);
  });

  socket.on('battle:matched', function(data) {
    BattleState.opponentId = data.opponentId;
    BattleState.battleId = data.battleId;
    BattleState.isOnline = true;
    BattleState.isMyTurn = data.isFirst;

    showToast('Match found! vs ' + data.opponentName, 'success');

    // Select team and start
    if (GameState.player.creatures.length >= 1) {
      startBattle({
        battleId: data.battleId,
        opponentName: data.opponentName,
        opponentLevel: data.opponentLevel,
        opponentTeam: data.opponentTeam,
        isFirst: data.isFirst
      });
    }
  });

  socket.on('battle:waiting', function(data) {
    var waitingEl = document.querySelector('.waiting-spinner');
    if (waitingEl) {
      waitingEl.classList.add('visible');
      var textEl = waitingEl.querySelector('.waiting-text');
      if (textEl) textEl.textContent = 'Searching... (' + data.queueLength + ' in queue)';
    }
  });

  socket.on('battle:action', function(data) {
    if (BattleState.isOnline && data.fromId === BattleState.opponentId) {
      applyOpponentMove(data.action);
    }
  });
}

function addNearbyPlayerMarker(data) {
  if (!GameState.map || !data.lat || !data.lng) return;

  var playerIcon = L.divIcon({
    html: '<div class="nearby-player-marker">' + (data.name || 'T').charAt(0) + '</div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: ''
  });

  var marker = L.marker([data.lat, data.lng], { icon: playerIcon });
  marker.bindPopup('<b>' + escapeHtml(data.name) + '</b><br>Level ' + data.level);
  marker.addTo(GameState.map);

  GameState.nearbyPlayerMarkers.set(data.id, marker);
}

function updateNearbyPlayerMarker(data) {
  if (GameState.nearbyPlayerMarkers.has(data.id)) {
    GameState.nearbyPlayerMarkers.get(data.id).setLatLng([data.lat, data.lng]);
  }
}

function removeNearbyPlayerMarker(playerId) {
  if (GameState.nearbyPlayerMarkers.has(playerId)) {
    var marker = GameState.nearbyPlayerMarkers.get(playerId);
    if (GameState.map) GameState.map.removeLayer(marker);
    GameState.nearbyPlayerMarkers.delete(playerId);
  }
}

// ============================================================
// XP & LEVELING
// ============================================================

function grantXP(amount) {
  GameState.player.xp += amount;
  var newLevel = getLevelForXP(GameState.player.xp);

  if (newLevel > GameState.player.level) {
    GameState.player.level = newLevel;
    GameState.player.xpToNext = XP_THRESHOLDS[Math.min(newLevel, XP_THRESHOLDS.length - 1)];
    saveGameState();
    showLevelUp(newLevel);
    updateStatusBar();
  }

  saveGameState();
}

function getLevelForXP(xp) {
  var level = 1;
  for (var i = 0; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return Math.min(level, 20);
}

function showLevelUp(level) {
  var notification = document.getElementById('level-up-notification');
  if (!notification) return;

  var levelEl = notification.querySelector('.level-up-level');
  if (levelEl) levelEl.textContent = level;

  notification.classList.add('show');
  showToast('LEVEL UP! You are now Level ' + level + '!', 'success');

  setTimeout(function() {
    notification.classList.remove('show');
  }, 3000);
}

// ============================================================
// PROFILE SCREEN
// ============================================================

function renderProfile() {
  var nameEl = document.getElementById('profile-player-name');
  if (nameEl) nameEl.textContent = GameState.player.name;

  var avatarEl = document.getElementById('profile-avatar');
  if (avatarEl) avatarEl.textContent = (GameState.player.name || 'T').charAt(0).toUpperCase();

  var levelEl = document.getElementById('profile-level');
  if (levelEl) levelEl.textContent = 'Level ' + GameState.player.level;

  var xpEl = document.getElementById('profile-xp-fill');
  var xpLabelEl = document.getElementById('profile-xp-label');
  if (xpEl && xpLabelEl) {
    var currentLevelXP = XP_THRESHOLDS[GameState.player.level - 1] || 0;
    var nextLevelXP = XP_THRESHOLDS[GameState.player.level] || (currentLevelXP + 100);
    var progress = Math.min(100, ((GameState.player.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
    xpEl.style.width = progress + '%';
    xpLabelEl.textContent = GameState.player.xp + ' / ' + nextLevelXP + ' XP';
  }

  // Stats
  var caughtEl = document.getElementById('stat-caught');
  if (caughtEl) caughtEl.textContent = GameState.stats.caught;

  var ballsEl = document.getElementById('stat-balls');
  if (ballsEl) ballsEl.textContent = GameState.player.balls;

  var coinsEl = document.getElementById('stat-coins');
  if (coinsEl) coinsEl.textContent = GameState.player.coins;

  var winsEl = document.getElementById('stat-wins');
  if (winsEl) winsEl.textContent = GameState.stats.battlesWon;

  // Online players
  var list = document.getElementById('online-players-list');
  if (list) {
    if (GameState.nearbyPlayers.length === 0) {
      list.innerHTML = '<div class="no-players-online">No other trainers nearby right now</div>';
    } else {
      list.innerHTML = '';
      GameState.nearbyPlayers.forEach(function(p) {
        var item = document.createElement('div');
        item.className = 'online-player-item';
        item.innerHTML =
          '<div class="online-player-avatar">' + (p.name || 'T').charAt(0) + '</div>' +
          '<div class="online-player-info">' +
            '<div class="online-player-name">' + escapeHtml(p.name) + '</div>' +
            '<div class="online-player-level">Level ' + (p.level || 1) + '</div>' +
          '</div>' +
          '<button class="btn-icon" onclick="challengePlayer(\'' + p.id + '\')">⚔️</button>';
        list.appendChild(item);
      });
    }
  }
}

function challengePlayer(playerId) {
  if (!GameState.isOnline || !GameState.socket) {
    showToast('You need to be online to challenge players!', 'error');
    return;
  }
  GameState.socket.emit('battle:challenge', { targetSocketId: playerId });
  showToast('Challenge sent!', 'info');
}

// ============================================================
// BATTLE SYSTEM
// ============================================================

function setupBattleScreen() {
  var arenaEl = document.getElementById('battle-arena');
  if (arenaEl) arenaEl.classList.remove('active');

  var matchmakingEl = document.getElementById('battle-matchmaking');
  if (matchmakingEl) matchmakingEl.style.display = 'flex';

  var findBtn = document.getElementById('btn-find-match');
  if (findBtn) {
    findBtn.onclick = function() {
      if (!GameState.isOnline || !GameState.socket) {
        showToast('Offline - starting AI battle!', 'info');
        offlineBattle();
        return;
      }
      if (GameState.player.creatures.length === 0) {
        showToast('You need at least 1 creature to battle!', 'error');
        return;
      }
      selectBattleTeam();
    };
  }

  var offlineBtn = document.getElementById('btn-offline-battle');
  if (offlineBtn) {
    offlineBtn.onclick = function() {
      offlineBattle();
    };
  }

  var cancelBtn = document.getElementById('btn-cancel-match');
  if (cancelBtn) {
    cancelBtn.onclick = function() {
      if (GameState.socket) GameState.socket.emit('battle:cancel');
      var waitingEl = document.querySelector('.waiting-spinner');
      if (waitingEl) waitingEl.classList.remove('visible');
      showToast('Matchmaking cancelled', 'info');
    };
  }
}

function selectBattleTeam() {
  var overlay = document.getElementById('team-select-overlay');
  if (!overlay) {
    // Fallback: use first 3 creatures automatically
    startMatchmaking();
    return;
  }

  var grid = overlay.querySelector('.team-select-grid');
  if (grid && GameState.player.creatures.length > 0) {
    grid.innerHTML = '';
    var selected = [];

    GameState.player.creatures.forEach(function(creature, idx) {
      var fullCreature = window.CREATURES.find(function(c) { return c.id === creature.id; });
      if (!fullCreature) return;

      var card = document.createElement('div');
      card.className = 'team-select-card';
      card.innerHTML =
        '<div style="width:44px;height:44px">' + fullCreature.getSvg() + '</div>' +
        '<div class="team-select-info">' +
          '<div class="team-select-name">' + creature.name + '</div>' +
          '<div class="team-select-type">' + creature.type + ' &bull; Lv.' + creature.level + '</div>' +
        '</div>';

      card.addEventListener('click', function() {
        var selIdx = selected.indexOf(idx);
        if (selIdx !== -1) {
          selected.splice(selIdx, 1);
          card.classList.remove('selected');
        } else if (selected.length < 3) {
          selected.push(idx);
          card.classList.add('selected');
        } else {
          showToast('You can only select 3 creatures', 'info');
        }

        var countEl = overlay.querySelector('.selected-count');
        if (countEl) countEl.textContent = selected.length + '/3 selected';
      });

      grid.appendChild(card);
    });
  }

  overlay.classList.add('visible');

  var confirmBtn = overlay.querySelector('#btn-confirm-team');
  if (confirmBtn) {
    confirmBtn.onclick = function() {
      var selectedCreatures = [];
      var checkboxes = overlay.querySelectorAll('.team-select-card.selected');

      // Get selected creature indices
      var allCards = overlay.querySelectorAll('.team-select-card');
      allCards.forEach(function(card, idx) {
        if (card.classList.contains('selected') && idx < GameState.player.creatures.length) {
          selectedCreatures.push(GameState.player.creatures[idx]);
        }
      });

      if (selectedCreatures.length === 0) {
        // Use first up to 3
        selectedCreatures = GameState.player.creatures.slice(0, 3);
      }

      BattleState.myTeam = selectedCreatures.map(function(c) {
        var full = window.CREATURES.find(function(f) { return f.id === c.id; });
        return Object.assign({}, c, { moves: full ? full.moves : [], currentHp: c.maxHp });
      });

      overlay.classList.remove('visible');
      startMatchmaking();
    };
  }

  var cancelBtn = overlay.querySelector('#btn-cancel-team');
  if (cancelBtn) {
    cancelBtn.onclick = function() {
      overlay.classList.remove('visible');
    };
  }
}

function startMatchmaking() {
  if (!GameState.socket) return;

  if (BattleState.myTeam.length === 0) {
    BattleState.myTeam = GameState.player.creatures.slice(0, 3).map(function(c) {
      var full = window.CREATURES.find(function(f) { return f.id === c.id; });
      return Object.assign({}, c, { moves: full ? full.moves : [], currentHp: c.maxHp });
    });
  }

  GameState.socket.emit('battle:findmatch', { team: BattleState.myTeam });
  var waitingEl = document.querySelector('.waiting-spinner');
  if (waitingEl) {
    waitingEl.classList.add('visible');
    var textEl = waitingEl.querySelector('.waiting-text');
    if (textEl) textEl.textContent = 'Searching for opponent...';
  }
}

function offlineBattle() {
  if (GameState.player.creatures.length === 0) {
    showToast('Catch some creatures first!', 'error');
    showScreen('map');
    return;
  }

  BattleState.isAI = true;
  BattleState.isOnline = false;
  BattleState.isMyTurn = true;
  BattleState.phase = 'fighting';

  // My team: first 3 caught creatures
  BattleState.myTeam = GameState.player.creatures.slice(0, 3).map(function(c) {
    var full = window.CREATURES.find(function(f) { return f.id === c.id; });
    return Object.assign({}, c, { moves: full ? full.moves : [], currentHp: c.maxHp });
  });

  // AI team: random creatures
  BattleState.opponentTeam = generateAITeam();
  BattleState.myActiveIndex = 0;
  BattleState.opponentActiveIndex = 0;

  startBattle({
    battleId: 'ai_' + Date.now(),
    opponentName: 'Wild AI',
    isFirst: true
  });
}

function generateAITeam() {
  var team = [];
  var count = Math.min(3, GameState.player.creatures.length || 1);
  var pool = window.CREATURES ? window.CREATURES.slice() : [];

  for (var i = 0; i < count; i++) {
    var creature = pool[Math.floor(Math.random() * pool.length)];
    var entry = {
      id: creature.id,
      name: creature.name,
      type: creature.type,
      level: GameState.player.level,
      currentHp: creature.maxHp,
      maxHp: creature.maxHp,
      attack: creature.attack,
      defense: creature.defense,
      speed: creature.speed,
      moves: creature.moves
    };
    team.push(entry);
  }
  return team;
}

function startBattle(battleData) {
  BattleState.battleId = battleData.battleId;

  if (BattleState.myTeam.length === 0) {
    BattleState.myTeam = GameState.player.creatures.slice(0, 3).map(function(c) {
      var full = window.CREATURES.find(function(f) { return f.id === c.id; });
      return Object.assign({}, c, { moves: full ? full.moves : [], currentHp: c.maxHp });
    });
  }

  if (!BattleState.opponentTeam || BattleState.opponentTeam.length === 0) {
    BattleState.opponentTeam = generateAITeam();
  }

  BattleState.myActiveIndex = 0;
  BattleState.opponentActiveIndex = 0;
  BattleState.phase = 'fighting';

  showScreen('battle');
  renderBattleArena();
}

function renderBattleArena() {
  var matchmakingEl = document.getElementById('battle-matchmaking');
  if (matchmakingEl) matchmakingEl.style.display = 'none';

  var arenaEl = document.getElementById('battle-arena');
  if (!arenaEl) return;
  arenaEl.classList.add('active');

  var waitingEl = document.querySelector('.waiting-spinner');
  if (waitingEl) waitingEl.classList.remove('visible');

  var resultOverlay = document.getElementById('battle-result');
  if (resultOverlay) resultOverlay.classList.remove('visible', 'win', 'lose');

  var myCreature = BattleState.myTeam[BattleState.myActiveIndex];
  var oppCreature = BattleState.opponentTeam[BattleState.opponentActiveIndex];

  if (!myCreature || !oppCreature) return;

  // Opponent area
  var oppNameEl = document.getElementById('battle-opp-name');
  if (oppNameEl) oppNameEl.textContent = oppCreature.name;

  var oppHpFill = document.getElementById('battle-opp-hp-fill');
  var oppHpText = document.getElementById('battle-opp-hp-text');
  var oppHpPct = Math.max(0, Math.round((oppCreature.currentHp / oppCreature.maxHp) * 100));
  if (oppHpFill) {
    oppHpFill.style.width = oppHpPct + '%';
    oppHpFill.className = 'battle-hp-fill ' + (oppHpPct > 50 ? '' : oppHpPct > 25 ? 'medium' : 'low');
  }
  if (oppHpText) oppHpText.textContent = oppCreature.currentHp + '/' + oppCreature.maxHp;

  var oppSvgEl = document.getElementById('battle-opp-svg');
  if (oppSvgEl) {
    var oppFull = window.CREATURES.find(function(c) { return c.id === oppCreature.id; });
    if (oppFull) oppSvgEl.innerHTML = oppFull.getSvg();
  }

  // Player area
  var myNameEl = document.getElementById('battle-my-name');
  if (myNameEl) myNameEl.textContent = myCreature.name;

  var myHpFill = document.getElementById('battle-my-hp-fill');
  var myHpText = document.getElementById('battle-my-hp-text');
  var myHpPct = Math.max(0, Math.round((myCreature.currentHp / myCreature.maxHp) * 100));
  if (myHpFill) {
    myHpFill.style.width = myHpPct + '%';
    myHpFill.className = 'battle-hp-fill ' + (myHpPct > 50 ? '' : myHpPct > 25 ? 'medium' : 'low');
  }
  if (myHpText) myHpText.textContent = myCreature.currentHp + '/' + myCreature.maxHp;

  var mySvgEl = document.getElementById('battle-my-svg');
  if (mySvgEl) {
    var myFull = window.CREATURES.find(function(c) { return c.id === myCreature.id; });
    if (myFull) mySvgEl.innerHTML = myFull.getSvg();
  }

  // Move buttons
  var movesPanel = document.querySelector('.moves-panel');
  if (movesPanel) {
    movesPanel.innerHTML = '';
    var moves = myCreature.moves || [];
    moves.forEach(function(move, idx) {
      var btn = document.createElement('button');
      btn.className = 'move-btn';
      btn.innerHTML =
        '<div class="move-btn-name">' + move.name + '</div>' +
        '<div class="move-btn-power"><span class="type-badge ' + (move.type || '').toLowerCase() + '">' + move.type + '</span> PWR ' + move.power + '</div>';
      btn.disabled = !BattleState.isMyTurn || BattleState.phase !== 'fighting';
      btn.onclick = function() { executeMove(idx); };
      movesPanel.appendChild(btn);
    });
  }

  var logEl = document.getElementById('battle-log');
  if (logEl) {
    logEl.textContent = BattleState.isMyTurn ? 'Your turn! Choose a move.' : 'Opponent\'s turn...';
  }
}

function executeMove(moveIndex) {
  if (!BattleState.isMyTurn || BattleState.phase !== 'fighting') return;

  var myCreature = BattleState.myTeam[BattleState.myActiveIndex];
  var oppCreature = BattleState.opponentTeam[BattleState.opponentActiveIndex];

  if (!myCreature || !oppCreature) return;

  var move = myCreature.moves[moveIndex];
  if (!move) return;

  // Disable buttons
  setMovesEnabled(false);

  var typeEff = window.getTypeEffectiveness ? window.getTypeEffectiveness(move.type, oppCreature.type) : 1.0;
  var damage = Math.max(1, Math.floor((myCreature.attack * move.power / 100) * typeEff / (oppCreature.defense / 50) + 10));

  oppCreature.currentHp = Math.max(0, oppCreature.currentHp - damage);

  var logEl = document.getElementById('battle-log');
  var effText = typeEff > 1 ? ' Super effective!' : typeEff < 1 ? ' Not very effective...' : '';
  if (logEl) logEl.textContent = myCreature.name + ' used ' + move.name + '! (' + damage + ' dmg)' + effText;

  // Shake opponent
  var oppSvgEl = document.getElementById('battle-opp-svg');
  if (oppSvgEl) {
    oppSvgEl.classList.add('shake');
    setTimeout(function() { oppSvgEl.classList.remove('shake'); }, 500);
  }

  // Update opponent HP
  updateBattleHP('opp', oppCreature);

  // Notify online opponent
  if (BattleState.isOnline && GameState.socket && BattleState.opponentId) {
    GameState.socket.emit('battle:action', {
      opponentId: BattleState.opponentId,
      action: { moveIndex: moveIndex, damage: damage }
    });
  }

  setTimeout(function() {
    if (checkBattleEnd()) return;

    // AI turn
    BattleState.isMyTurn = false;
    if (BattleState.isAI) {
      setTimeout(function() { computerAI(); }, 800);
    }
  }, 600);
}

function computerAI() {
  var myCreature = BattleState.myTeam[BattleState.myActiveIndex];
  var oppCreature = BattleState.opponentTeam[BattleState.opponentActiveIndex];

  if (!myCreature || !oppCreature || !oppCreature.moves) return;

  var moveIndex = Math.floor(Math.random() * oppCreature.moves.length);
  var move = oppCreature.moves[moveIndex];

  var typeEff = window.getTypeEffectiveness ? window.getTypeEffectiveness(move.type, myCreature.type) : 1.0;
  var damage = Math.max(1, Math.floor((oppCreature.attack * move.power / 100) * typeEff / (myCreature.defense / 50) + 10));

  myCreature.currentHp = Math.max(0, myCreature.currentHp - damage);

  var logEl = document.getElementById('battle-log');
  var effText = typeEff > 1 ? ' Super effective!' : typeEff < 1 ? ' Not very effective...' : '';
  if (logEl) logEl.textContent = oppCreature.name + ' used ' + move.name + '! (' + damage + ' dmg)' + effText;

  // Shake my creature
  var mySvgEl = document.getElementById('battle-my-svg');
  if (mySvgEl) {
    mySvgEl.classList.add('shake');
    setTimeout(function() { mySvgEl.classList.remove('shake'); }, 500);
  }

  updateBattleHP('my', myCreature);

  setTimeout(function() {
    if (checkBattleEnd()) return;

    BattleState.isMyTurn = true;
    setMovesEnabled(true);

    var logEl2 = document.getElementById('battle-log');
    if (logEl2) logEl2.textContent = 'Your turn! Choose a move.';
  }, 600);
}

function applyOpponentMove(action) {
  var myCreature = BattleState.myTeam[BattleState.myActiveIndex];
  if (!myCreature) return;

  myCreature.currentHp = Math.max(0, myCreature.currentHp - action.damage);
  updateBattleHP('my', myCreature);

  var mySvgEl = document.getElementById('battle-my-svg');
  if (mySvgEl) {
    mySvgEl.classList.add('shake');
    setTimeout(function() { mySvgEl.classList.remove('shake'); }, 500);
  }

  setTimeout(function() {
    if (checkBattleEnd()) return;
    BattleState.isMyTurn = true;
    setMovesEnabled(true);
    var logEl = document.getElementById('battle-log');
    if (logEl) logEl.textContent = 'Your turn! Choose a move.';
  }, 600);
}

function updateBattleHP(who, creature) {
  var prefix = who === 'opp' ? 'opp' : 'my';
  var fillEl = document.getElementById('battle-' + prefix + '-hp-fill');
  var textEl = document.getElementById('battle-' + prefix + '-hp-text');

  var pct = Math.max(0, Math.round((creature.currentHp / creature.maxHp) * 100));
  if (fillEl) {
    fillEl.style.width = pct + '%';
    fillEl.className = 'battle-hp-fill ' + (pct > 50 ? '' : pct > 25 ? 'medium' : 'low');
  }
  if (textEl) textEl.textContent = creature.currentHp + '/' + creature.maxHp;
}

function checkBattleEnd() {
  var myCreature = BattleState.myTeam[BattleState.myActiveIndex];
  var oppCreature = BattleState.opponentTeam[BattleState.opponentActiveIndex];

  if (myCreature && myCreature.currentHp <= 0) {
    BattleState.myActiveIndex++;
    if (BattleState.myActiveIndex >= BattleState.myTeam.length) {
      endBattle(false);
      return true;
    } else {
      var logEl = document.getElementById('battle-log');
      if (logEl) logEl.textContent = myCreature.name + ' fainted! Next creature sent out!';
      setTimeout(renderBattleArena, 1000);
      return false;
    }
  }

  if (oppCreature && oppCreature.currentHp <= 0) {
    BattleState.opponentActiveIndex++;
    if (BattleState.opponentActiveIndex >= BattleState.opponentTeam.length) {
      endBattle(true);
      return true;
    } else {
      var logEl2 = document.getElementById('battle-log');
      if (logEl2) logEl2.textContent = oppCreature.name + ' fainted! Opponent sends next creature!';
      setTimeout(renderBattleArena, 1000);
      return false;
    }
  }

  return false;
}

function endBattle(won) {
  BattleState.phase = 'result';

  var overlay = document.getElementById('battle-result');
  if (!overlay) return;

  overlay.classList.add('visible');
  overlay.classList.add(won ? 'win' : 'lose');

  var titleEl = overlay.querySelector('.battle-result-title');
  if (titleEl) titleEl.textContent = won ? '🏆 Victory!' : '💀 Defeated!';

  var rewardsEl = overlay.querySelector('.battle-result-rewards');

  if (won) {
    var xpGain = 80 + Math.floor(Math.random() * 40);
    var coinGain = 50 + Math.floor(Math.random() * 50);
    GameState.player.coins += coinGain;
    grantXP(xpGain);
    GameState.stats.battlesWon++;
    GameState.stats.battlesPlayed++;
    saveStats();
    if (rewardsEl) rewardsEl.textContent = '+' + xpGain + ' XP | +' + coinGain + ' Coins';
    showToast('Battle won! +' + xpGain + ' XP', 'success');
  } else {
    GameState.stats.battlesPlayed++;
    saveStats();
    if (rewardsEl) rewardsEl.textContent = 'Better luck next time!';
  }

  var continueBtn = overlay.querySelector('#btn-battle-continue');
  if (continueBtn) {
    continueBtn.onclick = function() {
      overlay.classList.remove('visible', 'win', 'lose');
      var arenaEl = document.getElementById('battle-arena');
      if (arenaEl) arenaEl.classList.remove('active');
      var matchEl = document.getElementById('battle-matchmaking');
      if (matchEl) matchEl.style.display = 'flex';
      BattleState.phase = 'select';
      BattleState.myTeam = [];
      BattleState.opponentTeam = [];
    };
  }
}

function setMovesEnabled(enabled) {
  var moveBtns = document.querySelectorAll('.move-btn');
  moveBtns.forEach(function(btn) { btn.disabled = !enabled; });
}

// ============================================================
// SAVE / LOAD
// ============================================================

function saveGameState() {
  try {
    localStorage.setItem('wildbound_player', JSON.stringify(GameState.player));
  } catch(e) {
    console.warn('[WildBound] Could not save state:', e);
  }
}

function loadGameState() {
  try {
    var data = localStorage.getItem('wildbound_player');
    if (data) return JSON.parse(data);
  } catch(e) {
    console.warn('[WildBound] Could not load state:', e);
  }
  return null;
}

function saveStats() {
  try {
    localStorage.setItem('wildbound_stats', JSON.stringify(GameState.stats));
  } catch(e) {}
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type) {
  var container = document.getElementById('toast-container');
  if (!container) return;

  var toast = document.createElement('div');
  toast.className = 'toast ' + (type || 'info');
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(function() {
    toast.classList.add('fade-out');
    setTimeout(function() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3000);
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getDistance(lat1, lng1, lat2, lng2) {
  var R = 6371000; // Earth radius in meters
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLng/2) * Math.sin(dLng/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function escapeHtml(str) {
  var d = document.createElement('div');
  d.appendChild(document.createTextNode(str || ''));
  return d.innerHTML;
}

// ============================================================
// START
// ============================================================

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
