import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import io from 'socket.io-client';
import { SOCKET_URL, MAP_REFRESH_INTERVAL, LOCATION_UPDATE_INTERVAL } from '../constants/config';
import { savePlayer, loadPlayer, saveCollection, loadCollection, flushOfflineQueue } from '../services/storage';
import { fetchNearbyCreatures, syncOfflineQueue } from '../services/api';
import * as Location from 'expo-location';

const GameContext = createContext(null);

const initialState = {
  player: null,
  collection: [],
  mapCreatures: [],
  location: null,
  isOnline: false,
  onlinePlayerCount: 0,
  pendingBattle: null,
  activeBattle: null,
  loading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...state, player: action.player, collection: action.collection, loading: false };
    case 'SET_PLAYER':
      return { ...state, player: action.player };
    case 'SET_LOCATION':
      return { ...state, location: action.location };
    case 'SET_MAP_CREATURES':
      return { ...state, mapCreatures: action.creatures };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.online };
    case 'SET_ONLINE_COUNT':
      return { ...state, onlinePlayerCount: action.count };
    case 'ADD_TO_COLLECTION': {
      const collection = [...state.collection, action.caught];
      return { ...state, collection, player: action.player || state.player };
    }
    case 'REMOVE_FROM_MAP':
      return { ...state, mapCreatures: state.mapCreatures.filter(c => c.id !== action.id) };
    case 'SET_PENDING_BATTLE':
      return { ...state, pendingBattle: action.battle };
    case 'SET_ACTIVE_BATTLE':
      return { ...state, activeBattle: action.battle, pendingBattle: null };
    case 'CLEAR_BATTLE':
      return { ...state, activeBattle: null, pendingBattle: null };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef(null);
  const locationSubRef = useRef(null);
  const mapRefreshRef = useRef(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const connectSocket = useCallback((player) => {
    if (socketRef.current?.connected) return;
    const socket = io(SOCKET_URL, { transports: ['websocket'], timeout: 5000 });
    socketRef.current = socket;

    socket.on('connect', () => {
      dispatch({ type: 'SET_ONLINE', online: true });
      socket.emit('player:join', { playerId: player.id, username: player.username });
      flushOfflineQueue().then(queue => {
        if (queue.length > 0) syncOfflineQueue(queue);
      });
    });

    socket.on('disconnect', () => dispatch({ type: 'SET_ONLINE', online: false }));
    socket.on('connect_error', () => dispatch({ type: 'SET_ONLINE', online: false }));
    socket.on('world:players', d => dispatch({ type: 'SET_ONLINE_COUNT', count: d.count }));
    socket.on('battle:challenged', battle => dispatch({ type: 'SET_PENDING_BATTLE', battle }));
    socket.on('battle:started', battle => dispatch({ type: 'SET_ACTIVE_BATTLE', battle }));
    socket.on('battle:ended', () => dispatch({ type: 'CLEAR_BATTLE' }));
    socket.on('battle:declined', () => dispatch({ type: 'SET_PENDING_BATTLE', battle: null }));
  }, []);

  const startLocationTracking = useCallback(async (player) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    locationSubRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: LOCATION_UPDATE_INTERVAL, distanceInterval: 10 },
      loc => {
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        dispatch({ type: 'SET_LOCATION', location: coords });
        if (socketRef.current?.connected) {
          socketRef.current.emit('player:location', { lat: coords.latitude, lng: coords.longitude });
        }
      }
    );

    const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const coords = { latitude: current.coords.latitude, longitude: current.coords.longitude };
    dispatch({ type: 'SET_LOCATION', location: coords });
    refreshMapCreatures(coords, player);
  }, []);

  const refreshMapCreatures = useCallback(async (coords, player) => {
    const loc = coords || stateRef.current.location;
    if (!loc) return;
    try {
      const isOnline = stateRef.current.isOnline;
      const { creatures } = await fetchNearbyCreatures(loc.latitude, loc.longitude, isOnline);
      dispatch({ type: 'SET_MAP_CREATURES', creatures });
    } catch (e) {
      // keep existing
    }
  }, []);

  async function initGame(player) {
    const collection = await loadCollection();
    dispatch({ type: 'INIT', player, collection });
    connectSocket(player);
    startLocationTracking(player);

    mapRefreshRef.current = setInterval(() => {
      refreshMapCreatures(null, player);
    }, MAP_REFRESH_INTERVAL);
  }

  useEffect(() => {
    loadPlayer().then(p => {
      if (p) initGame(p);
      else dispatch({ type: 'INIT', player: null, collection: [] });
    });

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && stateRef.current.player) {
        refreshMapCreatures(null, stateRef.current.player);
        if (!socketRef.current?.connected) connectSocket(stateRef.current.player);
      }
    });

    return () => {
      sub.remove();
      locationSubRef.current?.remove();
      socketRef.current?.disconnect();
      clearInterval(mapRefreshRef.current);
    };
  }, []);

  const login = useCallback(async (player) => {
    await savePlayer(player);
    const existingCollection = await loadCollection();
    dispatch({ type: 'INIT', player, collection: existingCollection });
    connectSocket(player);
    startLocationTracking(player);
    mapRefreshRef.current = setInterval(() => refreshMapCreatures(null, player), MAP_REFRESH_INTERVAL);
  }, [connectSocket, startLocationTracking, refreshMapCreatures]);

  const logout = useCallback(() => {
    socketRef.current?.disconnect();
    locationSubRef.current?.remove();
    clearInterval(mapRefreshRef.current);
    dispatch({ type: 'INIT', player: null, collection: [] });
  }, []);

  const addCaught = useCallback(async (caught, updatedPlayer) => {
    const newCollection = [...stateRef.current.collection, caught];
    await saveCollection(newCollection);
    if (updatedPlayer) await savePlayer(updatedPlayer);
    dispatch({ type: 'ADD_TO_COLLECTION', caught, player: updatedPlayer });
    dispatch({ type: 'REMOVE_FROM_MAP', id: caught.spawnId || caught.id });
  }, []);

  const removeFromMap = useCallback((id) => {
    dispatch({ type: 'REMOVE_FROM_MAP', id });
  }, []);

  const sendBattleChallenge = useCallback((targetId, mon) => {
    socketRef.current?.emit('battle:challenge', {
      challengerId: stateRef.current.player.id,
      challengerName: stateRef.current.player.username,
      targetId,
      mon,
    });
  }, []);

  const acceptBattle = useCallback((battleId, mon) => {
    socketRef.current?.emit('battle:accept', {
      battleId,
      username: stateRef.current.player?.username,
      mon,
    });
  }, []);

  const sendBattleMove = useCallback((battleId, move) => {
    socketRef.current?.emit('battle:move', {
      battleId,
      playerId: stateRef.current.player?.id,
      move,
    });
  }, []);

  const endBattle = useCallback((battleId, winnerId) => {
    socketRef.current?.emit('battle:end', { battleId, winnerId });
    dispatch({ type: 'CLEAR_BATTLE' });
  }, []);

  const value = {
    ...state,
    login,
    logout,
    addCaught,
    removeFromMap,
    refreshMapCreatures,
    sendBattleChallenge,
    acceptBattle,
    sendBattleMove,
    endBattle,
    socket: socketRef.current,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
}
