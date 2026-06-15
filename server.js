const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Connected players Map: socketId -> playerData
const players = new Map();

// Battle waiting queue
const battleQueue = [];

// Generate spawns around a lat/lng within ~300m radius
function generateSpawns(lat, lng, count) {
  const spawns = [];
  const creatureIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  for (let i = 0; i < count; i++) {
    // ~300m radius: 0.003 degrees ~ 333m
    const angle = Math.random() * 2 * Math.PI;
    const distance = 0.001 + Math.random() * 0.002; // 0.001 to 0.003 degrees
    const spawnLat = lat + distance * Math.cos(angle);
    const spawnLng = lng + distance * Math.sin(angle);

    const creatureId = creatureIds[Math.floor(Math.random() * creatureIds.length)];
    const now = Date.now();

    spawns.push({
      id: uuidv4(),
      creatureId,
      lat: spawnLat,
      lng: spawnLng,
      spawnedAt: now,
      expires: now + 15 * 60 * 1000 // 15 minutes
    });
  }

  return spawns;
}

// API endpoint: leaderboard
app.get('/api/leaderboard', (req, res) => {
  const leaderboard = [];
  players.forEach((player, socketId) => {
    leaderboard.push({
      name: player.name,
      level: player.level || 1,
      creatures: player.creatures ? player.creatures.length : 0,
      socketId
    });
  });

  leaderboard.sort((a, b) => b.level - a.level || b.creatures - a.creatures);
  res.json({ leaderboard: leaderboard.slice(0, 20) });
});

// API endpoint: online count
app.get('/api/online-count', (req, res) => {
  res.json({ count: players.size });
});

// Root health check
app.get('/', (req, res, next) => {
  // Let express.static handle it if the file exists
  next();
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[WildBound] Player connected: ${socket.id}`);

  // Player joins the game
  socket.on('player:join', (data) => {
    const { name, lat, lng, level, creatures } = data;

    const playerData = {
      id: socket.id,
      name: name || 'Trainer',
      lat: lat || 40.7128,
      lng: lng || -74.0060,
      level: level || 1,
      creatures: creatures || [],
      joinedAt: Date.now()
    };

    players.set(socket.id, playerData);

    // Generate 6 random spawns around their location
    const spawns = generateSpawns(playerData.lat, playerData.lng, 6);

    // Respond to the joining player
    socket.emit('player:joined', {
      playerId: socket.id,
      playerCount: players.size
    });

    socket.emit('spawns:update', { spawns });

    // Notify others of new player
    socket.broadcast.emit('player:nearby', {
      id: socket.id,
      name: playerData.name,
      level: playerData.level,
      lat: playerData.lat,
      lng: playerData.lng
    });

    console.log(`[WildBound] ${playerData.name} joined. Total players: ${players.size}`);
  });

  // Player moves
  socket.on('player:location', (data) => {
    const { lat, lng } = data;
    const player = players.get(socket.id);
    if (!player) return;

    player.lat = lat;
    player.lng = lng;
    players.set(socket.id, player);

    // Broadcast move to others
    socket.broadcast.emit('player:move', {
      id: socket.id,
      lat,
      lng
    });

    // 30% chance to emit additional spawns to this player
    if (Math.random() < 0.3) {
      const additionalSpawns = generateSpawns(lat, lng, 2);
      socket.emit('spawns:add', { spawns: additionalSpawns });
    }
  });

  // Battle challenge
  socket.on('battle:challenge', (data) => {
    const { targetSocketId } = data;
    const challenger = players.get(socket.id);
    if (!challenger) return;

    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (!targetSocket) {
      socket.emit('battle:error', { message: 'Player not available' });
      return;
    }

    targetSocket.emit('battle:challenged', {
      challengerId: socket.id,
      challengerName: challenger.name,
      challengerLevel: challenger.level
    });
  });

  // Battle accept
  socket.on('battle:accept', (data) => {
    const { challengerId } = data;
    const battleId = uuidv4();
    const accepter = players.get(socket.id);
    const challenger = players.get(challengerId);

    if (!accepter || !challenger) return;

    const challengerSocket = io.sockets.sockets.get(challengerId);
    if (!challengerSocket) return;

    const battleData = {
      battleId,
      player1: { id: challengerId, name: challenger.name, level: challenger.level },
      player2: { id: socket.id, name: accepter.name, level: accepter.level }
    };

    // Notify both players
    socket.emit('battle:start', battleData);
    challengerSocket.emit('battle:start', battleData);

    console.log(`[WildBound] Battle started: ${battleId} between ${challenger.name} and ${accepter.name}`);
  });

  // Battle action relay
  socket.on('battle:action', (data) => {
    const { opponentId, action } = data;
    const opponentSocket = io.sockets.sockets.get(opponentId);
    if (opponentSocket) {
      opponentSocket.emit('battle:action', {
        fromId: socket.id,
        action
      });
    }
  });

  // Find online battle match
  socket.on('battle:findmatch', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    // Check if already in queue
    const alreadyInQueue = battleQueue.find(p => p.id === socket.id);
    if (alreadyInQueue) return;

    battleQueue.push({
      id: socket.id,
      name: player.name,
      level: player.level,
      team: data.team || []
    });

    socket.emit('battle:waiting', { queueLength: battleQueue.length });

    // If 2+ players waiting, pair them
    if (battleQueue.length >= 2) {
      const player1 = battleQueue.shift();
      const player2 = battleQueue.shift();

      const battleId = uuidv4();
      const socket1 = io.sockets.sockets.get(player1.id);
      const socket2 = io.sockets.sockets.get(player2.id);

      const matchData = {
        battleId,
        opponent: null
      };

      if (socket1) {
        socket1.emit('battle:matched', {
          battleId,
          opponentId: player2.id,
          opponentName: player2.name,
          opponentLevel: player2.level,
          opponentTeam: player2.team,
          isFirst: true
        });
      }

      if (socket2) {
        socket2.emit('battle:matched', {
          battleId,
          opponentId: player1.id,
          opponentName: player1.name,
          opponentLevel: player1.level,
          opponentTeam: player1.team,
          isFirst: false
        });
      }

      console.log(`[WildBound] Battle matched: ${player1.name} vs ${player2.name}`);
    }
  });

  // Cancel battle search
  socket.on('battle:cancel', () => {
    const idx = battleQueue.findIndex(p => p.id === socket.id);
    if (idx !== -1) {
      battleQueue.splice(idx, 1);
    }
  });

  // Player disconnects
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player) {
      console.log(`[WildBound] ${player.name} disconnected. Total players: ${players.size - 1}`);
    }

    players.delete(socket.id);

    // Remove from battle queue
    const queueIdx = battleQueue.findIndex(p => p.id === socket.id);
    if (queueIdx !== -1) {
      battleQueue.splice(queueIdx, 1);
    }

    // Notify others
    socket.broadcast.emit('player:left', { id: socket.id });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   🌐 WildBound Server Running!       ║
║   Port: ${PORT}                         ║
║   Open World Creature Hunting Game   ║
╚══════════════════════════════════════╝
  `);
});
