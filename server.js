const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(express.json());

// In-memory stores (production: replace with PostgreSQL/MongoDB)
const players = new Map();
const activeBattles = new Map();

const CREATURE_POOL = [
  'flambit', 'aquora', 'terrox', 'zephlyn', 'voltix', 'frostara',
  'thornix', 'luminos', 'shadowmeld', 'crystalix', 'stormclaw', 'emberhound'
];

const RARITY_WEIGHTS = {
  common: 50,
  uncommon: 30,
  rare: 15,
  legendary: 5
};

const CREATURE_RARITIES = {
  flambit: 'common', aquora: 'common', terrox: 'common',
  zephlyn: 'uncommon', voltix: 'uncommon', frostara: 'uncommon',
  thornix: 'uncommon', luminos: 'rare', shadowmeld: 'rare',
  crystalix: 'rare', stormclaw: 'legendary', emberhound: 'legendary'
};

function weightedRandom() {
  const r = Math.random() * 100;
  if (r < 5) return 'legendary';
  if (r < 20) return 'rare';
  if (r < 50) return 'uncommon';
  return 'common';
}

function spawnCreaturesNear(lat, lng, count = 5) {
  const targetRarity = weightedRandom();
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const dist = (0.002 + Math.random() * 0.008);
    const pool = CREATURE_POOL.filter(c =>
      Math.random() > 0.6 ? CREATURE_RARITIES[c] === targetRarity : true
    );
    const type = pool[Math.floor(Math.random() * pool.length)];
    return {
      id: uuidv4(),
      type,
      rarity: CREATURE_RARITIES[type],
      level: Math.floor(Math.random() * 15) + 1,
      lat: lat + Math.cos(angle) * dist,
      lng: lng + Math.sin(angle) * dist,
      spawnedAt: Date.now(),
      expiresAt: Date.now() + 8 * 60 * 1000
    };
  });
}

// ─── REST API ────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ status: 'ok', game: 'WildBound', version: '1.0.0' }));

app.post('/api/player/register', (req, res) => {
  const { username } = req.body;
  if (!username || username.trim().length < 2) {
    return res.status(400).json({ error: 'Username must be at least 2 characters' });
  }

  const existing = [...players.values()].find(
    p => p.username.toLowerCase() === username.toLowerCase()
  );
  if (existing) return res.json({ player: existing, isNew: false });

  const player = {
    id: uuidv4(),
    username: username.trim(),
    level: 1,
    xp: 0,
    xpToNext: 100,
    collection: [],
    catchCount: 0,
    battleWins: 0,
    battleLosses: 0,
    totalDamageDealt: 0,
    createdAt: Date.now(),
    lastSeen: Date.now()
  };
  players.set(player.id, player);
  res.json({ player, isNew: true });
});

app.get('/api/player/:id', (req, res) => {
  const player = players.get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });
  player.lastSeen = Date.now();
  res.json({ player });
});

app.post('/api/player/:id/catch', (req, res) => {
  const { creature } = req.body;
  const player = players.get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const caught = { ...creature, caughtAt: Date.now(), nickname: null };
  player.collection.push(caught);
  player.catchCount += 1;

  const xpGain = creature.level * 12 + { common: 10, uncommon: 25, rare: 60, legendary: 150 }[creature.rarity || 'common'];
  player.xp += xpGain;
  player.xpToNext = (player.level + 1) * 100;
  if (player.xp >= player.xpToNext) {
    player.level += 1;
    player.xp = player.xp - player.xpToNext;
    player.xpToNext = (player.level + 1) * 100;
  }

  res.json({ player, xpGain });
});

app.post('/api/player/:id/rename', (req, res) => {
  const { collectionId, nickname } = req.body;
  const player = players.get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });
  const mon = player.collection.find(c => c.id === collectionId);
  if (!mon) return res.status(404).json({ error: 'WildMon not found' });
  mon.nickname = nickname || null;
  res.json({ player });
});

