import { SERVER_URL, OFFLINE_SPAWN_RADIUS, OFFLINE_CREATURE_COUNT } from '../constants/config';
import { addToOfflineQueue } from './storage';

const CREATURE_POOL = [
  'flambit','aquora','terrox','zephlyn','voltix','frostara',
  'thornix','luminos','shadowmeld','crystalix','stormclaw','emberhound'
];
const RARITIES = {
  flambit:'common', aquora:'common', terrox:'common',
  zephlyn:'uncommon', voltix:'uncommon', frostara:'uncommon', thornix:'uncommon',
  luminos:'rare', shadowmeld:'rare', crystalix:'rare',
  stormclaw:'legendary', emberhound:'legendary',
};

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function spawnOfflineCreatures(lat, lng) {
  const seed = Math.floor((lat * 1000 + lng * 1000 + Date.now() / 90000) * 997);
  const rng = seededRandom(seed);
  return Array.from({ length: OFFLINE_CREATURE_COUNT }, (_, i) => {
    const angle = rng() * Math.PI * 2;
    const dist  = OFFLINE_SPAWN_RADIUS * (0.2 + rng() * 0.8);
    const idx   = Math.floor(rng() * CREATURE_POOL.length);
    const type  = CREATURE_POOL[idx];
    return {
      id:       `offline_${seed}_${i}`,
      type,
      rarity:   RARITIES[type],
      level:    Math.floor(rng() * 12) + 1,
      lat:      lat + Math.cos(angle) * dist,
      lng:      lng + Math.sin(angle) * dist,
      offline:  true,
    };
  });
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${SERVER_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function registerPlayer(username) {
  return apiFetch('/api/player/register', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export async function fetchPlayer(id) {
  return apiFetch(`/api/player/${id}`);
}

export async function catchCreature(playerId, creature, isOnline) {
  if (!isOnline) {
    await addToOfflineQueue({ type: 'CATCH', playerId, creature });
    return { offline: true };
  }
  return apiFetch(`/api/player/${playerId}/catch`, {
    method: 'POST',
    body: JSON.stringify({ creature }),
  });
}

export async function fetchNearbyCreatures(lat, lng, isOnline) {
  if (!isOnline) return { creatures: spawnOfflineCreatures(lat, lng), offline: true };
  return apiFetch(`/api/creatures/nearby?lat=${lat}&lng=${lng}`);
}

export async function fetchLeaderboard() {
  return apiFetch('/api/leaderboard');
}

export async function syncOfflineQueue(queue) {
  const results = [];
  for (const action of queue) {
    try {
      if (action.type === 'CATCH') {
        const r = await apiFetch(`/api/player/${action.playerId}/catch`, {
          method: 'POST',
          body: JSON.stringify({ creature: action.creature }),
        });
        results.push({ ok: true, action, result: r });
      }
    } catch (e) {
      results.push({ ok: false, action, error: e.message });
    }
  }
  return results;
}