app.get('/api/creatures/nearby', (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
  const creatures = spawnCreaturesNear(parseFloat(lat), parseFloat(lng), 5 + Math.floor(Math.random() * 4));
  res.json({ creatures });
});

app.get('/api/leaderboard', (_req, res) => {
  const board = [...players.values()]
    .sort((a, b) => b.level - a.level || b.catchCount - a.catchCount)
    .slice(0, 20)
    .map(p => ({
      username: p.username,
      level: p.level,
      catchCount: p.catchCount,
      battleWins: p.battleWins
    }));
  res.json({ leaderboard: board });
});

// ─── SOCKET.IO ───────────────────────────────────────────────────────────────

io.on('connection', socket => {
  console.log(`[WildBound] Player connected: ${socket.id}`);

  socket.on('player:join', data => {
    socket.playerId = data.playerId;
    socket.username = data.username;
    socket.join('world');
    socket.broadcast.to('world').emit('player:joined', {
      playerId: data.playerId,
      username: data.username
    });
    const onlineCount = io.sockets.adapter.rooms.get('world')?.size || 1;
    io.to('world').emit('world:players', { count: onlineCount });
  });

  socket.on('player:location', data => {
    socket.broadcast.to('world').emit('player:location', {
      playerId: socket.playerId,
      username: socket.username,
      lat: data.lat,
      lng: data.lng
    });
  });

  // ── Battle Flow ──────────────────────────────────────────────────────────
  socket.on('battle:challenge', data => {
    const battleId = uuidv4();
    activeBattles.set(battleId, {
      id: battleId,
      challenger: { id: data.challengerId, username: data.challengerName, mon: data.mon },
      target: { id: data.targetId },
      moves: {},
      turn: 1,
      status: 'pending'
    });
    io.to('world').emit('battle:challenged', {
      battleId,
      challengerId: data.challengerId,
      challengerName: data.challengerName,
      targetId: data.targetId,
      mon: data.mon
    });
  });

  socket.on('battle:accept', data => {
    const battle = activeBattles.get(data.battleId);
    if (!battle) return;
    battle.target.mon = data.mon;
    battle.target.username = data.username;
    battle.status = 'active';
    io.to('world').emit('battle:started', battle);
  });

  socket.on('battle:decline', data => {
    io.to('world').emit('battle:declined', { battleId: data.battleId });
    activeBattles.delete(data.battleId);
  });

  socket.on('battle:move', data => {
    const battle = activeBattles.get(data.battleId);
    if (!battle || battle.status !== 'active') return;
    battle.moves[data.playerId] = data.move;

    const [id1, id2] = [battle.challenger.id, battle.target.id];
    if (battle.moves[id1] && battle.moves[id2]) {
      io.to('world').emit('battle:turn', {
        battleId: data.battleId,
        moves: battle.moves,
        turn: battle.turn
      });
      battle.moves = {};
      battle.turn += 1;
    }
  });

  socket.on('battle:end', data => {
    const battle = activeBattles.get(data.battleId);
    if (!battle) return;
    io.to('world').emit('battle:ended', {
      battleId: data.battleId,
      winnerId: data.winnerId
    });
    activeBattles.delete(data.battleId);

    if (data.winnerId) {
      const winner = players.get(data.winnerId);
      if (winner) {
        winner.battleWins += 1;
        winner.xp += 50;
      }
      const [loserId] = [battle.challenger.id, battle.target.id].filter(id => id !== data.winnerId);
      const loser = players.get(loserId);
      if (loser) loser.battleLosses += 1;
    }
  });

  socket.on('disconnect', () => {
    socket.broadcast.to('world').emit('player:left', { playerId: socket.playerId });
    const count = (io.sockets.adapter.rooms.get('world')?.size || 1) - 1;
    io.to('world').emit('world:players', { count: Math.max(0, count) });
    console.log(`[WildBound] Player disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🌿 WildBound Server live on port ${PORT}\n`);
});
